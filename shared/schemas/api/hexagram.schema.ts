import { z } from 'zod';
import { fixedResultResponseSchema } from './fixedResult.schema';
import { hexagramLinesSchema } from '../firestore/hexagramDraw.schema';
import {
    HEXAGRAM_COUNT, HEXAGRAM_LINE_COUNT, TRIGRAM_NAMES,
} from '../../constants/hexagramShape';

const trigramSchema = z.enum(TRIGRAM_NAMES);

/** A hexagram as the page draws it: name, trigrams and the classical text of the whole hexagram. */
export const hexagramFaceSchema = z.object({
    order: z.number().int().min(1).max(HEXAGRAM_COUNT),
    name: z.string().min(1),
    upper: trigramSchema,
    lower: trigramSchema,
    judgment: z.string().min(1),
    tuan: z.string().min(1),
    image: z.string().min(1),
});

/** How much of the text the cast is read with, see `readingPlan`. */
export const readingModeSchema = z.enum([
    'none',
    'single',
    'multiple',
]);

/**
 * Body of a cast request. Only two things are accepted: an idempotency key, and the member's confirmation that this
 * cast costs a point (`confirmCharge`, sent after the page showed the price and the member agreed). No date, identity,
 * lines, number of the cast or free text can be sent. Without the confirmation a request never costs anything: when the
 * day already has a cast it answers with the latest one.
 */
export const hexagramCastRequestSchema = z.strictObject({
    requestId: z.uuid().optional(),
    confirmCharge: z.boolean().optional(),
});

/** What the next cast costs in points: 0 for the free one, 1 after it, null when there can be no more (a visitor's). */
export const nextCostSchema = z.union([
    z.literal(0),
    z.literal(1),
    z.null(),
]);

export const hexagramCastSchema = z.object({
    /** Number of the cast of the day: 0 is the free one */
    seq: z.number().int().nonnegative(),
    paid: z.boolean(),
    /** The six lines from the bottom: 6 old yin, 7 young yang, 8 young yin, 9 old yang */
    lines: hexagramLinesSchema,
    mode: readingModeSchema,
    /** Positions of the moving lines, 1 is the bottom line */
    moving: z.array(z.number().int().min(1).max(HEXAGRAM_LINE_COUNT)),
    primary: hexagramFaceSchema,
    /** The plain-language reading of the primary hexagram */
    content: fixedResultResponseSchema,
    /** The hexagram the moving lines turn it into, with its own plain-language reading; null when no line moves */
    changed: z.object({
        face: hexagramFaceSchema,
        content: fixedResultResponseSchema,
    }).nullable(),
    /** Only when exactly one line moves: its classical statement and its reading */
    movingLine: z.object({
        position: z.number().int().min(1).max(HEXAGRAM_LINE_COUNT),
        statement: z.string().min(1),
        content: fixedResultResponseSchema,
    }).nullable(),
});

/** Today's casts: none yet, or all of them in the order they were cast. */
export const dailyHexagramResponseSchema = z.discriminatedUnion('drawn', [
    z.object({
        /** Taipei calendar date, `YYYY-MM-DD` */
        date: z.string(),
        drawn: z.literal(false),
        nextCost: nextCostSchema,
    }), z.object({
        date: z.string(),
        drawn: z.literal(true),
        casts: z.array(hexagramCastSchema).min(1),
        nextCost: nextCostSchema,
    }),
]);

/** The answer to a cast: the cast and what the next one costs. */
export const hexagramCastResponseSchema = z.object({
    date: z.string(),
    cast: hexagramCastSchema,
    nextCost: nextCostSchema,
});

export type HexagramFace = z.infer<typeof hexagramFaceSchema>;
export type HexagramCastItem = z.infer<typeof hexagramCastSchema>;
export type HexagramCastRequest = z.infer<typeof hexagramCastRequestSchema>;
export type DailyHexagramResponse = z.infer<typeof dailyHexagramResponseSchema>;
export type HexagramCastResponse = z.infer<typeof hexagramCastResponseSchema>;
