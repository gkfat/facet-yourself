import {
    describe, expect, it,
} from 'vitest';
import {
    ATTACHMENT_ASSESSMENT as assessment, ATTACHMENT_ITEMS, QUADRANT_NAMES,
} from './attachmentStyle';
import { findDefinitionIssues } from './index';
import { fixedContentBodySchema } from '../schemas/firestore/fixedContent.schema';
import content from '../../content/fixed/attachment-style.json';

/** Answers that make a dimension read high, low or about in the middle */
const answers = (anxiety: 'high' | 'low' | 'mid', avoidance: 'high' | 'low' | 'mid') => ATTACHMENT_ITEMS.map((item) => {
    const lean = item.dimension === 'anxiety' ? anxiety : avoidance;
    const toward = lean === 'high' ? 5 : 1;
    const value = lean === 'mid' ? 3 : item.reversed ? 6 - toward : toward;

    return {
        questionId: item.id, value,
    };
});

const run = (anxiety: 'high' | 'low' | 'mid', avoidance: 'high' | 'low' | 'mid') => assessment.evaluate(answers(anxiety, avoidance));

describe('attachment style', () => {
    it('is a sound definition with twelve items for each of the two dimensions, four turned against it', () => {
        expect(findDefinitionIssues(assessment)).toEqual([]);
        expect(ATTACHMENT_ITEMS).toHaveLength(24);

        for (const dimension of ['anxiety', 'avoidance']) {
            const own = ATTACHMENT_ITEMS.filter((item) => item.dimension === dimension);

            expect(own).toHaveLength(12);
            expect(own.filter((item) => item.reversed)).toHaveLength(4);
        }
    });

    it('puts the two scores in the quadrant they fall in, with no neighbour when both are clear', () => {
        expect(run('low', 'low')).toMatchObject({
            primary: 'steady', between: [],
        });
        expect(run('high', 'low')).toMatchObject({
            primary: 'close', between: [],
        });
        expect(run('low', 'high')).toMatchObject({
            primary: 'independent', between: [],
        });
        expect(run('high', 'high')).toMatchObject({
            primary: 'torn', between: [],
        });
    });

    it('says the result is between quadrants when a dimension is in the middle, and asks for both descriptions', () => {
        // The middle scores exactly 50, which counts to the high side
        const result = run('mid', 'low');

        expect(result).toMatchObject({
            primary: 'close', between: ['steady'],
        });
        expect(assessment.contentKeysOf(result)).toEqual(['attachment-style_quadrant-close', 'attachment-style_quadrant-steady']);
        expect((assessment.notesOf?.(result) ?? []).join('')).toContain('之間');
    });

    it('names the two neighbours when both dimensions are in the middle', () => {
        expect(run('mid', 'mid')).toMatchObject({ between: expect.arrayContaining(['independent', 'close']) });
    });

    it('says it is not a diagnosis or a fixed label, and uses no clinical wording in the names', () => {
        const lines = (assessment.notesOf?.(run('high', 'high')) ?? []).join('');

        expect(lines).toContain('不是固定標籤，也不是診斷');
        expect(Object.values(QUADRANT_NAMES).join('')).not.toMatch(/症|障礙|病/);
    });

    it('has a content for each quadrant, with the same statement about change, and no diagnosis words', () => {
        expect(content.map((row) => row.key).sort()).toEqual([...assessment.allContentKeys].sort());

        for (const row of content) {
            const body = fixedContentBodySchema.parse(row.body);

            expect(body.disclaimer).toContain('依附模式會隨關係與經驗改變，不是固定標籤，也不是診斷');
            expect(JSON.stringify(body)).not.toMatch(/障礙|病態|治療/);
        }
    });

    it('maps both ends of the two dimensions', () => {
        expect(new Set(assessment.traitMappings.map((entry) => entry.term)).size).toBe(4);
    });
});

describe('result layout', () => {
    it('is told by the quadrant it falls in', () => {
        expect(assessment.kind === 'scale' && assessment.view).toBe('quadrant');
    });
});
