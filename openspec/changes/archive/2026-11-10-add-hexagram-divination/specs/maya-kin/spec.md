## ADDED Requirements

### Requirement: 今日 Kin 開啟即揭曉
系統 SHALL 在使用者進入今日運勢頁、開啟今日 Kin、或（會員）開啟首頁今日運勢區塊時自動揭曉今日 Kin，MUST NOT 要求使用者按下任何按鈕。自動揭曉沿用既有的解鎖規則：會員當日第一次揭曉建立解鎖紀錄、之後重複開啟回傳同一個 Kin；訪客依 session 與日期得到同一個 Kin 且不寫紀錄；內容尚未發佈時 MUST 顯示「準備中」且 MUST NOT 寫入紀錄。今日 Kin 屬於「讀」的內容，MUST NOT 計入首頁「今天已揭曉」的待辦計數。

#### Scenario: 會員開啟今日運勢頁
- **WHEN** 已登入的會員開啟今日運勢頁，且今天尚未揭曉 Kin
- **THEN** 系統自動揭曉並建立當日解鎖紀錄，「瑪雅 Kin」卡片直接顯示今日 Kin 的名稱與編號，不需點擊

#### Scenario: 開啟今日 Kin
- **WHEN** 使用者開啟今日 Kin
- **THEN** 直接顯示今日 Kin 與解讀，沒有「揭曉今日 Kin」的按鈕

#### Scenario: 訪客
- **WHEN** 訪客開啟今日運勢頁
- **THEN** 依 session 與日期自動顯示今日 Kin，資料庫沒有任何新文件

#### Scenario: 內容尚未發佈
- **WHEN** 當日 Kin 的內容尚未發佈
- **THEN** 顯示「準備中」，沒有解鎖紀錄
