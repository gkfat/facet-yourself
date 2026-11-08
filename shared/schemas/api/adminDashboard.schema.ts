import { z } from 'zod';
import { epochMsSchema } from '../common';
import { MAPPING_SYSTEMS } from '../../ontology/schema';
import { AI_REPORT_STATUSES } from '../firestore/aiReport.schema';
import { POINT_TRANSACTION_REASONS } from '../firestore/points.schema';

export const ADMIN_DASHBOARD_DEFAULT_DAYS = 30;
export const ADMIN_DASHBOARD_MAX_DAYS = 60;

export const adminDashboardRangeQuerySchema = z.object({ days: z.coerce.number().int().min(1).max(ADMIN_DASHBOARD_MAX_DAYS).default(ADMIN_DASHBOARD_DEFAULT_DAYS) });

const dateKeySchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

export const adminMembersSummarySchema = z.object({
    total: z.number().int().nonnegative(),
    /** Members who signed up since the start of the current Taipei month. */
    thisMonth: z.number().int().nonnegative(),
    monthStart: epochMsSchema,
});

/** Snapshots of single-dimension analyses per system, most first. */
export const adminAnalysisRankSchema = z.object({
    items: z.array(z.object({
        system: z.enum(MAPPING_SYSTEMS),
        /** The Chinese name to show. */
        label: z.string().min(1),
        count: z.number().int().positive(),
    })),
});

export const adminDailyDrawsSchema = z.object({
    days: z.array(z.object({
        date: dateKeySchema,
        tarot: z.number().int().nonnegative(),
        rune: z.number().int().nonnegative(),
    })),
    /** When the oldest kept draw was made: counts before it do not exist. null when there is none. */
    earliestDrawAt: epochMsSchema.nullable(),
});

export const adminDailyPointsSchema = z.object({
    days: z.array(z.object({
        date: dateKeySchema,
        deducted: z.number().int().nonnegative(),
        refunded: z.number().int().nonnegative(),
    })),
    /** Points deducted over the whole range, by what they were spent on. */
    deductedByReason: z.array(z.object({
        reason: z.enum(POINT_TRANSACTION_REASONS),
        deducted: z.number().int().nonnegative(),
    })),
});

export const adminDailyAiCostSchema = z.object({
    days: z.array(z.object({
        date: dateKeySchema,
        /** Estimated, in USD. */
        cost: z.number().nonnegative(),
        inputTokens: z.number().int().nonnegative(),
        outputTokens: z.number().int().nonnegative(),
    })),
    month: z.object({
        cost: z.number().nonnegative(),
        inputTokens: z.number().int().nonnegative(),
        outputTokens: z.number().int().nonnegative(),
    }),
    /** NT$ per US$, fixed: the costs above are in USD and multiplying by this gives New Taiwan dollars. */
    usdToTwdRate: z.number().positive(),
});

export const ADMIN_AI_REPORT_SCAN_LIMIT = 1000;
export const ADMIN_AI_REPORT_QUESTION_LIMIT = 50;

/**
 * Multi-dimension AI reports: how many were made and how they ended, how many dimensions they used, and what the
 * members asked. The questions carry no member identity.
 */
export const adminAiReportsSchema = z.object({
    days: z.array(z.object({
        date: dateKeySchema,
        completed: z.number().int().nonnegative(),
        failed: z.number().int().nonnegative(),
    })),
    totals: z.object({
        completed: z.number().int().nonnegative(),
        failed: z.number().int().nonnegative(),
        /** Still being made, or lost its worker and not read since */
        generating: z.number().int().nonnegative(),
    }),
    /** How many reports used this many dimensions, fewest dimensions first. */
    dimensionCounts: z.array(z.object({
        dimensions: z.number().int().positive(),
        count: z.number().int().positive(),
    })),
    /** The most dimensions one report used in the range; 0 when there is none. */
    maxDimensions: z.number().int().nonnegative(),
    /** Newest first, only reports where the member wrote a question. */
    questions: z.array(z.object({
        createdAt: epochMsSchema,
        status: z.enum(AI_REPORT_STATUSES),
        systems: z.array(z.string().min(1)),
        question: z.string().min(1),
    })),
    /** How many reports were read to make these figures. */
    scanned: z.number().int().nonnegative(),
    /** True when there were more reports than the scan limit, so the oldest days are incomplete. */
    truncated: z.boolean(),
});

export type AdminMembersSummary = z.infer<typeof adminMembersSummarySchema>;
export type AdminAnalysisRank = z.infer<typeof adminAnalysisRankSchema>;
export type AdminDailyDraws = z.infer<typeof adminDailyDrawsSchema>;
export type AdminDailyPoints = z.infer<typeof adminDailyPointsSchema>;
export type AdminDailyAiCost = z.infer<typeof adminDailyAiCostSchema>;
export type AdminAiReports = z.infer<typeof adminAiReportsSchema>;
