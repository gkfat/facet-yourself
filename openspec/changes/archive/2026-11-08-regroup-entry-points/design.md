## Context

首頁（`index.vue`）與 `/self-reports` 各自寫了一份兩類 `SYSTEMS` 定義，測驗卡片一律歸「人格與心理特質」，排序依 `ASSESSMENTS` 登錄順序。

## Goals / Non-Goals

**Goals:**
- 三類分組與成員順序符合上述分類，兩頁一致。
- 新增測驗時，分組是卡片資訊的一部分，不會漏。

**Non-Goals:**
- 不改入口的可用／鎖定規則、旗標、連結與卡片內容。
- 不改 `ASSESSMENTS` 登錄順序或後端。

## Decisions

- **分組定義集中在 `homeAnalyses.ts` 的 `SYSTEMS`**：兩頁共用，避免兩份漂移；`SystemKey` 增加 `practical`。
- **分組寫進 `assessmentCards.ts` 的 `CARD_INFO`**：型別為 `Record<AssessmentId, …>`，新增測驗時編譯期即強制指定分組。
- **排序用明確的 `CARD_ORDER`**：不改登錄表順序，只在卡片層排序，影響範圍最小。
- **其餘卡片的組內順序由頁面陣列順序決定**：命理類依序為星座、血型、八字、瑪雅 Kin、生命靈數；人格類為 MBTI、測驗卡（九型、HEXACO）、人類圖。

## Risks / Trade-offs

- 旗標關閉的卡片不出現，類別全空時整組不顯示（沿用既有規則）。
- 組內順序散在頁面陣列，改順序要同時改兩頁；可接受，因兩頁卡片欄位不同。
