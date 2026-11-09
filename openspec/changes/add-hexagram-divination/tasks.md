## 1. 確認待定假設與經文來源

- [x] 1.1 與使用者確認 design 的 Open Questions：決定性雜湊、不重用引擎、卦象紀錄保存 3 個月、付費卦不設上限，結果已寫回 design 與 `openspec/analysis/context.yaml`
- [x] 1.2 經文版本已定為通行本（王弼本系統、King Wen 序，含彖、象）；實作時確認八卦上下卦對照 64 卦的表，在常數檔註明來源，並於入庫前人工校對一次
- [x] 1.3 塔羅與盧恩也改為 3 個月已確認，另開 change `retain-daily-draws-3-months`，不在本 change 實作

## 2. 常數與起卦純函式（shared）

- [ ] 2.1 新增 `shared/constants/hexagrams.ts`：八卦、64 卦（卦序、卦名、上下卦、卦辭、彖辭、象辭）與每卦 6 條爻辭，並提供 `hexagramContentKeys()`（448 個金鑰）
- [ ] 2.2 新增 `shared/utils/hexagram.ts`：`HEXAGRAM_DRAW_VERSION = 'hexagram-v1'`、`castHexagram(subject, dateKey, seq)`（SHA-256 前 18 位元三枚銅錢）、`hexagramOf(lines)`（本卦、變卦、動爻）、`readingPlan(lines)`（`none`／`single`／`multiple`）
- [ ] 2.3 測試：同輸入同結果、不同序號各自決定；大量樣本下四種爻值比例與 64 卦出現率符合 1/8、3/8、3/8、1/8 與 1/64（容差 ±10%）；上下卦對照 64 組合唯一；常數完整（64 卦、384 條爻辭、卦序不重複）；變卦翻轉正確；六爻皆動歸 `multiple`
- [ ] 2.4 新增 `shared/schemas/firestore/hexagramDraw.schema.ts`（`lines` 為 6 個 6–9 的整數、`seq`、`paid`、`pointTransactionId`、`requestId`、`drawVersion`、`drawnAt`、`expiresAt`）與 `shared/schemas/api/hexagram.schema.ts`（GET／POST 回應含 `mode`；請求 schema 只允許選填 `requestId`，其他欄位一律拒絕）

## 3. 固定內容類型

- [ ] 3.1 `shared/utils/fixedContentKeys.ts` 與 `fixedContentTypeSchema`：新增 `HEXAGRAM`（金鑰 `<1..64>` 與 `<1..64>_<1..6>`）、`fixedContentIds()` 加入 448 筆；更新 `fixedContentKeys.test.ts`、`fixedContentImport.test.ts` 的預期總筆數
- [ ] 3.2 匯入的保守措辭檢查：加入吉凶斷語詞清單（大吉、大凶、必定、災禍等），含測試；確認不誤擋「可能／傾向」等既有用語
- [ ] 3.3 `pnpm content:import --dry-run` 以一份範例 JSON 驗證類型與金鑰規則通過

## 4. 點數與紀錄

- [ ] 4.1 `shared/schemas/firestore/points.schema.ts` 的 `POINT_TRANSACTION_REASONS` 與 `server/services/point.service.ts` 的 `DeductReason` 新增 `HEXAGRAM_CAST`；檢查所有以 reason 做 switch 或標籤的位置（含後台、點數異動列表）並補齊
- [ ] 4.2 新增 `server/repositories/hexagram.repository.ts`：`ref(uid, dateKey, seq)`、今日各卦的文件 id 範圍查詢、`runTransaction`
- [ ] 4.3 新增 `server/services/hexagram.service.ts`（寫紀錄時 `expiresAt = drawnAt + 3 個月`）：`getToday(uid)`、`draw(uid, requestId?)`（同一交易：讀今日各卦 → 以 `requestId` 去重 → 決定 `seq` → `seq ≥ 1` 時 `planDeduction` → 寫紀錄）、`getTodayForGuest()`、`drawForGuest(sessionId)`（只 `seq = 0`、不存）；內容在進交易前先確認可交付
- [ ] 4.4 service 測試（用 `fakeFirestore`）：第一卦免費且無扣點交易；第二卦扣 1 點並寫紀錄；點數不足不留紀錄；同 `requestId` 重送只一筆；並行不同請求各得不同 `seq`、各扣 1 點；同一 `seq` 的扣點交易只有一筆；缺內容時不扣點；隔天 `seq` 重新從 0；訪客不寫紀錄且同 session 同日同結果、訪客加卦被拒

## 5. API 與存取規則

- [ ] 5.1 新增 `server/api/hexagram/daily.get.ts` 與 `daily.post.ts`（`requireViewer`、zod 解析、response schema `parse`、`Cache-Control: private, no-store`、`toH3Error`）
- [ ] 5.2 `server/utils/routeAccess.ts`：兩條路徑加入 `optional` 規則，並補測試（無憑證 401、訪客可用）
- [ ] 5.3 API 測試：GET 未起卦／已起卦；POST 帶日期、使用者識別、序號、爻值或自由文字被拒；回應含 `mode`；訪客加卦回應要求登入
- [ ] 5.4 `server/services/dataExpiry.service.ts`：`EXPIRING_GROUPS` 加入 `hexagramDraws`、結果加 `deletedHexagramDraws`，更新型別、`/api/cron/data-expiry` 的回應 schema 與測試（過期的卦象被刪、未到期保留）；若 `retain-daily-draws-3-months` 已先實作，在其擴充的基礎上加入，不重複
- [ ] 5.5 `server/services/deletion.service.ts`：刪帳號與刪除資料的子集合清單加入 `hexagramDraws`，補測試（其他使用者不受影響）

## 6. 後台與索引

- [ ] 6.1 `server/repositories/adminStats.repository.ts` 的 `DrawGroup` 加入 `hexagramDraws`；`adminDashboard.service.ts` 的每日使用數加卦象欄位，補測試與後台畫面的欄位與「僅含會員」標示
- [ ] 6.2 後台點數消耗依 `reason` 拆分時補上「卦象加卦」的顯示名稱與測試
- [ ] 6.3 `firestore.indexes.json` 與 `scripts/provision-firebase.ts` 新增 `hexagramDraws` 的 `drawnAt` collection group 單欄位索引，並把 `hexagramDraws` 加進 `EXPIRY_QUERY_GROUPS`（`expiresAt` 索引豁免，不開 TTL）；更新 `docs/firebase-setup.md`

## 7. 前端

- [ ] 7.1 新增 `app/components/hexagram/Lines.vue`（六爻 SVG：實線陽、斷線陰、動爻標記，`aria-label` 含卦名與六爻描述）與測試
- [ ] 7.2 新增 `app/composables/useDailyHexagram.ts`（GET／POST、產生 `requestId`、點數刷新）與 `app/components/fortune/HexagramPanel.vue`、`app/pages/hexagram.vue`：逐爻浮現動畫、`prefers-reduced-motion` 直接顯示、本卦與變卦並排、依 `mode` 顯示內容、經文原文標示、免責聲明
- [ ] 7.3 加卦流程：第二卦起顯示「將扣 1 點」與餘額並確認；點數不足時引導購買、不送請求；送出中停用按鈕防連點
- [ ] 7.4 `HEXAGRAM_ENTRY_ENABLED`（先設 false）控制 `pages/fortune.vue`、`components/fortune/HomeEntry.vue` 與導覽；訪客顯示只有當日免費卦與登入提示

## 8. 白話內容

- [ ] 8.1 撰寫 64 卦本卦白話（`<卦序>`），語氣為「這一刻的狀態，不是預言」，附 `disclaimer`，產生 `content/fixed/hexagram.json`
- [ ] 8.2 撰寫 384 爻白話（`<卦序>_<爻位>`；可先放爻辭原文加簡短白話，分批補），併入 `content/fixed/hexagram.json`
- [ ] 8.3 `pnpm content:import content/fixed/hexagram.json --dry-run` 全數通過（金鑰、措辭檢查）；人工審稿一輪

## 9. 驗證與上線

- [ ] 9.1 `pnpm test`、`pnpm lint`、`pnpm build`、`pnpm check:bundle`、`pnpm ontology:check` 全部通過（`ontology:check` 確認沒有映射指向卦象）
- [ ] 9.2 正式匯入：`pnpm content:import content/fixed/hexagram.json`，`pnpm content:check` 顯示 448 筆全數發布；建立 `hexagramDraws` 索引
- [ ] 9.3 本機完整做過一次：登入者第一卦（免費）、第二卦（扣 1 點）、點數不足、訪客一卦、換裝置同卦、減少動態；若手動起服務，結束後釋放 port
- [ ] 9.4 `HEXAGRAM_ENTRY_ENABLED` 改為 `true` 並部署（部署由使用者自行執行）
