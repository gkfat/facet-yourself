## 1. 確認待定假設與經文來源

- [x] 1.1 與使用者確認 design 的 Open Questions：決定性雜湊、不重用引擎、卦象紀錄保存 3 個月、付費卦不設上限，結果已寫回 design 與 `openspec/analysis/context.yaml`
- [x] 1.2 經文版本已定為通行本（王弼本系統、King Wen 序，含彖、象）；實作時確認八卦上下卦對照 64 卦的表，在常數檔註明來源，並於入庫前人工校對一次
- [x] 1.3 塔羅與盧恩也改為 3 個月已確認，另開 change `retain-daily-draws-3-months`，不在本 change 實作

## 2. 常數與起卦純函式（shared）

- [x] 2.1 新增 `shared/constants/hexagrams.ts`：八卦、64 卦（卦序、卦名、上下卦、卦辭、彖辭、象辭）與每卦 6 條爻辭，並提供 `hexagramContentKeys()`（448 個金鑰）
- [x] 2.2 新增 `shared/utils/hexagram.ts`（client 安全：`HEXAGRAM_DRAW_VERSION = 'hexagram-v1'`、`hexagramOf(lines)`（本卦、變卦、動爻）、`readingPlan(lines)`（`none`／`single`／`multiple`）、`toHexagramLines`）與 `shared/utils/hexagramCast.ts`（server 專用：`castHexagram(subject, dateKey, seq)`，SHA-256 前 18 位元三枚銅錢；因使用 `node:crypto` 而與前者分開）
- [x] 2.3 測試：同輸入同結果、不同序號各自決定；大量樣本下四種爻值比例與 64 卦出現率符合 1/8、3/8、3/8、1/8 與 1/64（容差 ±10%）；上下卦對照 64 組合唯一；常數完整（64 卦、384 條爻辭、卦序不重複）；變卦翻轉正確；六爻皆動歸 `multiple`
- [x] 2.4 新增 `shared/schemas/firestore/hexagramDraw.schema.ts`（`lines` 為 6 個 6–9 的整數、`seq`、`paid`、`pointTransactionId`、`requestId`、`drawVersion`、`drawnAt`、`expiresAt`）與 `shared/schemas/api/hexagram.schema.ts`（GET／POST 回應含 `mode`；請求 schema 只允許選填 `requestId`，其他欄位一律拒絕）

## 3. 固定內容類型

- [x] 3.1 `shared/utils/fixedContentKeys.ts` 與 `fixedContentTypeSchema`：新增 `HEXAGRAM`（金鑰 `<1..64>` 與 `<1..64>_<1..6>`）、`fixedContentIds()` 加入 448 筆；更新 `fixedContentKeys.test.ts`、`fixedContentImport.test.ts` 的預期總筆數
- [x] 3.2 匯入的保守措辭檢查：加入吉凶斷語詞清單（大吉、大凶、必定、災禍等），含測試；確認不誤擋「可能／傾向」等既有用語
- [x] 3.3 `pnpm content:import --dry-run` 以一份範例 JSON 驗證類型與金鑰規則通過

## 4. 點數與紀錄

- [x] 4.1 `shared/schemas/firestore/points.schema.ts` 的 `POINT_TRANSACTION_REASONS` 與 `server/services/point.service.ts` 的 `DeductReason` 新增 `HEXAGRAM_CAST`；檢查所有以 reason 做 switch 或標籤的位置（含後台、點數異動列表）並補齊
- [x] 4.2 新增 `server/repositories/hexagram.repository.ts`：`ref(uid, dateKey, seq)`、今日各卦的 `date` 等值查詢、`runTransaction`
- [x] 4.3 新增 `server/services/hexagram.service.ts`（寫紀錄時 `expiresAt = drawnAt + 3 個月`）：`getToday(uid)`、`draw(uid, { requestId?, confirmCharge? })`（同一交易：讀今日各卦 → 以 `requestId` 去重 → 未確認扣點且已有卦則回傳最新一卦 → 決定 `seq` → `seq ≥ 1` 時 `planDeduction` → 寫紀錄）、`getTodayForGuest()`、`drawForGuest(sessionId)`（只 `seq = 0`、不存）；內容在進交易前先確認可交付
- [x] 4.4 service 測試（用 `fakeFirestore`）：第一卦免費且無扣點交易；第二卦扣 1 點並寫紀錄；點數不足不留紀錄；同 `requestId` 重送只一筆；並行不同請求各得不同 `seq`、各扣 1 點；同一 `seq` 的扣點交易只有一筆；缺內容時不扣點；隔天 `seq` 重新從 0；訪客不寫紀錄且同 session 同日同結果、訪客加卦被拒

## 5. API 與存取規則

- [x] 5.1 新增 `server/api/hexagram/daily.get.ts` 與 `daily.post.ts`（`requireViewer`、zod 解析、response schema `parse`、`Cache-Control: private, no-store`、`toH3Error`）
- [x] 5.2 `server/utils/routeAccess.ts`：兩條路徑加入 `optional` 規則，並補測試（無憑證 401、訪客可用）
- [x] 5.3 API 測試：GET 未起卦／已起卦；POST 帶日期、使用者識別、序號、爻值或自由文字被拒；回應含 `mode`；訪客加卦回應要求登入
- [x] 5.4 `server/services/dataExpiry.service.ts`：`EXPIRING_GROUPS` 加入 `hexagramDraws`、結果加 `deletedHexagramDraws`，更新型別、`/api/cron/data-expiry` 的回應 schema 與測試（過期的卦象被刪、未到期保留）；若 `retain-daily-draws-3-months` 已先實作，在其擴充的基礎上加入，不重複
- [x] 5.5 刪除帳號是對使用者文件遞迴刪除，`hexagramDraws` 自然隨之清除，不需改 `deletion.service.ts`；刪除資料的範圍（測驗結果、報告、人類圖）不含每日抽取，比照塔羅盧恩不動它。補測試：帳號刪除只清該使用者的卦象、資料範圍刪除不動卦象

## 6. 後台與索引

- [x] 6.1 `server/repositories/adminStats.repository.ts` 的 `DrawGroup` 加入 `hexagramDraws`；`adminDashboard.service.ts` 的每日使用數加卦象欄位，補測試與後台畫面的欄位與「僅含會員」標示
- [x] 6.2 後台點數消耗依 `reason` 拆分時補上「卦象加卦」的顯示名稱與測試
- [x] 6.3 `firestore.indexes.json` 與 `scripts/provision-firebase.ts` 新增 `hexagramDraws` 的 `drawnAt` collection group 單欄位索引，並把 `hexagramDraws` 加進 `EXPIRY_QUERY_GROUPS`（`expiresAt` 索引豁免，不開 TTL）；更新 `docs/firebase-setup.md`

## 7. 前端

- [x] 7.1 新增 `app/components/hexagram/Lines.vue`（六爻 SVG：實線陽、斷線陰、動爻標記，`aria-label` 含卦名與六爻描述）與測試（元件本身沒有元件測試設施，畫面用的純函式 `app/utils/hexagramView.ts` 有測試；實際畫面待 9.3 本機跑過）
- [x] 7.2 新增 `app/composables/useDailyHexagram.ts`（GET／POST、產生 `requestId`、點數刷新）與 `app/components/fortune/HexagramPanel.vue`、`app/pages/hexagram.vue`：逐爻浮現動畫、`prefers-reduced-motion` 直接顯示、本卦與變卦並排、依 `mode` 顯示內容、經文原文標示、免責聲明
- [x] 7.3 加卦流程：第二卦起顯示「將扣 1 點」與餘額並確認；點數不足時引導購買、不送請求；送出中停用按鈕防連點
- [x] 7.4 `HEXAGRAM_ENTRY_ENABLED`（先設 false）控制 `pages/fortune.vue`、`components/fortune/HomeEntry.vue` 與導覽；訪客顯示只有當日免費卦與登入提示

## 8. 白話內容

- [x] 8.1 撰寫 64 卦本卦白話（`<卦序>`），語氣為「這一刻的狀態，不是預言」，附 `disclaimer`，產生 `content/fixed/hexagram.json`
- [x] 8.2 撰寫 384 爻白話（`<卦序>_<爻位>`；可先放爻辭原文加簡短白話，分批補），併入 `content/fixed/hexagram.json`
- [x] 8.3 `pnpm content:import content/fixed/hexagram.json --dry-run` 全數通過（金鑰、措辭檢查）；人工審稿一輪

## 9. 驗證與上線

- [x] 9.1 `pnpm test`、`pnpm lint`、`pnpm build`、`pnpm check:bundle`、`pnpm ontology:check` 全部通過（`ontology:check` 確認沒有映射指向卦象）
- [x] 9.2 正式匯入：`pnpm content:import content/fixed/hexagram.json`，`pnpm content:check` 顯示 448 筆全數發布；建立 `hexagramDraws` 索引
- [x] 9.3 本機完整做過一次：登入者第一卦（免費）、第二卦（扣 1 點）、點數不足、訪客一卦、換裝置同卦、減少動態；若手動起服務，結束後釋放 port
- [x] 9.4 `HEXAGRAM_ENTRY_ENABLED` 改為 `true` 並部署（部署由使用者自行執行）

## 10. 試用後的修正（user 回饋）

- [x] 10.1 付費加卦確認後先關閉視窗，再於頁面上開始擲錢
- [x] 10.2 每一卦都由使用者親自擲六次銅錢（三枚銅錢翻轉動畫，一次一爻，可自動擲完：逐爻各播放一次翻轉，不直接跳到結果），取代自動逐爻浮現
- [x] 10.3 畫面不標示免費或點數
- [x] 10.4 用語白話化（你的卦、之後的走向、正在變動的爻、陽爻（穩定））並補一句說明；經文原文直接顯示、不用收合
- [x] 10.5 解卦內容擴充：每卦新增日常樣子、五個生活面向、可以運用、留意的習慣與想一想（`hex_read_more`，併入 `content/fixed/hexagram.json`，dry-run 通過）
- [x] 10.6 重新匯入擴充後的 `content/fixed/hexagram.json`（448 筆已更新）
- [x] 10.7 每爻的白話仍只有一句簡述與建議，是否再擴充，待 user 看過畫面後決定
- [x] 10.8 「一次擲完」改為「自動擲完」：逐爻各跑一次擲錢動畫，不直接跳到結果
- [x] 10.9 解讀（報告）頁版型與其他報告一致：新增 `components/hexagram/Reading.vue`，用同樣的 outlined 卡片與標題（你的卦／概覽／日常的樣子／正在變動的爻／成長與反思／給你的建議／經文原文）、引言框、優勢與留意的小卡；經文原文為一般段落；擲錢區只留在 `HexagramPanel.vue`
- [x] 10.10 正在變動的爻改以強調色呈現（兩個卦的同位置都上色），不用圈叉；解讀頁新增「這一卦是怎麼擲出來的」逐爻列出三枚銅錢的正反、合計與為何變動；擲錢時每爻的結果也顯示正反與合計
- [x] 10.11 解讀頁卡片標題直接用卦名；你的卦的圖放大、之後的走向縮小；移除擲錢規則的長段說明（逐爻列表保留）
- [x] 10.12 今日運勢頁分成兩個分頁：抽牌卜卦（塔羅、盧恩、易經卦象）與星象與曆法（瑪雅 Kin、星座運勢），分頁記在網址 `tab`，返回時回到原分頁
- [x] 10.13 「這一卦是怎麼擲出來的」改為由上爻到初爻（與圖的順序一致）
- [x] 10.14 你的卦與之後的走向改回同樣大小，中間以直線分隔並在線上標實心箭頭；手機版改為上下排列，分隔線橫向
- [x] 10.15 一個卦的呈現統一為小卡片（`components/hexagram/Unit.vue`）：卦序、卦名、上下卦與六爻圖，你的卦與之後的走向用同一個元件
- [x] 10.16 兩個卦之間移除分隔線，只保留實心箭頭（手機版箭頭朝下）
- [x] 10.17 修正解讀頁被誤刪的樣式（逐爻說明、引言框等），外層卡片標題由卦名改為「卦象」
- [x] 10.18 「日常的樣子」的五個面向改為小卡片（與其他報告的深層動機卡片一致）
- [x] 10.19 「成長與反思」改為其他報告「想一想」的格式：三張帶圖示的小卡片（可以發揮的地方、一個值得觀察的習慣、想一想）
- [x] 10.20 「之後的走向」補上變卦自己的解讀：`changed` 改帶變卦的完整白話內容（取代只帶標題），畫面一爻變動或多爻變動都顯示這張卡（摘要、日常樣子、到時可以留意的地方、可以先做的準備）
- [x] 10.21 移除解讀頁的「這一卦是怎麼擲出來的」逐爻說明（連同未再使用的 `lineRows`、`lineReason`）；「正在變動的爻」與「之後的走向」併入「卦象」卡片；擲錢過程中每爻的正反與合計訊息保留
- [x] 10.22 今日運勢頁與首頁的卦象卡片：大字顯示第幾卦，主標為本卦名稱，之後的走向與變動放在副標
- [x] 10.23 瑪雅 Kin 改為開啟即揭曉：頁面、Kin 面板與首頁自動呼叫揭曉，移除「揭曉今日 Kin」按鈕，入口改為「讀」的樣式（每日更新），首頁不再計入待辦（delta spec：maya-kin）
- [x] 10.24 卦象解讀：「概覽」移到最上方；本卦標題改為「旅卦：…」（重新匯入 64 筆）；之後的走向補上變卦完整的解讀（優勢與可留意之處、生活各面向、成長與反思、建議與經文原文），新增 `components/hexagram/Facets.vue`
- [x] 10.25 重新編排解讀：先呈現本卦與它完整的解讀，再呈現變動之後的卦與同樣完整的解讀；新增 `components/hexagram/Chapter.vue` 同時用於兩章，移除 `Facets.vue`，兩章之間以向下的實心箭頭連接
- [x] 10.26 今日運勢頁的卦象卡片以六爻圖像呈現（變動的爻為橘色），取代大字的卦序，卦序放進副標「第 56 卦」
- [x] 10.27 正在變動的爻卡片分為「解讀」與「建議」兩段並加標籤
- [x] 10.28 重寫 384 條爻的白話為「解讀」與「建議」：1 至 64 卦已全部寫入 `content/fixed/hexagram.json`（dry-run 通過）；34 至 58 卦偏貼近爻辭，深度不如 1 至 33 卦，待使用者審過；尚未匯入 Firestore
