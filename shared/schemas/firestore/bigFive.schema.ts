import { z } from 'zod';
import { BIG_FIVE_TRAITS } from '../../constants/bigFive';
import { epochMsSchema } from '../common';

export const bigFiveTraitSchema = z.enum(BIG_FIVE_TRAITS);

/** A score of a trait, 0 to 100 */
export const bigFiveScoreSchema = z.number().int().min(0).max(100);

export const bigFiveScoresSchema = z.object({
    openness: bigFiveScoreSchema,
    conscientiousness: bigFiveScoreSchema,
    extraversion: bigFiveScoreSchema,
    agreeableness: bigFiveScoreSchema,
    neuroticism: bigFiveScoreSchema,
});

/** users/{uid}/bigFiveAttempts/{attemptId} */
export const bigFiveAttemptDocSchema = z.object({
    /** The version of the questions it was answered against, so a later change of the questions does not change the scores */
    version: z.string().min(1),
    answers: z.array(z.object({
        questionId: z.string().min(1),
        value: z.number().int().min(1).max(5),
    })),
    scores: bigFiveScoresSchema,
    completedAt: epochMsSchema,
    /** completedAt + 3 months */
    expiresAt: epochMsSchema,
});

export type BigFiveAttemptDoc = z.infer<typeof bigFiveAttemptDocSchema>;
