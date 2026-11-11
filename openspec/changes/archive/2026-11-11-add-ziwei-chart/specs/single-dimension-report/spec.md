## ADDED Requirements

### Requirement: 紫微斗數的單維度報告
系統 SHALL 為紫微斗數產生單維度報告：由紫微 adapter 把命盤事實與固定內容轉成 `SystemReportInput`，區塊順序與推論規則沿用既有報告管線。報告 MUST 為純函式、同一份輸入同一份報告；報告中的每個句子 MUST 帶 sources，且推論 MUST 只從畫面上顯示的命盤事實出發，MUST NOT 從借星推論。

#### Scenario: 產生報告
- **WHEN** 使用者有出生日期與時間並要求紫微報告
- **THEN** 報告包含命宮、身宮、五行局、主星、輔星與四化的事實與解讀，且每個句子可追溯來源

#### Scenario: 缺出生時間
- **WHEN** 使用者沒有出生時間
- **THEN** 不產生紫微報告並引導補填
