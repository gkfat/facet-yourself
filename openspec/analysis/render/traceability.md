# Traceability（AI 多維度人格探索 App）

> 真相檔：`openspec/analysis/traceability.yaml`（本檔由 yaml 產生）。已廢止項目（ENT-015、DATA-017、REL-019、NFR-016、API-030 等）不納入追溯。
> 更新：2026-10-27（納入「此刻／今日」類：FR-044 至 FR-055、UC-022 至 UC-030、API-040 至 API-052、DATA-020 至 DATA-023）
> 更新：2026-11-03（納入「自我分析擴充」：FR-056 至 FR-073、UC-031 至 UC-046、API-058 至 API-060、DATA-024 與 DATA-025）
> 更新：2026-11-03（重跑 data-modeling 後重新計算所有追溯鏈：舊的報告 API 已不存在，相關 FR 改列為 gap）
> 更新：2026-11-03（補進既有的報告架構：FR-074 至 FR-084、UC-047 至 UC-053、ENT-024 至 ENT-027、DATA-026；舊的詳細分析與 summary 相關項目已標為 deprecated，不納入追溯）

## 追溯矩陣（以 FR 為主軸）

| FR | Context | Use Case | Domain | API | Data |
|---|---|---|---|---|---|
| FR-001 | CTX-ACTOR-001, CTX-EXT-006, CTX-ASM-004 | UC-001, UC-002, UC-006 | AGG-001, AGG-002, AGG-004, AGG-008, AGG-013, ENT-001, ENT-002, ENT-004, ENT-008, ENT-009, ENT-010, ENT-016 | API-001, API-006 | DATA-001, DATA-002, DATA-005, DATA-009, DATA-010, DATA-011, DATA-013, DATA-016, DATA-018 |
| FR-032 | CTX-ACTOR-001, CTX-EXT-006, CTX-EXT-005, CTX-ASM-004, CTX-ASM-008 | UC-001, UC-006 | AGG-001, AGG-002, AGG-004, ENT-001, ENT-002, ENT-004 | API-001, API-006 | DATA-001, DATA-002, DATA-005, DATA-009, DATA-010, DATA-011, DATA-016, DATA-018 |
| FR-002 | CTX-ACTOR-001, CTX-ASM-005, CTX-ASM-006, CTX-CON-006 | UC-003, UC-004, UC-008 | AGG-001, AGG-002, AGG-005, AGG-012, ENT-001, ENT-002, ENT-005, ENT-014, VO-001, VO-002, VO-005 | API-002, API-003, API-004, API-005, API-007, API-008, API-013, API-038 | DATA-001, DATA-002, DATA-006, DATA-016 |
| FR-003 | CTX-ACTOR-001 | UC-005 | AGG-002, AGG-003, AGG-004, ENT-002, ENT-003, ENT-004, ENT-005, VO-003, VO-006, VO-007 | API-004, API-009, API-010, API-011 | DATA-001, DATA-002, DATA-003, DATA-004, DATA-005, DATA-006, DATA-019 |
| FR-004 | CTX-ACTOR-001, CTX-CON-001, CTX-CON-007, CTX-ASM-008 | UC-005 | AGG-002, AGG-003, AGG-004, ENT-002, ENT-003, ENT-004, ENT-005, VO-003, VO-006, VO-007 | API-004, API-009, API-010, API-011 | DATA-001, DATA-002, DATA-003, DATA-004, DATA-005, DATA-006, DATA-019 |
| FR-005 | CTX-ACTOR-001, CTX-ACTOR-002, CTX-CON-006, CTX-EXT-005, CTX-EXT-006 | UC-006, UC-015 | AGG-001, AGG-002, AGG-004, AGG-012, ENT-001, ENT-002, ENT-004, ENT-014 | API-002, API-006, API-012, API-025, API-038 | DATA-001, DATA-002, DATA-005, DATA-012, DATA-016 |
| FR-007 | CTX-ACTOR-001, CTX-CON-001 | UC-004, UC-005 | AGG-002, AGG-003, AGG-004, AGG-005, ENT-002, ENT-003, ENT-004, ENT-005, VO-002, VO-003, VO-006, VO-007 | API-004, API-007, API-008, API-009, API-010, API-011 | DATA-001, DATA-002, DATA-003, DATA-004, DATA-005, DATA-006, DATA-019 |
| FR-008 | CTX-ACTOR-003, CTX-CON-005, CTX-CON-004, CTX-EXT-005 | UC-019 | AGG-005, ENT-005, VO-004 | API-031, API-032, API-033, API-034 | DATA-006 |
| FR-009 | CTX-ACTOR-003, CTX-ASM-005, CTX-EXT-005, CTX-CON-005 | UC-019 | AGG-005, ENT-005, VO-004 | API-031, API-032, API-033, API-034 | DATA-006 |
| FR-010 | CTX-ACTOR-001, CTX-EXT-003 | UC-018 | VO-011 | API-027 | DATA-002, DATA-006, DATA-019 |
| FR-011 | CTX-ACTOR-001, CTX-EXT-001, CTX-ASM-002, CTX-CON-014, CTX-CON-011 | UC-010 | AGG-009, ENT-011, VO-010 | API-023, API-024, API-025 | DATA-012, DATA-013 |
| FR-012 | CTX-EXT-001, CTX-CON-003, CTX-CON-014 | UC-011 | AGG-008, AGG-009, ENT-008, ENT-009, ENT-010, ENT-011, VO-010 | API-026 | DATA-009, DATA-010, DATA-011, DATA-012, DATA-013, DATA-019 |
| FR-013 | CTX-EXT-001, CTX-ACTOR-004, CTX-CON-011 | UC-010, UC-011 | AGG-008, AGG-009, ENT-008, ENT-009, ENT-010, ENT-011, VO-010 | API-023, API-024, API-025, API-026 | DATA-009, DATA-010, DATA-011, DATA-012, DATA-013, DATA-019 |
| FR-014 | CTX-ACTOR-002, CTX-CON-003, CTX-CON-014 | UC-014, UC-021, UC-027 | AGG-008, AGG-010, AGG-017, AGG-021, ENT-008, ENT-009, ENT-010, ENT-020, ENT-024, VO-012, VO-013, VO-014, VO-015, VO-016 | API-021, API-022, API-048, API-061 | DATA-009, DATA-010, DATA-011, DATA-013, DATA-014, DATA-023, DATA-026 |
| FR-017 | CTX-CON-001, CTX-CON-009, CTX-EXT-002 | UC-027 | AGG-008, AGG-010, AGG-017, ENT-020, VO-012, VO-013, VO-014, VO-015, VO-016 | API-048 | DATA-011, DATA-014, DATA-023 |
| FR-019 | CTX-ACTOR-002, CTX-EXT-002, CTX-CON-007, CTX-CON-014 | UC-027 | AGG-008, AGG-010, AGG-017, ENT-020, VO-012, VO-013, VO-014, VO-015, VO-016 | API-048 | DATA-011, DATA-014, DATA-023 |
| FR-021 | CTX-ACTOR-002, CTX-CON-003, CTX-CON-006 | UC-028 | AGG-017, ENT-020 | API-049, API-050 | DATA-023 |
| FR-022 | CTX-ACTOR-004, CTX-CON-007 | UC-020, UC-027 | AGG-008, AGG-010, AGG-014, AGG-017, ENT-012, ENT-017, ENT-020, VO-012, VO-013, VO-014, VO-015, VO-016 | API-030, API-035, API-036, API-048 | DATA-011, DATA-014, DATA-019, DATA-023 |
| FR-023 | CTX-ACTOR-001, CTX-ACTOR-002, CTX-CON-006, CTX-CON-012, CTX-EXT-005, CTX-EXT-006, CTX-ASM-011 | UC-016 | AGG-001, AGG-009, ENT-001, ENT-011, ENT-022 | API-028, API-029 | DATA-001, DATA-005, DATA-009, DATA-010, DATA-011, DATA-012, DATA-014, DATA-016, DATA-024, DATA-026 |
| FR-024 | CTX-ACTOR-001, CTX-CON-006 | UC-005 | AGG-002, AGG-003, AGG-004, ENT-002, ENT-003, ENT-004, ENT-005, VO-003, VO-006, VO-007 | API-004, API-009, API-010, API-011 | DATA-001, DATA-002, DATA-003, DATA-004, DATA-005, DATA-006, DATA-019 |
| FR-025 | CTX-ACTOR-001, CTX-ACTOR-002 | UC-015 | AGG-001, AGG-012, ENT-001, ENT-004, ENT-014 | API-002, API-012, API-025, API-038 | DATA-001, DATA-005, DATA-012, DATA-016 |
| FR-026 | CTX-ACTOR-004 | UC-020 | AGG-010, AGG-014, ENT-012, ENT-017 | API-030, API-035, API-036 | DATA-014, DATA-019 |
| FR-027 | CTX-ACTOR-001, CTX-CON-002, CTX-CON-008 |  |  |  |  |
| FR-028 | CTX-ACTOR-001, CTX-CON-008 |  |  |  |  |
| FR-029 | CTX-ACTOR-002, CTX-EXT-001, CTX-ASM-002, CTX-CON-008 |  |  |  |  |
| FR-030 | CTX-ACTOR-002, CTX-CON-008 |  |  |  |  |
| FR-031 | CTX-ACTOR-002, CTX-EXT-002, CTX-CON-008 |  |  |  |  |
| FR-036 | CTX-ACTOR-001, CTX-ASM-006, CTX-CON-007 | UC-008 | AGG-012, ENT-014, VO-001, VO-005 | API-013, API-038 | DATA-001, DATA-002, DATA-016 |
| FR-037 | CTX-ACTOR-001, CTX-CON-014, CTX-EXT-006, CTX-EXT-005 | UC-002 | AGG-001, AGG-008, AGG-013, ENT-001, ENT-008, ENT-009, ENT-010, ENT-016 | API-001 | DATA-001, DATA-009, DATA-010, DATA-011, DATA-013, DATA-018 |
| FR-038 | CTX-ACTOR-001, CTX-ACTOR-002, CTX-CON-014, CTX-ASM-010 | UC-021, UC-027 | AGG-008, AGG-010, AGG-017, AGG-021, ENT-020, ENT-024, VO-012, VO-013, VO-014, VO-015, VO-016 | API-048, API-061 | DATA-011, DATA-014, DATA-023, DATA-026 |
| FR-039 | CTX-ACTOR-002, CTX-CON-014 | UC-014 | AGG-008, ENT-008, ENT-009, ENT-010 | API-021, API-022 | DATA-009, DATA-010, DATA-011, DATA-013 |
| FR-040 | CTX-ACTOR-001, CTX-CON-007, CTX-CON-014, CTX-EXT-005, CTX-ASM-010 | UC-004, UC-005 | AGG-002, AGG-003, AGG-004, AGG-005, ENT-002, ENT-003, ENT-004, ENT-005, VO-002, VO-003, VO-006, VO-007 | API-004, API-007, API-008, API-009, API-010, API-011 | DATA-001, DATA-002, DATA-003, DATA-004, DATA-005, DATA-006, DATA-019 |
| FR-042 | CTX-ACTOR-001, CTX-ACTOR-002, CTX-CON-014 | UC-014, UC-021, UC-027 | AGG-008, AGG-010, AGG-017, AGG-021, ENT-008, ENT-009, ENT-010, ENT-020, ENT-024, VO-012, VO-013, VO-014, VO-015, VO-016 | API-021, API-022, API-048, API-061 | DATA-009, DATA-010, DATA-011, DATA-013, DATA-014, DATA-023, DATA-026 |
| FR-033 | CTX-CON-012, CTX-CON-006, CTX-EXT-005, CTX-ACTOR-001, CTX-ACTOR-002, CTX-CON-017, CTX-CON-018 | UC-017, UC-028 | AGG-004, AGG-017, AGG-019, ENT-004, ENT-020, ENT-022 | API-037, API-049, API-050 | DATA-005, DATA-023, DATA-024, DATA-026 |
| FR-035 | CTX-ACTOR-001, CTX-CON-012, CTX-EXT-007 |  |  |  |  |
| FR-043 | CTX-CON-012, CTX-EXT-001, CTX-ACTOR-004 | UC-011, UC-016 | AGG-001, AGG-008, AGG-009, ENT-001, ENT-008, ENT-009, ENT-010, ENT-011, ENT-022, VO-010 | API-026, API-028, API-029 | DATA-001, DATA-005, DATA-009, DATA-010, DATA-011, DATA-012, DATA-013, DATA-014, DATA-016, DATA-019, DATA-024, DATA-026 |
| FR-034 | CTX-ACTOR-002, CTX-CON-014, CTX-CON-029, CTX-ASM-028 | UC-021 | AGG-021, ENT-024 | API-061 | DATA-026 |
| FR-044 | CTX-ACTOR-001, CTX-ACTOR-002, CTX-CON-016, CTX-ASM-004 | UC-022 | AGG-015, AGG-016, AGG-017, ENT-018, ENT-019, ENT-020 | API-040, API-041, API-043, API-045, API-049 | DATA-020, DATA-021, DATA-022, DATA-023 |
| FR-045 | CTX-ACTOR-001, CTX-CON-016, CTX-CON-018, CTX-CON-007, CTX-EXT-005, CTX-EXT-006 | UC-023 | AGG-005, AGG-015, ENT-005, ENT-018, VO-018 | API-041, API-042 | DATA-006, DATA-020, DATA-021 |
| FR-046 | CTX-ACTOR-001, CTX-CON-016, CTX-CON-018, CTX-CON-019, CTX-ASM-016 | UC-024 | AGG-005, AGG-015, ENT-005, ENT-018, VO-018 | API-043, API-044 | DATA-006, DATA-020, DATA-021 |
| FR-047 | CTX-ACTOR-001, CTX-CON-016, CTX-CON-020, CTX-ASM-015, CTX-ASM-017, CTX-EXT-006 | UC-025 | AGG-005, AGG-016, ENT-005, ENT-019, VO-017 | API-045, API-046 | DATA-006, DATA-022 |
| FR-048 | CTX-ACTOR-001, CTX-CON-020, CTX-CON-007, CTX-ASM-015, CTX-ASM-006 | UC-026 | AGG-005, ENT-001, ENT-005, VO-017 | API-047 | DATA-001, DATA-006, DATA-022 |
| FR-049 | CTX-CON-020, CTX-ASM-015 | UC-025, UC-026 | AGG-005, AGG-016, ENT-001, ENT-005, ENT-019, VO-017 | API-045, API-046, API-047 | DATA-001, DATA-006, DATA-022 |
| FR-050 | CTX-EXT-008, CTX-CON-007, CTX-ASM-014 | UC-027 | AGG-008, AGG-010, AGG-017, ENT-020, VO-012, VO-013, VO-014, VO-015, VO-016 | API-048 | DATA-011, DATA-014, DATA-023 |
| FR-051 | CTX-ACTOR-002, CTX-EXT-002, CTX-CON-017, CTX-CON-016, CTX-CON-014, CTX-ASM-018 | UC-027 | AGG-008, AGG-010, AGG-017, ENT-020, VO-012, VO-013, VO-014, VO-015, VO-016 | API-048 | DATA-011, DATA-014, DATA-023 |
| FR-052 | CTX-ACTOR-002, CTX-CON-014, CTX-EXT-005, CTX-ASM-013 | UC-027 | AGG-008, AGG-010, AGG-017, ENT-020, VO-012, VO-013, VO-014, VO-015, VO-016 | API-048 | DATA-011, DATA-014, DATA-023 |
| FR-053 | CTX-ACTOR-002, CTX-CON-017, CTX-CON-012, CTX-EXT-005 | UC-028 | AGG-017, ENT-020 | API-049, API-050 | DATA-023 |
| FR-054 | CTX-ACTOR-002, CTX-CON-017, CTX-CON-014, CTX-ASM-019 | UC-029 | AGG-017, ENT-020 | API-051 | DATA-023 |
| FR-055 | CTX-EXT-008, CTX-ASM-014, CTX-ASM-006 | UC-030 | ENT-001, VO-012, VO-013 | API-052 | DATA-001, DATA-023 |
| FR-056 | CTX-CON-021, CTX-ACTOR-001 | UC-031, UC-032, UC-044 | AGG-005, AGG-018, AGG-019, ENT-005, ENT-021, ENT-022, VO-019, VO-020, VO-027 | API-059 | DATA-006, DATA-024 |
| FR-057 | CTX-CON-021, CTX-CON-003, CTX-CON-007 | UC-031, UC-032 | AGG-018, AGG-019, ENT-005, ENT-021, ENT-022, VO-019, VO-020, VO-027 | API-059 | DATA-006, DATA-024 |
| FR-058 | CTX-CON-021, CTX-CON-007, CTX-CON-005 | UC-031, UC-044 | AGG-005, AGG-018, AGG-019, ENT-005, ENT-021, ENT-022, VO-019, VO-020 | API-059 | DATA-006, DATA-024 |
| FR-059 | CTX-CON-023, CTX-CON-012, CTX-EXT-005, CTX-ACTOR-001 | UC-031, UC-033, UC-034 | AGG-018, AGG-019, ENT-001, ENT-005, ENT-021, ENT-022, VO-019, VO-020 | API-059, API-060 | DATA-001, DATA-006, DATA-024 |
| FR-060 | CTX-CON-021, CTX-CON-024, CTX-ACTOR-001 | UC-031, UC-032, UC-033 | AGG-018, AGG-019, ENT-001, ENT-005, ENT-021, ENT-022, VO-019, VO-020, VO-027 | API-059, API-060 | DATA-001, DATA-006, DATA-024 |
| FR-061 | CTX-CON-021, CTX-ACTOR-001 | UC-035 | AGG-018, ENT-021 | API-058 | DATA-006, DATA-024 |
| FR-062 | CTX-CON-022, CTX-CON-015, CTX-CON-001 | UC-031, UC-036, UC-037, UC-038, UC-039, UC-040, UC-041, UC-042, UC-043, UC-044 | AGG-005, AGG-018, AGG-019, ENT-005, ENT-021, ENT-022, VO-019, VO-020, VO-021, VO-022, VO-023, VO-024, VO-025, VO-026, VO-027 | API-059, API-060 | DATA-006, DATA-024 |
| FR-063 | CTX-CON-021, CTX-CON-024, CTX-ASM-020, CTX-ASM-021 | UC-036 | VO-021, VO-023 | API-060 | DATA-006, DATA-024 |
| FR-064 | CTX-CON-021, CTX-CON-024, CTX-CON-025, CTX-ASM-020 | UC-037 | VO-021, VO-022 | API-060 | DATA-006, DATA-024 |
| FR-065 | CTX-CON-021, CTX-CON-024, CTX-ASM-020 | UC-038 | VO-021, VO-025 | API-060 | DATA-006, DATA-024 |
| FR-066 | CTX-CON-021, CTX-CON-024, CTX-CON-022, CTX-ASM-020 | UC-039 | VO-021, VO-024 | API-060 | DATA-006, DATA-024 |
| FR-067 | CTX-CON-021, CTX-CON-024, CTX-CON-002, CTX-ASM-020 | UC-040 | VO-021, VO-022 | API-060 | DATA-006, DATA-024 |
| FR-068 | CTX-CON-021, CTX-CON-024, CTX-ASM-020, CTX-ASM-023 | UC-041 | VO-021, VO-026 | API-060 | DATA-006, DATA-024 |
| FR-069 | CTX-CON-021, CTX-CON-024, CTX-ASM-020, CTX-ASM-023 | UC-032, UC-042 | AGG-018, AGG-019, ENT-005, ENT-021, ENT-022, VO-019, VO-020, VO-027 | API-059, API-060 | DATA-006, DATA-024 |
| FR-070 | CTX-CON-021, CTX-CON-024, CTX-ASM-020 | UC-043 | VO-021, VO-022 | API-060 | DATA-006, DATA-024 |
| FR-071 | CTX-CON-025, CTX-CON-012, CTX-EXT-005, CTX-ASM-024 | UC-045 |  |  |  |
| FR-072 | CTX-CON-026, CTX-CON-014, CTX-CON-021, CTX-ACTOR-002, CTX-ASM-025 | UC-046 | AGG-018, AGG-019, ENT-021, ENT-022 | API-057, API-058 | DATA-006, DATA-010, DATA-011, DATA-014, DATA-019, DATA-024, DATA-026 |
| FR-073 | CTX-CON-026, CTX-CON-014, CTX-ASM-025 | UC-046 | AGG-018, AGG-019, ENT-021, ENT-022 | API-057, API-058 | DATA-006, DATA-010, DATA-011, DATA-014, DATA-019, DATA-024, DATA-026 |
| FR-074 | CTX-CON-027, CTX-CON-007, CTX-CON-009, CTX-ACTOR-001 | UC-047 | AGG-021, AGG-022, AGG-023, AGG-024, ENT-024, ENT-025, ENT-026, ENT-027, VO-028, VO-029, VO-030, VO-031 | API-055 | DATA-006, DATA-026 |
| FR-075 | CTX-CON-027, CTX-CON-028, CTX-CON-016, CTX-CON-015, CTX-ACTOR-001 | UC-047 | AGG-021, AGG-022, AGG-023, AGG-024, ENT-024, ENT-025, ENT-026, ENT-027, VO-028, VO-029, VO-030, VO-031 | API-055 | DATA-006, DATA-026 |
| FR-076 | CTX-CON-027, CTX-CON-018, CTX-CON-029, CTX-ACTOR-001 | UC-048 | AGG-021, ENT-024 | API-055 | DATA-006, DATA-026 |
| FR-077 | CTX-CON-027, CTX-CON-014, CTX-CON-009, CTX-EXT-002, CTX-ACTOR-002 | UC-049 | AGG-008, AGG-010, AGG-021, ENT-008, ENT-010, ENT-012, ENT-024, VO-004, VO-005, VO-008, VO-009, VO-029, VO-032, VO-033 | API-056 | DATA-006, DATA-009, DATA-011, DATA-014, DATA-016, DATA-023, DATA-026 |
| FR-078 | CTX-CON-027, CTX-CON-028, CTX-CON-014, CTX-ASM-026, CTX-EXT-002, CTX-ACTOR-002 | UC-050 | AGG-005, AGG-008, AGG-010, AGG-021, AGG-023, ENT-005, ENT-008, ENT-010, ENT-012, ENT-024, ENT-026, VO-002, VO-003, VO-004, VO-005, VO-008, VO-009, VO-032, VO-033, VO-036 | API-057 | DATA-001, DATA-002, DATA-005, DATA-006, DATA-009, DATA-010, DATA-011, DATA-014, DATA-016, DATA-019, DATA-023, DATA-026 |
| FR-079 | CTX-CON-029, CTX-CON-027, CTX-ACTOR-001 | UC-047, UC-049, UC-050, UC-051 | AGG-005, AGG-008, AGG-010, AGG-021, AGG-022, AGG-023, AGG-024, ENT-005, ENT-008, ENT-010, ENT-012, ENT-024, ENT-025, ENT-026, ENT-027, VO-002, VO-003, VO-004, VO-005, VO-008, VO-009, VO-028, VO-029, VO-030, VO-031, VO-032, VO-033, VO-036 | API-053, API-054, API-055, API-056, API-057 | DATA-001, DATA-002, DATA-005, DATA-006, DATA-009, DATA-010, DATA-011, DATA-014, DATA-016, DATA-019, DATA-023, DATA-026 |
| FR-080 | CTX-CON-029, CTX-CON-012, CTX-CON-006, CTX-EXT-005, CTX-ASM-027, CTX-ACTOR-001 | UC-049, UC-050, UC-051, UC-052 | AGG-005, AGG-008, AGG-010, AGG-021, AGG-023, ENT-005, ENT-008, ENT-010, ENT-012, ENT-024, ENT-026, VO-002, VO-003, VO-004, VO-005, VO-008, VO-009, VO-028, VO-029, VO-030, VO-031, VO-032, VO-033, VO-036 | API-028, API-029, API-037, API-053, API-054, API-056, API-057 | DATA-001, DATA-002, DATA-005, DATA-006, DATA-009, DATA-010, DATA-011, DATA-012, DATA-014, DATA-016, DATA-019, DATA-023, DATA-024, DATA-026 |
| FR-081 | CTX-CON-028, CTX-ACTOR-003 | UC-053 | AGG-022, AGG-023, AGG-024, ENT-025, ENT-026, ENT-027, VO-034, VO-035, VO-036 |  |  |
| FR-082 | CTX-CON-028, CTX-ACTOR-003 | UC-053 | AGG-022, AGG-023, AGG-024, ENT-025, ENT-026, ENT-027, VO-034, VO-035, VO-036 |  |  |
| FR-083 | CTX-CON-028, CTX-CON-016, CTX-ACTOR-003 | UC-053 | AGG-022, AGG-023, AGG-024, ENT-025, ENT-026, ENT-027, VO-034, VO-035, VO-036 |  |  |
| FR-084 | CTX-CON-027, CTX-CON-009, CTX-ACTOR-004 | UC-047 | AGG-021, AGG-022, AGG-023, AGG-024, ENT-024, ENT-025, ENT-026, ENT-027, VO-028, VO-029, VO-030, VO-031 | API-055 | DATA-006, DATA-026 |

## Gap 清單（依 severity 排序）

### HIGH（0）

無

### MEDIUM（4）

- **render-drift** `/bazi/calculations`：render/api.yaml 有此路徑，但 api-model.yaml 沒有（render 應由 api-model 去除 x-trace 產生） → 建議：重跑 api-modeling：把路徑補進 api-model.yaml，再由它去除 x-trace 產生 render
- **render-drift** `/fixed-results/mbti/{type}`：render/api.yaml 有此路徑，但 api-model.yaml 沒有（render 應由 api-model 去除 x-trace 產生） → 建議：重跑 api-modeling：把路徑補進 api-model.yaml，再由它去除 x-trace 產生 render
- **render-drift** `/fixed-results/numerology/{number}`：render/api.yaml 有此路徑，但 api-model.yaml 沒有（render 應由 api-model 去除 x-trace 產生） → 建議：重跑 api-modeling：把路徑補進 api-model.yaml，再由它去除 x-trace 產生 render
- **render-drift** `/big-five/results、/big-five/results/latest`：render/api.yaml 有這兩條已實作的大五人格路由（為通過 server/api.routes.test.ts 而直接補進去），但 api-model.yaml 沒有 → 建議：不補進 api-model：大五人格將隨 UC-045 整個移除，移除時一併從 render/api.yaml 拿掉

### LOW（31）

- **dangling-reference** `api-model:ProductEventRequest`：schema $ref 指向不存在的 ProductEventRequest（出現在已廢止的 /events） → 建議：修正該引用或補上缺少的項目
- **nfr-not-landed** `NFR-021`：NFR（新增抽取型的重用性）沒有在 api-model 或 data-model 任何一處被提及（僅出現在 use case 流程） → 建議：確認是否需要在 API 或資料模型落地；屬設計層約束者可忽略
- **orphan-requirement** `FR-027`：FR 沒有任何 use case（智力／認知測驗；priority=could、phase=5、mvp=false） → 建議：若要納入，重跑 requirement-modeling；延後或刻意不落地的項目可忽略
- **orphan-requirement** `FR-028`：FR 沒有任何 use case（延伸專題測驗；priority=could、phase=5、mvp=false） → 建議：若要納入，重跑 requirement-modeling；延後或刻意不落地的項目可忽略
- **orphan-requirement** `FR-029`：FR 沒有任何 use case（會員訂閱；priority=could、phase=5、mvp=false） → 建議：若要納入，重跑 requirement-modeling；延後或刻意不落地的項目可忽略
- **orphan-requirement** `FR-030`：FR 沒有任何 use case（歷史結果比較；priority=could、phase=5、mvp=false） → 建議：若要納入，重跑 requirement-modeling；延後或刻意不落地的項目可忽略
- **orphan-requirement** `FR-031`：FR 沒有任何 use case（AI 對話式人格探索；priority=could、phase=5、mvp=false） → 建議：若要納入，重跑 requirement-modeling；延後或刻意不落地的項目可忽略
- **orphan-requirement** `FR-035`：FR 沒有任何 use case（資料到期前通知；priority=should、phase=5、mvp=false） → 建議：若要納入，重跑 requirement-modeling；延後或刻意不落地的項目可忽略
- **pending-assumption** `CTX-ASM-003`：假設尚待確認：AI 報告由使用者點擊後生成，非自動生成（§14.3 待決） → 建議：向 user 確認後更新 context.yaml 的 status
- **pending-assumption** `CTX-ASM-007`：假設尚待確認：目標市場與語系未指定，暫假設為繁體中文市場 → 建議：向 user 確認後更新 context.yaml 的 status
- **pending-assumption** `CTX-ASM-019`：假設尚待確認：即時星象報告需支援匯出 PDF（user 已確認需求，功能尚未實作）；匯出是否扣點、是下載還是寄送 email、與詳細分 → 建議：向 user 確認後更新 context.yaml 的 status
- **planned-not-implemented** `API-051`：POST /transit-reports/{reportId}/export 為規劃中尚未實作 → 建議：實作前先決定待確認項目
- **render-drift** `/events`：api-model.yaml 有此路徑，但 render/api.yaml 沒有 → 建議：重跑 api-modeling：把路徑補進 api-model.yaml，再由它去除 x-trace 產生 render
- **vo-unused** `VO-011`：Value Object ShareCard 未被任何聚合或資料表使用 → 建議：確認是否保留
- **nfr-not-landed** `NFR-023`：NFR（新增一種自我分析的成本）沒有在 api-model 或 data-model 任何一處被提及（屬程式結構的設計層約束） → 建議：設計層約束，可忽略；由登錄表與其測試落實
- **nfr-not-landed** `NFR-027`：NFR（移除大五人格的完整性）沒有在 api-model 或 data-model 任何一處被提及（屬維運步驟，DATA-025 只以 RULE-072、RULE-073 標示） → 建議：設計層約束，可忽略；由 UC-045 的步驟與覆蓋檢查落實
- **planned-not-implemented** `API-058、API-059、API-060`：GET /assessments、POST /assessments/{assessmentId}/results、GET /assessments/{assessmentId}/results/latest 已列入 render/api.yaml，但尚未實作（change expand-self-analysis-dimensions 還沒套用）；server/api.routes.test.ts 已將 /assessments 列為尚未建置 → 建議：實作該 change 的框架階段後，從 api.routes.test.ts 的 NOT_BUILT_YET 移除 /assessments
- **orphan-domain** `ENT-021`：Entity AssessmentDefinition 沒有對應的資料表：它是程式內的登錄表，刻意不落地 → 建議：確認為刻意；若之後要不經部署就改題目，才需要建表
- **usecase-without-api** `UC-044、UC-045`：撰寫並匯入內容（UC-044）與移除大五人格（UC-045）由匯入／清除腳本與程式修改完成，沒有對應的 API → 建議：確認為刻意（維運步驟，不曝露為 API）
- **pending-assumption** `CTX-ASM-020`：假設尚待確認：各分析題數暫定（九型 54、HEXACO 60、VIA 48、RIASEC 60、EQ 40、依附 24、需求 18、價值觀挑 8 排 5） → 建議：向 user 確認後更新 context.yaml 的 status
- **pending-assumption** `CTX-ASM-022`：假設尚待確認：自行設計的題目與內容不經心理學專業審閱即可上線 → 建議：向 user 確認後更新 context.yaml 的 status
- **pending-assumption** `CTX-ASM-023`：假設尚待確認：依附風格四象限的用語、核心價值觀清單與說明需使用者審稿後才發佈 → 建議：向 user 確認後更新 context.yaml 的 status
- **pending-assumption** `CTX-ASM-024`：假設部分確認：移除大五人格時不匯出已存結果；各分析的上線順序 → 建議：向 user 確認「不匯出」後更新 context.yaml 的 status
- **pending-assumption** `CTX-ASM-025`：假設尚待確認：各自我分析在多維度組合中的基礎點數預設 1 點；特質映射由開發者撰寫並審稿 → 建議：向 user 確認後更新 context.yaml 的 status
- **naming-inconsistency** `ENNEAGRAM 與 enneagram 等`：多維度分析的系統識別碼用大寫底線（ENNEAGRAM、VIA_STRENGTHS⋯），自我分析的 assessmentId 用小寫連字號（enneagram、via-strengths⋯）；兩者靠 API-057、API-058 的描述對應 → 建議：實作時在登錄表中明確寫出兩種識別碼的對應，並以測試檢查
- **orphan-requirement** `FR-081、FR-082、FR-083`：特質本體、映射與情境片段沒有 API 與資料表：它們是程式內的固定定義（ENT-025 至 ENT-027），刻意不落地 → 建議：若要納入，重跑 requirement-modeling；延後或刻意不落地的項目可忽略
- **pending-assumption** `CTX-ASM-026`：假設部分確認：多維度報告的價格規則（基本價之和 × 1.2、上限 30）已實作，但未經 user 重新確認 → 建議：向 user 確認後更新 context.yaml 的 status
- **planned-not-implemented** `API-061`：POST /report-snapshots/{snapshotId}/export（下載報告快照 PDF）為規劃中尚未實作；快照的 downloadCount、lastDownloadedAt 欄位也尚未存在；server/api.routes.test.ts 已將它列為尚未建置 → 建議：實作前確認扣點與重複下載規則（CTX-ASM-028）；實作後從 api.routes.test.ts 的 NOT_BUILT_YET 移除 /report-snapshots/{}/export
- **pending-assumption** `CTX-ASM-028`：假設部分確認：改為下載 PDF 已確認，但每次下載扣 1 點與重複下載須確認的規則沿用原規則，未重新確認 → 建議：向 user 確認後更新 context.yaml 的 status
- **deprecated-legacy-table** `DATA-007、DATA-008`：summaries 與 detailedReports 已標為 deprecated（由 reportSnapshots／DATA-026 取代）；對應的 ENT-006、ENT-007、AGG-006、AGG-007、RULE-005、006、019、030、033、EVT-005、008 與 UC-007、009、012、013 也已標為 deprecated，其餘仍適用的規則與事件已改指 AGG-021、AGG-009、AGG-010、AGG-008 → 建議：確認後移除或保留作歷史參考
- **intentional-reference-to-deprecated** `EVT-027、RULE-072、RULE-073`：這三項描述「移除大五人格」，所以刻意指向已廢止的 AGG-020（大五人格紀錄）；大五人格移除完成後可一併標為 deprecated → 建議：大五人格移除完成後標為 deprecated
