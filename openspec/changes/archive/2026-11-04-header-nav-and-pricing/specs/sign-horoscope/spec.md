## MODIFIED Requirements

### Requirement: 今日星座運勢 API 需登入、免費、不儲存
系統 SHALL 提供 `GET /api/horoscope/daily`，要求有效登入或有效的訪客 session（`X-Guest-Session-Id`），兩者皆無 MUST 回 401。太陽星座對會員 MUST 取自已儲存的個人資料，對訪客 MUST 取自該 session 暫存的出生日期。回應 MUST 含台北日期、使用者的太陽星座，以及五顆天體各自的所在星座、落在使用者的第幾宮與該宮的固定內容。此 API MUST NOT 扣點、MUST NOT 呼叫 AI、MUST NOT 寫入任何資料。沒有出生日期時 MUST 回 422 並要求先填寫。任一筆需要的內容尚未發佈時 MUST 回 404，MUST NOT 退回預設內容。回應 MUST 設為不可共用快取（private、no-store）。

#### Scenario: 取得今日星座運勢
- **WHEN** 已登入且有出生日期的會員呼叫
- **THEN** 回 200，含日期、太陽星座與五顆天體的所在星座、宮位與內容，沒有寫入任何資料、沒有扣點

#### Scenario: 訪客取得今日星座運勢
- **WHEN** 持有有效 session 且已暫存出生日期的訪客呼叫
- **THEN** 回 200，內容與同一星座的會員相同，沒有寫入任何資料

#### Scenario: 沒有出生日期
- **WHEN** 沒有出生日期的會員，或尚未暫存出生日期的訪客呼叫
- **THEN** 回 422，要求先填寫出生日期

#### Scenario: 內容尚未發佈
- **WHEN** 今天需要的任一筆 `HOROSCOPE` 內容尚未發佈
- **THEN** 回 404

#### Scenario: 沒有登入也沒有訪客 session
- **WHEN** 請求既無有效登入憑證也無有效訪客 session
- **THEN** 回 401
