## 1. 後端：辨識會員或訪客

- [x] 1.1 在 `GuestSessionService` 新增只檢查有效性的方法（不存在、過期、已 claim 皆視為無效），並補測試
- [x] 1.2 在 `server/utils/` 新增 viewer 解析 helper：回傳會員（uid）或訪客（sessionId），兩者皆無或訪客 session 無效時拋 401；格式錯誤的 `X-Guest-Session-Id` 視為沒有；補測試
- [x] 1.3 `routeAccess.ts`：`GET/POST /api/tarot/daily`、`GET/POST /api/rune/daily`、`GET/POST /api/kin/today`、`GET /api/horoscope/daily` 改 `optional`，更新 `routeAccess.test.ts`

## 2. 後端：訪客的每日內容

- [x] 2.1 `TarotService`／`RuneService`：新增訪客路徑，以 `guest:<sessionId>` 為種子呼叫既有 `pick`，不經 `DailyDrawEngine` 的儲存；訪客 `getToday` 恆回 `drawn: false`；補測試（決定性、不寫入、種子前綴）
- [x] 2.2 `KinUnlockService`：新增訪客路徑，`getToday` 恆回未解鎖，`unlock` 只依日期回傳 Kin 與 `KIN_TODAY` 內容、不寫入；補測試
- [x] 2.3 `HoroscopeService`：新增訪客路徑，太陽星座取自 guest session 的暫存出生日期（沿用 `GuestSessionService.getBirthData`）；無出生日期回 422；補測試
- [x] 2.4 四組 handler 改用 viewer helper，會員行為不變，仍以 response schema `parse` 回傳並保持 `Cache-Control: private, no-store`
- [x] 2.5 確認既有會員測試全數通過（`pnpm vitest run server/services`）

## 3. 前端：共用元件與導覽

- [x] 3.1 新增訪客提示元件（`initialized && !isAuthenticated` 才顯示，含「登入」按鈕，文案以 slot 傳入）
- [x] 3.2 `app/layouts/default.vue`：把 nav 項目抽成單一清單（今日運勢在最前、靠左、個人資料僅會員、Pricing 文案為「點數方案」）；md 以上 header 顯示 nav、drawer 只留點數紀錄／付款紀錄／帳號管理／登出；md 以下 drawer 維持完整清單
- [x] 3.3 `default.vue`：訪客在 md 以下也有 menu 按鈕，drawer 只含 nav 項目（無帳號項目與登出）；`login-promo` 與登入按鈕維持現狀
- [x] 3.4 header nav 的作用中樣式；以 960px 與 1280px 檢查項目不擠壓（只跑 lint，版面由使用者自行驗）

## 4. 前端：今日運勢對訪客開放

- [x] 4.1 `fortune.vue`：移除 `member` middleware，加上訪客提示（登入後保存歷史、看運勢流動）
- [x] 4.2 `components/fortune/{Tarot,Kin,Rune,Horoscope}Panel.vue` 與 `/fortune` 入口卡：改以 `optional` 模式呼叫 API；訪客的「已揭曉」狀態以台北日期與 session id 為鍵存在瀏覽器（讀寫皆包 try/catch，缺省時仍正常顯示）
- [x] 4.3 訪客尚未填出生日期時，星座運勢卡引導去 `/profile`（沿用現有 422 處理）
- [x] 4.4 `FortuneHomeEntry`：訪客顯示說明並導向 `/fortune`，不再只顯示「立即登入」

## 5. 前端：各頁訪客提示

- [x] 5.1 `/profile`、`/self-reports`、`/report` 套用共用訪客提示，說明資料只暫存 1 天與登入後的好處（`/report` 併入現有登入說明，不重複）
- [x] 5.2 確認 `/points`、`/payments`、`/me`、`/purchase` 仍掛 `member` middleware，訪客直接進入會回首頁

## 6. 前端：`/pricing` 頁

- [x] 6.1 新增 `app/pages/pricing.vue`：點數用途、免費與付費的界線、不付費也能使用的說明，加上訪客提示
- [x] 6.2 各分析花費由 `shared/utils/multiDimensionPricing` 計算顯示，不寫死數字
- [x] 6.3 以 `GET /api/point-packages` 列出方案，處理載入中、無方案與失敗三種狀態
- [x] 6.4 購買按鈕：會員導向 `/purchase`，訪客導向 `/login`
- [x] 6.5 header nav 與 md 以下 drawer 加入 Pricing
- [x] 6.6 `/pricing` 版面重排：banner、三張方案卡（定位文案由資料推算每點價格與可做份數）、免費與點數的對照、花費範例；`/purchase` 依 `package` 參數預選方案

## 7. 驗證

- [x] 7.1 `pnpm lint`
- [x] 7.2 `pnpm test`
- [x] 7.3 `pnpm build` 與 `pnpm check:bundle`
- [x] 7.4 以訪客身分手動走一遍：進 `/fortune` 翻牌、抽符、算 Kin、看星座運勢，確認 Firestore 沒有新增文件；再以會員身分確認行為不變
- [x] 7.5 `openspec validate header-nav-and-pricing`
