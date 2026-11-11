import { readFileSync } from 'node:fs';
import {
    describe, expect, it,
} from 'vitest';
import {
    MAIN_STARS, PALACES,
} from '../../constants/ziwei';
import { parseImportJson } from '../fixedContentImport';
import {
    findForbiddenZiweiWords, findZiweiWordingIssues,
} from '../ziweiWording';
import { calculateChart } from './chart';
import {
    ZiweiContentMissingError,
    composeBodyPalaceReading,
    composeLifePalaceReading,
    type ZiweiContentLookup,
} from './readings';
import type { ZiweiChart } from './types';

const parsed = parseImportJson(readFileSync(new URL('../../../content/fixed/ziwei.json', import.meta.url), 'utf8'));
const bodies = new Map(parsed.rows.map((row) => [row.key, row.body]));
const content: ZiweiContentLookup = (key) => bodies.get(key);

function chartOf(birthDate: string, birthTime: string): ZiweiChart {
    return calculateChart({
        birthDate,
        birthTime,
        standardOffsetMinutes: 480,
        instant: new Date(`${birthDate}T${birthTime}:00+08:00`),
    });
}

/** Charts over a spread of dates and all twelve hours, so the checks below meet empty palaces, borrowed stars and every 四化. */
function sampleCharts(): ZiweiChart[] {
    const charts: ZiweiChart[] = [];
    const hours = [
        '00:30',
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

    for (let year = 1950; year <= 2020; year += 5) {
        hours.forEach((time, index) => charts.push(chartOf(`${year}-${String((index % 12) + 1).padStart(2, '0')}-18`, time)));
    }

    return charts;
}

const charts = sampleCharts();
const lifePalaceIsEmpty = (chart: ZiweiChart) => chart.palaces[0]?.isEmpty === true;

describe('composeLifePalaceReading', () => {
    it('opens with the palace and its meaning, then reads the main stars that are in it', () => {
        const chart = charts.find((item) => !lifePalaceIsEmpty(item) && item.palaces[0]!.mainStars.length === 1)!;
        const star = chart.palaces[0]!.mainStars[0]!.star;
        const reading = composeLifePalaceReading(chart, content);

        expect(reading.kind).toBe('LIFE');
        expect(reading.sentences[0]?.text).toContain(`命宮在${chart.palaces[0]!.branch}宮`);
        expect(reading.sentences[0]?.text).toContain(bodies.get('palace_命宮')!.summary);
        expect(reading.sentences.some((sentence) => sentence.text.includes(`命宮有${star}：`))).toBe(true);
        expect(reading.sentences.some((sentence) => sentence.text.includes(bodies.get(`star_${star}`)!.summary))).toBe(true);
        expect(reading.borrowed).toBeNull();
    });

    it('ends with the advice of the palace', () => {
        const reading = composeLifePalaceReading(charts[0]!, content);

        expect(reading.sentences.at(-1)?.text).toBe(bodies.get('palace_命宮')!.growthAdvice);
    });

    it('says a palace without a main star is empty and that what follows is borrowed from the opposite palace', () => {
        const chart = charts.find((item) => lifePalaceIsEmpty(item) && item.palaces[6]!.mainStars.length > 0)!;
        const reading = composeLifePalaceReading(chart, content);
        const text = reading.sentences.map((sentence) => sentence.text).join('\n');
        const opposite = chart.palaces[6]!;

        expect(reading.borrowed?.borrowedFromPalace).toBe('遷移');
        expect(text).toContain('命宮沒有主星');
        expect(text).toContain('借星，不是命宮自己的星曜');
        for (const placement of opposite.mainStars) expect(text).toContain(placement.star);
        // The borrowed stars are never said to sit in the life palace
        for (const placement of opposite.mainStars) expect(text).not.toContain(`命宮有${placement.star}`);
    });

    it('does not borrow an auxiliary star or write the borrowed stars into the chart', () => {
        const chart = charts.find((item) => lifePalaceIsEmpty(item) && item.palaces[6]!.mainStars.length > 0)!;
        const snapshot = JSON.stringify(chart);
        const reading = composeLifePalaceReading(chart, content);

        for (const placement of reading.borrowed?.borrowedStars ?? []) expect(MAIN_STARS).toContain(placement.star);
        expect(JSON.stringify(chart)).toBe(snapshot);
        expect(chart.palaces[0]?.mainStars).toEqual([]);
    });

    it('says so when the opposite palace is empty too, and borrows nothing', () => {
        const chart = charts.find((item) => lifePalaceIsEmpty(item) && item.palaces[6]!.isEmpty);

        // Not every sample has both empty; the rule is checked when one does
        if (!chart) return;

        const text = composeLifePalaceReading(chart, content).sentences.map((sentence) => sentence.text).join('\n');

        expect(text).toContain('沒有可以借用的星曜');
    });

    it('reads the auxiliary stars and the 四化 that are in the palace', () => {
        const chart = charts.find((item) => item.palaces[0]!.auxiliaryStars.length > 0)!;
        const reading = composeLifePalaceReading(chart, content);

        for (const placement of chart.palaces[0]!.auxiliaryStars) {
            expect(reading.sentences.some((sentence) => sentence.contentKeys.includes(`aux_${placement.star}`))).toBe(true);
        }

        const marked = charts.find((item) => [...item.palaces[0]!.mainStars, ...item.palaces[0]!.auxiliaryStars].some((placement) => placement.transformation !== null))!;
        const markedReading = composeLifePalaceReading(marked, content);

        expect(markedReading.sentences.some((sentence) => sentence.contentKeys.some((key) => key.startsWith('transformation_')))).toBe(true);
    });

    it('is the same for the same chart', () => {
        const chart = charts[3]!;

        expect(composeLifePalaceReading(chart, content)).toEqual(composeLifePalaceReading(chart, content));
    });

    it('throws a clear error when a reading it needs is missing, instead of leaving a gap', () => {
        const without: ZiweiContentLookup = (key) => (key === 'palace_命宮' ? undefined : content(key));

        expect(() => composeLifePalaceReading(charts[0]!, without)).toThrow(ZiweiContentMissingError);
        expect(() => composeLifePalaceReading(charts[0]!, without)).toThrow(/palace_命宮/);
    });
});

describe('composeBodyPalaceReading', () => {
    it('only says so when the body palace is the life palace, and does not repeat the life reading', () => {
        const chart = charts.find((item) => item.bodyPalace.sameAsLife)!;
        const body = composeBodyPalaceReading(chart, content);
        const life = composeLifePalaceReading(chart, content);

        expect(body.sentences).toHaveLength(1);
        expect(body.sentences[0]?.text).toContain('身宮與命宮同在');
        for (const sentence of body.sentences) expect(life.sentences.map((item) => item.text)).not.toContain(sentence.text);
    });

    it('reads the palace the body sits in, with its own stars, when it is another palace', () => {
        const chart = charts.find((item) => !item.bodyPalace.sameAsLife && !item.palaces.find((p) => p.palace === item.bodyPalace.palace)!.isEmpty)!;
        const reading = composeBodyPalaceReading(chart, content);
        const palace = chart.bodyPalace.palace;

        expect(reading.kind).toBe('BODY');
        expect(reading.palace).toBe(palace);
        expect(reading.sentences[0]?.text).toContain(`身宮落在${palace}`);
        expect(reading.sentences[0]?.text).toContain(bodies.get(`palace_${palace}`)!.summary);
        expect(reading.sentences.some((sentence) => sentence.text.includes(`${palace}有`))).toBe(true);
    });

    it('marks borrowed stars for a body palace that is empty, naming that palace', () => {
        const chart = charts.find((item) => !item.bodyPalace.sameAsLife && item.palaces.find((p) => p.palace === item.bodyPalace.palace)!.isEmpty);

        if (!chart) return;

        const reading = composeBodyPalaceReading(chart, content);
        const text = reading.sentences.map((sentence) => sentence.text).join('\n');

        expect(text).toContain(`${chart.bodyPalace.palace}沒有主星`);
        expect(text).toContain(`借星，不是${chart.bodyPalace.palace}自己的星曜`);
    });
});

describe('every composed reading', () => {
    const readings = charts.flatMap((chart) => [composeLifePalaceReading(chart, content), composeBodyPalaceReading(chart, content)]);

    it('covers empty palaces and every palace the body can sit in', () => {
        expect(charts.some(lifePalaceIsEmpty)).toBe(true);
        // The body palace is the month position plus the hour and the life palace is the month position minus it,
        // so the two are an even number of palaces apart: the body only ever sits in these six palaces
        expect(new Set(readings.filter((reading) => reading.kind === 'BODY').map((reading) => reading.palace))).toEqual(new Set([
            '命宮',
            '夫妻',
            '財帛',
            '遷移',
            '官祿',
            '福德',
        ]));
        expect(PALACES.length).toBe(12);
    });

    it('has no sentence twice and no empty or broken sentence', () => {
        for (const reading of readings) {
            const texts = reading.sentences.map((sentence) => sentence.text);

            expect(new Set(texts).size, reading.palace).toBe(texts.length);
            for (const text of texts) {
                expect(text.trim().length).toBeGreaterThan(0);
                expect(text).not.toMatch(/undefined|null|\[object/);
            }
        }
    });

    it('traces every sentence to fixed content that exists', () => {
        for (const reading of readings) {
            for (const sentence of reading.sentences) {
                expect(sentence.contentKeys.length).toBeGreaterThan(0);
                for (const key of sentence.contentKeys) expect(bodies.has(key), key).toBe(true);
            }
        }
    });

    it('keeps to the wording rules: no verdicts anywhere, and tentative wherever it reads the fixed content', () => {
        for (const reading of readings) {
            const text = reading.sentences.map((sentence) => sentence.text).join('\n');

            expect(findForbiddenZiweiWords(text), `${reading.kind} ${reading.palace}`).toEqual([]);

            // The one-line note that the body palace is the life palace says nothing about a person, so it has no tendency to state
            if (reading.sentences.length > 1) expect(findZiweiWordingIssues('palace_命宮', text), `${reading.kind} ${reading.palace}`).toEqual([]);
        }
    });
});
