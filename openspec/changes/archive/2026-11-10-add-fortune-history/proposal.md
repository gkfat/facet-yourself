## Why

今日運勢頁對訪客寫著「登入後可以保存每天的紀錄，也能看見自己運勢的流動」，但目前只有今天：塔羅與盧恩雖然每天都有保存抽取紀錄，前台卻沒有任何地方能回頭看。使用者無法回看前幾天抽到了什麼，保存紀錄對他們沒有價值，也讓這句承諾落空。

## What Changes

- 在今日運勢頁新增「歷史」分頁，已登入使用者可依日期由新到舊回看過去的每日抽取結果，每天一列，列出當天各項結果，點開看完整內容。
- 範圍：塔羅、盧恩、易經卦象（卦象一天可有多卦，依序號全部列出並標示第幾卦）。瑪雅 Kin 與星座運勢不在第一版。
- 時間範圍固定為最近 3 個月（與抽取紀錄的保存期限一致），分頁載入（一次 14 天，「載入更多」）。
- 新增唯讀 API `GET /api/fortune/history`，只讀使用者自己的紀錄，不新增資料、不改 Firestore schema。
- 訪客沒有保存紀錄：歷史入口顯示登入提示，不呼叫 API。
- 第一版只做歷史列表，不做統計、趨勢或「流動」的歸納。
- 排除：不新增抽取、不扣點、不呼叫 AI、不做分享、不做匯出。

## Capabilities

### New Capabilities
- `fortune-history`: 歷史運勢的範圍、時間窗口、分頁、API 的存取與回應、前端呈現與訪客行為。

### Modified Capabilities
- `today-section`: 今日運勢頁新增歷史入口；訪客看到登入提示而非歷史。

## Impact

- `shared/`：新增 `schemas/api/fortuneHistory.schema.ts`（查詢與回應）、`constants/fortuneHistory.ts`（窗口月數、每頁天數）。
- `server/`：新增 `api/fortune/history.get.ts`、`services/fortuneHistory.service.ts`；在 `tarot.service.ts`、`rune.service.ts`（及 `hexagram.service.ts`）新增唯讀的「依日期區間列出」方法與 repository 的文件 id 範圍查詢。`routeAccess.ts` 無需新增規則（預設需登入）。
- `app/`：新增 `components/fortune/HistoryPanel.vue`、`composables/useFortuneHistory.ts`；修改 `pages/fortune.vue` 加入「歷史」入口與 `#history`。
- 不新增 dependency；不新增 Firestore 集合、索引或寫入；不改抽取、內容與點數。
- 依賴與順序：
  - 卦象項目依賴 `add-hexagram-divination`；該 change 尚未實作時，歷史只含塔羅與盧恩，卦象以入口開關 `HEXAGRAM_ENTRY_ENABLED` 為準納入，不阻擋本 change。
  - 保存期限由 `retain-daily-draws-3-months` 決定；本 change 的時間窗口固定 3 個月，無論該 change 是否已實作都不顯示更早的紀錄。
- 追溯（`openspec/analysis/`）：FR-044（此刻／今日入口）、FR-045（每日塔羅）、FR-046（每日盧恩）、CTX-CON-016、CTX-CON-018；卦象部分見 FR-093。未新增獨立需求條目，若要補 FR／UC 需另跑 `system-analysis` 與 `requirement-modeling`（建議但未執行）。
