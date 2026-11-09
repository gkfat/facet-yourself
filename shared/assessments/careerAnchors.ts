// Plain `.ts` import specifiers: this file is also run directly by Node
// (type stripping) from scripts/, where extensionless imports do not resolve.
import { z } from 'zod';
import { keywordRule } from '../ontology/mappings/keywordRule.ts';
import type { ReportFact } from '../report/types.ts';
import { buildAssessmentBasis } from '../utils/assessmentBasis.ts';
import { CAREER_ANCHOR_ENTRIES } from './careerAnchorsData.ts';
import {
    rankDimensions, scoreDimensions,
} from './scoring.ts';
import {
    defineScaleAssessment, type ScaleDimensionInfo, type ScaleItem,
} from './types.ts';

/** Carries `ref`: the 48 statements are our own design after eight work motives, not validated and not any existing inventory */
export const CAREER_ANCHORS_VERSION = 'career-anchors-ref-v1';

/** How many of the motives stand out in a result */
export const CAREER_ANCHORS_TOP = 3;

/** The motives in the fixed order that also settles a tie: the one earlier in this list goes first */
export const CAREER_ANCHOR_IDS: readonly string[] = CAREER_ANCHOR_ENTRIES.map((entry) => entry.id);

export const CAREER_ANCHORS_INFO: readonly ScaleDimensionInfo[] = CAREER_ANCHOR_ENTRIES.map((entry) => ({
    id: entry.id, name: entry.name, high: entry.short, low: '目前較不突出',
}));

/** The statements in the order they are asked: one of each motive in turn, so that no page is about one motive only */
export const CAREER_ANCHORS_ITEMS: readonly ScaleItem[] = Array.from({ length: 6 }, (_, round) => CAREER_ANCHOR_ENTRIES.map((entry) => ({
    anchor: entry.id, text: entry.statements[round] ?? '',
}))).flat().map((entry, index): ScaleItem => ({
    id: `ca${String(index + 1).padStart(2, '0')}`,
    text: entry.text,
    dimension: entry.anchor,
}));

const contentKeyOf = (id: string) => `career-anchors_${id}`;

const termOf = (id: string) => `career-anchors:${id}`;

export const CAREER_ANCHORS_TERMS: readonly string[] = CAREER_ANCHOR_IDS.map(termOf);

const rule = keywordRule('CAREER_ANCHORS');

const CAREER_ANCHORS_MAPPINGS = CAREER_ANCHOR_ENTRIES.flatMap((entry) => rule(termOf(entry.id), ...entry.ends));

const anchorId = z.string().refine((id) => CAREER_ANCHOR_IDS.includes(id));

const resultSchema = z.object({
    /** All eight, the most outstanding first; the same score keeps the order of the list */
    scores: z.array(z.object({
        dimension: anchorId,
        score: z.number().int().min(0).max(100),
        level: z.null(),
    })).length(CAREER_ANCHOR_ENTRIES.length),
    /** The ones that stand out most, the first first */
    top: z.array(anchorId).length(CAREER_ANCHORS_TOP),
    /** The third and the fourth scored the same, so the order of the list decided which one is in the top */
    tieBroken: z.boolean(),
});

const nameOf = (id: string) => CAREER_ANCHOR_ENTRIES.find((entry) => entry.id === id)?.name ?? id;

export const CAREER_ANCHORS_ASSESSMENT = defineScaleAssessment({
    id: 'career-anchors',
    systemId: 'CAREER_ANCHORS',
    title: '生涯錨',
    version: CAREER_ANCHORS_VERSION,
    allContentKeys: CAREER_ANCHOR_IDS.map(contentKeyOf),
    resultSchema,
    contentKeys: (result) => result.top.map(contentKeyOf),
    traitMappings: CAREER_ANCHORS_MAPPINGS,
    basePrice: 1,
    items: CAREER_ANCHORS_ITEMS,
    dimensions: CAREER_ANCHORS_INFO,
    view: 'ranked',
    score: (answers) => {
        const scored = scoreDimensions(answers, CAREER_ANCHORS_ITEMS, false);
        const scores = CAREER_ANCHOR_IDS.map((id) => {
            const entry = scored.find((candidate) => candidate.dimension === id);

            if (!entry) throw new Error(`No score for ${id}`);

            return {
                dimension: id, score: entry.score, level: null,
            };
        });
        // The same score keeps the order of the list, so the same answers always give the same ranking
        const ranked = rankDimensions(scores).map((entry) => ({
            dimension: entry.dimension, score: entry.score, level: null,
        }));
        const third = ranked[CAREER_ANCHORS_TOP - 1];
        const fourth = ranked[CAREER_ANCHORS_TOP];

        return {
            scores: ranked,
            top: ranked.slice(0, CAREER_ANCHORS_TOP).map((entry) => entry.dimension),
            tieBroken: third !== undefined && fourth !== undefined && third.score === fourth.score,
        };
    },
    notes: (result) => [
        `目前最突出的 ${CAREER_ANCHORS_TOP} 個工作動機：${result.top.map(nameOf).join('、')}。`,
        ...(result.tieBroken ? [`第 ${CAREER_ANCHORS_TOP} 名和第 ${CAREER_ANCHORS_TOP + 1} 名的分數相同，依固定的順序決定了哪一項進入前 ${CAREER_ANCHORS_TOP}。`] : []),
        '這是工作動機的探索，不是職業推薦，也不是固定標籤；排在後面的只是目前較不突出，動機也會隨人生階段改變。',
    ],
    reportInput: (result, contents) => {
        const bodies = result.top.flatMap((id) => {
            const body = contents[contentKeyOf(id)];

            return body ? [
                {
                    id, body,
                },
            ] : [];
        });
        const facts: ReportFact[] = result.top.map((id, index) => ({
            label: `第 ${index + 1} 突出的工作動機`, value: nameOf(id), term: termOf(id),
        }));

        return {
            system: 'CAREER_ANCHORS',
            position: result.top.map(nameOf).join('、'),
            facts,
            interpretations: bodies.map(({
                id, body,
            }) => ({
                title: body.title, text: body.summary, term: termOf(id),
            })),
            traits: result.top.map(termOf),
            advice: bodies.map(({ body }) => body.growthAdvice).filter((text) => text.trim() !== ''),
            notes: ['生涯錨的題目由本站自行設計，沒有經過信度與效度驗證，不是任何既有量表；這是工作動機的探索，不是職業推薦，也不是固定標籤。'],
            disclaimer: bodies[0]?.body.disclaimer ?? '本內容為自我探索參考，不是心理評估或診斷。',
            basis: [buildAssessmentBasis('CAREER_ANCHORS', CAREER_ANCHORS_VERSION)],
        };
    },
});
