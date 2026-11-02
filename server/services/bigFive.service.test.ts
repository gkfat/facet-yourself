import {
    beforeEach, describe, expect, it, vi,
} from 'vitest';
import { FakeFirestore } from '../test-utils/fakeFirestore';
import { BigFiveService } from './bigFive.service';
import {
    BIG_FIVE_QUESTIONS, BIG_FIVE_VERSION,
} from '../../shared/constants/bigFive';
import { bigFiveResultSchema } from '../../shared/schemas/api/bigFive.schema';
import {
    NotFoundError, ValidationError,
} from '../../shared/types/errors';
import { bigFiveContentKeys } from '../../shared/utils/fixedContentKeys';
import { addMonths } from '../../shared/utils/time';

const holder = vi.hoisted(() => ({ db: undefined as unknown }));

vi.mock('../utils/firebaseAdmin', () => ({ getAdminFirestore: () => holder.db }));

const NOW = Date.UTC(2026, 0, 15, 12);

const body = (title: string) => ({
    title,
    summary: `${title}的內容`,
    strengths: [],
    blindSpots: [],
    loveStyle: '',
    workStyle: '',
    communicationStyle: '',
    growthAdvice: '',
    disclaimer: '僅供自我探索',
});

async function seed(db: FakeFirestore) {
    for (const key of bigFiveContentKeys()) {
        await db.doc(`fixedContents/BIGFIVE_${key}`).set({
            contentType: 'BIGFIVE', key, body: body(key), contentVersion: '1', status: 'PUBLISHED', updatedAt: NOW, publishedAt: NOW,
        });
    }
}

const user = (overrides: Record<string, unknown> = {}) => ({
    email: 'a@example.com',
    birthData: null,
    bloodType: 'UNKNOWN',
    mbti: null,
    mbtiExpiresAt: null,
    createdAt: NOW,
    updatedAt: NOW,
    ...overrides,
});

/** Every straight item 5 and every reversed one 1 (every trait high), or everything at one value */
const high = () => BIG_FIVE_QUESTIONS.map((question) => ({
    questionId: question.id, value: question.reversed ? 1 : 5,
}));
const all = (value: number) => BIG_FIVE_QUESTIONS.map((question) => ({
    questionId: question.id, value,
}));
const request = (answers: Array<{ questionId: string; value: number }>) => ({
    version: BIG_FIVE_VERSION, answers,
});

describe('BigFiveService', () => {
    let db: FakeFirestore;
    let clock: { now: number };
    let service: BigFiveService;
    const member = {
        uid: 'u1', guestSessionId: null,
    };
    const guest = {
        uid: null, guestSessionId: null,
    };
    const attemptPaths = () => db.paths().filter((path) => path.includes('/bigFiveAttempts/'));

    beforeEach(async () => {
        db = new FakeFirestore();
        holder.db = db;
        clock = { now: NOW };
        await seed(db);
        await db.doc('users/u1').set(user());
        service = new BigFiveService({ clock: () => clock.now });
    });

    describe('submit', () => {
        it('scores on the server and gives each trait its level and its content, in a result the API schema accepts', async () => {
            const result = await service.submit(request(high()), member);

            expect(bigFiveResultSchema.safeParse(result).success).toBe(true);
            expect(result.traits.map((trait) => trait.trait)).toEqual([
                'openness',
                'conscientiousness',
                'extraversion',
                'agreeableness',
                'neuroticism',
            ]);
            expect(result.traits.every((trait) => trait.score === 100 && trait.level === 'high')).toBe(true);
            expect(result.traits[0]?.content.key).toBe('openness_high');
        });

        it('tells what the pairs of traits say together, only for pairs of which neither trait is in the middle', async () => {
            const everyPair = await service.submit(request(high()), member);

            expect(everyPair.combinations).toHaveLength(6);
            expect(everyPair.combinations[0]).toMatchObject({
                traits: ['openness', 'conscientiousness'], sides: ['high', 'high'],
            });
            expect(everyPair.combinations[0]?.content.key).toBe('combo_openness_conscientiousness_high_high');
            expect((await service.submit(request(all(3)), member)).combinations).toEqual([]);
        });

        it('keeps the attempt of a member for 3 months', async () => {
            const result = await service.submit(request(all(3)), member);

            expect(result).toMatchObject({
                persisted: true, saveFailed: false, expiresAt: addMonths(NOW, 3),
            });
            expect(attemptPaths()).toHaveLength(1);

            const saved = (await db.doc(attemptPaths()[0] as string).get()).data();

            expect(saved).toMatchObject({
                version: BIG_FIVE_VERSION, completedAt: NOW, expiresAt: addMonths(NOW, 3),
            });
            expect(saved?.scores).toEqual({
                openness: 50, conscientiousness: 50, extraversion: 50, agreeableness: 50, neuroticism: 50,
            });
        });

        it('gives a guest the result and writes nothing at all', async () => {
            const before = db.paths().length;
            const result = await service.submit(request(high()), guest);

            expect(result).toMatchObject({
                persisted: false, expiresAt: null,
            });
            expect(db.paths()).toHaveLength(before);
        });

        it('turns away answers that are not complete and legal, names them, and stores nothing', async () => {
            const missing = high().slice(1);

            await expect(service.submit(request(missing), member)).rejects.toBeInstanceOf(ValidationError);
            await expect(service.submit(request(high().map((answer, index) => (index === 0
                ? {
                    ...answer, value: 6,
                }
                : answer))), member)).rejects.toMatchObject({
                details: {
                    issues: [
                        {
                            questionId: 'bf01', reason: 'invalid-value', 
                        },
                    ], 
                }, 
            });
            await expect(service.submit(request([
                ...high(), {
                    questionId: 'bf99', value: 3,
                },
            ]), member)).rejects.toBeInstanceOf(ValidationError);
            expect(attemptPaths()).toEqual([]);
        });

        it('does not know a version it did not publish', async () => {
            await expect(service.submit({
                version: 'ipip50-zh-v0', answers: high(),
            }, member)).rejects.toBeInstanceOf(NotFoundError);
            expect(attemptPaths()).toEqual([]);
        });

        it('stores nothing when a content that has to be shown is not published', async () => {
            await db.doc('fixedContents/BIGFIVE_openness_high').update({ status: 'DRAFT' });

            await expect(service.submit(request(high()), member)).rejects.toBeInstanceOf(NotFoundError);
            expect(attemptPaths()).toEqual([]);
        });

        it('stores nothing when the content of a combination that has to be shown is not published', async () => {
            await db.doc('fixedContents/BIGFIVE_combo_openness_conscientiousness_high_high').update({ status: 'DRAFT' });

            await expect(service.submit(request(high()), member)).rejects.toBeInstanceOf(NotFoundError);
            expect(attemptPaths()).toEqual([]);
        });

        it('holds the result against the MBTI of the member, with the note on a difference', async () => {
            await db.doc('users/u1').set(user({
                mbti: 'INTJ', mbtiExpiresAt: addMonths(NOW, 2),
            }));

            const result = await service.submit(request(high()), member);

            expect(result.mbti).toBe('INTJ');
            expect(result.comparison.map((item) => [item.pair, item.result])).toEqual([
                ['ei', 'differ'],
                ['sn', 'match'],
                ['tf', 'differ'],
                ['jp', 'match'],
            ]);
            expect(result.comparison[0]?.content?.key).toBe('compare_ei_differ');
        });

        it('has no comparison without an MBTI, or when the MBTI has run out', async () => {
            expect((await service.submit(request(high()), member)).comparison).toEqual([]);

            await db.doc('users/u1').set(user({
                mbti: 'INTJ', mbtiExpiresAt: NOW - 1000,
            }));

            expect(await service.submit(request(high()), member)).toMatchObject({
                mbti: null, comparison: [],
            });
        });

        it('says "neutral" for a trait in the middle and shows no note for it', async () => {
            await db.doc('users/u1').set(user({
                mbti: 'ENTJ', mbtiExpiresAt: addMonths(NOW, 2),
            }));

            const result = await service.submit(request(all(3)), member);

            expect(result.comparison.every((item) => item.result === 'neutral' && item.content === null)).toBe(true);
        });
    });

    describe('latest', () => {
        it('gives the newest result that has not run out', async () => {
            await service.submit(request(all(3)), member);
            clock.now += 1000;

            await service.submit(request(high()), member);

            const latest = await service.latest('u1');

            expect(latest.traits[0]?.score).toBe(100);
            expect(latest).toMatchObject({
                persisted: true, completedAt: NOW + 1000,
            });
        });

        it('skips an attempt that has expired, and is not found when none is left', async () => {
            await service.submit(request(high()), member);
            clock.now = addMonths(NOW, 3) + 1;

            await expect(service.latest('u1')).rejects.toBeInstanceOf(NotFoundError);
        });

        it('is not found for someone who never took it', async () => {
            await expect(service.latest('u1')).rejects.toBeInstanceOf(NotFoundError);
        });

        it('compares with the MBTI the member has now', async () => {
            await service.submit(request(high()), member);
            await db.doc('users/u1').set(user({
                mbti: 'ENFJ', mbtiExpiresAt: addMonths(NOW, 2),
            }));

            expect((await service.latest('u1')).comparison.every((item) => item.result === 'match')).toBe(true);
        });
    });
});
