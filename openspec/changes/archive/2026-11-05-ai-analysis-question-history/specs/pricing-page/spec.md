## RENAMED Requirements

- FROM: `### Requirement: 方案之前先說明多維度分析是什麼`
- TO: `### Requirement: 方案之前先說明綜合分析是什麼`

## MODIFIED Requirements

### Requirement: Pricing 頁對所有人開放並說明點數
系統 SHALL 提供 `/pricing` 頁，訪客與會員皆可進入，並 MUST 說明：點數用在綜合分析、點數不會過期也不是訂閱、不付費也能持續使用免費內容。頁面 MUST NOT 以倒數、限量或其他施壓手法促使購買。

#### Scenario: 訪客開啟 Pricing
- **WHEN** 訪客開啟 `/pricing`
- **THEN** 頁面顯示點數說明，且顯示訪客提示（登入贈送 3 點、資料只暫存一天）

#### Scenario: 會員開啟 Pricing
- **WHEN** 已登入的會員開啟 `/pricing`
- **THEN** 頁面顯示相同內容，不顯示訪客提示

### Requirement: 方案之前先說明綜合分析是什麼
`/pricing` SHALL 在方案卡片之前，以「綜合分析是什麼？」一節說明：把選定的兩個以上維度放在一起，由 AI 比對呼應與拉扯的地方，寫成專屬的報告，並提供前往 `/report` 的連結。

#### Scenario: 先看到說明
- **WHEN** 任何人開啟 `/pricing`
- **THEN** 「綜合分析是什麼？」位於方案卡片之上，含簡短說明、三個步驟與前往 `/report` 的連結
