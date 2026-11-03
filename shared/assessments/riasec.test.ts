import {
    describe, expect, it,
} from 'vitest';
import {
    RIASEC_ASSESSMENT as assessment, RIASEC_ITEMS, RIASEC_TYPES, codeKeyOf,
} from './riasec';
import { findDefinitionIssues } from './index';
import { fixedContentBodySchema } from '../schemas/firestore/fixedContent.schema';
import content from '../../content/fixed/riasec.json';

/** Answers of 1 to 5 for the activities of each type, the rest at 3 */
const answers = (value: Record<string, number>) => RIASEC_ITEMS.map((item) => ({
    questionId: item.id, value: value[item.dimension] ?? 3,
}));

describe('riasec', () => {
    it('is a sound definition with ten activities for each of the six types, answered by liking', () => {
        expect(findDefinitionIssues(assessment)).toEqual([]);
        expect(RIASEC_ITEMS).toHaveLength(60);
        expect(assessment.kind === 'scale' && assessment.view).toBe('code');

        for (const type of RIASEC_TYPES) {
            expect(RIASEC_ITEMS.filter((item) => item.dimension === type)).toHaveLength(10);
        }

        expect(assessment.kind === 'scale' && assessment.answerLabels).toEqual([
            '非常不喜歡',
            '不喜歡',
            '普通',
            '喜歡',
            '非常喜歡',
        ]);
    });

    it('takes the three highest types as the code, highest first, with the scores sorted the same way', () => {
        const result = assessment.evaluate(answers({
            investigative: 5, artistic: 4, social: 4, realistic: 2,
        }));

        expect(result).toMatchObject({
            top: [
                'investigative',
                'artistic',
                'social',
            ], tieBroken: false,
        });
        expect(assessment.notesOf?.(result)?.join('')).toContain('三碼興趣代碼是 IAS');
    });

    it('settles a tie for the third place by the fixed order, and says so, the same every time', () => {
        // social and enterprising score the same for the third place
        const input = answers({
            realistic: 5, investigative: 4, social: 4, enterprising: 4,
        });
        const first = assessment.evaluate(input);
        const second = assessment.evaluate([...input].reverse());

        expect(first).toMatchObject({
            top: [
                'realistic',
                'investigative',
                'social',
            ], tieBroken: true,
        });
        expect(second).toEqual(first);
        expect(assessment.notesOf?.(first)?.join('')).toContain('固定的順序');
    });

    it('asks for the content of the set of the three types, then of each of them in the order they rank', () => {
        const result = assessment.evaluate(answers({
            social: 5, realistic: 4, conventional: 4,
        }));

        expect(assessment.contentKeysOf(result)).toEqual([
            'riasec_code-RSC',
            'riasec_type-S',
            'riasec_type-R',
            'riasec_type-C',
        ]);
        expect(codeKeyOf([
            'conventional',
            'social',
            'realistic',
        ])).toBe('riasec_code-RSC');
    });

    it('has a content for the six types and the twenty sets, saying this is an interest and not an ability or a fit', () => {
        expect(content).toHaveLength(26);
        expect(content.map((row) => row.key).sort()).toEqual([...assessment.allContentKeys].sort());

        for (const row of content) {
            const body = fixedContentBodySchema.parse(row.body);

            expect(body.disclaimer).toContain('這是興趣的描述，不是能力或適性的判定');
            expect(JSON.stringify(body)).not.toMatch(/你適合當|最適合的職業/);
        }
    });

    it('maps every type to ends of the axes', () => {
        expect(new Set(assessment.traitMappings.map((entry) => entry.term)).size).toBe(6);
    });
});
