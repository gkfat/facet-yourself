## 1. 框架註冊

- [x] 1.1 在 `shared/assessments/ids.ts` 的 `ASSESSMENT_IDS`、`ASSESSMENT_SYSTEM_BY_ID`、`ASSESSMENT_SYSTEM_IDS` 加入 `career-anchors`、`conflict-style`、`resilience` 與對應 system id
- [x] 1.2 在 `shared/ontology/mapping.ts` 的來源類型（`questionnaire`）與方法（`keyword`）表加入三個系統
- [x] 1.3 在 `shared/report/natureLabels.ts` 加入三個系統的標籤
- [x] 1.4 確認 `MAPPING_VERSION`／`ONTOLOGY_VERSION` 是否需升版（參照 design 風險項）

## 2. 生涯錨

- [x] 2.1 新增 `shared/assessments/careerAnchorsData.ts`（8 向度 × 6 題，題目自編）
- [x] 2.2 新增 `shared/assessments/careerAnchors.ts`（`defineScaleAssessment`、`ranked` view、版本常數 `career-anchors-ref-v1`、traitMappings、reportInput、notes）
- [x] 2.3 新增 `careerAnchors.test.ts`：計分、平手順序、缺題與越界驗證、reportInput 句子皆有 sources
- [x] 2.4 新增 `content/fixed/career-anchors.json`（向度內容，措辭通過保守詞檢查）

## 3. 衝突處理風格

- [x] 3.1 新增 `shared/assessments/conflictStyle.ts`（2 向度 × 10 題、`quadrant` view、反向題、象限與「落在之間」邏輯、版本常數 `conflict-style-ref-v1`）
- [x] 3.2 新增 `conflictStyle.test.ts`：四象限、中間地帶、反向題翻轉、reportInput
- [x] 3.3 新增 `content/fixed/conflict-style.json`（四象限內容）
- [x] 3.4 確認 `app/components/AssessmentQuadrantResult.vue` 可通用（不依賴依附風格專屬文字），必要時最小調整

## 4. 心理韌性

- [x] 4.1 新增 `shared/assessments/resilience.ts`（4 向度 × 6 題、`profile` view、反向題、版本常數 `resilience-ref-v1`、低分語氣）
- [x] 4.2 新增 `resilience.test.ts`：計分、反向題、等級切分、reportInput
- [x] 4.3 新增 `content/fixed/resilience.json`（向度內容含可練習方向與求助提示）

## 5. 註冊與前端

- [x] 5.1 在 `shared/assessments/index.ts` 的 `ASSESSMENTS` 註冊三個定義，更新 `index.test.ts` 的清單與數量斷言
- [x] 5.2 在 `shared/assessments/entry.ts` 加入三個 id，初始值為 `false`
- [x] 5.3 在 `app/utils/assessmentCards.ts` 加入三張卡片（system 類別、icon、描述）並更新 `CARD_ORDER`
- [x] 5.4 檢查 `server/services/adminDashboard.service.test.ts` 等依賴系統清單的測試是否需要更新

## 6. 驗證

- [x] 6.1 `pnpm lint`、`pnpm test`（含 `shared/report/synthesis.test.ts`、`shared/ontology/mapping.test.ts`、`coverage.test.ts`）
- [x] 6.2 `pnpm ontology:check`、`pnpm content:check`、`pnpm content:import <file> --dry-run`
- [x] 6.3 `pnpm build` 與 `pnpm check:bundle`
- [x] 6.4 本機完整做過三個測驗與一次含新系統的綜合報告；若手動起服務，結束後釋放 port

## 7. 上線

- [x] 7.1 正式匯入三份固定內容
- [x] 7.2 將 `ASSESSMENT_ENTRY_ENABLED` 對應項目改為 `true` 並部署
