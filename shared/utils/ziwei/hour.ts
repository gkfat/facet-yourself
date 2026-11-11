import {
    BRANCHES,
    type Branch,
} from '../../constants/bazi';
import { ZIWEI_BORDERLINE_MINUTES } from './rules';

export type HourNote =
    | {
        /** 23:00–24:00: the hour branch is 子 but the lunar day stays the same; schools differ on this. */
        kind: 'LATE_ZI';
    }
    | {
        /** The birth is within a few minutes of an hour boundary, so the hour branch may be the neighbouring one. */
        kind: 'HOUR_BOUNDARY';
        minutesFromBoundary: number;
        neighbourBranch: Branch;
    };

export type ZiweiHour = {
    hourBranch: Branch;
    notes: HourNote[];
};

export class ZiweiTimeError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'ZiweiTimeError';
    }
}

const TIME_PATTERN = /^(\d{2}):(\d{2})$/;
const MINUTES_PER_HOUR = 60;
const MINUTES_PER_DAY = 24 * MINUTES_PER_HOUR;
/** Each branch covers two clock hours; 子 starts at 23:00. */
const MINUTES_PER_BRANCH = 2 * MINUTES_PER_HOUR;
const BRANCH_START_OFFSET = MINUTES_PER_HOUR;
const LATE_ZI_START = 23 * MINUTES_PER_HOUR;

function parseMinutes(birthTime: string): number {
    const match = TIME_PATTERN.exec(birthTime);

    if (!match) throw new ZiweiTimeError(`Invalid birth time: ${birthTime}`);

    const hours = Number(match[1]);
    const minutes = Number(match[2]);

    if (hours > 23 || minutes > 59) throw new ZiweiTimeError(`Invalid birth time: ${birthTime}`);

    return (hours * MINUTES_PER_HOUR) + minutes;
}

function branchAt(index: number): Branch {
    return BRANCHES[((index % BRANCHES.length) + BRANCHES.length) % BRANCHES.length] as Branch;
}

/**
 * The hour branch of a standard-time clock reading, plus the notices that apply. The branch changes at every odd hour
 * (23:00 子, 01:00 丑, …). A late 子 hour (23:00–24:00) keeps its date, so only a notice is attached, no date shift.
 */
export function ziweiHourOf(birthTime: string): ZiweiHour {
    const minutes = parseMinutes(birthTime);
    // Minutes since 23:00, wrapped so that 子 starts at 0
    const sinceZiStart = (minutes + BRANCH_START_OFFSET) % MINUTES_PER_DAY;
    const branchIndex = Math.floor(sinceZiStart / MINUTES_PER_BRANCH);
    const notes: HourNote[] = [];

    if (minutes >= LATE_ZI_START) notes.push({ kind: 'LATE_ZI' });

    const intoBranch = sinceZiStart % MINUTES_PER_BRANCH;
    const untilNext = MINUTES_PER_BRANCH - intoBranch;

    if (intoBranch <= ZIWEI_BORDERLINE_MINUTES) {
        notes.push({
            kind: 'HOUR_BOUNDARY',
            minutesFromBoundary: intoBranch,
            neighbourBranch: branchAt(branchIndex - 1),
        });
    } else if (untilNext <= ZIWEI_BORDERLINE_MINUTES) {
        notes.push({
            kind: 'HOUR_BOUNDARY',
            minutesFromBoundary: untilNext,
            neighbourBranch: branchAt(branchIndex + 1),
        });
    }

    return {
        hourBranch: branchAt(branchIndex),
        notes,
    };
}
