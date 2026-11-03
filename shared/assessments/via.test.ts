import {
    describe, expect, it,
} from 'vitest';
import {
    VIA_ASSESSMENT as assessment, VIA_ITEMS, VIA_STRENGTH_IDS, VIA_TOP,
} from './via';
import { findDefinitionIssues } from './index';
import { fixedContentBodySchema } from '../schemas/firestore/fixedContent.schema';
import content from '../../content/fixed/via-strengths.json';

const answers = (value: Record<string, number>) => VIA_ITEMS.map((item) => ({
    questionId: item.id, value: value[item.dimension] ?? 3,
}));

describe('via strengths', () => {
    it('is a sound definition with two statements for each of the 24 strengths', () => {
        expect(findDefinitionIssues(assessment)).toEqual([]);
        expect(VIA_ITEMS).toHaveLength(48);
        expect(assessment.kind === 'scale' && assessment.view).toBe('ranked');

        for (const id of VIA_STRENGTH_IDS) {
            expect(VIA_ITEMS.filter((item) => item.dimension === id)).toHaveLength(2);
        }
    });

    it('lists all 24 with the most outstanding first, and the top five in the same order', () => {
        const result = assessment.evaluate(answers({
            humor: 5, kindness: 5, hope: 4, curiosity: 4, honesty: 4, bravery: 1,
        }));

        // 100 for kindness and humor (in the order of the list), then 75 for curiosity, honesty and hope
        expect(result).toMatchObject({
            top: [
                'kindness',
                'humor',
                'curiosity',
                'honesty',
                'hope',
            ],
        });
        expect(assessment.evaluate(answers({ humor: 5 }))).toMatchObject({ top: expect.arrayContaining(['humor']) });

        const scores = (assessment.evaluate(answers({ humor: 5 })) as { scores: { dimension: string; score: number }[] }).scores;

        expect(scores).toHaveLength(24);
        expect(scores[0]).toMatchObject({
            dimension: 'humor', score: 100,
        });
    });

    it('settles a tie for the fifth place by the order of the list, says so, and gives the same result every time', () => {
        // Everything at 3, so all 24 tie: the first five of the list lead
        const input = answers({});
        const first = assessment.evaluate(input);
        const second = assessment.evaluate([...input].reverse());

        expect(first).toMatchObject({
            top: VIA_STRENGTH_IDS.slice(0, VIA_TOP), tieBroken: true,
        });
        expect(second).toEqual(first);
        expect(assessment.notesOf?.(first)?.join('')).toContain('固定的順序');
    });

    it('does not call the strengths behind the top five a lack', () => {
        const lines = (assessment.notesOf?.(assessment.evaluate(answers({ humor: 5 }))) ?? []).join('');

        expect(lines).toContain('較不突出');
        expect(lines).toContain('不代表不足');
    });

    it('has a content for each strength, none describing a weakness, each with the way it is overused', () => {
        expect(content.map((row) => row.key).sort()).toEqual([...assessment.allContentKeys].sort());

        for (const row of content) {
            const body = fixedContentBodySchema.parse(row.body);

            expect(body.disclaimer).toContain('較不突出');
            expect(body.overuse).toHaveLength(1);
            expect(body.dailyBehavior).not.toBe('');
        }
    });

    it('maps every strength to ends of the axes', () => {
        expect(new Set(assessment.traitMappings.map((entry) => entry.term)).size).toBe(24);
    });
});
