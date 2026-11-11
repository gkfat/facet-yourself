import {
    describe, expect, it,
} from 'vitest';
import {
    ZiweiDateError,
    toZiweiLunarDate,
} from './lunar';

describe('toZiweiLunarDate', () => {
    it('changes the year at the lunar new year, not at 立春', () => {
        // 1990-01-26 is 臘月三十 of 己巳; 立春 of 1990 is on 02-04, so BaZi would still say 己巳 on 01-27
        expect(toZiweiLunarDate('1990-01-26')).toMatchObject({
            yearStem: '己',
            yearBranch: '巳',
            originalLunarMonth: 12,
            lunarDay: 30,
        });
        expect(toZiweiLunarDate('1990-01-27')).toMatchObject({
            yearStem: '庚',
            yearBranch: '午',
            originalLunarMonth: 1,
            lunarDay: 1,
        });
    });

    it('keeps the previous lunar year between 立春 and the lunar new year', () => {
        // 立春 2024 is 02-04; the lunar new year is 02-10
        expect(toZiweiLunarDate('2024-02-09')).toMatchObject({
            yearStem: '癸',
            yearBranch: '卯',
        });
        expect(toZiweiLunarDate('2024-02-10')).toMatchObject({
            yearStem: '甲',
            yearBranch: '辰',
        });
    });

    it('leaves an ordinary month unchanged', () => {
        expect(toZiweiLunarDate('2020-05-22')).toMatchObject({
            isLeapMonth: false,
            originalLunarMonth: 4,
            effectiveLunarMonth: 4,
            lunarDay: 30,
        });
    });

    it('counts a leap month through day 15 as the original month', () => {
        // 2020 has a leap 4th month from 05-23 (day 1) to 06-21
        expect(toZiweiLunarDate('2020-05-23')).toMatchObject({
            isLeapMonth: true,
            originalLunarMonth: 4,
            effectiveLunarMonth: 4,
            lunarDay: 1,
        });
        expect(toZiweiLunarDate('2020-06-06')).toMatchObject({
            isLeapMonth: true,
            originalLunarMonth: 4,
            effectiveLunarMonth: 4,
            lunarDay: 15,
        });
    });

    it('counts a leap month from day 16 as the next month', () => {
        expect(toZiweiLunarDate('2020-06-07')).toMatchObject({
            isLeapMonth: true,
            originalLunarMonth: 4,
            effectiveLunarMonth: 5,
            lunarDay: 16,
        });
    });

    it('accepts the first and last supported years', () => {
        expect(() => toZiweiLunarDate('1901-06-15')).not.toThrow();
        expect(() => toZiweiLunarDate('2099-06-15')).not.toThrow();
    });

    it('rejects a year outside the supported range and states the range', () => {
        expect(() => toZiweiLunarDate('1900-06-15')).toThrow(ZiweiDateError);
        expect(() => toZiweiLunarDate('2100-01-01')).toThrow(/1901–2099/);
    });

    it('rejects a malformed or non-existent date', () => {
        expect(() => toZiweiLunarDate('2023-2-3')).toThrow(ZiweiDateError);
        expect(() => toZiweiLunarDate('2023-02-30')).toThrow(/does not exist/);
        expect(() => toZiweiLunarDate('2023-13-01')).toThrow(ZiweiDateError);
    });

    it('records the one known disagreement with the Hong Kong Observatory table', () => {
        // HKO starts lunar month 9 of 2057 on 09-28; the library starts it on 09-29 (2057 is a forecast year).
        // This pins the library's current answer so a version bump that changes it is noticed.
        expect(toZiweiLunarDate('2057-09-28')).toMatchObject({
            originalLunarMonth: 8,
            lunarDay: 30,
        });
        expect(toZiweiLunarDate('2057-09-29')).toMatchObject({
            originalLunarMonth: 9,
            lunarDay: 1,
        });
    });

    it('is deterministic', () => {
        expect(toZiweiLunarDate('1995-08-17')).toEqual(toZiweiLunarDate('1995-08-17'));
    });
});
