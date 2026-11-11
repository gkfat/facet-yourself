## ADDED Requirements

### Requirement: 紫微固定內容的金鑰與匯入檢查
系統 SHALL 在固定內容金鑰規則中加入紫微：十四主星、四輔星、十二宮位、四個四化；匯入檢查 MUST 拒絕不在規則內的紫微 key，並 MUST 執行紫微措辭檢查。

#### Scenario: 合法的 key
- **WHEN** 匯入紫微主星、宮位或四化的內容
- **THEN** 內容通過金鑰規則並寫入

#### Scenario: 不合法的 key
- **WHEN** 匯入的紫微 key 不在規則內
- **THEN** 匯入失敗並指出該 key
