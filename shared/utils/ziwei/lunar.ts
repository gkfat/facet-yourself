import { Solar } from 'lunar-typescript';
import {
    BRANCHES,
    STEMS,
    type Branch,
    type Stem,
} from '../../constants/bazi';
import { ZIWEI_SUPPORTED_YEARS } from './rules';

export type ZiweiLunarDate = {
    yearStem: Stem;
    yearBranch: Branch;
    /** The lunar month number the date falls in on the calendar (1–12), whether or not it is a leap month. */
    originalLunarMonth: number;
    lunarDay: number;
    isLeapMonth: boolean;
    /** The month used to place the chart: a leap month's 16th day onward counts as the next month. */
    effectiveLunarMonth: number;
};

export class ZiweiDateError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'ZiweiDateError';
    }
}

const DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;
const MONTHS_PER_YEAR = 12;
/** A leap month's days after this one count toward the next month. */
const LEAP_MONTH_SPLIT_DAY = 15;

function parseCalendarDate(birthDate: string): [number, number, number] {
    const match = DATE_PATTERN.exec(birthDate);

    if (!match) throw new ZiweiDateError(`Invalid birth date: ${birthDate}`);

    const year = Number(match[1]);
    const month = Number(match[2]);
    const day = Number(match[3]);
    const check = new Date(Date.UTC(year, month - 1, day));

    // The lunar library rolls an impossible date (e.g. 2023-02-30) forward instead of rejecting it
    if (
        check.getUTCFullYear() !== year
        || check.getUTCMonth() !== month - 1
        || check.getUTCDate() !== day
    ) {
        throw new ZiweiDateError(`Birth date does not exist: ${birthDate}`);
    }

    return [
        year,
        month,
        day,
    ];
}

function yearPillarFromLabel(label: string): [Stem, Branch] {
    const stem = STEMS.find((item) => item === label[0]);
    const branch = BRANCHES.find((item) => item === label[1]);

    if (!stem || !branch) throw new Error(`Unexpected lunar year pillar: ${label}`);

    return [stem, branch];
}

/**
 * The lunar date a Zi Wei chart is placed from. The civil date is the birthplace's standard-time date, so a late 子 hour
 * keeps the same date. The year changes at the lunar new year (not at 立春 as in BaZi), and the leap month is split
 * at day 15.
 */
export function toZiweiLunarDate(birthDate: string): ZiweiLunarDate {
    const [
        year,
        month,
        day,
    ] = parseCalendarDate(birthDate);

    if (year < ZIWEI_SUPPORTED_YEARS.first || year > ZIWEI_SUPPORTED_YEARS.last) {
        throw new ZiweiDateError(
            `Birth year ${year} is outside the supported range ${ZIWEI_SUPPORTED_YEARS.first}–${ZIWEI_SUPPORTED_YEARS.last}`,
        );
    }

    const lunar = Solar.fromYmd(year, month, day).getLunar();
    // The library gives a leap month as a negative month number
    const signedMonth = lunar.getMonth();
    const isLeapMonth = signedMonth < 0;
    const originalLunarMonth = Math.abs(signedMonth);
    const lunarDay = lunar.getDay();
    const shiftsToNextMonth = isLeapMonth && lunarDay > LEAP_MONTH_SPLIT_DAY;
    const [yearStem, yearBranch] = yearPillarFromLabel(lunar.getYearInGanZhi());

    return {
        yearStem,
        yearBranch,
        originalLunarMonth,
        lunarDay,
        isLeapMonth,
        effectiveLunarMonth: shiftsToNextMonth ? (originalLunarMonth % MONTHS_PER_YEAR) + 1 : originalLunarMonth,
    };
}
