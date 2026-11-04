import { z } from 'zod';
import {
    numerologySchema, zodiacSchema,
} from '../common';

/**
 * What the home page's preview asks for: the sign and the life path number, never the birth date. At least one of the
 * two is needed; anything else in the query is ignored.
 */
export const homePreviewQuerySchema = z.object({
    sign: zodiacSchema.optional(),
    lifePath: numerologySchema.optional(),
}).refine((query) => query.sign !== undefined || query.lifePath !== undefined, { message: 'sign or lifePath is required' });

/** One line of a fixed content, or null when it is not published (yet) or was not asked for. */
export const homePreviewItemSchema = z.object({
    title: z.string(),
    summary: z.string(),
}).nullable();

export const homePreviewResponseSchema = z.object({
    zodiac: homePreviewItemSchema,
    numerology: homePreviewItemSchema,
});

export type HomePreviewQuery = z.infer<typeof homePreviewQuerySchema>;
export type HomePreviewItem = z.infer<typeof homePreviewItemSchema>;
export type HomePreviewResponse = z.infer<typeof homePreviewResponseSchema>;
