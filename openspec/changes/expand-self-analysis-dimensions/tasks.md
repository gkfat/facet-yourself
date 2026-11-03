## 1. 共用框架（第 0 階段，不開任何入口）

- [x] 1.1 新增 `shared/assessments/types.ts`：`AssessmentDefinition`（`id`、`version`、`kind`、題目或選項、`score`、`contentKeys`、`resultSchema`）與兩種作答形狀（量表、挑選）
- [x] 1.2 新增 `shared/assessments/index.ts` 登錄表與查詢函式；測試：每份定義的 id 不重複、版本帶 `ref` 標記、`contentKeys` 合法且不重複
- [x] 1.3 新增作答驗證與共用計分工具（量表：每題一次、範圍、無未知題；挑選：清單內、數量、不重複；反向題反轉、平均、0–100、三級判定），含單元測試
- [x] 1.4 `shared/utils/fixedContentKeys.ts`：加入 `ASSESSMENT`，合法金鑰與 `expectedFixedContentIds` 取自登錄表；更新相關測試與覆蓋預期總數
- [x] 1.5 新增 `shared/schemas/firestore/assessmentAttempt.schema.ts` 與 `shared/schemas/api/assessment.schema.ts`（請求、回應、紀錄文件）
- [x] 1.6 新增 `server/repositories/assessment.repository.ts` 與 `server/services/assessment.service.ts`：驗證、計分、讀固定內容（先確認可交付）、登入者寫入 `assessmentAttempts`、取最新未到期結果
- [x] 1.7 新增 `server/api/assessments/[id]/results.post.ts`（選用登入，訪客不寫入）與 `results/latest.get.ts`（需登入）；不存在的分析回 404；內容未發佈回 404 且不保存
- [x] 1.8 `routeAccess` 登記、更新 `openspec/analysis/render/api.yaml`，確認 `server/api.routes.test.ts` 通過
- [x] 1.9 服務與端點測試：登入者保存、訪客不寫入、作答不合法、內容未發佈不寫入、取最新與到期過濾
- [x] 1.10 `scripts/provision-firebase.ts` 的 `EXPIRY_QUERY_GROUPS`、`dataExpiry.service`、`deletion.service`（含「刪除我的結果」）納入 `assessmentAttempts`，補測試
- [x] 1.11 新增通用頁面 `app/pages/assessment/[id].vue`（量表版型：分頁、進度、已作答／未作答樣式、暫存於 sessionStorage；挑選版型）與 `app/pages/analysis/[id].vue`（共用的分數條、區塊卡片、「怎麼看」說明與免責、訪客結果與登入後儲存）
- [x] 1.12 首頁與 `/self-reports` 依登錄表產生卡片，每個分析各有入口旗標（預設關）；`useExploration` 增加各分析的完成狀態
- [x] 1.13 多維度整合的框架：分析定義增加 `reportInput`、`traitMappings`、`basePrice` 三個必要欄位，登錄表測試檢查三項都存在；`MappingSystem` 與 `MULTI_REPORT_SYSTEMS` 改為包含登錄表的所有分析；`multiReportCost` 的基礎點數取自定義；多維度分析的 API schema 與選擇畫面同步擴充（只開放有未到期結果的分析）
- [x] 1.14 多維度整合的測試：新增分析自動出現在可選清單、沒有結果的分析不可選、組合點數與上限、輸入長度檢查、映射覆蓋檢查
- [x] 1.15 `pnpm lint`、`pnpm test`、`nuxt build` 通過
- [x] 1.15b 執行 `scripts/provision-firebase.ts` 建立 `assessmentAttempts` 的索引例外（會動到正式 Firebase，需使用者同意）

## 2. 第一階段：HEXACO、九型人格、核心價值觀、需求與動機

- [ ] 2.0 HEXACO：撰寫 60 題（六維度各 10）、計分、結果元件與單元測試；內容六維度 × 低／中／高（重點在「誠實謙遜」）；dry-run 驗證；審稿後匯入、實測、開啟入口旗標（HEXACO 先於其他分析上線，大五人格才能移除）
- [ ] 2.0b HEXACO 多維度整合：`reportInput`、`traitMappings`、`basePrice`（六維度對應到特質端點），映射審稿並通過覆蓋檢查，納入多維度分析並實測一次交叉比對
- [ ] 2.1 九型人格：撰寫 54 題（每型 6）、計分（九型分數、主型、側翼、最高與次高差距小於 10 分時並列）、結果元件與單元測試
- [ ] 2.2 九型人格內容：9 型的核心動機、恐懼、慣性、成長方向與可以留意的地方，另加並列時的說明；dry-run 驗證
- [ ] 2.2b 九型人格多維度整合：`reportInput`、`traitMappings`、`basePrice`（九型對應到特質端點），映射審稿、覆蓋檢查與實測
- [ ] 2.3 核心價值觀：約 40 項價值清單與各自說明、挑選與排序的計分與驗證、結果元件與單元測試
- [ ] 2.4 核心價值觀內容：每項價值的說明與反思問題；dry-run 驗證
- [ ] 2.4b 核心價值觀多維度整合：`reportInput`、`traitMappings`、`basePrice`（價值對應到特質端點），映射審稿、覆蓋檢查與實測
- [ ] 2.5 需求與動機：撰寫 18 題（三需求各 6）、計分、結果元件與單元測試
- [ ] 2.6 需求與動機內容：三需求 × 低／中／高的動力上升與下降情境；dry-run 驗證
- [ ] 2.6b 需求與動機多維度整合：`reportInput`、`traitMappings`、`basePrice`，映射審稿、覆蓋檢查與實測
- [ ] 2.7 九型、核心價值觀、需求與動機審稿後改為 `PUBLISHED` 並匯入，確認覆蓋檢查完整，各完成一次實際測驗後開啟入口旗標

## 3. 第二階段：VIA 品格優勢、霍蘭德職業興趣

- [ ] 3.1 VIA：撰寫 48 題（24 項各 2 題）、計分（24 項排序、前 5 項、分數相同的固定規則）、結果元件與單元測試
- [ ] 3.2 VIA 內容：24 項優勢的說明、日常表現、用得太過、如何發揮；dry-run 驗證
- [ ] 3.2b VIA 多維度整合：`reportInput`、`traitMappings`、`basePrice`（24 項優勢對應到特質端點），映射審稿、覆蓋檢查與實測
- [ ] 3.3 RIASEC：依六種興趣類型的定義自行設計 60 題（每型 10）、計分（六型分數、三碼、並列規則）、結果元件與單元測試
- [ ] 3.4 RIASEC 內容：六型特徵與偏好的工作環境、三碼組合的整體描述，並固定說明「這是興趣，不是能力或適性的判定」；dry-run 驗證
- [ ] 3.4b RIASEC 多維度整合：`reportInput`、`traitMappings`、`basePrice`（六型對應到特質端點），映射審稿、覆蓋檢查與實測
- [ ] 3.5 兩個分析審稿後匯入、實測、開啟入口旗標

## 4. 第三階段：情緒智商、依附風格

- [ ] 4.1 情緒智商：撰寫 40 題（四面向各 10）、計分（四面向，無總分）、結果元件與單元測試
- [ ] 4.2 情緒智商內容：四面向 × 低／中／高的現況、優勢、留意、可以練習的方向；dry-run 驗證
- [ ] 4.2b 情緒智商多維度整合：`reportInput`、`traitMappings`、`basePrice`，映射審稿、覆蓋檢查與實測
- [ ] 4.3 依附風格：撰寫 24 題（兩向度各 12）、計分（兩向度、四象限、落在中間的處理）、結果元件與單元測試
- [ ] 4.4 依附風格內容：四象限的中性描述與可以練習的方向，並固定說明「不是診斷，也不是固定標籤」；dry-run 驗證
- [ ] 4.4b 依附風格多維度整合：`reportInput`、`traitMappings`、`basePrice`（兩向度與象限對應到特質端點），映射審稿、覆蓋檢查與實測
- [ ] 4.5 兩個分析審稿後匯入、實測、開啟入口旗標

## 5. 移除大五人格（HEXACO 上線並確認可用之後）

- [ ] 5.1 關閉大五人格的入口旗標 `BIG_FIVE_ENTRY_ENABLED`，確認首頁與 `/self-reports` 的卡片消失
- [ ] 5.2 向使用者確認後，刪除所有使用者的 `bigFiveAttempts`（腳本，先 dry-run 列出筆數）
- [ ] 5.3 向使用者確認後，刪除 Firestore 的 47 筆 `BIGFIVE` 固定內容（腳本，先 dry-run 列出文件）
- [ ] 5.4 移除程式：`app/pages/big-five.vue`、`app/pages/analysis/big-five.vue`、`app/composables/useBigFive.ts`、`server/api/big-five/*`、`routeAccess` 規則、`bigFive` 的 service／repository／schema／常數／計分、對照與組合工具及其測試
- [ ] 5.5 移除 `BIGFIVE` 的內容類型與金鑰（`fixedContentKeys`）、`content/fixed/big-five.json`；更新覆蓋預期總數與相關測試
- [ ] 5.6 移除 `bigFiveAttempts` 在 `dataExpiry.service`（含回傳欄位與 `cron.schema`）、`deletion.service`、`provision-firebase` 的處理，並更新測試與 `api.yaml`
- [ ] 5.7 移除 `useExploration` 與 `explorationProgress` 的大五完成狀態、首頁與 `/self-reports` 的大五卡片；更新主 spec（`big-five-test` 以 REMOVED 需求移除）
- [ ] 5.8 `pnpm lint`、`pnpm test`、`nuxt build`、覆蓋檢查與 `check:bundle` 全部通過

## 6. 收尾

- [ ] 6.1 逐一檢查所有題目都是自行設計、沒有翻譯或改寫任何既有量表，並確認每個測驗頁與結果頁都註明「自行設計、沒有經過信度與效度驗證」
- [ ] 6.2 所有固定內容通過「無診斷用語」檢查（全文搜尋疾病、症、治療、障礙等字眼）
- [ ] 6.3 確認每一種分析都能在多維度分析中被選擇並完成一次交叉比對；確認覆蓋檢查顯示所有 `ASSESSMENT` 內容完整、`pnpm exec vitest run` 全部通過、`nuxt build` 成功
