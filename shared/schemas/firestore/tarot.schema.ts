import { z } from 'zod';
import { epochMsSchema } from '../common';
import {
    TAROT_CARD_COUNT, TAROT_ORIENTATIONS,
} from '../../constants/tarot';

export const tarotOrientationSchema = z.enum(TAROT_ORIENTATIONS);

/** users/{uid}/tarotDraws/{YYYY-MM-DD}: the one card an account drew on one Taipei day. */
export const tarotDrawDocSchema = z.object({
    cardIndex: z.number().int().min(0).max(TAROT_CARD_COUNT - 1),
    orientation: tarotOrientationSchema,
    drawnAt: epochMsSchema,
    /** When the expiry job removes the draw. Every new draw carries one; a draw written while draws were kept for good has none, and the expiry job leaves it alone. */
    expiresAt: epochMsSchema.optional(),
    /** Version of the draw rule that picked the card */
    drawVersion: z.string().min(1),
});

export type TarotDrawDoc = z.infer<typeof tarotDrawDocSchema>;
