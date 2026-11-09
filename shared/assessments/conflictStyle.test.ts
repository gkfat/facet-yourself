import {
    describe, expect, it,
} from 'vitest';
import {
    CONFLICT_QUADRANT_NAMES, CONFLICT_STYLE_ASSESSMENT as assessment, CONFLICT_STYLE_ITEMS,
} from './conflictStyle';
import { findDefinitionIssues } from './index';
import { fixedContentBodySchema } from '../schemas/firestore/fixedContent.schema';
import content from '../../content/fixed/conflict-style.json';

/** Answers that make a concern read high, low or about in the middle */
const answers = (goals: 'high' | 'low' | 'mid', relationship: 'high' | 'low' | 'mid') => CONFLICT_STYLE_ITEMS.map((item) => {
    const lean = item.dimension === 'goals' ? goals : relationship;
    const toward = lean === 'high' ? 5 : 1;
    const value = lean === 'mid' ? 3 : item.reversed ? 6 - toward : toward;

    return {
        questionId: item.id, value,
    };
});

const run = (goals: 'high' | 'low' | 'mid', relationship: 'high' | 'low' | 'mid') => assessment.evaluate(answers(goals, relationship));

describe('conflict style', () => {
    it('is a sound definition with ten items for each of the two concerns, three turned against it', () => {
        expect(findDefinitionIssues(assessment)).toEqual([]);
        expect(CONFLICT_STYLE_ITEMS).toHaveLength(20);

        for (const dimension of ['goals', 'relationship']) {
            const own = CONFLICT_STYLE_ITEMS.filter((item) => item.dimension === dimension);

            expect(own).toHaveLength(10);
            expect(own.filter((item) => item.reversed)).toHaveLength(3);
        }
    });

    it('turns a reversed item over before it counts', () => {
        // Agreeing with every statement, reversed ones included, lands in the middle-high range rather than at the top
        const result = assessment.evaluate(CONFLICT_STYLE_ITEMS.map((item) => ({
            questionId: item.id, value: 5,
        }))) as { scores: { dimension: string; score: number }[] };

        expect(result.scores.every((entry) => entry.score === 70)).toBe(true);
    });

    it('puts the two scores in the quadrant they fall in, with no neighbour when both are clear', () => {
        expect(run('low', 'low')).toMatchObject({
            primary: 'avoiding', between: [],
        });
        expect(run('high', 'low')).toMatchObject({
            primary: 'assertive', between: [],
        });
        expect(run('low', 'high')).toMatchObject({
            primary: 'accommodating', between: [],
        });
        expect(run('high', 'high')).toMatchObject({
            primary: 'collaborating', between: [],
        });
    });

    it('says the result is between quadrants when a concern is in the middle, and asks for both descriptions', () => {
        // The middle scores exactly 50, which counts to the high side
        const result = run('mid', 'low');

        expect(result).toMatchObject({
            primary: 'assertive', between: ['avoiding'],
        });
        expect(assessment.contentKeysOf(result)).toEqual(['conflict-style_quadrant-assertive', 'conflict-style_quadrant-avoiding']);
        expect((assessment.notesOf?.(result) ?? []).join('')).toContain('之間');
    });

    it('names the two neighbours when both concerns are in the middle', () => {
        expect(run('mid', 'mid')).toMatchObject({ between: expect.arrayContaining(['accommodating', 'assertive']) });
    });

    it('says the style changes with the situation, and uses no clinical wording in the names', () => {
        const lines = (assessment.notesOf?.(run('high', 'high')) ?? []).join('');

        expect(lines).toContain('沒有哪一種風格永遠最好');
        expect(lines).toContain('不是固定標籤，也不是診斷');
        expect(Object.values(CONFLICT_QUADRANT_NAMES).join('')).not.toMatch(/症|障礙|病/);
    });

    it('has a content for each quadrant, with the same statement about situations, and no diagnosis words', () => {
        expect(content.map((row) => row.key).sort()).toEqual([...assessment.allContentKeys].sort());

        for (const row of content) {
            const body = fixedContentBodySchema.parse(row.body);

            expect(body.disclaimer).toContain('會隨對象與利害改變');
            expect(body.disclaimer).toContain('不是固定標籤，也不是診斷');
            expect(JSON.stringify(body)).not.toMatch(/障礙|病態|治療/);
        }
    });

    it('maps both ends of the two concerns', () => {
        expect(new Set(assessment.traitMappings.map((entry) => entry.term)).size).toBe(4);
    });

    it('is told by the quadrant it falls in', () => {
        expect(assessment.kind === 'scale' && assessment.view).toBe('quadrant');
    });
});
