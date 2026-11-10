import { z } from 'zod';
import { epochMsSchema } from '../common';
import { isLineValue } from '../../utils/hexagramLines';

export const lineValueSchema = z.custom<6 | 7 | 8 | 9>(isLineValue, 'a line is 6, 7, 8 or 9');

/** The six lines of a cast from the bottom: the only thing kept of a cast, everything else is worked out from it. */
export const hexagramLinesSchema = z.array(lineValueSchema).length(6);

/**
 * users/{uid}/hexagramDraws/{YYYY-MM-DD}_{seq}: one cast of one account on one Taipei day. `seq` 0 is the free cast of
 * the day, 1 and up are paid ones.
 */
export const hexagramDrawDocSchema = z.object({
    /** Taipei calendar date, `YYYY-MM-DD` */
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    seq: z.number().int().nonnegative(),
    lines: hexagramLinesSchema,
    drawnAt: epochMsSchema,
    /** When the expiry job removes the cast: `drawnAt` plus 3 months */
    expiresAt: epochMsSchema,
    /** Version of the rule that cast the lines */
    drawVersion: z.string().min(1),
    /** Whether this cast was paid for (every one after the first of the day) */
    paid: z.boolean(),
    /** The id of the point transaction that paid for it; null for the free cast */
    pointTransactionId: z.string().min(1).nullable(),
    /** Idempotency key of the request that made it, when it carried one */
    requestId: z.string().min(1).nullable(),
}).refine((doc) => doc.paid === doc.seq > 0, {
    path: ['paid'],
    message: 'only the cast after the first of the day is paid',
}).refine((doc) => doc.paid === (doc.pointTransactionId !== null), {
    path: ['pointTransactionId'],
    message: 'a paid cast names its point transaction and a free one has none',
});

export type HexagramDrawDoc = z.infer<typeof hexagramDrawDocSchema>;
