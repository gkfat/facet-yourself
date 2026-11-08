## Why

目前沒有任何管理介面，無法得知會員數、各維度使用狀況、點數消耗與 OpenAI 成本，也無法管理使用者。需要一個只有單一超級管理員能進入的後台，作為營運與成本監控的入口。

塔羅與盧恩的每日抽取紀錄目前 3 個月後會被清除，後台無法看到長期的每日使用量，因此需要先改為永久保留。

## What Changes

- 新增 `/admin` 後台（同網域、SPA），以 Google 登入，授權由 Firebase custom claim `admin: true` 決定；不做 RBAC，只有一位超級管理員。
- 新增 `pnpm admin:grant <email>` 與撤銷指令，用 firebase-admin 設定或移除 claim。
- 新增 `requireAdmin`：檢查 `admin` claim、`email_verified`、sign-in provider 為 `google.com`；`/api/admin/*` 一律使用。
- 新增使用者列表，從 saas-starter-kit 複製 `UsersTable`、`UsersFilterBar`、會員詳情與停用／啟用 dialog；改為 cursor 分頁加 email 搜尋；停用／啟用走 Firebase Auth `disabled`；刪除沿用既有帳號刪除流程；不含角色、點數調整、LINE 邀請、setup-link。
- 新增 Dashboard（chart.js）：總會員與本月新會員、單維度分析各系統排行、每日塔羅與盧恩使用數（僅會員）、每日點數消耗、每日 OpenAI 預估成本。
- **BREAKING**：塔羅與盧恩每日抽取紀錄改為永久保留至帳號刪除：
  - 移出 `data-expiry` 排程。
  - 新寫入的文件不再帶 `expiresAt`。
  - 移除 `expiresAt` 的 fieldOverride，新增 `drawnAt` collection-group index。
  - 帳號刪除仍須清除這兩類紀錄。
  - 同步更新保留規則與使用者可見的保留說明文案。
- 新增 `chart.js` 依賴（已獲使用者同意）。

不在範圍：星座運勢、Maya Kin 計數、營收與漏斗分析、RBAC、點數調整、LINE 邀請。

## Capabilities

### New Capabilities
- `admin-access`: 超級管理員的授權（custom claim、`requireAdmin` 檢查、授權指令）與 `/admin` 前端入口守衛。
- `admin-user-management`: 後台使用者列表（cursor 分頁、email 搜尋）、詳情、停用／啟用與刪除。
- `admin-dashboard`: 後台 Dashboard 指標與其資料來源、統計規則（台北日期、僅會員、預估成本）。

### Modified Capabilities
- `daily-tarot`: 「翻牌紀錄的保留與刪除」改為永久保留至帳號刪除，不再帶 `expiresAt`。
- `daily-rune`: 「抽符紀錄的保留與刪除」改為永久保留至帳號刪除，不再帶 `expiresAt`。
- `data-retention`: 排程清除不再包含塔羅與盧恩抽取紀錄；各類資料保存期限補上這兩類為帳號存續期間。

## Impact

- **後端**：新增 `server/api/admin/*`、admin service／repository；`server/utils/auth.ts` 增加 claim 讀取；`routeAccess.ts` 確認 `/api/admin/*` 為 required；`dataExpiry.service.ts`、`dailyDraw.engine.ts`、`tarot.service.ts`、`rune.service.ts` 與相關 schema（`tarot.schema.ts`、`runeDraw.schema.ts`、`cron.schema.ts`）。
- **前端**：新增 `app/pages/admin/*`、admin layout 與 middleware；沿用 Vuetify。
- **設定與腳本**：`firestore.indexes.json`、`scripts/provision-firebase.ts`、新增 admin:grant script、`package.json`。
- **依賴**：新增 `chart.js`。
- **文件**：`docs/firebase-setup.md` 補上管理員授權步驟。
- **資料**：既有帶 `expiresAt` 的抽取文件不遷移，只是不再被排程刪除；上線前已被清除的紀錄無法回補。
- **測試**：`fakeFirestore` 需確認是否支援 count 聚合，必要時擴充。
