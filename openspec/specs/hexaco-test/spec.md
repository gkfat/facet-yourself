# hexaco-test Specification

## Purpose
TBD - created by archiving change expand-self-analysis-dimensions. Update Purpose after archive.
## Requirements
### Requirement: HEXACO 的題目與計分
系統 SHALL 提供 HEXACO 測驗：六個維度（誠實謙遜、情緒性、外向性、宜人性、盡責性、開放性）各有同數量的題目，含反向題，使用 5 點同意程度量表。系統 MUST 在伺服器端計分，每個維度 0–100 並分成低（< 40）、中（40–60）、高（> 60）三級，MUST NOT 使用百分位。

#### Scenario: 六個維度
- **WHEN** 使用者完成測驗
- **THEN** 結果含六個維度的分數與等級

#### Scenario: 反向題
- **WHEN** 某維度的反向題作答最高分
- **THEN** 該題以最低分計入該維度

### Requirement: 誠實謙遜維度的說明
HEXACO 的結果頁 SHALL 說明六個維度各自的意思，並特別說明「誠實謙遜」：它描述的是真誠、公平、不貪圖、不自誇的傾向。內容 MUST 以「傾向」的語氣描述，MUST NOT 把低分描述為不誠實或品格缺陷，MUST NOT 與他人比較。

#### Scenario: 誠實謙遜的內容
- **WHEN** 顯示結果
- **THEN** 誠實謙遜維度有固定內容，描述高、中、低各自的樣子，且低分沒有被描述成缺陷

### Requirement: 取代大五人格測驗
HEXACO 發佈並開啟入口後，系統 SHALL 以它作為特質類測驗，現有的大五人格測驗依 `big-five-test` 的移除需求下線。HEXACO 的結果頁 MUST NOT 引用大五人格的結果。

#### Scenario: HEXACO 上線後
- **WHEN** HEXACO 已發佈並可使用
- **THEN** 首頁與 `/self-reports` 顯示 HEXACO 的卡片，且大五人格的入口已關閉

