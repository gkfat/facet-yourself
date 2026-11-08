import {
    describe, expect, it,
} from 'vitest';
import {
    assessAiReport, parseAiAnalysisOutput, specificTerms,
} from './quality';
import {
    AI_REPORT_SECTIONS, aiReportSectionKeys,
} from '../../shared/schemas/firestore/aiAnalysis.schema';

const text = '依你的報告來看，你可能傾向把事情安排得清楚，也容易在雜亂的環境裡感到不自在。';
const ids = ['convergence-order', 'tension-logic-intuition'];

/** The number of points a part is asked for: the most it may have, so that the check has something to count */
const point = (pointText: string, systems: string[] = []) => ({
    text: pointText, systems,
});

const pointsFor = (key: string) => {
    const spec = AI_REPORT_SECTIONS.find((item) => item.key === key);

    return Array.from({ length: spec?.points.min ?? 0 }, (_, index) => point(`重點${index + 1}：這一點說明了一件具體的事情`));
};

const good = (hasQuestion = false, candidateIds: string[] = []) => ({
    sections: aiReportSectionKeys(hasQuestion).map((key) => ({
        key, content: text, points: pointsFor(key), candidateIds: key === 'highlights' ? candidateIds : [],
    })),
});

const codes = (output: ReturnType<typeof good>, hasQuestion = false, candidateIds: string[] = []) => assessAiReport(output, {
    hasQuestion, candidateIds,
}).fatal.map((finding) => finding.code);

describe('assessAiReport', () => {
    it('accepts the sections in order, each with a lead and the points laid down for it', () => {
        expect(codes(good())).toEqual([]);
    });

    it('wants the answer to the question only when a question was asked', () => {
        expect(codes(good(true), true)).toEqual([]);
        expect(codes(good(true), false)).toEqual(['STRUCTURE']);
        expect(codes(good(false), true)).toEqual(['STRUCTURE']);
    });

    it('rejects a missing, repeated or reordered section', () => {
        const missing = { sections: good().sections.slice(1) };
        const reordered = { sections: [...good().sections].reverse() };
        const twice = { sections: [...good().sections, ...good().sections.slice(0, 1)] };

        for (const output of [
            missing,
            reordered,
            twice,
        ]) {
            expect(codes(output)).toEqual(['STRUCTURE']);
        }
    });

    it('rejects a lead that is too short, the wrong number of points, a point that says nothing, diagnosis wording, foretelling of death and a percentage', () => {
        const output = good();
        const section = (key: string) => output.sections.findIndex((item) => item.key === key);
        const set = (key: string, change: object) => {
            const index = section(key);

            output.sections[index] = {
                ...(output.sections[index] as (typeof output.sections)[number]), ...change,
            };
        };

        set('highlights', { content: '太短' });
        set('tradeoffs', { points: [...pointsFor('tradeoffs').slice(0, 2), point('短')] });
        set('past', { points: [] });
        set('summary', { points: [point('總結不該有條列的重點')] });
        set('present', { content: '你可能罹患憂鬱症，所以比較偏好先觀察再行動，也傾向在熟悉的環境裡發揮。' });
        set('future', { content: '從這些來看你可能比較短命，所以要特別珍惜眼前每一段關係，也要留意作息。' });
        set('conclusion', { points: [...pointsFor('conclusion').slice(0, 2), point('你有八成的可能傾向把事情安排得清楚，信心約 80% 左右，也容易感到不自在。')] });

        expect(codes(output).sort()).toEqual([
            'DIAGNOSTIC',
            'FATALISTIC',
            'PERCENT',
            'POINTS',
            'POINTS',
            'POINT_TOO_SHORT',
            'TOO_SHORT',
        ].sort());
    });

    it('holds the points to the same checks as the lead', () => {
        const output = good();

        output.sections[1] = {
            ...(output.sections[1] as (typeof output.sections)[number]),
            points: [point('確診：你可能有一種需要治療的狀態'), ...pointsFor('tradeoffs').slice(1)],
        };

        expect(codes(output)).toEqual(['DIAGNOSTIC']);
    });

    it('only warns about absolute wording', () => {
        const output = good();

        output.sections[0] = {
            ...(output.sections[0] as (typeof output.sections)[number]), content: '你一定會把事情安排得清楚，也容易在雜亂的環境裡感到不自在，這是你的特色。',
        };

        expect(assessAiReport(output, {
            hasQuestion: false, candidateIds: [],
        }).fatal).toEqual([]);
        expect(assessAiReport(output, {
            hasQuestion: false, candidateIds: [],
        }).warnings.map((finding) => finding.code)).toEqual(['OVERCONFIDENT']);
    });

    describe('with insights the rules found across several systems', () => {
        it('accepts a part that picks out what stands out and cites them', () => {
            expect(codes(good(false, [ids[0] as string]), false, ids)).toEqual([]);
        });

        it('rejects the highlights when they cite no insight', () => {
            expect(codes(good(false, []), false, ids)).toEqual(['NO_CITATION']);
        });

        it('rejects a part that cites an insight that does not exist', () => {
            expect(codes(good(false, ['made-up']), false, ids)).toEqual(['UNKNOWN_CITATION']);
            expect(codes(good(false, ['made-up']), false, [])).toEqual(['UNKNOWN_CITATION']);
        });
    });
});

describe('the checks that only count', () => {
    // The other parts of the answer built for the test name "重點", so only the one that is changed can be generic
    const terms = [
        '分析邏輯',
        '直覺',
        '重點',
    ];
    const warningsOf = (output: ReturnType<typeof good>, options: { systems?: string[]; terms?: string[] } = {}) => assessAiReport(output, {
        hasQuestion: false, candidateIds: [], ...options,
    }).warnings.map((finding) => `${finding.code}:${finding.section}`);

    it('warns about a point that names none of the traits or facts, in the parts that are about the member', () => {
        const output = good();
        const index = output.sections.findIndex((item) => item.key === 'tradeoffs');

        output.sections[index] = {
            ...(output.sections[index] as (typeof output.sections)[number]),
            points: [
                point('耐心：這是一個放在任何人身上都成立的優點，也容易被忽略'),
                point('分析邏輯：你的分析邏輯讓事情有依據，用過頭時可能想太多'),
                point('直覺：你的直覺常常是對的，也容易忽略證據'),
            ],
        };

        expect(warningsOf(output, { terms })).toEqual(['GENERIC:tradeoffs']);
        expect(warningsOf(output, { terms: [] })).toEqual([]);
    });

    it('does not count the past, which has the question to check it and not a point about a trait', () => {
        expect(warningsOf(good(), { terms: ['完全不會出現的詞'] }).some((code) => code.endsWith(':past'))).toBe(false);
    });

    it('warns about a point that rests on a system that was not brought, and never fails the report for it', () => {
        const output = good();
        const index = output.sections.findIndex((item) => item.key === 'highlights');

        output.sections[index] = {
            ...(output.sections[index] as (typeof output.sections)[number]),
            points: [
                point('重點一：說明了一件具體的事情', ['MBTI']),
                point('重點二：說明了一件具體的事情', ['TAROT']),
                point('重點三：說明了一件具體的事情'),
            ],
        };

        expect(warningsOf(output, { systems: ['MBTI', 'ZODIAC'] })).toEqual(['UNKNOWN_BASIS:highlights']);
        expect(warningsOf(output, { systems: [] })).toEqual([]);
        expect(assessAiReport(output, {
            hasQuestion: false, candidateIds: [], systems: ['MBTI'],
        }).fatal).toEqual([]);
    });
});

describe('specificTerms', () => {
    const source = {
        system: 'MBTI' as const,
        position: '日主癸水・太弱',
        facts: ['接收資訊：直覺（N），明顯偏向', '日主：癸水'],
        facets: ['從「接收資訊：直覺（N）」來看，你傾向「創新突破」：愛嘗試新做法。', '用得太過時：點子多、完成少。'],
        readings: [],
        interactions: [],
        practices: [],
        notes: [],
    };

    it('takes the names of the traits, the values of the facts without their strength, and the parts of the position', () => {
        const terms = specificTerms({
            today: '2026-11-08', sources: [source], candidates: [],
        });

        expect(terms).toEqual(expect.arrayContaining([
            '創新突破',
            '直覺',
            '癸水',
            '日主癸水',
            '太弱',
        ]));
        // The quoted fact is not a trait, and a single letter says nothing
        expect(terms.some((term) => term.includes('：'))).toBe(false);
        expect(terms).not.toContain('N');
    });
});

describe('parseAiAnalysisOutput', () => {
    it('gives null for an answer that does not fit the shape', () => {
        expect(parseAiAnalysisOutput({ sections: 'nope' })).toBeNull();
        expect(parseAiAnalysisOutput({})).toBeNull();
        expect(parseAiAnalysisOutput({
            sections: [
                {
                    key: 'unknown', content: 'x', points: [], candidateIds: [],
                },
            ],
        })).toBeNull();
        expect(parseAiAnalysisOutput(good())).not.toBeNull();
    });
});
