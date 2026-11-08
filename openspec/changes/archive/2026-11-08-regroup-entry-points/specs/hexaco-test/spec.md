## MODIFIED Requirements

### Requirement: 取代大五人格測驗
HEXACO 發佈並開啟入口後，系統 SHALL 以它作為特質類測驗，現有的大五人格測驗依 `big-five-test` 的移除需求下線。HEXACO 的結果頁 MUST NOT 引用大五人格的結果。

#### Scenario: HEXACO 上線後
- **WHEN** HEXACO 已發佈並可使用
- **THEN** 首頁的「人格與心理系統」與 `/self-reports` 含 HEXACO 的卡片，且大五人格的入口已關閉
