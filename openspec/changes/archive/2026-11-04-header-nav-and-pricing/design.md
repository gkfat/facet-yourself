## Context

- `app/layouts/default.vue`：header 只有品牌、點數、menu 按鈕；`v-navigation-drawer` 僅會員可見，分 `menuItems`（個人資料、自我探索、今日運勢、多維度分析）與 `accountItems`（點數紀錄、付款紀錄、帳號管理）+ 登出。
- `app/middleware/member.ts` 目前掛在 `/fortune`、`/points`、`/payments`、`/me`、`/purchase`。`/profile`、`/self-reports`、`/report` 本來就不擋訪客，且已有部分訪客提示。
- `server/utils/routeAccess.ts` 沒有 tarot／rune／kin／horoscope 的規則，因此預設 `required`。
- 每日抽取共用 `DailyDrawEngine`（紀錄存於 `users/{uid}/…/{date}`）；抽取結果是 `pickDailySymbol(rule, uid, dateKey)` 的**決定性函式**，種子是 uid 字串。今日 Kin 只由日期決定，星座運勢只由日期與太陽星座決定，兩者本來就不存檔。
- 訪客以 `X-Guest-Session-Id`（192-bit 隨機 id）識別，guest session 文件有 24 小時 TTL，`GuestSessionService.getBirthData()` 對不存在、過期、已 claim 的 session 皆回 `null`。
- `GET /api/point-packages` 已是 `public`；價格邏輯在 `shared/utils/multiDimensionPricing.ts`。

## Goals / Non-Goals

**Goals:**
- md 以上以 header nav 作為主要導覽；drawer 精簡為帳號類。
- 訪客可進入所有 nav routes，並在每頁得到清楚的訪客提示。
- 訪客可體驗今日運勢，且不新增任何儲存、集合或 TTL 行為。
- 新增 `/pricing`，讓人在註冊前就能看懂點數與免費範圍。

**Non-Goals:**
- 首頁改版（獨立的後續 change）。
- 範例報告、行銷文案、社會證明。
- 訪客運勢的跨日歷史、分享，或登入後承接訪客當天的抽取。
- 變更點數、定價、付款邏輯。
- 開放 `/points`、`/payments`、`/me`、`/purchase` 給訪客。

## Decisions

### D1：導覽以斷點切分，drawer 內容依斷點切換
`useDisplay().mdAndUp` 為真時，header 顯示 nav 項目，drawer 只渲染 `accountItems` + 登出；否則 drawer 渲染完整清單（`menuItems` + `accountItems` + 登出），header 不顯示 nav。nav 項目清單抽成單一常數，header 與 drawer 共用，避免兩處各維護一份。

- 訪客在 md 以上看到 nav（含 Pricing）與「登入」；md 以下訪客目前沒有 drawer，需要讓訪客也能開 menu 看到 nav routes，因此 menu 按鈕與 drawer 改為訪客也渲染（訪客只含 nav 清單，沒有帳號項目與登出）。
- 替代方案：md 以下改 bottom nav。否決：使用者已選維持 drawer，改動最小。

### D2：訪客的運勢不落地，結果由 guest session 決定
訪客的抽牌、抽符以 `guest:<sessionId>` 為種子餵給既有的 `pick`，結果決定性、不寫 Firestore；今日 Kin 本來只依日期；星座運勢的太陽星座取自 guest session 的 `tempProfile.birthData`。

- 理由：不新增集合與 TTL（專案規定除 `guestSessions`／`welcomeGrants`／`rateLimits` 外不開 TTL，子集合也不會隨父文件 TTL 清除）；不需要 claim 流程；演算法與會員共用，不重複實作。
- `guest:` 前綴避免與真實 uid 的種子碰撞。
- 替代方案：把抽取結果寫進 `guestSessions/{id}` 文件或子集合。否決：要處理清理與 claim，且與「訪客資料只暫存一天」的收益不成比例。
- 「已揭曉」這個狀態對訪客只存在瀏覽器（以台北日期與 session id 為鍵），伺服器端的 GET 對訪客一律回 `drawn: false`／`unlocked: false`，與「未揭曉不洩漏內容」一致；POST 才回結果，重複呼叫結果相同。

### D3：以單一 helper 辨識「會員或訪客」
新增 `server/utils/` 下的 viewer 解析（回傳 `{ kind: 'member', uid }` 或 `{ kind: 'guest', sessionId }`；兩者皆無則 401，格式錯誤的 session header 視為沒有）。訪客的 session 必須仍有效（沿用 `GuestSessionService` 對不存在、過期、已 claim 皆視為無效的判斷，新增一個只檢查有效性的方法）。handler 仍維持慣例：解析身分 → service → response schema `parse`。

- `routeAccess.ts`：`GET/POST /api/tarot/daily`、`/api/rune/daily`、`/api/kin/today`、`GET /api/horoscope/daily` 改 `optional`，並補上 `routeAccess.test.ts`。
- 替代方案：另開 `/api/guest/...` 平行端點。否決：重複 handler 與 schema，前端也要分兩套。

### D4：訪客提示用一個共用元件
新增一個小型的訪客提示元件（`app/components/` 下），接受提示文字 slot，只在 `initialized && !isAuthenticated` 時顯示，樣式與位置統一（頁面頂端 `v-alert`，tonal、可帶「登入」按鈕）。各頁只傳入該頁的文案，不各自刻一份。

- 文案對照：`/fortune`（登入後保存歷史、看運勢流動）、`/profile`（資料只暫存 1 天）、`/self-reports`（結果只暫存 1 天，登入後長期保存）、`/report`（維持現有登入說明）、`/pricing`（登入送 3 點）。

### D5：`/pricing` 以現有資料組成，不新增 API
頁面內容由兩塊組成：多維度分析是什麼（靜態文案）、三張方案卡（`GET /api/point-packages`，每點價格與「約可做幾份 3 維度分析」由資料與 `multiDimensionPricing` 的純函式算出，不寫死數字）。購買按鈕：會員導向 `/purchase`（帶上所選方案）；訪客導向 `/login`。不放範例報告。

## Risks / Trade-offs

- [訪客 session 24 小時到期後，同一台北日可能抽到不同結果] → 對訪客可接受（資料本來就只暫存一天）；頁面提示文案不承諾「今天固定同一張」，只說明登入後可保存。
- [訪客登入後，當天會員抽取的結果與先前訪客抽的不同] → 因種子不同（`guest:` vs uid）。提示文案說明登入後才會保存；不做承接，列為非目標。
- [訪客可建立多個 session 反覆抽取] → 內容免費、不涉及點數；session 建立端點已有速率限制（`rateLimit.service`），維持即可。
- [header nav 在 md 剛過（約 960px）時項目太多而擠不下] → 實作時以 960px 與 1280px 檢視；必要時項目只顯示文字，不加 icon。
- [訪客 menu 與 drawer 的條件渲染變複雜] → 以單一 nav 常數與 `mdAndUp` 計算屬性集中處理，不在 template 內散落判斷。
- [開放 `/fortune` 後，原本只對會員顯示的星座運勢缺出生日期] → 沿用現有 422 `PROFILE_REQUIRED` 與「前往填寫」引導，訪客的出生日期來自 guest session。

## Migration Plan

1. 先上後端：`routeAccess` 規則與 handler 同時接受會員與訪客（會員行為不變，既有測試維持通過）。
2. 再上前端：移除 `/fortune` 的 `member` middleware、訪客提示、`/pricing`、layout 導覽。
3. 回滾：還原 `routeAccess` 規則即可讓訪客請求回到 401；前端還原 layout 與 middleware。沒有資料遷移。

## Open Questions

- 訪客是否在 md 以下也顯示 `login-promo`（現行 ≤420px 已隱藏，維持現狀）。
