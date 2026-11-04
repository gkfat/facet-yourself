import { z } from 'zod';
import {
    snapshotBlockSchema, snapshotSystemSchema,
} from './reportSnapshot.schema';
import { epochMsSchema } from '../common';

export const AI_REPORT_STATUSES = [
    'GENERATING',
    'COMPLETED',
    'FAILED',
] as const;

/** One of the single-dimension reports an AI report was made from: where to find it, and where the member stood in it then. */
export const aiReportSourceSchema = z.object({
    system: snapshotSystemSchema,
    snapshotId: z.string().min(1),
    position: z.string().min(1),
});

/**
 * users/{uid}/aiReports/{id}: the one kind of AI report, made from one or more of the member's single-dimension reports
 * and, when they wrote one, a question. The id is the client's Idempotency-Key. It carries its own progress (the points
 * are given back on a failure) and holds what the list needs on its own, so it stays readable when a source report is gone.
 */
export const aiReportDocSchema = z.object({
    sources: z.array(aiReportSourceSchema).min(1),
    /** What the member asked, or null when they only asked for the report */
    question: z.string().min(1).nullable(),
    status: z.enum(AI_REPORT_STATUSES),
    /** Why it failed (the points were given back); null otherwise */
    failureReason: z.string().nullable(),
    /** Empty until the report is made */
    blocks: z.array(snapshotBlockSchema),
    /** The points it cost */
    cost: z.number().int().positive(),
    modelName: z.string().min(1).nullable(),
    promptVersion: z.string().min(1).nullable(),
    createdAt: epochMsSchema,
    /** createdAt + 6 months; removed by the daily expiry job (no TTL) */
    expiresAt: epochMsSchema,
});

export type AiReportSource = z.infer<typeof aiReportSourceSchema>;
export type AiReportDoc = z.infer<typeof aiReportDocSchema>;
