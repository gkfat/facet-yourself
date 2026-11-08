## 1. 永久保留塔羅與盧恩抽取紀錄（階段 0）

- [x] 1.1 從 `dataExpiry.service.ts` 的 `EXPIRING_GROUPS` 移除 `tarotDraws`、`runeDraws`，並移除 `cron.schema.ts` 的 `deletedTarotDraws`、`deletedRuneDraws`
- [x] 1.2 `tarot.schema.ts`、`runeDraw.schema.ts`：`expiresAt` 改為 optional（相容舊文件），`DailyDrawRecord` 與 `DailyDrawConfig` 移除 `retentionMonths`，`dailyDraw.engine.ts`、`tarot.service.ts`、`rune.service.ts` 不再寫入 `expiresAt`
- [x] 1.3 更新 `dataExpiry.service.test.ts`、`tarot.service.test.ts`、`rune.service.test.ts`、`deletion.service.test.ts`：cron 不刪抽取紀錄、新紀錄無 `expiresAt`、帳號刪除仍清除
- [x] 1.4 `scripts/provision-firebase.ts` 與 `firestore.indexes.json`：移除這兩個 group 的 `expiresAt` fieldOverride，新增 collection-group `drawnAt` 單欄位 index
- [x] 1.5 搜尋 App 內使用者可見的保留說明文案，若有提到抽取紀錄保留期限則更新（已搜尋 app、content、docs，沒有相關文案，無需更改）
- [x] 1.6 跑 `pnpm test`、`pnpm lint`，確認通過

## 2. 管理員授權

- [x] 2.1 擴充 `server/utils/auth.ts` 與 `shared/types/auth.ts`：從 token 讀出 `admin` claim 與 sign-in provider，既有欄位不變
- [x] 2.2 確認 `shared/types/errors.ts` 是否有 403 錯誤型別，沒有則新增並對應 `toH3Error`（`ForbiddenError` 已存在，`toH3Error` 依 `statusCode` 對應，無需新增）
- [x] 2.3 新增 `requireAdmin`（claim、`email_verified`、`google.com`，失敗記 log 並回 403）與單元測試
- [x] 2.4 新增 `scripts/` 授權與撤銷 admin 的指令，加入 `package.json` 的 `admin:grant`（含撤銷用法），驗證 email、帳號不存在時明確報錯、撤銷時一併 `revokeRefreshTokens`
- [x] 2.5 為授權指令的純函式部分補測試
- [x] 2.6 `docs/firebase-setup.md` 補管理員授權步驟（啟用 Google、授權網域、登入一次、取得 UID、執行指令、重新登入、驗證）與新 index 部署說明

## 3. 後台前端骨架

- [x] 3.1 新增 `app/layouts/admin.vue`（導覽：Dashboard、使用者）與 `app/middleware/admin.ts`（強制更新 token 檢查 `admin` claim，未登入導登入頁、非管理員導首頁）
- [x] 3.2 新增 `/admin` 路由頁（先放空 Dashboard）；admin API 呼叫直接沿用 `useApi`，各指標與列表需要時再各自新增 composable（避免空包裝）
- [ ] 3.3 手動驗證：管理員、一般會員、未登入三種情境的導向（需以真實 Google 帳號登入，待使用者驗證）

## 4. 使用者列表

- [x] 4.1 新增 `shared/schemas/api/adminUsers.schema.ts`（list query／response、detail、patch body）
- [x] 4.2 新增 admin users repository 與 service：cursor 分頁、email 搜尋、詳情、停用／啟用（含 `revokeRefreshTokens`）、刪除（限已停用，呼叫既有 `deletion.service`）
- [x] 4.3 新增 `/api/admin/users` 的 GET 列表、`[id]` GET、PATCH、DELETE handler，皆經 `requireAdmin` 與 zod 驗證
- [x] 4.4 service 與 handler 測試：分頁不重複不遺漏、無效 cursor、停用自己被拒、刪除未停用被拒、非管理員 403
- [x] 4.5 參考 `/Users/gk/side projects/saas-starter-kit/apps/admin/components/users/`（原版依賴 i18n、自有包裝元件與 shared 套件，無法直接複製，改以本專案的 Vuetify 與慣例重寫同樣功能） `UsersTable`、`UsersFilterBar`、`MemberDetailDialog`、`ToggleStatusDialog`、`DeleteUserDialog` 與其用到的 filter-bar 元件，移除 RBAC、feature flag、角色與點數，調整成本專案 ESLint 風格與 Vuetify 設定
- [x] 4.6 新增 `app/pages/admin/users/index.vue`：伺服器端分頁、email 搜尋、詳情與停用／啟用／刪除
- [x] 4.8 依使用者要求移除詳情視窗與詳情 API，列表直接顯示 UID、可用點數、多維度報告次數（完成的 AI 報告）、註冊與最後登入時間
- [ ] 4.7 手動驗證列表、搜尋、停用後該帳號無法登入、刪除流程

## 5. Dashboard 資料層

- [x] 5.1 確認 `server/test-utils/fakeFirestore.ts` 是否支援 `count()`、`sum()` 與 collection group 聚合，不支援則擴充並補測試
- [x] 5.2 新增 `shared/schemas/api/adminDashboard.schema.ts`（各指標 response）
- [x] 5.3 新增 admin stats repository：會員總數與本月新會員、每日抽取數（依 `drawnAt`）、每日扣點與退款（`DEDUCT`／`REFUND`，可依 `reason`）、每日 OpenAI 成本與 token、各單維度系統快照數
- [x] 5.4 新增 admin dashboard service：台北日期日界、近 30 天補 0、並行度限制、短時間記憶體快取
- [x] 5.5 新增 `/api/admin/dashboard/*` handlers，皆經 `requireAdmin`
- [x] 5.6 測試：跨月、台北 00:30 跨日、退款、`userId` 為 null 的用量仍計入、無資料回空而非錯誤、非管理員 403
- [x] 5.7 以 `firebase deploy --only firestore:indexes` 建立複合索引與 `drawnAt` 單欄位索引，並以唯讀查詢確認各聚合查詢在實際 Firestore 可執行（原先缺索引，且 `sum()` 的欄位必須包含在索引內，已修正）

## 6. Dashboard 前端

- [x] 6.1 新增 `chart.js` 依賴（使用者已同意），確認 `pnpm check:bundle` 仍通過
- [x] 6.2 新增 `AdminTrendChart` 元件（建立與銷毀 chart 實例、配色取自 `shared/constants/palette.ts`）
- [x] 6.3 新增 `app/pages/admin/index.vue`：會員總數與本月新會員卡片、單維度排行、每日塔羅與盧恩、每日點數消耗、每日與本月累計 OpenAI 預估成本
- [x] 6.4 畫面標示：成本為預估值、每日運勢僅含會員、排行為已產生快照數且受 6 個月保存影響、資料起始日、點數算法（扣點、退款、淨額）
- [x] 6.5 載入中、空資料與錯誤（含 index 缺失）狀態
- [ ] 6.6 手動驗證圖表與數字和 Firestore 實際資料一致（需索引建立完成與管理員登入，待使用者驗證）

## 7. 多維度 AI 報告使用狀況

- [x] 7.1 `aiReports` 統計：依台北日期的成功／失敗、維度數分布與最大值、提問列表（無身分），上限 1000 筆並標示截斷；新增 `/api/admin/dashboard/ai-reports`、schema、測試與 API 規格登錄（API-076）
- [x] 7.2 `aiReports.createdAt` collection-group 單欄位索引（`firestore.indexes.json`）
- [x] 7.3 建立 `aiReports.createdAt` 的升冪與降冪 collection-group 索引並以唯讀查詢確認（`firebase deploy` 因 `reportSnapshots` 複合索引已存在而回 409，改以 REST 單獨建立）
- [x] 7.4 Dashboard 區塊：成功／失敗圖與成功率、維度數分布與最大值、提問列表

## 8. 收尾驗證

- [x] 8.1 `pnpm lint`、`pnpm test`、`pnpm build`、`pnpm check:bundle` 全數通過
- [x] 8.2 逐一檢查所有 `/api/admin/*` 都有 `requireAdmin` 與對應 403 測試
- [ ] 8.3 以管理員與一般會員帳號跑完整流程驗證，測試用服務若有啟動需釋放 port
