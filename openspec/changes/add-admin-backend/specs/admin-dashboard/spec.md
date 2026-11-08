## ADDED Requirements

### Requirement: Dashboard 僅限管理員
系統 SHALL 以 `/api/admin/dashboard/*` 提供 Dashboard 資料，並 MUST 通過 `requireAdmin`；回傳 MUST 只含彙總數字，唯一例外是多維度 AI 報告的使用者提問文字；任何回傳 MUST NOT 含使用者身分（uid、email）、報告內容或作答內容。

#### Scenario: 管理員讀取
- **WHEN** 管理員請求 Dashboard 資料
- **THEN** 系統回傳彙總結果

#### Scenario: 非管理員讀取
- **WHEN** 非管理員請求 Dashboard 資料
- **THEN** 系統回傳 403

### Requirement: 會員數指標
Dashboard SHALL 顯示總會員數與本月新會員數；本月以台北時區的月份起迄計算，來源為 `users.createdAt`。

#### Scenario: 月初跨月
- **WHEN** 台北時間進入新的一個月
- **THEN** 本月新會員從 0 重新計算

### Requirement: 單維度分析使用排行
Dashboard SHALL 顯示各單維度系統的分析數量排行（`kind` 為 SINGLE 的 reportSnapshots，依 `systems` 分組，時間依 `generatedAt`）。畫面 MUST 標示此數字為「已產生的分析快照數」，且資料受 6 個月保存期限影響。

#### Scenario: 排行
- **WHEN** 管理員開啟 Dashboard
- **THEN** 顯示各系統的快照數，由多到少排序

#### Scenario: 無資料
- **WHEN** 所選期間沒有任何快照
- **THEN** 顯示空狀態而非錯誤

### Requirement: 每日今日運勢使用數
Dashboard SHALL 以台北日期顯示近 30 天每日塔羅與盧恩的使用數，來源為會員的 `tarotDraws` 與 `runeDraws`（依 `drawnAt`）。訪客的抽取未寫入資料庫，MUST NOT 計入，畫面 MUST 標示「僅含會員」。星座運勢與 Maya Kin MUST NOT 納入。

#### Scenario: 每日統計
- **WHEN** 管理員開啟 Dashboard
- **THEN** 顯示每日的塔羅數與盧恩數，沒有紀錄的日期顯示 0

#### Scenario: 台北跨日
- **WHEN** 一筆抽取發生在台北時間 00:30
- **THEN** 它被計入台北日期的當天，而不是 UTC 前一天

### Requirement: 每日點數消耗
Dashboard SHALL 顯示近 30 天每日被扣除的點數總量（`pointTransactions` 中 `type` 為 `DEDUCT`，依 `createdAt`），並可依 `reason` 拆分。REFUND MUST 另行呈現或從淨額扣除，且畫面 MUST 標明採用何種算法。

#### Scenario: 每日消耗
- **WHEN** 管理員開啟 Dashboard
- **THEN** 顯示每日扣點總量

#### Scenario: 有退款
- **WHEN** 某日同時有扣點與退款
- **THEN** 退款依標示的算法反映在該日數字

### Requirement: OpenAI 預估成本
Dashboard SHALL 顯示近 30 天每日 OpenAI 預估成本與本月累計（來源 `aiUsageRecords.estimatedCost`，單位 USD）。畫面 MUST 標示為預估值，並可看到 token 用量；已去識別化（`userId` 為 null）的紀錄 MUST 仍納入計算。

#### Scenario: 每日成本
- **WHEN** 管理員開啟 Dashboard
- **THEN** 顯示每日預估成本與本月累計

#### Scenario: 已刪帳號的用量
- **WHEN** 某筆用量紀錄的 `userId` 已被清除
- **THEN** 它仍計入成本

### Requirement: 圖表與讀取成本控制
Dashboard SHALL 使用 chart.js 呈現趨勢；統計 MUST 使用 Firestore 聚合（count／sum）或有上限的範圍查詢，MUST NOT 全表載入文件到記憶體彙總。

#### Scenario: 資料量大
- **WHEN** 會員與紀錄數量很大
- **THEN** Dashboard 仍以聚合查詢回應，不載入全部文件

### Requirement: 多維度 AI 報告使用狀況
Dashboard SHALL 顯示 AI 報告（多維度報告）近期的使用狀況：依台北日期的成功（COMPLETED）與失敗（FAILED）次數與期間合計（進行中另列）、各報告使用的維度數分布與單份最大維度數，以及使用者提問列表（最新在前，上限 50 筆，只含有填寫提問的報告，附建立時間、狀態與使用的維度中文名，MUST NOT 含使用者身分）。統計 MUST 只讀取最近一批報告（上限 1000 筆），超過時 MUST 標示統計不完整；維度名稱 MUST 以中文顯示。

#### Scenario: 成功與失敗次數
- **WHEN** 管理員開啟 Dashboard，且期間內有已完成與失敗的 AI 報告
- **THEN** 顯示每日成功與失敗次數、期間合計，以及成功率

#### Scenario: 維度數
- **WHEN** 期間內的報告分別使用 1、2、3 個維度
- **THEN** 顯示各維度數的報告份數，以及最大維度數 3

#### Scenario: 提問列表
- **WHEN** 有使用者在 AI 報告填寫提問
- **THEN** 列表由新到舊顯示提問、時間、狀態與維度名稱，不顯示 uid 或 email

#### Scenario: 超過讀取上限
- **WHEN** 期間內報告多於 1000 筆
- **THEN** 只統計最新的 1000 筆，並標示較舊的日期統計不完整

#### Scenario: 沒有報告
- **WHEN** 期間內沒有任何 AI 報告
- **THEN** 顯示空狀態，各計數為 0
