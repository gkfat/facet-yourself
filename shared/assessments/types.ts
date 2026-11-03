// Plain `.ts` import specifiers: this file is also run directly by Node
// (type stripping) from scripts/, where extensionless imports do not resolve.
import type { z } from 'zod';
import type { MappingEntry } from '../ontology/schema.ts';
import type { SystemReportInput } from '../report/types.ts';
import type { FixedResultResponse } from '../schemas/api/fixedResult.schema.ts';
import type {
    AssessmentId, AssessmentSystemId,
} from './ids.ts';

/** One statement of a scale: answered from 1 to 5, and counted for one dimension (a reversed one is turned over before it counts) */
export type ScaleItem = {
    id: string;
    text: string;
    dimension: string;
    reversed?: boolean;
};

export type ScaleAnswer = {
    questionId: string;
    value: number;
};

/** One entry of a list to choose from (a value to pick and rank) */
export type SelectionOption = {
    id: string;
    name: string;
    description: string;
};

export type SelectionAnswer = {
    selected: readonly string[];
    ranked: readonly string[];
};

/** The scores of one dimension: 0 to 100 and, for a trait-like dimension, the level it falls in */
export type DimensionScore = {
    dimension: string;
    score: number;
    level: 'low' | 'mid' | 'high' | null;
};

/** What the contents of a result are, by content key, once they are read */
export type AssessmentContents = Readonly<Record<string, FixedResultResponse>>;

/** What the picks say together, as sentences: the kind of person they add up to, and where they may pull against each other */
export type AssessmentSynthesis = {
    portrait: string[];
    tensions: string[];
};

type Common = {
    id: AssessmentId;
    /** The id of the assessment as a system of a multi-dimension report */
    systemId: AssessmentSystemId;
    title: string;
    /** Carries `ref`: the items are our own design, not validated and not any existing scale */
    version: string;
    /** Every key the fixed contents of this assessment may have: each starts with the id and an underscore */
    allContentKeys: readonly string[];
    /** The keys of the contents needed to show a result; throws when the result is not a result of this assessment */
    contentKeysOf: (result: unknown) => string[];
    /** The result as it must be, or a thrown error: what is stored and what comes back out of the store go through it */
    parseResult: (raw: unknown) => unknown;
    /** A few lines about the result that the dimension scores do not say (a wing, a tie) shown at the top of the result page */
    notesOf?: (result: unknown) => string[];
    /** What all the picks of a result say together; for a pick from a list */
    synthesisOf?: (result: unknown) => AssessmentSynthesis;
    /** Multi-dimension: what a result is worth to a multi-dimension report */
    reportInput: (result: unknown, contents: AssessmentContents) => SystemReportInput;
    /** Multi-dimension: the terms of the assessment pointed at the ends of the trait axes */
    traitMappings: readonly MappingEntry[];
    /** Multi-dimension: what the assessment counts for in the price of a combination, in points */
    basePrice: number;
};

/** What a dimension is called, and what each end of it leans toward (never a judgement of better or worse) */
export type ScaleDimensionInfo = {
    id: string;
    name: string;
    low: string;
    high: string;
};

export type ScaleAssessment = Common & {
    kind: 'scale';
    items: readonly ScaleItem[];
    dimensions?: readonly ScaleDimensionInfo[];
    /** The five answers, from 1 to 5, when "agree" is not what is being asked (liking, for one) */
    answerLabels?: readonly string[];
    /** How the result page lays the result out: `ranked` is a list put in order, the first few told in full; `code` is the few that make up a code, with what the set says */
    view?: 'ranked' | 'code';
    evaluate: (answers: readonly ScaleAnswer[]) => unknown;
};

export type SelectionAssessment = Common & {
    kind: 'selection';
    options: readonly SelectionOption[];
    /** How many to choose, and how many of those to put in order */
    pick: number;
    rank: number;
    evaluate: (answer: SelectionAnswer) => unknown;
};

export type AssessmentDefinition = ScaleAssessment | SelectionAssessment;

type CommonSpec<Result> = {
    id: AssessmentId;
    systemId: AssessmentSystemId;
    title: string;
    version: string;
    allContentKeys: readonly string[];
    resultSchema: z.ZodType<Result>;
    contentKeys: (result: Result) => string[];
    reportInput: (result: Result, contents: AssessmentContents) => SystemReportInput;
    notes?: (result: Result) => string[];
    synthesis?: (result: Result) => AssessmentSynthesis;
    traitMappings: readonly MappingEntry[];
    basePrice: number;
};

export type ScaleAssessmentSpec<Result> = CommonSpec<Result> & {
    items: readonly ScaleItem[];
    dimensions?: readonly ScaleDimensionInfo[];
    answerLabels?: readonly string[];
    view?: 'ranked' | 'code';
    score: (answers: readonly ScaleAnswer[]) => Result;
};

export type SelectionAssessmentSpec<Result> = CommonSpec<Result> & {
    options: readonly SelectionOption[];
    pick: number;
    rank: number;
    score: (answer: SelectionAnswer) => Result;
};

function commonOf<Result>(spec: CommonSpec<Result>): Common {
    return {
        id: spec.id,
        systemId: spec.systemId,
        title: spec.title,
        version: spec.version,
        allContentKeys: spec.allContentKeys,
        contentKeysOf: (result) => spec.contentKeys(spec.resultSchema.parse(result)),
        parseResult: (raw) => spec.resultSchema.parse(raw),
        reportInput: (result, contents) => spec.reportInput(spec.resultSchema.parse(result), contents),
        synthesisOf: spec.synthesis ? (result) => spec.synthesis?.(spec.resultSchema.parse(result)) ?? {
            portrait: [], tensions: [],
        } : undefined,
        notesOf: spec.notes ? (result) => spec.notes?.(spec.resultSchema.parse(result)) ?? [] : undefined,
        traitMappings: spec.traitMappings,
        basePrice: spec.basePrice,
    };
}

/** An assessment of statements answered on a scale; its score is held to its own result schema, so a result is always well formed */
export function defineScaleAssessment<Result>(spec: ScaleAssessmentSpec<Result>): ScaleAssessment {
    return {
        ...commonOf(spec),
        kind: 'scale',
        items: spec.items,
        dimensions: spec.dimensions,
        answerLabels: spec.answerLabels,
        view: spec.view,
        evaluate: (answers) => spec.resultSchema.parse(spec.score(answers)),
    };
}

/** An assessment of picking from a list and putting the picks in order */
export function defineSelectionAssessment<Result>(spec: SelectionAssessmentSpec<Result>): SelectionAssessment {
    return {
        ...commonOf(spec),
        kind: 'selection',
        options: spec.options,
        pick: spec.pick,
        rank: spec.rank,
        evaluate: (answer) => spec.resultSchema.parse(spec.score(answer)),
    };
}
