import { z } from 'zod';
import {
    bloodTypeSchema, epochMsSchema, genderSchema, isoDateSchema, mbtiTypeSchema, timeOfDaySchema, zodiacSchema,
} from '../common';

export const ADMIN_USERS_MAX_LIMIT = 50;
export const ADMIN_USERS_DEFAULT_LIMIT = 20;

/** A Firebase uid: opaque, bounded text taken from the URL. */
export const adminUserIdSchema = z.string().min(1).max(128);

export const adminUserListQuerySchema = z.object({
    limit: z.coerce.number().int().min(1).max(ADMIN_USERS_MAX_LIMIT).default(ADMIN_USERS_DEFAULT_LIMIT),
    /** Opaque; the `nextCursor` of the previous page. */
    cursor: z.string().min(1).max(300).optional(),
    /** The whole address: this is a lookup, not a fuzzy search. */
    email: z.string().trim().toLowerCase().pipe(z.email()).optional(),
}).refine((query) => !(query.email && query.cursor), {
    path: ['cursor'],
    message: 'a search by email has a single page',
});

/** What the member list shows about one member: never test answers, reports or birth data (those are only in the detail). */
export const adminUserListItemSchema = z.object({
    uid: z.string(),
    email: z.string(),
    createdAt: epochMsSchema,
    lastSignInAt: epochMsSchema.nullable(),
    disabled: z.boolean(),
    /** Points that can be spent now; null when it could not be read. */
    pointBalance: z.number().int().nonnegative().nullable(),
    /** Multi-dimension AI reports the member has had completed (they are kept for 3 months); null when it could not be read. */
    multiReportCount: z.number().int().nonnegative().nullable(),
});

/** A count of what the member has kept; null when it could not be read. */
const usageCountSchema = z.number().int().nonnegative().nullable();

/**
 * The detail window of one member: the list row, the profile the member filled in, and how much they have used.
 * Never test answers or report content. Reading it is logged with the administrator and the member.
 */
export const adminUserDetailSchema = adminUserListItemSchema.extend({
    profile: z.object({
        /** All null until the member fills in the profile */
        birthDate: isoDateSchema.nullable(),
        zodiac: zodiacSchema.nullable(),
        birthTime: timeOfDaySchema.nullable(),
        /** City code from the preset city list */
        birthPlace: z.string().nullable(),
        bloodType: bloodTypeSchema.nullable(),
        mbti: mbtiTypeSchema.nullable(),
        gender: genderSchema.nullable(),
        mbtiExpiresAt: epochMsSchema.nullable(),
        profileUpdatedAt: epochMsSchema.nullable(),
    }),
    usage: z.object({
        tarotDraws: usageCountSchema,
        runeDraws: usageCountSchema,
        hexagramDraws: usageCountSchema,
        reportSnapshots: usageCountSchema,
    }),
});

export const adminUserListSchema = z.object({
    items: z.array(adminUserListItemSchema),
    nextCursor: z.string().nullable(),
});

export const adminUserPatchSchema = z.object({ disabled: z.boolean() });

export const adminUserPatchResultSchema = z.object({
    uid: z.string(),
    disabled: z.boolean(),
});

export const adminUserDeleteResultSchema = z.object({
    uid: z.string(),
    deleted: z.literal(true),
});

export type AdminUserListQuery = z.infer<typeof adminUserListQuerySchema>;
export type AdminUserDetail = z.infer<typeof adminUserDetailSchema>;
export type AdminUserListItem = z.infer<typeof adminUserListItemSchema>;
export type AdminUserList = z.infer<typeof adminUserListSchema>;
