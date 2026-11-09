## Why

使用者決定每日抽取紀錄一律只保存 3 個月，與測驗結果、卦象等其他帶期限的資料一致。目前塔羅與盧恩的抽取紀錄自 commit `0bc7f8c` 起永久保留（為了後台歷史統計），與 analysis 的 CTX-CON-018（保存 3 個月）和多數 spec 的 Purpose 敘述不一致；`add-hexagram-divination` 也已決定卦象保存 3 個月。這個 change 把塔羅與盧恩改回 3 個月，讓三種每日抽取的保存規則相同。

## What Changes

- 塔羅與盧恩每日抽取紀錄改為保存 3 個月：每筆新紀錄帶 `expiresAt = drawnAt + 3 個月`，由每日到期作業清除（不開 Firestore TTL）；訪客的抽取仍不寫紀錄。
- **BREAKING（資料）**：既有紀錄回補 `expiresAt` 後，超過 3 個月的塔羅與盧恩紀錄會在到期作業首次處理時被永久刪除，無法復原。回補與刪除分成兩步，回補前先 dry-run 列出將被刪除的筆數，並由使用者先備份 Firestore。
- 新增一次性回補腳本：為缺少 `expiresAt` 的 `tarotDraws` 與 `runeDraws` 寫入 `drawnAt + 3 個月`（冪等，支援 `--dry-run`）。
- 還原 `0bc7f8c` 移除的到期設定：共用抽取引擎的 `expiresAt` 與 `retentionMonths`、`dataExpiry` 的 `tarotDraws`／`runeDraws` 清除步驟與回報欄位、索引豁免。
- 後台 Dashboard 的每日塔羅與盧恩使用數只讀得到近 3 個月；畫面維持近 30 天，不受影響，但後台不再能看到更早的歷史。
- `data-retention`、`daily-tarot`、`daily-rune` 三份 spec 的保留規則由「永久」改為「3 個月」。

## Capabilities

### New Capabilities
（無）

### Modified Capabilities
- `data-retention`: 塔羅與盧恩每日抽取紀錄改為 3 個月並由排程清除，付款紀錄仍為永久。
- `daily-tarot`: 「翻牌紀錄的保留與刪除」改為保存 3 個月、帶 `expiresAt`、由排程清除。
- `daily-rune`: 「抽符紀錄的保留與刪除」改為保存 3 個月、帶 `expiresAt`、由排程清除。

## Impact

- `server/services/dailyDraw.engine.ts`：`DailyDrawRecord` 加回 `expiresAt`，`DailyDrawConfig` 加回 `retentionMonths`，建立紀錄時寫入 `addMonths(now, retentionMonths)`；訪客的暫時紀錄 `expiresAt = now`。
- `server/services/tarot.service.ts`、`rune.service.ts`：`retentionMonths: 3`、`toDocument` 寫入 `expiresAt`。
- `shared/schemas/firestore/tarot.schema.ts`、`runeDraw.schema.ts`：`expiresAt` 由「已棄用、可有可無」改為新紀錄必填、舊紀錄回補後也必填（回補完成前讀取仍須容忍缺少）。
- `server/services/dataExpiry.service.ts` 與其結果型別、`/api/cron/data-expiry` 回應 schema：加回 `deletedTarotDraws`、`deletedRuneDraws`。
- `scripts/provision-firebase.ts`、`firestore.indexes.json`：`EXPIRY_QUERY_GROUPS` 加回 `tarotDraws`、`runeDraws`，並補 `expiresAt` 的 collection group 索引豁免；`docs/firebase-setup.md` 同步。
- 新增 `scripts/backfill-draw-expiry.ts`（一次性回補，不隨部署自動執行）。
- 測試：`dataExpiry.service.test.ts`、`tarot.service.test.ts`、`rune.service.test.ts`、`deletion.service.test.ts` 以及 `fakeFirestore` 相關測試更新。
- 後台：`adminStats.repository` 的 `earliestDrawAt` 只會回傳 3 個月內最早的一筆；後台畫面若有顯示「資料起始日」需確認措辭。
- 與 `add-hexagram-divination` 的關係：兩者都修改 `data-retention` 的同兩條 requirement，delta 已寫成相同的合併後內容，不論哪個先同步結果相同；兩者都改 `dataExpiry.service.ts` 的 `EXPIRING_GROUPS` 與結果型別，後實作者要在先實作者的基礎上合併。
- 不新增 dependency；不改 API 契約與抽取規則（決定性雜湊不變）。
- 追溯（`openspec/analysis/`）：CTX-CON-018（每日抽取保存 3 個月，本 change 讓現況與之一致）、FR-033（資料保存）、FR-045、FR-046、FR-047 的紀錄保存描述。未新增需求，故不跑 system-analysis。
