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

/** Carries `ref`: the 20 items are our own design after the two concerns in a conflict, not validated and not any existing inventory */
export const CONFLICT_STYLE_VERSION = 'conflict-style-ref-v1';

export const CONFLICT_STYLE_DIMENSIONS = ['goals', 'relationship'] as const;

export type ConflictStyleDimension = typeof CONFLICT_STYLE_DIMENSIONS[number];

const LEVELS = [
    'low',
    'mid',
    'high',
] as const;

/** The four quadrants of the two concerns, by neutral names: a description of a habit in a conflict, never a label for a person */
export const CONFLICT_STYLE_QUADRANTS = [
    'assertive',
    'accommodating',
    'avoiding',
    'collaborating',
] as const;

export type ConflictStyleQuadrant = typeof CONFLICT_STYLE_QUADRANTS[number];

export const CONFLICT_QUADRANT_NAMES: Readonly<Record<ConflictStyleQuadrant, string>> = {
    assertive: '堅持型',
    accommodating: '配合型',
    avoiding: '迴避型',
    collaborating: '協商型',
};

export const CONFLICT_STYLE_INFO: readonly (ScaleDimensionInfo & { id: ConflictStyleDimension })[] = [
    {
        id: 'goals', name: '關心自己的目標', high: '衝突時會清楚爭取自己想要的結果', low: '衝突時較少堅持自己想要的結果',
    }, {
        id: 'relationship', name: '關心關係', high: '衝突時很在意對方的感受與關係', low: '衝突時較少顧慮對方的感受與關係',
    },
];

/** Ten statements for each concern, three of them turned against it; asked in turn */
const STATEMENTS: Readonly<Record<ConflictStyleDimension, readonly (readonly [string, boolean])[]>> = {
    goals: [
        ['衝突時，我會清楚說出自己想要的結果。', false],
        ['在重要的事情上，我不會輕易讓步。', false],
        ['為了讓事情照我認為對的方式進行，我願意多爭取。', false],
        ['我常為了避免麻煩，而不提出自己的要求。', true],
        ['即使對方不同意，我也會說明並堅持自己的立場。', false],
        ['我覺得自己的需要和想法，不應該在爭執中被忽略。', false],
        ['遇到意見不合時，我常先放下自己想要的。', true],
        ['對我在意的目標，我會主動爭取到底。', false],
        ['我很少為了維持氣氛，就放棄原本的主張。', false],
        ['在爭執中，我常覺得自己的想法沒被聽見，卻沒有說出口。', true],
    ],
    relationship: [
        ['衝突時，我很在意對方的感受。', false],
        ['即使意見不同，我也希望關係不要因此變差。', false],
        ['我會試著理解對方為什麼這樣想。', false],
        ['為了贏得爭論，我不太顧慮對方的感受。', true],
        ['事情吵完之後，我會主動關心彼此的關係是否還好。', false],
        ['我願意為了維持良好的關係，調整自己的做法。', false],
        ['對方是否覺得被尊重，對我來說和結果一樣重要。', false],
        ['只要事情解決了，我不太在意對方是否不開心。', true],
        ['我會找出讓雙方都能接受的方式。', false],
        ['與人起衝突後，我並不太在意關係會變得如何。', true],
    ],
};

/** The items in the order they are asked: one of each concern in turn */
export const CONFLICT_STYLE_ITEMS: readonly ScaleItem[] = Array.from({ length: 10 }, (_, round) => CONFLICT_STYLE_DIMENSIONS.map((dimension) => ({
    dimension, statement: STATEMENTS[dimension][round] ?? ['', false] as const,
}))).flat().map((entry, index): ScaleItem => ({
    id: `cs${String(index + 1).padStart(2, '0')}`,
    text: entry.statement[0],
    dimension: entry.dimension,
    ...(entry.statement[1] ? { reversed: true } : {}),
}));

const contentKeyOf = (quadrant: string) => `conflict-style_quadrant-${quadrant}`;

const CONFLICT_STYLE_CONTENT_KEYS = CONFLICT_STYLE_QUADRANTS.map(contentKeyOf);

const termOf = (dimension: string, level: 'low' | 'high') => `conflict-style:${dimension}:${level}`;

export const CONFLICT_STYLE_TERMS: readonly string[] = CONFLICT_STYLE_DIMENSIONS.flatMap((dimension) => [termOf(dimension, 'low'), termOf(dimension, 'high')]);

const rule = keywordRule('CONFLICT_STYLE');

/** What each end of a concern plainly stands for; none is better than the other */
const CONFLICT_STYLE_MAPPINGS = [
    ...rule(termOf('goals', 'high'), 'D3.B', 'C3.A'),
    ...rule(termOf('goals', 'low'), 'D5.B'),
    ...rule(termOf('relationship', 'high'), 'D3.A', 'D6.A'),
    ...rule(termOf('relationship', 'low'), 'D1.B'),
];

const quadrantSchema = z.enum(CONFLICT_STYLE_QUADRANTS);

const resultSchema = z.object({
    scores: z.array(z.object({
        dimension: z.enum(CONFLICT_STYLE_DIMENSIONS),
        score: z.number().int().min(0).max(100),
        level: z.enum(LEVELS),
    })).length(CONFLICT_STYLE_DIMENSIONS.length),
    /** The quadrant the two scores fall in, a concern in the middle counting to the side it leans to */
    primary: quadrantSchema,
    /** The neighbouring quadrants, when a concern is in the middle: the result is between them */
    between: z.array(quadrantSchema).max(2),
});

const LEVEL_WORDS = {
    low: '偏低', mid: '居中', high: '偏高',
} as const;

const nameOf = (dimension: string) => CONFLICT_STYLE_INFO.find((info) => info.id === dimension)?.name ?? dimension;

const quadrantOf = (goalsHigh: boolean, relationshipHigh: boolean): ConflictStyleQuadrant => {
    if (goalsHigh) return relationshipHigh ? 'collaborating' : 'assertive';

    return relationshipHigh ? 'accommodating' : 'avoiding';
};

export const CONFLICT_STYLE_ASSESSMENT = defineScaleAssessment({
    id: 'conflict-style',
    systemId: 'CONFLICT_STYLE',
    title: '衝突處理風格',
    version: CONFLICT_STYLE_VERSION,
    allContentKeys: CONFLICT_STYLE_CONTENT_KEYS,
    resultSchema,
    contentKeys: (result) => [result.primary, ...result.between].map(contentKeyOf),
    traitMappings: CONFLICT_STYLE_MAPPINGS,
    basePrice: 1,
    items: CONFLICT_STYLE_ITEMS,
    dimensions: CONFLICT_STYLE_INFO,
    view: 'quadrant',
    score: (answers) => {
        const scored = scoreDimensions(answers, CONFLICT_STYLE_ITEMS);
        const scores = CONFLICT_STYLE_DIMENSIONS.map((dimension) => {
            const entry = scored.find((candidate) => candidate.dimension === dimension);

            if (!entry) throw new Error(`No score for ${dimension}`);

            return {
                dimension, score: entry.score, level: entry.level ?? 'mid',
            };
        });
        const goals = scores.find((entry) => entry.dimension === 'goals');
        const relationship = scores.find((entry) => entry.dimension === 'relationship');

        if (!goals || !relationship) throw new Error('Missing a dimension');

        // A concern in the middle counts to the side it leans to, and the other side is named as a neighbour
        const goalsHigh = goals.score >= 50;
        const relationshipHigh = relationship.score >= 50;
        const between = [...(goals.level === 'mid' ? [quadrantOf(!goalsHigh, relationshipHigh)] : []), ...(relationship.level === 'mid' ? [quadrantOf(goalsHigh, !relationshipHigh)] : [])];

        return {
            scores, primary: quadrantOf(goalsHigh, relationshipHigh), between,
        };
    },
    notes: (result) => [
        result.between.length === 0
            ? `你的回答落在「${CONFLICT_QUADRANT_NAMES[result.primary]}」這一側的描述上。`
            : `你的回答落在「${[result.primary, ...result.between].map((quadrant) => CONFLICT_QUADRANT_NAMES[quadrant]).join('」與「')}」之間，這幾段描述都可以參考。`, '衝突處理的方式會隨對象與利害改變，沒有哪一種風格永遠最好，不是固定標籤，也不是診斷；這裡的類型名稱只是描述一種傾向，不是在說你是哪一種人。',
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
            system: 'CONFLICT_STYLE',
            position: result.between.length > 0
                ? `落在${quadrants.map((quadrant) => CONFLICT_QUADRANT_NAMES[quadrant]).join('、')}之間`
                : `落在${CONFLICT_QUADRANT_NAMES[result.primary]}這一側`,
            facts,
            interpretations: bodies.map((body) => ({
                title: body.title, text: body.summary,
            })),
            traits: leaning.map((entry) => termOf(entry.dimension, entry.level === 'high' ? 'high' : 'low')),
            advice: bodies.map((body) => body.growthAdvice).filter((text) => text.trim() !== ''),
            notes: ['衝突處理風格的題目由本站自行設計，沒有經過信度與效度驗證，不是任何既有量表；衝突處理的方式會隨對象與利害改變，不是固定標籤，也不是診斷。'],
            disclaimer: bodies[0]?.disclaimer ?? '本內容為自我探索參考，不是心理評估或診斷。',
            basis: [buildAssessmentBasis('CONFLICT_STYLE', CONFLICT_STYLE_VERSION)],
        };
    },
});
