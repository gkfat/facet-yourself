import {
    describe, expect, it,
} from 'vitest';
import {
    NEEDS, NEEDS_ITEMS, PSYCHOLOGICAL_NEEDS_ASSESSMENT as assessment,
} from './psychologicalNeeds';
import { findDefinitionIssues } from './index';
import { fixedContentBodySchema } from '../schemas/firestore/fixedContent.schema';
import content from '../../content/fixed/psychological-needs.json';

const answerAll = (value: (reversed: boolean) => number) => NEEDS_ITEMS.map((item) => ({
    questionId: item.id, value: value(item.reversed === true),
}));

describe('psychological needs', () => {
    it('is a sound definition with six items for each of the three needs, two turned against it', () => {
        expect(findDefinitionIssues(assessment)).toEqual([]);
        expect(NEEDS_ITEMS).toHaveLength(18);

        for (const need of NEEDS) {
            const own = NEEDS_ITEMS.filter((item) => item.dimension === need);

            expect(own).toHaveLength(6);
            expect(own.filter((item) => item.reversed)).toHaveLength(2);
        }
    });

    it('scores each need 0 to 100 with its level, a reversed item turned over', () => {
        expect(assessment.evaluate(answerAll((reversed) => (reversed ? 1 : 5)))).toMatchObject({
            scores: NEEDS.map((dimension) => ({
                dimension, score: 100, level: 'high',
            })), 
        });
        expect(assessment.evaluate(answerAll((reversed) => (reversed ? 5 : 1)))).toMatchObject({
            scores: NEEDS.map((dimension) => ({
                dimension, score: 0, level: 'low',
            })), 
        });
    });

    it('lists the low needs as worth noticing without calling them a defect, and the high ones as met', () => {
        const result = assessment.evaluate(NEEDS_ITEMS.map((item) => ({
            questionId: item.id,
            value: item.dimension === 'autonomy' ? (item.reversed ? 5 : 1) : item.dimension === 'relatedness' ? (item.reversed ? 1 : 5) : 3,
        })));
        const lines = (assessment.notesOf?.(result) ?? []).join('\n');

        expect(lines).toContain('值得留意：自主');
        expect(lines).toContain('不是你的缺陷');
        expect(lines).toContain('目前比較被滿足：關係');
        expect(lines).not.toContain('勝任');
    });

    it('has a valid content for each need at each level, carrying what lifts and lowers the drive', () => {
        expect(content.map((row) => row.key).sort()).toEqual([...assessment.allContentKeys].sort());

        for (const row of content) {
            const body = fixedContentBodySchema.parse(row.body);

            expect(body.disclaimer).toContain('沒有經過信度與效度驗證');
            expect(body.dailyBehavior).toContain('動力容易上升');
            expect(body.dailyBehavior).toContain('動力容易下降');
            expect(`${body.title}${body.summary}`).not.toMatch(/缺陷|病/);
        }
    });

    it('maps both ends of each need', () => {
        expect(new Set(assessment.traitMappings.map((entry) => entry.term)).size).toBe(6);
    });
});
