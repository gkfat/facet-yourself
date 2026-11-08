## 1. 分組定義

- [x] 1.1 `SystemKey` 增加 `practical`，新增共用 `SYSTEMS`（三類、標題與目的說明）
- [x] 1.2 `assessmentCards.ts` 的 `CARD_INFO` 增加 `system`，並以 `CARD_ORDER` 固定排序

## 2. 頁面

- [x] 2.1 `index.vue` 改用共用 `SYSTEMS`，重排卡片（人類圖移到人格類、生命靈數移到命理類最後）
- [x] 2.2 `self-reports.vue` 同樣改用 `SYSTEMS` 並重排

## 3. 驗證

- [x] 3.1 `pnpm lint` 與 `pnpm test` 通過
