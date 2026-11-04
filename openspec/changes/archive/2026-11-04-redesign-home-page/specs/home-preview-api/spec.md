## ADDED Requirements

### Requirement: 首頁預覽 API 一次回傳星座與生命靈數的摘要
系統 SHALL 提供 `GET /api/home/preview`，接受查詢參數 `sign`（星座名稱）與 `lifePath`（生命靈數的數字），回傳對應固定內容（`ZODIAC` 與 `NUMEROLOGY`）的標題與摘要。此 API MUST 為公開（不需登入、不使用 guest session）、MUST NOT 呼叫 AI、MUST NOT 寫入任何使用者資料，請求 MUST NOT 帶出生日期。回應 MUST 只含 `zodiac` 與 `numerology` 兩項，各項為 `{ title, summary }` 或 `null`，MUST NOT 含固定內容的其他欄位。對應內容尚未發佈的項目 MUST 回 `null`，MUST NOT 讓整個請求失敗，也 MUST NOT 退回預設內容。

#### Scenario: 兩者都有
- **WHEN** 以合法的 `sign` 與 `lifePath` 呼叫且兩份內容都已發佈
- **THEN** 回 200，含 `zodiac` 與 `numerology` 各自的標題與摘要

#### Scenario: 只問一項
- **WHEN** 只帶 `sign`
- **THEN** 回 200，`zodiac` 有內容，`numerology` 為 `null`

#### Scenario: 其中一份尚未發佈
- **WHEN** 星座的內容已發佈、該生命靈數的內容尚未發佈
- **THEN** 回 200，`zodiac` 有內容，`numerology` 為 `null`

#### Scenario: 回應精簡
- **WHEN** 任一請求成功
- **THEN** 回應的每一項只含 `title` 與 `summary`

### Requirement: 輸入嚴格驗證
系統 MUST 驗證查詢參數：`sign` 為十二星座之一，`lifePath` 為 1 至 9、11、22 或 33；兩者至少要有一個。不合法的輸入 MUST 回 400 並含明確的驗證錯誤，MUST NOT 讀取 Firestore、MUST NOT 消耗限流額度。未知的參數 MUST 被忽略。

#### Scenario: 不合法的星座
- **WHEN** `sign` 不是十二星座之一
- **THEN** 回 400，沒有讀取 Firestore

#### Scenario: 不合法的生命靈數
- **WHEN** `lifePath` 為 10 或 44
- **THEN** 回 400

#### Scenario: 兩者皆缺
- **WHEN** 沒有帶 `sign` 也沒有 `lifePath`
- **THEN** 回 400

### Requirement: 回應可被快取
成功（200）的回應 MUST 帶可被共用快取的標頭（`public`，含 `s-maxage` 與 `stale-while-revalidate`），讓相同的查詢由 CDN 回答；錯誤回應（4xx、429、5xx）MUST 標示不可快取（`no-store`）。伺服器 MUST 另以 per-instance 的記憶體快取保存已讀過的內容：有內容的項目保留較長時間，尚未發佈的項目（`null`）保留較短時間；快取命中時 MUST NOT 讀取 Firestore。

#### Scenario: 成功的回應可共用快取
- **WHEN** 請求成功
- **THEN** 回應的 `Cache-Control` 為 `public` 並含 `s-maxage`

#### Scenario: 錯誤不被快取
- **WHEN** 請求回 400 或 429
- **THEN** 回應的 `Cache-Control` 為 `no-store`

#### Scenario: 記憶體快取命中
- **WHEN** 同一個實例在快取有效期間內收到相同項目的請求
- **THEN** 不讀取 Firestore，也不消耗限流額度

#### Scenario: 未發佈的內容短暫快取
- **WHEN** 某項內容尚未發佈
- **THEN** 該 `null` 結果在較短的期間內被快取，期間內的重複請求不讀取 Firestore

### Requirement: 讀取 Firestore 的請求受限流
當請求需要讀取 Firestore（記憶體快取未命中）時，系統 SHALL 先以客戶端 IP 的 keyed hash 為鍵、以 `RateLimitService` 消耗一次額度，超過上限 MUST 回 429，MUST NOT 讀取 Firestore。限流的鍵 MUST NOT 含可識別的 IP 原文。無法判斷 IP 時 MUST 使用同一個共用的桶。已被記憶體快取命中的請求 MUST NOT 消耗額度。

#### Scenario: 在額度內
- **WHEN** 某 IP 在視窗內的 miss 次數未超過上限
- **THEN** 請求正常取得內容

#### Scenario: 超過額度
- **WHEN** 某 IP 在視窗內的 miss 次數已達上限後再有 miss 的請求
- **THEN** 回 429，沒有讀取 Firestore

#### Scenario: 快取命中不計數
- **WHEN** 請求由記憶體快取回答
- **THEN** 不呼叫限流，也不產生任何 Firestore 讀寫

#### Scenario: 鍵不含 IP 原文
- **WHEN** 限流寫入計數
- **THEN** 鍵由 IP 的 keyed hash 組成，不含 IP 原文

### Requirement: 首頁預覽 API 的存取規則
`GET /api/home/preview` MUST 在 `routeAccess` 中被分類為 `public`。

#### Scenario: 路由分類
- **WHEN** 以 GET 分類 `/api/home/preview`（含查詢字串）
- **THEN** 結果為 `public`
