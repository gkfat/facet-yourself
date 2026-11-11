## 1. 規則與資料定稿

- [x] 1.1 採通行規則；五張表（四化、命主〔命宮地支，原為生年支，見 2.9〕、身主、昌曲安星、左右安星）已與 iztro `main` 比對一致，全部標 `verified`（使用者 2026-11-11 指示，無使用者確認的命盤；備註如實記錄）
- [x] 1.2 實測 `lunar-typescript` 支援的年份範圍，並與第二個獨立曆法來源交叉驗證閏月與年初年末
- [x] 1.3 已決定：紫微基礎點數比照八字 3 點；`MAPPING_VERSION`／`SINGLE_REPORT_TEMPLATE_VERSION` 不升版

## 2. 排盤核心（shared/utils/ziwei）

- [x] 2.1 新增 `rules.ts`、`types.ts` 與 `ZIWEI_ALGORITHM_VERSION`；新增主星、輔星、宮位、四化表、命主身主常數
- [x] 2.2 農曆 adapter：取年月日與閏月旗標，閏月月中分界、換年於正月初一、年份範圍檢查
- [x] 2.3 時辰與晚子時處理：沿用 `BirthMoment`，晚子時不換日，時辰交界提示
- [x] 2.4 計算命宮與身宮、五行局、命主與身主
- [x] 2.5 計算紫微星位、十四主星與四輔星（昌曲左右）安星，十二宮組裝，空宮標示（只看主星）
- [x] 2.6 計算生年四化並標記於主星或輔星
- [x] 2.7 `calculateChart` 組合入口與借星（解讀層）衍生函式
- [x] 2.8 測試：十二時辰、十二命宮地支、五行局完整覆蓋、十天干四化、昌曲左右（十二時辰與十二月）、命身同宮與不同宮、閏月邊界（十五與十六日）、晚子時、時辰交界、跨年與農曆年初年末、相同輸入相同輸出
- [x] 2.9 人工命盤回歸測試至少 10 組（記錄對照來源與設定）：14 組 iztro 2.6.5 對照樣本 `referenceCharts.ts`，另以 4192 組隨機與邊界輸入逐項比對 0 筆不一致；原訂「至少 3 組由使用者提供並確認」已依使用者 2026-11-11 的指示免除，規則表因此直接標 `verified`；之後 user 提供 1 組外部程式（科技紫微網）的命盤，與我們排的完全吻合，出生資料不留存於版控，改以 iztro 取樣的匿名樣本涵蓋同樣的特徵（十個年干各一、五組命主規則不同者，`referenceCharts.ts`）（其餘 2 組仍免除）；其中一張顯示科技紫微網的命主依命宮地支而非生年支，命主因此改依命宮地支，`ZIWEI_ALGORITHM_VERSION` 升為 `sanhe-v2`，14 組 iztro 樣本的命主同步改為依命宮地支

## 3. API 與存取

- [x] 3.1 新增 `shared/schemas/api/ziwei.schema.ts`（request／response）
- [x] 3.2 新增 `server/services/ziwei.service.ts` 與 `server/api/ziwei/calculations.post.ts`
- [x] 3.3 在 `server/utils/routeAccess.ts` 加規則並補測試；缺出生時間與超出年份範圍回傳明確錯誤

## 4. 固定內容

- [x] 4.1 擴充 `shared/utils/fixedContentKeys.ts`（主星 14、輔星 4、宮位 12、四化 4）與測試
- [x] 4.2 紫微專屬措辭規則（插入全站措辭檢查，並測試禁用詞與化忌描述）
- [x] 4.3 撰寫 `content/fixed/ziwei.json`（含主星、輔星、宮位、四化；含來源、版本、審稿狀態欄位），`pnpm content:check` 與 `--dry-run`（已完成：34 則草稿 `status: DRAFT`、`AI_DRAFT`、`reviewedBy: null`，`--dry-run` 通過；`pnpm content:check` 需連線 Firestore 檢查覆蓋，留待 7.1，匯入前會顯示 34 則缺少）
- [x] 4.4 命宮與身宮的模板組合規則與測試（通順、不重複、借星標示）（`shared/utils/ziwei/readings.ts`；每句帶 contentKeys，缺內容明確拋錯）

## 5. 報告與映射

- [x] 5.1 新增 `shared/report/adapters/ziwei.ts` 與測試，註冊於 `SINGLE_REPORT_SYSTEMS`／`BASE_MULTI_REPORT_SYSTEMS`（`adapters/ziwei.ts`；事實帶 terms，推論只取命宮與身宮的星與其上的四化，借星與其他星不納入）
- [x] 5.2 新增 `shared/ontology/mappings/ziwei.ts`（十四主星、四輔星與四化 keyword mapping）並註冊；`mapping.ts` 來源類型為 `ziwei`、方法為 `keyword`（`mappings/ziwei.ts`：22 個 term、來源群組獨立為 `ziwei`；對應為草稿待審；`MAPPING_VERSION` 依 user 決定未升版，與該常數註解「新增映射條目就要升」不一致，待 user 確認）
- [x] 5.3 更新 `natureLabels.ts`、`analysisBasis.ts`、`analysisBasis.schema.ts`、`multiDimensionPricing.ts`、`explorationProgress.ts`（`ZIWEI_ENTRY_ENABLED` 預設 false，探索進度只在開關開啟時才把紫微算作一層；基礎點數 3）
- [x] 5.4 `singleReport.service.ts` 接入紫微；跑 `shared/report/synthesis.test.ts` 確認有兩軸以上特質的報告都有互動卡（`singleReport.service` 接入，缺出生時間回 `BIRTH_TIME_REQUIRED`；`synthesis.test.ts` 加入 1271 組紫微特質組合，需新增 9 條互動規則 `synthesisZiwei.ts` 才全部有互動卡）

## 6. 前端

- [x] 6.1 新增 `app/components/ziwei/*`（命盤圖含輔星顯示、宮位卡、四化標記、閏月與晚子時與時辰交界提示、簡化版說明）（`app/components/ziwei/`：ChartPanel 十二宮圖、PalaceCard、StarTag 四化標記、Notices 閏月與晚子時與時辰交界提示、Guide 簡化版說明；空宮的借星以小字標明僅供解讀）
- [x] 6.2 命盤頁與報告頁整合、補填出生時間的引導（沿用八字作法，命盤嵌在 `/full-report/ziwei` 報告頁的圖表區，沒有獨立命盤頁；缺出生時間顯示補填引導）
- [x] 6.3 `app/utils/reportDimensions.ts` 與首頁／報告頁入口；入口開關預設關閉（`ZIWEI_ENTRY_ENABLED = false`：關閉時首頁、自我探索頁、綜合報告維度與 `/full-report/ziwei` 都不出現）

## 7. 驗證與上線

- [x] 7.1 `pnpm lint`、`pnpm test`、`pnpm ontology:check`、`pnpm content:check`（lint 無警告、174 個檔案 1954 個測試通過、ontology:check OK、content:check 1526／1526）
- [x] 7.2 `pnpm build` 與 `pnpm check:bundle`（`pnpm build` 成功、`pnpm check:bundle` 無洩漏）
- [x] 7.3 本機實測命盤頁、單維度報告、含紫微與八字的綜合報告；手動起服務後釋放 port（已實測命盤頁、單維度報告、手機版面、說明對話框、入口卡片；含紫微與八字的綜合報告會呼叫 AI 並扣點，未實測，由單元測試涵蓋；實測發現並修掉前端打包 node:crypto 的問題）
- [ ] 7.4 正式匯入固定內容，開入口並部署（已完成：34 則於 2026-11-11 匯入 `service_account.json` 指向的 Firestore 專案 self-scope-c5249，審稿者 GK；`ZIWEI_ENTRY_ENABLED` 已改為 `true`；待完成：部署，由 user 執行）
