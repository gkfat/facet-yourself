## 1. 規則與資料定稿

- [ ] 1.1 選定並記錄四化表、命主與身主的具體來源（書名與版本），寫入常數檔註解與 design
- [ ] 1.2 實測 `lunar-typescript` 支援的年份範圍，並與第二個獨立曆法來源交叉驗證閏月與年初年末
- [ ] 1.3 確認紫微基礎點數（預設比照八字）與 `MAPPING_VERSION`／`SINGLE_REPORT_TEMPLATE_VERSION` 是否升版

## 2. 排盤核心（shared/utils/ziwei）

- [ ] 2.1 新增 `rules.ts`、`types.ts` 與 `ZIWEI_ALGORITHM_VERSION`；新增星曜、宮位、四化表、命主身主常數
- [ ] 2.2 農曆 adapter：取年月日與閏月旗標，閏月月中分界、換年於正月初一、年份範圍檢查
- [ ] 2.3 時辰與晚子時處理：沿用 `BirthMoment`，晚子時不換日，時辰交界提示
- [ ] 2.4 計算命宮與身宮、五行局、命主與身主
- [ ] 2.5 計算紫微星位與十四主星安星，十二宮組裝，空宮標示
- [ ] 2.6 計算生年四化並標記於星曜
- [ ] 2.7 `calculateChart` 組合入口與借星（解讀層）衍生函式
- [ ] 2.8 測試：十二時辰、十二命宮地支、五行局完整覆蓋、十天干四化、命身同宮與不同宮、閏月邊界（十五與十六日）、晚子時、時辰交界、跨年與農曆年初年末、相同輸入相同輸出
- [ ] 2.9 人工命盤回歸測試至少 10 組（記錄對照來源與設定），其中至少 3 組由使用者提供並確認

## 3. API 與存取

- [ ] 3.1 新增 `shared/schemas/api/ziwei.schema.ts`（request／response）
- [ ] 3.2 新增 `server/services/ziwei.service.ts` 與 `server/api/ziwei/calculations.post.ts`
- [ ] 3.3 在 `server/utils/routeAccess.ts` 加規則並補測試；缺出生時間與超出年份範圍回傳明確錯誤

## 4. 固定內容

- [ ] 4.1 擴充 `shared/utils/fixedContentKeys.ts`（主星 14、宮位 12、四化 4）與測試
- [ ] 4.2 紫微專屬措辭規則（插入全站措辭檢查，並測試禁用詞與化忌描述）
- [ ] 4.3 撰寫 `content/fixed/ziwei.json`（含來源、版本、審稿狀態欄位），`pnpm content:check` 與 `--dry-run`
- [ ] 4.4 命宮與身宮的模板組合規則與測試（通順、不重複、借星標示）

## 5. 報告與映射

- [ ] 5.1 新增 `shared/report/adapters/ziwei.ts` 與測試，註冊於 `SINGLE_REPORT_SYSTEMS`／`BASE_MULTI_REPORT_SYSTEMS`
- [ ] 5.2 新增 `shared/ontology/mappings/ziwei.ts`（十四主星與四化 keyword mapping）並註冊；`mapping.ts` 來源類型為 `ziwei`、方法為 `keyword`
- [ ] 5.3 更新 `natureLabels.ts`、`analysisBasis.ts`、`analysisBasis.schema.ts`、`multiDimensionPricing.ts`、`explorationProgress.ts`
- [ ] 5.4 `singleReport.service.ts` 接入紫微；跑 `shared/report/synthesis.test.ts` 確認有兩軸以上特質的報告都有互動卡

## 6. 前端

- [ ] 6.1 新增 `app/components/ziwei/*`（命盤圖、宮位卡、四化標記、閏月與晚子時與時辰交界提示、簡化版說明）
- [ ] 6.2 命盤頁與報告頁整合、補填出生時間的引導
- [ ] 6.3 `app/utils/reportDimensions.ts` 與首頁／報告頁入口；入口開關預設關閉

## 7. 驗證與上線

- [ ] 7.1 `pnpm lint`、`pnpm test`、`pnpm ontology:check`、`pnpm content:check`
- [ ] 7.2 `pnpm build` 與 `pnpm check:bundle`
- [ ] 7.3 本機實測命盤頁、單維度報告、含紫微與八字的綜合報告；手動起服務後釋放 port
- [ ] 7.4 正式匯入固定內容，開入口並部署
