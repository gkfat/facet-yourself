import {
    BRANCHES,
    type Branch,
} from '../../constants/bazi';
import {
    AUXILIARY_PLACEMENT,
    AUXILIARY_STARS,
    MAIN_STARS,
    PALACES,
    TIANFU_GROUP_OFFSETS,
    TIANFU_MIRROR_AXIS_BRANCH,
    ZIWEI_GROUP_OFFSETS,
    ZIWEI_POSITION_START_BRANCH,
    type AuxiliaryStar,
    type MainStar,
} from '../../constants/ziwei';
import { branchOfPalace } from './palaces';
import type { PalaceChart } from './types';

const MAX_LUNAR_DAY = 30;
const MONTHS_PER_YEAR = 12;

function wrap(index: number): number {
    return ((index % BRANCHES.length) + BRANCHES.length) % BRANCHES.length;
}

function branchAt(index: number): Branch {
    return BRANCHES[wrap(index)] as Branch;
}

/** The branch where 紫微 sits, from the bureau number (2–6) and the lunar day (1–30). */
export function ziweiBranchOf(bureauNumber: number, lunarDay: number): Branch {
    if (!Number.isInteger(lunarDay) || lunarDay < 1 || lunarDay > MAX_LUNAR_DAY) {
        throw new Error(`Invalid lunar day: ${lunarDay}`);
    }

    if (!Number.isInteger(bureauNumber) || bureauNumber < 2 || bureauNumber > 6) {
        throw new Error(`Invalid bureau number: ${bureauNumber}`);
    }

    // The smallest x >= 0 that makes (day + x) a multiple of the bureau number
    const shortfall = (bureauNumber - (lunarDay % bureauNumber)) % bureauNumber;
    const quotient = (lunarDay + shortfall) / bureauNumber;
    const start = BRANCHES.indexOf(ZIWEI_POSITION_START_BRANCH) + (quotient - 1);

    return branchAt(shortfall % 2 === 1 ? start - shortfall : start + shortfall);
}

/** The branch of every main star, from where 紫微 sits. */
export function placeMainStars(ziweiBranch: Branch): Record<MainStar, Branch> {
    const ziwei = BRANCHES.indexOf(ziweiBranch);
    const axis = BRANCHES.indexOf(TIANFU_MIRROR_AXIS_BRANCH);
    const tianfu = (2 * axis) - ziwei;
    const placed = {} as Record<MainStar, Branch>;

    for (const [star, offset] of Object.entries(ZIWEI_GROUP_OFFSETS)) placed[star as MainStar] = branchAt(ziwei + offset);

    for (const [star, offset] of Object.entries(TIANFU_GROUP_OFFSETS)) placed[star as MainStar] = branchAt(tianfu + offset);

    return placed;
}

/** The branch of the four auxiliary stars: 文昌 文曲 by the hour, 左輔 右弼 by the effective lunar month. */
export function placeAuxiliaryStars(effectiveLunarMonth: number, hourBranch: Branch): Record<AuxiliaryStar, Branch> {
    if (!Number.isInteger(effectiveLunarMonth) || effectiveLunarMonth < 1 || effectiveLunarMonth > MONTHS_PER_YEAR) {
        throw new Error(`Invalid lunar month: ${effectiveLunarMonth}`);
    }

    const placed = {} as Record<AuxiliaryStar, Branch>;

    for (const star of AUXILIARY_STARS) {
        const rule = AUXILIARY_PLACEMENT[star];
        const steps = rule.basis === 'hour' ? BRANCHES.indexOf(hourBranch) : effectiveLunarMonth - 1;

        placed[star] = branchAt(BRANCHES.indexOf(rule.startBranch) + (rule.direction * steps));
    }

    return placed;
}

/**
 * The twelve palaces in `PALACES` order from 命宮 with their stars. A palace is empty when it has no main star;
 * auxiliary stars do not count, and nothing is borrowed here. 四化 marks are added separately.
 */
export function buildPalaces(
    lifeBranch: Branch,
    mainStars: Record<MainStar, Branch>,
    auxiliaryStars: Record<AuxiliaryStar, Branch>,
): PalaceChart[] {
    return PALACES.map((palace) => {
        const branch = branchOfPalace(palace, lifeBranch);
        const main = MAIN_STARS.filter((star) => mainStars[star] === branch).map((star) => ({
            star,
            transformation: null,
        }));
        const auxiliary = AUXILIARY_STARS.filter((star) => auxiliaryStars[star] === branch).map((star) => ({
            star,
            transformation: null,
        }));

        return {
            palace,
            branch,
            mainStars: main,
            auxiliaryStars: auxiliary,
            isEmpty: main.length === 0,
        };
    });
}
