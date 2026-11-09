import { readFileSync } from 'node:fs';
import {
    describe, expect, it,
} from 'vitest';
import {
    ASSERTION_WORDS, FORBIDDEN_ADVICE_WORDS,
} from '../ontology/fragments/fragments';
import { importRowSchema } from './fixedContentImport';
import { baziContentKeys } from './fixedContentKeys';

type Row = {
    key: string;
    status: string;
    body: {
        title: string; summary: string; strengths: string[]; blindSpots: string[]; growthAdvice: string; disclaimer: string;
    };
};

const rows = JSON.parse(readFileSync(new URL('../../content/fixed/bazi.json', import.meta.url), 'utf8')) as Row[];
/** The readings written for the seasonal climate, the reveal, the rival and idle gods and the life aspects */
const NEW_FAMILIES = /^(reveal|rival|idle|climate|life|useful)_/;
const HEDGE_WORDS = [
    '可能',
    '傾向',
    '也許',
    '或許',
    '容易',
    '不一定',
];
const PREDICTION_WORDS = [
    '發財',
    '財運',
    '婚姻幸福',
    '壽命',
    '破財',
    '一生',
];

const textOf = (row: Row) => [
    row.body.title,
    row.body.summary,
    ...row.body.strengths,
    ...row.body.blindSpots,
    row.body.growthAdvice,
].join('\n');

describe('content/fixed/bazi.json', () => {
    it('has a row for every BaZi content key, and no other', () => {
        expect(rows.map((row) => row.key).sort()).toEqual([...baziContentKeys()].sort());
    });

    it('is valid for the import schema', () => {
        for (const row of rows) {
            const parsed = importRowSchema.safeParse({
                contentType: 'BAZI', key: row.key, status: row.status, body: row.body,
            });

            expect(parsed.success, row.key).toBe(true);
        }
    });

    it('uses no medical, legal or financial wording and states nothing as certain', () => {
        for (const row of rows) {
            for (const word of [...FORBIDDEN_ADVICE_WORDS, ...ASSERTION_WORDS]) expect(textOf(row), `${row.key}: ${word}`).not.toContain(word);
        }
    });

    it('speaks of tendencies in the new readings and predicts nothing', () => {
        for (const row of rows.filter((item) => NEW_FAMILIES.test(item.key))) {
            expect(HEDGE_WORDS.some((word) => row.body.summary.includes(word)), `${row.key}: summary has no hedge`).toBe(true);
            for (const word of PREDICTION_WORDS) expect(textOf(row), `${row.key}: ${word}`).not.toContain(word);
            expect(row.body.disclaimer, row.key).toContain('不預測吉凶');
        }
    });
});
