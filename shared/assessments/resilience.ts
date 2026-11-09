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

/** Carries `ref`: the 24 items are our own design after four resources for coming through stress, not validated and not any existing scale */
export const RESILIENCE_VERSION = 'resilience-ref-v1';

export const RESILIENCE_DIMENSIONS = [
    'recovery',
    'coping',
    'support',
    'meaning',
] as const;

export type ResilienceDimension = typeof RESILIENCE_DIMENSIONS[number];

const LEVELS = [
    'low',
    'mid',
    'high',
] as const;

export const RESILIENCE_INFO: readonly (ScaleDimensionInfo & { id: ResilienceDimension })[] = [
    {
        id: 'recovery', name: '復原的速度', high: '挫折之後多半能在一段時間內回到原本的狀態', low: '挫折之後需要比較多的時間慢慢平復',
    },
    {
        id: 'coping', name: '面對壓力的做法', high: '壓力來時能想辦法拆解、調整並一步步處理', low: '壓力來時目前較少用到拆解與調整的做法',
    },
    {
        id: 'support', name: '求助與支持', high: '願意向信任的人求助，也有可以依靠的人', low: '目前較少向別人求助，或較少感受到可依靠的支持',
    },
    {
        id: 'meaning', name: '意義與調適', high: '能從困難中找到意義，並用不同角度看待', low: '困難發生時，目前較少用到找意義與換角度的方式',
    },
];

/** Six statements for each resource, one or two of them turned against it; asked in turn */
const STATEMENTS: Readonly<Record<ResilienceDimension, readonly (readonly [string, boolean])[]>> = {
    recovery: [
        ['遇到挫折後，我通常能在幾天內回到原本的狀態。', false],
        ['事情不順時，我很快就能重新振作。', false],
        ['一件不好的事，常會在我心裡盤旋很久。', true],
        ['失敗之後，我能把它當成經驗，繼續往前。', false],
        ['即使心情低落，我也能慢慢讓自己恢復。', false],
        ['壓力過去之後，我需要很長的時間才能平復。', true],
    ],
    coping: [
        ['面對困難時，我會先想有哪些事情是我可以做的。', false],
        ['遇到壓力時，我會把問題拆成比較小的步驟。', false],
        ['壓力一來，我常覺得自己不知道該怎麼辦。', true],
        ['即使情況不確定，我也能一步一步處理。', false],
        ['我相信自己有辦法度過目前的難關。', false],
        ['面對突然的變化，我通常能調整做法。', false],
    ],
    support: [
        ['心情不好時，我會找可以信任的人聊聊。', false],
        ['需要幫助的時候，我願意開口請別人幫忙。', false],
        ['我習慣把困難自己吞下去，不想麻煩別人。', true],
        ['我身邊有幾個在我低潮時可以依靠的人。', false],
        ['我覺得向別人求助，並不代表自己不夠好。', false],
        ['遇到困難時，我很難讓別人知道我需要支持。', true],
    ],
    meaning: [
        ['我常能從困難的經驗中，找到一點意義或收穫。', false],
        ['即使處境不好，我仍然看得到一些值得期待的事。', false],
        ['我能接受有些事情不是我能控制的。', false],
        ['遇到不如意時，我會提醒自己什麼對我是重要的。', false],
        ['我常覺得一旦出了事，一切就都沒有意義了。', true],
        ['我會用不同的角度重新看待遇到的難題。', false],
    ],
};

/** The items in the order they are asked: one of each resource in turn */
export const RESILIENCE_ITEMS: readonly ScaleItem[] = Array.from({ length: 6 }, (_, round) => RESILIENCE_DIMENSIONS.map((dimension) => ({
    dimension, statement: STATEMENTS[dimension][round] ?? ['', false] as const,
}))).flat().map((entry, index): ScaleItem => ({
    id: `rs${String(index + 1).padStart(2, '0')}`,
    text: entry.statement[0],
    dimension: entry.dimension,
    ...(entry.statement[1] ? { reversed: true } : {}),
}));

const contentKeyOf = (dimension: string, level: string) => `resilience_${dimension}_${level}`;

const RESILIENCE_CONTENT_KEYS = RESILIENCE_DIMENSIONS.flatMap((dimension) => LEVELS.map((level) => contentKeyOf(dimension, level)));

const termOf = (dimension: string, level: 'low' | 'high') => `resilience:${dimension}:${level}`;

export const RESILIENCE_TERMS: readonly string[] = RESILIENCE_DIMENSIONS.flatMap((dimension) => [termOf(dimension, 'low'), termOf(dimension, 'high')]);

const rule = keywordRule('RESILIENCE');

/**
 * Only what a reading really says: coming back quickly is steadiness, keeping at a problem is persistence, and so on.
 * A low level never says anything bad about a person, so a low level has an entry only where the other end of an axis is a plain description of it.
 */
const RESILIENCE_MAPPINGS = [
    ...rule(termOf('recovery', 'high'), 'C1.B', 'C4.A'),
    ...rule(termOf('recovery', 'low'), 'C1.A'),
    ...rule(termOf('coping', 'high'), 'B4.A', 'B5.A'),
    ...rule(termOf('support', 'high'), 'D1.A', 'A2.B'),
    ...rule(termOf('meaning', 'high'), 'E2.A', 'C4.A'),
];

const resultSchema = z.object({
    scores: z.array(z.object({
        dimension: z.enum(RESILIENCE_DIMENSIONS),
        score: z.number().int().min(0).max(100),
        level: z.enum(LEVELS),
    })).length(RESILIENCE_DIMENSIONS.length),
});

const LEVEL_WORDS = {
    low: '偏低', mid: '居中', high: '偏高',
} as const;

const nameOf = (dimension: string) => RESILIENCE_INFO.find((info) => info.id === dimension)?.name ?? dimension;

export const RESILIENCE_ASSESSMENT = defineScaleAssessment({
    id: 'resilience',
    systemId: 'RESILIENCE',
    title: '心理韌性',
    version: RESILIENCE_VERSION,
    allContentKeys: RESILIENCE_CONTENT_KEYS,
    resultSchema,
    contentKeys: (result) => result.scores.map((entry) => contentKeyOf(entry.dimension, entry.level)),
    traitMappings: RESILIENCE_MAPPINGS,
    basePrice: 1,
    items: RESILIENCE_ITEMS,
    dimensions: RESILIENCE_INFO,
    view: 'profile',
    score: (answers) => {
        const scored = scoreDimensions(answers, RESILIENCE_ITEMS);

        return {
            scores: RESILIENCE_DIMENSIONS.map((dimension) => {
                const entry = scored.find((candidate) => candidate.dimension === dimension);

                if (!entry) throw new Error(`No score for ${dimension}`);

                return {
                    dimension, score: entry.score, level: entry.level ?? 'mid',
                };
            }),
        };
    },
    notes: (result) => {
        const names = (level: 'low' | 'high') => result.scores.filter((entry) => entry.level === level).map((entry) => nameOf(entry.dimension)).join('、');
        const high = names('high');
        const low = names('low');

        return [
            ...(high ? [`目前比較常用到的資源：${high}。`] : []),
            ...(low ? [`目前較少用到、可以慢慢練習的資源：${low}。`] : []),
            '韌性不是固定的，會隨處境與支持改變；四個面向各自獨立，這份結果沒有一個總分，也不是心理評估或診斷。若長期感到難以負荷，建議尋求專業協助。',
        ];
    },
    reportInput: (result, contents) => {
        const bodies = result.scores.flatMap((entry) => {
            const body = contents[contentKeyOf(entry.dimension, entry.level)];

            return body ? [
                {
                    entry, body,
                },
            ] : [];
        });
        const leaning = result.scores.filter((entry) => entry.level !== 'mid');
        const low = result.scores.filter((entry) => entry.level === 'low').map((entry) => nameOf(entry.dimension));
        const facts: ReportFact[] = result.scores.map((entry) => ({
            label: nameOf(entry.dimension),
            value: `${LEVEL_WORDS[entry.level]}（${entry.score}）`,
            ...(entry.level === 'mid' ? {} : { term: termOf(entry.dimension, entry.level) }),
        }));

        return {
            system: 'RESILIENCE',
            position: low.length > 0 ? `目前較少用到、可以慢慢練習：${low.join('、')}` : '四個面向都在中間或偏高',
            facts,
            interpretations: bodies.map(({
                entry, body,
            }) => ({
                title: body.title,
                text: body.summary,
                ...(entry.level === 'mid' ? {} : { term: termOf(entry.dimension, entry.level) }),
            })),
            traits: leaning.map((entry) => termOf(entry.dimension, entry.level === 'high' ? 'high' : 'low')),
            advice: bodies.map(({ body }) => body.growthAdvice).filter((text) => text.trim() !== ''),
            notes: ['心理韌性的題目由本站自行設計，沒有經過信度與效度驗證，不是任何既有量表；韌性會隨處境與支持改變，不是固定標籤，也不是心理評估或診斷。'],
            disclaimer: bodies[0]?.body.disclaimer ?? '本內容為自我探索參考，不是心理評估或診斷。',
            basis: [buildAssessmentBasis('RESILIENCE', RESILIENCE_VERSION)],
        };
    },
});
