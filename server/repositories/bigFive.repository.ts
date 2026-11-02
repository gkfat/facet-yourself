import type { Firestore } from 'firebase-admin/firestore';
import { getAdminFirestore } from '../utils/firebaseAdmin';
import {
    bigFiveAttemptDocSchema, type BigFiveAttemptDoc,
} from '../../shared/schemas/firestore/bigFive.schema';

/** The signed-in member's Big Five attempts: users/{uid}/bigFiveAttempts. Nothing is kept for a guest. */
export class BigFiveRepository {
    protected db: Firestore;

    constructor() {
        this.db = getAdminFirestore();
    }

    private attemptsRef(uid: string) {
        return this.db.collection('users').doc(uid).collection('bigFiveAttempts');
    }

    async create(uid: string, attempt: BigFiveAttemptDoc): Promise<string> {
        const ref = this.attemptsRef(uid).doc();

        await ref.set(bigFiveAttemptDocSchema.parse(attempt));

        return ref.id;
    }

    /** The newest attempts first */
    async listNewest(uid: string, limit: number): Promise<Array<{ attemptId: string; attempt: BigFiveAttemptDoc }>> {
        const snap = await this.attemptsRef(uid).orderBy('completedAt', 'desc').limit(limit).get();

        return snap.docs.map((doc) => ({
            attemptId: doc.id, attempt: bigFiveAttemptDocSchema.parse(doc.data()),
        }));
    }
}
