## Why

自我分析測驗目前涵蓋人格、興趣、價值、需求、依附與 EQ，但缺少三個高實用性的面向：職涯動機（補 RIASEC 只談興趣的不足）、人際衝突時的處理習慣、面對壓力後的復原力。三者都能直接給出可練習的建議，且 `shared/assessments/` 統一框架已就緒，新增一種只需加定義檔，成本低。

## What Changes

- 新增三個自編探索問卷（5 點量表，題目為自行設計，不沿用任何有版權的原量表，也不使用 TKI、Career Anchors 等商標名稱）：
  - 生涯錨（`career-anchors`）：以 8 種職涯動機向度計分，結果以排名呈現（`ranked` view），強調動機而非職業建議。
  - 衝突處理風格（`conflict-style`）：以 Dual Concerns 模型「關心自己的目標」與「關心關係」兩個向度計分，結果落在象限（`quadrant` view）。
  - 心理韌性（`resilience`）：以復原、面對壓力、求助與意義感等向度計分，結果以 `profile` view 呈現並附可練習方向。
- 三者皆標示為「探索問卷」，結果頁固定聲明「不是診斷、不是固定標籤」，用語須通過既有的保守措辭檢查。
- 三者納入綜合報告可選系統：各自提供 `traitMappings`（對應 28 個特質軸端點）、`reportInput` 與 `basePrice`。
- 新增固定內容 `content/fixed/<id>.json`，需匯入後生效。
- 擴充 `ASSESSMENT_IDS`、`ASSESSMENT_SYSTEM_BY_ID`、`ASSESSMENT_SYSTEM_IDS`、`ASSESSMENTS` 註冊清單，並補卡片、標籤與入口設定。

## Capabilities

### New Capabilities
- `career-anchors-test`: 生涯錨測驗的向度、計分、排名結果與語氣規範。
- `conflict-style-test`: 衝突處理風格測驗的兩向度計分、象限結果與語氣規範。
- `resilience-test`: 心理韌性測驗的向度、計分、結果與可練習方向。

### Modified Capabilities
- `assessment-multi-dimension`: 可選系統清單新增三個測驗，並要求其出現在綜合報告與定價。

## Impact

- `shared/assessments/`：新增 `careerAnchors.ts`、`conflictStyle.ts`、`resilience.ts`（含測試與必要的 data 檔）；修改 `ids.ts`、`index.ts`、`entry.ts`。
- `shared/ontology/mapping.ts`、`shared/report/natureLabels.ts`：新增三個系統的 mapping 類型與標籤。
- `app/utils/assessmentCards.ts`：新增卡片；結果元件沿用既有 `ranked`／`quadrant`／`profile` view。
- `content/fixed/`：新增三份固定內容 JSON；上線前需 `pnpm content:import`。
- 版本常數：新增系統不改動既有內容，`ONTOLOGY_VERSION`／`MAPPING_VERSION` 是否需升版，於 design 中確認。
- 不新增 dependency，不改 Firestore schema（框架已通用）。
- 追溯：本 change 不涉及 `openspec/analysis/` 既有項目的修改，若需補 requirement，另跑 `system-analysis`（待確認）。
