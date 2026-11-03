import {
    beforeEach, describe, expect, it, vi,
} from 'vitest';
import { FakeFirestore } from '../test-utils/fakeFirestore';
import { AssessmentService } from './assessment.service';
import {
    FAKE_SCALE_ITEMS, fakeScaleAssessment, fakeSelectionAssessment,
} from '../../shared/assessments/testing';
import { ASSESSMENT_ENTRY_ENABLED } from '../../shared/assessments/entry';
import { assessmentContentKeys } from '../../shared/assessments';
import { assessmentResultSchema } from '../../shared/schemas/api/assessment.schema';
import { assessmentAttemptDocSchema } from '../../shared/schemas/firestore/assessmentAttempt.schema';
import {
    NotFoundError, ValidationError,
} from '../../shared/types/errors';
import { addMonths } from '../../shared/utils/time';

const holder = vi.hoisted(() => ({ db: undefined as unknown }));

vi.mock('../utils/firebaseAdmin', () => ({ getAdminFirestore: () => holder.db }));

const NOW = Date.UTC(2026, 0, 15, 12);
const definitions = [fakeScaleAssessment(), fakeSelectionAssessment()];

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
    for (const key of assessmentContentKeys(definitions)) {
        await db.doc(`fixedContents/ASSESSMENT_${key}`).set({
            contentType: 'ASSESSMENT', key, body: body(key), contentVersion: '1', status: 'PUBLISHED', updatedAt: NOW, publishedAt: NOW,
        });
    }
}

const scaleRequest = (value: (id: string) => number) => ({
    version: 'fake-ref-v1',
    answers: FAKE_SCALE_ITEMS.map((item) => ({
        questionId: item.id, value: value(item.id),
    })),
});
const pickRequest = {
    version: 'fake-ref-v1', selected: [
        'a',
        'b',
        'c',
    ], ranked: ['b', 'a'],
};

describe('AssessmentService', () => {
    let db: FakeFirestore;
    let clock: { now: number };
    let service: AssessmentService;
    const member = { uid: 'u1' };
    const guest = { uid: null };
    const attemptPaths = () => db.paths().filter((path) => path.includes('/assessmentAttempts/'));

    beforeEach(async () => {
        db = new FakeFirestore();
        holder.db = db;
        clock = { now: NOW };
        await seed(db);
        service = new AssessmentService({
            clock: () => clock.now, definitions,
        });
    });

    describe('submit', () => {
        it('scores a scale on the server and gives the contents the result needs, in a result the API schema accepts', async () => {
            const result = await service.submit('hexaco', scaleRequest(() => 3), member);

            expect(assessmentResultSchema.safeParse(result).success).toBe(true);
            expect(result.result).toMatchObject({
                scores: [
                    {
                        dimension: 'novelty', score: 50, 
                    }, {
                        dimension: 'order', score: 50, 
                    },
                ], 
            });
            expect(result.content.map((content) => content.key)).toEqual(['hexaco_novelty_mid', 'hexaco_order_mid']);
        });

        it('takes a pick of the other kind in the same way', async () => {
            const result = await service.submit('core-values', pickRequest, member);

            expect(result.result).toEqual({
                selected: [
                    'a',
                    'b',
                    'c',
                ], top: ['b', 'a'],
            });
            expect(result.content.map((content) => content.key)).toEqual(['core-values_b', 'core-values_a']);
        });

        it('keeps the attempt of a member for 3 months, with the answers and the version', async () => {
            const result = await service.submit('hexaco', scaleRequest(() => 4), member);

            expect(result).toMatchObject({
                persisted: true, saveFailed: false, expiresAt: addMonths(NOW, 3),
            });
            expect(attemptPaths()).toHaveLength(1);

            const saved = assessmentAttemptDocSchema.parse((await db.doc(attemptPaths()[0] as string).get()).data());

            expect(saved).toMatchObject({
                assessmentId: 'hexaco', version: 'fake-ref-v1', completedAt: NOW, expiresAt: addMonths(NOW, 3),
            });
            expect(saved.answers.scaleAnswers).toHaveLength(4);
        });

        it('gives a guest the result and writes nothing at all', async () => {
            const before = db.paths().length;
            const result = await service.submit('hexaco', scaleRequest(() => 3), guest);

            expect(result).toMatchObject({
                persisted: false, expiresAt: null,
            });
            expect(db.paths()).toHaveLength(before);
        });

        it('turns away an assessment that is not defined, and stores nothing', async () => {
            await expect(service.submit('enneagram', scaleRequest(() => 3), member)).rejects.toBeInstanceOf(NotFoundError);
            expect(attemptPaths()).toEqual([]);
        });

        it('turns away a version it did not publish', async () => {
            await expect(service.submit('hexaco', {
                ...scaleRequest(() => 3), version: 'other-ref-v1',
            }, member)).rejects.toBeInstanceOf(NotFoundError);
        });

        it('turns away answers that are not complete and legal, names them, and stores nothing', async () => {
            await expect(service.submit('hexaco', {
                version: 'fake-ref-v1', answers: [],
            }, member)).rejects.toBeInstanceOf(ValidationError);
            await expect(service.submit('hexaco', scaleRequest((id) => (id === 'fs01' ? 6 : 3)), member)).rejects.toMatchObject({
                details: {
                    issues: [
                        {
                            id: 'fs01', reason: 'invalid-value', 
                        },
                    ], 
                }, 
            });
            await expect(service.submit('core-values', {
                ...pickRequest, selected: ['a', 'b'],
            }, member)).rejects.toBeInstanceOf(ValidationError);
            await expect(service.submit('core-values', {
                ...pickRequest, ranked: ['a', 'd'],
            }, member)).rejects.toBeInstanceOf(ValidationError);
            expect(attemptPaths()).toEqual([]);
        });

        it('stores nothing when a content that has to be shown is not published', async () => {
            await db.doc('fixedContents/ASSESSMENT_hexaco_novelty_mid').update({ status: 'DRAFT' });

            await expect(service.submit('hexaco', scaleRequest(() => 3), member)).rejects.toBeInstanceOf(NotFoundError);
            expect(attemptPaths()).toEqual([]);
        });
    });

    describe('latest', () => {
        it('gives the newest result of that assessment that has not run out, with its contents', async () => {
            await service.submit('hexaco', scaleRequest(() => 1), member);
            clock.now += 1000;

            await service.submit('hexaco', scaleRequest(() => 5), member);
            await service.submit('core-values', pickRequest, member);

            const latest = await service.latest('hexaco', 'u1');

            expect(latest).toMatchObject({
                persisted: true, completedAt: NOW + 1000, assessmentId: 'hexaco',
            });
            expect(latest.content.map((content) => content.key)).toEqual(['hexaco_novelty_mid', 'hexaco_order_mid']);
        });

        it('skips an attempt that has expired, and is not found when none is left', async () => {
            await service.submit('hexaco', scaleRequest(() => 3), member);
            clock.now = addMonths(NOW, 3) + 1;

            await expect(service.latest('hexaco', 'u1')).rejects.toBeInstanceOf(NotFoundError);
        });

        it('is not found for someone who never took it, or for an assessment that is not defined', async () => {
            await expect(service.latest('hexaco', 'u1')).rejects.toBeInstanceOf(NotFoundError);
            await expect(service.latest('enneagram', 'u1')).rejects.toBeInstanceOf(NotFoundError);
        });

        it('does not show the result of another assessment, or of another member', async () => {
            await service.submit('core-values', pickRequest, member);
            await service.submit('hexaco', scaleRequest(() => 3), { uid: 'u2' });

            await expect(service.latest('hexaco', 'u1')).rejects.toBeInstanceOf(NotFoundError);
        });

        it('skips a result that no longer fits the schema of its assessment', async () => {
            await db.doc('users/u1/assessmentAttempts/old').set({
                assessmentId: 'hexaco',
                version: 'old-ref-v1',
                answers: {},
                result: { scores: 'not a list' },
                completedAt: NOW,
                expiresAt: addMonths(NOW, 3),
            });

            await expect(service.latest('hexaco', 'u1')).rejects.toBeInstanceOf(NotFoundError);
        });
    });

    describe('list', () => {
        it('lists the assessments with their entry flag, and no result fields for a guest', async () => {
            const list = await service.list(null);

            expect(list.map((summary) => summary.assessmentId)).toEqual(['hexaco', 'core-values']);
            expect(list.map((summary) => summary.entryEnabled)).toEqual(list.map((summary) => ASSESSMENT_ENTRY_ENABLED[summary.assessmentId]));
            expect(list.every((summary) => summary.hasResult === undefined)).toBe(true);
        });

        it('tells a member which assessments have a result that has not run out', async () => {
            await service.submit('hexaco', scaleRequest(() => 3), member);

            const list = await service.list('u1');

            expect(list.find((summary) => summary.assessmentId === 'hexaco')).toMatchObject({
                hasResult: true, resultExpiresAt: addMonths(NOW, 3),
            });
            expect(list.find((summary) => summary.assessmentId === 'core-values')).toMatchObject({
                hasResult: false, resultExpiresAt: null,
            });

            clock.now = addMonths(NOW, 3) + 1;

            expect((await service.list('u1')).every((summary) => summary.hasResult === false)).toBe(true);
        });
    });
});
