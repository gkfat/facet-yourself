import { z } from 'zod';
import { epochMsSchema } from '../common';

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

/** Everything the back office shows about one member: never test answers, reports or birth data. */
export const adminUserListItemSchema = z.object({
    uid: z.string(),
    email: z.string(),
    createdAt: epochMsSchema,
    lastSignInAt: epochMsSchema.nullable(),
    disabled: z.boolean(),
    /** Points that can be spent now; null when it could not be read. */
    pointBalance: z.number().int().nonnegative().nullable(),
    /** Multi-dimension AI reports the member has had completed (they are kept for 6 months); null when it could not be read. */
    multiReportCount: z.number().int().nonnegative().nullable(),
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
export type AdminUserListItem = z.infer<typeof adminUserListItemSchema>;
export type AdminUserList = z.infer<typeof adminUserListSchema>;
