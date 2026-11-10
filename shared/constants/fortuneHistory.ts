import {
    addMonths, taipeiDateKey,
} from '../utils/time';

/** How far back the history reaches, in calendar months (the same as how long the draws are kept). */
export const FORTUNE_HISTORY_MONTHS = 3;

/** How many dates one page of the history holds at most. */
export const FORTUNE_HISTORY_PAGE_DAYS = 14;

/** The most casts of the window that are read; more than this are cut off and the answer says so (`truncated`). */
export const FORTUNE_HISTORY_HEXAGRAM_READ_LIMIT = 1000;

/** The first Taipei date (`YYYY-MM-DD`) the history shows when `now` is the current time. */
export function fortuneHistoryWindowStart(now: number): string {
    return taipeiDateKey(new Date(addMonths(now, -FORTUNE_HISTORY_MONTHS)));
}
