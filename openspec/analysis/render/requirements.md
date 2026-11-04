# Requirements（AI 多維度人格探索 App）

> 來源：`ai_personality_app_plan.md` + `openspec/changes/add-daily-tarot-draw` + user 補充（Nuxt / Vue / Vuetify / Vite、Vercel、Firestore、Google 登入、點數制、人類圖）
> 真相檔：`openspec/analysis/requirements.yaml`、`context.yaml`（本檔由 yaml 產生）
> 更新：2026-10-27（新增「此刻／今日」類：FR-044 至 FR-055、NFR-018 至 NFR-022）
> 更新：2026-11-05（AI 報告合併：新增 FR-085 至 FR-088、NFR-031 至 NFR-032；FR-077、FR-078 已廢止；change：ai-analysis-question-history）
> 更新：2026-11-02（新增「自我分析擴充」：FR-056 至 FR-073、NFR-023 至 NFR-028；另補進既有的報告架構：FR-074 至 FR-084、NFR-029 至 NFR-030；change：expand-self-analysis-dimensions）

MVP = 計畫書 §15 第一版範圍（含 user 補充）。Phase 對應 §11 Phase 1-5；Phase 6 為 2026-10-27 新增的「此刻／今日」類（不屬原計畫書範圍）。

## Functional Requirements

| ID | 標題 | 描述 | Priority | Phase | MVP | Context |
|---|---|---|---|---|---|---|
| FR-001 | Google 登入 | 系統 SHALL 允許使用者以 Google 帳號登入，使儲存的測驗紀錄與報告歸屬於該帳號；MUST NOT 要求登入才能完成測驗與查看固定報告。 | must | 1 | ✔ | CTX-ACTOR-001, CTX-EXT-006, CTX-ASM-004 |
| FR-002 | 生日、星座與選填血型／MBTI／出生時間地點 | 系統 SHALL 要求使用者提供生日與星座（皆必填，星座可由生日帶入）；血型（A/B/O/AB/不知道）、MBTI、出生時間與出生地點為選填（出生地點從預設城市清單選擇，含經緯度與時區）。血型選「不知道」時 MUST 不計入分析。 | must | 1 | ✔ | CTX-ACTOR-001, CTX-ASM-005, CTX-ASM-006, CTX-CON-006 |
| FR-003 | 測驗清單與題目取得 | 系統 SHALL 提供可用測驗清單，並依測驗 ID 回傳含版本的題目與選項。 | must | 1 | ✔ | CTX-ACTOR-001 |
| FR-004 | 16 型人格（MBTI）測驗作答與評分（選填） | 系統 SHALL 允許使用者（含未登入訪客）選擇完成 16 型人格（MBTI）測驗（對外名稱用「16 型人格」、題目自行撰寫，見 CTX-CON-015），並 MUST 由後端依評分規則計算 16 型結果；此計算與 summary 內容皆為事先定義，MUST NOT 呼叫 AI、不消耗 token。 | must | 1 | ✔ | CTX-ACTOR-001, CTX-CON-001, CTX-CON-007, CTX-ASM-008 |
| FR-005 | 測驗紀錄保存 | 系統 SHALL 在使用者已登入時，將每次測驗的版本、起訖時間、分數、結果與每題作答保存至 Firebase，並允許使用者查看自己的測驗歷史；測驗結果保存 3 個月（見 FR-033）。 | must | 2 | ✔ | CTX-ACTOR-001, CTX-ACTOR-002, CTX-CON-006, CTX-EXT-005, CTX-EXT-006 |
| FR-006 | 多維度分析報告 查詢（已廢止，由 FR-085 取代） | 系統 SHALL 在已登入使用者扣點後，依「星座+MBTI」或「星座+MBTI+血型」組合從 Firestore 查詢對應的事先算好的多維度分析報告；血型「不知道」時 MUST 使用星座+MBTI 組合。查詢 MUST NOT 呼叫 AI API。 | must | 1 | ✔ | CTX-ACTOR-001, CTX-CON-005, CTX-CON-007, CTX-EXT-005, CTX-ASM-005, CTX-ASM-010, CTX-CON-014 |
| FR-007 | 固定報告內容呈現 | 系統 SHALL 在結果頁顯示類型名稱、摘要、優勢、盲點、感情/工作/溝通風格、成長建議與娛樂性免責說明。 | must | 1 | ✔ | CTX-ACTOR-001, CTX-CON-001 |
| FR-008 | 固定報告內容版本管理 | 系統 SHALL 為每份固定報告記錄 content_version，並 SHALL 支援在不重新部署後端的情況下更新內容；組合 (zodiac, blood_type, mbti_type) MUST 唯一。 | must | 2 | ✔ | CTX-ACTOR-003, CTX-CON-005, CTX-CON-004, CTX-EXT-005 |
| FR-009 | 多維度分析報告 組合覆蓋完整性 | 系統 SHALL 使所有合法組合都有可查詢的多維度分析報告：星座×MBTI 192 種，以及星座×MBTI×血型 768 種（共 960 種），且組合與內容 MUST 存放於 Firestore。 | must | 2 | ✔ | CTX-ACTOR-003, CTX-ASM-005, CTX-EXT-005, CTX-CON-005 |
| FR-010 | 結果分享卡 | 系統 SHALL 依固定結果產生可分享的結果卡，並提供分享入口。 | should | 2 | ✔ | CTX-ACTOR-001, CTX-EXT-003 |
| FR-011 | 點數購買流程 | 系統 SHALL 在點數不足時引導使用者購買點數，說明點數用途、價格與不退款，要求使用者勾選「同意立即提供數位內容、放棄解約」並記錄同意時間與條款版本，之後 SHALL 建立付款流程。 | must | 4 | ✔ | CTX-ACTOR-001, CTX-EXT-001, CTX-ASM-002, CTX-CON-014, CTX-CON-011 |
| FR-012 | 付款事件處理 | 系統 SHALL 接收付款服務 webhook，MUST 驗證簽章，並 MUST 以冪等方式處理重複事件後為使用者加點。 | must | 4 | ✔ | CTX-EXT-001, CTX-CON-003, CTX-CON-014 |
| FR-013 | 付款失敗處理與無退款告知 | 系統 SHALL 處理付款失敗狀態並據此更新使用者權限；系統不提供退款機制，付款前 SHALL 明確告知，並 SHALL 要求使用者勾選「同意立即提供數位內容、放棄解約」且記錄同意時間與條款版本。 | should | 4 | ✔ | CTX-EXT-001, CTX-ACTOR-004, CTX-CON-011 |
| FR-014 | 後端點數與權限驗證 | 系統 SHALL 在後端驗證使用者已登入且點數餘額足夠後才允許取得 summary 或生成／重新生成詳細分析，並 SHALL 提供查詢目前點數餘額的介面。 | must | 4 | ✔ | CTX-ACTOR-002, CTX-CON-003, CTX-CON-014 |
| FR-015 | 測驗資料正規化（已廢止，由 FR-085、FR-086 取代） | 系統 SHALL 將使用者的標籤、測驗分數、實際答案與作答紀錄整理為可供 AI 使用的正規化分析資料，並保留資料版本。 | must | 3 | ✔ | CTX-ACTOR-002, CTX-CON-009 |
| FR-016 | AI 深度報告生成（已廢止，由 FR-085、FR-086 取代） | 系統 SHALL 在已具備星座與 MBTI 結果（血型、人類圖選填）、點數餘額足夠（5 點）並扣點後呼叫 AI 供應商，依正規化資料生成包含八個建議章節（概況、行為模式、交叉觀察、優勢與盲點、感情與溝通、工作與決策、成長行動、依據與限制）的報告。 | must | 3 | ✔ | CTX-ACTOR-002, CTX-EXT-002, CTX-CON-009 |
| FR-017 | AI 報告依據與不確定性標示 | 系統 SHALL 使 AI 報告對重要結論附上資料依據、區分「測驗直接觀察」與「AI 推測」，在測驗結果衝突時指出差異與可能解釋，並對證據不足處使用不確定語氣。 | must | 3 | ✔ | CTX-CON-001, CTX-CON-009, CTX-EXT-002 |
| FR-018 | AI 報告保存與重複查看（已廢止，由 FR-079、FR-080 取代） | 系統 SHALL 保存已生成報告及其模型名稱、提示詞版本、輸入資料版本與生成時間；再次查看時 MUST 讀取已保存內容，MUST NOT 重新呼叫 AI。 | must | 3 | ✔ | CTX-ACTOR-002, CTX-CON-007 |
| FR-019 | 生成狀態與失敗處理 | 系統 SHALL 記錄報告生成狀態，並在逾時或失敗時依重試策略處理且向使用者回報明確錯誤；生成失敗 MUST NOT 造成點數被扣除（已扣者須返還），也不得無故重複扣點。 | must | 3 | ✔ | CTX-ACTOR-002, CTX-EXT-002, CTX-CON-007, CTX-CON-014 |
| FR-020 | 詳細分析重新生成（已廢止，由 FR-085 取代） | 系統 SHALL 在使用者要求重新分析或新增資料時重新生成詳細分析；若該會員已生成過該組合的詳細分析，重新生成 MUST 扣 5 點，且 MUST 保留舊報告。 | should | 4 | ✔ | CTX-ACTOR-002, CTX-CON-007, CTX-CON-014, CTX-CON-011 |
| FR-021 | AI 報告存取控制 | 系統 SHALL 在每個報告 API 驗證請求者為該報告的擁有者，否則 MUST 拒絕存取。 | must | 3 | ✔ | CTX-ACTOR-002, CTX-CON-003, CTX-CON-006 |
| FR-022 | AI 用量記錄與限制 | 系統 SHALL 記錄每次 AI 呼叫的模型、輸入/輸出 Token 與預估成本，並 SHALL 限制生成頻率、單次 Token 上限與使用額度。 | must | 3 | ✔ | CTX-ACTOR-004, CTX-CON-007 |
| FR-023 | 資料刪除與帳號刪除 | 系統 SHALL 允許使用者刪除自己的測驗資料與 AI 報告，並 SHALL 允許使用者刪除帳號；刪除帳號時 MUST 移除該使用者的全部紀錄（個人資料、測驗結果、summary、詳細分析、人類圖、點數、付款），僅保留贈點紀錄；同一 Google 帳號再次登入 MUST 視為全新帳號，不繼承任何歷史紀錄；隱私政策 MUST 載明保留的贈點紀錄。 | must | 1 | ✔ | CTX-ACTOR-001, CTX-ACTOR-002, CTX-CON-006, CTX-CON-012, CTX-EXT-005, CTX-EXT-006, CTX-ASM-011 |
| FR-024 | 作答時間蒐集告知 | 系統 SHALL 僅在已告知使用者的前提下蒐集每題作答時間（response_time_ms）。 | should | 3 | ✘ | CTX-ACTOR-001, CTX-CON-006 |
| FR-025 | 個人中心 | 系統 SHALL 提供個人中心，顯示測驗歷史、報告歷史、付費狀態與資料管理入口。 | should | 2 | ✔ | CTX-ACTOR-001, CTX-ACTOR-002 |
| FR-026 | 產品指標每日計數 | 系統 SHALL 在伺服器端以每日計數彙總測驗完成、summary 取得、報告生成成功／失敗、付款完成與分享卡產生，計數 MUST NOT 含個人資料。 | should | 3 | ✘ | CTX-ACTOR-004 |
| FR-027 | 智力／認知測驗 | 系統 SHALL 提供智力／認知測驗，獨立呈現正確率、題型表現、作答時間與題目難度，且 MUST NOT 宣稱為正式 IQ。 | could | 5 | ✘ | CTX-ACTOR-001, CTX-CON-002, CTX-CON-008 |
| FR-028 | 延伸專題測驗 | 系統 SHALL 以既有測驗框架新增感情、職涯、溝通等專題測驗，並可納入 AI 報告。 | could | 5 | ✘ | CTX-ACTOR-001, CTX-CON-008 |
| FR-029 | 會員訂閱 | 系統 SHALL 提供月/年訂閱方案，含每期 AI 報告額度與更多測驗類型。 | could | 5 | ✘ | CTX-ACTOR-002, CTX-EXT-001, CTX-ASM-002, CTX-CON-008 |
| FR-030 | 歷史結果比較 | 系統 SHALL 讓付費使用者比較不同時間的測驗結果與報告。 | could | 5 | ✘ | CTX-ACTOR-002, CTX-CON-008 |
| FR-031 | AI 對話式人格探索 | 系統 MAY 提供 AI 對話式人格探索作為會員功能（是否推出待評估）。 | could | 5 | ✘ | CTX-ACTOR-002, CTX-EXT-002, CTX-CON-008 |
| FR-032 | 訪客使用與登入後儲存 | 系統 SHALL 允許未登入訪客完成測驗並查看結果；訪客當次結果 SHALL 以 session id 暫存於 Firestore，TTL 為 1 天，且 MUST NOT 與任何帳號關聯或永久保存；訪客當次選擇登入時，SHALL 依 session id 將暫存結果存入其帳號；app 內 MUST 明確提示「未登入將不保留結果」並引導 Google 登入。已登入使用者的結果 SHALL 保留。使用點數（取得 summary 或詳細分析）前 MUST 已登入。 | must | 1 | ✔ | CTX-ACTOR-001, CTX-EXT-006, CTX-EXT-005, CTX-ASM-004, CTX-ASM-008 |
| FR-033 | 資料到期刪除 | 系統 SHALL 在會員的測驗作答與結果、多維度分析報告、MBTI 欄位、人類圖結果、每日抽取紀錄與即時星象報告滿 3 個月後、詳細分析滿 6 個月後（各以產生時間點起算）自動刪除；付款紀錄 MUST NOT 因保留期限被刪除。 | must | 2 | ✔ | CTX-CON-012, CTX-CON-006, CTX-EXT-005, CTX-ACTOR-001, CTX-ACTOR-002, CTX-CON-017, CTX-CON-018 |
| FR-034 | 報告快照下載 PDF | 系統 SHALL 讓報告擁有者在快照到期前將單維度或多維度報告快照下載為 PDF；PDF MUST 讀取已保存的快照（含已有的 AI 分析），MUST NOT 重新呼叫 AI 或重新計算；每次下載扣 1 點，報告曾下載過者系統 MUST 提醒並經使用者確認後才重複扣點與下載；僅報告擁有者可下載，失敗 MUST 返還已扣點，重複請求 MUST 以冪等鍵只處理一次。 | should | 4 | ✘ | CTX-ACTOR-002, CTX-CON-014, CTX-CON-029, CTX-ASM-028 |
| FR-035 | 資料到期前通知 | 系統 SHALL 以 email 在會員的測驗結果、多維度分析報告、人類圖與詳細分析到期前 14 天與 3 天各通知一次；同一使用者同時有多筆到期時合併為一封。 | should | 5 | ✘ | CTX-ACTOR-001, CTX-CON-012, CTX-EXT-007 |
| FR-036 | 人類圖計算 | 系統 SHALL 在使用者提供出生時間與出生地點時計算人類圖（固定結果，MUST NOT 呼叫 AI），結果包含 5 種能量類型之一、9 大能量中心、12 種人生角色組合之一、內在權威、策略、定義與通道、64 個閘門；未提供出生時間與地點時 MUST NOT 產生人類圖；已登入使用者計算出的人類圖結果 SHALL 儲存於其帳號（訪客僅暫存於 session，TTL 1 天），且 SHALL 可單獨檢視且不扣點，不需先生成詳細分析。人類圖納入詳細分析的輸入，不屬多維度分析報告 的組合。 | must | 3 | ✔ | CTX-ACTOR-001, CTX-ASM-006, CTX-CON-007 |
| FR-037 | 點數帳戶與註冊贈點 | 系統 SHALL 為每個新建立的帳號建立點數帳戶，並 SHALL 贈送 3 點；贈點 MUST 每帳號僅發放一次；同一 Google 帳號於上次贈點後 3 個月內刪帳號再註冊 MUST NOT 再次發放（以贈點紀錄判斷）；贈點紀錄僅用於避免重複贈點，不作他用。 | must | 3 | ✔ | CTX-ACTOR-001, CTX-CON-014, CTX-EXT-006, CTX-EXT-005 |
| FR-038 | 點數扣抵 | 系統 SHALL 於會員首次取得某組多維度分析報告 時扣 1 點、生成詳細分析時扣 5 點、下載報告書時每次扣 1 點（重複下載再扣）；餘額不足時 MUST 拒絕並引導購點；扣點與結果交付 MUST 一致；訪客 MUST NOT 可取得多維度分析報告。 | must | 3 | ✔ | CTX-ACTOR-001, CTX-ACTOR-002, CTX-CON-014, CTX-ASM-010 |
| FR-039 | 點數異動紀錄 | 系統 SHALL 記錄每次點數發放、購買、扣除與返還，使用者可查看自己的點數紀錄。 | must | 3 | ✔ | CTX-ACTOR-002, CTX-CON-014 |
| FR-040 | 單項免費結果 | 系統 SHALL 允許使用者（含訪客）不扣點取得單項結果：依生日取得星座結果、依血型取得血型分析、完成 MBTI 測驗取得 MBTI 結果；結果皆為固定內容，MUST NOT 呼叫 AI，且 MUST NOT 儲存（每次重新取得）。 | must | 1 | ✔ | CTX-ACTOR-001, CTX-CON-007, CTX-CON-014, CTX-EXT-005, CTX-ASM-010 |
| FR-041 | 避免重複扣點（已廢止，由 FR-085、FR-080 取代） | 系統 SHALL 對同一會員已生成過的多維度分析報告 組合直接回傳已存結果且 MUST NOT 再次扣點；重複點擊或並行請求 MUST NOT 造成重複扣點。 | must | 3 | ✔ | CTX-ACTOR-002, CTX-CON-014, CTX-EXT-005 |
| FR-042 | 點數有效期 | 系統 SHALL 為點數設定有效期：購買的點數為無限期，贈點有效期 90 天；過期點數 MUST NOT 可用於扣抵；扣抵順序為先到期先扣、無限期批次最後。 | must | 3 | ✔ | CTX-ACTOR-001, CTX-ACTOR-002, CTX-CON-014 |
| FR-043 | 付款紀錄保存 | 系統 SHALL 在帳號存續期間永久保存付款紀錄，不受測驗結果保留期限影響；使用者刪除帳號時 SHALL 一併移除付款紀錄。 | must | 4 | ✔ | CTX-CON-012, CTX-EXT-001, CTX-ACTOR-004 |
| FR-044 | 「此刻／今日」類入口 | 系統 SHALL 在首頁提供與維度卡分開的「此刻／今日」區塊，收納每日塔羅、今日盧恩、今日瑪雅 Kin 與即時星象；區塊內各項 MUST 標示其結果隨時間變動，且依各項規則呈現未登入、可抽取／已抽取、需付費與資料不足等狀態；未登入時 MUST NOT 載入任何抽取結果內容。 | should | 6 | ✘ | CTX-ACTOR-001, CTX-ACTOR-002, CTX-CON-016, CTX-ASM-004 |
| FR-045 | 每日塔羅抽牌 | 系統 SHALL 允許已登入使用者每台北日期翻一張大阿爾克那（22 張，含正逆位）；同一帳號同一日 MUST 得到同一結果（跨裝置、重試、並行皆同），第一次翻牌 SHALL 寫入當日紀錄；結果為事先寫好的固定內容（共 44 筆），MUST NOT 呼叫 AI 且不扣點；內容未發佈時 MUST NOT 寫入紀錄。 | must | 6 | ✘ | CTX-ACTOR-001, CTX-CON-016, CTX-CON-018, CTX-CON-007, CTX-EXT-005, CTX-EXT-006 |
| FR-046 | 每日盧恩抽符 | 系統 SHALL 允許已登入使用者每台北日期抽一枚 Elder Futhark 盧恩符文（24 枚）；15 枚方向可辨識的符文 SHALL 可抽到正位或逆位，9 枚上下旋轉 180° 後外觀不變的符文（Gebo、Hagalaz、Nauthiz、Isa、Jera、Eihwaz、Sowilo、Ingwaz、Dagaz）MUST 僅有正位；同一帳號同一日 MUST 得到同一結果，第一次抽取 SHALL 寫入當日紀錄；結果為事先寫好的固定內容，MUST NOT 呼叫 AI 且不扣點。 | should | 6 | ✘ | CTX-ACTOR-001, CTX-CON-016, CTX-CON-018, CTX-CON-019, CTX-ASM-016 |
| FR-047 | 今日瑪雅 Kin | 系統 SHALL 允許已登入使用者每台北日期「計算」一次今日瑪雅 Kin（圖騰與調性）；計算即解鎖當日 Kin 的查看，MUST NOT 扣點；解鎖後當日內 MUST 可不限次數查看；同一帳號同一日重複計算 MUST 回傳既有結果；未登入者 MUST NOT 取得內容；結果 MUST 由日期唯一決定並顯示事先寫好的固定內容（260 個 Kin 各一筆），MUST NOT 呼叫 AI。 | should | 6 | ✘ | CTX-ACTOR-001, CTX-CON-016, CTX-CON-020, CTX-ASM-015, CTX-ASM-017, CTX-EXT-006 |
| FR-048 | 生日瑪雅 Kin（命理系統） | 系統 SHALL 在命理系統中提供依使用者生日計算的瑪雅 Kin，作為與星座、生命靈數並列的常駐分析，顯示事先寫好的固定內容（260 個 Kin 各一筆，與今日 Kin 的內容分開撰寫）；MUST NOT 呼叫 AI。 | should | 6 | ✘ | CTX-ACTOR-001, CTX-CON-020, CTX-CON-007, CTX-ASM-015, CTX-ASM-006 |
| FR-049 | 瑪雅 Kin 計算一致性 | 系統 SHALL 以 Dreamspell 曆法（跳過 2/29）與同一套演算法計算今日 Kin 與生日 Kin；同一日期在任何入口 MUST 得到相同的 Kin；生日或查詢日期為 2/29 時，MUST 沿用 2/28 的 Kin。 | must | 6 | ✘ | CTX-CON-020, CTX-ASM-015 |
| FR-050 | 行運盤計算 | 系統 SHALL 在伺服器端以固定演算法計算台北當日 00:00（UTC+8）時日、月、水、金、火、木、土、天王、海王、冥王十顆天體的黃經位置（行運盤），以及行運盤對本命盤的相位關係；同一台北日期的行運盤 MUST 唯一；此計算 MUST NOT 呼叫 AI，結果僅供即時星象報告作為輸入。 | must | 6 | ✘ | CTX-EXT-008, CTX-CON-007, CTX-ASM-014 |
| FR-051 | 即時星象報告生成 | 系統 SHALL 在已登入使用者備齊出生日期、時間與城市、點數餘額足夠並扣點後，呼叫 AI 供應商，依本命盤與當下行運盤的合併資料生成即時星象報告；報告 MUST 區分資料依據與 AI 推測、標示計算所用時刻為當日 00:00（UTC+8），並依 CTX-CON-016 不預測具體事件。生成失敗 MUST 返還點數，沿用 FR-019 的規則。 | must | 6 | ✘ | CTX-ACTOR-002, CTX-EXT-002, CTX-CON-017, CTX-CON-016, CTX-CON-014, CTX-ASM-018 |
| FR-052 | 即時星象報告同日不重複扣點 | 系統 SHALL 對同一帳號、同一台北日期、同一份本命資料版本的即時星象報告直接回傳已存結果，MUST NOT 再次扣點；重複點擊或並行請求 MUST NOT 造成重複扣點。 | must | 6 | ✘ | CTX-ACTOR-002, CTX-CON-014, CTX-EXT-005, CTX-ASM-013 |
| FR-053 | 即時星象報告保存與存取 | 系統 SHALL 保存已生成的即時星象報告（含模型名稱、提示詞版本、輸入資料版本、計算所用時刻與生成時間），保存 3 個月後自動刪除；再次查看 MUST 讀取已保存內容且 MUST NOT 重新呼叫 AI；僅報告擁有者可存取，刪除帳號時 SHALL 一併移除。 | must | 6 | ✘ | CTX-ACTOR-002, CTX-CON-017, CTX-CON-012, CTX-EXT-005 |
| FR-054 | 即時星象報告匯出 PDF | 系統 SHALL 允許報告擁有者在報告到期前將即時星象報告匯出為 PDF；匯出 MUST 讀取已保存內容，MUST NOT 重新呼叫 AI；僅報告擁有者可匯出。 | should | 6 | ✘ | CTX-ACTOR-002, CTX-CON-017, CTX-CON-014, CTX-ASM-019 |
| FR-055 | 本命盤加入天王、海王、冥王 | 系統 SHALL 在本命盤計算結果中，於日、月、水、金、火、木、土與上升之外，加入天王、海王、冥王的星座與度數；既有的本命盤輸出與畫面 MUST 同步呈現，且既有七顆天體與上升的結果 MUST NOT 改變。 | must | 6 | ✘ | CTX-EXT-008, CTX-ASM-014, CTX-ASM-006 |
| FR-056 | 自我分析的定義與登錄表 | 系統 SHALL 以登錄表列出所有自我分析，每個分析有一份定義（識別碼、版本、題目或選項、純函式計分、結果內容金鑰）；新增分析 MUST 只需新增定義並登錄，不需要新的 service、repository 或通用路由；識別碼不在登錄表中的請求 MUST 回傳 404。 | must | 7 | ✘ | CTX-CON-021, CTX-ACTOR-001 |
| FR-057 | 自我分析的伺服器端驗證與計分 | 系統 MUST 在伺服器端驗證自我分析的作答並計分，MUST NOT 信任前端的分數；量表題 MUST 每題恰好一次、值在量表範圍內、不含未知題目；挑選題 MUST 只含清單內項目、數量符合規定、不重複；不合法 MUST 回傳 400 並指出問題；計分 MUST 為固定規則的純函式、不呼叫 AI。 | must | 7 | ✘ | CTX-CON-021, CTX-CON-003, CTX-CON-007 |
| FR-058 | 自我分析的固定內容 ASSESSMENT | 系統 SHALL 以固定內容類型 ASSESSMENT 儲存各分析的結果文字，金鑰以分析識別碼開頭、合法金鑰由登錄表決定；內容 MUST 事先撰寫、不呼叫 AI；計分後需要顯示的內容尚未發佈時 MUST 回 404 且不保存結果；固定內容覆蓋檢查 MUST 納入所有已登錄分析的金鑰。 | must | 7 | ✘ | CTX-CON-021, CTX-CON-007, CTX-CON-005 |
| FR-059 | 自我分析結果的保存、到期與刪除 | 系統 SHALL 在已登入使用者完成自我分析時，於 users/{uid}/assessmentAttempts 新增一筆紀錄（分析識別碼、版本、作答、結果、完成時間、到期時間）並保存 3 個月、到期後自動清除、刪除帳號與刪除測驗結果時一併刪除；訪客完成時 MUST NOT 寫入任何文件，結果只留在瀏覽器當次 session，登入後 SHALL 可選擇儲存。 | must | 7 | ✘ | CTX-CON-023, CTX-CON-012, CTX-EXT-005, CTX-ACTOR-001 |
| FR-060 | 通用的測驗頁與結果頁 | 系統 SHALL 提供 /assessment/{id} 測驗頁（量表題：分頁、進度、已作答與未作答的區別、全部作答後才可送出、作答暫存於 sessionStorage；挑選題：挑選與排序）與 /analysis/{id} 結果頁（固定顯示「怎麼看這份結果」說明與免責聲明，以及該分析自己的結果區塊）。 | must | 7 | ✘ | CTX-CON-021, CTX-CON-024, CTX-ACTOR-001 |
| FR-061 | 自我分析的入口與旗標 | 系統 SHALL 依登錄表在首頁與 /self-reports 為每個分析顯示卡片，每個分析各有入口旗標；旗標關閉時卡片 MUST NOT 出現，頁面本身仍可由網址進入；已有未到期結果時卡片亮起並連到結果頁。 | should | 7 | ✘ | CTX-CON-021, CTX-ACTOR-001 |
| FR-062 | 題目為自行設計並註明未經驗證 | 所有分析的題目 MUST 為自行設計，MUST NOT 翻譯、改寫或使用任何既有量表的題目；每個測驗頁與結果頁 MUST 固定註明「這些題目是自行設計的自我探索題目，沒有經過信度與效度驗證，不是任何既有量表」；版本識別 MUST 帶 ref 標記；MUST NOT 以百分位、常模或「精準」的說法呈現結果。 | must | 7 | ✘ | CTX-CON-022, CTX-CON-015, CTX-CON-001 |
| FR-063 | 九型人格 | 系統 SHALL 提供九型人格測驗（九個類型各有同數量的題目、5 點量表），計算九型各自的分數（0–100），最高分者為最突出的類型、側翼取相鄰兩型中分數較高者；最高分與次高分差距小於 10 分時 MUST 並列這兩型而不單獨斷定一型，MUST NOT 稱使用者「就是」某一型；每型有固定內容（核心動機、核心恐懼、壓力下與放鬆時的慣性、成長方向、可以留意的地方），聚焦「為什麼會這樣做」並與 MBTI 互補。 | should | 7 | ✘ | CTX-CON-021, CTX-CON-024, CTX-ASM-020, CTX-ASM-021 |
| FR-064 | HEXACO 人格模型 | 系統 SHALL 提供 HEXACO 測驗（誠實謙遜、情緒性、外向性、宜人性、盡責性、開放性六個維度各有同數量的題目、含反向題、5 點量表），伺服器端計分為各維度 0–100 與低（< 40）、中（40–60）、高（> 60）；結果頁 SHALL 說明六個維度各自的意思並特別說明「誠實謙遜」，MUST NOT 把低分描述為不誠實或品格缺陷，MUST NOT 引用大五人格結果；HEXACO 發佈並開啟入口後 SHALL 取代大五人格測驗。 | must | 7 | ✘ | CTX-CON-021, CTX-CON-024, CTX-CON-025, CTX-ASM-020 |
| FR-065 | VIA 品格優勢 | 系統 SHALL 提供品格優勢測驗（24 種優勢各有同數量的題目、5 點量表），計算 24 項分數並排序、取最突出的前 5 項，分數相同時 MUST 以固定規則決定先後使同樣作答永遠得到同樣結果；每項優勢有固定內容（是什麼、日常表現、用得太過時的樣子、如何發揮）；結果頁 MUST 以「我有哪些值得發揮的內在優勢」為主軸，MUST NOT 把排在後面的優勢描述成缺點。 | should | 7 | ✘ | CTX-CON-021, CTX-CON-024, CTX-ASM-020 |
| FR-066 | 霍蘭德職業興趣（RIASEC） | 系統 SHALL 提供職業興趣測驗（六種類型各有同數量的自行設計題目、以喜歡程度作答），計算實作、研究、藝術、社會、企業、事務六型分數並取前三名組成三碼代碼（並列時以固定規則決定）；結果內容含六型特徵、偏好的工作環境與三碼組合的描述；結果頁 MUST 明確寫出「這是興趣，不是能力或適性的判定」，MUST NOT 列出「你適合當某某職業」的斷言。 | should | 7 | ✘ | CTX-CON-021, CTX-CON-024, CTX-CON-022, CTX-ASM-020 |
| FR-067 | 情緒智商 | 系統 SHALL 提供情緒智商測驗（情緒覺察、情緒調節、同理心、人際情緒處理四個面向各有同數量的題目、含反向題），計算四面向各自的分數（0–100）與等級；MUST NOT 提供單一的「智商」總分，MUST NOT 使用百分位；每面向每等級有固定內容（現況、優勢、留意、可以練習的方向），並強調情緒能力可以練習而不是固定的。 | should | 7 | ✘ | CTX-CON-021, CTX-CON-024, CTX-CON-002, CTX-ASM-020 |
| FR-068 | 依附風格 | 系統 SHALL 提供依附風格測驗，以「靠近的焦慮」與「親密的迴避」兩個連續向度各自的題目計分（各 0–100 與低、中、高），依兩個向度的高低對應到四個象限的中性描述，任一向度為中時 MUST 說明結果落在兩個象限之間；MUST NOT 貼固定標籤、MUST NOT 使用診斷用語或提及臨床診斷；結果頁 MUST 固定說明依附模式會隨關係與經驗改變、不是診斷也不是固定標籤。 | should | 7 | ✘ | CTX-CON-021, CTX-CON-024, CTX-ASM-020, CTX-ASM-023 |
| FR-069 | 核心價值觀 | 系統 SHALL 提供約 40 項的價值清單，使用者從中挑選固定數量並把最重要的幾項排出順序；系統 MUST 驗證項目都在清單內、數量符合規定、沒有重複、排序只含已挑選的項目；結果列出最重要的幾項價值並附固定說明（可能代表什麼、在選擇中如何出現、與其他價值拉扯時可以怎麼想），以「什麼對我最重要？我為什麼做出某些選擇？」為主軸，MUST NOT 評價價值的好壞或高下。 | should | 7 | ✘ | CTX-CON-021, CTX-CON-024, CTX-ASM-020, CTX-ASM-023 |
| FR-070 | 需求與動機 | 系統 SHALL 提供需求與動機測驗，依自我決定理論的三項基本心理需求（自主、勝任、關係）各有同數量的題目，計算三項各自的分數（0–100）與等級（分數代表目前需求被滿足的感受）；每項每等級有固定內容（什麼情境容易讓動力上升、哪些環境可能讓動力下降、可以怎麼調整）；偏低的需求 SHALL 列為「值得留意」，MUST NOT 把低分描述為使用者的缺陷。 | should | 7 | ✘ | CTX-CON-021, CTX-CON-024, CTX-ASM-020 |
| FR-071 | 移除大五人格測驗 | HEXACO 發佈並確認可用後，系統 SHALL 把現有的大五人格測驗從產品中移除：關閉入口、刪除所有使用者的 bigFiveAttempts 與 Firestore 的 BIGFIVE 固定內容、移除頁面與 API 與 service 與常數與計分工具、移除到期清除與刪帳號與索引例外中的 bigFiveAttempts 處理、移除 useExploration 與入口卡片中的大五處理、更新固定內容覆蓋預期總數、以 REMOVED 需求移除主 spec big-five-test；MUST 先清資料再移除處理程式，刪除正式資料前 MUST 再向使用者確認。 | must | 7 | ✘ | CTX-CON-025, CTX-CON-012, CTX-EXT-005, CTX-ASM-024 |
| FR-072 | 每個自我分析都能在多維度分析中被選擇 | 系統 SHALL 讓登錄表中的每一種自我分析都能在多維度分析中與既有系統任意組合（至少兩個系統），由 AI 交叉比對；分析定義 MUST 提供報告轉接（事實、解讀、特質術語）、特質映射與基礎點數，缺少任一項 MUST NOT 能登錄；使用者 SHALL 只能選擇自己有未到期結果的分析，沒有結果的顯示不可選並引導去做測驗；選擇後 MUST 以最新一筆未到期結果為輸入；訪客 MUST NOT 取得多維度分析。 | must | 7 | ✘ | CTX-CON-026, CTX-CON-014, CTX-CON-021, CTX-ACTOR-002, CTX-ASM-025 |
| FR-073 | 自我分析在組合中的點數與映射覆蓋 | 自我分析在多維度組合中的點數 SHALL 沿用既有算法（各系統基礎點數加總 × 1.2 無條件捨去、上限 30、至少兩個系統），每個自我分析 MUST 有明確的基礎點數；每個自我分析的特質映射 MUST 通過既有的覆蓋檢查、以「傾向」描述並經審稿後才可納入多維度分析。 | must | 7 | ✘ | CTX-CON-026, CTX-CON-014, CTX-ASM-025 |
| FR-074 | 單維度報告（規則版） | 系統 SHALL 為星座、血型、生命靈數、MBTI、瑪雅 Kin、八字、人類圖等穩定特質系統提供單維度報告，由規則與預寫片段組裝、全部免費、MUST NOT 呼叫 AI、MUST NOT 扣點；報告依固定順序含位置結論、系統的事實與解讀、本系統的歸納、影響面向推測、建議與反思、依據與限制；歸納中每一條推論 MUST 引用系統事實中的具體項目，找不到事實支持的推論 MUST NOT 產生；缺少必要資料（例如出生時間）的區塊 MUST 標示缺少並顯示補填提示，MUST NOT 以猜測值代替。 | must | 7 | ✘ | CTX-CON-027, CTX-CON-007, CTX-CON-009, CTX-ACTOR-001 |
| FR-075 | 影響面向、系統性質標籤與時間性內容標示 | 單維度報告 SHALL 為每個歸納面向展開影響面向推測（時間、對象、生活領域），只顯示有片段的格子，MUST NOT 以其他組合代替；過去的格子 MUST 為假設並附確認問題，使用者的回答 MUST NOT 被儲存；每份報告 SHALL 顯示該系統的性質標籤（MBTI 明標為自製問卷、不等於官方量表）；八字大運與流年、生命靈數流年數等時間性內容 MUST 標示依據的系統與產生日期，其他系統的時間解讀 MUST 標示為依特質的推測。 | must | 7 | ✘ | CTX-CON-027, CTX-CON-028, CTX-CON-016, CTX-CON-015, CTX-ACTOR-001 |
| FR-076 | 狀態系統的精簡報告 | 系統 SHALL 為塔羅、盧恩與星座運勢提供精簡報告，只含位置結論、事實與解讀、建議與反思、依據與限制，MUST NOT 含本系統的歸納與影響面向推測；塔羅與盧恩須已登入且當天已抽才能產生，缺少時回明確的原因；這些每日報告 MUST NOT 寫入快照。 | should | 7 | ✘ | CTX-CON-027, CTX-CON-018, CTX-CON-029, CTX-ACTOR-001 |
| FR-077 | 單維度 AI 進階分析（已廢止，由 FR-085、FR-086 取代） | 系統 SHALL 讓已登入使用者花 1 點取得單維度的 AI 進階分析；扣點 MUST 以冪等鍵防止重複，生成或品質檢查失敗 MUST 退點，點數不足 MUST 拒絕且不呼叫 AI；輸入 MUST 只含事實與規則找出的面向，不含使用者自由文字；輸出每段 MUST 標為 AI 綜合推論並附依據；結果 MUST 寫入快照獨立的 ai 欄位，MUST NOT 改動規則產生的基本內容，再次分析只替換 ai。 | must | 7 | ✘ | CTX-CON-027, CTX-CON-014, CTX-CON-009, CTX-EXT-002, CTX-ACTOR-002 |
| FR-078 | 多維度報告（已廢止，由 FR-085、FR-086、FR-087 取代） | 系統 SHALL 讓已登入使用者把至少兩個穩定特質系統放在同一套特質本體上，由規則組裝成報告並存為快照，再由 AI 針對這個人改寫洞見（AI 解讀已含在價格內）；價格 = 各系統基本價之和 × 1.2 無條件捨去、上限 30 點；請求 MUST 帶 Idempotency-Key，重複請求只回報目前狀態且不重複扣點；回 202 與快照 id，之後輪詢 aiJob 與 ai；缺少資料回 422（PROFILE_REQUIRED、BLOOD_REQUIRED、MBTI_REQUIRED、BIRTH_TIME_REQUIRED、BIRTH_PLACE_REQUIRED）、規則找不到任何洞見回 422（NO_INSIGHTS），皆不扣點；失敗 MUST 退點；訪客 MUST NOT 取得。 | must | 7 | ✘ | CTX-CON-027, CTX-CON-028, CTX-CON-014, CTX-ASM-026, CTX-EXT-002, CTX-ACTOR-002 |
| FR-079 | 報告快照的內容 | 系統 SHALL 為每份已發布的報告儲存快照：位置結論、各區塊當時的全文（不只存固定內容的參照）、所用系統、版本資訊（ontology、mapping、fragments、templates）、計算依據與產生時間；每一段 MUST 標示種類（事實、系統解讀、AI 綜合推論、使用者自述之一）與來源，缺種類 MUST 被拒絕；時間性內容 MUST 隨快照存入並標示產生日期，MUST NOT 隨年份自動更新。 | must | 7 | ✘ | CTX-CON-029, CTX-CON-027, CTX-ACTOR-001 |
| FR-080 | 報告快照的存取、期限與清除 | 快照 MUST 僅本人可讀（他人讀取回找不到，不洩漏存在與否），API 輸入輸出 MUST 通過 schema 驗證；快照 SHALL 保存 6 個月，由每日到期作業清除，MUST NOT 對此集合開 Firestore TTL；刪除帳號與刪除資料的「報告」範圍 MUST 清除其全部快照，其他範圍 MUST NOT 動到快照；每人快照數有上限，超過時 MUST 先刪最舊的一份；相同的基本報告只保存一份；AI 分析不寫入快照（AI 報告另存，見 FR-088），快照上舊的 ai、aiJob 欄位不再寫入。 | must | 7 | ✘ | CTX-CON-029, CTX-CON-012, CTX-CON-006, CTX-EXT-005, CTX-ASM-027, CTX-ACTOR-001 |
| FR-081 | 特質本體 | 系統 SHALL 定義 28 條兩極特質軸（思考與認知、行動與節奏、情緒與表達、人際與關係、價值與動機五組），每條軸有穩定 ID 與恰好兩個端點，每個端點有名稱、說明與過度時的樣子，命名 MUST 為中性；另定義三組情境軸（時間 3、對象 10、生活領域 10，領域不含「人際關係」）；軸與端點 ID MUST 唯一且一經發布 MUST NOT 重用；內容改動 MUST 同步提高 ONTOLOGY_VERSION。 | must | 7 | ✘ | CTX-CON-028, CTX-ACTOR-003 |
| FR-082 | 特質映射與覆蓋檢查 | 系統 SHALL 為每個系統提供映射條目（system、term、axisEnd、method），term MUST 為該系統真實存在的原語彙、axisEnd MUST 存在、MUST NOT 帶強度或信心；MBTI、人類圖、八字用結構式，星座、血型、生命靈數、瑪雅 Kin 用關鍵字式；八字十神語句 MUST NOT 映射；塔羅、盧恩、星座運勢標為 state，MUST NOT 進穩定特質映射；56 個端點每一個 MUST 至少有一條映射，或列在已確認無來源的清單（清單不得過期）；整體覆蓋率低於 80% MUST 失敗；映射標示 sourceGroup，內容改動 MUST 同步提高 MAPPING_VERSION。 | must | 7 | ✘ | CTX-CON-028, CTX-ACTOR-003 |
| FR-083 | 情境片段 | 系統 SHALL 以（特質軸端點、情境值）為鍵提供預寫的一句話片段（10 個對象與 10 個生活領域）；時間值（過去、現在、未來）由模板產生；過去 MUST 為假設並附確認問題，未來只談傾向與可準備的方向，MUST NOT 使用醫療、法律、財務用語；片段 MUST 有覆蓋檢查，內容改動 MUST 同步提高 FRAGMENT_VERSION。 | must | 7 | ✘ | CTX-CON-028, CTX-CON-016, CTX-ACTOR-003 |
| FR-084 | 計算依據（basis） | 系統 SHALL 為每份報告的事實附計算依據：系統（取自固定清單）、方法、規則版本與計算所用的輸入（只含必要欄位）；各重算型系統有規則版本常數與純函式 buildBasis，同一輸入與同一版規則 MUST 得到相同的 basis；塔羅與盧恩沿用現有的抽取版本，MBTI 的規則版本為作答時的測驗版本。 | must | 7 | ✘ | CTX-CON-027, CTX-CON-009, CTX-ACTOR-004 |
| FR-085 | AI 報告（建立） | 系統 SHALL 只提供一種 AI 報告，讓已登入使用者選一個以上、互不相同的穩定特質系統（含自我分析）並可選填一段提問（100 字內、前後空白去除、空白視為沒有）來建立；價格 MUST 為一個系統 1 點、兩個以上為各系統基本價之和 × 1.2 無條件捨去且上限 30 點；請求 MUST 帶 Idempotency-Key（即報告 id），重複請求只回報目前狀態且不重複扣點；回 202 與報告 id；建立前 MUST 確保每個系統的單維度報告已保存並記在 sources（system、snapshotId、當時的位置結論）；兩個以上系統時規則 MUST 先找跨系統洞見作為 AI 的輸入素材，找不到任何洞見回 422 NO_INSIGHTS；缺資料回 422、點數不足回 402、提問過長或系統選擇無效回 400，皆不扣點且不呼叫 AI；生成失敗或品質檢查失敗 MUST 在同一交易內標為失敗並退點（只退一次）；每人每小時與每日有生成次數上限；訪客 MUST NOT 取得。 | must | 7 | ✘ | CTX-CON-027, CTX-CON-028, CTX-CON-014, CTX-CON-030, CTX-ASM-026, CTX-ASM-029, CTX-EXT-002, CTX-ACTOR-002 |
| FR-086 | AI 報告的骨架與導師視角 | 系統 SHALL 讓 AI 報告依固定順序呈現：事實攤開（每份來源報告只列標題與一句摘要，由系統取自該報告、在 AI 完成前就存在、MUST NOT 由 AI 撰寫）、值得注意的點、共同的優勢、共同的劣勢與需要留意的地方、過去、現在、未來、回應你的提問（只有提問時才有）、結論與提醒；除過去與現在外，每一部分 MUST 是一段開頭加條列重點（值得注意的點、共同的優勢、共同的劣勢、回應提問、結論各 3 到 5 點，未來 2 到 4 點對應的提醒）；優勢與劣勢 MUST 取各份報告共同指向的；系統 prompt MUST 要求 AI 以融合心理學、命相學與神秘學視角的同一位導師，縱觀提問者的過去、現在與未來的狀態、可能發生的事件類型與提醒，並逐章說明開頭與條列的寫法與數量；談未來只說可能與傾向，MUST NOT 給確切日期、人名或結果、吉凶斷言、壽命或疾病或婚姻成敗或財運的預言，MUST NOT 做診斷或給醫療、法律、財務建議；交給 AI 的內容 MUST 只含今天的日期、各來源報告的系統與位置結論與事實與面向與限制、規則找到的洞見候選與提問，不含使用者 id 或電子郵件；Prompt 版本 MUST 隨報告保存。 | must | 7 | ✘ | CTX-CON-027, CTX-CON-030, CTX-CON-009, CTX-EXT-002, CTX-ACTOR-002 |
| FR-087 | 分析紀錄與 AI 報告頁 | 系統 SHALL 提供會員專屬的「分析紀錄」（header nav，/ai-reports）與 GET /api/ai-reports，以單一列表呈現使用者未到期的 AI 報告卡片（新到舊、最多 100 筆，不含報告內容，顯示建立時間、來源位置結論、提問與狀態），並提供 GET /api/ai-reports/{id} 與報告頁讀取全文；報告頁依骨架呈現（分析概要、事實攤開、值得注意的點、共同的優勢與劣勢、過去現在未來的垂直時間線、回應提問、結論），條列以清單呈現；生成中 MUST 顯示進度並自動更新，完成或失敗後刷新點數；失敗 MUST 顯示已退點並可帶原系統與原問題「再問一次」；生成中而逾時的報告 MUST 在被讀取時標為失敗並退點；他人的、不存在的與已到期的報告 MUST 回找不到；單維度報告最後 MUST 提供「深入分析」入口並預選該系統，「綜合分析」頁（/report）作為建立表單，送出後導向分析紀錄；訪客開啟分析紀錄 MUST 只見登入提示。 | must | 7 | ✘ | CTX-CON-027, CTX-CON-029, CTX-CON-014, CTX-ACTOR-002 |
| FR-088 | AI 報告的存取、期限與清除 | 系統 SHALL 把 AI 報告存於使用者自己的 aiReports 集合（一份一筆，id 為冪等鍵，含 sources、提問、狀態、內容、點數、模型與 prompt 版本、建立與到期時間），MUST 僅本人可讀；報告 SHALL 保存 6 個月（建立時間加 6 個月），由每日到期作業清除，MUST NOT 對此集合開 Firestore TTL；刪除帳號與刪除資料的「報告」範圍 MUST 清除其全部 AI 報告，其他範圍 MUST NOT 動到，也 MUST NOT 影響其他使用者；報告 MUST 自足，來源單維度報告被清除後仍可閱讀；再問一次 MUST 新增一份而不覆蓋舊報告；快照上舊的 ai、aiJob 欄位不再寫入、不遷移，隨快照到期。 | must | 7 | ✘ | CTX-CON-029, CTX-CON-012, CTX-CON-006, CTX-EXT-005, CTX-ASM-027, CTX-ACTOR-001 |

## Non-Functional Requirements

| ID | 類別 | 標題 | Metric | Priority | Context |
|---|---|---|---|---|---|
| NFR-001 | security | 外部輸入驗證 | 所有 API 皆有 schema 驗證；未通過者回傳明確錯誤 | must | CTX-CON-003 |
| NFR-002 | security | 秘密與金鑰保護 | 前端 bundle 中 0 個秘密金鑰 | must | CTX-CON-003, CTX-EXT-001, CTX-EXT-002 |
| NFR-003 | security | 授權與存取控制 | 未授權存取一律被拒絕（需以測試驗證） | must | CTX-CON-003, CTX-ACTOR-002, CTX-EXT-005, CTX-EXT-006 |
| NFR-004 | security | Webhook 可靠性 | 同一事件重送 N 次，最終狀態與送一次相同 | must | CTX-EXT-001 |
| NFR-005 | privacy | 資料最小化與保留 | 測驗結果、多維度分析報告、MBTI、人類圖、每日抽取紀錄、即時星象報告保留 3 個月；詳細分析保留 6 個月；付款紀錄於帳號存續期間永久保存；刪除帳號時移除全部紀錄（贈點紀錄保留 3 個月）；訪客暫存結果 TTL 1 天 | must | CTX-CON-006, CTX-CON-012 |
| NFR-006 | privacy | 日誌敏感資料 | 日誌抽樣檢查 0 筆完整答案/報告內容 | must | CTX-CON-006 |
| NFR-007 | compliance | 結果免責與內容合規 | 100% 結果頁含免責說明；固定測試案例中 0 筆診斷式輸出 | must | CTX-CON-001, CTX-CON-002 |
| NFR-008 | cost | AI 成本控管 | 未量化，需與相關人確認（單份報告成本上限、Token 上限） | must | CTX-CON-007, CTX-ACTOR-004 |
| NFR-009 | performance | AI 報告生成時間 | 單次生成逾時 120 秒（Vercel 函式 maxDuration），逾時視為失敗並返還點數；p95 等待時間待上線量測 | must | CTX-EXT-002, CTX-ACTOR-002, CTX-CON-010, CTX-EXT-004 |
| NFR-010 | performance | 固定報告查詢效能 | 未量化，需與相關人確認（例如 p95 延遲） | should | CTX-CON-004, CTX-CON-007 |
| NFR-011 | reliability | AI 供應商故障容忍 | 未量化，需與相關人確認（可用性目標 SLA） | must | CTX-EXT-001, CTX-EXT-002 |
| NFR-012 | maintainability | 內容與測驗資料驅動 | 新增一份報告內容或一種測驗無需修改核心程式碼 | must | CTX-CON-005, CTX-CON-008, CTX-CON-010 |
| NFR-013 | quality | AI 報告品質驗證 | 未量化，需與相關人確認（通過準則） | should | CTX-CON-009, CTX-EXT-002 |
| NFR-014 | content-quality | 固定報告文案差異度 | 未量化，需與相關人確認（重複度門檻、審核通過率） | should | CTX-ACTOR-003, CTX-CON-005 |
| NFR-015 | observability | 指標與可追蹤性 | 每份 AI 報告 100% 記錄上述三項欄位 | should | CTX-ACTOR-004, CTX-EXT-002 |
| ~~NFR-016~~ | security | 已廢止：前端計算結果不可信 | user 更正為後端計算固定結果，前端計算結果不可信的前提不再成立 | — | — |
| NFR-017 | reliability | 點數一致性與防重複 | 並行 N 次扣點請求，餘額變動與成功次數一致；贈點每帳號 1 次 | must | CTX-CON-014, CTX-EXT-005, CTX-EXT-001 |
| NFR-018 | reliability | 每日抽取的一致性與防重複 | 並行 N 次抽取請求，當日紀錄只有 1 份，且各次回應內容相同 | must | CTX-CON-018, CTX-EXT-005 |
| NFR-019 | correctness | 台北日期換日的正確性 | 台北 23:59:59 與 00:00:00 兩個時刻的邊界測試，換日行為正確 | must | CTX-CON-016 |
| NFR-020 | compliance | 「此刻／今日」內容免責與語氣 | 100% 結果頁含免責說明；抽樣檢查 0 筆具體事件預測或專業建議 | must | CTX-CON-016, CTX-CON-001 |
| NFR-021 | maintainability | 新增抽取型的重用性 | 未量化，需與相關人確認（例如共用程式碼比例或新增一種抽取型所需的改動檔案數） | should | CTX-CON-019 |
| NFR-022 | accuracy | 星象計算準確度 | 未量化，需與相關人確認（與參考星曆比對的容許誤差，例如黃經差距） | should | CTX-EXT-008, CTX-CON-017 |
| NFR-023 | maintainability | 新增一種自我分析的成本 | 未量化，需與相關人確認（例如新增一種分析所需的改動檔案數上限） | should | CTX-CON-021 |
| NFR-024 | correctness | 計分的決定性 | 每個分析的計分測試通過；並列與切點邊界各有測試 | must | CTX-CON-021 |
| NFR-025 | compliance | 內容無診斷用語 | 全文搜尋疾病、症、治療、障礙等字眼 0 筆不當使用；100% 結果頁含免責與註明 | must | CTX-CON-024, CTX-CON-022, CTX-CON-001 |
| NFR-026 | privacy | 訪客與日誌的隱私 | 訪客送出後資料庫新增 0 份文件；日誌抽樣 0 筆含作答或結果內容 | must | CTX-CON-023, CTX-CON-006 |
| NFR-027 | reliability | 移除大五人格的完整性 | 移除後 bigFiveAttempts 與 BIGFIVE 文件各為 0 筆；覆蓋檢查顯示缺少、未發佈、多出皆為 0；pnpm lint、pnpm test、nuxt build 通過 | must | CTX-CON-025, CTX-CON-012 |
| NFR-028 | performance | 多維度組合的輸入長度與成本 | 未量化，需與相關人確認（最大組合的輸入 token 數與單份費用上限） | should | CTX-CON-026, CTX-CON-007, CTX-CON-014 |
| NFR-029 | correctness | 映射覆蓋率與版本同步 | 覆蓋率檢查通過（≥ 80%）；未列入無來源清單的端點 0 個沒有映射；改動內容時版本常數同步提高的測試通過 | must | CTX-CON-028 |
| NFR-030 | reliability | 報告快照的一致性 | 並行 N 次相同請求，快照只有 1 份且扣點一次；建立 AI 報告前後來源快照內容相同；重複建立 AI 報告後單維度快照數不增加 | must | CTX-CON-029, CTX-CON-014 |
| NFR-031 | security | 使用者提問的處理 | 101 字提問被拒絕且不扣點；系統 prompt 含「不是指令」與忽略違規要求的規則；要求忽略規則或診斷的提問不影響輸出須通過的品質檢查；刪除報告後提問一併清除 | must | CTX-CON-030, CTX-CON-009, CTX-EXT-002 |
| NFR-032 | correctness | AI 報告的輸出品質把關 | 各失敗條件各有測試且結果為失敗並退點；絕對語氣只產生警告；事實塊的每一句取自來源報告 | must | CTX-CON-030, CTX-CON-009, CTX-CON-014 |

## 待確認（已採納建議，以下為尚待落實或需外部確認）

- 點數實際價格：上線前量測單份 AI 報告成本後決定（FR-011）
- 人類圖：計算庫是否支援月交點與授權、欄位定義須對照官方教材、預設城市清單範圍（FR-036）
- 多維度分析報告 內容：約 20 組試讀後再擴到 960（FR-009）
- 法務確認：「無退款」勾選同意是否足以排除解約權、MBTI 商標與題庫、贈點雜湊紀錄的隱私政策（CTX-CON-011、CTX-CON-015、FR-037）
- Vercel 方案：確認 Hobby 非商業使用限制，營運用 Pro（CTX-CON-010）
- Email 寄送服務供應商與 PDF 產生庫（FR-034）
- AI 生成 p95 等待時間：上線後量測（NFR-009）
- 到期通知（Phase 5）、後台 API 與事件檢視（MVP 後）
- 計畫書 §7 資料表設計已改寫為 Firestore 資料模型（data-model.yaml）

## 「此刻／今日」類待確認（2026-10-27）

已確認：行運盤固定於台北當日 00:00、十顆天體（本命盤同步加入三顆外行星）、Dreamspell、今日 Kin 與生日 Kin 內容分開各 260 筆（共 520）、2/29 沿用 2/28、Elder Futhark（9 枚僅正位、15 枚可逆，不含空白符文）、今日 Kin 需登入且每日計算一次（不扣點、查看不限、解鎖紀錄 3 個月）、報告獨立集合且可重複查看。

- 即時星象報告 PDF：是否扣點、下載或寄 email、是否共用 FR-034 的機制（CTX-ASM-019、FR-054）
- 即時星象點數價格：需量測單份 AI 成本後決定（CTX-CON-017）

## 「自我分析擴充」類待確認（2026-11-02）

已確認：每一種單維度自我分析都要能在多維度分析中被選擇（CTX-CON-026）；保留 HEXACO 並取代大五人格（CTX-CON-025）；所有題目自行設計並註明沒有經過信度與效度驗證（CTX-CON-022）；依附風格用兩個向度加中性象限描述；九型要有側翼，並列門檻採建議值 10 分（CTX-ASM-021）；分階段上線（第一階段 HEXACO、九型、核心價值觀、需求與動機）。

- 各分析題數與核心價值觀清單（約 40 項）的內容（CTX-ASM-020、CTX-ASM-023）
- 是否請心理學專業人士審閱自行設計的題目與內容（CTX-ASM-022）
- 依附風格四個象限的名稱與描述用語（CTX-ASM-023）
- 移除大五人格時是否先匯出已存結果（預設不匯出，CTX-ASM-024）；刪除正式資料前須再確認（FR-071）
- 各自我分析在多維度組合中的基礎點數與特質映射的內容（CTX-ASM-025）；最大組合的輸入長度與成本（NFR-028）

## 報告架構補進分析（2026-11-03）

報告架構（單維度報告、多維度報告、報告快照、特質本體與映射、情境片段、計算依據）早已實作並歸檔，但先前未納入分析；現依已歸檔的規格補進（FR-074 至 FR-084、NFR-029 至 NFR-030）。被它取代的舊需求（FR-006、015、016、018、020、041）與舊 use case（UC-007、009、012、013）已標為 deprecated。

- 舊的詳細分析（5 點、八章節）與事先算好的 summary 組合（960 種）已不存在於實作中；FR-034（詳細分析報告書寄送 email）仍保留為規劃中，但依附的詳細分析已被取代，需要重新決定它的範圍
- 每人快照上限的實際數字見 server/services/reportSnapshot.service.ts（CTX-ASM-027）；多維度報告價格規則已實作但未重新確認（CTX-ASM-026）

## AI 報告合併（2026-11-05，change：ai-analysis-question-history）

- 單維度 AI 進階分析（FR-077）與多維度報告（FR-078）合併為唯一一種 AI 報告（FR-085 至 FR-088）：一至多個系統、選填提問、sources 記錄所用單維度報告、另存於 aiReports 集合；規則組裝的跨系統報告不再保存與呈現，只作 AI 的輸入素材
- 內容界線改為導師視角（CTX-CON-030）：允許談可能的情境與事件類型，仍禁確切預言、診斷與醫療法律財務建議；「AI 輸入不含使用者自由文字」改為只允許受限的提問（NFR-031）
- 一個系統固定 1 點與事實摘要的取法為暫定（CTX-ASM-029），多系統價格規則沿用且未重新確認（CTX-ASM-026）
