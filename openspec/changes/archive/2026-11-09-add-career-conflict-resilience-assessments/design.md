## Context

`shared/assessments/` 已有統一框架（`defineScaleAssessment`／`defineSelectionAssessment`），目前 8 個測驗各一個定義檔，註冊於 `ASSESSMENTS`，路由、service、Firestore 皆為通用實作，不需為新測驗另開。新增一種測驗的接觸點：`ids.ts`（id 與 system id）、`index.ts`（註冊）、`entry.ts`（入口開關）、`app/utils/assessmentCards.ts`（卡片與順序）、`shared/ontology/mapping.ts`（來源類型與方法）、`shared/report/natureLabels.ts`、`content/fixed/<id>.json`。

三個測驗的題目為自編，沿用既有慣例：版本常數以 `-ref-v1` 結尾，表示「自行設計、未經驗證、非任何既有量表」。

## Goals / Non-Goals

**Goals:**
- 以最少新程式碼加入三個測驗，行為與既有測驗一致（計分、結果、報告、定價、分享）。
- 結果語氣保守、不貼標籤、不診斷，通過既有的措辭檢查。
- 三者能進入綜合報告，並有可追溯到特質軸的 mapping。

**Non-Goals:**
- 不重做 Big Five／Schwartz（已被 HEXACO、核心價值涵蓋）。
- 不引入有版權的原題庫，不使用 TKI、Career Anchors 商標名稱。
- 不改框架、Firestore schema、API 契約。
- 不處理認知風格、時間觀、自我效能、心流（另案評估）。

## Decisions

1. **生涯錨：scale + `ranked` view，8 向度 × 6 題 = 48 題。**
   向度：技術專長、管理、自主、安全穩定、創業創造、服務奉獻、挑戰、生活平衡。結果取前 3 名並列說明。替代方案：selection（挑選排序）題數少，但區分度低，且既有 core-values 已用該形式，故改用量表。

2. **衝突處理風格：scale + `quadrant` view，2 向度（關心目標、關心關係）× 10 題。**
   沿用 `attachmentStyle.ts` 的象限寫法：分數 ≥ 50 為高，向度為「中」時說明落在兩象限之間。四象限命名為「堅持型、配合型、迴避型、協商型」，中間地帶（妥協）由「兩向度皆為中」描述，而不增加第五象限，避免與 TKI 五型對應。

3. **心理韌性：scale + `profile` view，4 向度 × 6 題 = 24 題。**
   向度：復原速度、面對壓力、求助與支持、意義與調適。每個向度分低／中／高並附可練習方向。參考公開 BRS 的概念但不沿用其題目；含反向題，反向題須在 `scoring` 中翻轉。

4. **Mapping 全採 keyword 方法，來源類型 `questionnaire`。** 與其他自編問卷一致，一個來源不論多少測驗同意只算一票。各向度高低端指向既有 28 軸端點，實作時以 `pnpm ontology:check` 驗證；找不到合理對應的向度不強制對應。

5. **固定內容分兩層。** 向度／類型層（`<id>_type-*`、`<id>_quadrant-*`、`<id>_dimension-*`）各一則，內容含 summary、growthAdvice、disclaimer，並通過 `insightRules/validate.ts` 同級的措辭檢查（含「可能／傾向」，禁診斷與財務用語）。

6. **入口開關 `ASSESSMENT_ENTRY_ENABLED` 先設 false，內容匯入並完整做過一次後才設 true。** 與框架設計一致，可先上線程式碼而不外露。

7. **`basePrice` 沿用 1。** 與其他自編問卷相同，多維度定價不另調整。

## Risks / Trade-offs

- [自編題目無效度驗證，結果可信度被質疑] → 題名與結果頁固定標示「探索問卷」與「非診斷、非固定標籤」，版本常數帶 `ref`。
- [生涯錨 8 向度 48 題偏長，完成率下降] → 每向度 6 題為上限；實作時若題數過長，先縮到每向度 5 題，須同步更新 spec 與測試。
- [衝突風格四象限過度簡化] → 結果描述強調情境差異（對象、利害不同會換風格），並說明沒有最佳風格。
- [韌性被讀成診斷或能力評分] → 禁用「脆弱」「不健康」等詞，低分描述為「目前較少用到的資源」。
- [新增 3 個系統會改變綜合報告可選系統與定價] → 於 assessment-multi-dimension delta spec 明列，並跑 `shared/report/synthesis.test.ts` 與 `index.test.ts`。
- [`MAPPING_VERSION`／`ONTOLOGY_VERSION` 是否升版] → 新增系統不改既有內容，預設不升；若 mapping 檔結構有變動再升，實作時確認。

## Migration Plan

1. 合併程式碼，入口開關為 false。
2. `pnpm content:check` 後 `pnpm content:import content/fixed/<id>.json`（先 `--dry-run`）。
3. 完整做過三個測驗與綜合報告後，將 `ASSESSMENT_ENTRY_ENABLED` 對應項目設為 true 再部署。
4. 回滾：把開關改回 false 即可隱藏入口；已存的測驗結果依 id 保留，不需資料遷移。

## Open Questions

- 生涯錨 8 向度的名稱是否沿用 Schein 的常見譯名，或改用較中性的自訂名稱（避開商標疑慮）？預設：自訂中性名稱。
- 衝突風格兩向度的中間地帶是否要有專屬文案？預設：不另設，以「落在兩象限之間」處理。
- 三個測驗在首頁卡片的排序與分類（`practical`？）待確認，預設放在 `attachment-style` 之後的 `practical`。
