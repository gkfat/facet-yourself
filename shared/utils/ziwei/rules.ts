import {
    BIRTH_YEAR_TRANSFORMATIONS_SOURCE,
    BODY_MASTER_SOURCE,
    FIVE_ELEMENT_BUREAU_SOURCE,
    HOUR_AUXILIARY_SOURCE,
    LIFE_MASTER_SOURCE,
    MAIN_STAR_PLACEMENT_SOURCE,
    MONTH_AUXILIARY_SOURCE,
    PALACE_ARRANGEMENT_SOURCE,
    ZIWEI_POSITION_SOURCE,
    type RuleVerification,
} from '../../constants/ziwei';

/** Raise this whenever the algorithm or any table in `shared/constants/ziwei.ts` changes. */
export const ZIWEI_ALGORITHM_VERSION = 'sanhe-v2';

/** The fixed rule choices; the chart page states them, and a future school option only needs to extend this. */
export const ZIWEI_RULES = {
    /** 三合 system. */
    school: 'SANHE',
    /** The year changes at the lunar new year (正月初一), not at 立春 as in BaZi. */
    yearBoundary: 'LUNAR_NEW_YEAR',
    /** A leap month's 1st–15th days count as the original month, the 16th day onward as the next month. */
    leapMonth: 'SPLIT_AT_DAY_15',
    /** 23:00–24:00 keeps the same lunar day, with the 子 hour branch (same as the BaZi day pillar). */
    lateZiHour: 'SAME_DAY',
    /** Standard time of the birthplace (daylight saving removed), no true solar time. */
    timeBasis: 'STANDARD_TIME',
} as const;

/** Birth years the lunar calendar library is verified for (checked against the Hong Kong Observatory tables). */
export const ZIWEI_SUPPORTED_YEARS = {
    first: 1901,
    last: 2099,
} as const;

/** A birth this close to an hour boundary shows the borderline notice. */
export const ZIWEI_BORDERLINE_MINUTES = 15;

export type ZiweiRuleName =
    | 'birthYearTransformations'
    | 'lifeMaster'
    | 'bodyMaster'
    | 'hourAuxiliaryStars'
    | 'monthAuxiliaryStars'
    | 'palaceArrangement'
    | 'fiveElementBureau'
    | 'ziweiPosition'
    | 'mainStarPlacement';

export const ZIWEI_RULE_VERIFICATIONS: Readonly<Record<ZiweiRuleName, RuleVerification>> = {
    birthYearTransformations: BIRTH_YEAR_TRANSFORMATIONS_SOURCE,
    lifeMaster: LIFE_MASTER_SOURCE,
    bodyMaster: BODY_MASTER_SOURCE,
    hourAuxiliaryStars: HOUR_AUXILIARY_SOURCE,
    monthAuxiliaryStars: MONTH_AUXILIARY_SOURCE,
    palaceArrangement: PALACE_ARRANGEMENT_SOURCE,
    fiveElementBureau: FIVE_ELEMENT_BUREAU_SOURCE,
    ziweiPosition: ZIWEI_POSITION_SOURCE,
    mainStarPlacement: MAIN_STAR_PLACEMENT_SOURCE,
};

export class UnverifiedRulesError extends Error {
    readonly rules: ZiweiRuleName[];

    constructor(rules: ZiweiRuleName[]) {
        super(`Zi Wei rule tables are not verified against a source: ${rules.join(', ')}`);
        this.name = 'UnverifiedRulesError';
        this.rules = rules;
    }
}

export function unverifiedRules(
    verifications: Readonly<Record<ZiweiRuleName, RuleVerification>> = ZIWEI_RULE_VERIFICATIONS,
): ZiweiRuleName[] {
    return (Object.keys(verifications) as ZiweiRuleName[]).filter((name) => verifications[name].status !== 'verified');
}

/** The production chart flow calls this first, so a draft table can never be used silently. */
export function assertRulesVerified(
    verifications: Readonly<Record<ZiweiRuleName, RuleVerification>> = ZIWEI_RULE_VERIFICATIONS,
): void {
    const pendingRules = unverifiedRules(verifications);

    if (pendingRules.length > 0) throw new UnverifiedRulesError(pendingRules);
}
