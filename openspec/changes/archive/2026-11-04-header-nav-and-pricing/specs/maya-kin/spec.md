## MODIFIED Requirements

### Requirement: 今日 Kin API 需登入
`GET` 與 `POST /api/kin/today` MUST 要求有效登入或有效的訪客 session（`X-Guest-Session-Id`），兩者皆無 MUST 回 401。會員的行為 MUST 不變（計算即解鎖並保存紀錄）。訪客的 `GET` MUST 一律回未解鎖（只含日期）；訪客的 `POST` MUST 回傳今日 Kin 與 `KIN_TODAY` 內容，MUST NOT 寫入任何資料、MUST NOT 扣點，訪客 session 不存在、已過期或已被 claim 時 MUST 回 401。回應 MUST 設為不可共用快取（private、no-store）。

#### Scenario: 沒有登入也沒有訪客 session
- **WHEN** 請求既無有效登入憑證也無有效訪客 session 呼叫任一今日 Kin 端點
- **THEN** 回傳 401，不寫入任何資料

#### Scenario: 訪客計算今日 Kin
- **WHEN** 持有有效 session 的訪客呼叫 POST
- **THEN** 回應 200，含今日 Kin 與內容，沒有寫入任何資料、沒有扣點

#### Scenario: 訪客查詢
- **WHEN** 訪客呼叫 GET
- **THEN** 回應 200，只含日期與未解鎖狀態，不洩漏 Kin
