import {
    describe, expect, it,
} from 'vitest';
import { STEMS } from '../../constants/bazi';
import { LIFE_MASTER_BY_LIFE_BRANCH } from '../../constants/ziwei';
import { calculateChart } from './chart';
import {
    IZTRO_REFERENCE_CHARTS,
    type ReferenceChart,
} from './referenceCharts';

const TAIPEI_OFFSET_MINUTES = 480;

function chartFor(reference: ReferenceChart) {
    const time = `${String(reference.hourIndex * 2).padStart(2, '0')}:00`;

    return calculateChart({
        birthDate: reference.birthDate,
        birthTime: time,
        standardOffsetMinutes: TAIPEI_OFFSET_MINUTES,
        instant: new Date(`${reference.birthDate}T${time}:00+08:00`),
    });
}

/** `天機戌權` → star 天機, branch 戌, mark 權. */
function parseStars(stars: string): Record<string, string> {
    return Object.fromEntries(stars.split(' ').map((token) => [token.slice(0, 2), token.slice(2)]));
}

function starsOf(chart: ReturnType<typeof chartFor>): Record<string, string> {
    return Object.fromEntries(chart.palaces.flatMap((palace) => [...palace.mainStars, ...palace.auxiliaryStars].map((placement) => [placement.star, `${palace.branch}${placement.transformation ?? ''}`])));
}

describe('reference charts recorded from iztro', () => {
    it('has at least ten cases', () => {
        expect(IZTRO_REFERENCE_CHARTS.length).toBeGreaterThanOrEqual(10);
    });

    it('covers every year stem, so every 四化 of the table is checked against a chart', () => {
        const stems = new Set(IZTRO_REFERENCE_CHARTS.map((item) => chartFor(item).meta.lunarYearStem));

        expect([...stems].sort()).toEqual([...STEMS].sort());
    });

    it('has charts where 命主 by the life palace and by the birth-year branch differ, and follows the life palace', () => {
        const differing = IZTRO_REFERENCE_CHARTS.filter((item) => {
            const chart = chartFor(item);

            return LIFE_MASTER_BY_LIFE_BRANCH[chart.meta.lunarYearBranch] !== chart.lifeMaster;
        });

        expect(differing.length).toBeGreaterThanOrEqual(5);

        for (const item of differing) expect(chartFor(item).lifeMaster, item.label).toBe(LIFE_MASTER_BY_LIFE_BRANCH[chartFor(item).palaces[0]!.branch]);
    });

    it('covers all five bureaus', () => {
        expect(new Set(IZTRO_REFERENCE_CHARTS.map((item) => item.bureau)).size).toBe(5);
    });

    it.each(IZTRO_REFERENCE_CHARTS.map((item) => [`${item.birthDate} h${item.hourIndex} ${item.label}`, item] as const))('%s', (_name, reference) => {
        const chart = chartFor(reference);

        expect(chart.bureau.label).toBe(reference.bureau);
        expect(chart.lifeMaster).toBe(reference.lifeMaster);
        expect(chart.bodyMaster).toBe(reference.bodyMaster);
        expect(chart.palaces[0]?.branch).toBe(reference.lifeBranch);
        expect(chart.bodyPalace.branch).toBe(reference.bodyBranch);
        expect(starsOf(chart)).toEqual(parseStars(reference.stars));
    });
});
