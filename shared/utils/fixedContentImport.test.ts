import {
    describe, expect, it,
} from 'vitest';
import {
    computeCoverage, parseCsvRecords, parseImportCsv, parseImportJson,
} from './fixedContentImport';
import { expectedFixedContentIds } from './fixedContentKeys';

const body = {
    title: '標題',
    summary: '摘要',
    disclaimer: '僅供娛樂與自我探索',
};

describe('parseImportJson', () => {
    it('accepts valid rows and defaults to DRAFT', () => {
        const result = parseImportJson(JSON.stringify([
            {
                contentType: 'ZODIAC', key: 'aries', body,
            },
        ]));

        expect(result.errors).toEqual([]);
        expect(result.rows[0]?.status).toBe('DRAFT');
        expect(result.rows[0]?.body.strengths).toEqual([]);
    });

    it('keeps the deeper layers empty when a row does not have them', () => {
        const result = parseImportJson(JSON.stringify([
            {
                contentType: 'ZODIAC', key: 'aries', body,
            },
        ]));

        expect(result.rows[0]?.body).toMatchObject({
            coreNeeds: null, situations: null, relationshipBlindSpots: [], overuse: [], growthPractice: null,
        });
    });

    it('accepts the deeper layers when they are complete', () => {
        const result = parseImportJson(JSON.stringify([
            {
                contentType: 'ZODIAC',
                key: 'scorpio',
                body: {
                    ...body,
                    strengths: ['洞察力強'],
                    coreNeeds: {
                        pursuit: 'a', securitySource: 'b', deepWorry: 'c', innerConflict: 'd',
                    },
                    overuse: [
                        {
                            strength: '洞察力強', whenOverused: '過度解讀他人',
                        },
                    ],
                },
            },
        ]));

        expect(result.errors).toEqual([]);
        expect(result.rows[0]?.body.coreNeeds?.pursuit).toBe('a');
        expect(result.rows[0]?.body.overuse).toHaveLength(1);
    });

    it('rejects a half-filled group instead of showing a half-empty block', () => {
        const result = parseImportJson(JSON.stringify([
            {
                contentType: 'ZODIAC',
                key: 'aries',
                body: {
                    ...body,
                    situations: { underStress: '獨自分析' },
                },
            },
        ]));

        expect(result.rows).toHaveLength(0);
        expect(result.errors[0]?.message).toContain('body.situations');
    });

    it('needs a "when overused" note for every strength, and no note without a strength', () => {
        const row = (strengths: string[], overuse: Array<{ strength: string; whenOverused: string }>) => parseImportJson(JSON.stringify([
            {
                contentType: 'ZODIAC', key: 'aries', body: {
                    ...body, strengths, overuse,
                },
            },
        ]));
        const note = (strength: string) => ({
            strength, whenOverused: '用得太過',
        });

        expect(row(['A', 'B'], [note('A'), note('B')]).errors).toEqual([]);
        // strengths with no notes at all are fine: the notes are optional as a whole
        expect(row(['A', 'B'], []).errors).toEqual([]);

        const missing = row(['A', 'B'], [note('A')]);
        expect(missing.errors[0]?.message).toContain('B');

        const stray = row(['A'], [note('A'), note('C')]);
        expect(stray.errors[0]?.message).toContain('C');
    });

    it('rejects an illegal key for the type', () => {
        const result = parseImportJson(JSON.stringify([
            {
                contentType: 'BLOOD', key: 'UNKNOWN', body,
            },
        ]));

        expect(result.rows).toHaveLength(0);
        expect(result.errors[0]).toMatchObject({ row: 1 });
        expect(result.errors[0]?.message).toContain('not a legal key');
    });

    it('rejects a body without the disclaimer', () => {
        const result = parseImportJson(JSON.stringify([
            {
                contentType: 'ZODIAC',
                key: 'aries',
                body: {
                    title: 't', summary: 's',
                },
            },
        ]));

        expect(result.errors[0]?.message).toContain('body.disclaimer');
    });

    it('rejects duplicate combinations in one file', () => {
        const row = {
            contentType: 'ZODIAC', key: 'aries', body,
        };
        const result = parseImportJson(JSON.stringify([row, row]));

        expect(result.rows).toHaveLength(1);
        expect(result.errors).toEqual([
            {
                row: 2, message: 'duplicate entry for ZODIAC_aries',
            },
        ]);
    });

    it('reports invalid JSON and non-array input as errors', () => {
        expect(parseImportJson('{nope').errors[0]?.message).toContain('invalid JSON');
        expect(parseImportJson('{}').errors[0]?.message).toContain('array');
    });

    it('keeps valid rows when others fail so the caller can report every error at once', () => {
        const result = parseImportJson(JSON.stringify([
            {
                contentType: 'ZODIAC', key: 'aries', body,
            }, {
                contentType: 'ZODIAC', key: 'nope', body,
            },
        ]));

        expect(result.rows).toHaveLength(1);
        expect(result.errors).toHaveLength(1);
    });
});

describe('CSV', () => {
    it('parses quoted fields, escaped quotes and CRLF', () => {
        expect(parseCsvRecords('a,"b,c","d ""e"""\r\n1,2,3\r\n')).toEqual([
            [
                'a',
                'b,c',
                'd "e"',
            ], [
                '1',
                '2',
                '3',
            ],
        ]);
    });

    it('imports rows and splits list columns on |', () => {
        const csv = ['contentType,key,title,summary,strengths,blindSpots,disclaimer,status', 'MBTI,INTJ,策略家,"摘要, 含逗號",長期規劃|獨立,過度分析,僅供娛樂,PUBLISHED'].join('\n');
        const result = parseImportCsv(csv);

        expect(result.errors).toEqual([]);
        expect(result.rows[0]).toMatchObject({
            contentType: 'MBTI',
            key: 'INTJ',
            status: 'PUBLISHED',
            body: {
                summary: '摘要, 含逗號',
                strengths: ['長期規劃', '獨立'],
                blindSpots: ['過度分析'],
            },
        });
    });

    it('rejects a CSV with missing columns', () => {
        expect(parseImportCsv('contentType,key\nZODIAC,aries').errors[0]?.message).toContain('missing columns');
    });
});

describe('a hexagram reading', () => {
    const reading = (key: string, text: string) => parseImportJson(JSON.stringify([
        {
            contentType: 'HEXAGRAM',
            key,
            body: {
                ...body, summary: text,
            },
        },
    ]));

    it('is accepted when it describes the moment and promises nothing', () => {
        expect(reading('1', '這一刻可能適合先把方向看清楚，再決定下一步。').errors).toEqual([]);
        expect(reading('12_3', '傾向在這個階段多觀察，少下結論。').errors).toEqual([]);
    });

    it('is refused when it gives a verdict of luck, a certainty, clinical wording or money advice', () => {
        for (const text of [
            '今天是大吉的一天',
            '這件事必定成功',
            '注定會失敗',
            '這是憂鬱的徵兆',
            '適合投資股票',
        ]) {
            const result = reading('1', text);

            expect(result.rows, text).toEqual([]);
            expect(result.errors[0]?.message, text).toContain('must not use');
        }
    });

    it('names the words it found', () => {
        expect(reading('1', '大吉，而且必定順利').errors[0]?.message).toContain('大吉、必定');
    });

    it('does not apply to the other content types', () => {
        const result = parseImportJson(JSON.stringify([
            {
                contentType: 'ZODIAC', key: 'aries', body: {
                    ...body, summary: '運氣大吉',
                },
            },
        ]));

        expect(result.errors).toEqual([]);
    });

    it('is refused for a key that is not a hexagram or a line of one', () => {
        expect(reading('65', '這一刻先觀察。').errors).toHaveLength(1);
        expect(reading('1_7', '這一刻先觀察。').errors).toHaveLength(1);
    });
});

describe('computeCoverage', () => {
    const all = expectedFixedContentIds();

    it('is complete when everything is published', () => {
        const report = computeCoverage(all.map((id) => ({
            id, status: 'PUBLISHED',
        })));

        expect(report).toMatchObject({
            expected: 1526, published: 1526, complete: true,
        });
    });

    it('lists missing, unpublished and unexpected documents', () => {
        const docs = all.slice(2).map((id) => ({
            id, status: 'PUBLISHED',
        }));
        docs[0] = {
            id: docs[0]?.id as string, status: 'DRAFT',
        };
        docs.push({
            id: 'ZODIAC_aries_XXXX', status: 'PUBLISHED',
        });

        const report = computeCoverage(docs);

        expect(report.complete).toBe(false);
        expect(report.missing).toEqual(all.slice(0, 2));
        expect(report.unpublished).toHaveLength(1);
        expect(report.unexpected).toEqual(['ZODIAC_aries_XXXX']);
        expect(report.published).toBe(1526 - 2 - 1);
    });
});
