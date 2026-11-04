## 1. 共用與準備

- [x] 1.1 把 `/pricing` 的 3 維度量尺（`ZODIAC`、`MBTI`、`NUMEROLOGY`）抽成 `shared/` 內的共用常數，`/pricing` 改引用；`pnpm test` 確認不變
- [x] 1.2 與你確認 design 的 Open Questions：Hero 標題「各種面向綜觀自我，更進一步了解自己」、預覽加摘要、推薦入口為星座／生命靈數／MBTI；已寫回 design.md

## 2. 後端：首頁預覽 API

- [x] 2.1 新增共用 schema（`shared/schemas/api/home.schema.ts`）：查詢（`sign` 為十二星座、`lifePath` 為 1–9、11、22、33、至少一個）與回應（`zodiac`、`numerology` 各為 `{ title, summary }` 或 `null`）
- [x] 2.2 新增 `HomeService`：以 `FixedContentService` 取內容並只留標題與摘要；per-instance 記憶體快取（有內容約 10 分鐘、`null` 約 1 分鐘，時鐘可注入）；未發佈的項目回 `null`、不拋錯；補測試（精簡回應、快取命中不讀 Firestore、`null` 短暫快取、其中一份未發佈）
- [x] 2.3 新增 `server/api/home/preview.get.ts`：zod `safeParse` 查詢（失敗拋 `ValidationError`）→ 僅在記憶體 miss 時以 IP 的 keyed hash 呼叫 `RateLimitService.consume`（每 IP 每分鐘上限為具名常數）→ service → response schema `parse`；200 帶 `public, s-maxage=3600, stale-while-revalidate=86400`，錯誤一律 `no-store`；`throw toH3Error(error)`
- [x] 2.4 `routeAccess.ts` 新增 `GET /api/home/preview` 為 `public`，更新 `routeAccess.test.ts`
- [x] 2.5 補 API 層測試：不合法輸入回 400 且不讀 Firestore、不消耗額度；超過額度回 429 且不讀 Firestore；快取命中不呼叫限流；限流鍵不含 IP 原文
- [x] 2.6 `pnpm vitest run server` 確認既有測試全數通過
- [x] 2.7 把 `GET /api/home/preview` 補進分析文件（`openspec/analysis/api-model.yaml` 的 API-062 與渲染檔 `render/api.yaml`），`server/api.routes.test.ts` 要求每條路由都在其中

## 3. 拆出首頁元件

- [x] 3.1 新增即時預覽元件：吃出生日期，立即顯示星座與生命靈數與連結；日期為空或無效時不渲染
- [x] 3.2 新增預覽摘要的取用 composable：日期完整有效後才以一次 `GET /api/home/preview` 取兩者；以 `(sign, lifePath)` 為鍵在記憶體快取；失敗、429、`null` 降級為不顯示摘要、不重試；補單元測試（只發一次請求、快取、降級、請求不含生日）
- [x] 3.3 新增分析入口清單元件：吃已分組的分析資料，依類別分組直接呈現所有入口（每列三欄；折疊、推薦與「更多角度」標題已依你的要求移除）
- [x] 3.4 把 `index.vue` 的 `systems` 與 `analyses` 合併成單一資料來源，依類別分組（推薦與遞補規則、`splitRecommended` 及其測試已隨取消推薦一併移除）

## 4. 改版 `index.vue`

- [x] 4.1 Hero：標題為「各種面向綜觀自我，更進一步了解自己」，副文案縮成一句（提出字句供你確認），出生日期輸入搬進 Hero（「不用登入」的徽章已依你的要求移除，訪客與會員都不顯示）
- [x] 4.2 補充資料：血型、出生時間、城市、性別移入 Hero 下方的可展開區塊，說明可解鎖的內容；沿用 `useProfile` 綁定
- [x] 4.3 登入促進區縮小，加入由 `WELCOME_POINTS` 與 `multiReportCost` 算出的贈點說明（N 小於 1 時只顯示點數）
- [x] 4.4 套用預覽元件，移除 `fill` 卡與重複的 `angles` 卡，改用分析入口清單元件
- [x] 4.5 今日運勢區塊上移到 Hero 與預覽之後；`FortuneHomeEntry` 文案對訪客維持「看今天的運勢」
- [x] 4.6 多維度區塊：移除 `locked`／`gated` 的模糊與覆蓋層，改為說明、連到 `/pricing` 的連結、依解鎖狀態的按鈕，訪客顯示一般登入提示
- [x] 4.7 清掉不再使用的樣式與程式（`pass`、`locked` 等），確認沒有殘留引用

## 5. 對照既有 spec

- [x] 5.1 對照 `bazi-chart`、`maya-kin`、`hexaco-test`、`self-assessment-framework` 提到首頁卡片的措辭：已各補 delta 改為「推薦入口與更多角度」
- [x] 5.2 確認 `today-section` 沒有與新順序衝突的條文

## 6. 驗證

- [x] 6.1 `pnpm lint`
- [x] 6.2 `pnpm test`
- [x] 6.3 `pnpm build` 與 `pnpm check:bundle`
- [x] 6.4 以訪客與會員各走一遍首頁（版面由使用者自行驗）：填日期即時出現預覽、補充資料展開、兩類分析入口全部呈現、今日運勢在第二屏、多維度沒有模糊遮罩
- [x] 6.5 `openspec validate redesign-home-page`
- [x] 6.6 上線前檢查：在 Vercel Firewall 為 `/api/home/preview` 設速率規則（程式內的限流只保護 Firestore，擋不住對函式本身的洪水）

## 7. 視覺重排（依首頁回饋）

- [x] 7.1 登入促進併入「從你的生日開始」卡片，移除獨立的 `pass` 區塊與贈點小字；Hero 改為標題與卡片並排（窄螢幕上下）
- [x] 7.2 新增多維度主視覺元件（`HomeMultiFeature`）：深藍卡片、重疊圓圖、按鈕、`/pricing` 連結、最小花費；首頁移除舊的多維度卡片
- [x] 7.3 今日運勢卡片改為琥珀色淺色版，以自己的寬度決定一列放幾張小卡；與多維度同列（5:7），窄螢幕上下排列
- [x] 7.4 依你的要求改為一列一項：Hero 只留標題與副文案，順序為今日運勢、多維度分析、從你的生日開始（含補充資料與登入促進）、預覽、認識自己；移除並排的 `pair` 與 Hero 的兩欄
- [x] 7.5 你自行確認版面：全寬的今日運勢與多維度、填個資卡片在較下方的位置
