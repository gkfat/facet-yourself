import {
    describe, expect, it,
} from 'vitest';
import {
    bigFiveCombinationKeys, bigFiveCombinations,
} from './bigFiveCombinations';
import type { BigFiveLevels } from './bigFiveScoring';

const levels = (overrides: Partial<BigFiveLevels> = {}): BigFiveLevels => ({
    openness: 'mid', conscientiousness: 'mid', extraversion: 'mid', agreeableness: 'mid', neuroticism: 'mid', ...overrides,
});

describe('bigFiveCombinationKeys', () => {
    it('has the six pairs on the four sides each, all different', () => {
        const keys = bigFiveCombinationKeys();

        expect(keys).toHaveLength(24);
        expect(new Set(keys).size).toBe(24);
        expect(keys).toContain('combo_openness_conscientiousness_high_high');
        expect(keys).toContain('combo_extraversion_neuroticism_low_high');
    });
});

describe('bigFiveCombinations', () => {
    it('has none when every trait is in the middle', () => {
        expect(bigFiveCombinations(levels())).toEqual([]);
    });

    it('has none for a pair of which one trait is in the middle', () => {
        expect(bigFiveCombinations(levels({ openness: 'high' }))).toEqual([]);
    });

    it('has the pair when neither trait is in the middle, with the sides it is told for', () => {
        const [first] = bigFiveCombinations(levels({
            openness: 'high', conscientiousness: 'low',
        }));

        expect(first).toMatchObject({
            traits: ['openness', 'conscientiousness'], sides: ['high', 'low'], contentKey: 'combo_openness_conscientiousness_high_low',
        });
    });

    it('has every pair at once when every trait is out of the middle, in the order the pairs are listed', () => {
        const all = bigFiveCombinations(levels({
            openness: 'high', conscientiousness: 'high', extraversion: 'low', agreeableness: 'low', neuroticism: 'high',
        }));

        expect(all).toHaveLength(6);
        expect(all.map((item) => item.traits.join('/'))).toEqual([
            'openness/conscientiousness',
            'openness/extraversion',
            'extraversion/agreeableness',
            'conscientiousness/neuroticism',
            'agreeableness/neuroticism',
            'extraversion/neuroticism',
        ]);
        expect(all.every((item) => bigFiveCombinationKeys().includes(item.contentKey))).toBe(true);
    });
});
