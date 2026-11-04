## Why

首頁定位要從「功能目錄」轉為「註冊與回訪」：讓想認真了解自己的人每天回來看運勢，並在不被逼迫付費的前提下慢慢信任產品。目前三個障礙擋在前面：

- 主要功能（個人資料、報告、運勢、多維度）藏在登入後才有的 drawer，訪客看不到產品全貌。
- 今日運勢是回訪的核心鉤子，卻整頁僅限會員（`member` middleware、API 皆 `required`），訪客連體驗都沒有。
- 沒有地方說明點數與價格，訪客不知道「付費」代表什麼，也不知道「不付費也能用」。

## What Changes

- md（≥960px）以上，主要 routes 搬到 header nav（靠左，依序為今日運勢、個人資料、自我探索、多維度分析、點數方案）；個人資料只對會員顯示。
- drawer 在 md 以上只留帳號類：點數紀錄、付款紀錄、帳號管理、登出；md 以下維持現有完整清單。
- header nav 的 routes（除個人資料不出現在訪客的導覽外）對訪客開放，各頁依「訪客／會員」顯示差異化提示（訪客：資料只暫存 1 天、登入可保存；會員：照常）。
- 新增 `/pricing` 頁：多維度分析是什麼、三個方案卡片、購買入口；重用 `shared/utils/multiDimensionPricing.ts` 與 `GET /api/point-packages`（已為 `public`）。暫不含範例報告。
- 今日運勢對訪客開放（塔羅、盧恩、今日 Kin、星座運勢）：相關 API 改為 `optional`，訪客以 guest session 取得**決定性、不落地**的結果；頁面提示「登入後可保存歷史、看運勢流動」。
- 帳號類頁面（`/points`、`/payments`、`/me`、`/purchase`）維持會員專屬。
- 首頁改版為後續獨立 change，不在此範圍。

## Capabilities

### New Capabilities
- `site-navigation`: header nav 與 drawer 的內容、斷點行為，以及訪客與會員可見的 routes。
- `pricing-page`: `/pricing` 頁的內容與資料來源，以及它對訪客開放。

### Modified Capabilities
- `today-section`: 訪客不再只看到說明與「立即登入」，而是可進入 `/fortune` 並看到各項每日內容；入口以 header nav 為主。
- `daily-tarot`: 訪客可翻牌，結果由 guest session 與日期決定，不寫入 Firestore。
- `daily-rune`: 同上。
- `maya-kin`: 今日 Kin 對訪客開放（結果只由日期決定）。
- `sign-horoscope`: 訪客以 guest session 暫存的出生日期取得今日星座運勢。
- `single-dimension-report`: 訪客也能看到塔羅、盧恩、星座運勢的每日狀態報告（由 session 與日期決定，不保存）。

## Impact

- 前端：`app/layouts/default.vue`（header nav、drawer 拆分）、新增 `app/pages/pricing.vue`、`app/pages/fortune.vue` 與 `components/fortune/*`（移除 `member` middleware、訪客提示）、`app/pages/self-reports.vue`／`profile.vue`／`report/index.vue`（訪客提示對齊）、`FortuneHomeEntry`。
- 後端：`server/utils/routeAccess.ts`（tarot／rune／kin／horoscope 路徑改 `optional`）、`server/api/{tarot,rune,kin,horoscope}/*`（handler 同時接受 uid 或 guest session）、對應 service（以 guest session id 為抽牌種子）。
- Spec：`openspec/specs/{today-section,daily-tarot,daily-rune,maya-kin,sign-horoscope}` 的 delta；新增 `site-navigation`、`pricing-page`。
- 不新增依賴、不新增 Firestore 集合、不動付款與點數邏輯。
- 風險：訪客 session 24 小時過期後換新 session，同一個台北日可能抽到不同結果（見 design）。
