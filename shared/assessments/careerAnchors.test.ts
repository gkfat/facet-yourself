import {
    describe, expect, it,
} from 'vitest';
import {
    CAREER_ANCHOR_IDS, CAREER_ANCHORS_ASSESSMENT as assessment, CAREER_ANCHORS_ITEMS, CAREER_ANCHORS_TOP,
} from './careerAnchors';
import { findDefinitionIssues } from './index';
import { fixedContentBodySchema } from '../schemas/firestore/fixedContent.schema';
import content from '../../content/fixed/career-anchors.json';

const answers = (value: Record<string, number>) => CAREER_ANCHORS_ITEMS.map((item) => ({
    questionId: item.id, value: value[item.dimension] ?? 3,
}));

describe('career anchors', () => {
    it('is a sound definition with six statements for each of the eight motives', () => {
        expect(findDefinitionIssues(assessment)).toEqual([]);
        expect(CAREER_ANCHORS_ITEMS).toHaveLength(48);
        expect(assessment.kind === 'scale' && assessment.view).toBe('ranked');

        for (const id of CAREER_ANCHOR_IDS) {
            expect(CAREER_ANCHORS_ITEMS.filter((item) => item.dimension === id)).toHaveLength(6);
        }
    });

    it('lists all eight with the most outstanding first, and the top three in the same order', () => {
        const result = assessment.evaluate(answers({
            service: 5, autonomy: 5, creativity: 4, security: 1,
        }));

        // 100 for autonomy and service (in the order of the list), then 75 for creativity
        expect(result).toMatchObject({
            top: [
                'autonomy',
                'service',
                'creativity',
            ],
            tieBroken: false,
        });

        const scores = (result as { scores: { dimension: string; score: number }[] }).scores;

        expect(scores).toHaveLength(8);
        expect(scores.at(-1)).toMatchObject({
            dimension: 'security', score: 0,
        });
    });

    it('settles a tie for the third place by the order of the list, says so, and gives the same result every time', () => {
        // Everything at 3, so all eight tie: the first three of the list lead
        const input = answers({});
        const first = assessment.evaluate(input);
        const second = assessment.evaluate([...input].reverse());

        expect(first).toMatchObject({
            top: CAREER_ANCHOR_IDS.slice(0, CAREER_ANCHORS_TOP), tieBroken: true,
        });
        expect(second).toEqual(first);
        expect(assessment.notesOf?.(first)?.join('')).toContain('固定的順序');
    });

    it('rejects answers that are missing or out of range', () => {
        expect(() => assessment.evaluate(answers({}).slice(1))).toThrow(RangeError);
        expect(() => assessment.evaluate(answers({}).map((answer, index) => (index === 0 ? {
            ...answer, value: 6,
        } : answer)))).toThrow(RangeError);
    });

    it('says it is not a job recommendation and does not call the lower ones a lack', () => {
        const lines = (assessment.notesOf?.(assessment.evaluate(answers({ service: 5 }))) ?? []).join('');

        expect(lines).toContain('不是職業推薦');
        expect(lines).toContain('較不突出');
    });

    it('has a content for each motive, each stating it is not a job recommendation', () => {
        expect(content.map((row) => row.key).sort()).toEqual([...assessment.allContentKeys].sort());

        for (const row of content) {
            const body = fixedContentBodySchema.parse(row.body);

            expect(body.disclaimer).toContain('不是職業推薦');
            expect(body.overuse).toHaveLength(1);
            expect(body.growthAdvice).not.toBe('');
        }
    });

    it('gives a report input whose every interpretation points at a term of its own mapping', () => {
        const contents = Object.fromEntries(content.map((row) => [
            row.key, {
                ...fixedContentBodySchema.parse(row.body), contentType: 'ASSESSMENT' as const, key: row.key, contentVersion: 'v1',
            },
        ]));
        const input = assessment.reportInput(assessment.evaluate(answers({ service: 5 })), contents);
        const terms = new Set(assessment.traitMappings.map((entry) => entry.term));

        expect(input.interpretations).toHaveLength(CAREER_ANCHORS_TOP);
        expect(input.interpretations.every((entry) => entry.term !== undefined && terms.has(entry.term))).toBe(true);
        expect(input.traits.every((term) => terms.has(term))).toBe(true);
    });

    it('maps every motive to ends of the axes', () => {
        expect(new Set(assessment.traitMappings.map((entry) => entry.term)).size).toBe(8);
    });
});
