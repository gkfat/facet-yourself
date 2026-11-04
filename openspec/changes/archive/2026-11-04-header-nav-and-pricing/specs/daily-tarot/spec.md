## MODIFIED Requirements

### Requirement: 翻牌 API 需登入且免費
系統 SHALL 提供 `GET /api/tarot/daily`（查詢今天是否已翻、已翻則含牌與內容）與 `POST /api/tarot/daily`（翻牌），兩者 MUST 要求有效登入或有效的訪客 session（`X-Guest-Session-Id`），兩者皆無 MUST 回 401。翻牌 MUST NOT 扣點。回應 MUST 設為不可共用快取（private、no-store）。

#### Scenario: 尚未翻牌時查詢
- **WHEN** 已登入使用者當天尚未翻牌並呼叫 GET
- **THEN** 回應 200 與 `drawn: false`，不寫入

#### Scenario: 已翻牌時查詢
- **WHEN** 使用者當天已翻牌並呼叫 GET
- **THEN** 回應 200，含 `drawn: true`、牌資訊與內容

#### Scenario: 沒有登入也沒有訪客 session
- **WHEN** 請求既無有效登入憑證也無有效訪客 session 呼叫任一端點
- **THEN** 回應 401

#### Scenario: 內容尚未發佈
- **WHEN** 抽到的牌與方位尚無已發佈的內容
- **THEN** 翻牌回應 404，且不建立當天的紀錄，使用者之後仍可翻牌

## ADDED Requirements

### Requirement: 訪客翻牌由 session 與日期決定且不儲存
系統 SHALL 讓持有有效訪客 session 的訪客翻牌：牌與正逆位 MUST 以決定性的方式依「`guest:` 加訪客 session id + 台北日期 + 抽牌規則版本」選出，MUST NOT 寫入任何 Firestore 文件、MUST NOT 扣點。訪客的 `GET` MUST 一律回 `drawn: false`；`POST` MUST 回傳牌與內容，同一 session 同一台北日期重複呼叫 MUST 得到相同結果。訪客 session 不存在、已過期或已被 claim 時 MUST 回 401。

#### Scenario: 訪客翻牌
- **WHEN** 持有有效 session 的訪客呼叫 POST
- **THEN** 回應 200，含牌、正逆位與內容，沒有寫入任何資料

#### Scenario: 訪客重複翻牌
- **WHEN** 同一個訪客 session 於同一台北日期再次呼叫 POST
- **THEN** 得到同一張牌與同一個正逆位

#### Scenario: 訪客查詢
- **WHEN** 訪客呼叫 GET
- **THEN** 回應 200 與 `drawn: false`，不洩漏牌

#### Scenario: session 已過期
- **WHEN** 訪客以過期或已 claim 的 session 呼叫任一端點
- **THEN** 回應 401

#### Scenario: 種子不與帳號碰撞
- **WHEN** 計算訪客與會員的牌
- **THEN** 訪客的種子帶 `guest:` 前綴，不會與任何帳號的種子相同
