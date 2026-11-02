## 1. 資料與查詢

- [ ] 1.1 新增 `shared/constants/birthdayFigures/` 型別與 `figuresOn(birthDate)` 查詢（月日為鍵；不合法日期回 `null`）
- [ ] 1.2 新增測試：366 天（含 2/29）每天恰好 3 位、姓名不重複、出生年為合理過去年份、2/29 自成一組、不同年份同月日結果相同、不合法日期回 `null`
- [ ] 1.3 撰寫 1–3 月人物資料（僅收錄可查證者），請使用者審閱
- [ ] 1.4 撰寫 4–6 月人物資料，請使用者審閱
- [ ] 1.5 撰寫 7–9 月人物資料，請使用者審閱
- [ ] 1.6 撰寫 10–12 月人物資料，請使用者審閱

## 2. 報告組裝

- [ ] 2.1 `SystemReportInput` 新增選填 `sameBirthday`
- [ ] 2.2 `assembleSingleReport` 在「依據與限制」之後輸出 `figures` 區塊（每位人物一段 `"姓名：出生年・身分"`，最後一段固定提示）；沒有 `sameBirthday` 不輸出
- [ ] 2.3 `SINGLE_REPORT_TEMPLATE_VERSION` 升為 `single-report-v3`，更新受影響的既有測試斷言
- [ ] 2.4 新增 assembler 測試：有欄位時為最後一塊、無欄位時不出現、其餘區塊不變

## 3. 服務整合

- [ ] 3.1 `SingleReportService` 在 `inputOf` 之後，對非 `BAZI` 且有 `birthData` 的 subject 補上 `sameBirthday`
- [ ] 3.2 新增服務測試：六個系統有區塊、八字沒有、血型與 MBTI 無生日時沒有且不失敗、狀態系統不受影響

## 4. 前端呈現

- [ ] 4.1 `SingleReportView.vue` 將 `figures` 區塊渲染為「跟你同一天生日的人物」大卡片，內含 3 張小卡（桌面 3 欄、手機 1 欄）與提示文字
- [ ] 4.2 確認 `figures` 不被一般事實／歸納流程重複顯示

## 5. 驗證

- [ ] 5.1 執行 `pnpm lint`、`pnpm test`，型別檢查無新增錯誤
- [ ] 5.2 抽查資料：每月至少隨機核對數位人物的出生日期與身分，記錄結果
