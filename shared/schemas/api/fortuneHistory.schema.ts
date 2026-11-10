import { z } from 'zod';
import { fixedResultResponseSchema } from './fixedResult.schema';
import { hexagramCastSchema } from './hexagram.schema';
import { runeResponseSchema } from './rune.schema';
import { tarotCardResponseSchema } from './tarot.schema';
import {
    isRealDate, isoDateSchema,
} from '../common';
import { FORTUNE_HISTORY_PAGE_DAYS } from '../../constants/fortuneHistory';

const taipeiDateSchema = isoDateSchema.refine(isRealDate, 'Not a real calendar date');

/**
 * Query of the history. Only a cursor and a page size are accepted: who is asked about and what today is come from the
 * server. Whether `before` lies inside the window is checked against the clock by the service.
 */
export const fortuneHistoryQuerySchema = z.strictObject({
    /** Cursor: only dates before this one are returned (the `nextBefore` of the page before) */
    before: taipeiDateSchema.optional(),
    limit: z.coerce.number().int().min(1).max(FORTUNE_HISTORY_PAGE_DAYS).default(FORTUNE_HISTORY_PAGE_DAYS),
});

/** A reading that may be gone (a written content that has been taken down): the record stays, the reading is null. */
const readingSchema = fixedResultResponseSchema.nullable();

export const historyTarotItemSchema = z.object({
    card: tarotCardResponseSchema,
    content: readingSchema,
});

export const historyRuneItemSchema = z.object({
    rune: runeResponseSchema,
    content: readingSchema,
});

/** A cast as the day card shows it: like today's cast, but each reading may be missing. */
export const historyHexagramItemSchema = hexagramCastSchema.extend({
    content: readingSchema,
    changed: z.object({
        face: hexagramCastSchema.shape.primary,
        content: readingSchema,
    }).nullable(),
    movingLine: z.object({
        position: z.number().int().min(1),
        statement: z.string().min(1),
        content: readingSchema,
    }).nullable(),
});

export const fortuneHistoryDaySchema = z.object({
    /** Taipei calendar date, `YYYY-MM-DD` */
    date: z.string(),
    tarot: historyTarotItemSchema.nullable(),
    rune: historyRuneItemSchema.nullable(),
    /** The casts of the day in the order they were cast */
    hexagrams: z.array(historyHexagramItemSchema),
});

export const fortuneHistoryResponseSchema = z.object({
    /** The dates that have a record, newest first; a date without any record is never listed */
    days: z.array(fortuneHistoryDaySchema),
    /** The oldest date of this page when an older one exists, otherwise null */
    nextBefore: z.string().nullable(),
    /** True when the casts of the window were more than could be read, so some are missing */
    truncated: z.boolean(),
});

export type FortuneHistoryQuery = z.infer<typeof fortuneHistoryQuerySchema>;
export type HistoryTarotItem = z.infer<typeof historyTarotItemSchema>;
export type HistoryRuneItem = z.infer<typeof historyRuneItemSchema>;
export type HistoryHexagramItem = z.infer<typeof historyHexagramItemSchema>;
export type FortuneHistoryDay = z.infer<typeof fortuneHistoryDaySchema>;
export type FortuneHistoryResponse = z.infer<typeof fortuneHistoryResponseSchema>;
