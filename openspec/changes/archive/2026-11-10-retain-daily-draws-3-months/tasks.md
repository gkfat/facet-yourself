## 1. 寫入端：新紀錄帶 expiresAt

- [x] 1.1 `server/services/dailyDraw.engine.ts`：`DailyDrawRecord` 加回 `expiresAt`、`DailyDrawConfig` 加回 `retentionMonths`，第一次抽取寫入 `addMonths(now, retentionMonths)`；訪客的暫時紀錄 `expiresAt = now`
- [x] 1.2 `server/services/tarot.service.ts`、`rune.service.ts`：設 `retentionMonths: 3`，`toDocument` 寫入 `expiresAt`，`fromDocument` 容忍舊文件缺少 `expiresAt`
- [x] 1.3 更新 `tarot.service.test.ts`、`rune.service.test.ts`：新紀錄 `expiresAt` 為抽取時間加 3 個月；同日再抽仍回傳既有紀錄且 `expiresAt` 不變；舊文件缺少 `expiresAt` 仍可讀取；塔羅對同帳號同日的牌與方位與修改前完全相同

## 2. 清除端：到期作業

- [x] 2.1 `server/services/dataExpiry.service.ts`：`EXPIRING_GROUPS` 加回 `tarotDraws`（`deletedTarotDraws`）與 `runeDraws`（`deletedRuneDraws`），更新結果型別、初始值、說明註解（不再說「塔羅盧恩永不清除」，付款紀錄仍不清除）
- [x] 2.2 `/api/cron/data-expiry` 的回應 schema 與其測試加入兩個欄位
- [x] 2.3 更新 `dataExpiry.service.test.ts`：超過 3 個月的塔羅與盧恩被刪、3 個月內保留、缺少 `expiresAt` 的舊文件不被刪、付款紀錄不被刪、單筆失敗不影響其他步驟
- [x] 2.4 `scripts/provision-firebase.ts` 的 `EXPIRY_QUERY_GROUPS` 加回 `tarotDraws`、`runeDraws`，`firestore.indexes.json` 補對應的 `expiresAt` collection group 索引豁免（核對 `0bc7f8c` 前的設定），`docs/firebase-setup.md` 同步

## 3. 後台與其他參照

- [x] 3.1 搜尋 `adminStats.repository`、`adminDashboard.service` 與 `/admin` 畫面對「永久」「資料起始日」的敘述，改為不暗示永久；`earliestDrawAt` 測試維持
- [x] 3.2 搜尋 `shared/schemas/firestore/tarot.schema.ts`、`runeDraw.schema.ts` 的 `expiresAt` 註解，改為「新紀錄寫入；舊紀錄可能沒有」
- [x] 3.3 `deletion.service.test.ts` 與 `fakeFirestore` 相關測試確認仍通過（刪帳號行為不變）

## 4. 驗證

- [x] 4.1 `pnpm test`、`pnpm lint`、`pnpm build`、`pnpm check:bundle` 通過
- [ ] 4.2 與 `add-hexagram-divination` 同時存在時，確認 `dataExpiry.service.ts` 的 `EXPIRING_GROUPS`、結果型別與 `data-retention` delta 合併一致

## 5. 上線（由使用者執行）

- [ ] 5.1 合併並部署程式碼
- [ ] 5.2 執行 `pnpm firebase:provision` 建立 `tarotDraws`、`runeDraws` 的 `expiresAt` 索引豁免
