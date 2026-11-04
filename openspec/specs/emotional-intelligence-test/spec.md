# emotional-intelligence-test Specification

## Purpose
TBD - created by archiving change expand-self-analysis-dimensions. Update Purpose after archive.
## Requirements
### Requirement: 情緒智商的面向與計分
系統 SHALL 提供情緒智商測驗，涵蓋情緒覺察、情緒調節、同理心、人際情緒處理四個面向，各有同數量的題目，含反向題。系統 MUST 計算四個面向各自的分數（0–100）與等級（低 < 40、中 40–60、高 > 60），MUST NOT 提供單一的「智商」總分，MUST NOT 使用百分位。

#### Scenario: 四個面向
- **WHEN** 使用者完成測驗
- **THEN** 結果顯示四個面向的分數與等級，沒有總分

### Requirement: 情緒智商的結果內容
每個面向的每個等級 SHALL 有固定內容：目前的樣子、可能的優勢、可以留意的地方、可以練習的方向。內容 MUST 強調情緒能力可以練習而不是固定的，MUST NOT 使用診斷用語，MUST 回應「我如何理解和處理自己及他人的情緒」。

#### Scenario: 結果頁的呈現
- **WHEN** 顯示結果
- **THEN** 每個面向顯示對應等級的內容與可以練習的方向，並說明情緒能力可以練習

