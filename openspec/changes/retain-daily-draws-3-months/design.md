## Context

塔羅與盧恩共用 `DailyDrawEngine`。原本每筆紀錄帶 `expiresAt`（`retentionMonths` 為 3），由 `dataExpiry.service` 的 `EXPIRING_GROUPS` 每日清除。commit `0bc7f8c`（新增後台）為了讓後台保有歷史統計，移除了這些：引擎不再寫 `expiresAt`、`EXPIRING_GROUPS` 拿掉 `tarotDraws`／`runeDraws`、索引豁免拿掉，`data-retention`、`daily-tarot`、`daily-rune` spec 改為「永久、不帶 `expiresAt`」。因此：

- 0bc7f8c 之前建立的紀錄仍帶 `expiresAt`（schema 註明「讀取時忽略」）；
- 0bc7f8c 之後建立的紀錄沒有 `expiresAt`；
- 現在清除作業完全不碰這兩個集合。

這個 change 是把這個決定反過來。這是刪除資料的變更，所以重點在順序與可回復性。

## Goals / Non-Goals

**Goals:**
- 新建立的塔羅與盧恩紀錄一律帶 `expiresAt = drawnAt + 3 個月`，並由每日到期作業清除。
- 既有紀錄以一次性腳本回補 `expiresAt`；回補前能 dry-run，看見將被刪除的筆數。
- 把 spec 與程式回到一致，三種每日抽取（含卦象）規則相同。

**Non-Goals:**
- 不改抽取規則、API、內容與前端。
- 不為後台另存長期彙總（見 Risks）。
- 不改付款紀錄的永久保存。
- 不自動執行回補，也不由我對正式 Firestore 執行回補或備份。

## Decisions

1. **寫入端：還原引擎的 `expiresAt` 與 `retentionMonths`。**
   `DailyDrawRecord` 加回 `expiresAt`，`DailyDrawConfig` 加回 `retentionMonths`，第一次抽取時寫入 `addMonths(now, retentionMonths)`（沿用 `shared/utils/time.ts` 的 `addMonths`，已存在）。塔羅與盧恩各設 `retentionMonths: 3`；`toDocument` 寫入 `expiresAt`。訪客的暫時紀錄 `expiresAt = now`（不寫入，只為型別一致）。
   - 替代方案：不寫入、改成清除時以 `drawnAt` 算期限。需要 `drawnAt` 的 collection group 範圍查詢，且現有單欄位索引已用在後台統計；其他到期資料皆用 `expiresAt`，故沿用 `expiresAt` 以維持一致。

2. **清除端：把兩個集合加回 `EXPIRING_GROUPS`。**
   結果型別與 `/api/cron/data-expiry` 的回應 schema 加回 `deletedTarotDraws`、`deletedRuneDraws`。`expiresAt` 的 collection group 查詢需索引豁免：`scripts/provision-firebase.ts` 的 `EXPIRY_QUERY_GROUPS` 加回兩者，`firestore.indexes.json` 補對應的 `fieldOverrides`，`docs/firebase-setup.md` 同步。

3. **回補既有紀錄：一次性腳本，不隨部署執行。**
   `scripts/backfill-draw-expiry.ts`：以 collection group 掃描 `tarotDraws` 與 `runeDraws`，對缺少 `expiresAt` 的文件寫入 `addMonths(drawnAt, 3)`；已帶 `expiresAt` 的不動；冪等，可重跑；`--dry-run` 只列出「將回補幾筆、其中幾筆已超過 3 個月（下次排程會被刪除）」，不寫入。分批寫入並回報失敗，不吞錯誤。

4. **上線順序（避免意外刪除）。**
   1. 合併並部署程式碼（引擎寫入、清除步驟、索引）。此時既有紀錄沒有 `expiresAt`，清除作業查不到它們，**不會刪除任何既有資料**。
   2. 建立索引豁免（`pnpm firebase:provision`）。
   3. 使用者先備份 Firestore（匯出 `tarotDraws` 與 `runeDraws`），再執行 `backfill-draw-expiry.ts --dry-run` 確認筆數。
   4. 確認後執行回補（不加 `--dry-run`）。回補完成後，下一次排程會刪除超過 3 個月的紀錄，**不可復原**。
   - 為什麼先部署程式碼再回補：反過來會讓回補後、程式碼尚未部署時沒有任何東西會清除，且新寫入的紀錄仍無 `expiresAt`，兩邊會出現不一致。

5. **Schema：新紀錄必填、讀取容忍缺少。**
   `expiresAt` 在 Firestore 文件 schema 維持可選（回補完成前讀取舊文件不能失敗），但寫入端一律帶；回補完成後若要收緊為必填，另案處理，不在本 change。

6. **後台：不改查詢，只更新語意。**
   每日使用數維持近 30 天，3 個月內都讀得到；`earliestDrawAt` 之後只反映 3 個月內最早的一筆，若畫面有「資料起始日」類文案要改成不暗示永久。

7. **與 `add-hexagram-divination` 的 spec 重疊。**
   兩個 change 都 MODIFIED `data-retention` 的「各類資料保存期限」與「排程清除到期資料」。本 change 與卦象 change 的 delta 內容相同（塔羅、盧恩、卦象皆 3 個月），不論同步順序，主 spec 結果一致。程式面兩者都動 `dataExpiry.service.ts`，先實作者建立 `EXPIRING_GROUPS` 與結果型別的擴充，後實作者在其上補自己的欄位。

## Risks / Trade-offs

- [回補後首次排程永久刪除超過 3 個月的歷史] → 兩步驟上線；回補腳本 dry-run 先列出筆數；要求使用者先備份；我不對正式資料執行回補。
- [後台失去更早的歷史統計] → 畫面本來只顯示近 30 天，影響只在於無法回溯；若日後要長期趨勢，另案做每日彙總（例如每日一筆計數），本 change 不做。
- [回補期間仍有新紀錄寫入] → 新紀錄已帶 `expiresAt`；腳本只處理缺少者，可重跑。
- [時區或月底] → 期限用既有 `addMonths`（月底夾取），與其他資料一致，`drawnAt` 為 epoch 毫秒，不受台北日期影響。
- [舊紀錄帶不同的 `expiresAt`] → 0bc7f8c 之前的紀錄本來就帶 `drawnAt + 3 個月`，腳本不覆寫，結果與回補值一致。
- [訪客與星座運勢、瑪雅 Kin] → 訪客不寫紀錄；瑪雅 Kin 的解鎖紀錄本來就是 3 個月，不變。

## Migration Plan

見 Decision 4。回滾：若在回補前發現問題，把 `EXPIRING_GROUPS` 兩項移除即可停止清除（既有資料不受影響）；回補並刪除之後無法回滾，只能由備份還原。

## Open Questions

- 是否要在後台保留長期彙總（每日使用數的永久計數）？目前不做。
- 回補完成後是否把 `expiresAt` 收緊為必填？目前不做。
