import {
    BRANCHES, BRANCH_ZODIAC, DEFAULT_BAZI_TIME_ZONE,
} from '../../constants/bazi';
import { parseDate } from './dayPillar';
import { solarTermsOfYear } from './solarTerms';

const LICHUN_INDEX = 2;
// The year pillar starts at 立春, and a date alone has no time: noon in Taipei stands for the day
const NOON_TAIPEI_SUFFIX = 'T12:00:00+08:00';
// 甲子 is the year 4 of the common era, and 子 is the first branch
const RAT_YEAR = 4;

/** The BaZi year of a date: the civil year, or the previous one before that year's 立春. */
function baziYearOfDate(isoDate: string): number {
    parseDate(isoDate);

    const civilYear = Number(isoDate.slice(0, 4));
    const lichun = solarTermsOfYear(civilYear)[LICHUN_INDEX];

    if (!lichun) throw new Error(`Missing 立春 for ${civilYear} (${DEFAULT_BAZI_TIME_ZONE})`);

    return new Date(`${isoDate}${NOON_TAIPEI_SUFFIX}`).getTime() < lichun.time.getTime() ? civilYear - 1 : civilYear;
}

/** The Chinese zodiac animal of a birth date, by the BaZi year (it changes at 立春, not on 1 January). */
export function baziZodiacOfDate(isoDate: string): string {
    const index = (((baziYearOfDate(isoDate) - RAT_YEAR) % BRANCHES.length) + BRANCHES.length) % BRANCHES.length;
    const branch = BRANCHES[index];

    if (!branch) throw new Error(`No branch for ${isoDate}`);

    return BRANCH_ZODIAC[branch];
}
