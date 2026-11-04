## Why

現有的自我分析停在兩類：命理與象徵系統（星座、血型、人類圖、八字、生命靈數、Kin），以及人格特質（MBTI、大五人格）。它們回答「你是什麼樣的人」，卻很少回答「你為什麼這樣做」「你最重視什麼」「你在哪些地方有力量」「你怎麼處理情緒與關係」。這些面向正是使用者讀完特質報告後最常接著問的問題，也能讓 MBTI 與大五人格的結果多出可以互相對照、補充的角度，而不是各說各話。

## What Changes

新增八種自我分析，分成四個面向；每一種都是固定題目與固定規則計分、結果文字事先寫好，不呼叫 AI、不扣點、免費：

1. **人格與動機**
   - 九型人格（Enneagram）：核心動機、恐懼、慣性與成長方向，聚焦「為什麼會這樣做」。
   - HEXACO 人格模型：六個維度（誠實謙遜、情緒性、外向性、宜人性、盡責性、開放性）。**取代**現有的大五人格測驗：HEXACO 涵蓋大五的五個特質並多一個「誠實謙遜」。
2. **優勢與能力**
   - VIA 品格優勢：24 種品格優勢，找出最突出的幾項，回答「我有哪些值得發揮的內在優勢」。
   - 霍蘭德職業興趣（RIASEC）：實作、研究、藝術、社會、企業、事務六型，看興趣、職涯方向與工作環境偏好；**只描述興趣，不判定能力或職業適性**。題目依六種類型的定義自行設計。
3. **情緒與心理運作**
   - 情緒智商（EQ）：情緒覺察、情緒調節、同理心、人際情緒處理。
   - 依附風格：以「靠近的焦慮」與「親密的迴避」兩個連續向度描述親密關係中的安全感與靠近／疏遠模式；**不貼固定標籤、不做臨床診斷**。
4. **價值觀與人生方向**
   - 核心價值觀：從價值清單中挑選與排序（自由、安全、成就、關係、創造、秩序、影響力⋯⋯），回答「什麼對我最重要」。這是目前系統中相對缺少的面向。
   - 需求與動機：依自我決定理論的三項基本心理需求（自主、勝任、關係）看什麼情境讓動力上升、哪些環境讓動力下降。

共同的做法：
- 抽出一個**共用的測驗框架**（題目定義、驗證、計分、結果保存、結果頁、入口），八種分析都建在它上面，不各自複製一份大五人格的程式。
- **BREAKING**：HEXACO 上線並發佈後，**把現有的大五人格測驗從產品中移除**：頁面、API、入口、固定內容 `BIGFIVE`、已存的結果、到期清除與刪帳號的處理。MBTI **不改動**。
- **所有題目都是自行設計，沒有經過信度與效度驗證**；每個測驗頁與結果頁固定註明這一點，並說明這不是任何既有量表（如 VIA-IS、HEXACO-PI-R、ECR-R、BPNSFS、O*NET）。
- 每個結果頁固定說明：分數／類型只描述你自己的回答，不與他人比較，也不是診斷或臨床評估；用「傾向」的語氣，不使用診斷用語。
- 結果保存 3 個月，到期自動清除，刪帳號一併刪除；訪客的結果只留在當次瀏覽器。
- 分階段上線：先做框架，再依序上線，每一種各以入口旗標控制，內容審稿並匯入後才開啟。

**納入多維度分析（產品目標）**：本 app 的目標是讓使用者做過的**每一種**單維度自我分析，都能在多維度分析中任選組合，由 AI 進行交叉比對。因此這八種分析都必須能在多維度分析中被選擇：每個分析提供把自己的結果轉成報告輸入的轉接（事實、解讀、特質術語）、對應到特質本體的映射、以及在組合中的基礎點數。使用者需有該分析未到期的已保存結果才能選擇；訪客不可取得多維度分析（既有規則不變）。

**不在本次範圍**：常模與百分位、歷史趨勢、任何形式的診斷或治療建議、為使用者貼上固定類型標籤、與 MBTI 的自動規則對照。

## Capabilities

### New Capabilities
- `self-assessment-framework`: 共用的測驗框架：題目與計分的定義方式、作答驗證、固定內容 `ASSESSMENT`、結果保存／到期／刪除、通用的測驗頁與結果頁、入口旗標
- `enneagram-test`: 九型人格的題目、計分（主型與側翼，平手的處理）與結果內容
- `hexaco-test`: HEXACO 六個維度的題目、計分與結果內容（取代大五人格測驗）
- `via-strengths-test`: 24 種品格優勢的題目、計分與最突出優勢的呈現
- `riasec-interest-test`: 六種職業興趣的題目、計分、三碼興趣代碼與結果內容（不判定能力或適性）
- `emotional-intelligence-test`: 情緒智商各面向的題目、計分與結果內容
- `attachment-style-test`: 靠近的焦慮與親密的迴避兩個向度、四個象限的描述，不使用臨床標籤
- `core-values-exercise`: 價值清單的挑選與排序，產出最重要的幾項價值觀與說明
- `psychological-needs-test`: 自主、勝任、關係三項需求的題目、計分，以及動力上升與下降的情境說明
- `assessment-multi-dimension`: 每個已登錄的自我分析都能在多維度分析中被選擇：報告轉接、特質映射、基礎點數、選擇條件與組合上限

### Modified Capabilities
- `big-five-test`: **整個能力移除**（所有需求皆為 REMOVED，附原因與遷移方式）；HEXACO 上線後才移除
- `trait-mapping`: 映射的系統清單新增八種自我分析，各自的映射須通過覆蓋檢查
<!-- single-dimension-report 等需求不變；固定內容類型新增 ASSESSMENT 與資料到期／刪帳號納入新集合，寫在 self-assessment-framework 的需求中 -->

## Impact

- **新增**：`shared/assessments/`（各分析的題目、計分、特質／類型定義）、`shared/schemas/` 的通用 schema、`server/services/assessment.service.ts` 與 repository、`server/api/assessments/*`、`app/pages/assessment/[id].vue`（測驗）與 `app/pages/analysis/[id].vue`（結果）、各分析的結果呈現元件。
- **修改**：`shared/report/systems.ts`（`MULTI_REPORT_SYSTEMS` 納入登錄表的分析）、`shared/ontology/mappings/*`（各分析的特質映射）、`shared/utils/multiDimensionPricing.ts`（新系統的基礎點數）、多維度分析的 API schema 與選擇畫面、`shared/utils/fixedContentKeys.ts`（加入 `ASSESSMENT`）、`server/utils/routeAccess.ts`、`openspec/analysis/render/api.yaml`、`server/services/dataExpiry.service.ts`、`scripts/provision-firebase.ts`、`server/services/deletion.service.ts`、首頁與 `/self-reports`、`useExploration` 的完成狀態。
- **內容**：新增大量固定內容（九型 9 型、VIA 24 項、RIASEC 6 型與組合、EQ、依附、價值觀清單、需求等），全部需撰寫並審稿後匯入。
- **依賴**：不新增套件。
- **移除**：`app/pages/big-five.vue`、`app/pages/analysis/big-five.vue`、`server/api/big-five/*`、`bigFive` 的 service、repository、schema、常數與計分工具、`BIGFIVE` 固定內容（47 筆，含 Firestore 上已匯入的正式內容）、`bigFiveAttempts` 的到期清除、刪帳號與索引處理、首頁與 `/self-reports` 的卡片、`useExploration` 的大五完成狀態，以及主 spec `big-five-test`。已存在的 `bigFiveAttempts` 紀錄須在移除處理程式之前先清掉。
- **刻意不動**：MBTI 的結構、API 與資料。
- **版權與信度**：VIA-IS、HEXACO-PI-R、ECR-R、BPNSFS、O*NET 興趣量表等不直接使用。**所有題目一律自行設計，沒有經過信度與效度驗證**，並在結果與測驗頁明確註明，不宣稱與任何原量表等效，也不使用百分位或常模。
