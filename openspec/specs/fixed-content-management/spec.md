# fixed-content-management Specification

## Purpose
TBD - 由 ai-personality-app 同步建立，待補目的說明。

## Requirements

### Requirement: 匯入腳本維護固定內容
系統 SHALL 提供匯入腳本，將固定內容（多維度分析報告、單項結果）由 JSON 或 CSV 寫入 Firestore，更新內容 MUST NOT 需要重新部署。（FR-008、NFR-012）

#### Scenario: 匯入新內容
- **WHEN** 維護者執行匯入腳本
- **THEN** 內容寫入 Firestore，版本遞增

#### Scenario: 格式無效
- **WHEN** 匯入檔不符合 schema
- **THEN** 腳本拒絕並指出錯誤列，不寫入任何內容

### Requirement: 組合唯一與審核發布
系統 SHALL 以決定性的文件 ID 保證組合唯一，內容狀態依序為 DRAFT、REVIEWED、PUBLISHED，僅 PUBLISHED 可供使用者讀取。（FR-008、RULE-021）

#### Scenario: 重複組合
- **WHEN** 匯入已存在的組合
- **THEN** 視為同一份內容的更新，不產生第二份

#### Scenario: 未審核內容
- **WHEN** 內容狀態為 DRAFT
- **THEN** 使用者端讀不到該內容

### Requirement: 覆蓋完整性檢查
系統 SHALL 提供檢查，核對 960 種多維度分析報告 組合（星座×MBTI 192、星座×MBTI×血型 768）與單項內容是否皆已發布，並列出缺漏。（FR-009、RULE-003）

#### Scenario: 有缺漏
- **WHEN** 檢查發現某組合未發布
- **THEN** 輸出缺漏組合清單

#### Scenario: 完整
- **WHEN** 所有組合皆已發布
- **THEN** 檢查回報完整

### Requirement: 易經卦象白話內容的類型與金鑰
系統 SHALL 支援固定內容類型 `HEXAGRAM`，金鑰規則為 `<卦序>`（1–64）與 `<卦序>_<爻位>`（爻位 1–6），共 448 筆；金鑰不合法的內容匯入 MUST 驗證失敗。覆蓋完整性檢查的預期筆數 MUST 含這 448 筆，並與匯入腳本、金鑰規則共用同一份定義。匯入 `HEXAGRAM` 內容 MUST 通過保守措辭檢查（不含吉凶斷語、診斷與財務用語）。

#### Scenario: 合法金鑰
- **WHEN** 匯入金鑰為 `12` 與 `12_3` 的 `HEXAGRAM` 內容
- **THEN** 驗證通過

#### Scenario: 不合法金鑰
- **WHEN** 匯入金鑰為 `65`、`12_7` 或 `0` 的 `HEXAGRAM` 內容
- **THEN** 驗證失敗並指出金鑰不合法

#### Scenario: 覆蓋檢查
- **WHEN** 執行 `pnpm content:check`
- **THEN** 預期筆數含 448 筆 `HEXAGRAM` 內容，缺少者被列出
