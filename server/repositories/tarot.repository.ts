import type {
    Firestore, Query, Transaction,
} from 'firebase-admin/firestore';
import { getAdminFirestore } from '../utils/firebaseAdmin';

export class TarotRepository {
    protected db: Firestore;

    constructor() {
        this.db = getAdminFirestore();
    }

    /** users/{uid}/tarotDraws/{YYYY-MM-DD}: the Taipei date is the document id, so a day can hold only one. */
    ref(uid: string, dateKey: string) {
        return this.db.collection('users').doc(uid).collection('tarotDraws').doc(dateKey);
    }

    /** The records of the Taipei dates `from` to `to`, both included, in no particular order: a range of document ids (no ordering, so no index is needed). Read only. */
    range(uid: string, from: string, to: string): Query {
        return this.db.collection('users').doc(uid).collection('tarotDraws')
            .where('__name__', '>=', from)
            .where('__name__', '<=', to);
    }

    runTransaction<T>(fn: (tx: Transaction) => Promise<T>): Promise<T> {
        return this.db.runTransaction(fn);
    }
}
