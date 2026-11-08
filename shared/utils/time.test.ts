import {
    describe, expect, it,
} from 'vitest';
import {
    addDays, addMonths, DAY_MS, lastTaipeiDates, taipeiDateKey, taipeiDayStart, taipeiMonthStart,
} from './time';

describe('time utils', () => {
    it('adds days', () => {
        expect(addDays(0, 90)).toBe(90 * DAY_MS);
    });

    it('adds calendar months', () => {
        expect(addMonths(Date.UTC(2026, 0, 15), 3)).toBe(Date.UTC(2026, 3, 15));
    });

    it('clamps to the last day of a shorter month', () => {
        expect(addMonths(Date.UTC(2026, 0, 31), 1)).toBe(Date.UTC(2026, 1, 28));
        expect(addMonths(Date.UTC(2024, 0, 31), 1)).toBe(Date.UTC(2024, 1, 29));
    });

    it('rolls over the year', () => {
        expect(addMonths(Date.UTC(2026, 10, 30), 3)).toBe(Date.UTC(2027, 1, 28));
    });
});

describe('taipeiDateKey', () => {
    it.each([
        ['2026-10-27T15:59:59Z', '2026-10-27'],
        ['2026-10-27T16:00:00Z', '2026-10-28'],
        ['2026-12-31T16:00:00Z', '2027-01-01'],
        ['2026-10-27T00:00:00Z', '2026-10-27'],
    ])('%s is %s in Taipei', (instant, expected) => {
        expect(taipeiDateKey(new Date(instant))).toBe(expected);
    });

    it('starts a Taipei day eight hours before UTC midnight', () => {
        expect(taipeiDayStart('2026-11-08')).toBe(Date.UTC(2026, 10, 7, 16));
    });

    it('lists the last Taipei dates oldest first, switching at midnight in Taipei', () => {
        // 2026-11-08 16:30 UTC is already 2026-11-09 00:30 in Taipei
        const now = Date.UTC(2026, 10, 8, 16, 30);

        expect(lastTaipeiDates(now, 3)).toEqual([
            '2026-11-07',
            '2026-11-08',
            '2026-11-09',
        ]);
    });

    it('starts the Taipei month at the first of the month there', () => {
        // 2026-10-31 17:00 UTC is 2026-11-01 01:00 in Taipei: already November
        expect(taipeiMonthStart(Date.UTC(2026, 9, 31, 17))).toBe(Date.UTC(2026, 9, 31, 16));
        expect(taipeiMonthStart(Date.UTC(2026, 10, 15))).toBe(Date.UTC(2026, 9, 31, 16));
    });
});
