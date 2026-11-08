# admin-user-management Specification

## Purpose
後台使用者列表與停用、啟用、刪除。

## Requirements

### Requirement: 後台使用者列表
系統 SHALL 在後台提供會員列表，以 cursor 分頁讀取（單頁筆數有上限），預設依註冊時間由新到舊排序，顯示 email、註冊時間、停用狀態。API 輸入 MUST 以 zod 驗證，回傳 MUST 通過 response schema；MUST NOT 一次載入全部會員。

#### Scenario: 載入第一頁
- **WHEN** 管理員開啟使用者列表
- **THEN** 系統回傳第一頁會員與下一頁 cursor

#### Scenario: 載入下一頁
- **WHEN** 管理員帶上一頁回傳的 cursor 請求
- **THEN** 系統回傳接續的會員，不重複也不遺漏

#### Scenario: 無效的分頁參數
- **WHEN** cursor 無效或單頁筆數超過上限
- **THEN** 系統回傳驗證錯誤

### Requirement: 以 email 搜尋會員
系統 SHALL 支援以 email 搜尋會員；搜尋 MUST 在伺服器端執行並沿用分頁。

#### Scenario: 搜尋存在的 email
- **WHEN** 管理員輸入完整 email 搜尋
- **THEN** 列表只顯示符合的會員

#### Scenario: 搜尋不到
- **WHEN** 沒有會員符合
- **THEN** 列表顯示空狀態

### Requirement: 列表直接顯示會員資訊
後台使用者列表 SHALL 在每一列直接顯示該會員的 email、UID、停用狀態、可用點數、已完成的多維度 AI 報告次數（COMPLETED，受 6 個月保存期限影響）、註冊時間與最後登入時間，MUST NOT 另設詳情頁或詳情視窗；MUST NOT 顯示測驗作答內容、報告內容或生日等個人資料。單一欄位讀取失敗時 MUST 顯示為未知而仍列出該會員，且 MUST 記錄錯誤。

#### Scenario: 列表欄位
- **WHEN** 管理員開啟使用者列表
- **THEN** 每列都顯示上述欄位，不含報告或作答內容

#### Scenario: 多維度報告次數
- **WHEN** 某會員有 2 份已完成、1 份失敗、1 份進行中的 AI 報告
- **THEN** 該列的多維度報告次數為 2，且不計入其他會員的報告

#### Scenario: 點數讀取失敗
- **WHEN** 某會員的點數餘額讀取失敗
- **THEN** 該列的點數顯示為未知，其餘欄位與其他會員照常顯示

### Requirement: 停用與啟用會員
系統 SHALL 允許管理員停用或啟用會員，以 Firebase Authentication 的 `disabled` 狀態為準；MUST NOT 允許管理員停用自己；操作 MUST 記錄結構化 log（含操作者與目標 uid）。停用的會員 MUST 無法再登入或取得新的 ID token；已簽發的 ID token 最長約 1 小時後失效（停用時 MUST 撤銷 refresh token）。

#### Scenario: 停用會員
- **WHEN** 管理員確認停用某會員
- **THEN** 該帳號被標記為停用，列表狀態更新

#### Scenario: 啟用會員
- **WHEN** 管理員啟用已停用的會員
- **THEN** 該帳號可再次登入

#### Scenario: 停用自己
- **WHEN** 管理員嘗試停用自己
- **THEN** 系統拒絕並回傳明確錯誤

### Requirement: 刪除會員
系統 SHALL 允許管理員刪除已停用的會員，並 MUST 沿用既有的帳號刪除流程，使該會員的全部紀錄被移除、AI 用量紀錄僅清除 userId；刪除 MUST 先要求確認，未停用的會員 MUST 不可刪除。

#### Scenario: 刪除已停用會員
- **WHEN** 管理員確認刪除一位已停用的會員
- **THEN** 該會員的紀錄依既有帳號刪除規則被移除

#### Scenario: 刪除未停用會員
- **WHEN** 管理員嘗試刪除尚未停用的會員
- **THEN** 系統拒絕並說明需先停用

### Requirement: 不提供角色與點數調整
後台使用者管理 MUST NOT 提供角色指派、點數調整、LINE 邀請與 setup-link 功能。

#### Scenario: 介面範圍
- **WHEN** 管理員檢視使用者列表與詳情
- **THEN** 介面沒有角色、點數調整與邀請相關操作
