import {
    describe, expect, it,
} from 'vitest';
import {
    EQ_ASSESSMENT as assessment, EQ_ITEMS, EQ_SIDES,
} from './emotionalIntelligence';
import { findDefinitionIssues } from './index';
import { fixedContentBodySchema } from '../schemas/firestore/fixedContent.schema';
import content from '../../content/fixed/emotional-intelligence.json';

const answerAll = (value: (reversed: boolean) => number) => EQ_ITEMS.map((item) => ({
    questionId: item.id, value: value(item.reversed === true),
}));

describe('emotional intelligence', () => {
    it('is a sound definition with ten items for each of the four sides, some turned against it', () => {
        expect(findDefinitionIssues(assessment)).toEqual([]);
        expect(EQ_ITEMS).toHaveLength(40);

        for (const side of EQ_SIDES) {
            const own = EQ_ITEMS.filter((item) => item.dimension === side);

            expect(own).toHaveLength(10);
            expect(own.some((item) => item.reversed)).toBe(true);
        }
    });

    it('scores each side 0 to 100 with its level, and has no total', () => {
        const high = assessment.evaluate(answerAll((reversed) => (reversed ? 1 : 5)));
        const low = assessment.evaluate(answerAll((reversed) => (reversed ? 5 : 1)));

        expect(high).toMatchObject({
            scores: EQ_SIDES.map((dimension) => ({
                dimension, score: 100, level: 'high',
            })), 
        });
        expect(low).toMatchObject({
            scores: EQ_SIDES.map((dimension) => ({
                dimension, score: 0, level: 'low',
            })), 
        });
        expect(Object.keys(high as object)).toEqual(['scores']);
    });

    it('says that emotional skill can be practised, and names the sides that are high and the ones to practise', () => {
        const result = assessment.evaluate(EQ_ITEMS.map((item) => ({
            questionId: item.id,
            value: item.dimension === 'empathy' ? (item.reversed ? 1 : 5) : item.dimension === 'regulation' ? (item.reversed ? 5 : 1) : 3,
        })));
        const lines = (assessment.notesOf?.(result) ?? []).join('\n');

        expect(lines).toContain('目前比較熟練的面向：同理心');
        expect(lines).toContain('可以多練習的面向：情緒調節');
        expect(lines).toContain('情緒能力可以練習，不是固定的');
        expect(lines).toContain('沒有一個總分');
    });

    it('has a content for each side at each level, with something to practise and no diagnosis words', () => {
        expect(content.map((row) => row.key).sort()).toEqual([...assessment.allContentKeys].sort());

        for (const row of content) {
            const body = fixedContentBodySchema.parse(row.body);

            expect(body.growthPractice?.weeklyPractice).toBeTruthy();
            expect(body.disclaimer).toContain('情緒能力可以練習');
            expect(JSON.stringify(body)).not.toMatch(/障礙|症|病態|治療/);
        }
    });

    it('maps only what the readings really say', () => {
        const terms = new Set(assessment.traitMappings.map((entry) => entry.term));

        expect(terms.size).toBe(6);
        expect(terms.has('eq:awareness:low')).toBe(false);
        expect(terms.has('eq:interpersonal:low')).toBe(false);
    });
});

describe('result layout', () => {
    it('is told one dimension to a card', () => {
        expect(assessment.kind === 'scale' && assessment.view).toBe('profile');
    });
});
