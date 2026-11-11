import type { Stem } from '../../constants/bazi';
import {
    BIRTH_YEAR_TRANSFORMATIONS,
    TRANSFORMATIONS,
    type Transformation,
    type ZiweiStar,
} from '../../constants/ziwei';
import type {
    BirthYearTransformation,
    PalaceChart,
    StarPlacement,
} from './types';

/** The four 生年四化 of a birth-year stem, in the order 祿 權 科 忌. */
export function birthYearTransformationsOf(yearStem: Stem): BirthYearTransformation[] {
    const stars = BIRTH_YEAR_TRANSFORMATIONS[yearStem];

    return TRANSFORMATIONS.map((transformation, index) => ({
        transformation,
        star: stars[index] as ZiweiStar,
    }));
}

function markStar<TStar extends ZiweiStar>(
    placement: StarPlacement<TStar>,
    marks: ReadonlyMap<ZiweiStar, Transformation>,
): StarPlacement<TStar> {
    return {
        ...placement,
        transformation: marks.get(placement.star) ?? null,
    };
}

/**
 * The palaces with the 生年四化 attached to the stars they land on. A 四化 is a mark on a star, not an extra star,
 * and every transformed star is a placed main or auxiliary star, so each of the four lands in exactly one palace.
 * Throws when a transformed star is not on the chart, which would mean the table and the placed stars disagree.
 */
export function markTransformations(
    palaces: readonly PalaceChart[],
    transformations: readonly BirthYearTransformation[],
): PalaceChart[] {
    const marks = new Map<ZiweiStar, Transformation>(transformations.map((item) => [item.star, item.transformation]));
    const marked = palaces.map((palace) => ({
        ...palace,
        mainStars: palace.mainStars.map((placement) => markStar(placement, marks)),
        auxiliaryStars: palace.auxiliaryStars.map((placement) => markStar(placement, marks)),
    }));
    const landed = marked.flatMap((palace) => [...palace.mainStars, ...palace.auxiliaryStars]).filter((placement) => placement.transformation !== null);

    if (landed.length !== transformations.length) {
        throw new Error(`Expected ${transformations.length} transformed stars on the chart, found ${landed.length}`);
    }

    return marked;
}
