import {
    describe, expect, it,
} from 'vitest';
import {
    importRowSchema, parseImportJson,
} from './fixedContentImport';
import { ZIWEI_DISCLAIMER } from './ziweiWording';

const provenance = {
    algorithmSource: 'sanhe-v1；與 iztro 2.6.5 對照',
    interpretationSource: '自撰，依星曜傳統性質的關鍵詞改寫',
    authoring: 'AI_DRAFT',
    reviewedBy: null,
};

function row(overrides: Record<string, unknown> = {}) {
    return {
        contentType: 'ZIWEI',
        key: 'star_紫微',
        status: 'DRAFT',
        body: {
            title: '紫微：把事情放在大局裡看',
            summary: '你可能傾向從整體來看事情，也願意承擔責任。',
            strengths: ['有全局觀'],
            blindSpots: ['可能不太願意示弱'],
            disclaimer: '象徵性解讀，非科學測量；內容適合自我探索，不代表必然發生的事件',
        },
        provenance,
        ...overrides,
    };
}

function issuePaths(input: unknown): string[] {
    const result = importRowSchema.safeParse(input);

    return result.success ? [] : result.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`);
}

describe('importing Zi Wei readings', () => {
    it('accepts a draft that records its origin', () => {
        expect(issuePaths(row())).toEqual([]);
    });

    it('rejects a key outside the 34 keys', () => {
        expect(issuePaths(row({ key: 'star_祿存' })).join()).toContain('not a legal key');
        expect(issuePaths(row({ key: 'star_紫微_命宮' })).join()).toContain('not a legal key');
    });

    it('rejects a forbidden word and points at the body', () => {
        const issues = issuePaths(row({
            body: {
                ...row().body, summary: '你可能傾向大凶的局面。',
            },
        }));

        expect(issues.join()).toContain('body');
        expect(issues.join()).toContain('大凶');
    });

    it('rejects a reading that does not speak of tendencies', () => {
        const issues = issuePaths(row({
            body: {
                ...row().body, summary: '你很有領導力。', strengths: ['有全局觀'], blindSpots: ['不示弱'],
            },
        }));

        expect(issues.join()).toContain('tendencies');
    });

    it('rejects 化忌 that is a calamity and accepts it as something to watch', () => {
        const body = {
            ...row().body, title: '化忌：放不下的地方',
        };

        expect(issuePaths(row({
            key: 'transformation_忌',
            body: {
                ...body, summary: '可能放不下，是災難的預兆。',
            },
        })).join()).toContain('災難');
        expect(issuePaths(row({
            key: 'transformation_忌',
            body: {
                ...body, summary: '你可能傾向在這件事上放不下，值得多留意自己的反應。',
            },
        }))).toEqual([]);
    });

    it('requires the disclaimer to begin with the fixed sentence, even though it says 必然', () => {
        const issues = issuePaths(row({
            body: {
                ...row().body, disclaimer: '僅供娛樂與自我探索',
            },
        }));

        expect(issues.join()).toContain('disclaimer');
        expect(issuePaths(row())).toEqual([]);
    });

    it('lets a reading add a reminder after the fixed sentence, as long as the reminder keeps to the wording rules', () => {
        const withReminder = (reminder: string) => row({
            body: {
                ...row().body, disclaimer: `${ZIWEI_DISCLAIMER}。${reminder}`,
            },
        });

        expect(issuePaths(withReminder('身體不適或健康疑慮，請尋求合格醫療專業人員評估。'))).toEqual([]);
        expect(issuePaths(withReminder('這可以用來診斷疾病。')).join()).toContain('診斷');
    });

    it('rejects a reading without its provenance', () => {
        expect(issuePaths(row({ provenance: undefined })).join()).toContain('provenance');
    });

    it('rejects a provenance with an empty source', () => {
        expect(issuePaths(row({
            provenance: {
                ...provenance, interpretationSource: '  ',
            },
        })).join()).toContain('interpretationSource');
    });

    it('does not let an unreviewed reading be reviewed or published', () => {
        expect(issuePaths(row({ status: 'REVIEWED' })).join()).toContain('reviewedBy');
        expect(issuePaths(row({ status: 'PUBLISHED' })).join()).toContain('reviewedBy');
    });

    it('accepts a reviewed reading that names its reviewer', () => {
        expect(issuePaths(row({
            status: 'PUBLISHED',
            provenance: {
                ...provenance, reviewedBy: '內容編輯',
            },
        }))).toEqual([]);
    });

    it('does not ask other content types for a provenance', () => {
        expect(issuePaths({
            contentType: 'ZODIAC',
            key: 'aries',
            status: 'DRAFT',
            body: {
                title: '牡羊座', summary: '直率。', disclaimer: '僅供娛樂與自我探索',
            },
        })).toEqual([]);
    });

    it('reports the failing row of a file', () => {
        const parsed = parseImportJson(JSON.stringify([
            row(), row({
                key: 'star_紫微', provenance: undefined, 
            }),
        ]));

        expect(parsed.rows).toHaveLength(1);
        expect(parsed.errors).toHaveLength(1);
        expect(parsed.errors[0]?.row).toBe(2);
    });
});
