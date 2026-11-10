## ADDED Requirements

### Requirement: 64 卦與爻的經文常數
系統 SHALL 以程式常數提供 64 卦（King Wen 序 1–64）的卦序、卦名、上卦與下卦（八卦）、卦辭、彖辭、象辭，以及每卦六條爻辭（共 384 條），皆為公版經文原文；卦由「上卦、下卦」唯一決定，64 個組合 MUST 各對應一卦且不重複。乾與坤的用九、用六 MUST NOT 單獨成條。畫面呈現經文原文時 MUST 標示為「經文原文」。

#### Scenario: 六爻對應到卦
- **WHEN** 給定任一組六爻
- **THEN** 能唯一得到 1 至 64 的卦序、卦名與經文

#### Scenario: 常數完整
- **WHEN** 執行常數的完整性測試
- **THEN** 64 卦各有卦辭、彖辭、象辭與 6 條爻辭，總爻辭數為 384，卦序不重複

#### Scenario: 變卦
- **WHEN** 某卦的第 2 爻為動爻
- **THEN** 變卦為該爻陰陽翻轉後的卦，與其他爻不變的結果一致

### Requirement: 動爻的詮釋規則
系統 SHALL 以同一個純函式決定詮釋範圍並由 API 回傳 `mode`：無動爻（`none`）顯示本卦的卦辭、彖辭、象辭與白話解讀；恰一個動爻（`single`）另顯示該爻的爻辭與白話；兩個以上動爻（`multiple`，含六爻皆動）MUST NOT 展開各爻。有動爻（`single`、`multiple`）時 MUST 另外解讀變卦：回傳並顯示變卦自己的白話內容（標題、摘要、日常樣子、可留意之處與建議），說明變動之後的狀態，MUST NOT 另寫一份專供走向用的文案。

#### Scenario: 無動爻
- **WHEN** 六爻沒有動爻
- **THEN** `mode` 為 `none`，內容為本卦的卦辭與白話

#### Scenario: 一個動爻
- **WHEN** 六爻恰有一個動爻
- **THEN** `mode` 為 `single`，內容含本卦白話、該爻的爻辭與白話，以及變卦的解讀

#### Scenario: 解讀變動後的狀態
- **WHEN** 有一個以上的動爻
- **THEN** 回應的變卦帶有它自己的白話內容，畫面顯示變動之後這件事可能的狀態

#### Scenario: 兩個以上動爻
- **WHEN** 六爻有兩個以上動爻
- **THEN** `mode` 為 `multiple`，不展開任何爻，只解讀本卦與變卦

#### Scenario: 六爻皆動
- **WHEN** 六爻皆為老陰或老陽
- **THEN** 視為 `multiple`，不另有用九或用六的內容

### Requirement: 白話解讀的固定內容
系統 SHALL 以固定內容類型 `HEXAGRAM` 提供白話解讀共 448 筆：金鑰 `<卦序>`（64 筆，本卦白話）與 `<卦序>_<爻位>`（384 筆，爻位 1–6）。內容 MUST 為自撰、事先寫好，MUST NOT 呼叫 AI；欄位沿用既有固定內容：每一卦的本卦白話含 `title`、`summary`、`strengths`、`blindSpots`、`dailyBehavior`（日常的樣子）、`lifeContexts`（工作、人際、壓力、決定、習慣五個面向）、`growthAdvice`、`growthReflection`（可以運用、留意的習慣、想一想）與 `disclaimer`；每一爻的白話含 `title`、`summary`、`growthAdvice` 與 `disclaimer`。所需內容未發佈時，起卦 MUST 失敗（404）且不寫紀錄、不扣點。

#### Scenario: 金鑰
- **WHEN** 匯入 `HEXAGRAM` 內容
- **THEN** 只接受卦序 1–64 與 `<卦序>_<1..6>` 的金鑰，其餘驗證失敗

#### Scenario: 缺少內容
- **WHEN** 起卦得到的本卦或動爻內容尚未發佈
- **THEN** 回 404，沒有紀錄也沒有扣點

#### Scenario: 筆數
- **WHEN** 執行覆蓋檢查
- **THEN** 預期 448 筆 `HEXAGRAM` 內容，缺少、未發佈與多出皆為 0

### Requirement: 卦象內容的語氣與措辭
白話解讀 SHALL 以「這一刻的狀態，不是預言」的口吻描述可能與傾向，並附可以練習或留意的方向。內容 MUST NOT 含吉凶斷語（例如「大吉」「大凶」「必定」「災禍」）、MUST NOT 預測具體事件、MUST NOT 含診斷、醫療、法律或財務建議，MUST 通過匯入時的保守措辭檢查。固定的免責聲明 MUST 說明卦象僅供娛樂與自我反思參考，不預測未來。

#### Scenario: 含吉凶斷語
- **WHEN** 匯入的白話內容含吉凶斷語
- **THEN** 驗證失敗並指出該筆內容與詞句

#### Scenario: 免責聲明
- **WHEN** 畫面顯示任一卦的結果
- **THEN** 結果附有「僅供娛樂與自我反思參考、不預測未來」的聲明
