import { z } from 'zod';
import { ASSESSMENT_IDS } from '../../assessments/ids';
import { epochMsSchema } from '../common';

export const assessmentIdSchema = z.enum(ASSESSMENT_IDS);

/** What was answered: a scale has the answers of its items; a pick has what was picked and the part of it put in order */
export const assessmentAnswersSchema = z.object({
    scaleAnswers: z.array(z.object({
        questionId: z.string().min(1),
        value: z.number().int().min(1).max(5),
    })).default([]),
    selected: z.array(z.string().min(1)).default([]),
    ranked: z.array(z.string().min(1)).default([]),
});

/** users/{uid}/assessmentAttempts/{attemptId} */
export const assessmentAttemptDocSchema = z.object({
    assessmentId: assessmentIdSchema,
    /** The version of the items it was answered against, so a later change of the items does not change the result */
    version: z.string().min(1),
    answers: assessmentAnswersSchema,
    /** The result of that assessment: its shape is the assessment's own, held to its schema when read */
    result: z.record(z.string(), z.unknown()),
    completedAt: epochMsSchema,
    /** completedAt + 3 months */
    expiresAt: epochMsSchema,
});

export type AssessmentAnswers = z.infer<typeof assessmentAnswersSchema>;
export type AssessmentAttemptDoc = z.infer<typeof assessmentAttemptDocSchema>;
