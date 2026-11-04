## REMOVED Requirements

### Requirement: 大五人格題目與量表
**Reason**: HEXACO 涵蓋大五人格的五個特質並多一個「誠實謙遜」，兩個高度重疊的測驗不需要並存。題目與量表由 HEXACO 取代；兩者的五個共同特質在 HEXACO 中都有對應。

**Migration**: HEXACO 發佈並開啟入口後，先關閉大五人格入口，再刪除所有使用者的 `bigFiveAttempts` 與 Firestore 的 `BIGFIVE` 固定內容（刪除正式資料前須再向使用者確認），最後移除相關程式。已存的大五人格結果不遷移、不匯出。

### Requirement: 伺服器端計分
**Reason**: HEXACO 涵蓋大五人格的五個特質並多一個「誠實謙遜」，兩個高度重疊的測驗不需要並存。計分改由 HEXACO 的定義負責，共用框架的計分工具。

**Migration**: HEXACO 發佈並開啟入口後，先關閉大五人格入口，再刪除所有使用者的 `bigFiveAttempts` 與 Firestore 的 `BIGFIVE` 固定內容（刪除正式資料前須再向使用者確認），最後移除相關程式。已存的大五人格結果不遷移、不匯出。

### Requirement: 結果內容為固定文本
**Reason**: HEXACO 涵蓋大五人格的五個特質並多一個「誠實謙遜」，兩個高度重疊的測驗不需要並存。`BIGFIVE` 固定內容（47 筆）整個移除，改由 `ASSESSMENT` 類型承載 HEXACO 的內容。

**Migration**: HEXACO 發佈並開啟入口後，先關閉大五人格入口，再刪除所有使用者的 `bigFiveAttempts` 與 Firestore 的 `BIGFIVE` 固定內容（刪除正式資料前須再向使用者確認），最後移除相關程式。已存的大五人格結果不遷移、不匯出。

### Requirement: 與 MBTI 結果的對照
**Reason**: HEXACO 涵蓋大五人格的五個特質並多一個「誠實謙遜」，兩個高度重疊的測驗不需要並存。與 MBTI 的對照隨大五人格一起移除；HEXACO 不做這項對照，之後若需要另開 change。

**Migration**: HEXACO 發佈並開啟入口後，先關閉大五人格入口，再刪除所有使用者的 `bigFiveAttempts` 與 Firestore 的 `BIGFIVE` 固定內容（刪除正式資料前須再向使用者確認），最後移除相關程式。已存的大五人格結果不遷移、不匯出。

### Requirement: 結果的保存、到期與刪除
**Reason**: HEXACO 涵蓋大五人格的五個特質並多一個「誠實謙遜」，兩個高度重疊的測驗不需要並存。保存、到期與刪除改由共用框架的 `assessmentAttempts` 承載；`bigFiveAttempts` 不再使用。

**Migration**: HEXACO 發佈並開啟入口後，先關閉大五人格入口，再刪除所有使用者的 `bigFiveAttempts` 與 Firestore 的 `BIGFIVE` 固定內容（刪除正式資料前須再向使用者確認），最後移除相關程式。已存的大五人格結果不遷移、不匯出。

### Requirement: 測驗頁與結果頁
**Reason**: HEXACO 涵蓋大五人格的五個特質並多一個「誠實謙遜」，兩個高度重疊的測驗不需要並存。`/big-five` 與 `/analysis/big-five` 下線，由通用的 `/assessment/{id}` 與 `/analysis/{id}` 取代。

**Migration**: HEXACO 發佈並開啟入口後，先關閉大五人格入口，再刪除所有使用者的 `bigFiveAttempts` 與 Firestore 的 `BIGFIVE` 固定內容（刪除正式資料前須再向使用者確認），最後移除相關程式。已存的大五人格結果不遷移、不匯出。

### Requirement: 入口
**Reason**: HEXACO 涵蓋大五人格的五個特質並多一個「誠實謙遜」，兩個高度重疊的測驗不需要並存。大五人格的卡片移除，改由 HEXACO 的卡片取代。

**Migration**: HEXACO 發佈並開啟入口後，先關閉大五人格入口，再刪除所有使用者的 `bigFiveAttempts` 與 Firestore 的 `BIGFIVE` 固定內容（刪除正式資料前須再向使用者確認），最後移除相關程式。已存的大五人格結果不遷移、不匯出。
