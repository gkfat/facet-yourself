// Plain `.ts` import specifiers: this file is also run directly by Node
// (type stripping) from scripts/, where extensionless imports do not resolve.
import { z } from 'zod';
import { keywordRule } from '../ontology/mappings/keywordRule.ts';
import type { ReportFact } from '../report/types.ts';
import { buildAssessmentBasis } from '../utils/assessmentBasis.ts';
import { scoreDimensions } from './scoring.ts';
import {
    defineScaleAssessment, type ScaleDimensionInfo, type ScaleItem,
} from './types.ts';

/** Carries `ref`: the 24 items are our own design after the two dimensions of closeness, not validated and not any existing scale */
export const ATTACHMENT_VERSION = 'attachment-style-ref-v1';

export const ATTACHMENT_DIMENSIONS = ['anxiety', 'avoidance'] as const;

export type AttachmentDimension = typeof ATTACHMENT_DIMENSIONS[number];

const LEVELS = [
    'low',
    'mid',
    'high',
] as const;

/** The four quadrants of the two dimensions, by neutral names: a description of a pattern, never a label for a person */
export const ATTACHMENT_QUADRANTS = [
    'steady',
    'close',
    'independent',
    'torn',
] as const;

export type AttachmentQuadrant = typeof ATTACHMENT_QUADRANTS[number];

export const QUADRANT_NAMES: Readonly<Record<AttachmentQuadrant, string>> = {
    steady: '安全型',
    close: '焦慮型',
    independent: '迴避型',
    torn: '恐懼迴避型',
};

export const ATTACHMENT_INFO: readonly (ScaleDimensionInfo & { id: AttachmentDimension })[] = [
    {
        id: 'anxiety', name: '靠近的焦慮', high: '常擔心被離開，需要較多的確認與回應', low: '對關係比較放心，不太擔心被離開',
    }, {
        id: 'avoidance', name: '親密的迴避', high: '偏好保持距離，不太習慣依賴或傾訴', low: '自在地靠近與依靠，也樂於分享心事',
    },
];

/** Twelve statements for each dimension, four of them turned against it; asked in turn */
const STATEMENTS: Readonly<Record<AttachmentDimension, readonly (readonly [string, boolean])[]>> = {
    anxiety: [
        ['我常擔心對方沒有我在乎他那麼在乎我。', false],
        ['對方一陣子沒回訊息，我就會胡思亂想。', false],
        ['我需要常常確認對方還愛我。', false],
        ['即使關係穩定，我也很少擔心被離開。', true],
        ['我害怕被重要的人拋下。', false],
        ['在關係中，我常覺得自己給的比得到的多。', false],
        ['我通常相信對方不會輕易離開我。', true],
        ['對方稍微冷淡，我就會懷疑是不是我做錯了什麼。', false],
        ['我對關係裡的小變化很敏感。', false],
        ['我很少因為怕被拒絕，而不敢說出自己的需要。', true],
        ['我渴望和對方非常靠近，這有時會讓對方有壓力。', false],
        ['對方不在身邊時，我也能安心。', true],
    ],
    avoidance: [
        ['我覺得太親近會讓我不自在。', false],
        ['我習慣自己處理問題，不太向人傾訴。', false],
        ['我樂於向親近的人敞開心事。', true],
        ['當對方想更靠近時，我會想退一步。', false],
        ['我覺得依賴別人是不太安全的事。', false],
        ['我可以輕鬆地依靠親密的人。', true],
        ['我很重視自己的空間，關係再好也一樣。', false],
        ['我不太習慣表達內心深處的感受。', false],
        ['我喜歡和親近的人分享生活的點滴。', true],
        ['對方表現出強烈的情感時，我會覺得有壓力。', false],
        ['我相信我可以對親近的人完全坦白。', true],
        ['比起一起面對問題，我更想自己想清楚。', false],
    ],
};

/** The items in the order they are asked: one of each dimension in turn */
export const ATTACHMENT_ITEMS: readonly ScaleItem[] = Array.from({ length: 12 }, (_, round) => ATTACHMENT_DIMENSIONS.map((dimension) => ({
    dimension, statement: STATEMENTS[dimension][round] ?? ['', false] as const,
}))).flat().map((entry, index): ScaleItem => ({
    id: `at${String(index + 1).padStart(2, '0')}`,
    text: entry.statement[0],
    dimension: entry.dimension,
    ...(entry.statement[1] ? { reversed: true } : {}),
}));

const contentKeyOf = (quadrant: string) => `attachment-style_quadrant-${quadrant}`;

const ATTACHMENT_CONTENT_KEYS = ATTACHMENT_QUADRANTS.map(contentKeyOf);

const termOf = (dimension: string, level: 'low' | 'high') => `attachment:${dimension}:${level}`;

export const ATTACHMENT_TERMS: readonly string[] = ATTACHMENT_DIMENSIONS.flatMap((dimension) => [termOf(dimension, 'low'), termOf(dimension, 'high')]);

const rule = keywordRule('ATTACHMENT_STYLE');

/** What each end of a dimension plainly stands for; none is better than the other */
const ATTACHMENT_MAPPINGS = [
    ...rule(termOf('anxiety', 'high'), 'C1.A', 'C4.B', 'D1.A', 'E3.B'),
    ...rule(termOf('anxiety', 'low'), 'C1.B', 'C4.A'),
    ...rule(termOf('avoidance', 'high'), 'D4.B', 'E3.A', 'D2.B', 'C2.B'),
    ...rule(termOf('avoidance', 'low'), 'D4.A', 'C2.A'),
];

const quadrantSchema = z.enum(ATTACHMENT_QUADRANTS);

const resultSchema = z.object({
    scores: z.array(z.object({
        dimension: z.enum(ATTACHMENT_DIMENSIONS),
        score: z.number().int().min(0).max(100),
        level: z.enum(LEVELS),
    })).length(ATTACHMENT_DIMENSIONS.length),
    /** The quadrant the two scores fall in, a dimension in the middle counting to the side it leans to */
    primary: quadrantSchema,
    /** The neighbouring quadrants, when a dimension is in the middle: the result is between them */
    between: z.array(quadrantSchema).max(2),
});

const LEVEL_WORDS = {
    low: '偏低', mid: '居中', high: '偏高',
} as const;

const nameOf = (dimension: string) => ATTACHMENT_INFO.find((info) => info.id === dimension)?.name ?? dimension;

const quadrantOf = (anxietyHigh: boolean, avoidanceHigh: boolean): AttachmentQuadrant => {
    if (anxietyHigh) return avoidanceHigh ? 'torn' : 'close';

    return avoidanceHigh ? 'independent' : 'steady';
};

export const ATTACHMENT_ASSESSMENT = defineScaleAssessment({
    id: 'attachment-style',
    systemId: 'ATTACHMENT_STYLE',
    title: '依附風格',
    version: ATTACHMENT_VERSION,
    allContentKeys: ATTACHMENT_CONTENT_KEYS,
    resultSchema,
    contentKeys: (result) => [result.primary, ...result.between].map(contentKeyOf),
    traitMappings: ATTACHMENT_MAPPINGS,
    basePrice: 1,
    items: ATTACHMENT_ITEMS,
    dimensions: ATTACHMENT_INFO,
    view: 'quadrant',
    score: (answers) => {
        const scored = scoreDimensions(answers, ATTACHMENT_ITEMS);
        const scores = ATTACHMENT_DIMENSIONS.map((dimension) => {
            const entry = scored.find((candidate) => candidate.dimension === dimension);

            if (!entry) throw new Error(`No score for ${dimension}`);

            return {
                dimension, score: entry.score, level: entry.level ?? 'mid',
            };
        });
        const anxiety = scores.find((entry) => entry.dimension === 'anxiety');
        const avoidance = scores.find((entry) => entry.dimension === 'avoidance');

        if (!anxiety || !avoidance) throw new Error('Missing a dimension');

        // A dimension in the middle counts to the side it leans to, and the other side is named as a neighbour
        const anxietyHigh = anxiety.score >= 50;
        const avoidanceHigh = avoidance.score >= 50;
        const between = [...(anxiety.level === 'mid' ? [quadrantOf(!anxietyHigh, avoidanceHigh)] : []), ...(avoidance.level === 'mid' ? [quadrantOf(anxietyHigh, !avoidanceHigh)] : [])];

        return {
            scores, primary: quadrantOf(anxietyHigh, avoidanceHigh), between,
        };
    },
    notes: (result) => [
        result.between.length === 0
            ? `你的回答落在「${QUADRANT_NAMES[result.primary]}」這一側的描述上。`
            : `你的回答落在「${[result.primary, ...result.between].map((quadrant) => QUADRANT_NAMES[quadrant]).join('」與「')}」之間，這幾段描述都可以參考。`, '依附模式會隨關係與經驗改變，不是固定標籤，也不是診斷；這裡的類型名稱沿用心理學常見用語，只是描述一種傾向，不是在說你是哪一種人。',
    ],
    reportInput: (result, contents) => {
        const quadrants = [result.primary, ...result.between];
        const bodies = quadrants.flatMap((quadrant) => {
            const body = contents[contentKeyOf(quadrant)];

            return body ? [body] : [];
        });
        const leaning = result.scores.filter((entry) => entry.level !== 'mid');
        const facts: ReportFact[] = result.scores.map((entry) => ({
            label: nameOf(entry.dimension),
            value: `${LEVEL_WORDS[entry.level]}（${entry.score}）`,
            ...(entry.level === 'mid' ? {} : { term: termOf(entry.dimension, entry.level === 'high' ? 'high' : 'low') }),
        }));

        return {
            system: 'ATTACHMENT_STYLE',
            position: result.between.length > 0
                ? `落在${quadrants.map((quadrant) => QUADRANT_NAMES[quadrant]).join('、')}之間`
                : `落在${QUADRANT_NAMES[result.primary]}這一側`,
            facts,
            interpretations: bodies.map((body) => ({
                title: body.title, text: body.summary,
            })),
            traits: leaning.map((entry) => termOf(entry.dimension, entry.level === 'high' ? 'high' : 'low')),
            advice: bodies.map((body) => body.growthAdvice).filter((text) => text.trim() !== ''),
            notes: ['依附風格的題目由本站自行設計，沒有經過信度與效度驗證，不是任何既有量表；依附模式會隨關係與經驗改變，不是固定標籤，也不是診斷。'],
            disclaimer: bodies[0]?.disclaimer ?? '本內容為自我探索參考，不是心理評估或診斷。',
            basis: [buildAssessmentBasis('ATTACHMENT_STYLE', ATTACHMENT_VERSION)],
        };
    },
});
