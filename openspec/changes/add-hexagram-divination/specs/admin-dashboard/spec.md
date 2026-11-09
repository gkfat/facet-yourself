## MODIFIED Requirements

### Requirement: 每日今日運勢使用數
Dashboard SHALL 以台北日期顯示近 30 天每日塔羅、盧恩與易經卦象的使用數，來源為會員的 `tarotDraws`、`runeDraws` 與 `hexagramDraws`（依 `drawnAt`）；卦象的使用數 MUST 為起卦數（含付費加卦）。訪客的抽取未寫入資料庫，MUST NOT 計入，畫面 MUST 標示「僅含會員」。星座運勢與 Maya Kin MUST NOT 納入。

#### Scenario: 每日統計
- **WHEN** 管理員開啟 Dashboard
- **THEN** 顯示每日的塔羅數、盧恩數與卦象數，沒有紀錄的日期顯示 0

#### Scenario: 台北跨日
- **WHEN** 一筆抽取發生在台北時間 00:30
- **THEN** 它被計入台北日期的當天，而不是 UTC 前一天

#### Scenario: 同日多卦
- **WHEN** 一位會員當天起了 3 卦
- **THEN** 該日卦象數增加 3

### Requirement: 每日點數消耗
Dashboard SHALL 顯示近 30 天每日被扣除的點數總量（`pointTransactions` 中 `type` 為 `DEDUCT`，依 `createdAt`），並可依 `reason` 拆分，拆分 MUST 含卦象加卦（`HEXAGRAM_CAST`）並以可讀的名稱顯示。REFUND MUST 另行呈現或從淨額扣除，且畫面 MUST 標明採用何種算法。

#### Scenario: 每日消耗
- **WHEN** 管理員開啟 Dashboard
- **THEN** 顯示每日扣點總量

#### Scenario: 有退款
- **WHEN** 某日同時有扣點與退款
- **THEN** 退款依標示的算法反映在該日數字

#### Scenario: 卦象加卦的拆分
- **WHEN** 某日有使用者付費加卦
- **THEN** 依 `reason` 拆分時出現「卦象加卦」一項，金額為該日加卦的扣點總和
