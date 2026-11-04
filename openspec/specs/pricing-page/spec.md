# pricing-page Specification

## Purpose
定義 `/pricing` 點數方案頁：對訪客與會員開放，說明點數用途與購買方式，不以施壓手法促使購買。

## Requirements

### Requirement: Pricing 頁對所有人開放並說明點數
系統 SHALL 提供 `/pricing` 頁，訪客與會員皆可進入，並 MUST 說明：點數用在多維度分析、點數不會過期也不是訂閱、不付費也能持續使用免費內容。頁面 MUST NOT 以倒數、限量或其他施壓手法促使購買。

#### Scenario: 訪客開啟 Pricing
- **WHEN** 訪客開啟 `/pricing`
- **THEN** 頁面顯示點數說明，且顯示訪客提示（登入贈送 3 點、資料只暫存一天）

#### Scenario: 會員開啟 Pricing
- **WHEN** 已登入的會員開啟 `/pricing`
- **THEN** 頁面顯示相同內容，不顯示訪客提示

### Requirement: 方案之前先說明多維度分析是什麼
`/pricing` SHALL 在方案卡片之前，以「多維度分析是什麼？」一節說明：把選定的兩個以上維度放在一起，由 AI 比對呼應與拉扯的地方，寫成專屬的報告，並提供前往 `/report` 的連結。

#### Scenario: 先看到說明
- **WHEN** 任何人開啟 `/pricing`
- **THEN** 「多維度分析是什麼？」位於方案卡片之上，含簡短說明、三個步驟與前往 `/report` 的連結

### Requirement: 購買方案取自既有 API，以卡片呈現
`/pricing` SHALL 以 `GET /api/point-packages` 取得可購買的方案，並以卡片呈現，每張卡片 MUST 顯示點數、價格與每點價格。點數、價格與由它們推算的內容（每點價格、比最小方案省下的百分比、約可做幾份 3 維度分析）MUST 取自 API 與定價函式，MUST NOT 在頁面中寫死。剛好有三個方案時，頁面 SHALL 依點數由小到大分別以不同定位的文案呈現（先試一份、一次看清楚、長期陪伴），並讓中間的方案帶「推薦」標示，每點最低的方案帶「每點最划算」標示；方案數不是三個時，卡片 MUST 只顯示由資料得出的內容。每張卡片 MUST 說明點數沒有使用期限（或有效天數），頁面 MUST 說明點數不是訂閱。沒有方案或載入失敗時 MUST 顯示明確訊息，其餘說明內容照常顯示。

#### Scenario: 三個方案
- **WHEN** 開啟 `/pricing` 且 API 回傳三個方案
- **THEN** 顯示三張卡片，由小到大各自帶定位文案與適合對象，中間一張帶「推薦」，點數、價格與每點價格取自 API

#### Scenario: 推算內容與資料一致
- **WHEN** 卡片顯示「約可做 N 份 3 維度分析」與「每點比最小的方案省 X%」
- **THEN** N 為方案點數除以 3 維度分析所需點數（取自定價函式）的整數部分，X 由各方案的價格與點數算出

#### Scenario: 方案數不是三個
- **WHEN** API 回傳的方案不是三個
- **THEN** 卡片只顯示點數、價格、每點價格與由資料得出的內容，不套用定位文案與推薦標示

#### Scenario: 尚無方案
- **WHEN** API 回傳空陣列
- **THEN** 顯示「方案準備中」的說明，免費內容的說明照常顯示

#### Scenario: 載入失敗
- **WHEN** `GET /api/point-packages` 失敗
- **THEN** 方案區塊顯示錯誤訊息，其餘說明內容照常顯示

### Requirement: 購買入口依身分導向
`/pricing` SHALL 在會員點擊某個方案時導向 `/purchase` 並帶上該方案（`package` 查詢參數），`/purchase` MUST 把該方案預先選好；查詢參數不是有效方案時 MUST 忽略。訪客點擊時 MUST 導向 `/login`。`/pricing` 本身 MUST NOT 發起付款。

#### Scenario: 會員購買
- **WHEN** 會員在 `/pricing` 點擊某個方案
- **THEN** 導向 `/purchase`，該方案已被選取

#### Scenario: 無效的方案參數
- **WHEN** 會員開啟 `/purchase?package=不存在的方案`
- **THEN** 不預選任何方案，頁面照常顯示

#### Scenario: 訪客購買
- **WHEN** 訪客在 `/pricing` 點擊購買
- **THEN** 導向 `/login`
