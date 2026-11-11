import {
    describe, expect, it,
} from 'vitest';
import {
    BRANCHES,
    STEMS,
} from '../../constants/bazi';
import {
    AUXILIARY_STARS,
    BIRTH_YEAR_TRANSFORMATIONS,
    MAIN_STARS,
    PALACES,
} from '../../constants/ziwei';
import type { BirthMoment } from '../bazi/pillars';
import {
    ZiweiMissingBirthTimeError,
    borrowedStarsOf,
    calculateChart,
} from './chart';
import type { ZiweiChart } from './types';

const TAIPEI_OFFSET_MINUTES = 480;

function momentOf(birthDate: string, birthTime: string | null): BirthMoment {
    return {
        birthDate,
        birthTime,
        standardOffsetMinutes: TAIPEI_OFFSET_MINUTES,
        instant: new Date(`${birthDate}T${birthTime ?? '12:00'}:00+08:00`),
    };
}

function chartOf(birthDate: string, birthTime: string): ZiweiChart {
    return calculateChart(momentOf(birthDate, birthTime));
}

function allStars(chart: ZiweiChart): string[] {
    return chart.palaces.flatMap((palace) => [...palace.mainStars, ...palace.auxiliaryStars]).map((placement) => placement.star);
}

describe('calculateChart: input', () => {
    it('requires a birth time', () => {
        expect(() => calculateChart(momentOf('1990-05-17', null))).toThrow(ZiweiMissingBirthTimeError);
    });

    it('gives the same chart for the same input', () => {
        expect(chartOf('1990-05-17', '10:00')).toEqual(chartOf('1990-05-17', '10:00'));
    });
});

describe('calculateChart: structure', () => {
    const chart = chartOf('1990-05-17', '10:00');

    it('has twelve palaces from 命宮 and places each star once', () => {
        expect(chart.palaces.map((palace) => palace.palace)).toEqual([...PALACES]);
        expect(new Set(chart.palaces.map((palace) => palace.branch)).size).toBe(12);
        expect([...allStars(chart)].sort()).toEqual([...MAIN_STARS, ...AUXILIARY_STARS].sort());
    });

    it('records the algorithm version, masters and 紫微 position', () => {
        expect(chart.algorithmVersion).toBe('sanhe-v2');
        expect(chart.lifeMaster).toBeTruthy();
        expect(chart.bodyMaster).toBeTruthy();
        expect(chart.palaces.flatMap((palace) => palace.mainStars).find((item) => item.star === '紫微')).toBeDefined();
        expect(chart.palaces.find((palace) => palace.branch === chart.ziweiBranch)?.mainStars.map((item) => item.star)).toContain('紫微');
    });

    it('marks exactly four stars with the 四化 of the year stem', () => {
        const marks = chart.palaces.flatMap((palace) => [...palace.mainStars, ...palace.auxiliaryStars]).filter((placement) => placement.transformation !== null);

        expect(marks).toHaveLength(4);
    });
});

describe('calculateChart: hours', () => {
    const MIDDLE_OF_BRANCH = [
        '00:00',
        '02:00',
        '04:00',
        '06:00',
        '08:00',
        '10:00',
        '12:00',
        '14:00',
        '16:00',
        '18:00',
        '20:00',
        '22:00',
    ];

    it('uses each of the twelve hours and reaches twelve different life palaces', () => {
        const charts = MIDDLE_OF_BRANCH.map((time) => chartOf('1988-08-08', time));

        expect(charts.map((chart) => chart.meta.hourBranch)).toEqual([...BRANCHES]);
        expect(new Set(charts.map((chart) => chart.palaces[0]?.branch)).size).toBe(12);
    });

    it('puts the body palace in the life palace for the 子 and 午 hours only', () => {
        const sameAsLife = MIDDLE_OF_BRANCH
            .filter((time) => chartOf('1988-08-08', time).bodyPalace.sameAsLife)
            .map((time) => chartOf('1988-08-08', time).meta.hourBranch);

        expect(sameAsLife).toEqual(['子', '午']);
    });

    it('names a different palace for the body when it is not in the life palace', () => {
        const chart = chartOf('1988-08-08', '02:00');

        expect(chart.bodyPalace.sameAsLife).toBe(false);
        expect(chart.bodyPalace.palace).not.toBe('命宮');
        expect(chart.palaces.find((palace) => palace.palace === chart.bodyPalace.palace)?.branch).toBe(chart.bodyPalace.branch);
    });

    it('keeps the late 子 hour on the same date, so it is the same chart as 00:30 apart from the notice', () => {
        const late = chartOf('2001-09-09', '23:30');
        const early = chartOf('2001-09-09', '00:30');

        expect(late.meta.hourBranch).toBe('子');
        expect(late.hourNotes).toContainEqual({ kind: 'LATE_ZI' });
        expect({
            ...late,
            hourNotes: [],
        }).toEqual(early);
    });

    it('warns near an hour boundary', () => {
        expect(chartOf('2001-09-09', '10:50').hourNotes).toEqual([
            {
                kind: 'HOUR_BOUNDARY',
                minutesFromBoundary: 10,
                neighbourBranch: '午',
            },
        ]);
        expect(chartOf('2001-09-09', '10:00').hourNotes).toEqual([]);
    });
});

describe('calculateChart: 五行局 and 四化', () => {
    it('reaches all five bureaus', () => {
        const labels = new Set<string>();

        for (let month = 1; month <= 12; month++) {
            for (const time of [
                '00:00',
                '02:00',
                '04:00',
                '06:00',
                '08:00',
                '10:00',
            ]) {
                labels.add(chartOf(`1990-${String(month).padStart(2, '0')}-20`, time).bureau.label);
            }
        }

        expect(labels).toEqual(new Set([
            '水二局',
            '木三局',
            '金四局',
            '土五局',
            '火六局',
        ]));
    });

    it('uses the 四化 of each of the ten year stems', () => {
        // 1984 is 甲子 and the lunar new year of 1984 is 02-02, so 06-15 falls in each lunar year 1984–1993
        STEMS.forEach((stem, index) => {
            const chart = chartOf(`${1984 + index}-06-15`, '10:00');

            expect(chart.meta.lunarYearStem).toBe(stem);
            expect(chart.birthYearTransformations.map((item) => item.star)).toEqual([...BIRTH_YEAR_TRANSFORMATIONS[stem]]);
        });
    });
});

describe('calculateChart: calendar boundaries', () => {
    it('changes the year at the lunar new year, not at 立春', () => {
        expect(chartOf('1990-01-26', '10:00').meta).toMatchObject({
            lunarYearStem: '己',
            lunarYearBranch: '巳',
        });
        expect(chartOf('1990-01-27', '10:00').meta).toMatchObject({
            lunarYearStem: '庚',
            lunarYearBranch: '午',
        });
    });

    it('keeps the previous year between 立春 and the lunar new year', () => {
        // 立春 2024 is 02-04, the lunar new year is 02-10
        expect(chartOf('2024-02-09', '10:00').meta.lunarYearStem).toBe('癸');
        expect(chartOf('2024-02-10', '10:00').meta.lunarYearStem).toBe('甲');
    });

    it('covers the last day of the lunar year and the first day of the next', () => {
        const last = chartOf('1990-01-26', '10:00');
        const first = chartOf('1990-01-27', '10:00');

        expect(last.meta).toMatchObject({
            originalLunarMonth: 12,
            lunarDay: 30,
        });
        expect(first.meta).toMatchObject({
            originalLunarMonth: 1,
            lunarDay: 1,
        });
    });

    it('splits a leap month at day 15 and records the original and effective months', () => {
        const day15 = chartOf('2020-06-06', '10:00');
        const day16 = chartOf('2020-06-07', '10:00');

        expect(day15.meta).toMatchObject({
            isLeapMonth: true,
            originalLunarMonth: 4,
            effectiveLunarMonth: 4,
            lunarDay: 15,
        });
        expect(day16.meta).toMatchObject({
            isLeapMonth: true,
            originalLunarMonth: 4,
            effectiveLunarMonth: 5,
            lunarDay: 16,
        });
        expect(day15.palaces[0]?.branch).not.toBe(day16.palaces[0]?.branch);
    });
});

describe('borrowedStarsOf', () => {
    function chartWithEmptyPalace(): ZiweiChart {
        for (let day = 1; day <= 28; day++) {
            const chart = chartOf(`1995-03-${String(day).padStart(2, '0')}`, '10:00');

            if (chart.palaces.some((palace) => palace.isEmpty)) return chart;
        }

        throw new Error('No chart with an empty palace found');
    }

    it('returns null for a palace that has main stars', () => {
        const chart = chartOf('1990-05-17', '10:00');
        const filled = chart.palaces.find((palace) => !palace.isEmpty);

        expect(filled).toBeDefined();
        expect(borrowedStarsOf(chart, filled!.palace)).toBeNull();
    });

    it('borrows the main stars of the opposite palace for an empty one and leaves the chart untouched', () => {
        const chart = chartWithEmptyPalace();
        const snapshot = JSON.stringify(chart);
        const empty = chart.palaces.find((palace) => palace.isEmpty)!;
        const borrowed = borrowedStarsOf(chart, empty.palace);
        const opposite = chart.palaces[(PALACES.indexOf(empty.palace) + 6) % 12]!;

        expect(borrowed?.borrowedFromPalace).toBe(opposite.palace);
        expect(borrowed?.borrowedStars.map((item) => item.star)).toEqual(opposite.mainStars.map((item) => item.star));
        expect(JSON.stringify(chart)).toBe(snapshot);
        expect(empty.mainStars).toEqual([]);
    });

    it('never borrows an auxiliary star', () => {
        const chart = chartWithEmptyPalace();
        const empty = chart.palaces.find((palace) => palace.isEmpty)!;
        const stars = borrowedStarsOf(chart, empty.palace)?.borrowedStars.map((item) => item.star) ?? [];

        for (const star of stars) expect(MAIN_STARS).toContain(star);
    });
});
