import type { BloodType } from '../schemas/common';

export const EXPLORATION_LAYERS = [
    'ZODIAC',
    'BLOOD',
    'MBTI',
    'HUMAN_DESIGN',
    'NUMEROLOGY',
    'BAZI',
    'MAYA_KIN',
] as const;

export type ExplorationLayer = typeof EXPLORATION_LAYERS[number];

/** What is known about the visitor, whether a signed-in member or a guest. */
export type ExplorationFacts = {
    birthDate: string | null;
    /** HH:mm; the BaZi chart needs it */
    birthTime: string | null;
    bloodType: BloodType;
    mbti: string | null;
    hasHumanDesign: boolean;
    /** A Big Five result that has not expired; it is not one of the layers a multi-dimension analysis combines */
    hasBigFive?: boolean;
    /** How many self-analyses have a result that has not expired: each one is a dimension a multi-dimension analysis can combine */
    assessmentsDone?: number;
};

export type ExplorationProgress = {
    done: Record<ExplorationLayer, boolean>;
    completed: number;
    total: number;
    /** A multi-dimension analysis combines at least two dimensions. */
    multiDimensionUnlocked: boolean;
    /** The layer to suggest next, or null when everything is done. */
    next: ExplorationLayer | null;
    /** The Big Five result is there. Kept apart from the layers: it changes neither their count nor what can be combined. */
    bigFiveDone: boolean;
};

const MIN_ANALYSIS_DIMENSIONS = 2;

/** Order in which layers are suggested: quickest first. The life path number is not suggested: the birth date gives it. */
const SUGGESTION_ORDER: readonly ExplorationLayer[] = [
    'ZODIAC',
    'MBTI',
    'BLOOD',
    'HUMAN_DESIGN',
];

export function explorationProgress(facts: ExplorationFacts): ExplorationProgress {
    const done: Record<ExplorationLayer, boolean> = {
        ZODIAC: facts.birthDate !== null,
        BLOOD: facts.bloodType !== 'UNKNOWN',
        MBTI: facts.mbti !== null,
        HUMAN_DESIGN: facts.hasHumanDesign,
        // The life path number comes from the birth date alone
        NUMEROLOGY: facts.birthDate !== null,
        // The four pillars need the birth hour
        BAZI: facts.birthDate !== null && facts.birthTime !== null,
        // The Kin comes from the birth date alone
        MAYA_KIN: facts.birthDate !== null,
    };

    return {
        done,
        completed: EXPLORATION_LAYERS.filter((layer) => done[layer]).length,
        total: EXPLORATION_LAYERS.length,
        multiDimensionUnlocked: EXPLORATION_LAYERS.filter((layer) => done[layer]).length + (facts.assessmentsDone ?? 0) >= MIN_ANALYSIS_DIMENSIONS,
        next: SUGGESTION_ORDER.find((layer) => !done[layer]) ?? null,
        bigFiveDone: facts.hasBigFive === true,
    };
}
