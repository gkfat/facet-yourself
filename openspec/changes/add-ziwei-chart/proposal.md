## Why

紫微斗數是台灣使用者最熟悉、與現有八字、星座等系統最有區隔的命理系統，且八字已有農曆、出生時刻與報告管線可重用。本站目前沒有它，是命理類最明顯的缺口。規則決策已於 explore 階段定案（見 design 的 Decisions）。

## What Changes

- 新增紫微斗數排盤（純函式、同一份輸入永遠得到同一份命盤）：農曆年月日與閏月旗標 → 命宮、身宮、五行局、命主、身主、紫微星位、14 主星、4 輔星（文昌、文曲、左輔、右弼）、十二宮、生年四化。
- 固定算法規則（版本化為 `ZIWEI_ALGORITHM_VERSION`；採通行規則（命主依命宮地支），對照 iztro，並與使用者提供的兩張外部程式命盤吻合）：三合系統、農曆正月初一換年、閏月月中分界、晚子時日期不換日（與八字一致）、沿用八字的當地標準時間（已扣夏令，不做真太陽時）；沒有出生時間不提供紫微。
- 命盤事實與解讀分離：空宮仍保留為空宮（只看主星，輔星不算主星），借對宮主星只在解讀層；身宮是十二宮之一，不另建星曜資料。
- 新增固定內容（自撰、標示來源與版本）：14 主星、4 輔星、12 宮位、4 四化，命宮／身宮解讀由主星與宮位以規則組合，不做主星 × 宮位全組合。
- 新增單維度報告 adapter，並納入綜合報告可選系統（來源類型獨立為 `ziwei`，不與八字合併計票）；主星、輔星與四化以 keyword mapping 對到特質軸端點。
- 新增 `POST /api/ziwei/calculations`、命盤頁與報告頁元件、首頁／報告頁入口（入口開關預設關閉，內容匯入後才開）。
- 語氣規範：傾向式用語、禁吉凶壽夭財運與診斷用語、化忌不寫成壞事預告，固定標示「象徵性解讀，非科學測量」。
- 第一版不做：煞星與其他輔星、星曜亮度、大限流年流月小限、飛星四化、合盤、真太陽時。

## Capabilities

### New Capabilities
- `ziwei-chart`: 紫微排盤規則、命盤資料模型、邊界處理（閏月、晚子時、時辰交界）、輸入驗證與命盤頁。
- `ziwei-readings`: 紫微固定內容的分層結構、組合規則、語氣與來源標記。

### Modified Capabilities
- `single-dimension-report`: 新增紫微為可產生單維度報告的系統。
- `multi-dimension-report`: 新增紫微為可被選入綜合報告的系統與其基礎點數。
- `fixed-content-management`: 新增紫微固定內容的金鑰規則與匯入檢查。
- `trait-mapping`: 新增紫微的特質映射與其獨立來源類型。

## Impact

- 新增：`shared/utils/ziwei/*`（排盤與測試）、`shared/constants/ziwei*.ts`（星曜、宮位、四化表、標籤）、`shared/schemas/api/ziwei.schema.ts`、`shared/report/adapters/ziwei.ts`、`shared/ontology/mappings/ziwei.ts`、`server/api/ziwei/calculations.post.ts`、`server/services/ziwei.service.ts`、`app/components/ziwei/*`、`content/fixed/ziwei.json`。
- 修改：`shared/report/systems.ts`、`shared/utils/fixedContentKeys.ts`、`shared/utils/multiDimensionPricing.ts`、`shared/utils/analysisBasis.ts`、`shared/schemas/analysisBasis.schema.ts`、`shared/ontology/mapping.ts`、`shared/ontology/mappings/index.ts`、`shared/report/natureLabels.ts`、`shared/utils/explorationProgress.ts`、`server/utils/routeAccess.ts`（新 API 路徑規則）、`server/services/singleReport.service.ts`、`app/utils/reportDimensions.ts`、`app/pages/*` 入口。
- 版本常數：新增 `ZIWEI_ALGORITHM_VERSION`、紫微內容版本；紫微基礎點數比照八字 3 點，`ONTOLOGY_VERSION`／`MAPPING_VERSION`／`SINGLE_REPORT_TEMPLATE_VERSION` 不升版（已決定）。
- 不新增 dependency（沿用 `lunar-typescript`）；不新增 Firestore collection（命盤即時計算，版本由 `reportSnapshot` 記錄）。
- 追溯：本 change 的 requirement 來源為 explore 階段的決策討論（文件已移除，結論都在 design）；`openspec/analysis/` 已於 2026-11-11 補跑 `system-analysis` 至 `analysis-validator`（FR-096 至 FR-107、NFR-038 至 NFR-041、UC-061 至 UC-067、VO-040 至 VO-045、RULE-102 至 RULE-116、API-081），追溯見 `openspec/analysis/render/traceability.md`。
