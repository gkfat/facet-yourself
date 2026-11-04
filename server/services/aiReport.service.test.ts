import {
    beforeEach, describe, expect, it, vi,
} from 'vitest';
import { FakeFirestore } from '../test-utils/fakeFirestore';
import { AiReportService } from './aiReport.service';
import { PointService } from './point.service';
import { RateLimitService } from './rateLimit.service';
import { ReportSnapshotService } from './reportSnapshot.service';
import { SingleReportService } from './singleReport.service';
import {
    AiOutputError, type AiReportGeneration, type AiReportProvider, type GenerateOptions,
} from '../ai/provider';
import { REPORT_PROMPT_VERSION } from '../ai/reportPrompt';
import { REPORT_STALE_AFTER_MS } from '../../shared/constants/ai';
import {
    AI_REPORT_SECTIONS, aiReportSectionKeys, type AiAnalysisInput,
} from '../../shared/schemas/firestore/aiAnalysis.schema';
import { aiReportDocSchema } from '../../shared/schemas/firestore/aiReport.schema';
import {
    InsufficientPointsError, NotFoundError, ValidationError,
} from '../../shared/types/errors';
import { DAY_MS } from '../../shared/utils/time';

const holder = vi.hoisted(() => ({ db: undefined as unknown }));

vi.mock('../utils/firebaseAdmin', () => ({ getAdminFirestore: () => holder.db }));

const NOW = Date.UTC(2026, 9, 28, 4);

const body = (title: string) => ({
    title,
    summary: `${title}的簡述。`,
    strengths: ['優勢一'],
    blindSpots: ['盲點一'],
    loveStyle: '',
    workStyle: '',
    communicationStyle: '',
    growthAdvice: '給自己一點時間。',
    disclaimer: '僅供娛樂與自我探索。',
});

const TEXT = '依你的報告來看，你可能傾向把事情安排得清楚，也容易在雜亂的環境裡感到不自在。';

/** An answer that is right for what it was given: every section in order, the standing-out part citing the insights found. */
const goodOutput = (input: AiAnalysisInput) => ({
    sections: aiReportSectionKeys(input.question !== undefined).map((key) => ({
        key,
        content: TEXT,
        points: Array.from({ length: AI_REPORT_SECTIONS.find((section) => section.key === key)?.points.min ?? 0 }, (_, index) => `重點${index + 1}：這一點說明了一件具體的事情`),
        candidateIds: key === 'highlights' ? input.candidates.slice(0, 1).map((candidate) => candidate.id) : [],
    })),
});

const usage = {
    inputTokens: 600, outputTokens: 1500,
};

class FakeAi implements AiReportProvider {
    calls: AiAnalysisInput[] = [];
    behavior: (input: AiAnalysisInput, options: GenerateOptions) => Promise<AiReportGeneration> = async (input) => ({
        output: goodOutput(input), usage, modelName: 'gpt-5-mini',
    });

    async generate(input: AiAnalysisInput, options: GenerateOptions) {
        this.calls.push(input);

        return this.behavior(input, options);
    }
}

const user = (overrides: Record<string, unknown> = {}) => ({
    email: 'a@example.com',
    birthData: {
        birthDate: '1989-09-10', zodiac: 'virgo', birthTime: null, birthPlace: null,
    },
    bloodType: 'A',
    mbti: null,
    mbtiExpiresAt: null,
    createdAt: NOW,
    updatedAt: NOW,
    ...overrides,
});

describe('AiReportService', () => {
    let db: FakeFirestore;
    let ai: FakeAi;
    let clock: { now: number };
    let pending: Array<Promise<void>>;
    let service: AiReportService;

    const settle = async () => {
        await Promise.all(pending);
    };
    const points = async () => (await new PointService({ clock: () => clock.now }).getBalance('u1')).availableBalance;
    const snapshots = () => db.paths().filter((p) => p.includes('/reportSnapshots/'));
    const stored = async (id: string) => aiReportDocSchema.parse((await db.doc(`users/u1/aiReports/${id}`).get()).data());

    const make = (background: (task: () => Promise<void>, onError: (error: unknown) => void) => Promise<void>) => {
        const clockFn = () => clock.now;

        return new AiReportService({
            single: new SingleReportService({ clock: clockFn }),
            snapshots: new ReportSnapshotService({ clock: clockFn }),
            getProvider: () => ai,
            background,
            points: new PointService({ clock: clockFn }),
            rateLimit: new RateLimitService({ clock: clockFn }),
            pricing: () => ({
                inputPerMtok: 0.1, outputPerMtok: 0.5,
            }),
            clock: clockFn,
        });
    };

    beforeEach(async () => {
        db = new FakeFirestore();
        holder.db = db;
        ai = new FakeAi();
        clock = { now: NOW };
        pending = [];
        service = make((task, onError) => {
            const promise = task().catch(onError);

            pending.push(promise);

            return promise;
        });

        await db.doc('users/u1').set(user());
        await db.doc('users/u1/pointBatches/b1').set({
            source: 'PURCHASE', sourceRef: null, granted: 10, remaining: 10, expiresAt: null, createdAt: NOW - DAY_MS,
        });

        for (const [
            type,
            key,
            title,
        ] of [
            [
                'ZODIAC',
                'virgo',
                '處女座',
            ], [
                'BLOOD',
                'A',
                'A 型',
            ],
        ] as const) {
            await db.doc(`fixedContents/${type}_${key}`).set({
                contentType: type, key, body: body(title), contentVersion: '1', status: 'PUBLISHED', updatedAt: NOW, publishedAt: NOW,
            });
        }
    });

    describe('of one system', () => {
        it('charges 1 point, replies at once and makes the report in the background, naming the single report it rests on', async () => {
            const accepted = await service.create('u1', ['BLOOD'], 'key-aaaaaaaa');

            expect(accepted).toEqual({
                id: 'key-aaaaaaaa', status: 'GENERATING', pointsDeducted: 1,
            });
            expect(await points()).toBe(9);

            await settle();

            const done = await stored('key-aaaaaaaa');

            expect(done).toMatchObject({
                status: 'COMPLETED', failureReason: null, question: null, cost: 1, promptVersion: REPORT_PROMPT_VERSION, modelName: 'gpt-5-mini',
            });
            expect(done.sources).toEqual([
                {
                    system: 'BLOOD', snapshotId: expect.any(String), position: expect.any(String),
                },
            ]);
            expect(snapshots()).toEqual([`users/u1/reportSnapshots/${done.sources[0]?.snapshotId}`]);
        });

        it('lays the report out first as a title and a summary, as the report gave them, then the sections of the mentor, all of them the AI\'s inference', async () => {
            await service.create('u1', ['BLOOD'], 'key-aaaaaaaa');

            // The facts are there before the AI has answered
            const started = await stored('key-aaaaaaaa');

            expect(started.status).toBe('GENERATING');
            expect(started.blocks.map((block) => block.key)).toEqual(['facts:BLOOD']);

            await settle();

            const done = await stored('key-aaaaaaaa');
            const facts = done.blocks.filter((block) => block.key.startsWith('facts:'));
            const parts = done.blocks.filter((block) => block.key.startsWith('ai:'));

            // A title and one summary for each report: not the whole report
            expect(facts.map((block) => block.segments.length)).toEqual([1]);
            expect(facts[0]?.title).toBe(done.sources[0]?.position);
            expect(facts.flatMap((block) => block.segments).every((segment) => segment.kind !== 'AI_INFERENCE')).toBe(true);
            expect(parts.map((block) => block.key)).toEqual(aiReportSectionKeys(false).map((key) => `ai:${key}`));
            // The first sentence of a part is its lead, the ones after it its points
            expect(parts.find((block) => block.key === 'ai:positives')?.segments).toHaveLength(1 + 3);
            expect(parts.find((block) => block.key === 'ai:past')?.segments).toHaveLength(1);
            expect(done.blocks.indexOf(facts[0] as (typeof done.blocks)[number])).toBe(0);
            expect(parts.flatMap((block) => block.segments).every((segment) => segment.kind === 'AI_INFERENCE')).toBe(true);
        });

        it('keeps the question, gives it to the model and adds the answer to it as a section', async () => {
            await service.create('u1', ['BLOOD'], 'key-aaaaaaaa', '我適合換工作嗎？');
            await settle();

            const done = await stored('key-aaaaaaaa');

            expect(ai.calls[0]?.question).toBe('我適合換工作嗎？');
            expect(done.question).toBe('我適合換工作嗎？');
            expect(done.blocks.map((block) => block.key)).toContain('ai:question');
        });

        it('gives the model the reports, the insights found and today\'s date, and no question when none was asked', async () => {
            await service.create('u1', ['BLOOD'], 'key-aaaaaaaa');
            await settle();

            const [input] = ai.calls;

            expect(Object.keys(input ?? {}).sort()).toEqual([
                'candidates',
                'sources',
                'today',
            ]);
            expect(input?.today).toBe('2026-10-28');
            expect(input?.candidates).toEqual([]);
            expect(input?.sources).toHaveLength(1);
            expect(input?.sources[0]?.system).toBe('BLOOD');
            expect(input?.sources[0]?.notes.some((note) => note.startsWith('規則版本'))).toBe(false);
            expect(await stored('key-aaaaaaaa').then((doc) => doc.blocks.map((block) => block.key))).not.toContain('ai:question');
        });

        it('records the usage with an estimated cost', async () => {
            await service.create('u1', ['BLOOD'], 'key-aaaaaaaa');
            await settle();

            const records = db.paths().filter((p) => p.startsWith('aiUsageRecords/'));

            expect(records).toHaveLength(1);
            expect((await db.doc(records[0] as string).get()).data()).toMatchObject({
                userId: 'u1', reportId: 'key-aaaaaaaa', inputTokens: 600, outputTokens: 1500,
            });
        });

        it('keeps every report when asked again, never replacing the earlier one', async () => {
            await service.create('u1', ['BLOOD'], 'key-aaaaaaaa', '第一個問題');
            await settle();
            clock.now += 1000;
            await service.create('u1', ['BLOOD'], 'key-bbbbbbbb');
            await settle();

            expect((await stored('key-aaaaaaaa')).question).toBe('第一個問題');
            expect((await stored('key-bbbbbbbb')).question).toBeNull();
            expect(await points()).toBe(8);
            // The same single report is reused, not copied
            expect(snapshots()).toHaveLength(1);
            expect((await service.list('u1')).map((item) => item.id)).toEqual(['key-bbbbbbbb', 'key-aaaaaaaa']);
        });
    });

    describe('of several systems', () => {
        it('charges the price of the systems (1.2 times their sum, rounded down) and names every report it rests on', async () => {
            const accepted = await service.create('u1', ['ZODIAC', 'BLOOD'], 'key-aaaaaaaa');

            // (1 + 1) x 1.2 = 2.4 -> 2
            expect(accepted).toMatchObject({
                status: 'GENERATING', pointsDeducted: 2,
            });
            expect(await points()).toBe(8);

            await settle();

            const done = await stored('key-aaaaaaaa');

            expect(done).toMatchObject({
                status: 'COMPLETED', cost: 2, promptVersion: REPORT_PROMPT_VERSION,
            });
            expect(done.sources.map((source) => source.system)).toEqual(['ZODIAC', 'BLOOD']);
            expect(done.blocks.filter((block) => block.key.startsWith('facts:')).map((block) => block.key)).toEqual(['facts:ZODIAC', 'facts:BLOOD']);
            expect(snapshots()).toHaveLength(2);
        });

        it('hands the model one report for each system and the insights the rules found across them, and cites them', async () => {
            await service.create('u1', ['ZODIAC', 'BLOOD'], 'key-aaaaaaaa', '想問的事');
            await settle();

            const [input] = ai.calls;
            const found = new Set(input?.candidates.map((candidate) => candidate.id));
            const cited = (await stored('key-aaaaaaaa')).blocks.filter((block) => block.key === 'ai:highlights')
                .flatMap((block) => block.segments.flatMap((segment) => segment.sources.map((source) => source.rule)));

            expect(input?.question).toBe('想問的事');
            expect(input?.sources.map((source) => source.system)).toEqual(['ZODIAC', 'BLOOD']);
            expect(found.size).toBeGreaterThan(0);
            expect(cited.length).toBeGreaterThan(0);
            expect(cited.every((rule) => rule !== undefined && found.has(rule))).toBe(true);
        });

        it('refuses a combination in which the rules found nothing to say, with no report and no charge', async () => {
            // Cancer and blood type O: no insight rule fires for them
            await db.doc('users/u1').set(user({
                birthData: {
                    birthDate: '1989-07-10', zodiac: 'cancer', birthTime: null, birthPlace: null,
                },
                bloodType: 'O',
            }));

            for (const [type, key] of [['ZODIAC', 'cancer'], ['BLOOD', 'O']] as const) {
                await db.doc(`fixedContents/${type}_${key}`).set({
                    contentType: type, key, body: body(key), contentVersion: '1', status: 'PUBLISHED', updatedAt: NOW, publishedAt: NOW,
                });
            }

            await expect(service.create('u1', ['ZODIAC', 'BLOOD'], 'key-aaaaaaaa')).rejects.toMatchObject({ code: 'NO_INSIGHTS' });

            expect(snapshots()).toHaveLength(0);
            expect(db.paths().filter((p) => p.includes('/aiReports/'))).toEqual([]);
            expect(await points()).toBe(10);
        });

        it('refunds when the standing-out part cites an insight that was never found, and keeps the facts', async () => {
            ai.behavior = async (input) => ({
                output: {
                    sections: goodOutput(input).sections.map((section) => (section.key === 'highlights'
                        ? {
                            ...section, candidateIds: ['made-up-rule'],
                        }
                        : section)),
                },
                usage,
                modelName: 'gpt-5-mini',
            });
            await service.create('u1', ['ZODIAC', 'BLOOD'], 'key-aaaaaaaa');
            await settle();

            const failed = await stored('key-aaaaaaaa');

            expect(failed).toMatchObject({
                status: 'FAILED', failureReason: 'INVALID_OUTPUT',
            });
            expect(failed.blocks.every((block) => block.key.startsWith('facts:'))).toBe(true);
            expect(await points()).toBe(10);
        });
    });

    it('does not charge or generate twice for the same key', async () => {
        await service.create('u1', ['BLOOD'], 'key-aaaaaaaa');
        const again = await service.create('u1', ['BLOOD'], 'key-aaaaaaaa');
        await settle();

        expect(again).toMatchObject({
            id: 'key-aaaaaaaa', pointsDeducted: 0,
        });
        expect(await points()).toBe(9);
        expect(ai.calls).toHaveLength(1);
    });

    it('refuses no system, a system twice and a system that is not offered, before anything is made or charged', async () => {
        await expect(service.create('u1', [], 'key-aaaaaaaa')).rejects.toBeInstanceOf(ValidationError);
        await expect(service.create('u1', ['ZODIAC', 'ZODIAC'], 'key-aaaaaaaa')).rejects.toBeInstanceOf(ValidationError);

        expect(snapshots()).toHaveLength(0);
        expect(await points()).toBe(10);
    });

    it('turns away a member without enough points, with no report and no charge', async () => {
        await db.doc('users/u1/pointBatches/b1').update({ remaining: 0 });

        await expect(service.create('u1', ['BLOOD'], 'key-aaaaaaaa')).rejects.toBeInstanceOf(InsufficientPointsError);

        expect(snapshots()).toHaveLength(0);
        expect(ai.calls).toHaveLength(0);
    });

    it('asks for what a system is missing before charging', async () => {
        await db.doc('users/u1').set(user({ bloodType: 'UNKNOWN' }));

        await expect(service.create('u1', ['BLOOD'], 'key-aaaaaaaa')).rejects.toMatchObject({ code: 'BLOOD_REQUIRED' });
        expect(await points()).toBe(10);
    });

    describe('when the report fails', () => {
        const failed = async () => {
            await service.create('u1', ['BLOOD'], 'key-aaaaaaaa');
            await settle();
        };

        it('refunds the point and leaves no AI content when the model errors', async () => {
            ai.behavior = async () => {
                throw new Error('boom');
            };
            await failed();

            const done = await stored('key-aaaaaaaa');

            expect(await points()).toBe(10);
            expect(done).toMatchObject({
                status: 'FAILED', failureReason: 'AI_ERROR',
            });
            expect(done.blocks.some((block) => block.key.startsWith('ai:'))).toBe(false);
        });

        it('says why when the model refuses', async () => {
            ai.behavior = async () => {
                throw new AiOutputError('REFUSED');
            };
            await failed();

            expect((await stored('key-aaaaaaaa')).failureReason).toBe('REFUSED');
            expect(await points()).toBe(10);
        });

        it('refunds when the answer fails the quality check (a diagnosis)', async () => {
            ai.behavior = async (input) => ({
                output: {
                    sections: goodOutput(input).sections.map((section, index) => (index === 0
                        ? {
                            ...section, content: '你可能罹患憂鬱症，所以比較偏好先觀察再行動，也傾向把事情想清楚。',
                        }
                        : section)),
                },
                usage,
                modelName: 'gpt-5-mini',
            });
            await failed();

            expect(await stored('key-aaaaaaaa')).toMatchObject({
                status: 'FAILED', failureReason: 'INVALID_OUTPUT',
            });
            expect(await points()).toBe(10);
        });

        it('refunds when the answer has the wrong sections', async () => {
            ai.behavior = async (input) => ({
                output: { sections: goodOutput(input).sections.slice(0, 2) }, usage, modelName: 'gpt-5-mini',
            });
            await failed();

            expect((await stored('key-aaaaaaaa')).failureReason).toBe('INVALID_OUTPUT');
            expect(await points()).toBe(10);
        });

        it('can be asked again after a failure, with a new key', async () => {
            ai.behavior = async () => {
                throw new Error('boom');
            };
            await failed();
            ai.behavior = async (input) => ({
                output: goodOutput(input), usage, modelName: 'gpt-5-mini',
            });
            await service.create('u1', ['BLOOD'], 'key-bbbbbbbb');
            await settle();

            expect((await stored('key-bbbbbbbb')).status).toBe('COMPLETED');
            expect(await points()).toBe(9);
        });
    });

    it('fails and refunds a report whose worker vanished, when the list or the report is read', async () => {
        service = make(async () => undefined);
        await service.create('u1', ['BLOOD'], 'key-aaaaaaaa');
        expect(await points()).toBe(9);

        clock.now += REPORT_STALE_AFTER_MS + 1;

        const items = await service.list('u1');

        expect(items[0]).toMatchObject({
            id: 'key-aaaaaaaa', status: 'FAILED', failureReason: 'STALE',
        });
        expect(await points()).toBe(10);

        service = make(async () => undefined);
        await service.create('u1', ['BLOOD'], 'key-bbbbbbbb');
        clock.now += REPORT_STALE_AFTER_MS + 1;

        expect(await service.get('u1', 'key-bbbbbbbb')).toMatchObject({
            status: 'FAILED', failureReason: 'STALE',
        });
    });

    describe('list and get', () => {
        beforeEach(async () => {
            await service.create('u1', ['BLOOD'], 'key-aaaaaaaa', '第一個問題');
            await settle();
            clock.now += 1000;
            await service.create('u1', ['ZODIAC'], 'key-bbbbbbbb');
            await settle();
            await db.doc('users/u2/aiReports/other').set((await db.doc('users/u1/aiReports/key-aaaaaaaa').get()).data() as object);
        });

        it('lists only the member\'s own reports that have not expired, newest first, as cards without the report itself', async () => {
            const items = await service.list('u1');

            expect(items.map((item) => item.id)).toEqual(['key-bbbbbbbb', 'key-aaaaaaaa']);
            expect(items[1]?.question).toBe('第一個問題');

            for (const item of items) {
                expect(item).not.toHaveProperty('expiresAt');
                expect(item).not.toHaveProperty('blocks');
            }

            clock.now += 400 * DAY_MS;

            expect(await service.list('u1')).toEqual([]);
        });

        it('gives one report in full, and not found for another member\'s, a missing one or an expired one', async () => {
            const report = await service.get('u1', 'key-aaaaaaaa');

            expect(report.blocks.length).toBeGreaterThan(1);
            expect(report).not.toHaveProperty('expiresAt');

            await expect(service.get('u2', 'key-aaaaaaaa')).rejects.toBeInstanceOf(NotFoundError);
            await expect(service.get('u1', 'nothing-here')).rejects.toBeInstanceOf(NotFoundError);

            clock.now += 400 * DAY_MS;
            await expect(service.get('u1', 'key-aaaaaaaa')).rejects.toBeInstanceOf(NotFoundError);
        });
    });
});
