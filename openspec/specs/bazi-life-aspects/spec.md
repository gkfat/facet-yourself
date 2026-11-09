# bazi-life-aspects Specification

## Purpose
TBD - 八字專屬的人生面向（性格、事業、財富、感情、人際、學習）固定內容與報告呈現。

## Requirements

### Requirement: 人生面向固定內容
系統 SHALL 以固定內容提供八字專屬的人生面向解讀：性格、事業、財富、感情、人際、學習六個面向，依「十神偏多的類別（比劫、食傷、財、官殺、印）或平均」各一筆，鍵為 `life_<面向>_<類別>`，共 36 筆。內容 MUST 事先撰寫與審核，MUST NOT 呼叫 AI；MUST 使用「可能／傾向」語氣；MUST NOT 預測吉凶、婚姻、健康、壽命或財運，MUST NOT 提供醫療、法律或財務建議，MUST NOT 使用診斷用語。

#### Scenario: 合法金鑰
- **WHEN** 匯入金鑰為 `life_career_power` 的內容
- **THEN** 驗證通過

#### Scenario: 不合法金鑰
- **WHEN** 匯入金鑰為 `life_health_power` 或 `life_career_other`
- **THEN** 驗證失敗並指出金鑰不合法

#### Scenario: 財富面向的措辭
- **WHEN** 內容含「會發財」「財運旺」等預測用語
- **THEN** 驗證失敗

### Requirement: 人生面向的報告呈現
八字報告 SHALL 在「命理解讀」區以人生面向列出六個面向的解讀，依命盤中十神偏多的類別取內容，沒有偏多時取「平均」。每個面向 MUST 標示「這是傳統命理的說法」，且句子 MUST 帶 sources（十神類別 term 與固定內容）。尚未發佈的面向 MUST 省略，MUST NOT 以通用文字補位。

#### Scenario: 有偏多的類別
- **WHEN** 命盤的十神以官殺偏多
- **THEN** 事業等面向顯示 `life_*_power` 的內容，並標示來源

#### Scenario: 十神平均
- **WHEN** 命盤沒有偏多的十神類別
- **THEN** 各面向顯示「平均」的內容

#### Scenario: 內容尚未發佈
- **WHEN** 某個面向的內容尚未匯入
- **THEN** 該面向不顯示，其餘面向正常顯示
