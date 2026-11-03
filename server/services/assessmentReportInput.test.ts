import {
    beforeEach, describe, expect, it, vi,
} from 'vitest';
import { FakeFirestore } from '../test-utils/fakeFirestore';
import { AssessmentService } from './assessment.service';
import { SingleReportService } from './singleReport.service';
import {
    FAKE_SCALE_ITEMS, fakeScaleAssessment, fakeSelectionAssessment,
} from '../../shared/assessments/testing';
import { assessmentContentKeys } from '../../shared/assessments';
import {
    UnprocessableError, ValidationError,
} from '../../shared/types/errors';
import { addMonths } from '../../shared/utils/time';

const holder = vi.hoisted(() => ({ db: undefined as unknown }));

vi.mock('../utils/firebaseAdmin', () => ({ getAdminFirestore: () => holder.db }));

const NOW = Date.UTC(2026, 0, 15, 12);
const definitions = [fakeScaleAssessment(), fakeSelectionAssessment()];

describe('the self-analyses as systems of a multi-dimension report', () => {
    let db: FakeFirestore;
    let clock: { now: number };
    let assessments: AssessmentService;
    let single: SingleReportService;

    beforeEach(async () => {
        db = new FakeFirestore();
        holder.db = db;
        clock = { now: NOW };

        for (const key of assessmentContentKeys(definitions)) {
            await db.doc(`fixedContents/ASSESSMENT_${key}`).set({
                contentType: 'ASSESSMENT',
                key,
                body: {
                    title: key, summary: key, strengths: [], blindSpots: [], loveStyle: '', workStyle: '', communicationStyle: '', growthAdvice: '', disclaimer: '僅供自我探索',
                },
                contentVersion: '1',
                status: 'PUBLISHED',
                updatedAt: NOW,
                publishedAt: NOW,
            });
        }

        await db.doc('users/u1').set({
            email: 'a@example.com', bloodType: 'UNKNOWN', mbti: null, mbtiExpiresAt: null, createdAt: NOW, updatedAt: NOW,
        });
        assessments = new AssessmentService({
            clock: () => clock.now, definitions,
        });
        single = new SingleReportService({
            clock: () => clock.now, assessments,
        });
    });

    const takeScale = () => assessments.submit('hexaco', {
        version: 'fake-ref-v1', answers: FAKE_SCALE_ITEMS.map((item) => ({
            questionId: item.id, value: 3,
        })),
    }, { uid: 'u1' });
    const takePick = () => assessments.submit('core-values', {
        version: 'fake-ref-v1', selected: [
            'a',
            'b',
            'c',
        ], ranked: ['b', 'a'],
    }, { uid: 'u1' });

    it('takes the newest result of each self-analysis as what it adds to the report, without the profile', async () => {
        await takeScale();
        await takePick();

        const inputs = await single.memberInputs('u1', ['HEXACO', 'CORE_VALUES']);

        expect(inputs).toHaveLength(2);
        expect(inputs.every((input) => input.position === '測試用的位置結論')).toBe(true);
    });

    it('stops before anything is paid when a self-analysis has no result, and names the one that is missing', async () => {
        await takeScale();

        await expect(single.memberInputs('u1', ['HEXACO', 'CORE_VALUES'])).rejects.toMatchObject({
            code: 'ASSESSMENT_REQUIRED', message: expect.stringContaining('測試用'),
        });
        await expect(single.memberInputs('u1', ['HEXACO', 'CORE_VALUES'])).rejects.toBeInstanceOf(UnprocessableError);
    });

    it('does not use a result that has run out', async () => {
        await takeScale();
        clock.now = addMonths(NOW, 3) + 1;

        await expect(single.memberInputs('u1', ['HEXACO'])).rejects.toMatchObject({ code: 'ASSESSMENT_REQUIRED' });
    });

    it('does not use the result of another member', async () => {
        await takeScale();
        await db.doc('users/u2').set({
            email: 'b@example.com', bloodType: 'UNKNOWN', mbti: null, mbtiExpiresAt: null, createdAt: NOW, updatedAt: NOW,
        });

        await expect(single.memberInputs('u2', ['HEXACO'])).rejects.toMatchObject({ code: 'ASSESSMENT_REQUIRED' });
    });

    it('turns away a system that is neither a lasting one nor a self-analysis that is defined', async () => {
        await expect(single.memberInputs('u1', ['ENNEAGRAM'])).rejects.toBeInstanceOf(ValidationError);
    });
});
