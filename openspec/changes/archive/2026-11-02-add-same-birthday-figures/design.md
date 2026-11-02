## Context

單維度報告由純函式 `assembleSingleReport(SystemReportInput)` 組裝成 blocks，最後一塊是「依據與限制」。報告由 `SingleReportService` 依各系統 adapter 產生 input；`SingleReportView.vue` 把 blocks 畫成卡片。固定內容（盧恩、Kin 解讀等）以 `shared/constants/` 內的常數提供，內容由使用者審閱。

出生日期只在 `subject.birthData` 存在時才有；血型與 MBTI 報告本身不需要生日。

## Goals / Non-Goals

**Goals:**
- 六個長效單維度系統（星座、血型、生命靈數、MBTI、Kin、人類圖）的報告最末多一張「跟你同一天生日的人物」卡片，3 位人物。
- 資料為靜態常數，離線可查、可測、不呼叫 AI。

**Non-Goals:**
- 八字；塔羅、盧恩、星座運勢等狀態系統；多維度報告（本次不動）。
- 不做人物與使用者特質的任何連結或推論。
- 不做人物圖片、連結或外部 API 查詢。
- 不處理舊快照。

## Decisions

1. **資料放 `shared/constants/birthdayFigures/`，依月份拆成 12 檔 + `index.ts` 查詢**
   - 型別：`type BirthdayFigure = { name: string; nameEn: string; year: number; role: string }`；`FIGURES_BY_DAY: Record<'MM-DD', readonly [BirthdayFigure, BirthdayFigure, BirthdayFigure]>`。
   - 理由：跟 `runeMeanings.ts` 等固定內容一致；前後端共用；單檔 1,100 筆太大，月份拆檔利於審閱與 diff。
   - 替代：放 Firestore + `content:import`。否決：內容小、不隨營運變動，且新增匯入流程只為一張彩蛋卡片。

2. **查詢以出生日期的月日為鍵，2/29 有自己的一組**
   - 函式 `figuresOn(birthDate: string)`，格式不合法時回 `null`（呼叫端不顯示），不拋錯。
   - 理由：直接、可預期；2/29 若借用 2/28 或 3/1 會讓人物不是「同一天」。

3. **（已調整）偉人卡片不屬於報告本體：由 `peersBlock` 在回應送出時附加，每次隨機挑 3 位；報告本體與模板版本（v2）不變**
   - `SystemReportInput` 增加選填 `sameBirthday?: { date: string; figures: readonly BirthdayFigure[] }`；沒給就不輸出區塊。
   - 區塊內每位人物一個 segment（`kind: 'FACT'`，text 用既有 `"label：value"` 慣例：`"姓名（English name）：1879 年生・身分"`），最後一個 segment 為固定提示「只是同一天出生，與你的特質沒有因果關係」。
   - 理由：報告其餘邏輯（事實→推論→建議→限制）不變；放最後符合需求「最後」；沿用現有 segment/視圖解析，不增加 schema。
   - 替代：新增 `SnapshotBlock` 欄位。否決：不需要，也會動到 Firestore schema。

4. **由 `SingleReportService` 在 `inputOf` 之後補欄位，不改各 adapter**
   - `inputOf` 回傳後，若 system 不是 `BAZI` 且 `subject.birthData` 存在，附上 `sameBirthday`。
   - 理由：adapters 是各系統自己的內容，不該為彩蛋重複六次；排除八字只在一處判斷。
   - 替代：每個 adapter 加參數。否決：重複且容易漏。

5. **前端用既有小卡片樣式，標題「跟你同一天生日的人物」**
   - 在 `SingleReportView.vue` 把 `figures` block 從一般流程拿出來，渲染為 3 欄（手機 1 欄）outlined 小卡：姓名為標題、出生年為副標、身分為內文。
   - 不開 Chrome 驗證（專案慣例），以 lint / test 為準。

6. **模板版本升版**：`SINGLE_REPORT_TEMPLATE_VERSION` 改為 `single-report-v3`（區塊組成改變）。

## Risks / Trade-offs

- [人物事實錯誤：生日或身分寫錯] → 只收錄出生日期可由公開傳記查證的人物；不確定者換人；使用者審閱內容後才合併；測試擋格式與數量，不擋事實。
- [366×3 內容量大、一次寫完審閱負擔重] → 依月份分檔、tasks 逐月完成與提交，可分批審閱。
- [人物選擇偏見（西方、男性居多）] → 每天人物盡量涵蓋不同領域與地區、兼顧性別；以測試只確保數量與唯一，多樣性靠審閱。
- [血型、MBTI 報告與生日無關，卡片顯得突兀] → 提示語明講只是同日出生；沒有生日時不顯示。
- [已過世人物與在世人物] → 只收錄已過世或公眾知名且生日公開的人物；偏向已過世者，避免個資爭議。

## Migration Plan

無資料遷移。部署後新產生的報告含此區塊；既有快照維持原樣（測試階段）。回復：移除 `sameBirthday` 欄位的補入即可，區塊自然消失。

## Open Questions

- 人物是否也要出現在多維度報告？目前不含，待使用者決定。
- 是否需要在同日人物中標示「與你同年」之類的互動？目前不做。
