## ADDED Requirements

### Requirement: 紫微斗數可被選入綜合報告
系統 SHALL 讓紫微斗數成為綜合報告的可選系統，與既有系統任意組合，並提供基礎點數（預設比照八字，實作前確認）。紫微 MUST 視為獨立來源，MUST NOT 與八字合併計票，兩者 MUST NOT 做交叉比對。

#### Scenario: 與八字同時選入
- **WHEN** 使用者同時選入紫微與八字
- **THEN** 兩者各自作為獨立來源，報告不把兩者合併為一票

#### Scenario: 點數
- **WHEN** 組合含紫微
- **THEN** 點數依既有算法計算，紫微有明確的基礎點數
