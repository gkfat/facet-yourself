## 1. 共用常數與 schema

- [ ] 1.1 新增 `shared/constants/fortuneHistory.ts`：`FORTUNE_HISTORY_MONTHS = 3`、`FORTUNE_HISTORY_PAGE_DAYS = 14`、卦象讀取上限 1000，以及由 `now` 算出窗口起始台北日期的純函式（用既有 `addMonths` 與 `taipeiDateKey`）；補測試（月底、跨年、台北換日）
- [ ] 1.2 新增 `shared/schemas/api/fortuneHistory.schema.ts`：查詢（`before` 為合法日期字串選填、`limit` 1–14 預設 14，其他欄位拒絕）與回應（`days`、`nextBefore`、`truncated`，各項 `content` 可為 null）

## 2. 讀取層

- [ ] 2.1 `tarot.repository.ts`、`rune.repository.ts` 新增依文件 id 範圍列出的唯讀方法（`[from, to]`）；`hexagram.repository.ts`（若已實作）新增依 `from_` 至 `to_` 的範圍查詢與上限
- [ ] 2.2 `tarot.service.ts`、`rune.service.ts`（及 `hexagram.service.ts`）新增唯讀的 `listRange(uid, fromDate, toDate)`，重用既有 `toResponse` 與 `FixedContentService`；內容缺少時回 `content: null` 並記警告
- [ ] 2.3 service 測試（用 `fakeFirestore`）：範圍內外、只回該 uid 的資料、內容缺少時 `content: null` 且記警告、不寫入任何資料

## 3. 歷史服務與 API

- [ ] 3.1 新增 `server/services/fortuneHistory.service.ts`：先以文件 id 算出窗口內有紀錄的日期集合，切出本頁（`before` 與 `limit`），只為本頁日期載入內容，合併三個來源並依日期由新到舊分組，計算 `nextBefore` 與 `truncated`
- [ ] 3.2 新增 `server/api/fortune/history.get.ts`（`requireAuth`、zod `safeParse` query、response schema `parse`、`Cache-Control: private, no-store`、`toH3Error`）；確認 `routeAccess.ts` 預設需登入即可，不新增規則，並補一則「訪客 401」的測試
- [ ] 3.3 服務與 API 測試：第一頁與載入更多不重複、沒有紀錄回空、窗口外不出現、`before` 晚於今天或早於窗口起點與 `limit` 超過 14 被拒、同日多卦依序號、卦象達上限時 `truncated`、不同使用者互不可見、唯讀

## 4. 前端

- [ ] 4.1 新增 `app/composables/useFortuneHistory.ts`（載入第一頁、載入更多、錯誤狀態、不重複請求）
- [ ] 4.2 新增 `app/components/fortune/HistoryPanel.vue`：依日期分組由新到舊，每天一張卡列出當天各項結果並可展開完整內容，重用既有牌面、符石、六爻展示元件；「載入更多」、空狀態、載入失敗的明確提示
- [ ] 4.3 `app/pages/fortune.vue`：`FortuneView` 加入 `'history'`、`#history` 路由、入口按鈕；訪客只顯示登入提示且不呼叫 API；卦象依 `HEXAGRAM_ENTRY_ENABLED`
- [ ] 4.4 更新頁面上的說明文字，使「看見自己運勢的流動」與實際功能一致（歷史列表）

## 5. 驗證

- [ ] 5.1 `pnpm test`、`pnpm lint`、`pnpm build`、`pnpm check:bundle` 通過
- [ ] 5.2 本機完整做過一次：登入者有塔羅與盧恩紀錄時看到歷史、展開內容、載入更多、空狀態、訪客只見登入提示；若手動起服務，結束後釋放 port
- [ ] 5.3 與 `add-hexagram-divination`、`retain-daily-draws-3-months` 同時存在時確認：卦象依開關出現、窗口不受保存狀態影響
