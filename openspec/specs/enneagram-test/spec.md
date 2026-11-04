# enneagram-test Specification

## Purpose
TBD - created by archiving change expand-self-analysis-dimensions. Update Purpose after archive.
## Requirements
### Requirement: 九型人格的題目與計分
系統 SHALL 提供九型人格測驗：九個類型各有同數量的題目，使用 5 點同意程度量表。系統 MUST 計算九個類型各自的分數（0–100），最高分者為最突出的類型；側翼 MUST 取該類型相鄰兩型中分數較高者；最高分與次高分差距小於 10 分（0–100 的分數）時，系統 MUST 並列呈現這兩型而不單獨斷定一型。系統 MUST NOT 稱使用者「就是」某一型。

#### Scenario: 單一最高分
- **WHEN** 某一型的分數明顯高於其他型
- **THEN** 結果以該型為最突出的傾向，並顯示側翼與九型的分數條

#### Scenario: 差距過小
- **WHEN** 最高分與次高分的差距小於 10 分
- **THEN** 結果並列這兩型，說明兩者都值得閱讀

### Requirement: 九型人格的結果內容
每個類型 SHALL 有固定內容：核心動機、核心恐懼、慣性（壓力下與放鬆時）、成長方向與可以留意的地方。內容 MUST 聚焦「為什麼會這樣做」，MUST 與 MBTI 和大五人格互補（不重複描述特質），並遵守固定內容守則。

#### Scenario: 結果頁的內容
- **WHEN** 顯示九型人格結果
- **THEN** 最突出類型的動機、恐懼、慣性與成長方向被顯示，並附九型的分數條

