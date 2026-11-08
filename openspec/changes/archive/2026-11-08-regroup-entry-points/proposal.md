## Why

首頁與 `/self-reports` 的入口原本只有「命理與象徵系統」「人格與心理特質」兩類，實用型的自我探索測驗（價值觀、動機、職業興趣、品格優勢、情緒智商、依附風格）與 MBTI、HEXACO 混在同一組，人類圖又被歸在命理。要改成更貼近使用者心智的三類。

## What Changes

- 入口分成三類，順序固定：
  - 命理與象徵系統：星座、血型、八字、瑪雅 Kin、生命靈數
  - 人格與心理系統（原「人格與心理特質」更名）：MBTI、九型人格、HEXACO、人類圖
  - 自我探索與實用分析（新增）：核心價值觀、需求與動機、職業興趣、品格優勢、情緒智商、依附風格
- 人類圖由「命理與象徵系統」移到「人格與心理系統」。
- 首頁與 `/self-reports` 共用同一份分組定義，每個測驗卡片自帶所屬分組與固定排序。
- 不改任何入口的可用／鎖定規則、旗標與連結目的地。

## Capabilities

### New Capabilities

（無）

### Modified Capabilities
- `home-page`: 「兩類」改為三類分組，並明訂各類成員與順序。
- `self-assessment-framework`: 入口旗標需求中的「兩類系統」改為三類；`/self-reports` 與首頁同組。
- `hexaco-test`: 「人格與心理特質」改稱「人格與心理系統」。

## Impact

- 前端：`app/utils/homeAnalyses.ts`（`SystemKey` 增 `practical`、新增共用 `SYSTEMS`）、`app/utils/assessmentCards.ts`（卡片帶 `system` 與排序）、`app/pages/index.vue`、`app/pages/self-reports.vue`。
- 後端、Firestore、API、依賴皆無變動。
- 其他 spec（`bazi-chart`、`maya-kin`）僅提到「命理與象徵系統」，名稱與成員未變，不需修改。
