## MODIFIED Requirements

### Requirement: 抽符 API 需登入且免費
系統 SHALL 提供 `GET /api/rune/daily`（查詢今天是否已抽、已抽則含符文與內容）與 `POST /api/rune/daily`（抽符），兩者 MUST 要求有效登入或有效的訪客 session（`X-Guest-Session-Id`），兩者皆無 MUST 回 401。抽符 MUST NOT 扣點、MUST NOT 呼叫 AI。回應 MUST 設為不可共用快取（private、no-store）。

#### Scenario: 尚未抽符時查詢
- **WHEN** 已登入使用者當天尚未抽符並呼叫 GET
- **THEN** 回應 200 與 `drawn: false`，不寫入

#### Scenario: 已抽符時查詢
- **WHEN** 使用者當天已抽符並呼叫 GET
- **THEN** 回應 200，含 `drawn: true`、符文資訊與內容

#### Scenario: 沒有登入也沒有訪客 session
- **WHEN** 請求既無有效登入憑證也無有效訪客 session 呼叫任一端點
- **THEN** 回應 401

#### Scenario: 內容尚未發佈
- **WHEN** 抽到的符文與方位尚無已發佈的內容
- **THEN** 抽符回應 404，且不建立當天的紀錄，使用者之後仍可抽符

## ADDED Requirements

### Requirement: 訪客抽符由 session 與日期決定且不儲存
系統 SHALL 讓持有有效訪客 session 的訪客抽符：符文與方位 MUST 以決定性的方式依「`guest:` 加訪客 session id + 台北日期 + 抽取規則版本」選出，MUST NOT 寫入任何 Firestore 文件、MUST NOT 扣點。訪客的 `GET` MUST 一律回 `drawn: false`；`POST` MUST 回傳符文與內容，同一 session 同一台北日期重複呼叫 MUST 得到相同結果。訪客 session 不存在、已過期或已被 claim 時 MUST 回 401。

#### Scenario: 訪客抽符
- **WHEN** 持有有效 session 的訪客呼叫 POST
- **THEN** 回應 200，含符文、方位與內容，沒有寫入任何資料

#### Scenario: 訪客重複抽符
- **WHEN** 同一個訪客 session 於同一台北日期再次呼叫 POST
- **THEN** 得到同一枚符文與同一個方位

#### Scenario: 訪客查詢
- **WHEN** 訪客呼叫 GET
- **THEN** 回應 200 與 `drawn: false`，不洩漏符文
