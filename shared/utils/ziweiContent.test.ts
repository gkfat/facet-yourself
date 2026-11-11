import { readFileSync } from 'node:fs';
import {
    describe, expect, it,
} from 'vitest';
import { ziweiContentKeys } from '../constants/ziwei';
import {
    importRowSchema, parseImportJson,
} from './fixedContentImport';
import {
    ZIWEI_DISCLAIMER, findForbiddenZiweiWords,
} from './ziweiWording';

const text = readFileSync(new URL('../../content/fixed/ziwei.json', import.meta.url), 'utf8');
const parsed = parseImportJson(text);

describe('content/fixed/ziwei.json', () => {
    it('passes the import checks without a single error', () => {
        expect(parsed.errors).toEqual([]);
        expect(parsed.rows).toHaveLength(34);
    });

    it('has exactly the 34 keys, each once', () => {
        const keys = parsed.rows.map((row) => row.key);

        expect(new Set(keys).size).toBe(34);
        expect([...keys].sort()).toEqual([...ziweiContentKeys()].sort());
    });

    it('is only Zi Wei content', () => {
        for (const row of parsed.rows) expect(row.contentType).toBe('ZIWEI');
    });

    it('begins every reading with the fixed disclaimer, and adds a reminder only for the health palace', () => {
        for (const row of parsed.rows) expect(row.body.disclaimer.startsWith(ZIWEI_DISCLAIMER), row.key).toBe(true);

        const extended = parsed.rows.filter((row) => row.body.disclaimer !== ZIWEI_DISCLAIMER).map((row) => row.key);

        expect(extended).toEqual(['palace_疾厄']);
    });

    it('records where every reading comes from, apart for the chart rules and the interpretation', () => {
        for (const row of parsed.rows) {
            expect(row.provenance?.algorithmSource, row.key).toMatch(/sanhe-v\d/);
            expect(row.provenance?.interpretationSource, row.key).toContain('自撰');
            expect(row.provenance?.algorithmSource).not.toBe(row.provenance?.interpretationSource);
        }
    });

    it('is honest about its origin and its review: drafted with an AI, then reviewed and published by GK', () => {
        for (const row of parsed.rows) {
            expect(row.provenance?.authoring, row.key).toBe('AI_DRAFT');
            expect(row.provenance?.reviewedBy, row.key).toBe('GK');
            expect(row.status, row.key).toBe('PUBLISHED');
        }
    });

    it('gives every star three strengths and at least one thing to watch', () => {
        for (const row of parsed.rows.filter((item) => item.key.startsWith('star_') || item.key.startsWith('aux_'))) {
            expect(row.body.strengths, row.key).toHaveLength(3);
            expect(row.body.blindSpots.length, row.key).toBeGreaterThanOrEqual(1);
        }
    });

    it('describes 化忌 as something hard to let go of and worth watching, not as bad news', () => {
        const ji = parsed.rows.find((row) => row.key === 'transformation_忌');

        expect(ji?.body.summary).toContain('放不下');
        expect(ji?.body.summary).toContain('預告');
        expect(JSON.stringify(ji?.body.growthAdvice)).toContain('留意');
    });

    it('uses no forbidden word anywhere outside the fixed disclaimer', () => {
        for (const row of parsed.rows) {
            const written = {
                ...row.body,
                disclaimer: '',
            };

            expect(findForbiddenZiweiWords(JSON.stringify(written)), row.key).toEqual([]);
        }
    });

    it('would be rejected if its reviewer were removed', () => {
        const row = parsed.rows[0];
        const result = importRowSchema.safeParse({
            ...row,
            provenance: {
                ...row?.provenance, reviewedBy: null,
            },
        });

        expect(result.success).toBe(false);
    });

    it('has no star by palace content', () => {
        for (const row of parsed.rows) expect(row.key.split('_')).toHaveLength(2);
    });
});
