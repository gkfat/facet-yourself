// Plain `.ts` import specifiers: this file is also run directly by Node
// (type stripping) from scripts/, where extensionless imports do not resolve.
import { z } from 'zod';
import { keywordRule } from '../ontology/mappings/keywordRule.ts';
import type { ReportFact } from '../report/types.ts';
import { buildAssessmentBasis } from '../utils/assessmentBasis.ts';
import { VIA_ENTRIES } from './viaData.ts';
import {
    rankDimensions, scoreDimensions,
} from './scoring.ts';
import {
    defineScaleAssessment, type ScaleDimensionInfo, type ScaleItem,
} from './types.ts';

/** Carries `ref`: the 48 statements are our own design after the 24 character strengths, not validated and not any existing instrument */
export const VIA_VERSION = 'via-strengths-ref-v1';

/** How many of the strengths stand out in a result */
export const VIA_TOP = 5;

export const VIA_STRENGTH_IDS: readonly string[] = VIA_ENTRIES.map((entry) => entry.id);

export const VIA_INFO: readonly ScaleDimensionInfo[] = VIA_ENTRIES.map((entry) => ({
    id: entry.id, name: entry.name, high: entry.short, low: '較不突出',
}));

/** The statements in the order they are asked: one of each strength in turn, so that no page is about one strength only */
export const VIA_ITEMS: readonly ScaleItem[] = Array.from({ length: 2 }, (_, round) => VIA_ENTRIES.map((entry) => ({
    strength: entry.id, text: entry.statements[round] ?? '',
}))).flat().map((entry, index): ScaleItem => ({
    id: `vi${String(index + 1).padStart(2, '0')}`,
    text: entry.text,
    dimension: entry.strength,
}));

const contentKeyOf = (id: string) => `via-strengths_${id}`;

const termOf = (id: string) => `via:${id}`;

export const VIA_TERMS: readonly string[] = VIA_STRENGTH_IDS.map(termOf);

const rule = keywordRule('VIA_STRENGTHS');

const VIA_MAPPINGS = VIA_ENTRIES.flatMap((entry) => rule(termOf(entry.id), ...entry.ends));

const strengthId = z.string().refine((id) => VIA_STRENGTH_IDS.includes(id));

const resultSchema = z.object({
    /** All 24, the most outstanding first; the same score keeps the order of the list */
    scores: z.array(z.object({
        dimension: strengthId,
        score: z.number().int().min(0).max(100),
        level: z.null(),
    })).length(VIA_ENTRIES.length),
    /** The ones that stand out most, the first first */
    top: z.array(strengthId).length(VIA_TOP),
    /** The fifth and the sixth scored the same, so the order of the list decided which one is in the top */
    tieBroken: z.boolean(),
});

const nameOf = (id: string) => VIA_ENTRIES.find((entry) => entry.id === id)?.name ?? id;

export const VIA_ASSESSMENT = defineScaleAssessment({
    id: 'via-strengths',
    systemId: 'VIA_STRENGTHS',
    title: '品格優勢',
    version: VIA_VERSION,
    allContentKeys: VIA_STRENGTH_IDS.map(contentKeyOf),
    resultSchema,
    contentKeys: (result) => result.top.map(contentKeyOf),
    traitMappings: VIA_MAPPINGS,
    basePrice: 1,
    items: VIA_ITEMS,
    dimensions: VIA_INFO,
    view: 'ranked',
    score: (answers) => {
        const scored = scoreDimensions(answers, VIA_ITEMS, false);
        const scores = VIA_STRENGTH_IDS.map((id) => {
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
        const fifth = ranked[VIA_TOP - 1];
        const sixth = ranked[VIA_TOP];

        return {
            scores: ranked,
            top: ranked.slice(0, VIA_TOP).map((entry) => entry.dimension),
            tieBroken: fifth !== undefined && sixth !== undefined && fifth.score === sixth.score,
        };
    },
    notes: (result) => [
        `你最突出的 ${VIA_TOP} 項品格優勢：${result.top.map(nameOf).join('、')}。`,
        ...(result.tieBroken ? [`第 ${VIA_TOP} 名和第 ${VIA_TOP + 1} 名的分數相同，依固定的順序決定了哪一項進入前 ${VIA_TOP}。`] : []),
        '排在後面的優勢只是「較不突出」，不代表不足；每個人都擁有全部的優勢，只是用的程度與場合不同。',
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
            label: `第 ${index + 1} 突出的品格優勢`, value: nameOf(id), term: termOf(id),
        }));

        return {
            system: 'VIA_STRENGTHS',
            position: result.top.map(nameOf).join('、'),
            facts,
            interpretations: bodies.map(({
                id, body,
            }) => ({
                title: body.title, text: body.summary, term: termOf(id),
            })),
            traits: result.top.map(termOf),
            advice: bodies.map(({ body }) => body.growthAdvice).filter((text) => text.trim() !== ''),
            notes: ['品格優勢的題目由本站自行設計，沒有經過信度與效度驗證，不是任何既有量表；排在後面的只是較不突出，不代表不足。'],
            disclaimer: bodies[0]?.body.disclaimer ?? '本內容為自我探索參考，不是心理評估或診斷。',
            basis: [buildAssessmentBasis('VIA_STRENGTHS', VIA_VERSION)],
        };
    },
});
