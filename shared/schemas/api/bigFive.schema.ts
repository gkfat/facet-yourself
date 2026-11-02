import { z } from 'zod';
import { BIG_FIVE_QUESTIONS } from '../../constants/bigFive';
import { COMPARISON_PAIRS } from '../../utils/bigFiveMbtiComparison';
import { mbtiTypeSchema } from '../common';
import { bigFiveTraitSchema } from '../firestore/bigFive.schema';
import { fixedResultResponseSchema } from './fixedResult.schema';

/** The answers of a submission: the version they were answered against and one answer for each question (checked by the scoring, which names what is wrong) */
export const bigFiveSubmissionRequestSchema = z.object({
    version: z.string().min(1),
    answers: z.array(z.object({
        questionId: z.string().min(1),
        value: z.number(),
    })).min(1).max(BIG_FIVE_QUESTIONS.length * 2),
});

export const bigFiveLevelSchema = z.enum([
    'low',
    'mid',
    'high',
]);

export const bigFiveTraitResultSchema = z.object({
    trait: bigFiveTraitSchema,
    name: z.string(),
    /** 0 to 100: how far the member's own answers lean to the high end of the trait, not a rank among other people */
    score: z.number().int().min(0).max(100),
    level: bigFiveLevelSchema,
    content: fixedResultResponseSchema,
});

export const bigFiveComparisonItemSchema = z.object({
    pair: z.enum(COMPARISON_PAIRS),
    trait: bigFiveTraitSchema,
    letter: z.string().length(1),
    result: z.enum([
        'match',
        'differ',
        'neutral',
    ]),
    /** The note on the match or the difference; null when the trait is in the middle */
    content: fixedResultResponseSchema.nullable(),
});

export const bigFiveCombinationSchema = z.object({
    traits: z.tuple([bigFiveTraitSchema, bigFiveTraitSchema]),
    /** The side of each trait the combination is told for */
    sides: z.tuple([z.enum(['high', 'low']), z.enum(['high', 'low'])]),
    content: fixedResultResponseSchema,
});

export const bigFiveResultSchema = z.object({
    version: z.string(),
    traits: z.array(bigFiveTraitResultSchema),
    /** What pairs of traits say together: only the pairs of which neither trait is in the middle */
    combinations: z.array(bigFiveCombinationSchema),
    /** The MBTI type it is held against; null when there is none, and then there is no comparison */
    mbti: mbtiTypeSchema.nullable(),
    comparison: z.array(bigFiveComparisonItemSchema),
    completedAt: z.number().int(),
    /** Whether it was saved for a signed-in member */
    persisted: z.boolean(),
    /** The result is valid but could not be stored; the client may retry */
    saveFailed: z.boolean(),
    expiresAt: z.number().int().nullable(),
});

export type BigFiveSubmissionRequest = z.infer<typeof bigFiveSubmissionRequestSchema>;
export type BigFiveResult = z.infer<typeof bigFiveResultSchema>;
