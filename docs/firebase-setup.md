# Firebase / Vercel 設定步驟（上線前一次性）

這些步驟需要有權限的人在 Firebase 與 Vercel 後台執行，程式碼無法代勞。

## 0. 服務帳戶金鑰
- 本機：把服務帳戶 JSON 放在專案根目錄 `service_account.json`（已被 `.gitignore` 排除），伺服器與腳本會自動讀取，
  專案 ID 取自金鑰內的 `project_id`，不需另設 `FIREBASE_PROJECT_ID`。
- Vercel／production：不會讀取該檔案（避免誤用），請把整份 JSON 以單行字串放進環境變數 `FIREBASE_SERVICE_ACCOUNT_KEY`。
- 也可用 `FIREBASE_SERVICE_ACCOUNT_FILE=<路徑>` 指定其他位置。
- 前端用的 `NUXT_PUBLIC_FIREBASE_*`（apiKey、appId 等）不在服務帳戶金鑰內，需從 Firebase Console 的 Web app 設定取得。
- 服務帳戶預設沒有索引與 TTL 的管理權限；`pnpm firebase:provision` 遇到 403 時，請改用下方指令，或替該帳戶加上
  「Cloud Datastore Index Admin」角色後重跑。

## 1. Firestore
1. 建立 Firebase 專案、啟用 Firestore（Native mode）與 Authentication 的 Google provider。
2. 在 Authentication 的「授權網域」加入 Vercel 網域。
3. 部署規則與索引：`firebase deploy --only firestore:rules,firestore:indexes`
   - `firestore.rules` 全擋 client，所有存取都經過 Nuxt server（firebase-admin）。
   - `firestore.indexes.json` 含到期清除用的 collection group 單欄位索引（`expiresAt`），以及後台統計每日塔羅／盧恩用的 `tarotDraws.drawnAt`、`runeDraws.drawnAt` 單欄位索引。
   - 後台 Dashboard 的聚合查詢還需要複合索引（`pointTransactions`：`type`＋`createdAt`＋`amount`、`type`＋`reason`＋`createdAt`＋`amount`；`aiUsageRecords`：`createdAt`＋三個加總欄位；`reportSnapshots`：`kind`＋`systems`），都在 `firestore.indexes.json`，用上面的 deploy 指令建立（`sum()` 的欄位必須包含在索引內）。單欄位的 `drawnAt` 索引（`tarotDraws`、`runeDraws`）與 `aiReports.createdAt`（多維度報告統計）同在該檔，一併由 deploy 建立（`pnpm firebase:provision` 也能建立）。
   - 這些索引要在 Console 的「索引」頁顯示「已啟用」後，Dashboard 對應的圖表才查得到資料。

## 2. TTL 政策（Firestore 自動清除）
欄位 `expiresAt` 必須是 Firestore Timestamp。下列集合群組要啟用 TTL：

```bash
gcloud firestore fields ttls update expiresAt --collection-group=guestSessions --enable-ttl --project=<PROJECT_ID>
gcloud firestore fields ttls update expiresAt --collection-group=welcomeGrants --enable-ttl --project=<PROJECT_ID>
gcloud firestore fields ttls update expiresAt --collection-group=rateLimits --enable-ttl --project=<PROJECT_ID>
```

TTL 清除會延遲（通常 24 小時內），程式判斷一律以時間比較為準，不依賴文件是否已被刪除。

注意：`testAttempts`、`humanDesign`、`reportSnapshots`、`aiReports` 的 `expiresAt` 是數字（epoch 毫秒），
**不要**對它們啟用 TTL；它們由每日排程 `/api/cron/data-expiry` 清除。

`tarotDraws`、`runeDraws`（每日塔羅與盧恩抽取紀錄）不會過期：新紀錄沒有 `expiresAt`，排程也不再清除，只在刪除帳號時移除。
舊文件若還帶 `expiresAt`，會被忽略，不需遷移。

## 3. Vercel
- 使用 Pro 方案（Hobby 限非商業用途，請依官方條款確認）。
- 環境變數（見 `.env.example`）：`FIREBASE_PROJECT_ID`、`FIREBASE_SERVICE_ACCOUNT_KEY`、`NUXT_PUBLIC_FIREBASE_*`、
  `CRON_SECRET`、`WELCOME_GRANT_HMAC_KEY`，以及選定供應商後的付款與 AI 金鑰。
- `vercel.json` 已設定每日 03:00（UTC）執行 `/api/cron/data-expiry`；Vercel 會以 `CRON_SECRET` 帶 Bearer token。
- 不要把 `.env`、服務帳號金鑰提交到版本庫。

## 4. 後台管理員（`/admin`）
後台只有一位超級管理員，授權由 Firebase Authentication 帳號上的 custom claim `admin: true` 決定。後端同時要求 email 已驗證且以 Google 登入。

1. 確認 Authentication → Sign-in method 已啟用 Google，且「授權網域」含正式網域（與主站相同，通常已設好）。
2. 用要當管理員的 Google 帳號，先到主站登入一次。
3. Authentication → Users：確認該帳號已出現，並記下 email 與 UID。
4. 授權（Console 沒有設定 custom claim 的介面，需用指令）：
   ```bash
   pnpm admin:grant <email>             # 授權
   pnpm admin:grant <email> --revoke    # 撤銷（同時撤銷 refresh token）
   ```
   - 本機會讀 `service_account.json`；要對 production 專案授權，改設 `FIREBASE_SERVICE_ACCOUNT_KEY`（或用 `FIREBASE_SERVICE_ACCOUNT_FILE` 指定該專案的金鑰）。
   - 找不到帳號時指令會報錯，請回到步驟 2。
5. 該帳號登出再登入，新的 token 才會帶 claim。
6. 驗證：管理員開 `/admin` 看得到後台；其他帳號或未登入開 `/admin` 會被導走，呼叫 `/api/admin/*` 會得到 401／403。

注意：撤銷後，已簽發的 token 最長約 1 小時仍有效；請務必替該 Google 帳號開啟兩步驟驗證。

## 5. 匯入內容

### 內容檔在哪裡
`content/` **不進版控**（已列入 `.gitignore`），檔案只存在本機，請自行備份。目錄結構：

| 路徑 | 內容 |
|---|---|
| `content/fixed/zodiac.json`、`blood.json`、`mbti.json`、`numerology.json` | 單項的固定內容（12、4、16、12 筆） |
| `content/fixed/<維度>-<維度>.json` | 兩個維度的組合，例如 `zodiac-mbti.json`、`blood-numerology.json` |
| `content/fixed/<維度>-<維度>-<維度>.json` | 三個維度的組合，例如 `zodiac-mbti-blood.json` |
| `content/fixed/zodiac-mbti-blood-numerology/<星座>.json` | 四個維度的組合，依星座拆成 12 個檔案，每個 768 筆 |
| `content/tests/personality16-v1.json`、`personality16-v2.json` | 16 型人格測驗的題目（v2 為 48 題，v1 保留給舊的作答結果） |
| `content/point-packages.example.json` | 點數方案的範例檔 |

固定內容的金鑰規則見 `shared/utils/fixedContentKeys.ts`；全部齊備時預期共 14,487 筆（單項 44 筆、14,320 筆組合與 123 筆八字內容）。

### 匯入指令
```bash
# 測驗題目
pnpm content:import-test content/tests/personality16-v2.json

# 固定內容：先 --dry-run 驗證，確認後再匯入（狀態為 PUBLISHED 才會對外顯示）
pnpm content:import content/fixed/zodiac.json --dry-run
pnpm content:import content/fixed/zodiac.json

# 四個維度的組合檔很多，用迴圈匯入
for f in content/fixed/zodiac-mbti-blood-numerology/*.json; do pnpm content:import "$f"; done

# 點數方案（價格確定後）
pnpm content:import-packages content/point-packages.example.json

# 檢查固定內容是否都已發布
pnpm content:check
```

等同於直接執行腳本（需要 `FIREBASE_PROJECT_ID` 與服務帳號）：
`FIREBASE_PROJECT_ID=<id> node scripts/import-fixed-content.ts <內容檔.json|.csv>`。
腳本使用 Node 內建的 TypeScript 支援（Node 24），不需額外安裝套件。

### 注意
- 匯入只會寫入內容有變動的筆數，重複匯入沒改的檔案不會多花寫入；Firestore 免費額度為每天 2 萬次寫入，一次匯入全部約 1.4 萬筆，建議分日或確認為 Blaze 方案。
- 新增或修改文案後需要重新匯入才會生效。
- `content/` 沒有版本控制，請另外備份（例如雲端硬碟）。
