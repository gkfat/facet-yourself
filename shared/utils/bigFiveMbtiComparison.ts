// Plain `.ts` import specifiers: this file is also run directly by Node
// (type stripping) from scripts/, where extensionless imports do not resolve.
import type { BigFiveTrait } from '../constants/bigFive.ts';
import type { MbtiType } from '../schemas/common.ts';
import {
    bigFiveLevel, type BigFiveScores,
} from './bigFiveScoring.ts';

export const COMPARISON_PAIRS = [
    'ei',
    'sn',
    'tf',
    'jp',
] as const;

export type ComparisonPair = typeof COMPARISON_PAIRS[number];

/** Whether the two models point the same way, the other way, or the trait is in the middle and says nothing either way */
export type ComparisonResult = 'match' | 'differ' | 'neutral';

export type ComparisonItem = {
    pair: ComparisonPair;
    trait: BigFiveTrait;
    /** The letter of the MBTI type for this pair */
    letter: string;
    result: ComparisonResult;
    /** The `BIGFIVE` content key of the explanation: null when the trait is in the middle */
    contentKey: string | null;
};

/** Which Big Five trait each MBTI pair is held against, the position of its letter in the type, and the letter a high score leans to. */
const PAIRS: Readonly<Record<ComparisonPair, { trait: BigFiveTrait; position: number; highLetter: string }>> = {
    ei: {
        trait: 'extraversion', position: 0, highLetter: 'E',
    },
    sn: {
        trait: 'openness', position: 1, highLetter: 'N',
    },
    tf: {
        trait: 'agreeableness', position: 2, highLetter: 'F',
    },
    jp: {
        trait: 'conscientiousness', position: 3, highLetter: 'J',
    },
};

/**
 * Hold the Big Five scores against an MBTI type, pair by pair: extraversion with E/I, openness with S/N (high is N),
 * agreeableness with T/F (high is F), conscientiousness with J/P (high is J). A trait in the middle is neutral. Neuroticism
 * has no pair. Without an MBTI type there is nothing to compare: an empty list.
 */
export function compareWithMbti(scores: BigFiveScores, mbti: MbtiType | null): ComparisonItem[] {
    if (!mbti) return [];

    return COMPARISON_PAIRS.map((pair) => {
        const {
            trait, position, highLetter, 
        } = PAIRS[pair];
        const letter = mbti.charAt(position);
        const level = bigFiveLevel(scores[trait]);

        if (level === 'mid') return {
            pair, trait, letter, result: 'neutral' as const, contentKey: null,
        };

        const result = (level === 'high') === (letter === highLetter) ? 'match' as const : 'differ' as const;

        return {
            pair, trait, letter, result, contentKey: `compare_${pair}_${result}`,
        };
    });
}
