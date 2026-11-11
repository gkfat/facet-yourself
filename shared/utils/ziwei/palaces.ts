import {
    BRANCHES,
    STEMS,
    TIGER_MONTH_START_STEM,
    type Branch,
    type Stem,
} from '../../constants/bazi';
import {
    BUREAU_BRANCH_NUMBER,
    BUREAU_BY_REMAINDER,
    BUREAU_STEM_NUMBER,
    PALACES,
    PALACE_ARRANGEMENT,
    type Palace,
} from '../../constants/ziwei';
import type { FiveElementBureau } from './types';

const MONTHS_PER_YEAR = 12;
const BUREAU_CYCLE = 5;

function wrap(index: number): number {
    return ((index % BRANCHES.length) + BRANCHES.length) % BRANCHES.length;
}

function branchAt(index: number): Branch {
    return BRANCHES[wrap(index)] as Branch;
}

function monthPosition(effectiveLunarMonth: number): number {
    if (!Number.isInteger(effectiveLunarMonth) || effectiveLunarMonth < 1 || effectiveLunarMonth > MONTHS_PER_YEAR) {
        throw new Error(`Invalid lunar month: ${effectiveLunarMonth}`);
    }

    return BRANCHES.indexOf(PALACE_ARRANGEMENT.monthOneBranch) + (effectiveLunarMonth - 1);
}

/** 命宮: from the birth month's position, count backward by the hour (子 hour = 0). */
export function lifePalaceBranch(effectiveLunarMonth: number, hourBranch: Branch): Branch {
    return branchAt(monthPosition(effectiveLunarMonth) + (PALACE_ARRANGEMENT.lifeDirection * BRANCHES.indexOf(hourBranch)));
}

/** 身宮: from the birth month's position, count forward by the hour (子 hour = 0). */
export function bodyPalaceBranch(effectiveLunarMonth: number, hourBranch: Branch): Branch {
    return branchAt(monthPosition(effectiveLunarMonth) + (PALACE_ARRANGEMENT.bodyDirection * BRANCHES.indexOf(hourBranch)));
}

/** The palace that sits at a branch, given where 命宮 is; the palaces run counter-clockwise (branch-descending) from 命宮. */
export function palaceAtBranch(branch: Branch, lifeBranch: Branch): Palace {
    return PALACES[wrap(BRANCHES.indexOf(lifeBranch) - BRANCHES.indexOf(branch))] as Palace;
}

/** The branch where a palace sits, given where 命宮 is. */
export function branchOfPalace(palace: Palace, lifeBranch: Branch): Branch {
    return branchAt(BRANCHES.indexOf(lifeBranch) - PALACES.indexOf(palace));
}

/** The stem of a palace's branch by 五虎遁 from the birth-year stem (the 寅 palace takes the first stem). */
export function palaceStem(yearStem: Stem, branch: Branch): Stem {
    const yinStem = TIGER_MONTH_START_STEM[STEMS.indexOf(yearStem) % BUREAU_CYCLE] as Stem;
    const stepsFromYin = wrap(BRANCHES.indexOf(branch) - BRANCHES.indexOf('寅'));

    return STEMS[(STEMS.indexOf(yinStem) + stepsFromYin) % STEMS.length] as Stem;
}

/** 五行局 from the 命宮's stem and branch. */
export function fiveElementBureauOf(lifeStem: Stem, lifeBranch: Branch): FiveElementBureau {
    let remainder = BUREAU_STEM_NUMBER[lifeStem] + BUREAU_BRANCH_NUMBER[lifeBranch];

    while (remainder > BUREAU_CYCLE) remainder -= BUREAU_CYCLE;

    const bureau = BUREAU_BY_REMAINDER[remainder];

    if (!bureau) throw new Error(`No 五行局 for ${lifeStem}${lifeBranch}`);

    return bureau;
}
