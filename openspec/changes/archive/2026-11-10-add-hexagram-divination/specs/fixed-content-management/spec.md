## ADDED Requirements

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
