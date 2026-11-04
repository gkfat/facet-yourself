## 1. Schema 與常數

- [x] 1.1 `AI_QUESTION_MAX_LENGTH`、`aiQuestionSchema` 與測試
- [x] 1.2 single／multi AI 輸入加選填 `question`
- [x] 1.3 `aiReport` 的 Firestore 與 API schema（含 `sources`）及測試
- [x] 1.4 `aiReportCost`（1 個系統 1 點，多個依組合）與測試

## 2. 後端

- [x] 2.1 `QUESTION_RULES` 接入兩份 prompt，版本升 v2
- [x] 2.2 `AiReportService`：建立（驗證、計價、保存來源單維度快照、扣點與寫入同一交易、背景生成）、失敗退點、列表與逾時處理，含測試
- [x] 2.3 `POST /api/ai-reports`、`GET /api/ai-reports`
- [x] 2.4 移除 `SingleAnalysisService`、`MultiReportService`、舊 API、舊 schema 與測試；`singleReport.service`、snapshot 端點不再處理 `aiJob`
- [x] 2.5 `aiReports` 納入 dataExpiry、deletion（REPORTS）、cron schema 與對應測試
- [x] 2.6 `provision-firebase.ts`、`firestore.indexes.json`、`docs/firebase-setup.md`、`scripts/e2e-smoke.ts`
- [x] 2.7 `openspec/analysis/render/api.yaml` 改為 `/ai-reports`

## 3. 前端

- [x] 3.1 `AiReportList.vue`（單一列表、輪詢、失敗再問一次）與 `/ai-reports` 頁
- [x] 3.2 nav 新增會員專屬「分析紀錄」
- [x] 3.3 `AiReportEntry.vue` 取代單維度報告頁的 AI 面板
- [x] 3.4 `/report` 改為建立表單：1 到 N 個系統、提問、連結預選、送出後導向 `/ai-reports`
- [x] 3.5 移除 `SingleReportAiPanel`、`MultiReportView`、`app/pages/report/[id].vue`

## 3b. 報告骨架與導師 prompt

- [x] 3b.1 `aiAnalysis` schema：統一輸出（八段，提問段有提問才有）與輸入（今天日期、來源、洞見候選、提問）
- [x] 3b.2 `reportPrompt.ts`：導師身分、過去現在未來與提醒、保留限制與提問規則；移除舊的 single／multi prompt 與 schema
- [x] 3b.3 `assessAiReport`：章節順序、長度、依據、診斷、壽命生死、百分比、引用檢查；provider 合併為 `generate`
- [x] 3b.4 `AiReportService`：事實塊在建立時存入、完成時附加 AI 各段；列表只回卡片、新增 `GET /api/ai-reports/{id}`
- [x] 3b.5 報告頁 `/ai-reports/{id}` 與 `AiReportView`（事實、重點、正反並列、時間線、提問、結論）；列表卡片改為「查看報告」

## 3c. 條列式報告與事實摘要

- [x] 3c.1 `AI_REPORT_SECTIONS` 規定各段條列數量；輸出 schema 改為 `{ key, content, points, candidateIds }`，移除 `evidence`
- [x] 3c.2 prompt 逐章說明開頭與條列、共同的優勢與劣勢、回應與結論展開成條列、事實已列為標題與摘要；版本 `ai-report-v2`
- [x] 3c.3 品質檢查：條列數量與長度、移除依據檢查；測試更新
- [x] 3c.4 事實塊只存標題與摘要；AI 各段存成開頭加條列
- [x] 3c.5 畫面：分析概要、事實攤開（標題與摘要）、共同的優勢與劣勢、條列清單與加粗短標題、垂直時間線

## 4. 驗證與文件

- [x] 4.1 `pnpm lint`、`pnpm test`、`pnpm build` 通過
- [x] 4.2 手動驗證：單一系統與多系統各建一份、附問題、失敗再問一次、列表輪詢
- [x] 4.3 執行 `pnpm firebase:provision` 建立 `aiReports` 索引豁免
- [x] 4.4 命名定案：「綜合分析」（建立）、「深入分析」（單一系統入口與按鈕）、「分析紀錄」（列表），前端文案同步
- [x] 4.5 同步其餘 `openspec/analysis/*.yaml`（use-cases、api-model、data-model、traceability）
