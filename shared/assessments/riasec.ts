// Plain `.ts` import specifiers: this file is also run directly by Node
// (type stripping) from scripts/, where extensionless imports do not resolve.
import { z } from 'zod';
import { keywordRule } from '../ontology/mappings/keywordRule.ts';
import type { ReportFact } from '../report/types.ts';
import { buildAssessmentBasis } from '../utils/assessmentBasis.ts';
import { RIASEC_ACTIVITIES } from './riasecData.ts';
import {
    rankDimensions, scoreDimensions,
} from './scoring.ts';
import {
    defineScaleAssessment, type ScaleDimensionInfo, type ScaleItem,
} from './types.ts';

/** Carries `ref`: the 60 activities are our own design after the six interest types, not validated and not any existing inventory */
export const RIASEC_VERSION = 'riasec-ref-v1';

/** The types in the fixed order that also settles a tie: the one earlier in this list goes first */
export const RIASEC_TYPES = [
    'realistic',
    'investigative',
    'artistic',
    'social',
    'enterprising',
    'conventional',
] as const;

export type RiasecType = typeof RIASEC_TYPES[number];

const LETTERS: Readonly<Record<RiasecType, string>> = {
    realistic: 'R',
    investigative: 'I',
    artistic: 'A',
    social: 'S',
    enterprising: 'E',
    conventional: 'C',
};

export const RIASEC_TYPE_INFO: readonly (ScaleDimensionInfo & { id: RiasecType })[] = [
    {
        id: 'realistic', name: '實作型（R）', high: '喜歡動手做、操作與看得到成果的事', low: '這類活動較不吸引你',
    },
    {
        id: 'investigative', name: '研究型（I）', high: '喜歡探究、分析與弄懂原理', low: '這類活動較不吸引你',
    },
    {
        id: 'artistic', name: '藝術型（A）', high: '喜歡創造、想像與自由表達', low: '這類活動較不吸引你',
    },
    {
        id: 'social', name: '社會型（S）', high: '喜歡幫助、陪伴與教導別人', low: '這類活動較不吸引你',
    },
    {
        id: 'enterprising', name: '企業型（E）', high: '喜歡說服、領導與推動目標', low: '這類活動較不吸引你',
    },
    {
        id: 'conventional', name: '事務型（C）', high: '喜歡條理、規劃與準確的工作', low: '這類活動較不吸引你',
    },
];

export const RIASEC_ANSWER_LABELS = [
    '非常不喜歡',
    '不喜歡',
    '普通',
    '喜歡',
    '非常喜歡',
] as const;

/** The activities in the order they are asked: one of each type in turn */
export const RIASEC_ITEMS: readonly ScaleItem[] = Array.from({ length: 10 }, (_, round) => RIASEC_TYPES.map((type) => ({
    type, text: RIASEC_ACTIVITIES[type][round] ?? '',
}))).flat().map((entry, index): ScaleItem => ({
    id: `ri${String(index + 1).padStart(2, '0')}`,
    text: entry.text,
    dimension: entry.type,
}));

/** The code of a set of three types: their letters in the fixed order, whatever order the person ranks them in */
export const codeKeyOf = (types: readonly RiasecType[]) => `riasec_code-${RIASEC_TYPES.filter((type) => types.includes(type)).map((type) => LETTERS[type]).join('')}`;

const typeKeyOf = (type: string) => `riasec_type-${LETTERS[RIASEC_TYPES.find((candidate) => candidate === type) ?? 'realistic']}`;

/** Every set of three of the six types, as the keys of their contents */
const CODE_KEYS = RIASEC_TYPES.flatMap((first, i) => RIASEC_TYPES.slice(i + 1).flatMap((second, j) => RIASEC_TYPES.slice(i + j + 2).map((third) => codeKeyOf([
    first,
    second,
    third,
]))));

const RIASEC_CONTENT_KEYS = [...RIASEC_TYPES.map(typeKeyOf), ...CODE_KEYS];

const termOf = (type: string) => `riasec:${type}`;

export const RIASEC_TERMS: readonly string[] = RIASEC_TYPES.map(termOf);

const rule = keywordRule('RIASEC');

/** Kept to the plain meaning of each interest; an interest is not an ability */
const RIASEC_MAPPINGS = [
    ...rule(termOf('realistic'), 'A6.B', 'B6.A', 'D4.B'),
    ...rule(termOf('investigative'), 'A1.A', 'A4.B', 'D4.B'),
    ...rule(termOf('artistic'), 'A6.A', 'A3.A', 'C1.A', 'E2.A'),
    ...rule(termOf('social'), 'D2.A', 'D1.A', 'D3.A', 'D4.A'),
    ...rule(termOf('enterprising'), 'D5.A', 'B2.A', 'B3.A', 'B6.A'),
    ...rule(termOf('conventional'), 'B5.A', 'A5.A', 'B1.A', 'E1.A'),
];

const resultSchema = z.object({
    scores: z.array(z.object({
        dimension: z.enum(RIASEC_TYPES),
        score: z.number().int().min(0).max(100),
        level: z.null(),
    })).length(RIASEC_TYPES.length),
    /** The three that stand out most, the highest first */
    top: z.array(z.enum(RIASEC_TYPES)).length(3),
    /** The third and the fourth scored the same, so the fixed order decided which one is in the code */
    tieBroken: z.boolean(),
});

const nameOf = (type: string) => RIASEC_TYPE_INFO.find((info) => info.id === type)?.name ?? type;

const codeOf = (top: readonly RiasecType[]) => top.map((type) => LETTERS[type]).join('');

export const RIASEC_ASSESSMENT = defineScaleAssessment({
    id: 'riasec',
    systemId: 'RIASEC',
    title: '職業興趣',
    version: RIASEC_VERSION,
    allContentKeys: RIASEC_CONTENT_KEYS,
    resultSchema,
    contentKeys: (result) => [codeKeyOf(result.top), ...result.top.map(typeKeyOf)],
    traitMappings: RIASEC_MAPPINGS,
    basePrice: 1,
    items: RIASEC_ITEMS,
    dimensions: RIASEC_TYPE_INFO,
    answerLabels: RIASEC_ANSWER_LABELS,
    view: 'code',
    score: (answers) => {
        const scored = scoreDimensions(answers, RIASEC_ITEMS, false);
        const scores = RIASEC_TYPES.map((type) => {
            const entry = scored.find((candidate) => candidate.dimension === type);

            if (!entry) throw new Error(`No score for ${type}`);

            return {
                dimension: type, score: entry.score, level: null,
            };
        });
        // Ties keep the fixed order of the types, so the same answers always give the same code
        const ranked = rankDimensions(scores).map((entry) => RIASEC_TYPES.find((type) => type === entry.dimension));
        const top = ranked.slice(0, 3).filter((type) => type !== undefined);
        const third = scores.find((entry) => entry.dimension === top[2]);
        const fourth = scores.find((entry) => entry.dimension === ranked[3]);

        return {
            scores: [...scores].sort((first, second) => second.score - first.score || RIASEC_TYPES.indexOf(first.dimension) - RIASEC_TYPES.indexOf(second.dimension)),
            top,
            tieBroken: third !== undefined && fourth !== undefined && third.score === fourth.score,
        };
    },
    notes: (result) => [
        `你的三碼興趣代碼是 ${codeOf(result.top)}（依分數由高到低）。`,
        ...(result.tieBroken ? ['第三名和第四名的分數相同，依固定的順序（R、I、A、S、E、C）決定了哪一型進入三碼。'] : []),
        '這是興趣的描述，不是能力或適性的判定，也不是建議你必須從事的職業；興趣會隨著經驗改變。',
    ],
    reportInput: (result, contents) => {
        const bodies = [codeKeyOf(result.top), ...result.top.map(typeKeyOf)].flatMap((key, index) => {
            const body = contents[key];

            return body ? [
                {
                    key, body, type: index === 0 ? undefined : result.top[index - 1],
                },
            ] : [];
        });
        const facts: ReportFact[] = result.top.map((type, index) => ({
            label: `第 ${index + 1} 名的興趣`, value: nameOf(type), term: termOf(type),
        }));

        return {
            system: 'RIASEC',
            position: `三碼 ${codeOf(result.top)}`,
            facts,
            interpretations: bodies.map(({
                body, type,
            }) => ({
                title: body.title, text: body.summary, ...(type ? { term: termOf(type) } : {}),
            })),
            traits: result.top.map(termOf),
            advice: bodies.map(({ body }) => body.growthAdvice).filter((text) => text.trim() !== ''),
            notes: ['職業興趣的題目由本站自行設計，沒有經過信度與效度驗證，不是任何既有量表；這是興趣，不是能力或適性的判定。'],
            disclaimer: bodies[0]?.body.disclaimer ?? '本內容為自我探索參考，不是心理評估或診斷。',
            basis: [buildAssessmentBasis('RIASEC', RIASEC_VERSION)],
        };
    },
});
