import { z } from 'zod';
import { BaseRepository } from './base.repository';
import {
    toMillis, toOptionalMillis,
} from '../utils/firestoreTime';
import {
    userDocSchema, type UserDoc,
} from '../../shared/schemas/firestore/user.schema';
import { birthDataSchema } from '../../shared/schemas/api/profile.schema';
import {
    bloodTypeSchema, genderSchema, mbtiTypeSchema,
} from '../../shared/schemas/common';
import { DatabaseError } from '../../shared/types/errors';

/** The part of a member the user list shows. */
export type AdminUserRow = {
    uid: string;
    email: string;
    createdAt: number;
};

/** Where a page of members starts: after the member with this createdAt and uid, newest first. */
export type AdminUserCursor = {
    createdAt: number;
    uid: string;
};

/** The profile fields of a member document; all may be missing in an older or unfinished document. */
const profileSchema = z.object({
    birthData: birthDataSchema.nullish(),
    bloodType: bloodTypeSchema.nullish(),
    mbti: mbtiTypeSchema.nullish(),
    gender: genderSchema.nullish(),
    mbtiExpiresAt: z.number().nullish(),
    updatedAt: z.number().nullish(),
});

export type AdminUserProfile = z.infer<typeof profileSchema>;

/** The collections under a member that the detail counts. */
export type AdminUsageCollection = 'tarotDraws' | 'runeDraws' | 'hexagramDraws' | 'reportSnapshots';

const rowSchema = userDocSchema.pick({
    email: true, createdAt: true,
});

export class AdminUserRepository extends BaseRepository<UserDoc> {
    protected collectionName = 'users';

    /** Newest members first; the uid breaks ties so a page never repeats or skips a member. */
    async listPage(limit: number, after: AdminUserCursor | null): Promise<AdminUserRow[]> {
        const ordered = this.collection.orderBy('createdAt', 'desc').orderBy('__name__', 'desc');
        const query = after ? ordered.startAfter(after.createdAt, after.uid) : ordered;
        const snapshot = await query.limit(limit).get();

        return snapshot.docs.map((doc) => this.toRow(doc.id, doc.data()));
    }

    async findRow(uid: string): Promise<AdminUserRow | null> {
        const doc = await this.collection.doc(uid).get();

        return doc.exists ? this.toRow(doc.id, doc.data() ?? {}) : null;
    }

    /** The profile of a member as stored, or null when there is no such member. Read only. */
    async findProfile(uid: string): Promise<AdminUserProfile | null> {
        const doc = await this.collection.doc(uid).get();

        if (!doc.exists) return null;

        const data = doc.data() ?? {};
        const parsed = profileSchema.safeParse({
            ...data,
            mbtiExpiresAt: data.mbtiExpiresAt == null ? null : toMillis(data.mbtiExpiresAt),
            updatedAt: toOptionalMillis(data.updatedAt) ?? null,
        });

        if (!parsed.success) throw new DatabaseError(`User document ${uid} has a malformed profile`);

        return parsed.data;
    }

    /** How many documents a member has in one of their collections. */
    async countUsage(uid: string, collection: AdminUsageCollection): Promise<number> {
        const snapshot = await this.collection.doc(uid).collection(collection).count().get();

        return snapshot.data().count;
    }

    /** The member's multi-dimension AI reports that were completed. */
    async countCompletedAiReports(uid: string): Promise<number> {
        const snapshot = await this.collection.doc(uid).collection('aiReports').where('status', '==', 'COMPLETED').count().get();

        return snapshot.data().count;
    }

    private toRow(uid: string, data: Record<string, unknown>): AdminUserRow {
        const parsed = rowSchema.safeParse({
            email: data.email,
            createdAt: data.createdAt === undefined ? undefined : toMillis(data.createdAt),
        });

        if (!parsed.success) throw new DatabaseError(`User document ${uid} is malformed`);

        return {
            uid, ...parsed.data,
        };
    }
}
