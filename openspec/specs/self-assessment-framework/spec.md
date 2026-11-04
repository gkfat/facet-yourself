# self-assessment-framework Specification

## Purpose
TBD - created by archiving change expand-self-analysis-dimensions. Update Purpose after archive.
## Requirements
### Requirement: 分析的定義與登錄表
系統 SHALL 以登錄表列出所有自我分析，每個分析有一份定義：識別碼、版本、題目或選項、純函式計分、結果內容金鑰。新增分析 MUST 只需新增定義並登錄，不需要新的 service、repository 或通用路由。識別碼不在登錄表中的請求 MUST 回傳 404。

#### Scenario: 登錄表中的分析
- **WHEN** 以登錄表中的識別碼請求測驗或結果
- **THEN** 系統依該分析的定義處理

#### Scenario: 不存在的分析
- **WHEN** 以登錄表以外的識別碼請求
- **THEN** 系統回傳 404，且不寫入任何文件

### Requirement: 伺服器端驗證與計分
系統 MUST 在伺服器端驗證作答並計分，MUST NOT 信任前端的分數。量表題的作答 MUST 每題恰好一次、值在量表範圍內、不含未知題目；挑選題的作答 MUST 只含清單內的項目、數量符合規定、不重複。不合法 MUST 回傳 400 並指出問題。計分 MUST 為固定規則的純函式，不呼叫 AI。

#### Scenario: 作答完整合法
- **WHEN** 送出完整且合法的作答
- **THEN** 系統計分並回傳結果

#### Scenario: 作答不合法
- **WHEN** 缺題、重複、值越界、含未知題目或項目數量不符
- **THEN** 系統回傳 400，列出有問題的項目，且不保存任何結果

### Requirement: 結果內容為固定文本 ASSESSMENT
系統 SHALL 以固定內容類型 `ASSESSMENT` 儲存各分析的結果文字，金鑰以分析識別碼開頭，合法金鑰由登錄表中各分析的定義決定。內容 MUST 事先撰寫，MUST NOT 呼叫 AI；MUST 以「傾向」的語氣描述，MUST NOT 使用診斷用語、MUST NOT 提及疾病、情緒障礙或治療、MUST NOT 與他人比較，MUST 附免責聲明。固定內容覆蓋檢查 MUST 納入所有已登錄分析的金鑰。

#### Scenario: 合法金鑰
- **WHEN** 匯入金鑰屬於某個已登錄分析的合法金鑰
- **THEN** 驗證通過

#### Scenario: 不合法金鑰
- **WHEN** 匯入金鑰不屬於任何已登錄分析
- **THEN** 驗證失敗並指出金鑰不合法

#### Scenario: 內容尚未發佈
- **WHEN** 計分後需要顯示的內容尚未發佈
- **THEN** 系統回傳 404，且不保存任何結果

### Requirement: 結果的保存、到期與刪除
已登入使用者完成分析時，系統 SHALL 在 `users/{uid}/assessmentAttempts/{attemptId}` 新增一筆紀錄（分析識別碼、版本、作答、結果、完成時間、到期時間），保存 3 個月，到期後 MUST 自動清除；刪除帳號與「刪除我的結果」時 MUST 一併刪除。訪客完成分析時 MUST NOT 寫入任何文件；訪客的結果只保留在瀏覽器當次的 session，登入後 SHALL 可選擇儲存。

#### Scenario: 登入者完成分析
- **WHEN** 已登入使用者送出合法作答
- **THEN** 系統計分、新增一筆紀錄並回傳結果

#### Scenario: 訪客完成分析
- **WHEN** 訪客送出合法作答
- **THEN** 系統回傳結果，但不寫入任何文件

#### Scenario: 取得最新結果
- **WHEN** 已登入使用者查詢某分析的最新結果
- **THEN** 回傳該分析最新一筆未到期的結果；沒有則回 404

#### Scenario: 到期與刪除
- **WHEN** 紀錄超過 3 個月，或使用者刪除帳號或刪除測驗結果
- **THEN** 該紀錄被清除

### Requirement: 通用的測驗頁與結果頁
系統 SHALL 提供 `/assessment/{id}` 測驗頁與 `/analysis/{id}` 結果頁。量表題的測驗頁 MUST 分頁顯示、顯示進度、已作答與未作答有明顯區別、全部作答後才可送出，作答暫存於 sessionStorage；挑選題的測驗頁 MUST 提供挑選與排序。結果頁 MUST 固定顯示「怎麼看這份結果」說明（只描述你自己的回答、不與他人比較、不是診斷）與免責聲明，以及該分析自己的結果區塊。

#### Scenario: 未答完不可送出
- **WHEN** 仍有題目未作答或挑選數量不符
- **THEN** 送出按鈕不可用

#### Scenario: 重新整理後繼續
- **WHEN** 使用者作答到一半重新整理頁面
- **THEN** 已作答的內容被保留

#### Scenario: 結果頁的固定說明
- **WHEN** 顯示任一分析的結果
- **THEN** 頁面包含「怎麼看這份結果」說明與免責聲明

### Requirement: 題目為自行設計並註明未經驗證
所有分析的題目 MUST 為自行設計，MUST NOT 翻譯、改寫或使用任何既有量表的題目。每個測驗頁與結果頁 MUST 固定註明「這些題目是自行設計的自我探索題目，沒有經過信度與效度驗證，不是任何既有量表」。版本識別 MUST 帶 `ref` 標記。系統 MUST NOT 以百分位、常模或「精準」之類的說法呈現結果。

#### Scenario: 測驗頁的註明
- **WHEN** 顯示任一分析的測驗頁
- **THEN** 頁面包含自行設計、沒有經過信度與效度驗證的註明

#### Scenario: 結果頁的註明與版本
- **WHEN** 顯示任一分析的結果
- **THEN** 頁面包含同樣的註明，且結果帶有帶 `ref` 標記的版本識別

### Requirement: 入口旗標
首頁（「從不同的角度認識自己」的兩類系統）與 `/self-reports` SHALL 依登錄表為每個分析提供卡片，每個分析各有入口旗標；旗標關閉時該分析的卡片 MUST NOT 出現在任何位置，頁面本身仍可由網址進入。

#### Scenario: 旗標關閉
- **WHEN** 某分析的入口旗標為關
- **THEN** 首頁與 `/self-reports` 都沒有該分析的卡片

#### Scenario: 旗標開啟
- **WHEN** 某分析的入口旗標為開且使用者已有未到期的結果
- **THEN** 卡片（首頁或 `/self-reports`）亮起並連到結果頁
