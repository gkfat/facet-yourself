## MODIFIED Requirements

### Requirement: 抽符紀錄的保留與刪除
每筆抽符紀錄 SHALL 保存 3 個月，MUST 帶有 `expiresAt`（抽符時間加 3 個月），並由每日到期清除作業刪除已到期者，MUST NOT 使用 Firestore TTL；刪除帳號時 MUST 一併刪除該使用者全部的抽符紀錄。

#### Scenario: 超過 3 個月被排程清除
- **WHEN** 到期清除作業執行，且存在超過 3 個月的抽符紀錄
- **THEN** 這些抽符紀錄被刪除，3 個月內的紀錄保留

#### Scenario: 新紀錄帶到期時間
- **WHEN** 會員完成當日抽符
- **THEN** 新建立的抽符紀錄的 `expiresAt` 為抽符時間加 3 個月

#### Scenario: 刪除帳號
- **WHEN** 使用者刪除帳號
- **THEN** 該使用者的所有抽符紀錄被移除
