## Why

「此刻／今日」類目前有塔羅、盧恩、瑪雅 Kin 與星座運勢，都是每日一次的免費內容。易經卦象是華語使用者熟悉的占問形式，且以六爻逐步浮現的方式帶有儀式感；它也提供一條自然的付費路徑（想再起一卦時 1 點），不必呼叫 AI。沿用盧恩的每日抽取骨架，成本主要在內容撰寫而非架構。

## What Changes

- 新增「易經卦象」：以三枚銅錢法起卦，得本卦、動爻與變卦；屬「此刻／今日」類的狀態系統。
- 計價：已登入者每台北日第一卦免費，之後每起一卦扣 1 點；訪客只有每日免費的一卦，不存紀錄、不可加卦。
- 起卦為決定性：由「對象、台北日期、當日序號、規則版本」雜湊決定六爻（沿用既有每日抽取的做法），不使用每次不同的亂數。
- 詮釋規則：無動爻看本卦卦辭；一個動爻看該爻爻辭；兩個以上動爻只列本卦與變卦（含六爻皆動）。
- 內容：經文（卦名卦序、卦辭、彖辭、象辭、爻辭）為公版，放程式常數；白話解讀為自撰固定內容 `HEXAGRAM`（64 卦＋384 爻共 448 筆），不呼叫 AI，語氣為「這一刻的狀態，不是預言」。
- 前端：六爻以向量圖繪製，逐爻由下往上浮現並標明少陰、少陽、老陰、老陽，最後並排本卦與變卦；尊重減少動態偏好；入口放進今日運勢頁與首頁今日區塊。
- 排除：不做單維度報告、不進綜合報告可選系統、不做特質映射、不收「想問的事」、不寫報告快照。
- 保存：卦象抽取紀錄保存 3 個月，由每日到期作業清除（不開 Firestore TTL）；塔羅與盧恩改為 3 個月由另一個 change `retain-daily-draws-3-months` 處理，本 change 不動它們。
- 後台：Dashboard 的每日今日運勢使用數與點數消耗納入卦象。

## Capabilities

### New Capabilities
- `daily-hexagram`: 起卦規則、每日免費與付費加卦、訪客行為、紀錄與查詢 API、前端呈現與無障礙。
- `hexagram-content`: 64 卦與 384 爻的經文常數、白話固定內容、動爻詮釋規則、語氣與措辭要求。

### Modified Capabilities
- `points-system`: 新增扣點原因（卦象加卦），並要求加卦的扣點與紀錄原子且冪等。
- `fixed-content-management`: 新增內容類型 `HEXAGRAM`、金鑰規則與覆蓋檢查的預期筆數（448）。
- `today-section`: 今日運勢區塊與導覽的已啟用項目新增卦象。
- `admin-dashboard`: 每日使用數與點數消耗納入卦象。
- `data-retention`: 卦象抽取紀錄保存 3 個月並由排程清除；delta 與 `retain-daily-draws-3-months` 相同（塔羅、盧恩、卦象皆 3 個月），同步順序不影響結果。

## Impact

- `shared/`：新增 `constants/hexagrams.ts`（八卦、64 卦、經文）、`utils/hexagram.ts`（起卦純函式與版本常數）、`schemas/api/hexagram.schema.ts`、`schemas/firestore/hexagramDraw.schema.ts`；修改 `utils/fixedContentKeys.ts`（`HEXAGRAM` 類型與金鑰）、`schemas/firestore/points.schema.ts`（新增原因）。
- `server/`：新增 `repositories/hexagram.repository.ts`、`services/hexagram.service.ts`、`api/hexagram/daily.get.ts`、`api/hexagram/daily.post.ts`；修改 `utils/routeAccess.ts`（兩條路徑為 `optional`）、`services/point.service.ts`（`DeductReason`）、`services/dataExpiry.service.ts`（到期清除）、`services/adminDashboard.service.ts` 與 `repositories/adminStats.repository.ts`。
- `app/`：新增卦象頁與面板、六爻 SVG 元件、`useDailyHexagram`；修改 `pages/fortune.vue`、`components/fortune/HomeEntry.vue`、導覽。
- `content/fixed/hexagram.json`：448 筆白話內容，需 `pnpm content:import` 匯入才生效；預期總筆數相關測試要更新。
- `firestore.indexes.json`、`scripts/provision-firebase.ts`：新增 `hexagramDraws` 的 `drawnAt`（後台統計）與 `expiresAt`（到期清除，索引豁免）collection group 索引。
- 不新增 dependency；不改既有抽取引擎（`DailyDrawEngine` 只承載單一符號，不預先抽象，見 design）。
- 追溯（`openspec/analysis/`）：FR-089 至 FR-095、NFR-033 至 NFR-037、UC-057 至 UC-060、CTX-CON-031 至 033、CTX-ASM-030 至 035。
- 假設已確認：CTX-ASM-031（決定性雜湊）、033（不重用引擎）、034（卦象紀錄保存 3 個月）、035（付費卦不設每日上限）。經文版本已定為通行本（王弼本系統、King Wen 序）。
