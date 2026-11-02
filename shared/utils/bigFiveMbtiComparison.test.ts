import {
    describe, expect, it,
} from 'vitest';
import { compareWithMbti } from './bigFiveMbtiComparison';
import type { BigFiveScores } from './bigFiveScoring';

const scores = (overrides: Partial<BigFiveScores> = {}): BigFiveScores => ({
    openness: 50, conscientiousness: 50, extraversion: 50, agreeableness: 50, neuroticism: 50, ...overrides,
});

const resultOf = (list: ReturnType<typeof compareWithMbti>, pair: string) => list.find((item) => item.pair === pair);

describe('compareWithMbti', () => {
    it('gives nothing without an MBTI type', () => {
        expect(compareWithMbti(scores(), null)).toEqual([]);
    });

    it('matches when the trait is high and the letter is E, N, F or J', () => {
        const list = compareWithMbti(scores({
            extraversion: 80, openness: 80, agreeableness: 80, conscientiousness: 80,
        }), 'ENFJ');

        for (const pair of [
            'ei',
            'sn',
            'tf',
            'jp',
        ]) {
            expect(resultOf(list, pair)).toMatchObject({
                result: 'match', contentKey: `compare_${pair}_match`,
            });
        }
    });

    it('matches when the trait is low and the letter is I, S, T or P', () => {
        const list = compareWithMbti(scores({
            extraversion: 20, openness: 20, agreeableness: 20, conscientiousness: 20,
        }), 'ISTP');

        expect(list.every((item) => item.result === 'match')).toBe(true);
    });

    it('differs when they point the other way, with the explanation of a difference', () => {
        const list = compareWithMbti(scores({ extraversion: 80 }), 'INTJ');

        expect(resultOf(list, 'ei')).toMatchObject({
            result: 'differ', letter: 'I', contentKey: 'compare_ei_differ',
        });
        expect(resultOf(compareWithMbti(scores({ extraversion: 20 }), 'ENTJ'), 'ei')?.result).toBe('differ');
    });

    it('is neutral, with no explanation, when the trait is in the middle', () => {
        for (const score of [
            40,
            50,
            60,
        ]) {
            expect(resultOf(compareWithMbti(scores({ extraversion: score }), 'ENTJ'), 'ei')).toMatchObject({
                result: 'neutral', contentKey: null,
            });
        }
    });

    it('leaves neuroticism out: four pairs only', () => {
        expect(compareWithMbti(scores({ neuroticism: 95 }), 'INFP').map((item) => item.pair)).toEqual([
            'ei',
            'sn',
            'tf',
            'jp',
        ]);
    });
});
