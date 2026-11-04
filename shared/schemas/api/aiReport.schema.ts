import { z } from 'zod';
import { aiQuestionSchema } from './aiQuestion.schema';
import {
    MULTI_REPORT_SYSTEMS, isMultiReportSystem,
} from '../../report/systems';
import {
    AI_REPORT_STATUSES, aiReportDocSchema,
} from '../firestore/aiReport.schema';

/** Which lasting systems the AI report is made from: one or more, none twice (the Idempotency-Key header is the job id). */
export const aiReportRequestSchema = z.object({
    systems: z.array(z.string().refine(isMultiReportSystem, 'not a system that can be analysed')).min(1).max(MULTI_REPORT_SYSTEMS.length)
        .refine((systems) => new Set(systems).size === systems.length, 'a system is chosen once'),
    question: aiQuestionSchema,
});

export const aiReportAcceptedSchema = z.object({
    id: z.string(),
    status: z.enum(AI_REPORT_STATUSES),
    pointsDeducted: z.number().int().nonnegative(),
});

/** One AI report in full, to be read. */
export const aiReportItemSchema = aiReportDocSchema.omit({ expiresAt: true }).extend({ id: z.string() });

/** One row of the member's list of AI reports: what the card needs, without the report itself. */
export const aiReportSummarySchema = aiReportItemSchema.omit({
    blocks: true, modelName: true, promptVersion: true,
});

export type AiReportRequest = z.infer<typeof aiReportRequestSchema>;
export type AiReportAccepted = z.infer<typeof aiReportAcceptedSchema>;
export type AiReportItem = z.infer<typeof aiReportItemSchema>;
export type AiReportSummary = z.infer<typeof aiReportSummarySchema>;
