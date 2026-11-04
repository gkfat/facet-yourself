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

/** Carries `ref`: the 40 items are our own design after four sides of emotional skill, not validated and not any existing scale */
export const EQ_VERSION = 'emotional-intelligence-ref-v1';

export const EQ_SIDES = [
    'awareness',
    'regulation',
    'empathy',
    'interpersonal',
] as const;

export type EqSide = typeof EQ_SIDES[number];

const LEVELS = [
    'low',
    'mid',
    'high',
] as const;

export const EQ_INFO: readonly (ScaleDimensionInfo & { id: EqSide })[] = [
    {
        id: 'awareness', name: '情緒覺察', high: '能辨認並說出自己的情緒與它的來源', low: '常不太確定自己的感受，或事後才發現',
    },
    {
        id: 'regulation', name: '情緒調節', high: '情緒來時能安撫自己，再決定怎麼回應', low: '情緒容易淹沒自己，需要更多安撫的方法',
    },
    {
        id: 'empathy', name: '同理心', high: '能察覺並體會別人的感受', low: '較少從別人的感受出發，或不確定怎麼回應',
    },
    {
        id: 'interpersonal', name: '人際情緒處理', high: '能在衝突與緊張中表達自己、也照顧關係', low: '遇到衝突時，容易迴避或被情緒帶著走',
    },
];

/** Ten statements for each side, the second of some turned against it; asked mixed across the sides */
const STATEMENTS: Readonly<Record<EqSide, readonly (readonly [string, boolean])[]>> = {
    awareness: [
        ['我通常能說得出自己現在是什麼情緒。', false],
        ['有時我不知道自己為什麼心情不好。', true],
        ['我能察覺情緒在身體上的反應，例如緊繃或心跳加快。', false],
        ['我常忽略自己的感受，直到它變得很強烈。', true],
        ['我知道什麼樣的事情容易引發我的某些情緒。', false],
        ['我能分辨自己是生氣、難過還是失望。', false],
        ['我常到事後才發現自己當時其實很累或很煩。', true],
        ['我會定期留意自己的心情變化。', false],
        ['我很難形容自己的感受。', true],
        ['我知道自己的情緒如何影響我做的決定。', false],
    ],
    regulation: [
        ['心情很糟時，我有辦法讓自己慢慢平靜下來。', false],
        ['我常被突如其來的情緒淹沒，很難控制反應。', true],
        ['生氣時，我能先停一下再開口。', false],
        ['一件小事不順，就會影響我一整天的心情。', true],
        ['我有幾種有效的方法可以安撫自己。', false],
        ['壓力大的時候，我仍能專注在眼前該做的事。', false],
        ['我常說出事後會後悔的話。', true],
        ['遇到挫折，我很快就能重新振作。', false],
        ['我很難放下已經發生的不愉快。', true],
        ['在緊張的場合，我能保持鎮定。', false],
    ],
    empathy: [
        ['我很容易察覺別人的情緒，即使他們沒有說出來。', false],
        ['看到別人難過，我能體會他們的感受。', false],
        ['我會設身處地想想別人為什麼那樣反應。', false],
        ['別人訴苦時，我常不知道該怎麼回應。', true],
        ['我很在意自己的話會不會讓別人不舒服。', false],
        ['我常覺得別人的情緒反應「太誇張」。', true],
        ['我能從表情和語氣聽出別人沒說出口的話。', false],
        ['我願意花時間聽別人把感受說完。', false],
        ['要理解和我很不一樣的人的感受，對我來說很困難。', true],
        ['別人常覺得我懂他們。', false],
    ],
    interpersonal: [
        ['與人意見不合時，我能冷靜地把想法說清楚。', false],
        ['我能讓緊張的氣氛慢慢緩和下來。', false],
        ['我會直接告訴對方哪些行為讓我不舒服，而不是生悶氣。', false],
        ['發生衝突後，我常用冷戰來處理。', true],
        ['我能在不傷害關係的前提下，表達不同的意見。', false],
        ['我常因為怕起衝突而不說出真正的想法。', true],
        ['我會主動修復與別人之間的裂痕。', false],
        ['我能接受別人對我的批評，而不會一直防衛。', false],
        ['在團體裡，我能讓不同情緒的人都感到被尊重。', false],
        ['別人情緒激動時，我容易跟著失控。', true],
    ],
};

/** The items in the order they are asked: one of each side in turn */
export const EQ_ITEMS: readonly ScaleItem[] = Array.from({ length: 10 }, (_, round) => EQ_SIDES.map((side) => ({
    side, statement: STATEMENTS[side][round] ?? ['', false] as const,
}))).flat().map((entry, index): ScaleItem => ({
    id: `eq${String(index + 1).padStart(2, '0')}`,
    text: entry.statement[0],
    dimension: entry.side,
    ...(entry.statement[1] ? { reversed: true } : {}),
}));

const contentKeyOf = (side: string, level: string) => `emotional-intelligence_${side}_${level}`;

const EQ_CONTENT_KEYS = EQ_SIDES.flatMap((side) => LEVELS.map((level) => contentKeyOf(side, level)));

const termOf = (side: string, level: 'low' | 'high') => `eq:${side}:${level}`;

export const EQ_TERMS: readonly string[] = EQ_SIDES.flatMap((side) => [termOf(side, 'low'), termOf(side, 'high')]);

const rule = keywordRule('EMOTIONAL_INTELLIGENCE');

/**
 * Only what a reading really says: being aware of feelings is a fine sense for them, being able to calm oneself is
 * steadiness, and so on. A low level on awareness or on handling conflict says nothing about an axis end, so it has no entry.
 */
const EQ_MAPPINGS = [
    ...rule(termOf('awareness', 'high'), 'C1.A'),
    ...rule(termOf('regulation', 'high'), 'C1.B', 'C4.A'),
    ...rule(termOf('regulation', 'low'), 'C1.A', 'C4.B'),
    ...rule(termOf('empathy', 'high'), 'D1.A', 'D2.A', 'C3.B'),
    ...rule(termOf('empathy', 'low'), 'D1.B'),
    ...rule(termOf('interpersonal', 'high'), 'D3.A', 'C3.B'),
];

const resultSchema = z.object({
    scores: z.array(z.object({
        dimension: z.enum(EQ_SIDES),
        score: z.number().int().min(0).max(100),
        level: z.enum(LEVELS),
    })).length(EQ_SIDES.length),
});

const LEVEL_WORDS = {
    low: '偏低', mid: '居中', high: '偏高',
} as const;

const nameOf = (side: string) => EQ_INFO.find((info) => info.id === side)?.name ?? side;

export const EQ_ASSESSMENT = defineScaleAssessment({
    id: 'emotional-intelligence',
    systemId: 'EMOTIONAL_INTELLIGENCE',
    title: '情緒智商',
    version: EQ_VERSION,
    allContentKeys: EQ_CONTENT_KEYS,
    resultSchema,
    contentKeys: (result) => result.scores.map((entry) => contentKeyOf(entry.dimension, entry.level)),
    traitMappings: EQ_MAPPINGS,
    basePrice: 1,
    items: EQ_ITEMS,
    dimensions: EQ_INFO,
    view: 'profile',
    score: (answers) => {
        const scored = scoreDimensions(answers, EQ_ITEMS);

        return {
            scores: EQ_SIDES.map((side) => {
                const entry = scored.find((candidate) => candidate.dimension === side);

                if (!entry) throw new Error(`No score for ${side}`);

                return {
                    dimension: side, score: entry.score, level: entry.level ?? 'mid',
                };
            }),
        };
    },
    notes: (result) => {
        const names = (level: 'low' | 'high') => result.scores.filter((entry) => entry.level === level).map((entry) => nameOf(entry.dimension)).join('、');
        const high = names('high');
        const low = names('low');

        return [
            ...(high ? [`目前比較熟練的面向：${high}。`] : []),
            ...(low ? [`可以多練習的面向：${low}。`] : []),
            '情緒能力可以練習，不是固定的；四個面向各自獨立，這份結果沒有一個總分。',
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
            system: 'EMOTIONAL_INTELLIGENCE',
            position: low.length > 0 ? `可以多練習：${low.join('、')}` : '四個面向都在中間或偏高',
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
            notes: ['情緒智商的題目由本站自行設計，沒有經過信度與效度驗證，不是任何既有量表；情緒能力可以練習，不是固定的。'],
            disclaimer: bodies[0]?.body.disclaimer ?? '本內容為自我探索參考，不是心理評估或診斷。',
            basis: [buildAssessmentBasis('EMOTIONAL_INTELLIGENCE', EQ_VERSION)],
        };
    },
});
