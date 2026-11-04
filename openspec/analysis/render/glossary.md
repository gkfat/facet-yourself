# 名詞對照表（Entity ／ Firestore 集合 ／ API 路徑）

> 由 analysis-validator 依 domain-model、data-model、api-model 產生；命名不改，以此表對照。

| Entity | 中文 | Firestore 集合 | API 路徑 |
|---|---|---|---|
| User（ENT-001） | 使用者帳號 | users | DELETE /account<br/>GET /fixed-results/maya-kin<br/>GET /profile<br/>POST /auth/login<br/>POST /zodiac/natal-chart<br/>PUT /profile |
| GuestSession（ENT-002） | 訪客暫存 | guestSessions | POST /guest-sessions<br/>POST /guest-sessions/{sessionId}/claim<br/>POST /human-design/calculations<br/>PUT /guest-sessions/{sessionId}/profile |
| Test（ENT-003） | 測驗定義 | tests, testVersions | GET /tests<br/>GET /tests/{testId}<br/>POST /tests/{testId}/submissions |
| TestAttempt（ENT-004） | 測驗作答紀錄 | testAttempts | GET /test-attempts<br/>POST /tests/{testId}/submissions |
| FixedContent（ENT-005） | 固定內容 | fixedContents | GET /admin/fixed-contents<br/>GET /admin/fixed-contents/coverage<br/>GET /fixed-results/blood-types/{bloodType}<br/>GET /fixed-results/maya-kin<br/>GET /fixed-results/zodiac<br/>GET /home/preview<br/>… |
| PointAccount（ENT-008） | 點數帳戶 | pointAccount | GET /points |
| PointBatch（ENT-009） | 點數批次 | pointBatches, pointPackages | GET /point-packages<br/>GET /points |
| PointTransaction（ENT-010） | 點數異動 | pointTransactions | GET /points/transactions |
| Payment（ENT-011） | 付款紀錄 | payments | GET /payments<br/>POST /payments<br/>POST /payments/webhook |
| AiUsageRecord（ENT-012） | AI 用量紀錄 | aiUsageRecords | GET /admin/ai-usage |
| HumanDesignChart（ENT-014） | 人類圖結果 | humanDesign | GET /human-design<br/>POST /human-design/calculations |
| WelcomeGrantRecord（ENT-016） | 贈點紀錄 | welcomeGrants | POST /auth/login |
| DailyMetric（ENT-017） | 每日指標 | metricsDaily | GET /admin/metrics |
| DailyDraw（ENT-018） | 每日抽取紀錄 | tarotDraws, runeDraws | GET /rune/daily<br/>GET /tarot/daily<br/>GET /today<br/>POST /rune/daily<br/>POST /tarot/daily |
| DailyKinUnlock（ENT-019） | 今日 Kin 解鎖紀錄 | kinUnlocks | GET /kin/today<br/>GET /today<br/>POST /kin/today |
| TransitReport（ENT-020） | 即時星象報告 | transitReports | GET /today<br/>GET /transit-reports<br/>GET /transit-reports/{reportId}<br/>POST /transit-reports<br/>POST /transit-reports/{reportId}/export |
| AssessmentDefinition（ENT-021） | 自我分析定義 | — | GET /assessments<br/>POST /assessments/{assessmentId}/results |
| AssessmentAttempt（ENT-022） | 自我分析作答紀錄 | assessmentAttempts | GET /assessments<br/>GET /assessments/{assessmentId}/results/latest<br/>POST /assessments/{assessmentId}/results |
| ReportSnapshot（ENT-024） | 報告快照 | reportSnapshots | GET /report-snapshots<br/>GET /report-snapshots/{snapshotId}<br/>POST /ai-reports<br/>POST /report-snapshots/{snapshotId}/export<br/>POST /single-reports |
| TraitOntology（ENT-025） | 特質本體 | — | POST /single-reports |
| TraitMapping（ENT-026） | 特質映射 | — | POST /ai-reports<br/>POST /single-reports |
| ContextFragment（ENT-027） | 情境片段 | — | POST /single-reports |
| AiReport（ENT-028） | AI 報告 | aiReports | GET /ai-reports<br/>GET /ai-reports/{id}<br/>POST /ai-reports |
