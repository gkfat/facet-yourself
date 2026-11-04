## Why

AI 進階分析原本分兩套：單維度報告最後的「進階分析」（寫在快照的 `ai` 欄位、重新分析就覆蓋），以及多維度報告生成時內含的 AI 改寫。使用者無法附帶自己的疑問，結果散在兩處，也沒有地方回頭看自己問過什麼。要收斂成「只有一種 AI 報告」，集中在 nav 的「分析紀錄」。

## What Changes

- 新增唯一的 **AI 報告**（`users/{uid}/aiReports/{id}`）：由 1 到 N 個單維度報告綜合而成，欄位 `sources[]` 記錄用了哪些單維度報告（system、snapshotId、當時的 position），並含提問、狀態、內容、點數、模型與版本、建立與到期時間。
- 建立方式統一：選 1 到 N 個系統、可附一段提問（100 字內）。1 個系統 1 點；2 個以上依組合計價（沿用 ×1.2、上限 30）；2 個以上時規則仍先找跨系統洞見、AI 只改寫並須引用，找不到洞見回 422 `NO_INSIGHTS`。
- 單維度報告頁最後的 AI 區塊改成入口：連到建立表單並預選該系統，不再在報告頁顯示 AI 結果。
- 「多維度分析」頁更名「綜合分析」並成為建立表單（可預選系統與提問），送出後導向「分析紀錄」；頁面不再列報告。
- nav 新增會員專屬「分析紀錄」（`/ai-reports`）：單一列表，含生成中（輪詢）、失敗已退點（可「再問一次」）與完成（展開閱讀）。
- 提問進入 prompt：以「資料而非指令」處理，prompt 版本升為 `single-analysis-v2`、`multi-analysis-v2`。
- 報告 6 個月到期，納入每日清除、「刪除報告」範圍與刪帳號。
- **BREAKING**：移除 `POST /api/single-reports/analysis`、`POST /api/multi-reports`、`/report/{id}` 頁與 `MultiReportView`；規則組裝的多維度報告不再保存、不再單獨呈現，只作 AI 輸入素材。快照上舊的 `ai`／`aiJob` 欄位不再寫入（不遷移，隨快照到期）。
- **BREAKING（規格層）**：「AI 輸入不含使用者自由文字」改為只允許這一段受限的提問。

## Capabilities

### New Capabilities
- `ai-report`: AI 報告的資料（含 `sources`）、建立與計價、提問、失敗退點、列表與頁面、期限與清除。

### Modified Capabilities
- `single-dimension-report`: 報告最後的 AI 區塊改為建立 AI 報告的入口。
- `multi-dimension-report`: 價格與流程改由 AI 報告承接；規則組裝的報告不再保存與呈現，一個系統時不再拒絕。
- `site-navigation`: nav 的「多維度分析」更名「綜合分析」，並新增會員專屬「分析紀錄」。
- `pricing-page`: 說明文字與一節標題改用「綜合分析」。

## Impact

- 後端：新增 `aiReport.service.ts`、`server/api/ai-reports/{index.get,index.post}.ts`、`aiReport` 的 API／Firestore schema、`aiReportCost`；移除 `singleAnalysis.service.ts`、`multiReport.service.ts` 與其 API、schema 和測試；`singleReport.service.ts`、snapshot 端點不再處理 `aiJob`；`dataExpiry`／`deletion` 改用 `aiReports`。
- 前端：新增 `AiReportList.vue`、`AiReportEntry.vue`、`app/pages/ai-reports.vue`；改寫 `app/pages/report/index.vue`；移除 `SingleReportAiPanel`、`MultiReportView`、`app/pages/report/[id].vue`；`app/layouts/default.vue` nav。
- Firestore：新集合 `aiReports`（數字 `expiresAt`，不開 TTL）；`provision-firebase.ts`、`firestore.indexes.json`、`docs/firebase-setup.md` 同步。
- `openspec/analysis/render/api.yaml` 已改為 `/ai-reports`（GET、POST）；其餘 analysis YAML 尚未同步。
- 不新增依賴。風險：提問是新的 prompt 注入面（見 design）。
