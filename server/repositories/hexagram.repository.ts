import type {
    Firestore, Query, Transaction,
} from 'firebase-admin/firestore';
import { getAdminFirestore } from '../utils/firebaseAdmin';

export class HexagramRepository {
    protected db: Firestore;

    constructor() {
        this.db = getAdminFirestore();
    }

    /**
     * users/{uid}/hexagramDraws/{YYYY-MM-DD}_{seq}: the Taipei date and the number of the cast of that day make the
     * id, so a number of a day can be taken only once.
     */
    ref(uid: string, dateKey: string, seq: number) {
        return this.db.collection('users').doc(uid).collection('hexagramDraws').doc(`${dateKey}_${seq}`);
    }

    /** The casts of one Taipei day, in no particular order (they carry their number). */
    day(uid: string, dateKey: string): Query {
        return this.db.collection('users').doc(uid).collection('hexagramDraws').where('date', '==', dateKey);
    }

    /**
     * The casts of the Taipei dates `from` to `to`, both included, newest date first, at most `limit` of them (so the
     * oldest are the ones cut off): a range on the `date` field, which has an automatic single-field index. Read only.
     */
    range(uid: string, from: string, to: string, limit: number): Query {
        return this.db.collection('users').doc(uid).collection('hexagramDraws')
            .where('date', '>=', from)
            .where('date', '<=', to)
            .orderBy('date', 'desc')
            .limit(limit);
    }

    runTransaction<T>(fn: (tx: Transaction) => Promise<T>): Promise<T> {
        return this.db.runTransaction(fn);
    }
}
