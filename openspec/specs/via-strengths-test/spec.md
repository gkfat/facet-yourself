# via-strengths-test Specification

## Purpose
TBD - created by archiving change expand-self-analysis-dimensions. Update Purpose after archive.
## Requirements
### Requirement: 品格優勢的題目與計分
系統 SHALL 提供品格優勢測驗，涵蓋 24 種品格優勢，每項有同數量的題目，使用 5 點同意程度量表。系統 MUST 計算 24 項各自的分數並排序，取最突出的前 5 項；分數相同時 MUST 以固定規則決定先後，使同樣的作答永遠得到同樣的結果。

#### Scenario: 取前 5 項
- **WHEN** 使用者完成測驗
- **THEN** 結果列出最突出的 5 項品格優勢與各自的分數，並可展開看全部 24 項的排序

#### Scenario: 分數相同
- **WHEN** 兩項優勢分數相同
- **THEN** 以固定規則決定順序，重複計分得到相同結果

### Requirement: 品格優勢的結果內容
每項品格優勢 SHALL 有固定內容：它是什麼、在日常如何表現、用得太過時的樣子、如何發揮。結果頁 MUST 以「我有哪些值得發揮的內在優勢」為主軸，MUST NOT 把排在後面的優勢描述成缺點。

#### Scenario: 結果頁的呈現
- **WHEN** 顯示結果
- **THEN** 前 5 項優勢各有說明與發揮建議，且後段的優勢只標示為「較不突出」而非不足

