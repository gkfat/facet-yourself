import {
    beforeEach, describe, expect, it, vi,
} from 'vitest';
import { FakeFirestore } from '../test-utils/fakeFirestore';
import { TtlCache } from '../utils/ttlCache';
import { USD_TO_TWD_RATE } from '../../shared/constants/ai';

const holder = vi.hoisted(() => ({ db: null as unknown }));

vi.mock('../utils/firebaseAdmin', () => ({ getAdminFirestore: () => holder.db }));

const { AdminDashboardService } = await import('./adminDashboard.service');

// 2026-11-09 00:30 in Taipei (2026-11-08 16:30 UTC): the Taipei date is already the 9th
const NOW = Date.UTC(2026, 10, 8, 16, 30);
const taipei = (month: number, day: number, hour = 12) => Date.UTC(2026, month - 1, day, hour - 8);

describe('AdminDashboardService', () => {
    let db: FakeFirestore;
    let service: InstanceType<typeof AdminDashboardService>;

    beforeEach(() => {
        db = new FakeFirestore();
        holder.db = db;
        service = new AdminDashboardService({
            clock: () => NOW, cache: new TtlCache<unknown>(0),
        });
    });

    it('counts all members and those of the Taipei month so far', async () => {
        await db.doc('users/a').set({ createdAt: taipei(10, 31, 23) });
        // 2026-11-01 00:10 Taipei is still October in UTC
        await db.doc('users/b').set({ createdAt: Date.UTC(2026, 9, 31, 16, 10) });
        await db.doc('users/c').set({ createdAt: taipei(11, 5) });

        expect(await service.members()).toEqual({
            total: 3, thisMonth: 2, monthStart: Date.UTC(2026, 9, 31, 16),
        });
    });

    it('starts the month count from zero in a new month', async () => {
        await db.doc('users/a').set({ createdAt: taipei(10, 31, 23) });

        expect((await service.members()).thisMonth).toBe(0);
    });

    it('ranks single-dimension systems by their snapshots and leaves out multi reports and state systems', async () => {
        const snapshot = (uid: string, id: string, kind: string, systems: string[]) => db.doc(`users/${uid}/reportSnapshots/${id}`).set({
            kind, systems,
        });

        await snapshot('u1', 's1', 'SINGLE', ['ZODIAC']);
        await snapshot('u2', 's2', 'SINGLE', ['ZODIAC']);
        await snapshot('u2', 's3', 'SINGLE', ['MBTI']);
        await snapshot('u2', 's4', 'MULTI', ['MBTI', 'ZODIAC']);
        await snapshot('u3', 's5', 'SINGLE', ['TAROT']);

        expect(await service.analysisRank()).toEqual({
            items: [
                {
                    system: 'ZODIAC', label: '星座', count: 2,
                }, {
                    system: 'MBTI', label: 'MBTI', count: 1,
                },
            ],
        });
    });

    it('names a self-assessment by its Chinese title, never by its id', async () => {
        await db.doc('users/u1/reportSnapshots/s1').set({
            kind: 'SINGLE', systems: ['ATTACHMENT_STYLE'],
        });
        await db.doc('users/u1/reportSnapshots/s2').set({
            kind: 'SINGLE', systems: ['VIA_STRENGTHS'],
        });

        const { items } = await service.analysisRank();

        expect(items.map((item) => item.label).sort()).toEqual(expect.arrayContaining([expect.stringMatching(/\p{Script=Han}/u)]));
        expect(items.every((item) => /\p{Script=Han}/u.test(item.label))).toBe(true);
        expect(items.some((item) => item.label === item.system)).toBe(false);
    });

    describe('dailyDraws', () => {
        it('counts tarot and rune per Taipei day, with zeros for quiet days, and finds the first draw', async () => {
            await db.doc('users/u1/tarotDraws/2026-11-09').set({ drawnAt: taipei(11, 9, 0) + 60_000 });
            await db.doc('users/u2/tarotDraws/2026-11-09').set({ drawnAt: taipei(11, 9, 0) + 120_000 });
            await db.doc('users/u1/tarotDraws/2026-11-08').set({ drawnAt: taipei(11, 8, 23) });
            await db.doc('users/u1/runeDraws/2026-11-08').set({ drawnAt: taipei(11, 8, 9) });

            const result = await service.dailyDraws(3);

            expect(result.days).toEqual([
                {
                    date: '2026-11-07', tarot: 0, rune: 0,
                },
                {
                    date: '2026-11-08', tarot: 1, rune: 1,
                },
                {
                    date: '2026-11-09', tarot: 2, rune: 0,
                },
            ]);
            expect(result.earliestDrawAt).toBe(taipei(11, 8, 9));
        });

        it('has no first draw when nothing was drawn', async () => {
            const result = await service.dailyDraws(2);

            expect(result.earliestDrawAt).toBeNull();
            expect(result.days.every((day) => day.tarot === 0 && day.rune === 0)).toBe(true);
        });
    });

    describe('dailyPoints', () => {
        it('sums deductions and refunds per Taipei day and breaks the deductions down by reason', async () => {
            const tx = (path: string, type: string, amount: number, reason: string, createdAt: number) => db.doc(path).set({
                type, amount, reason, createdAt,
            });

            await tx('users/u1/pointTransactions/t1', 'DEDUCT', 3, 'SINGLE_AI_ANALYSIS', taipei(11, 9, 0) + 1000);
            await tx('users/u2/pointTransactions/t2', 'DEDUCT', 5, 'MULTI_REPORT', taipei(11, 9, 8));
            await tx('users/u2/pointTransactions/t3', 'REFUND', 2, 'MULTI_REPORT', taipei(11, 9, 9));
            await tx('users/u1/pointTransactions/t4', 'DEDUCT', 4, 'MULTI_REPORT', taipei(11, 8, 22));
            await tx('users/u1/pointTransactions/t5', 'GRANT', 9, 'WELCOME', taipei(11, 8, 1));
            await tx('users/u1/pointTransactions/t6', 'DEDUCT', 7, 'MULTI_REPORT', taipei(10, 1, 1));

            const result = await service.dailyPoints(2);

            expect(result.days).toEqual([
                {
                    date: '2026-11-08', deducted: 4, refunded: 0,
                }, {
                    date: '2026-11-09', deducted: 8, refunded: 2,
                },
            ]);
            expect(result.deductedByReason).toEqual([
                {
                    reason: 'SINGLE_AI_ANALYSIS', deducted: 3,
                }, {
                    reason: 'MULTI_REPORT', deducted: 9,
                },
            ]);
        });
    });

    describe('dailyAiCost', () => {
        it('sums cost and tokens per Taipei day, counts records whose member is gone, and totals the month', async () => {
            const usage = (id: string, userId: string | null, cost: number, createdAt: number) => db.doc(`aiUsageRecords/${id}`).set({
                userId, estimatedCost: cost, inputTokens: 100, outputTokens: 10, createdAt,
            });

            await usage('a', 'u1', 0.5, taipei(11, 9, 0) + 1000);
            await usage('b', null, 0.25, taipei(11, 9, 0) + 600_000);
            await usage('c', 'u1', 1, taipei(11, 8, 12));
            await usage('d', 'u1', 4, taipei(10, 20, 12));

            const result = await service.dailyAiCost(2);

            expect(result.days).toEqual([
                {
                    date: '2026-11-08', cost: 1, inputTokens: 100, outputTokens: 10,
                }, {
                    date: '2026-11-09', cost: 0.75, inputTokens: 200, outputTokens: 20,
                },
            ]);
            expect(result.month).toEqual({
                cost: 1.75, inputTokens: 300, outputTokens: 30,
            });
            expect(result.usdToTwdRate).toBe(USD_TO_TWD_RATE);
        });
    });

    describe('aiReports', () => {
        const report = (uid: string, id: string, status: string, systems: string[], question: string | null, createdAt: number) => db.doc(`users/${uid}/aiReports/${id}`).set({
            sources: systems.map((system) => ({
                system, snapshotId: `snap-${system}`, position: '位置',
            })),
            question,
            status,
            failureReason: status === 'FAILED' ? 'timeout' : null,
            blocks: [],
            cost: 3,
            modelName: null,
            promptVersion: null,
            createdAt,
            expiresAt: createdAt + 1000,
        });

        beforeEach(async () => {
            await report('u1', 'r1', 'COMPLETED', ['ZODIAC', 'MBTI'], '我適合換工作嗎？', taipei(11, 9, 0) + 1000);
            await report('u2', 'r2', 'FAILED', [
                'ZODIAC',
                'MBTI',
                'BLOOD',
            ], null, taipei(11, 8, 10));
            await report('u2', 'r3', 'COMPLETED', ['ZODIAC'], '最近壓力很大', taipei(11, 8, 9));
            await report('u1', 'r4', 'GENERATING', ['BAZI', 'MBTI'], '想了解感情', taipei(11, 8, 8));
            // Before the range
            await report('u1', 'r5', 'COMPLETED', ['ZODIAC', 'MBTI'], '太久以前', taipei(10, 1, 8));
        });

        it('counts outcomes per Taipei day and in total, leaving out reports before the range', async () => {
            const result = await service.aiReports(2);

            expect(result.days).toEqual([
                {
                    date: '2026-11-08', completed: 1, failed: 1,
                }, {
                    date: '2026-11-09', completed: 1, failed: 0,
                },
            ]);
            expect(result.totals).toEqual({
                completed: 2, failed: 1, generating: 1,
            });
            expect(result.scanned).toBe(4);
            expect(result.truncated).toBe(false);
        });

        it('tells how many dimensions reports used and the most one used', async () => {
            const result = await service.aiReports(2);

            expect(result.dimensionCounts).toEqual([
                {
                    dimensions: 1, count: 1,
                },
                {
                    dimensions: 2, count: 2,
                },
                {
                    dimensions: 3, count: 1,
                },
            ]);
            expect(result.maxDimensions).toBe(3);
        });

        it('lists the questions newest first, with the dimensions named in Chinese and nobody identified', async () => {
            const result = await service.aiReports(2);

            expect(result.questions.map((entry) => entry.question)).toEqual([
                '我適合換工作嗎？',
                '最近壓力很大',
                '想了解感情',
            ]);
            expect(result.questions[0]).toEqual({
                createdAt: taipei(11, 9, 0) + 1000, status: 'COMPLETED', systems: ['星座', 'MBTI'], question: '我適合換工作嗎？',
            });
            expect(JSON.stringify(result)).not.toMatch(/u1|u2/);
        });

        it('has nothing to say when there are no reports', async () => {
            const result = await new AdminDashboardService({
                clock: () => Date.UTC(2027, 5, 1), cache: new TtlCache<unknown>(0),
            }).aiReports(2);

            expect(result.totals).toEqual({
                completed: 0, failed: 0, generating: 0,
            });
            expect(result.maxDimensions).toBe(0);
            expect(result.dimensionCounts).toEqual([]);
            expect(result.questions).toEqual([]);
        });
    });

    it('answers repeated asks from the cache for a while', async () => {
        const cached = new AdminDashboardService({
            clock: () => NOW, cache: new TtlCache<unknown>(60_000, () => NOW),
        });

        await db.doc('users/a').set({ createdAt: taipei(11, 5) });
        expect((await cached.members()).total).toBe(1);

        await db.doc('users/b').set({ createdAt: taipei(11, 5) });
        expect((await cached.members()).total).toBe(1);
    });
});
