import { readFileSync } from 'node:fs';
import {
    describe, expect, it,
} from 'vitest';
import { ZiweiService } from '../../../server/services/ziwei.service';
import { reportSnapshotContentSchema } from '../../schemas/firestore/reportSnapshot.schema';
import { parseImportJson } from '../../utils/fixedContentImport';
import { ziweiReadingKeys } from '../../utils/ziwei/readings';
import {
    ZIWEI_DISCLAIMER, findForbiddenZiweiWords,
} from '../../utils/ziweiWording';
import { assembleSingleReport } from '../assembleSingleReport';
import {
    ZIWEI_EMPTY_LIFE_NOTE, ZIWEI_LATE_ZI_NOTE, ZIWEI_LEAP_NOTE, ZIWEI_SCOPE_NOTE, ziweiHourNoteText, ziweiReportInput,
} from './ziwei';

const rows = parseImportJson(readFileSync(new URL('../../../content/fixed/ziwei.json', import.meta.url), 'utf8')).rows;
const bodies = new Map(rows.map((row) => [row.key, row.body]));
const content = (key: string) => bodies.get(key);

function reportOf(birthDate: string, birthTime: string, birthPlace: string | null = 'tw-taipei') {
    const chart = new ZiweiService().calculate({
        birthDate, birthTime, birthPlace,
    });

    return {
        chart, input: ziweiReportInput({
            chart, content, birthDate, birthTime, birthPlace,
        }),
    };
}

/** A birth date and hour whose life palace has no main star, found by searching: the chart decides, not the test. */
function emptyLifePalace() {
    for (let day = 1; day <= 28; day++) {
        for (const time of [
            '00:30',
            '04:00',
            '08:00',
            '12:00',
            '16:00',
            '20:00',
        ]) {
            const date = `1995-03-${String(day).padStart(2, '0')}`;
            const made = reportOf(date, time);

            if (made.chart.palaces[0]?.isEmpty) return made;
        }
    }

    throw new Error('No chart with an empty life palace found');
}

describe('ziweiReportInput', () => {
    const {
        chart, input, 
    } = reportOf('1990-05-17', '10:00');

    it('is a Zi Wei report with the position, the facts and the fixed disclaimer', () => {
        expect(input.system).toBe('ZIWEI');
        expect(input.position).toContain('命宮');
        expect(input.position).toContain(chart.bureau.label);
        expect(input.disclaimer).toBe(ZIWEI_DISCLAIMER);
    });

    it('shows the chart as facts: birth moment, bureau, life and body palace, masters and the four 四化', () => {
        // The auxiliary stars of a palace are a card of their own, only when it has any
        expect(input.facts.map((fact) => fact.label).filter((label) => !label.endsWith('輔星'))).toEqual([
            '農曆生辰',
            '五行局',
            '命宮',
            '身宮',
            '命主',
            '身主',
            '化祿',
            '化權',
            '化科',
            '化忌',
        ]);
    });

    it('puts each 四化 on a short card of its own, with the star and the palace that star is in', () => {
        expect(input.facts.some((fact) => fact.label === '生年四化')).toBe(false);

        for (const mark of chart.birthYearTransformations) {
            const fact = input.facts.find((item) => item.label === `化${mark.transformation}`);
            const palace = chart.palaces.find((item) => [...item.mainStars, ...item.auxiliaryStars].some((placement) => placement.star === mark.star));

            expect(fact?.value, mark.transformation).toContain(mark.star);
            expect(fact?.value, mark.transformation).toContain(palace?.palace.replace(/宮$/, '') ?? '?');
        }
    });

    it('keeps the main stars and the auxiliary stars of a palace on separate cards', () => {
        const withAuxiliary = reportOf('2020-06-07', '10:00');
        const lifeFact = input.facts.find((fact) => fact.label === '命宮');

        expect(lifeFact?.value).not.toContain('輔星');

        for (const label of ['命宮輔星', '身宮輔星']) {
            const fact = withAuxiliary.input.facts.find((item) => item.label === label);

            if (fact) expect(fact.terms?.every((item) => item.term.startsWith('ziwei:aux:'))).toBe(true);
        }
    });

    it('keeps every fact to a line or two: the twelve palaces are in the chart above, not repeated as one long card', () => {
        for (const fact of input.facts) {
            expect(fact.value.split('\n').length, fact.label).toBe(1);
            expect(fact.value.length, fact.label).toBeLessThanOrEqual(60);
        }
    });

    it('states what the first version leaves out, the rules and the version it was laid out by', () => {
        expect(input.notes).toContain(ZIWEI_SCOPE_NOTE);
        expect(input.notes?.some((note) => note.includes(chart.algorithmVersion) && note.includes('農曆正月初一換年'))).toBe(true);
    });

    it('reads the traits only from stars that are facts on the screen', () => {
        const grounded = new Set(input.facts.flatMap((fact) => [...(fact.term ? [fact.term] : []), ...(fact.terms ?? []).map((item) => item.term)]));

        expect(input.traits.length).toBeGreaterThan(0);
        for (const term of input.traits) expect(grounded.has(term), term).toBe(true);
    });

    it('takes traits from the life and body palaces only, not from the other stars every chart has', () => {
        const shown = new Set(chart.palaces
            .filter((palace) => palace.palace === '命宮' || palace.palace === chart.bodyPalace.palace)
            .flatMap((palace) => palace.mainStars.map((placement) => `ziwei:star:${placement.star}`)));
        const starTraits = input.traits.filter((term) => term.startsWith('ziwei:star:'));

        expect([...starTraits].sort()).toEqual([...shown].sort());
        expect(starTraits.length).toBeLessThan(14);
    });

    it('opens the overview with a short verdict before the first colon, which is what the banner shows', () => {
        const lead = input.interpretations[0];

        expect(lead).toMatchObject({
            title: '命宮解讀', overview: true,
        });

        const verdict = lead?.text.slice(0, lead.text.indexOf('：')) ?? '';

        expect(verdict.length).toBeGreaterThan(0);
        expect(verdict.length).toBeLessThanOrEqual(20);
        expect(verdict).not.toContain('。');
        expect(verdict).not.toContain('命宮在');
    });

    it('keeps the overview to the verdict, the strengths and what to watch', () => {
        const overview = input.interpretations.filter((reading) => reading.overview);

        expect(overview.map((reading) => reading.title)).toEqual([
            '命宮解讀',
            '可能的優勢',
            '可以多留意的',
        ]);
    });

    it('lays the rest of the reading out as small cards, each with a title that says what it is', () => {
        const cards = input.interpretations.filter((reading) => !reading.overview);

        expect(cards.length).toBeGreaterThan(0);
        for (const card of cards) {
            expect(card.group, card.title).toMatch(/^(命宮|身宮)解讀$/);
            expect(card.title, card.title).not.toContain('：');
            expect(card.text.length, card.title).toBeLessThanOrEqual(260);
        }

        expect(cards.some((card) => card.title === '命宮的意義')).toBe(true);
    });

    it('does not repeat a sentence across the cards and the overview', () => {
        const texts = input.interpretations.flatMap((reading) => reading.text.split('\n'));

        expect(new Set(texts).size).toBe(texts.length);
    });

    it('records the basis it was calculated from, with the algorithm version', () => {
        expect(input.basis).toHaveLength(1);
        expect(input.basis[0]).toMatchObject({
            system: 'ZIWEI',
            ruleVersion: chart.algorithmVersion,
            inputs: {
                birthDate: '1990-05-17', birthTime: '10:00', birthPlace: 'tw-taipei',
            },
        });
    });

    it('is the same report for the same chart', () => {
        expect(assembleSingleReport(reportOf('1990-05-17', '10:00').input)).toEqual(assembleSingleReport(input));
    });

    it('is accepted as a report to keep', () => {
        expect(reportSnapshotContentSchema.safeParse(assembleSingleReport(input)).success).toBe(true);
    });

    it('needs only the readings the chart needs, and no more', () => {
        const needed = new Set(ziweiReadingKeys(chart));
        const limited = (key: string) => (needed.has(key) ? content(key) : undefined);

        expect(() => ziweiReportInput({
            chart, content: limited, birthDate: '1990-05-17', birthTime: '10:00', birthPlace: 'tw-taipei',
        })).not.toThrow();
        expect(needed.size).toBeLessThan(34);
    });

    it('uses no forbidden word in what the adapter hands to the report', () => {
        const text = JSON.stringify({
            facts: input.facts, interpretations: input.interpretations, advice: input.advice, notes: input.notes, position: input.position,
        });

        expect(findForbiddenZiweiWords(text.replace(ZIWEI_SCOPE_NOTE, ''))).toEqual([]);
    });
});

describe('ziweiReportInput for the cases a chart can be in', () => {
    it('keeps an empty life palace empty, says so, and reads no trait from a borrowed star', () => {
        const {
            chart, input, 
        } = emptyLifePalace();
        const opposite = chart.palaces[6]!;
        const own = new Set(chart.palaces
            .filter((palace) => palace.palace === '命宮' || palace.palace === chart.bodyPalace.palace)
            .flatMap((palace) => palace.mainStars.map((placement) => placement.star)));
        const borrowedOnly = opposite.mainStars.map((placement) => placement.star).filter((star) => !own.has(star));

        expect(input.position).toContain('空宮');
        expect(input.notes).toContain(ZIWEI_EMPTY_LIFE_NOTE);
        expect(input.facts.find((fact) => fact.label === '命宮')?.value).toContain('空宮（無主星）');
        for (const star of borrowedOnly) expect(input.traits, star).not.toContain(`ziwei:star:${star}`);
        expect(input.interpretations[0]?.text.startsWith('命宮是空宮：')).toBe(true);
        expect(input.interpretations.find((reading) => reading.title === '借星參考')?.text).toContain('借星，不是命宮自己的星曜');
    });

    it('marks a birth in a leap month and notes how it was counted', () => {
        const { input } = reportOf('2020-06-07', '10:00');

        expect(input.notes).toContain(ZIWEI_LEAP_NOTE);
        expect(input.facts[0]?.value).toContain('閏4月16日');
        expect(input.facts[0]?.value).toContain('排盤以 5 月計');
    });

    it('does not mark an ordinary month as a leap month', () => {
        expect(reportOf('1990-05-17', '10:00').input.notes).not.toContain(ZIWEI_LEAP_NOTE);
    });

    it('notes the late 子 hour', () => {
        expect(reportOf('2001-09-09', '23:30').input.notes).toContain(ZIWEI_LATE_ZI_NOTE);
    });

    it('notes a birth near an hour boundary and names the neighbouring hour', () => {
        const note = reportOf('2001-09-09', '10:50').input.notes?.find((item) => item.includes('時辰交界'));

        expect(note).toContain('10 分鐘');
        expect(note).toContain('午時');
    });

    it('says when no birth place was given and Taipei was assumed', () => {
        expect(reportOf('1990-05-17', '10:00', null).input.notes?.some((note) => note.includes('Asia/Taipei'))).toBe(true);
        expect(reportOf('1990-05-17', '10:00').input.notes?.some((note) => note.includes('沒有出生城市'))).toBe(false);
    });

    it('does not list the same palace twice when the body is in the life palace', () => {
        const {
            input, chart, 
        } = reportOf('1990-05-17', '00:30');

        expect(chart.bodyPalace.sameAsLife).toBe(true);
        expect(input.facts.find((fact) => fact.label === '身宮')?.value).toContain('與命宮同宮');
        expect(input.facts.find((fact) => fact.label === '身宮')?.terms).toBeUndefined();
    });
});

describe('ziweiHourNoteText', () => {
    it('words the late 子 hour and a birth near the edge of an hour', () => {
        expect(ziweiHourNoteText({ kind: 'LATE_ZI' })).toBe(ZIWEI_LATE_ZI_NOTE);
        expect(ziweiHourNoteText({
            kind: 'HOUR_BOUNDARY', minutesFromBoundary: 7, neighbourBranch: '午',
        })).toBe('出生時間距時辰交界只有 7 分鐘，時辰也可能是午時，命盤可能因此不同。');
    });
});
