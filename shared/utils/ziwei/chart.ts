import {
    palaceStem,
    bodyPalaceBranch,
    fiveElementBureauOf,
    lifePalaceBranch,
    palaceAtBranch, 
} from './palaces';
import type { BirthMoment } from '../bazi/pillars';
import { borrowedStarsOf } from './borrowed';
import { ziweiHourOf } from './hour';
import { toZiweiLunarDate } from './lunar';
import {
    bodyMasterOf,
    lifeMasterOf,
} from './masters';
import {
    ZIWEI_ALGORITHM_VERSION,
    assertRulesVerified,
} from './rules';
import {
    buildPalaces,
    placeAuxiliaryStars,
    placeMainStars,
    ziweiBranchOf,
} from './stars';
import {
    birthYearTransformationsOf,
    markTransformations,
} from './transformations';
import type { ZiweiChart } from './types';

export class ZiweiMissingBirthTimeError extends Error {
    constructor() {
        super('A birth time is required for a Zi Wei chart');
        this.name = 'ZiweiMissingBirthTimeError';
    }
}

/**
 * The Zi Wei chart for a birth moment, under the fixed rules in `ZIWEI_RULES`. Pure: the same moment and algorithm version
 * always give the same chart. The moment's date and time are the birthplace's standard time, so a late 子 hour keeps its date.
 */
/** Changing what this calculates: raise ZIWEI_ALGORITHM_VERSION in shared/utils/ziwei/rules.ts. */
export function calculateChart(moment: BirthMoment): ZiweiChart {
    assertRulesVerified();

    if (moment.birthTime === null) throw new ZiweiMissingBirthTimeError();

    const lunar = toZiweiLunarDate(moment.birthDate);
    const hour = ziweiHourOf(moment.birthTime);
    const lifeBranch = lifePalaceBranch(lunar.effectiveLunarMonth, hour.hourBranch);
    const bodyBranch = bodyPalaceBranch(lunar.effectiveLunarMonth, hour.hourBranch);
    const bureau = fiveElementBureauOf(palaceStem(lunar.yearStem, lifeBranch), lifeBranch);
    const ziweiBranch = ziweiBranchOf(bureau.number, lunar.lunarDay);
    const birthYearTransformations = birthYearTransformationsOf(lunar.yearStem);
    const palaces = markTransformations(
        buildPalaces(lifeBranch, placeMainStars(ziweiBranch), placeAuxiliaryStars(lunar.effectiveLunarMonth, hour.hourBranch)),
        birthYearTransformations,
    );
    const bodyPalace = palaceAtBranch(bodyBranch, lifeBranch);

    return {
        algorithmVersion: ZIWEI_ALGORITHM_VERSION,
        meta: {
            lunarYearStem: lunar.yearStem,
            lunarYearBranch: lunar.yearBranch,
            lunarDay: lunar.lunarDay,
            isLeapMonth: lunar.isLeapMonth,
            originalLunarMonth: lunar.originalLunarMonth,
            effectiveLunarMonth: lunar.effectiveLunarMonth,
            hourBranch: hour.hourBranch,
        },
        bureau,
        lifeMaster: lifeMasterOf(lifeBranch),
        bodyMaster: bodyMasterOf(lunar.yearBranch),
        ziweiBranch,
        palaces,
        bodyPalace: {
            palace: bodyPalace,
            branch: bodyBranch,
            sameAsLife: bodyBranch === lifeBranch,
        },
        birthYearTransformations,
        hourNotes: hour.notes,
    };
}

export { borrowedStarsOf };
