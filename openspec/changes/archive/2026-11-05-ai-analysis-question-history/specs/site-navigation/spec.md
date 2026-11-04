## MODIFIED Requirements

### Requirement: md 以上以 header nav 呈現主要 routes
系統 SHALL 在視窗寬度為 md（960px）以上時，於 header 品牌右側靠左顯示主要 routes 的導覽，依序為：今日運勢（`/fortune`，三項每日內容皆未啟用時 MUST NOT 顯示）、個人資料（`/profile`，僅會員）、自我探索（`/self-reports`）、綜合分析（`/report`）、點數方案（`/pricing`）。這些項目 MUST 由單一清單定義，header 與 drawer 共用。目前所在頁面的項目 MUST 有可辨識的作用中樣式。

#### Scenario: md 以上的會員
- **WHEN** 已登入的會員在 md 以上的視窗開啟任何頁面
- **THEN** header 靠左依序顯示今日運勢、個人資料、自我探索、綜合分析、點數方案，並在右側顯示點數與 menu 按鈕

#### Scenario: md 以上的訪客
- **WHEN** 未登入的訪客在 md 以上的視窗開啟任何頁面
- **THEN** header 顯示今日運勢、自我探索、綜合分析、點數方案（不含個人資料）與「登入」按鈕，不顯示點數

#### Scenario: 每日內容全部未啟用
- **WHEN** 塔羅、瑪雅 Kin、盧恩的入口旗標皆關閉
- **THEN** header 與 drawer 都不顯示「今日運勢」

### Requirement: 訪客可進入所有 nav routes
系統 SHALL 讓訪客能進入 nav 的每一個 routes（今日運勢、自我探索、綜合分析、點數方案），MUST NOT 因未登入而導回首頁。個人資料 MUST NOT 出現在訪客的 nav 與 drawer，但直接開啟 `/profile` 時 MUST NOT 導回首頁。md 以下時，訪客 MUST 也有 menu 按鈕，開啟的 drawer 只含訪客可見的 nav 項目，MUST NOT 含帳號項目與登出。

#### Scenario: 訪客進入今日運勢
- **WHEN** 訪客直接開啟 `/fortune`
- **THEN** 頁面正常顯示，不導向首頁或登入頁

#### Scenario: md 以下的訪客
- **WHEN** 訪客在 md 以下點擊 menu 按鈕
- **THEN** drawer 只顯示訪客可見的 nav 項目（不含個人資料），沒有點數紀錄、付款紀錄、帳號管理與登出

#### Scenario: 訪客直接開啟個人資料
- **WHEN** 訪客直接開啟 `/profile`
- **THEN** 頁面正常顯示並附訪客提示，不導回首頁

## ADDED Requirements

### Requirement: nav 含「分析紀錄」
系統 SHALL 在主要 routes 清單中，於綜合分析（`/report`）與點數方案（`/pricing`）之間加入「分析紀錄」（`/ai-reports`），僅會員顯示。header（md 以上）與 drawer（md 以下）MUST 共用同一份清單；訪客的 nav 與 drawer MUST NOT 顯示此項，但直接開啟 `/ai-reports` 時 MUST NOT 導回首頁。

#### Scenario: 會員看到項目
- **WHEN** 已登入的會員在 md 以上開啟任何頁面
- **THEN** header 在綜合分析之後顯示「分析紀錄」

#### Scenario: md 以下的會員
- **WHEN** 會員在 md 以下開啟 drawer
- **THEN** 清單在綜合分析之後含「分析紀錄」

#### Scenario: 訪客不顯示
- **WHEN** 訪客開啟任何頁面
- **THEN** nav 與 drawer 都不含「分析紀錄」
