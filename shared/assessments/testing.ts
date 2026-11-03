// Fixtures for the tests of the assessment framework: two small made-up assessments, one of each kind. They are not part
// of the registry; they stand in for it where a test needs a definition before the real ones exist.
import { z } from 'zod';
import type { SystemReportInput } from '../report/types.ts';
import {
    rankDimensions, scoreDimensions, 
} from './scoring.ts';
import {
    defineScaleAssessment, defineSelectionAssessment,
    type DimensionScore, type ScaleItem, type SelectionOption,
} from './types.ts';

const dimensionScoreSchema = z.object({
    dimension: z.string(),
    score: z.number().int().min(0).max(100),
    level: z.enum([
        'low',
        'mid',
        'high',
    ]).nullable(),
});

export const FAKE_SCALE_ITEMS: readonly ScaleItem[] = [
    {
        id: 'fs01', text: '我喜歡嘗試新的事', dimension: 'novelty',
    },
    {
        id: 'fs02', text: '我喜歡固定的做法', dimension: 'novelty', reversed: true,
    },
    {
        id: 'fs03', text: '我會事先計畫', dimension: 'order',
    },
    {
        id: 'fs04', text: '我常把東西隨手放', dimension: 'order', reversed: true,
    },
];

const reportInputOf = (system: SystemReportInput['system']) => (): SystemReportInput => ({
    system,
    position: '測試用的位置結論',
    facts: [],
    interpretations: [],
    traits: [],
    advice: [],
    disclaimer: '測試用',
    basis: [],
});

/** A scale of two dimensions, the first with a reversed item; defined as the made-up "hexaco" so it fits the ids there are */
export const fakeScaleAssessment = () => defineScaleAssessment({
    id: 'hexaco',
    systemId: 'HEXACO',
    title: '測試用量表',
    version: 'fake-ref-v1',
    allContentKeys: [
        'hexaco_novelty_low',
        'hexaco_novelty_mid',
        'hexaco_novelty_high',
        'hexaco_order_low',
        'hexaco_order_mid',
        'hexaco_order_high',
    ],
    resultSchema: z.object({ scores: z.array(dimensionScoreSchema) }),
    contentKeys: (result) => result.scores.map((score) => `hexaco_${score.dimension}_${score.level ?? 'mid'}`),
    reportInput: reportInputOf('ZODIAC'),
    traitMappings: [],
    basePrice: 1,
    items: FAKE_SCALE_ITEMS,
    score: (answers) => ({ scores: scoreDimensions(answers, FAKE_SCALE_ITEMS) }),
});

export const FAKE_OPTIONS: readonly SelectionOption[] = [
    'a',
    'b',
    'c',
    'd',
    'e',
].map((id) => ({
    id, name: `項目 ${id}`, description: `項目 ${id} 的說明`,
}));

/** A pick of 3 from 5, the first 2 of them ranked; defined as the made-up "core-values" */
export const fakeSelectionAssessment = () => defineSelectionAssessment({
    id: 'core-values',
    systemId: 'CORE_VALUES',
    title: '測試用挑選',
    version: 'fake-ref-v1',
    allContentKeys: FAKE_OPTIONS.map((option) => `core-values_${option.id}`),
    resultSchema: z.object({
        selected: z.array(z.string()),
        top: z.array(z.string()),
    }),
    contentKeys: (result) => result.top.map((id) => `core-values_${id}`),
    reportInput: reportInputOf('ZODIAC'),
    traitMappings: [],
    basePrice: 1,
    options: FAKE_OPTIONS,
    pick: 3,
    rank: 2,
    score: (answer) => ({
        selected: [...answer.selected], top: [...answer.ranked],
    }),
});

export { rankDimensions };
export type { DimensionScore };
