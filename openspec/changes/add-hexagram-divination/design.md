## Context

「此刻／今日」類的塔羅與盧恩共用 `DailyDrawEngine`（`server/services/dailyDraw.engine.ts`）：每個帳號每個台北日一筆、文件 id 為日期、內容是單一符號加方位、以 `SHA-256(uid|date|version)` 決定性抽取；訪客用 `guest:<sessionId>` 當對象，結果不存（`drawEphemeral`）。路由在 `routeAccess.ts` 為 `optional`；紀錄在 `users/{uid}/<collection>/{date}`，永久保留，後台以 collection group 依 `drawnAt` 統計；刪帳號由 `deletion.service` 遞迴刪子集合。

卦象與這個形狀有三處不同：一天可有多卦（第一卦免費、之後付費）、一卦有六爻、起卦要與扣點同一個交易。點數服務已有可在外部交易內使用的 `planDeduction(tx, { transactionId })`，同一 `transactionId` 只會扣一次。

分析層的追溯：FR-089 至 FR-095、NFR-033 至 NFR-037、UC-057 至 UC-060（`openspec/analysis/`）。

## Goals / Non-Goals

**Goals:**
- 沿用盧恩的骨架（`requireViewer`、台北日、`drawVersion`、訪客可用、決定性），讓行為與既有每日內容一致。
- 付費加卦的扣點與紀錄原子，重送不重複扣點，失敗不留半套狀態。
- 內容量可控：不寫 64×64 組合文案，白話解讀 448 筆，經文放常數。

**Non-Goals:**
- 不做單維度報告、綜合報告、特質映射、AI、想問的事、報告快照。
- 不做「自行擲卦」的不限次免費模式、不做起卦歷史頁（只有查詢今日各卦）。
- 不改 `DailyDrawEngine`，不為它抽象；塔羅與盧恩不變。
- 不做乾坤的用九、用六單獨成條。

## Decisions

1. **起卦規則：三枚銅錢，決定性雜湊。**
   對 `SHA-256(subject|date|seq|version)` 取前 18 個位元，每爻 3 位元代表三枚銅錢（1 為 3、0 為 2），和為 6（老陰）、7（少陽）、8（少陰）、9（老陽），機率 1/8、3/8、3/8、1/8；由下往上排第 1 至 6 爻。6 與 9 為動爻，變卦為動爻翻轉。版本常數 `HEXAGRAM_DRAW_VERSION = 'hexagram-v1'`，參與雜湊並存在每筆紀錄。
   - 為什麼不用 crypto 亂數：訪客不存紀錄，但同 session 同日必須得到同一卦；決定性可重現、可寫窮舉與分布測試，與塔羅盧恩一致。付費卦每多一個 `seq` 就是另一個決定的結果，使用者無法用重新整理換卦。
   - 替代方案：全部 crypto 亂數並存。訪客的免費卦要另存暫存紀錄，且違反既有「訪客不存」的規則，故不採用。（對應 CTX-ASM-031，待確認）

2. **結果資料：以爻值陣列為唯一來源。**
   紀錄只存 `lines: [6|7|8|9] × 6`；本卦、變卦、動爻位置都由純函式 `hexagramOf(lines)` 推導，不存衍生欄位，避免不一致。八卦（三爻）→ 64 卦的對照用「上卦、下卦」二維表（King Wen 序），經文常數以卦序 1–64 為鍵。

3. **紀錄位置與唯讀查詢：`users/{uid}/hexagramDraws/{YYYY-MM-DD}_{seq}`。**
   欄位：`date`、`seq`、`lines`、`drawnAt`、`expiresAt`、`drawVersion`、`paid`、`pointTransactionId`（免費為 null）、`requestId`（付費卦的冪等鍵）。今日各卦用文件 id 範圍查詢（`documentId` 介於 `date_` 與 `date_`），不需複合索引。後台統計需 `hexagramDraws` 依 `drawnAt` 的 collection group 單欄位索引（比照 `runeDraws`）。後台近 30 天統計在 3 個月保存內都讀得到。
   - 保存期限 3 個月（user 已確認）：每筆帶 `expiresAt = drawnAt + 3 個月`，由每日到期作業 `dataExpiry.service` 清除（`EXPIRING_GROUPS` 加入 `hexagramDraws`，結果回報 `deletedHexagramDraws`），MUST NOT 開 Firestore TTL（專案規則）。`expiresAt` 的 collection group 查詢需索引豁免，加進 `firestore.indexes.json` 與 `scripts/provision-firebase.ts` 的 `EXPIRY_QUERY_GROUPS`。隨刪帳號刪除。
   - 與現況的差異：塔羅與盧恩目前仍永久保留（0bc7f8c）。user 已決定它們也改 3 個月，由另一個 change `retain-daily-draws-3-months` 處理（含既有資料回補與刪除）；本 change 不動它們。兩個 change 的 `data-retention` delta 內容相同（三種抽取皆 3 個月），不論同步順序，主 spec 結果一致；`dataExpiry.service.ts` 的 `EXPIRING_GROUPS` 與結果型別兩者都會改，後實作者在先實作者的基礎上合併。

4. **付費加卦：同一個 Firestore 交易完成「讀今日各卦 → 決定 seq → 扣點 → 寫紀錄」。**
   - `seq` 為今日已有卦數；`seq = 0` 免費；`seq ≥ 1` 呼叫 `PointService.planDeduction(tx, { uid, amount: 1, reason: 'HEXAGRAM_CAST', transactionId: 'hexagram:<uid>:<date>:<seq>', reference })`。點數不足拋 `InsufficientPointsError`，交易中止，不留紀錄。
   - 冪等：請求帶客戶端產生的 `requestId`（UUID）。交易先在今日各卦中找同一 `requestId`，找到就直接回傳該卦，不再扣點；沒找到才建立新的一卦。並行的兩個不同請求，後者在交易重試時會取得下一個 `seq`，各扣各的 1 點；`transactionId` 內含 `seq`，保證同一 `seq` 不會扣兩次。
   - 因為扣點與寫紀錄在同一交易，成功與失敗是全有或全無，不需要「失敗返還」。內容在進交易前先確認可交付（比照盧恩），缺內容時起卦失敗且不扣點。
   - 請求不接受日期、身分、序號或爻值；`requestId` 只是冪等鍵，不影響結果。
   - 替代方案：以客戶端傳 `seq` 當冪等鍵。會讓請求「指定序號」，與 FR-091 衝突，故用獨立的 `requestId`。

5. **訪客：只有 `seq = 0` 的免費卦，不寫紀錄。**
   比照 `drawEphemeral`：對象為 `guest:<sessionId>`，回應直接帶卦象與內容。`GET` 對訪客只回日期與 `drawn: false`。訪客的加卦要求回 401 並引導登入。

6. **不重用 `DailyDrawEngine`，另寫 `HexagramService`。**
   引擎的紀錄形狀（單一 `symbolIndex`、一日一筆）無法承載多卦與六爻；為了它而改引擎會動到塔羅盧恩。共用的只有 `taipeiDateKey`、`guestDrawSubject`、`FixedContentService`、`requireViewer`。等第三個抽取型也需要多筆時再考慮抽共用機制（CTX-CON-019）。（CTX-ASM-033，待確認）

7. **內容分兩層，經文放常數、白話放固定內容。**
   - 常數 `shared/constants/hexagrams.ts`：64 卦的卦序、卦名、上下卦、卦辭、彖辭、象辭，以及每卦六條爻辭（公版原文，不經審稿流程）。
   - 固定內容 `HEXAGRAM`（448 筆）：金鑰 `<卦序>`（本卦白話，64 筆）與 `<卦序>_<爻位>`（爻的白話，384 筆，爻位 1–6）。內容欄位沿用 `title、summary、strengths、blindSpots、growthAdvice、disclaimer`。變卦只顯示卦名與一句簡述，簡述取自該卦自己的 `HEXAGRAM` 本卦內容的 `title`，不另寫。
   - 金鑰驗證加進 `isFixedContentKey` 的 `HEXAGRAM` 分支與 `fixedContentIds()`；覆蓋檢查預期筆數 +448。
   - 措辭：內容 MUST 為「這一刻的狀態」口吻，不含吉凶斷語（如「大吉」「大凶」「必」「災」等），並加進內容匯入的措辭檢查。

8. **詮釋規則由純函式決定，前後端共用。**
   `readingPlan(lines)` 回傳：`moving`（動爻位置）、`mode`：`'none'`（卦辭）、`'single'`（該爻爻辭）、`'multiple'`（本卦與變卦）。API 回應含 `mode`，前端依此排版；兩端不各自實作規則。

9. **API。** `GET /api/hexagram/daily`：回今日已起各卦（會員）或 `drawn: false`（訪客），只讀；`POST /api/hexagram/daily`：body 只有選填 `requestId`；會員第一次呼叫起免費卦，已有卦後的呼叫即加卦（扣 1 點）；回應含新卦與目前點數。`routeAccess.ts` 兩條皆 `optional`（訪客可用）。`Cache-Control: private, no-store`。
   - 為什麼單一 POST 不分「免費」與「加卦」兩個路徑：由伺服器依今日已有卦數決定是否扣點，客戶端無法自稱免費。
   - 前端在 `seq ≥ 1` 前顯示「將扣 1 點」並讓使用者確認，確認後才送 POST；確認畫面依 GET 的卦數判斷，但實際是否扣點仍以伺服器為準。

10. **前端。** 新增 `app/pages/hexagram.vue`、`components/fortune/HexagramPanel.vue`、`components/hexagram/Lines.vue`（六爻 SVG：實線為陽、斷線為陰、動爻加標記）與 `useDailyHexagram`；入口放進 `pages/fortune.vue` 與 `HomeEntry.vue`，由 `HEXAGRAM_ENTRY_ENABLED` 開關控制（比照 `RUNE_ENTRY_ENABLED`，內容匯入前為 false）。動畫只負責播放 API 已回傳的 `lines`；`prefers-reduced-motion` 時直接顯示結果。六爻圖提供 `aria-label`（卦名與六爻描述）。不使用 Unicode 卦象字元。

11. **後台。** `adminStats.repository` 的 `DrawGroup` 加入 `hexagramDraws`，`adminDashboard.service` 的每日使用數加一欄；每日點數消耗已依 `reason` 拆分，補上新原因的顯示名稱。

## Risks / Trade-offs

- [3 個月後紀錄被清除，後台只能看到近 3 個月的卦象歷史] → 後台只顯示近 30 天，不受影響；若日後要長期統計卦象，需另存彙總。
- [內容量大，白話 448 筆] → 分批：先匯入 64 卦的本卦白話與 384 爻的原文加簡短白話；入口開關在全部匯入並審稿前保持 false。
- [決定性雜湊使付費卦可被預測] → 卦象不涉及金錢輸贏，預測不構成風險；`seq` 隨每次付費遞增，無法重新整理換卦，且雜湊含版本與 uid，不洩漏他人結果。
- [兩個分頁同時付費加卦] → 各自取得不同 `seq` 並各扣 1 點，符合「每起一卦 1 點」；同一請求重送靠 `requestId` 去重。
- [點數不足時的體驗] → 確認畫面顯示餘額，不足時直接引導購買，不送出請求。
- [經文版本差異] → 採用通行的 King Wen 序與公版經文，常數註明來源；爻辭文字以匯入前人工校對一次為準。
- [吉凶斷語] → 內容措辭檢查擋下；爻辭原文本身含「吉凶悔吝」，常數層不過濾，但畫面對原文加註「經文原文」，白話解讀才是主要呈現。
- [六爻皆動] → 乾坤的用九、用六不單獨成條，歸入「兩個以上動爻」的呈現，只列本卦與變卦。

## Migration Plan

1. 先合併程式碼與常數，入口開關 `HEXAGRAM_ENTRY_ENABLED = false`；API 在內容缺少時回 404，不扣點。
2. 以 `pnpm content:import content/fixed/hexagram.json` 匯入白話內容，`pnpm content:check` 確認 448 筆全數發布。
3. 以 `pnpm firebase:provision`（或 `firebase deploy --only firestore:indexes`）建立 `hexagramDraws` 的 `drawnAt` 索引與 `expiresAt` 索引豁免。
4. 本機完整做過一次（免費卦、付費卦、點數不足、訪客）後，把開關改為 true 並部署。
5. 回滾：把開關改回 false 即可隱藏入口；紀錄與扣點交易保留，不需遷移。

## Open Questions

- 已確認（user，2026-11-09）：決定性雜湊（CTX-ASM-031）、不重用 `DailyDrawEngine`（CTX-ASM-033）、卦象紀錄保存 3 個月（CTX-ASM-034）、付費加卦每日不設上限（CTX-ASM-035）。
- 已確認（user，2026-11-09）：經文採通行本（王弼本系統、King Wen 序，含彖、象），白話全部自撰；入庫前需人工校對一次。
- 已確認：塔羅與盧恩也改為 3 個月，另開 change `retain-daily-draws-3-months` 處理。
