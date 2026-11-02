## 1. 資料與查詢

- [x] 1.1 新增 `shared/constants/birthdayFigures/` 型別與 `figuresOn(birthDate)` 查詢（月日為鍵；不合法日期回 `null`）
- [x] 1.2 新增測試：366 天（含 2/29）每天恰好 3 位、姓名不重複、出生年為合理過去年份、2/29 自成一組、不同年份同月日結果相同、不合法日期回 `null`
- [x] 1.3 撰寫 1–3 月人物資料（僅收錄可查證者），請使用者審閱
- [x] 1.4 撰寫 4–6 月人物資料，請使用者審閱
- [x] 1.5 撰寫 7–9 月人物資料，請使用者審閱
- [x] 1.6 撰寫 10–12 月人物資料，請使用者審閱

## 2. 報告組裝

- [x] 2.1 `SystemReportInput` 新增選填 `sameBirthday`
- [x] 2.2 `assembleSingleReport` 在「依據與限制」之後輸出 `figures` 區塊（每位人物一段 `"姓名（English name）：出生年・身分"`，最後一段固定提示）；沒有 `sameBirthday` 不輸出
- [x] 2.3 `SINGLE_REPORT_TEMPLATE_VERSION` 升為 `single-report-v3`，更新受影響的既有測試斷言
- [x] 2.4 新增 assembler 測試：有欄位時為最後一塊、無欄位時不出現、其餘區塊不變

## 3. 服務整合

- [x] 3.1 `SingleReportService` 在 `inputOf` 之後，對非 `BAZI` 且有 `birthData` 的 subject 補上 `sameBirthday`
- [x] 3.2 新增服務測試：六個系統有區塊、八字沒有、血型與 MBTI 無生日時沒有且不失敗、狀態系統不受影響

## 4. 前端呈現

- [x] 4.1 `SingleReportView.vue` 將 `figures` 區塊渲染為「跟你同一天生日的人物」大卡片，內含 3 張小卡（桌面 3 欄、手機 1 欄）與提示文字
- [x] 4.2 確認 `figures` 不被一般事實／歸納流程重複顯示

## 5. 驗證

- [x] 5.1 執行 `pnpm lint`、`pnpm test`，型別檢查無新增錯誤
- [ ] 5.2 抽查資料：每月至少隨機核對數位人物的出生日期與身分，記錄結果

> 5.2 尚未完成：人物資料由模型依記憶撰寫，未對照外部資料來源；自查時已更正 3 筆日期錯誤。請審閱 12 個月檔案（`shared/constants/birthdayFigures/*.ts`），以下為較需核對者：牛頓（1/4，新曆）、莎士比亞（4/23，傳統說法）、貝多芬（12/16，受洗日 12/17）、蕭邦（3/1）、奧馬爾·海亞姆（5/18）、聖地牙哥·拉蒙-卡哈爾等較冷門人物，以及在世人物（約 20 位）是否保留。

## 6. 範圍調整：依系統顯示不同的偉人卡片

- [x] 6.1 `SystemReportInput.sameBirthday` 改為通用的 `peers`（標題、人物、提示）；assembler 以 `peers.title` 作區塊標題
- [x] 6.2 `shared/report/peers.ts`：星座、血型、生命靈數、MBTI、Kin 的挑選（穩定選取，同輸入同結果）
- [x] 6.3 `shared/constants/peerFigures/`：血型（共 15 位，只收有明確來源者，來源顯示在卡片上）、MBTI（16 型各 8 位）、人類圖（13 位，僅收 Astro-Databank AA 級出生證明紀錄，已用 WebSearch 逐一對照）資料
- [x] 6.4 `server/humanDesign/peers.ts`：以 `calculateHumanDesign` 算出名單的類型與人生角色，比對相同者
- [x] 6.5 服務與測試更新；血型與 MBTI 不再需要生日
- [ ] 6.6 審閱新增資料：血型名單改為只收有明確來源者（ja.wikipedia 引用本人著作、官方網站、事務所、媒體報導），A 型 2 位、B 型 6 位、AB 型 2 位、O 型 5 位，皆為日本人；MBTI 為外界推測。人類圖已查證：保留 13 位 AA 級；剔除 12 位（湯姆·克魯斯時間錯誤、其餘為憑記憶或來源互相矛盾）
