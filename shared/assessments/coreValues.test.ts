import {
    describe, expect, it,
} from 'vitest';
import {
    CORE_VALUES_ASSESSMENT as assessment, CORE_VALUES_PICK, CORE_VALUES_RANK, CORE_VALUE_OPTIONS,
} from './coreValues';
import { findDefinitionIssues } from './index';
import { findSelectionIssues } from './scoring';
import { fixedContentBodySchema } from '../schemas/firestore/fixedContent.schema';
import content from '../../content/fixed/core-values.json';

const picks = CORE_VALUE_OPTIONS.slice(0, CORE_VALUES_PICK).map((option) => option.id);

describe('core values', () => {
    it('is a sound definition with forty values, picking ten and ranking five', () => {
        expect(findDefinitionIssues(assessment)).toEqual([]);
        expect(CORE_VALUE_OPTIONS).toHaveLength(40);
        expect(assessment.kind === 'selection' && [assessment.pick, assessment.rank]).toEqual([10, 5]);
    });

    it('accepts a pick of ten with five of them ranked, and turns away the rest', () => {
        const ranked = picks.slice(0, CORE_VALUES_RANK);

        expect(findSelectionIssues({
            selected: picks, ranked,
        }, CORE_VALUE_OPTIONS, 10, 5)).toEqual([]);
        expect(findSelectionIssues({
            selected: picks.slice(0, 9), ranked,
        }, CORE_VALUE_OPTIONS, 10, 5)).not.toEqual([]);
        expect(findSelectionIssues({
            selected: [...picks.slice(0, 9), 'not-a-value'], ranked,
        }, CORE_VALUE_OPTIONS, 10, 5)).not.toEqual([]);
        expect(findSelectionIssues({
            selected: [...picks.slice(0, 9), picks[0] ?? ''], ranked,
        }, CORE_VALUE_OPTIONS, 10, 5)).not.toEqual([]);
        expect(findSelectionIssues({
            selected: picks, ranked: ['wealth', ...ranked.slice(1)],
        }, CORE_VALUE_OPTIONS, 10, 5)).not.toEqual([]);
    });

    it('keeps the order of the top five, asks for the contents of all ten with the top five first', () => {
        const ranked = [
            'courage',
            'freedom',
            'honesty',
            'family',
            'health',
        ];
        const others = [
            'growth',
            'peace',
            'humor',
            'respect',
            'nature',
        ];
        const result = assessment.evaluate({
            selected: [...ranked, ...others], ranked,
        });

        expect(result).toEqual({
            selected: [...ranked, ...others], top: ranked,
        });
        expect(assessment.contentKeysOf(result)).toEqual([...ranked, ...others].map((id) => `core-values_${id}`));
    });

    it('says what the picks add up to: the areas they gather in, the first value, and the pulls between them', () => {
        const ranked = [
            'freedom',
            'independence',
            'courage',
            'adventure',
            'authenticity',
        ];
        const result = assessment.evaluate({
            selected: [
                ...ranked,
                'security',
                'relationships',
                'humor',
                'peace',
                'learning',
            ], ranked,
        });
        const {
            portrait, tensions, 
        } = assessment.synthesisOf?.(result) ?? {
            portrait: [], tensions: [],
        };

        expect(portrait.join('')).toContain('最集中在「自主與真實」');
        expect(portrait.join('')).toContain('你把「自由」排在第一位');
        expect(tensions.join('')).toContain('「自由」與「安全」');
        expect(tensions.join('')).toContain('「獨立」與「關係」');
        expect(tensions.join('')).not.toMatch(/比較對的是|較好/);
    });

    it('leaves out a pull in which neither value is among the first five', () => {
        const ranked = [
            'health',
            'growth',
            'learning',
            'family',
            'nature',
        ];
        const result = assessment.evaluate({
            selected: [
                ...ranked,
                'freedom',
                'security',
                'humor',
                'peace',
                'beauty',
            ], ranked,
        });

        expect((assessment.synthesisOf?.(result) ?? {
            portrait: [], tensions: [],
        }).tensions).toEqual([]);
    });

    it('has a valid content for every value, none called better or worse, each with a question to reflect on', () => {
        expect(content.map((row) => row.key).sort()).toEqual([...assessment.allContentKeys].sort());

        for (const row of content) {
            const body = fixedContentBodySchema.parse(row.body);

            expect(body.disclaimer).toContain('不評價價值的好壞或高下');
            expect(body.growthReflection?.reflectionQuestion).toMatch(/？$/);
            expect(`${body.title}${body.summary}`).not.toMatch(/較好|較差|比較高尚/);
        }
    });

    it('maps every value to ends of the axes', () => {
        expect(new Set(assessment.traitMappings.map((entry) => entry.term)).size).toBe(40);
    });
});
