## ADDED Requirements

### Requirement: 卦象加卦的扣點
系統 SHALL 支援扣點原因 `HEXAGRAM_CAST`（卦象加卦），每次 1 點。加卦的扣點 MUST 與卦象紀錄在同一個交易中完成，扣點交易的 id MUST 為確定性的 `hexagram:<uid>:<日期>:<序號>`，使同一序號只會被扣一次；點數不足時 MUST 拒絕且 MUST NOT 留下紀錄或扣點交易。每日第一卦 MUST NOT 產生扣點交易。

#### Scenario: 加卦扣點
- **WHEN** 使用者完成一次付費加卦
- **THEN** 出現一筆原因為 `HEXAGRAM_CAST`、金額 1 的扣點異動，並記錄所用批次

#### Scenario: 同一序號只扣一次
- **WHEN** 同一序號的加卦因重送或交易重試被處理兩次
- **THEN** 只有一筆扣點交易，餘額只少 1 點

#### Scenario: 第一卦不扣點
- **WHEN** 使用者起當日第一卦
- **THEN** 沒有任何扣點交易
