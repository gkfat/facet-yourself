## Context

塔羅與盧恩共用 `DailyDrawEngine`。原本每筆紀錄帶 `expiresAt`（`retentionMonths` 為 3），由 `dataExpiry.service` 的 `EXPIRING_GROUPS` 每日清除。commit `0bc7f8c`（新增後台）為了讓後台保有歷史統計，移除了這些：引擎不再寫 `expiresAt`、`EXPIRING_GROUPS` 拿掉 `tarotDraws`／`runeDraws`、索引豁免拿掉，`data-retention`、`daily-tarot`、`daily-rune` spec 改為「永久、不帶 `expiresAt`」。因此：

- 0bc7f8c 之前建立的紀錄仍帶 `expiresAt`（schema 註明「讀取時忽略」）；
- 0bc7f8c 之後建立的紀錄沒有 `expiresAt`；
- 現在清除作業完全不碰這兩個集合。
- 既有紀錄不處理（user 決定不考慮線上既有資料）。

這個 change 是把這個決定反過來。這是刪除資料的變更，但只針對之後新建立的紀錄。

## Goals / Non-Goals

**Goals:**
- 新建立的塔羅與盧恩紀錄一律帶 `expiresAt = drawnAt + 3 個月`，並由每日到期作業清除。
- 把 spec 與程式回到一致，三種每日抽取（含卦象）規則相同。

**Non-Goals:**
- 不改抽取規則、API、內容與前端。
- 不為後台另存長期彙總（見 Risks）。
- 不改付款紀錄的永久保存。
- 不回補既有紀錄（user 決定不考慮線上既有資料）。

## Decisions

1. **寫入端：還原引擎的 `expiresAt` 與 `retentionMonths`。**
   `DailyDrawRecord` 加回 `expiresAt`，`DailyDrawConfig` 加回 `retentionMonths`，第一次抽取時寫入 `addMonths(now, retentionMonths)`（沿用 `shared/utils/time.ts` 的 `addMonths`，已存在）。塔羅與盧恩各設 `retentionMonths: 3`；`toDocument` 寫入 `expiresAt`。訪客的暫時紀錄 `expiresAt = now`（不寫入，只為型別一致）。
   - 替代方案：不寫入、改成清除時以 `drawnAt` 算期限。需要 `drawnAt` 的 collection group 範圍查詢，且現有單欄位索引已用在後台統計；其他到期資料皆用 `expiresAt`，故沿用 `expiresAt` 以維持一致。

2. **清除端：把兩個集合加回 `EXPIRING_GROUPS`。**
   結果型別與 `/api/cron/data-expiry` 的回應 schema 加回 `deletedTarotDraws`、`deletedRuneDraws`。`expiresAt` 的 collection group 查詢需索引豁免：`scripts/provision-firebase.ts` 的 `EXPIRY_QUERY_GROUPS` 加回兩者，`firestore.indexes.json` 補對應的 `fieldOverrides`，`docs/firebase-setup.md` 同步。

3. **不回補既有紀錄。**
   沒有 `expiresAt` 的舊紀錄不會被到期作業的查詢找到，所以不會被刪除，只在刪除帳號時移除。user 決定不考慮線上既有資料，因此不寫回補腳本，也沒有「首次排程大量刪除」的風險。

4. **Schema：新紀錄必填、讀取容忍缺少。**
   `expiresAt` 在 Firestore 文件 schema 維持可選（讀取舊文件不能失敗），但寫入端一律帶；

5. **後台：不改查詢，只更新語意。**
   每日使用數維持近 30 天，3 個月內都讀得到；`earliestDrawAt` 之後只反映 3 個月內最早的一筆，若畫面有「資料起始日」類文案要改成不暗示永久。

6. **與 `add-hexagram-divination` 的 spec 重疊。**
   兩個 change 都 MODIFIED `data-retention` 的「各類資料保存期限」與「排程清除到期資料」。本 change 與卦象 change 的 delta 內容相同（塔羅、盧恩、卦象皆 3 個月），不論同步順序，主 spec 結果一致。程式面兩者都動 `dataExpiry.service.ts`，先實作者建立 `EXPIRING_GROUPS` 與結果型別的擴充，後實作者在其上補自己的欄位。

## Risks / Trade-offs

- [後台失去更早的歷史統計] → 畫面本來只顯示近 30 天，影響只在於無法回溯；若日後要長期趨勢，另案做每日彙總（例如每日一筆計數），本 change 不做。
- [時區或月底] → 期限用既有 `addMonths`（月底夾取），與其他資料一致，`drawnAt` 為 epoch 毫秒，不受台北日期影響。
- [舊紀錄沒有 `expiresAt`，永遠不會被清除] → 已知並接受；舊文件只在刪除帳號時移除，不影響新紀錄的 3 個月規則。
- [訪客與星座運勢、瑪雅 Kin] → 訪客不寫紀錄；瑪雅 Kin 的解鎖紀錄本來就是 3 個月，不變。

## Migration Plan

部署即生效：此後新建立的塔羅與盧恩紀錄帶 `expiresAt`，每日排程開始清除到期者；`pnpm firebase:provision` 建立 `expiresAt` 索引豁免（沒有索引豁免時排程的 collection group 查詢會失敗並回報，不會誤刪）。回滾：把 `EXPIRING_GROUPS` 兩項移除即可停止清除。

## Open Questions

- 是否要在後台保留長期彙總（每日使用數的永久計數）？目前不做。
