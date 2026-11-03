import type { Firestore } from 'firebase-admin/firestore';
import { getAdminFirestore } from '../utils/firebaseAdmin';
import {
    assessmentAttemptDocSchema, type AssessmentAttemptDoc,
} from '../../shared/schemas/firestore/assessmentAttempt.schema';

/** The signed-in member's self-assessment attempts, all assessments in one: users/{uid}/assessmentAttempts. Nothing is kept for a guest. */
export class AssessmentRepository {
    protected db: Firestore;

    constructor() {
        this.db = getAdminFirestore();
    }

    private attemptsRef(uid: string) {
        return this.db.collection('users').doc(uid).collection('assessmentAttempts');
    }

    async create(uid: string, attempt: AssessmentAttemptDoc): Promise<string> {
        const ref = this.attemptsRef(uid).doc();

        await ref.set(assessmentAttemptDocSchema.parse(attempt));

        return ref.id;
    }

    /** The newest attempts of the member first, whatever the assessment: the one asked about is picked out by the caller */
    async listNewest(uid: string, limit: number): Promise<Array<{ attemptId: string; attempt: AssessmentAttemptDoc }>> {
        const snap = await this.attemptsRef(uid).orderBy('completedAt', 'desc').limit(limit).get();

        return snap.docs.map((doc) => ({
            attemptId: doc.id, attempt: assessmentAttemptDocSchema.parse(doc.data()),
        }));
    }
}
