# admin-access Specification

## Purpose
超級管理員的授權（Firebase custom claim）、後台 API 的管理員檢查與前端入口守衛。

## Requirements

### Requirement: 管理員授權以 Firebase custom claim 決定
系統 SHALL 以 Firebase ID token 內的 custom claim `admin === true` 判定超級管理員；系統 MUST NOT 提供 RBAC 或多種角色，MUST NOT 信任前端傳入的任何管理員旗標。

#### Scenario: 帶有 admin claim 的 token
- **WHEN** 請求帶有有效 ID token，且 `admin` claim 為 true
- **THEN** 系統視為管理員

#### Scenario: 沒有 admin claim
- **WHEN** 請求帶有有效 ID token，但沒有 `admin` claim
- **THEN** 系統不視為管理員

### Requirement: 後台 API 的管理員檢查
所有 `/api/admin/*` 端點 SHALL 先通過登入驗證，再由 `requireAdmin` 檢查：`admin` claim 為 true、`email_verified` 為 true、sign-in provider 為 `google.com`。任一項不符 MUST 回 403 並記錄結構化 log；未登入 MUST 回 401。

#### Scenario: 一般會員呼叫後台 API
- **WHEN** 已登入但非管理員的會員呼叫 `/api/admin/*`
- **THEN** 系統回傳 403，不回傳任何後台資料

#### Scenario: 未登入呼叫
- **WHEN** 請求沒有 token
- **THEN** 系統回傳 401

#### Scenario: email 未驗證
- **WHEN** token 帶有 `admin` claim 但 `email_verified` 為 false
- **THEN** 系統回傳 403

#### Scenario: 非 Google 登入
- **WHEN** token 帶有 `admin` claim 但 sign-in provider 不是 `google.com`
- **THEN** 系統回傳 403

### Requirement: 授權與撤銷指令
系統 SHALL 提供 `pnpm admin:grant <email>` 為指定 Firebase 帳號設定 `admin` claim，並提供撤銷方式移除 claim。指令 MUST 驗證 email 格式、帳號必須已存在於 Firebase Authentication，找不到帳號時 MUST 明確報錯；MUST NOT 在輸出中印出 service account 內容。

#### Scenario: 授權已存在的帳號
- **WHEN** 管理者對已登入過的 email 執行授權指令
- **THEN** 該帳號被設定 `admin` claim，指令印出結果與提示需重新登入

#### Scenario: 帳號不存在
- **WHEN** 指令的 email 在 Firebase Authentication 中找不到
- **THEN** 指令以非零狀態結束並說明需先以該帳號登入一次

#### Scenario: 撤銷
- **WHEN** 管理者執行撤銷指令
- **THEN** 該帳號的 `admin` claim 被移除

### Requirement: 後台前端入口守衛
系統 SHALL 在 `/admin` 提供獨立的後台 layout 與 middleware；進入任何 `/admin` 頁面前 MUST 以強制更新後的 ID token 確認 `admin` claim。未登入者 MUST 導向登入頁，已登入但非管理員 MUST 導回首頁，且不顯示後台導覽。前端判斷僅作導向，資料存取的授權 MUST 以後端 `requireAdmin` 為準。

#### Scenario: 管理員進入
- **WHEN** 管理員開啟 `/admin`
- **THEN** 顯示後台 Dashboard

#### Scenario: 非管理員進入
- **WHEN** 一般會員開啟 `/admin`
- **THEN** 被導回首頁，不顯示後台內容

#### Scenario: 未登入進入
- **WHEN** 未登入者開啟 `/admin`
- **THEN** 被導向登入頁

### Requirement: 管理員授權步驟文件
專案文件 SHALL 說明如何啟用 Google 登入、確認授權網域、取得 UID、執行授權指令、重新登入與驗證。

#### Scenario: 依文件完成授權
- **WHEN** 維運者依 `docs/firebase-setup.md` 的步驟操作
- **THEN** 指定的 Google 帳號可進入後台，其他帳號不能
