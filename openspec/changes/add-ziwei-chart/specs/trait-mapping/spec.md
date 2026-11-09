## ADDED Requirements

### Requirement: 紫微斗數的特質映射
系統 SHALL 以 keyword mapping 把十四主星與四化對到特質軸端點，以傾向描述而非決定性推論，並通過既有的映射覆蓋檢查。紫微的來源類型 MUST 獨立為 `ziwei`，MUST NOT 與八字共用 `chinese-metaphysics` 來源。找不到合理對應的星 MUST NOT 被強制對應。

#### Scenario: 映射檢查
- **WHEN** 執行 `pnpm ontology:check` 與映射覆蓋測試
- **THEN** 紫微的映射通過，且沒有指向不存在的特質軸端點

#### Scenario: 來源票數
- **WHEN** 綜合報告同時含紫微與八字
- **THEN** 兩者分屬不同來源，各算一票
