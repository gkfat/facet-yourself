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

/** Carries `ref`: the 18 items are our own design after the three basic needs of self-determination theory, not validated and not any existing scale */
export const PSYCHOLOGICAL_NEEDS_VERSION = 'psychological-needs-ref-v1';

export const NEEDS = [
    'autonomy',
    'competence',
    'relatedness',
] as const;

export type Need = typeof NEEDS[number];

const LEVELS = [
    'low',
    'mid',
    'high',
] as const;

export const NEED_INFO: readonly (ScaleDimensionInfo & { id: Need })[] = [
    {
        id: 'autonomy', name: '自主', high: '覺得自己的行動出於自己的選擇', low: '常覺得被迫、被控制',
    },
    {
        id: 'competence', name: '勝任', high: '覺得自己有能力、正在進步', low: '常覺得做不好、少有機會發揮',
    },
    {
        id: 'relatedness', name: '關係', high: '覺得被關心、被接納、有歸屬', low: '常覺得有距離、孤單',
    },
];

/** Six statements for each need, about how the last weeks have been; two of them turned against it */
const STATEMENTS: Readonly<Record<Need, readonly (readonly [string, boolean])[]>> = {
    autonomy: [
        ['我覺得自己的生活多半是自己選擇的。', false],
        ['我常覺得自己是被迫去做很多事。', true],
        ['我能依自己的想法做決定。', false],
        ['在做事的方式上，我覺得被別人管得很緊。', true],
        ['我做的事大多和我真正在意的事一致。', false],
        ['我有空間可以照自己的節奏安排時間。', false],
    ],
    competence: [
        ['對於我做的事，我通常有能力完成。', false],
        ['我常覺得自己不夠好，做不好該做的事。', true],
        ['最近我學到了新的東西，也覺得自己在進步。', false],
        ['我很少有機會用到自己擅長的能力。', true],
        ['面對挑戰，我相信自己能想出辦法。', false],
        ['我的努力常能看到具體的成果。', false],
    ],
    relatedness: [
        ['我身邊有人真心關心我。', false],
        ['我覺得自己和別人之間有距離，沒有人真正懂我。', true],
        ['我有可以放心說出心事的人。', false],
        ['我常覺得自己被排除在團體之外。', true],
        ['和重要的人相處時，我覺得被接納。', false],
        ['我常能感受到與他人的連結與歸屬。', false],
    ],
};

/** The items in the order they are asked: one of each need in turn */
export const NEEDS_ITEMS: readonly ScaleItem[] = Array.from({ length: 6 }, (_, round) => NEEDS.map((need) => ({
    need, statement: STATEMENTS[need][round] ?? ['', false] as const,
}))).flat().map((entry, index): ScaleItem => ({
    id: `pn${String(index + 1).padStart(2, '0')}`,
    text: entry.statement[0],
    dimension: entry.need,
    ...(entry.statement[1] ? { reversed: true } : {}),
}));

const contentKeyOf = (need: string, level: string) => `psychological-needs_${need}_${level}`;

const NEEDS_CONTENT_KEYS = NEEDS.flatMap((need) => LEVELS.map((level) => contentKeyOf(need, level)));

const termOf = (need: string, level: 'low' | 'high') => `needs:${need}:${level}`;

export const NEEDS_TERMS: readonly string[] = NEEDS.flatMap((need) => [termOf(need, 'low'), termOf(need, 'high')]);

const rule = keywordRule('PSYCHOLOGICAL_NEEDS');

/** What it feels like when a need is met or not, kept to the plain meaning; a low score is not a defect */
const NEEDS_MAPPINGS = [
    ...rule(termOf('autonomy', 'high'), 'E3.A', 'A2.A'),
    ...rule(termOf('autonomy', 'low'), 'E3.B', 'A2.B'),
    ...rule(termOf('competence', 'high'), 'E4.A', 'B6.A'),
    ...rule(termOf('competence', 'low'), 'C4.B', 'B3.B'),
    ...rule(termOf('relatedness', 'high'), 'E3.B', 'D1.A', 'D4.A'),
    ...rule(termOf('relatedness', 'low'), 'D2.B', 'D4.B'),
];

const resultSchema = z.object({
    scores: z.array(z.object({
        dimension: z.enum(NEEDS),
        score: z.number().int().min(0).max(100),
        level: z.enum(LEVELS),
    })).length(NEEDS.length),
});

const LEVEL_WORDS = {
    low: '偏低', mid: '居中', high: '偏高',
} as const;

const nameOf = (need: string) => NEED_INFO.find((info) => info.id === need)?.name ?? need;

export const PSYCHOLOGICAL_NEEDS_ASSESSMENT = defineScaleAssessment({
    id: 'psychological-needs',
    systemId: 'PSYCHOLOGICAL_NEEDS',
    title: '需求與動機',
    version: PSYCHOLOGICAL_NEEDS_VERSION,
    allContentKeys: NEEDS_CONTENT_KEYS,
    resultSchema,
    contentKeys: (result) => result.scores.map((entry) => contentKeyOf(entry.dimension, entry.level)),
    traitMappings: NEEDS_MAPPINGS,
    basePrice: 1,
    items: NEEDS_ITEMS,
    dimensions: NEED_INFO,
    score: (answers) => {
        const scored = scoreDimensions(answers, NEEDS_ITEMS);

        return {
            scores: NEEDS.map((need) => {
                const entry = scored.find((candidate) => candidate.dimension === need);

                if (!entry) throw new Error(`No score for ${need}`);

                return {
                    dimension: need, score: entry.score, level: entry.level ?? 'mid',
                };
            }),
        };
    },
    notes: (result) => {
        const names = (level: 'low' | 'high') => result.scores.filter((entry) => entry.level === level).map((entry) => nameOf(entry.dimension)).join('、');
        const watch = names('low');
        const met = names('high');

        return [
            ...(watch ? [`值得留意：${watch}。這些需求目前比較少被滿足，不是你的缺陷，而是可以多照顧的地方。`] : []),
            ...(met ? [`目前比較被滿足：${met}。`] : []),
            ...(!watch && !met ? ['三項需求目前都在中間，沒有特別突出或特別缺少的一項。'] : []),
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
            system: 'PSYCHOLOGICAL_NEEDS',
            position: low.length > 0 ? `值得留意：${low.join('、')}` : '三項需求目前沒有特別缺少的一項',
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
            notes: ['需求與動機的題目由本站自行設計，沒有經過信度與效度驗證，不是任何既有量表；分數只代表你這陣子的感受。'],
            disclaimer: bodies[0]?.body.disclaimer ?? '本內容為自我探索參考，不是心理評估或診斷。',
            basis: [buildAssessmentBasis('PSYCHOLOGICAL_NEEDS', PSYCHOLOGICAL_NEEDS_VERSION)],
        };
    },
});
