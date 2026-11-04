import {
    describe, expect, it,
} from 'vitest';
import {
    assessAiReport, parseAiAnalysisOutput,
} from './quality';
import {
    AI_REPORT_SECTIONS, aiReportSectionKeys,
} from '../../shared/schemas/firestore/aiAnalysis.schema';

const text = '依你的報告來看，你可能傾向把事情安排得清楚，也容易在雜亂的環境裡感到不自在。';
const ids = ['convergence-order', 'tension-logic-intuition'];

/** The number of points a part is asked for: the most it may have, so that the check has something to count */
const pointsFor = (key: string) => {
    const spec = AI_REPORT_SECTIONS.find((item) => item.key === key);

    return Array.from({ length: spec?.points.min ?? 0 }, (_, index) => `重點${index + 1}：這一點說明了一件具體的事情`);
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
        set('positives', { points: pointsFor('positives').slice(0, 1) });
        set('negatives', { points: [...pointsFor('negatives').slice(0, 2), '短'] });
        set('past', { points: ['過去不該有條列的重點'] });
        set('present', { content: '你可能罹患憂鬱症，所以比較偏好先觀察再行動，也傾向在熟悉的環境裡發揮。' });
        set('future', { content: '從這些來看你可能比較短命，所以要特別珍惜眼前每一段關係，也要留意作息。' });
        set('conclusion', { points: [...pointsFor('conclusion').slice(0, 2), '你有八成的可能傾向把事情安排得清楚，信心約 80% 左右，也容易感到不自在。'] });

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
            points: ['確診：你可能有一種需要治療的狀態', ...pointsFor('positives').slice(1)],
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
