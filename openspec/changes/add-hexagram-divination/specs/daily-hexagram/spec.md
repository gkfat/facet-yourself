## ADDED Requirements

### Requirement: 銅錢法起卦與變卦
系統 SHALL 以三枚銅錢法產生六爻（由下往上第 1 至 6 爻，每爻為老陰 6、少陽 7、少陰 8 或老陽 9），並推導本卦、動爻位置與變卦；動爻為老陰與老陽，變卦為動爻翻轉後的卦，無動爻時沒有變卦。結果 MUST 由伺服器依「對象、台北日期、當日序號、規則版本」決定性產生，同輸入同版本 MUST 得到同一結果；規則版本 MUST 隨每筆紀錄保存。請求 MUST NOT 能指定日期、身分、序號或爻值。每爻四種值的機率 MUST 為 1/8、3/8、3/8、1/8，使 64 卦出現的機率相同。

#### Scenario: 相同輸入相同結果
- **WHEN** 以相同的對象、日期、序號與規則版本重複計算
- **THEN** 得到相同的六爻、本卦與變卦

#### Scenario: 序號不同結果不同
- **WHEN** 同一對象同一日的序號 0 與序號 1 各計算一次
- **THEN** 兩者是各自決定的結果，可能不同

#### Scenario: 有動爻
- **WHEN** 六爻中有老陰或老陽
- **THEN** 結果列出動爻位置，並得到動爻翻轉後的變卦

#### Scenario: 無動爻
- **WHEN** 六爻皆為少陽或少陰
- **THEN** 結果沒有動爻也沒有變卦

#### Scenario: 分布
- **WHEN** 以大量不同的對象與日期計算
- **THEN** 六爻四種值的比例與 64 卦的出現率與銅錢法機率一致，64 卦都會出現

#### Scenario: 客戶端無法指定輸入
- **WHEN** 請求帶有日期、使用者識別、序號或爻值
- **THEN** 系統忽略它們，以伺服器的台北日期與登入憑證或訪客 session 為準

### Requirement: 每日第一卦免費
系統 SHALL 讓已登入使用者在每個台北日期第一次起卦時免費，MUST NOT 扣點、MUST NOT 呼叫 AI。第一卦（序號 0）MUST 寫入紀錄；同一天之後的查詢與換裝置 MUST 得到同一卦。日期 MUST 由伺服器以台北時間換算。

#### Scenario: 第一次起卦
- **WHEN** 已登入使用者當天第一次起卦
- **THEN** 系統建立序號 0 的紀錄並回傳卦象與內容，不扣點

#### Scenario: 換裝置
- **WHEN** 使用者在另一台裝置登入同一帳號並於同一個台北日期查詢
- **THEN** 看到同一個第一卦

#### Scenario: 並行的第一卦
- **WHEN** 同一帳號同時送出兩個起卦請求且當天還沒有卦
- **THEN** 只建立一份序號 0 的紀錄，且不扣點

#### Scenario: 隔天
- **WHEN** 台北日期變成下一天
- **THEN** 當天的序號重新從 0 開始，第一卦又是免費

### Requirement: 付費加卦
系統 SHALL 讓已登入使用者在當天已有第一卦後再起卦，每起一卦扣 1 點。扣點與紀錄 MUST 在同一個交易中完成：點數不足時 MUST 拒絕，MUST NOT 寫紀錄也 MUST NOT 扣點；成功時 MUST 寫入序號遞增的紀錄與一筆扣點交易。請求 MUST 可帶客戶端產生的冪等鍵（`requestId`），同一冪等鍵重送 MUST 回傳同一卦且 MUST NOT 再扣點。所需內容缺少時 MUST 在扣點前失敗。前端 MUST 在送出前顯示「將扣 1 點」並讓使用者確認。每日加卦次數 MUST NOT 設上限，只受點數限制。

#### Scenario: 加卦成功
- **WHEN** 使用者當天已有第一卦且有至少 1 點，確認後起卦
- **THEN** 系統扣 1 點並寫入下一個序號的紀錄，回傳新的一卦與最新點數

#### Scenario: 點數不足
- **WHEN** 使用者可用點數為 0 時要求加卦
- **THEN** 系統拒絕並回明確錯誤，沒有新紀錄，餘額不變

#### Scenario: 重送相同請求
- **WHEN** 同一冪等鍵的請求因網路重試被送出兩次
- **THEN** 只有一筆紀錄與一次扣點，兩次都得到同一卦

#### Scenario: 並行的不同請求
- **WHEN** 同一帳號同時以不同冪等鍵送出兩個加卦請求
- **THEN** 各自取得不同的序號並各扣 1 點，不會出現兩筆同序號的紀錄

#### Scenario: 缺少內容
- **WHEN** 加卦得到的卦象所需的固定內容尚未發佈
- **THEN** 系統回 404，沒有紀錄也沒有扣點

#### Scenario: 使用者取消
- **WHEN** 使用者在「將扣 1 點」的確認畫面取消
- **THEN** 不送出請求，不扣點

### Requirement: 訪客只有每日免費卦
系統 SHALL 讓持有有效 guest session 的訪客起當日免費的一卦，結果 MUST 由 session 與台北日期決定，MUST NOT 寫入任何伺服器紀錄；同一 session 同一日 MUST 得到同一卦。訪客 MUST NOT 加卦，嘗試時 MUST 被引導登入。訪客查詢 MUST 只得到日期與尚未起卦，不含卦象。

#### Scenario: 訪客起卦
- **WHEN** 訪客當天起卦
- **THEN** 回應卦象與內容，資料庫沒有任何新文件，不扣點

#### Scenario: 同一 session 再起
- **WHEN** 同一 guest session 當天再次起卦
- **THEN** 得到同一卦

#### Scenario: 訪客要求加卦
- **WHEN** 訪客要求第二卦
- **THEN** 系統拒絕並引導登入

### Requirement: 卦象 API 的存取與回應
系統 SHALL 提供 `GET /api/hexagram/daily`（查詢今日已起的各卦，只讀、不寫）與 `POST /api/hexagram/daily`（起卦；會員已有卦後的呼叫即為加卦），兩者 MUST 要求有效登入或有效的訪客 session（`X-Guest-Session-Id`），兩者皆無 MUST 回 401。是否扣點 MUST 由伺服器依今日已有的卦數決定，客戶端 MUST NOT 能自稱免費。請求 MUST NOT 接受任何使用者自由文字（包括想問的事），帶有時 MUST 回驗證錯誤。回應 MUST 設為不可共用快取（private、no-store），且 MUST 通過回應 schema。每筆回應 MUST 帶 `mode`：無動爻為 `none`、一個動爻為 `single`、兩個以上為 `multiple`。

#### Scenario: 尚未起卦時查詢
- **WHEN** 已登入使用者當天尚未起卦並呼叫 GET
- **THEN** 回應 200 與 `drawn: false`，不寫入

#### Scenario: 已起卦時查詢
- **WHEN** 使用者當天已有卦並呼叫 GET
- **THEN** 回應 200，依序號列出今日各卦的六爻、本卦、變卦、`mode` 與內容

#### Scenario: 無憑證
- **WHEN** 沒有登入憑證也沒有 guest session 呼叫任一路徑
- **THEN** 回 401

#### Scenario: 帶自由文字
- **WHEN** 請求帶有想問的事或其他自由文字欄位
- **THEN** 回驗證錯誤，不起卦、不扣點

### Requirement: 卦象紀錄的存放與清除
系統 SHALL 為已登入者每起一卦保存一筆紀錄於 `users/{uid}/hexagramDraws/{YYYY-MM-DD}_{seq}`，內容含台北日期、序號、六爻、起卦時間、到期時間、規則版本、是否付費、對應扣點交易與冪等鍵；MUST 只存六爻，本卦、變卦與動爻由純函式推導。到期時間 MUST 為起卦時間加 3 個月，到期後 MUST 由每日到期作業清除（MUST NOT 使用 Firestore TTL）。僅本人 MUST 可讀，所有資料 MUST 只經伺服器存取。刪除帳號與刪除資料 MUST 清除這些紀錄且 MUST NOT 影響其他使用者。卦象 MUST NOT 寫入報告快照。

#### Scenario: 紀錄內容
- **WHEN** 使用者完成一次付費加卦
- **THEN** 紀錄含六爻、序號、到期時間、規則版本、付費標記與扣點交易，且沒有本卦或變卦的衍生欄位

#### Scenario: 超過 3 個月
- **WHEN** 一筆卦象紀錄的起卦時間已超過 3 個月且到期作業執行
- **THEN** 該紀錄被清除，3 個月內的紀錄保留

#### Scenario: 刪除帳號
- **WHEN** 使用者刪除帳號
- **THEN** 其全部 `hexagramDraws` 紀錄被清除，其他使用者的紀錄不受影響

#### Scenario: 不寫快照
- **WHEN** 使用者起卦
- **THEN** 不產生任何報告快照

### Requirement: 卦象的前端呈現
系統 SHALL 在今日運勢頁與首頁「今日運勢」區塊提供卦象入口，並標示結果隨時間變動。起卦時六爻 SHALL 由下往上逐爻浮現，標明少陰、少陽、老陰或老陽，最後並排呈現本卦與變卦（無變卦時只呈現本卦）；內容依 `mode` 顯示卦辭、該爻爻辭，或本卦與變卦。六爻 MUST 以向量圖繪製，MUST NOT 依賴卦象 Unicode 字元。畫面結果 MUST 取自 API 回應，動畫只負責播放。啟用減少動態偏好時 MUST 不播放動畫、直接顯示結果。六爻圖 MUST 提供文字替代，說明卦名、各爻陰陽與動爻。入口 MUST 由 `HEXAGRAM_ENTRY_ENABLED` 控制，關閉時 MUST NOT 顯示。

#### Scenario: 逐爻浮現
- **WHEN** 使用者起卦成功
- **THEN** 六爻由第 1 爻到第 6 爻依序出現，並標明各爻名稱與動爻

#### Scenario: 減少動態
- **WHEN** 使用者的系統啟用減少動態偏好
- **THEN** 不播放逐爻動畫，結果直接顯示

#### Scenario: 文字替代
- **WHEN** 輔助科技讀取六爻圖
- **THEN** 讀到卦名、六爻陰陽與動爻位置

#### Scenario: 入口關閉
- **WHEN** `HEXAGRAM_ENTRY_ENABLED` 為 false
- **THEN** 今日運勢頁與首頁都不顯示卦象，直接進入頁面時仍可運作

### Requirement: 卦象不進報告管線
系統 MUST NOT 為卦象提供單維度報告、綜合分析的可選系統、特質映射或 AI 報告來源；MUST NOT 呼叫 AI；MUST NOT 新增任何 ontology 映射或提高 `MAPPING_VERSION`。

#### Scenario: 不在綜合分析清單
- **WHEN** 使用者開啟綜合分析的選擇畫面
- **THEN** 清單中沒有卦象

#### Scenario: 沒有映射
- **WHEN** 執行 `pnpm ontology:check`
- **THEN** 檢查通過，且沒有任何指向卦象的映射
