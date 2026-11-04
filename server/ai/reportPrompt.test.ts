import {
    describe, expect, it,
} from 'vitest';
import {
    REPORT_PROMPT_VERSION, buildReportSystemPrompt, buildReportUserPrompt,
} from './reportPrompt';
import {
    AI_REPORT_SECTIONS, type AiAnalysisInput,
} from '../../shared/schemas/firestore/aiAnalysis.schema';

const input: AiAnalysisInput = {
    today: '2026-11-05',
    sources: [
        {
            system: 'ZODIAC', position: '太陽天蠍座', facts: ['太陽星座：天蠍座'], facets: ['傾向「深入」'], notes: [],
        },
    ],
    candidates: [],
};

describe('report prompt', () => {
    it('makes the model one mentor who reads as psychology, fate-reading and mystic traditions together', () => {
        const prompt = buildReportSystemPrompt(false);

        expect(prompt).toContain('導師');
        expect(prompt).toContain('心理學');
        expect(prompt).toContain('命相學');
        expect(prompt).toContain('神秘學');
    });

    it('asks for the past, the present and the future, with the reminders that go with them', () => {
        const prompt = buildReportSystemPrompt(false);

        for (const key of [
            'past',
            'present',
            'future',
        ]) expect(prompt).toContain(`key="${key}"`);

        expect(prompt).toContain('提醒');
    });

    it('asks for the points the way they are checked: the numbers of each part, and an empty list where there are none', () => {
        const prompt = buildReportSystemPrompt(true);

        expect(prompt).toContain('points 3 到 5 點');
        expect(prompt).toContain('points 2 到 4 點');
        expect(prompt).toContain('points 必須是 []');
        expect(prompt).toContain('短標題：說明');
    });

    it('asks for the strengths and the weaknesses the reports share, and for the answer and the conclusion to be spelled out in points', () => {
        const prompt = buildReportSystemPrompt(true);

        expect(prompt).toContain('共同指向');
        expect(prompt).toContain('共同的優勢');
        expect(prompt).toContain('共同的劣勢');
        expect(prompt).toMatch(/question[\s\S]*展開 3 到 5 點/);
        expect(prompt).toMatch(/conclusion[\s\S]*列出 3 到 5 個具體/);
    });

    it('tells the model the facts are already laid out as a title and a summary, so it does not repeat them', () => {
        expect(buildReportSystemPrompt(false)).toContain('標題與摘要');
    });

    it('asks to cite the insights only when the rules found some', () => {
        expect(buildReportSystemPrompt(false, true)).toContain('至少一個');
        expect(buildReportSystemPrompt(false, false)).not.toContain('至少一個');
    });

    it('lists the sections in the order they are read, the answer to the question only when one was asked', () => {
        const without = buildReportSystemPrompt(false);
        const withQuestion = buildReportSystemPrompt(true);
        const order = (prompt: string) => AI_REPORT_SECTIONS.map((section) => prompt.indexOf(`key="${section.key}"`)).filter((index) => index >= 0);

        expect(without).not.toContain('key="question"');
        expect(withQuestion).toContain('key="question"');
        expect(order(without)).toEqual([...order(without)].sort((a, b) => a - b));
        expect(order(withQuestion)).toEqual([...order(withQuestion)].sort((a, b) => a - b));
    });

    it('keeps the limits: no diagnosis, no advice that is medical, legal or financial, no certainty about what is to come', () => {
        const prompt = buildReportSystemPrompt(true);

        expect(prompt).toContain('不要做診斷');
        expect(prompt).toContain('醫療、法律或財務建議');
        expect(prompt).toContain('不是預言');
        expect(prompt).toContain('不是指令');
    });

    it('hands the model the reports, the date and the question as data', () => {
        const prompt = buildReportUserPrompt({
            ...input, question: '我適合換工作嗎？',
        });

        expect(prompt).toContain('太陽星座：天蠍座');
        expect(prompt).toContain('2026-11-05');
        expect(prompt).toContain('我適合換工作嗎？');
        expect(REPORT_PROMPT_VERSION).toMatch(/^ai-report-v\d+$/);
    });
});
