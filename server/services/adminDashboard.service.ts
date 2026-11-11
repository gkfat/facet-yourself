import { BaseService } from './base.service';
import { AdminStatsRepository } from '../repositories/adminStats.repository';
import { mapLimit } from '../utils/mapLimit';
import { TtlCache } from '../utils/ttlCache';
import { findAssessmentBySystem } from '../../shared/assessments';
import { USD_TO_TWD_RATE } from '../../shared/constants/ai';
import {
    MAPPING_SYSTEMS, STATE_SYSTEMS, 
} from '../../shared/ontology/schema';
import {
    adminAiReportsSchema, adminAnalysisRankSchema, adminDailyAiCostSchema, adminDailyDrawsSchema, adminDailyPointsSchema, adminMembersSummarySchema,
    ADMIN_AI_REPORT_QUESTION_LIMIT, ADMIN_AI_REPORT_SCAN_LIMIT,
    type AdminAiReports, type AdminAnalysisRank, type AdminDailyAiCost, type AdminDailyDraws, type AdminDailyPoints, type AdminMembersSummary,
} from '../../shared/schemas/api/adminDashboard.schema';
import { POINT_TRANSACTION_REASONS } from '../../shared/schemas/firestore/points.schema';
import {
    DAY_MS, lastTaipeiDates, taipeiDateKey, taipeiDayStart, taipeiMonthStart,
} from '../../shared/utils/time';

/** Aggregation queries run this many at a time: quick, without opening hundreds of requests at once. */
const CONCURRENCY = 6;
const CACHE_TTL_MS = 60_000;

/** Systems that describe a lasting trait; the daily state systems are not analyses. */
const ANALYSIS_SYSTEMS = MAPPING_SYSTEMS.filter((system) => !(STATE_SYSTEMS as readonly string[]).includes(system));

/** The Chinese names of the systems that are not self-assessments; an assessment is named by its own title. */
const SYSTEM_NAMES: Record<string, string> = {
    ZODIAC: '星座',
    BLOOD: '血型',
    MBTI: 'MBTI',
    NUMEROLOGY: '生命靈數',
    MAYA_KIN: 'Maya Kin',
    BAZI: '八字',
    ZIWEI: '紫微斗數',
    HUMAN_DESIGN: '人類圖',
};

/** What the dashboard calls a system: never the raw id, which is for programs. */
function systemLabel(system: string): string {
    return SYSTEM_NAMES[system] ?? findAssessmentBySystem(system)?.title ?? system;
}

const sharedCache = new TtlCache<unknown>(CACHE_TTL_MS);

type AdminDashboardServiceOptions = {
    repository?: AdminStatsRepository;
    clock?: () => number;
    cache?: TtlCache<unknown>;
};

export class AdminDashboardService extends BaseService {
    protected serviceName = 'admin-dashboard';

    private readonly repository: AdminStatsRepository;
    private readonly clock: () => number;
    private readonly cache: TtlCache<unknown>;

    constructor(options: AdminDashboardServiceOptions = {}) {
        super();
        this.repository = options.repository ?? new AdminStatsRepository();
        this.clock = options.clock ?? Date.now;
        this.cache = options.cache ?? sharedCache;
    }

    async members(): Promise<AdminMembersSummary> {
        return adminMembersSummarySchema.parse(await this.cache.get('members', async () => {
            const now = this.clock();
            const monthStart = taipeiMonthStart(now);

            return {
                total: await this.repository.countUsers(),
                thisMonth: await this.repository.countUsers({
                    from: monthStart, to: now + 1,
                }),
                monthStart,
            };
        }));
    }

    async analysisRank(): Promise<AdminAnalysisRank> {
        return adminAnalysisRankSchema.parse(await this.cache.get('analyses', async () => {
            const counts = await mapLimit(ANALYSIS_SYSTEMS, CONCURRENCY, async (system) => ({
                system, label: systemLabel(system), count: await this.repository.countSingleSnapshots(system),
            }));

            return {
                items: counts
                    .filter((entry) => entry.count > 0)
                    .sort((a, b) => b.count - a.count || a.system.localeCompare(b.system)),
            };
        }));
    }

    async dailyDraws(days: number): Promise<AdminDailyDraws> {
        return adminDailyDrawsSchema.parse(await this.cache.get(`draws:${days}`, async () => {
            const rows = await mapLimit(this.dates(days), CONCURRENCY, async (date) => {
                const range = this.dayRange(date);

                return {
                    date,
                    tarot: await this.repository.countDraws('tarotDraws', range),
                    rune: await this.repository.countDraws('runeDraws', range),
                    hexagram: await this.repository.countDraws('hexagramDraws', range),
                };
            });
            const earliest = await Promise.all([
                this.repository.earliestDrawAt('tarotDraws'),
                this.repository.earliestDrawAt('runeDraws'),
                this.repository.earliestDrawAt('hexagramDraws'),
            ]);
            const known = earliest.filter((value): value is number => value !== null);

            return {
                days: rows,
                earliestDrawAt: known.length > 0 ? Math.min(...known) : null,
            };
        }));
    }

    async dailyPoints(days: number): Promise<AdminDailyPoints> {
        return adminDailyPointsSchema.parse(await this.cache.get(`points:${days}`, async () => {
            const dates = this.dates(days);
            const rows = await mapLimit(dates, CONCURRENCY, async (date) => {
                const range = this.dayRange(date);

                return {
                    date,
                    deducted: await this.repository.sumPoints('DEDUCT', range),
                    refunded: await this.repository.sumPoints('REFUND', range),
                };
            });
            const whole = {
                from: this.dayRange(dates[0] as string).from,
                to: this.dayRange(dates[dates.length - 1] as string).to,
            };
            const byReason = await mapLimit(POINT_TRANSACTION_REASONS, CONCURRENCY, async (reason) => ({
                reason, deducted: await this.repository.sumPoints('DEDUCT', whole, reason),
            }));

            return {
                days: rows,
                deductedByReason: byReason.filter((entry) => entry.deducted > 0),
            };
        }));
    }

    async dailyAiCost(days: number): Promise<AdminDailyAiCost> {
        return adminDailyAiCostSchema.parse(await this.cache.get(`ai:${days}`, async () => {
            const now = this.clock();
            const rows = await mapLimit(this.dates(days), CONCURRENCY, async (date) => ({
                date, ...await this.repository.sumAiUsage(this.dayRange(date)),
            }));
            const month = await this.repository.sumAiUsage({
                from: taipeiMonthStart(now), to: now + 1,
            });

            return {
                days: rows, month, usdToTwdRate: USD_TO_TWD_RATE,
            };
        }));
    }

    /** Multi-dimension AI reports: outcomes per day, how many dimensions they used, and the questions asked. */
    async aiReports(days: number): Promise<AdminAiReports> {
        return adminAiReportsSchema.parse(await this.cache.get(`ai-reports:${days}`, async () => {
            const dates = this.dates(days);
            // One more than the limit tells whether there were more
            const read = await this.repository.listAiReports(this.dayRange(dates[0] as string).from, ADMIN_AI_REPORT_SCAN_LIMIT + 1);
            const rows = read.slice(0, ADMIN_AI_REPORT_SCAN_LIMIT);
            const perDay = new Map(dates.map((date) => [
                date, {
                    completed: 0, failed: 0,
                },
            ]));
            const totals = {
                completed: 0, failed: 0, generating: 0,
            };
            const byDimensions = new Map<number, number>();

            for (const row of rows) {
                const day = perDay.get(taipeiDateKey(new Date(row.createdAt)));

                if (row.status === 'COMPLETED') {
                    totals.completed += 1;
                    if (day) day.completed += 1;
                } else if (row.status === 'FAILED') {
                    totals.failed += 1;
                    if (day) day.failed += 1;
                } else {
                    totals.generating += 1;
                }

                byDimensions.set(row.systems.length, (byDimensions.get(row.systems.length) ?? 0) + 1);
            }

            return {
                days: dates.map((date) => ({
                    date, ...perDay.get(date),
                })),
                totals,
                dimensionCounts: [...byDimensions.entries()]
                    .sort(([a], [b]) => a - b)
                    .map(([dimensions, count]) => ({
                        dimensions, count,
                    })),
                maxDimensions: Math.max(0, ...byDimensions.keys()),
                questions: rows
                    .flatMap((row) => row.question === null ? [] : [
                        {
                            createdAt: row.createdAt,
                            status: row.status,
                            systems: row.systems.map(systemLabel),
                            question: row.question,
                        },
                    ])
                    .slice(0, ADMIN_AI_REPORT_QUESTION_LIMIT),
                scanned: rows.length,
                truncated: read.length > ADMIN_AI_REPORT_SCAN_LIMIT,
            };
        }));
    }

    private dates(days: number): string[] {
        return lastTaipeiDates(this.clock(), days);
    }

    private dayRange(date: string) {
        const from = taipeiDayStart(date);

        return {
            from, to: from + DAY_MS,
        };
    }
}
