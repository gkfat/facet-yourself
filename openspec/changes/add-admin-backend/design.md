## Context

- 專案目前沒有 admin 概念；`server/utils/auth.ts` 的 `verifyIdToken` 回傳 `{uid, email, email_verified, googleSub}`，`routeAccess.ts` 預設 required，由 `auth.global.ts` 套用。
- `firestore.rules` 全擋 client，資料只經 firebase-admin。
- 塔羅／盧恩每日抽取存於 `users/{uid}/tarotDraws|runeDraws/{YYYY-MM-DD}`（台北日期為 doc id），目前帶 `expiresAt`，由 `dataExpiry.service.ts` 的 `EXPIRING_GROUPS` 清除。訪客抽取為 ephemeral，不寫入。
- 全站成本資料在頂層 `aiUsageRecords`（`inputTokens`、`outputTokens`、`estimatedCost`、`createdAt`）；點數帳本是 `users/{uid}/pointTransactions`（無全域 ledger）；分析快照是 `users/{uid}/reportSnapshots`（無 `userId` 欄位，時間欄位為 `generatedAt`，6 個月保存）。
- `firestore.indexes.json` 的 `indexes` 為空，專案內沒有 count／sum 聚合先例；`fakeFirestore` 是否支援聚合未確認。
- 使用者列表參考實作（saas-starter-kit）是後端全撈再記憶體過濾，且綁 RBAC。

## Goals / Non-Goals

**Goals:**
- 單一超級管理員可進入 `/admin`，授權由 Firebase custom claim 控制。
- 使用者列表（分頁、email 搜尋、詳情、停用／啟用、刪除）。
- Dashboard：會員數、單維度排行、每日塔羅／盧恩使用數、每日點數消耗、每日 OpenAI 預估成本。
- 塔羅與盧恩抽取紀錄永久保留，使後台能看長期趨勢。

**Non-Goals:**
- RBAC、多管理員、點數調整、LINE 邀請、setup-link。
- 星座運勢與 Maya Kin 計數、營收與漏斗分析、訪客使用量。
- 每日彙總集合（先用聚合查詢；若讀取成本或延遲不可接受再另開 change）。

## Decisions

### D1：授權用 custom claim，並在後端雙重確認
- `requireAdmin` 在 `requireAuth` 之後檢查 `admin === true`、`email_verified`、`firebase.sign_in_provider === 'google.com'`。需擴充 `verifyIdToken` 的回傳型別（`admin`、`signInProvider`），不改變既有欄位。
- 替代方案：env `ADMIN_EMAILS` 白名單。簡單但換人需重新部署，且 email 為可變屬性；使用者已選 claim。
- 授權指令放 `scripts/`（沿用 `scripts/lib` 與 Node 內建 TypeScript 執行），本機讀 `service_account.json`，production 用 `FIREBASE_SERVICE_ACCOUNT_KEY`。
- claim 變更後需重新取得 token（前端 `getIdToken(true)`）；撤銷最長約 1 小時才使舊 token 失效，單一管理員情境可接受。

### D2：存取控制放在 handler 層的 `requireAdmin`，路徑規則維持預設 required
- `/api/admin/*` 不新增 public／optional 規則，沿用預設 required 取得 401；403 由 `requireAdmin` 拋出。
- 新增 admin 專用錯誤處理沿用 `toH3Error`；403 以既有錯誤型別表達，必要時在 `shared/types/errors.ts` 補 `ForbiddenError`（先確認是否已存在）。
- 替代方案：在 `auth.global.ts` 對 `/api/admin/*` 統一檢查。集中但更動全域 middleware，blast radius 較大，故先採 handler 層，並以測試窮舉 admin 路由都有檢查。

### D3：分層與目錄
- `server/api/admin/*.ts` → `server/services/admin*.service.ts`（繼承 `BaseService`）→ `server/repositories/admin*.repository.ts`（繼承 `BaseRepository`，唯一碰 Firestore）。
- request／response 的 zod schema 放 `shared/schemas/api/admin*.schema.ts`。
- 前端：`app/pages/admin/*`、`app/layouts/admin.vue`、`app/middleware/admin.ts`、`app/composables/useAdmin*.ts`、`app/components/admin/*`。

### D4：使用者列表 cursor 分頁與搜尋
- 以 `users` 依 `createdAt desc`（加 doc id 作 tiebreaker）做 cursor 分頁，單頁筆數有上限。
- email 搜尋：先以 Firebase Auth `getUserByEmail` 或 `users.email` 等值查詢取單筆，不做模糊搜尋（避免全表掃描）。
- 停用狀態、最後登入時間讀 Firebase Auth（以該頁 uid 批次 `getUsers`，每批上限 100）。點數餘額與已完成的多維度報告次數（`users/{uid}/aiReports` 的 `COMPLETED` 數）每列各讀一次，並行度限制為 6；沒有詳情頁，所有欄位直接在列表。
- 停用／啟用寫 Firebase Auth `disabled`；停用時一併撤銷 refresh token（`revokeRefreshTokens`），使既有 session 失效。
- 刪除呼叫既有 `deletion.service`，不重寫刪除邏輯。
- 參考實作元件複製後調整：移除 RBAC、feature flag、角色與點數欄位。

### D5：Dashboard 統計用 Firestore 聚合
- 會員數：`users` 的 `count()`，本月新會員以 `createdAt` 範圍加 `count()`。
- 每日抽取數：`collectionGroup('tarotDraws'|'runeDraws')` 依 `drawnAt` 日範圍 `count()`，30 天逐日查詢並以 `Promise.all` 限制並行度；日界以台北時間（沿用 `shared/utils/time` 的台北日期工具）。
- 每日點數消耗：`collectionGroup('pointTransactions')` 以 `type=DEDUCT` 加 `createdAt` 日範圍 `sum('amount')`；依 `reason` 拆分時各 reason 各查一次。退款以 `type=REFUND` 另行 `sum`，畫面顯示扣點、退款與淨額。
- OpenAI 成本：`aiUsageRecords` 依 `createdAt` 日範圍 `sum('estimatedCost')`、`sum('inputTokens')`、`sum('outputTokens')`。
- 單維度排行：`reportSnapshots` 的 `systems` 為陣列，SINGLE 快照每筆只有一個系統；對每個已知系統以 `kind=SINGLE` 加 `systems array-contains` 加時間範圍 `count()`。系統清單來自 `MAPPING_SYSTEMS` 與 assessment 定義，不硬編碼。
- 替代方案：寫入時維護每日彙總集合。讀取便宜，但要改動多個現有寫入路徑，且上線前歷史補不回來；先用聚合查詢，有需要再另開 change。
- 若 `fakeFirestore` 不支援 `count()`／`sum()`，先擴充它並補測試，再實作 repository。
- 各端點結果加短時間（約 60 秒）的 server 端記憶體快取以降低重複讀取；快取只放彙總數字。

### D5a：多維度 AI 報告用一次有上限的讀取
- 成功／失敗、維度數、提問都在 `aiReports`（`status`、`sources`、`question`），維度數無法用聚合查詢取得（陣列長度）。
- 以 `collectionGroup('aiReports')` 依 `createdAt` 取最近一批（上限 1000 筆，`select` 只取需要的欄位），在記憶體彙總；超過上限標示不完整。需要 `aiReports.createdAt` 的 collection-group 單欄位索引。
- 提問是使用者填寫的文字，回傳時不帶 uid／email；這是對「只含彙總數字」的唯一例外，已寫入 spec。

### D6：永久保留塔羅／盧恩抽取紀錄
- 從 `EXPIRING_GROUPS` 移除 `tarotDraws`、`runeDraws`，同步移除 `cron.schema.ts` 中 `deletedTarotDraws`、`deletedRuneDraws` 回報欄位與測試。
- `tarotDrawDocSchema`、`runeDrawDocSchema`、`DailyDrawRecord`、`DailyDrawConfig.retentionMonths` 的 `expiresAt`：讀取端容許舊文件帶 `expiresAt`（optional 並忽略），寫入端不再寫入。
- 既有文件不遷移；移出排程後不會再被刪除，無需回填。
- `scripts/provision-firebase.ts` 與 `firestore.indexes.json`：移除這兩個 group 的 `expiresAt` fieldOverride，新增 collection-group `drawnAt` 單欄位 index（供聚合）。已建立的舊 index 可保留，不影響功能。
- 帳號刪除仍刪這兩個子集合（維持 `deletion.service` 行為，只補測試確認）。
- 同步更新 `daily-tarot`、`daily-rune`、`data-retention` 規格（見 delta specs），以及使用者可見的保留說明（若 App 內有相關文案）。

### D7：圖表使用 chart.js
- 使用者已同意新增 `chart.js`。採用直接使用 chart.js，不加 Vue 包裝套件，自寫一個小的 `AdminTrendChart` 元件負責建立與銷毀 chart 實例，避免再增加依賴。
- 圖表配色取自 `shared/constants/palette.ts`。

## Risks / Trade-offs

- [`estimatedCost` 為預估值，OpenAI 調價或換 model 會偏差] → 畫面標示預估，單價維持 env 設定。
- [聚合查詢的讀取費用：30 天乘多指標會產生大量 aggregation 請求] → 並行度限制、server 短暫快取；若成本不合理再改為每日彙總集合。
- [collection-group 聚合需要先建立 index，否則查詢失敗] → 在 `firestore.indexes.json` 與 provision script 補齊，部署步驟寫入 `docs/firebase-setup.md`，前端對 index 錯誤顯示明確訊息。
- [上線前已被排程刪除的抽取紀錄無法回補] → 統計自上線日起算，畫面標示資料起始日。
- [單維度排行受 6 個月保存與快照重用影響，非精確操作次數] → 畫面標示定義。
- [永久保留改變隱私承諾] → 規格、保留規則文件與使用者可見文案同步修改；帳號刪除維持清除。
- [撤銷管理員後舊 token 最長約 1 小時有效] → 單一管理員情境接受；必要時同時 `revokeRefreshTokens`（授權指令的撤銷流程一併執行）。
- [admin 頁面與主站在同一 bundle] → 不含 secret；上線前跑 `pnpm check:bundle`。
- [訪客不計入每日使用數] → 畫面標示「僅含會員」。

## Migration Plan

1. 先上線階段 0（保留抽取紀錄），讓資料開始累積；確認 cron 不再刪除這兩類。
2. 部署 `firestore.indexes.json` 與 provision 的新 index，等待 index 建立完成。
3. 上線 admin API 與前端；以授權指令為管理員帳號設定 claim；重新登入驗證。
4. 回滾：後台為新增路徑，可直接下架 `/admin` 與 `/api/admin/*`；撤銷 claim 即停用入口。階段 0 回滾需重新把兩個 group 放回 `EXPIRING_GROUPS` 並恢復寫入 `expiresAt`，但已永久保留的紀錄會在下次排程前沒有 `expiresAt`，需另行補值，故不建議回滾。

## Open Questions

- 使用者可見的保留說明文案目前在 App 內位置未確認（`login.vue` 只有訪客結果不保留的說明），實作時先搜尋再決定是否需要改動。
- `ForbiddenError` 是否已存在於 `shared/types/errors.ts`，實作時確認。
