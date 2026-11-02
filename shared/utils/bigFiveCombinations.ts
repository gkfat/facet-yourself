// Plain `.ts` import specifiers: this file is also run directly by Node
// (type stripping) from scripts/, where extensionless imports do not resolve.
import {
    BIG_FIVE_COMBINATIONS, type BigFiveTrait,
} from '../constants/bigFive.ts';
import type { BigFiveLevels } from './bigFiveScoring.ts';

/** The side of a trait a combination is told for: the middle has no combination */
export type CombinationSide = 'high' | 'low';

export type BigFiveCombination = {
    traits: readonly [BigFiveTrait, BigFiveTrait];
    sides: readonly [CombinationSide, CombinationSide];
    /** The `BIGFIVE` content key of what the combination says */
    contentKey: string;
};

const SIDES: readonly CombinationSide[] = ['high', 'low'];

export const combinationKey = (traits: readonly [BigFiveTrait, BigFiveTrait], sides: readonly [CombinationSide, CombinationSide]) => `combo_${traits[0]}_${traits[1]}_${sides[0]}_${sides[1]}`;

/** Every content key of the combinations: each pair on each of the four sides (24) */
export function bigFiveCombinationKeys(): string[] {
    return BIG_FIVE_COMBINATIONS.flatMap((traits) => SIDES.flatMap((first) => SIDES.map((second) => combinationKey(traits, [first, second]))));
}

/** The combinations a member has: the pairs of which neither trait is in the middle, in the order the pairs are listed. */
export function bigFiveCombinations(levels: BigFiveLevels): BigFiveCombination[] {
    return BIG_FIVE_COMBINATIONS.flatMap((traits) => {
        const first = levels[traits[0]];
        const second = levels[traits[1]];

        if (first === 'mid' || second === 'mid') return [];

        const sides = [first, second] as const;

        return [
            {
                traits, sides, contentKey: combinationKey(traits, sides),
            },
        ];
    });
}
