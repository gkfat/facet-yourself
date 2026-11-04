## Context

AI 分析散在兩處：單維度寫入快照的 `ai`／`aiJob`（一份報告一個、重新分析覆蓋），多維度則是規則組裝的 MULTI 快照加 AI 改寫。使用者要的是「只有一種 AI 報告」，並以欄位記錄它綜合了哪些單維度報告。快照 6 個月到期、每人有上限，由每日 cron 以 collection group 的數字 `expiresAt` 清除（不開 TTL）。

## Goals / Non-Goals

**Goals:**
- 一種 AI 報告、一個建立流程、一個列表。
- `sources` 記錄所用的單維度報告，且報告自足。
- 提問可附帶並保存，同時守住 prompt 注入與內容限制。

**Non-Goals:**
- 不遷移舊資料；不刪除單筆報告、不分頁。
- 不改單維度報告本身與規則洞見庫。

## Decisions

- **獨立集合 `users/{uid}/aiReports/{id}`**，文件自帶 `status`／`failureReason`／`cost`，取代借用快照的 `ai`／`aiJob`。`id` 即冪等鍵，天然冪等。與 `reportSnapshots` 同層，沿用 collection group 清除與 `recursiveDelete` 範圍。
- **`sources[] = { system, snapshotId, position }`**：建立前先對每個系統 `saveOrReuse` 單維度快照（以指紋去重，不會因重複分析塞滿每人上限），存 id 以便連回，存 position 讓來源被清掉後仍看得懂。替代方案：只存 id（來源消失後不可讀）、存全文（太大且重複）。
- **不存 `title`**：卡片由 `sources` 的 position 組出。
- **計價**：`aiReportCost`：1 個系統 = `SINGLE_ANALYSIS_COST`，2 個以上 = `multiReportCost`。扣點 reason 沿用 `SINGLE_AI_ANALYSIS`／`MULTI_REPORT`。
- **規則洞見保留為內部素材**：2 個以上系統時在記憶體組裝並取出洞見候選，不再存 MULTI 快照；AI 輸出仍須引用候選 id，品質檢查不變。1 個系統用該報告的事實與面向。AI 輸入在回應前就備好，背景作業只呼叫模型。
- **提問**：schema 層 trim、100 字（以 code point 計）、空字串視為無；輸入 JSON 的 `question` 選填；`QUESTION_RULES` 聲明它是待回應資料而非指令，無關或違規時忽略；回應寫進「整體畫像」開頭，不改輸出 schema；保留診斷／醫療／絕對語氣限制與品質檢查。
- **逾時報告**：沒有 worker 的 GENERATING 報告在讀取列表時被標為失敗並退點（沿用 stale 機制，改在 `list` 中處理）。
- **到期**：`createdAt + 6 個月`，與快照同期但各自計算。

- **單一輸出骨架**：不再分單／多維度兩套輸出。報告 = 事實塊（每份來源報告一塊，只有標題與一句摘要，取自該報告的概覽、歸納或第一個事實，建立時就存入，不經 AI）+ AI 各段（值得注意的點、共同的優勢、共同的劣勢、過去、現在、未來、回應提問（有提問才有）、結論與提醒）。事實不交給 AI 重述，避免幻覺並讓「先看事實」成立；整份報告不重複放進去，完整內容仍在來源快照。
- **每段 = 開頭 + 條列**：AI 輸出 schema 為 `{ key, content, points[], candidateIds }`，`AI_REPORT_SECTIONS` 為每段規定條列數量（單一來源），prompt、品質檢查與畫面共用；存入時 block 的第一句是開頭、其後各句是條列。條列以「短標題：說明」呈現，畫面把短標題加粗。
- **移除「依據」**：AI 不再產生 `evidence`，品質檢查也拿掉 `NO_EVIDENCE`；可追溯性改靠規則洞見的引用（`candidateIds`）與來源報告的 `sources`。輸出 token 上限提高到 8000。
- **導師 prompt**：單一 system prompt（`reportPrompt.ts`，版本 `ai-report-v1`），以融合心理學、命相學、神秘學的導師身分縱觀過去／現在／未來並給提醒；輸入加上 `today`（台北日期），讓「現在」與大運流年等時間事實有基準。
- **對先前限制的取捨**：舊 prompt 禁止「預測具體事件」。為了符合「縱觀未來可能發生的事件與提醒」，改為允許談**可能的情境與事件類型**，仍禁止確切日期／人名／結果、吉凶斷言、壽命生死、疾病／婚姻成敗／財運的預言，並保留禁診斷、禁醫療法律財務建議；品質檢查新增壽命生死字眼（`FATALISTIC`）的失敗條件，百分比檢查擴及所有報告與條列。
- **共同的優勢與劣勢**：prompt 要求抽取各份報告「共同指向」的優勢／劣勢（多份都提到的優先），而不是逐份列出；回應提問與結論都展開成條列，結論的條列是具體可執行的提醒。prompt 版本升為 `ai-report-v2`。
- **列表與全文分離**：`GET /api/ai-reports` 只回卡片所需（不含內容），`GET /api/ai-reports/{id}` 回全文，並在讀取時處理逾時（stale）。
- **洞見引用放寬**：多個系統時，規則洞見作為候選交給 AI，只要求「值得注意的點」至少引用一條、所有引用須真實存在；不再要求每段、每條洞見各寫一段。

## Risks / Trade-offs

- [Prompt 注入] → 資料／指令分離、長度上限、輸出仍經 schema 與品質檢查；最壞結果是該次被判失敗並退點。
- [使用者自述被保存，與舊設計原則相反] → 只保存這一段提問，隨 6 個月到期，納入刪報告與刪帳號。
- [`sources` 的 snapshotId 在快照被擠掉或到期後失效] → 不依賴它顯示，position 已自足。
- [未來與「可能發生的事件」是推論，使用者可能當成預言] → prompt 限定為可能與傾向、頁尾聲明、禁壽命生死與吉凶斷言，並以品質檢查把關。
- [規則組裝的多維度報告不再呈現，失去其可閱讀的洞見／軸向地圖] → 使用者已決定只保留一種 AI 報告；規則洞見仍透過引用影響 AI 內容。
- [舊 `ai`／`aiJob` 欄位與型別留在快照 schema] → 不再寫入，隨快照到期；之後另一個 change 清理。

## Migration Plan

不遷移：舊快照上的 `ai`／`aiJob` 不再被讀寫，舊的多維度快照仍在列表 API 中但沒有入口。部署時需執行 `pnpm firebase:provision` 建立 `aiReports` 的 `expiresAt` 查詢豁免。回滾：恢復舊 API 與頁面即可，`aiReports` 內容隨到期清除。

## Open Questions

- （已決定）建立頁命名為「綜合分析」；只選一個系統時按鈕為「深入分析」；列表維持「分析紀錄」；點數紀錄的原因標籤為「綜合分析」「深入分析」。
