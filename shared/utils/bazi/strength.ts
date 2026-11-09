import {
    ELEMENTS,
    ELEMENT_CONTROLS,
    ELEMENT_GENERATES,
    HIDDEN_STEMS,
    HIDDEN_STEM_SHARES,
    PATTERN_OF_TEN_GOD,
    STRENGTH_BOUNDS,
    STRENGTH_WEIGHTS,
    TEN_GOD_GROUPS,
    TEN_GOD_GROUP_OF,
    type Branch,
    type Element,
    type ElementPhase,
    type PatternKey,
    type Stem,
    type StrengthLevel,
    type TenGod,
    type TenGodGroup,
} from '../../constants/bazi';
import {
    tenGodOf, type HiddenStemRole, type PillarPosition,
} from './analysis';
import { elementPowerOf } from './elementPower';
import {
    branchElement,
    mainHiddenStem,
    stemElement,
} from './ganzhi';
import type { FourPillars } from './pillars';

export type SupportPart = {
    /** Which character the score came from, e.g. 'monthBranch'. */
    source: keyof typeof STRENGTH_WEIGHTS;
    weight: number;
    /** Share of this character that supports the day master, in tenths (0 to 10). */
    tenths: number;
    points: number;
};

export type StrengthSide = 'STRONG' | 'WEAK' | 'BALANCED';

/** A hidden stem of the month branch that also stands as a heavenly stem of the year, the month or the hour (透干). */
export type RevealedStem = {
    stem: Stem;
    role: HiddenStemRole;
    tenGod: TenGod;
    positions: PillarPosition[];
};

/**
 * 用神, 喜神, 忌神, 仇神 and 閒神 as ten-god groups, worked out from the power of the five elements: the camp the day
 * master needs is the one that helps it (比劫, 印) when it is weak and the one that spends it (食傷, 財, 官殺) when it
 * is strong; of that camp the groups lacking power are 用神 and 喜神, of the other the groups holding too much are 忌神.
 */
export type UsefulSet = {
    /** 用神: the group of the helpful camp that lacks the most */
    useful: TenGodGroup;
    /** 喜神: the other lacking groups of the helpful camp, from the one lacking most (none, one or two) */
    favorable: TenGodGroup[];
    /** 忌神: the groups of the other camp holding more than an even share, from the lightest (never empty) */
    avoid: TenGodGroup[];
    /** 仇神: the groups that feed an avoided group (and are not themselves 用神, 喜神 or 忌神) */
    rival: TenGodGroup[];
    /** 閒神: the groups left over */
    idle: TenGodGroup[];
};

export type StrengthResult = {
    /** Support score from 0 to 100 (scaled to 100 when the hour is unknown). */
    score: number;
    level: StrengthLevel;
    side: StrengthSide;
    parts: SupportPart[];
    /** Strength of each element by the month's element (旺相休囚死). */
    phases: Record<Element, ElementPhase>;
    pattern: {
        key: PatternKey;
        /** The ten god of the month branch's main-qi stem. */
        tenGod: TenGod;
        group: TenGodGroup;
        /** The hidden stems of the month branch that show above in the year, month or hour stems, in main, middle, residual order */
        revealed: RevealedStem[];
    };
    /** 用神, 喜神, 忌神, 仇神 and 閒神 as ten-god groups; null when the chart is balanced. */
    useful: UsefulSet | null;
};

/** Support comes from the day master's own element (比劫) and the element that generates it (印). */
function supportElements(dayElement: Element): readonly Element[] {
    const generator = ELEMENTS.find((element) => ELEMENT_GENERATES[element] === dayElement) as Element;

    return [dayElement, generator];
}

export const FULL_SHARE = 10;

export function stemShare(stem: Stem, support: readonly Element[]): number {
    return support.includes(stemElement(stem)) ? FULL_SHARE : 0;
}

/** Tenths of a branch's hidden stems that support the day master, weighting main : middle : residual. */
export function branchShare(branch: Branch, support: readonly Element[]): number {
    const hidden = HIDDEN_STEMS[branch];
    const shares = HIDDEN_STEM_SHARES[hidden.length as 1 | 2 | 3];

    return hidden.reduce((total, stem, index) => total + (support.includes(stemElement(stem)) ? (shares[index] as number) : 0), 0);
}

export function strengthLevelOf(score: number): StrengthLevel {
    return STRENGTH_BOUNDS.find(([bound]) => score >= bound)?.[1] ?? 'taiwei';
}

function sideOf(level: StrengthLevel): StrengthSide {
    if (level === 'taiwang' || level === 'strong') return 'STRONG';
    if (level === 'balanced') return 'BALANCED';

    return 'WEAK';
}

/** 旺 for the month's own element, 相 for what it generates, 休 for what generates it, 囚 for what controls it, 死 for what it controls. */
export function elementPhases(monthElement: Element): Record<Element, ElementPhase> {
    const phases = {} as Record<Element, ElementPhase>;

    for (const element of ELEMENTS) {
        if (element === monthElement) phases[element] = '旺';
        else if (ELEMENT_GENERATES[monthElement] === element) phases[element] = '相';
        else if (ELEMENT_GENERATES[element] === monthElement) phases[element] = '休';
        else if (ELEMENT_CONTROLS[element] === monthElement) phases[element] = '囚';
        else phases[element] = '死';
    }

    return phases;
}

const HIDDEN_ROLES: readonly HiddenStemRole[] = [
    'MAIN',
    'MIDDLE',
    'RESIDUAL',
];

/** The month branch's hidden stems that also show as the year, month or hour stem (the day stem is the day master itself). */
function revealedStems(pillars: FourPillars): RevealedStem[] {
    const shown: Array<[PillarPosition, Stem]> = [['year', pillars.year.stem], ['month', pillars.month.stem]];

    if (pillars.hour) shown.push(['hour', pillars.hour.stem]);

    return HIDDEN_STEMS[pillars.month.branch].flatMap((stem, index) => {
        const positions = shown.filter(([, shownStem]) => shownStem === stem).map(([position]) => position);

        if (positions.length === 0) return [];

        return [
            {
                stem,
                role: HIDDEN_ROLES[index] as HiddenStemRole,
                tenGod: tenGodOf(pillars.day.stem, stem),
                positions,
            },
        ];
    });
}

/** The element a ten-god group stands for, for a day master of the given element. */
function groupElement(dayElement: Element, group: TenGodGroup): Element {
    if (group === 'peer') return dayElement;
    if (group === 'output') return ELEMENT_GENERATES[dayElement];
    if (group === 'wealth') return ELEMENT_CONTROLS[dayElement];

    // 印 is the element that generates the day master; 官殺 the one that controls it
    const relation = group === 'resource' ? ELEMENT_GENERATES : ELEMENT_CONTROLS;

    return ELEMENTS.find((element) => relation[element] === dayElement) as Element;
}

const HELPING_GROUPS: readonly TenGodGroup[] = ['peer', 'resource'];

/**
 * 喜用神 from the power of the elements. An element is lacking below an even share (a fifth of the whole) and holding too
 * much above it. When none of the helpful camp lacks power, its lightest group is still 用神; when none of the other camp
 * holds too much, its heaviest group is still 忌神.
 */
export function usefulSetOf(dayElement: Element, side: Exclude<StrengthSide, 'BALANCED'>, power: Record<Element, number>): UsefulSet {
    const evenShare = ELEMENTS.reduce((sum, element) => sum + power[element], 0) / ELEMENTS.length;
    const weightOf = (group: TenGodGroup) => power[groupElement(dayElement, group)];
    const byWeight = (groups: readonly TenGodGroup[]) => [...groups].sort((a, b) => weightOf(a) - weightOf(b));
    const helping = TEN_GOD_GROUPS.filter((group) => HELPING_GROUPS.includes(group));
    const spending = TEN_GOD_GROUPS.filter((group) => !HELPING_GROUPS.includes(group));
    const [good, bad] = side === 'WEAK' ? [helping, spending] : [spending, helping];

    const sortedGood = byWeight(good);
    const lacking = sortedGood.filter((group) => weightOf(group) < evenShare);
    const [useful, ...favorable] = lacking.length > 0 ? lacking : [sortedGood[0] as TenGodGroup];

    const sortedBad = byWeight(bad);
    const heavy = sortedBad.filter((group) => weightOf(group) > evenShare);
    const avoid = heavy.length > 0 ? heavy : [sortedBad[sortedBad.length - 1] as TenGodGroup];

    const taken = new Set<TenGodGroup>([
        useful as TenGodGroup,
        ...favorable,
        ...avoid,
    ]);
    const avoidElements = avoid.map((group) => groupElement(dayElement, group));
    const rival = TEN_GOD_GROUPS.filter((group) => !taken.has(group) && avoidElements.some((element) => ELEMENT_GENERATES[groupElement(dayElement, group)] === element));
    const idle = TEN_GOD_GROUPS.filter((group) => !taken.has(group) && !rival.includes(group));

    return {
        useful: useful as TenGodGroup, favorable, avoid, rival, idle,
    };
}

/** Day master strength, month-branch pattern, element phases and useful gods under the fixed published rules. */
export function analyzeStrength(pillars: FourPillars): StrengthResult {
    const dayStem = pillars.day.stem;
    const support = supportElements(stemElement(dayStem));
    const sources: Array<[keyof typeof STRENGTH_WEIGHTS, number]> = [
        ['yearStem', stemShare(pillars.year.stem, support)],
        ['monthStem', stemShare(pillars.month.stem, support)],
        ['yearBranch', branchShare(pillars.year.branch, support)],
        ['monthBranch', branchShare(pillars.month.branch, support)],
        ['dayBranch', branchShare(pillars.day.branch, support)],
    ];

    if (pillars.hour) {
        sources.push(['hourStem', stemShare(pillars.hour.stem, support)], ['hourBranch', branchShare(pillars.hour.branch, support)]);
    }

    const parts = sources.map(([source, tenths]): SupportPart => ({
        source,
        weight: STRENGTH_WEIGHTS[source],
        tenths,
        points: (STRENGTH_WEIGHTS[source] * tenths) / FULL_SHARE,
    }));
    const present = parts.reduce((total, part) => total + part.weight, 0);
    const weighted = parts.reduce((total, part) => total + part.weight * part.tenths, 0);
    // weight x tenths summed over the present characters, scaled to 100 (a divisor of 100 when the hour is known)
    const score = (weighted * FULL_SHARE) / present;
    const level = strengthLevelOf(score);
    const side = sideOf(level);
    const tenGod = tenGodOf(dayStem, mainHiddenStem(pillars.month.branch));
    const group = TEN_GOD_GROUP_OF[tenGod];

    return {
        score: Math.round(score * 10) / 10,
        level,
        side,
        parts,
        phases: elementPhases(branchElement(pillars.month.branch)),
        pattern: {
            key: PATTERN_OF_TEN_GOD[tenGod],
            tenGod,
            group,
            revealed: revealedStems(pillars),
        },
        useful: side === 'BALANCED' ? null : usefulSetOf(stemElement(dayStem), side, elementPowerOf(pillars)),
    };
}
