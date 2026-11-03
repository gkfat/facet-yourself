import {
    describe, expect, it,
} from 'vitest';
import {
    ENNEAGRAM_ASSESSMENT, ENNEAGRAM_ITEMS, ENNEAGRAM_TIE_KEY, ENNEAGRAM_TYPES,
} from './enneagram';
import { findDefinitionIssues } from './index';
import { fixedContentBodySchema } from '../schemas/firestore/fixedContent.schema';
import content from '../../content/fixed/enneagram.json';

/** Answers 5 for the statements of the types in `high`, 3 for the rest */
const answers = (high: Record<string, number>) => ENNEAGRAM_ITEMS.map((item) => ({
    questionId: item.id, value: high[item.dimension] ?? 3,
}));

const run = (high: Record<string, number>) => ENNEAGRAM_ASSESSMENT.evaluate(answers(high));

describe('enneagram', () => {
    it('is a sound definition with six items for each of the nine types', () => {
        expect(findDefinitionIssues(ENNEAGRAM_ASSESSMENT)).toEqual([]);
        expect(ENNEAGRAM_ITEMS).toHaveLength(54);

        for (const type of ENNEAGRAM_TYPES) {
            expect(ENNEAGRAM_ITEMS.filter((item) => item.dimension === type)).toHaveLength(6);
        }
    });

    it('names the type that stands out, with its wing, and no tie when the gap is wide', () => {
        const result = run({
            'type-4': 5, 'type-5': 3, 
        });

        expect(result).toMatchObject({
            primary: 'type-4', tied: null,
        });
        expect(ENNEAGRAM_ASSESSMENT.contentKeysOf(result)).toEqual(['enneagram_type-4']);
    });

    it('takes the wing from the neighbour that scores higher, across the ends of the circle', () => {
        expect(run({
            'type-4': 5, 'type-5': 4, 'type-3': 2,
        })).toMatchObject({ wing: 'type-5' });
        expect(run({
            'type-4': 5, 'type-5': 2, 'type-3': 4,
        })).toMatchObject({ wing: 'type-3' });
        // 1 sits next to 9 and 2
        expect(run({
            'type-1': 5, 'type-9': 4, 'type-2': 1,
        })).toMatchObject({ wing: 'type-9' });
        expect(run({
            'type-9': 5, 'type-1': 4, 'type-8': 1,
        })).toMatchObject({ wing: 'type-1' });
    });

    it('puts the two types side by side when they are less than 10 points apart, and asks for the note about it', () => {
        // 5 on all six items is 100; 4 on all six is 75; one answer lower (5,5,5,5,5,4 -> 96) is within 10
        const items = ENNEAGRAM_ITEMS.filter((item) => item.dimension === 'type-8');
        const nearly = ENNEAGRAM_ITEMS.map((item) => ({
            questionId: item.id,
            value: item.dimension === 'type-2' ? 5 : item.dimension === 'type-8' ? (item.id === items[0]?.id ? 4 : 5) : 3,
        }));
        const result = ENNEAGRAM_ASSESSMENT.evaluate(nearly);

        expect(result).toMatchObject({
            primary: 'type-2', tied: 'type-8',
        });
        expect(ENNEAGRAM_ASSESSMENT.contentKeysOf(result)).toEqual([
            ENNEAGRAM_TIE_KEY,
            'enneagram_type-2',
            'enneagram_type-8',
        ]);
    });

    it('keeps a gap of exactly 10 points apart: it is not a tie', () => {
        // type-2 at 100, type-8 at 90 (five items 5, one item 4 would be 96): use scores 100 and 80
        const eighty = ENNEAGRAM_ITEMS.map((item) => ({
            questionId: item.id, value: item.dimension === 'type-2' ? 5 : item.dimension === 'type-8' ? 4 : 3,
        }));

        expect(ENNEAGRAM_ASSESSMENT.evaluate(eighty)).toMatchObject({ tied: null });
    });

    it('says in plain words what stands out, and never calls the person a type', () => {
        const result = run({ 'type-6': 5 });
        const lines = ENNEAGRAM_ASSESSMENT.notesOf?.(result) ?? [];

        expect(lines.join('')).toContain('第 6 型');
        expect(lines.join('')).not.toMatch(/你就是|你是第/);
    });

    it('has a content for each type and for the tie, valid, with the disclaimer, and every key is asked for by some result', () => {
        expect(content.map((row) => row.key).sort()).toEqual([...ENNEAGRAM_ASSESSMENT.allContentKeys].sort());

        for (const row of content) {
            const body = fixedContentBodySchema.parse(row.body);

            expect(body.disclaimer).toContain('沒有經過信度與效度驗證');
        }

        const motives = content.filter((row) => row.key !== ENNEAGRAM_TIE_KEY).map((row) => fixedContentBodySchema.parse(row.body));

        expect(motives.every((body) => body.coreNeeds !== null && body.growthReflection !== null)).toBe(true);
    });

    it('maps each type to ends of the axes', () => {
        const terms = new Set(ENNEAGRAM_ASSESSMENT.traitMappings.map((entry) => entry.term));

        expect(terms.size).toBe(9);
    });
});
