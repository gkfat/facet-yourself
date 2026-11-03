import { z } from 'zod';
import { assessmentIdSchema } from '../firestore/assessmentAttempt.schema';
import { fixedResultResponseSchema } from './fixedResult.schema';

/** The assessment named in a path */
export const assessmentParamSchema = assessmentIdSchema;

/** The answers of a submission: a scale sends `answers`; a pick sends `selected` and `ranked`. What is wrong with them is named by the check of the assessment itself. */
export const assessmentSubmissionRequestSchema = z.object({
    version: z.string().min(1),
    answers: z.array(z.object({
        questionId: z.string().min(1),
        value: z.number(),
    })).max(400).optional(),
    selected: z.array(z.string().min(1)).max(100).optional(),
    ranked: z.array(z.string().min(1)).max(100).optional(),
});

export const assessmentResultSchema = z.object({
    assessmentId: assessmentIdSchema,
    version: z.string(),
    /** The assessment's own result (dimension scores, a type, a code, the top ones, the picks) */
    result: z.record(z.string(), z.unknown()),
    content: z.array(fixedResultResponseSchema),
    completedAt: z.number().int(),
    /** Whether it was saved for a signed-in member */
    persisted: z.boolean(),
    /** The result is valid but could not be stored; the client may retry */
    saveFailed: z.boolean(),
    expiresAt: z.number().int().nullable(),
});

/** What a card of the home page or the page of the reports needs of an assessment */
export const assessmentSummarySchema = z.object({
    assessmentId: assessmentIdSchema,
    title: z.string(),
    kind: z.enum(['scale', 'selection']),
    version: z.string(),
    entryEnabled: z.boolean(),
    /** Only for a signed-in member: whether there is a result that has not expired */
    hasResult: z.boolean().optional(),
    resultExpiresAt: z.number().int().nullable().optional(),
});

export type AssessmentSubmissionRequest = z.infer<typeof assessmentSubmissionRequestSchema>;
export type AssessmentResult = z.infer<typeof assessmentResultSchema>;
export type AssessmentSummary = z.infer<typeof assessmentSummarySchema>;
