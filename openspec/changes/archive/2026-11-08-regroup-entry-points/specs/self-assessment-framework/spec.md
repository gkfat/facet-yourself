## MODIFIED Requirements

### Requirement: 入口旗標
首頁（「從不同的角度認識自己」的三類系統）與 `/self-reports` SHALL 依登錄表為每個分析提供卡片，並使用相同的三類分組與順序；每個分析各有入口旗標；旗標關閉時該分析的卡片 MUST NOT 出現在任何位置，頁面本身仍可由網址進入。

#### Scenario: 旗標關閉
- **WHEN** 某分析的入口旗標為關
- **THEN** 首頁與 `/self-reports` 都沒有該分析的卡片

#### Scenario: 旗標開啟
- **WHEN** 某分析的入口旗標為開且使用者已有未到期的結果
- **THEN** 卡片（首頁或 `/self-reports`）亮起並連到結果頁

#### Scenario: 兩頁分組一致
- **WHEN** 同一個分析同時出現在首頁與 `/self-reports`
- **THEN** 兩頁把它歸在同一類
