import {
    describe, expect, it,
} from 'vitest';
import {
    FORTUNE_HISTORY_MONTHS, FORTUNE_HISTORY_PAGE_DAYS, fortuneHistoryWindowStart,
} from './fortuneHistory';

const at = (iso: string) => Date.parse(iso);

describe('fortuneHistoryWindowStart', () => {
    it('keeps the three months and the page size the spec asks for', () => {
        expect(FORTUNE_HISTORY_MONTHS).toBe(3);
        expect(FORTUNE_HISTORY_PAGE_DAYS).toBe(14);
    });

    it('goes back three calendar months', () => {
        expect(fortuneHistoryWindowStart(at('2026-11-10T04:00:00+08:00'))).toBe('2026-08-10');
    });

    it('clamps the day at the end of a month', () => {
        // 31 May minus three months has no 31 February: it stops at the last day of February
        expect(fortuneHistoryWindowStart(at('2026-05-31T12:00:00+08:00'))).toBe('2026-02-28');
    });

    it('crosses the year', () => {
        expect(fortuneHistoryWindowStart(at('2026-02-15T12:00:00+08:00'))).toBe('2025-11-15');
    });

    it('turns the date over at midnight in Taipei, not in UTC', () => {
        // 01:00 on 11 Nov in Taipei is still 10 Nov in UTC
        expect(fortuneHistoryWindowStart(at('2026-11-11T01:00:00+08:00'))).toBe('2026-08-11');
        expect(fortuneHistoryWindowStart(at('2026-11-10T23:59:00+08:00'))).toBe('2026-08-10');
    });
});
