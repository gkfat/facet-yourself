import { BaseRepository } from './base.repository';
import { toMillis } from '../utils/firestoreTime';
import {
    userDocSchema, type UserDoc,
} from '../../shared/schemas/firestore/user.schema';
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
