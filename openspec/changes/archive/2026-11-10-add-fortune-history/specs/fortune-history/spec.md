## ADDED Requirements

### Requirement: 歷史運勢的範圍與時間窗口
系統 SHALL 讓已登入使用者回看自己最近 3 個月（以台北日期計，起點為今天往前推 3 個月）的每日抽取結果，範圍為塔羅、盧恩與易經卦象；瑪雅 Kin 與星座運勢 MUST NOT 納入。窗口外的紀錄 MUST NOT 出現，即使它們仍存在於資料庫。卦象一天可有多卦，MUST 依序號全部列出。歷史 MUST 只含該使用者自己的紀錄。

#### Scenario: 三個月內的紀錄
- **WHEN** 使用者有 1 個月前的塔羅與盧恩紀錄
- **THEN** 歷史中出現該日期，並列出當天的塔羅與盧恩結果

#### Scenario: 窗口外的紀錄
- **WHEN** 使用者有 4 個月前仍存在的塔羅紀錄
- **THEN** 該紀錄不出現在歷史

#### Scenario: 同日多卦
- **WHEN** 使用者某天起了 3 卦
- **THEN** 該日期下依序號列出 3 卦，並標示第幾卦與是否為付費加卦

#### Scenario: 不含 Kin 與星座運勢
- **WHEN** 使用者開啟歷史
- **THEN** 歷史中沒有瑪雅 Kin 與星座運勢的項目

#### Scenario: 他人的紀錄
- **WHEN** 任何請求讀取歷史
- **THEN** 只回傳登入帳號自己的紀錄，無法指定其他使用者

### Requirement: 歷史運勢 API
系統 SHALL 提供 `GET /api/fortune/history`，MUST 要求有效登入，訪客與無憑證 MUST 回 401。查詢 MAY 帶 `before`（台北日期，游標）與 `limit`；`limit` 預設與上限 MUST 為 14，`before` MUST 為合法日期、不晚於今天且不早於窗口起點，否則 MUST 回驗證錯誤。回應 MUST 依日期由新到舊列出最多 `limit` 個有紀錄的日期，每個日期含塔羅、盧恩與卦象陣列，每項帶當時的固定內容；MUST 含 `nextBefore`（還有更舊的日期時為本頁最舊日期，否則為 null）與 `truncated`。沒有任何紀錄的日期 MUST NOT 出現。回應 MUST 通過 response schema 且 MUST 設為不可共用快取（private、no-store）。此 API MUST 為唯讀，MUST NOT 寫入任何資料。

#### Scenario: 第一頁
- **WHEN** 已登入使用者不帶 `before` 呼叫
- **THEN** 回應最近 14 個有紀錄的日期，由新到舊，並帶 `nextBefore`（若還有更舊的）

#### Scenario: 載入更多
- **WHEN** 使用者以上一頁的 `nextBefore` 作為 `before` 再次呼叫
- **THEN** 回應該日期之前的下一批日期，不重複上一頁的日期

#### Scenario: 沒有紀錄
- **WHEN** 使用者在窗口內沒有任何紀錄
- **THEN** 回應 200，`days` 為空、`nextBefore` 為 null

#### Scenario: 參數不合法
- **WHEN** `before` 不是合法日期、晚於今天、早於窗口起點，或 `limit` 超過 14
- **THEN** 回驗證錯誤，不查詢

#### Scenario: 訪客
- **WHEN** 訪客帶 guest session 或沒有任何憑證呼叫
- **THEN** 回 401

#### Scenario: 內容缺少
- **WHEN** 某筆紀錄對應的固定內容已不存在
- **THEN** 該項仍出現但內容為空，日誌記一筆警告，整頁不失敗

#### Scenario: 卦象紀錄過多
- **WHEN** 窗口內的卦象紀錄達到讀取上限
- **THEN** 回應標示 `truncated: true`，日誌記警告，不靜默截斷

#### Scenario: 只讀
- **WHEN** 呼叫歷史 API
- **THEN** 資料庫沒有任何新增或更新

### Requirement: 歷史運勢的前端呈現
系統 SHALL 在今日運勢頁提供「歷史」入口與 `#history` 面板。已登入使用者 SHALL 看到依日期由新到舊的列表，每天一張卡，列出當天各項結果（牌名與方位、符文與方位、卦名與動爻、第幾卦），可展開看完整內容，底部提供「載入更多」。沒有紀錄時 MUST 顯示空狀態並引導回今天的入口。訪客 MUST 只看到登入提示，MUST NOT 呼叫歷史 API。卦象項目 MUST 依 `HEXAGRAM_ENTRY_ENABLED` 顯示，關閉時 MUST NOT 出現。歷史面板 MUST 不新增任何抽取或扣點的操作。

#### Scenario: 開啟歷史
- **WHEN** 已登入使用者在今日運勢頁點「歷史」
- **THEN** 網址為 `#history`，顯示最近的日期卡，瀏覽器返回鍵回到入口格

#### Scenario: 展開完整內容
- **WHEN** 使用者展開某天的塔羅項目
- **THEN** 顯示該牌與方位的完整固定內容與免責聲明

#### Scenario: 載入更多
- **WHEN** 還有更舊的日期且使用者點「載入更多」
- **THEN** 附加下一批日期，既有項目不變

#### Scenario: 空狀態
- **WHEN** 使用者在窗口內沒有任何紀錄
- **THEN** 顯示空狀態與回到今天入口的連結

#### Scenario: 訪客看到登入提示
- **WHEN** 訪客點「歷史」
- **THEN** 顯示登入提示，沒有任何歷史 API 請求

#### Scenario: 卦象尚未啟用
- **WHEN** `HEXAGRAM_ENTRY_ENABLED` 為 false
- **THEN** 歷史中沒有卦象項目
