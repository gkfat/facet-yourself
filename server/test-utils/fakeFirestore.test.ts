import {
    describe, expect, it,
} from 'vitest';
import { AggregateField } from 'firebase-admin/firestore';
import { FakeFirestore } from './fakeFirestore';

describe('FakeFirestore queries used by the admin back office', () => {
    const seed = async () => {
        const db = new FakeFirestore();

        await db.doc('users/a').set({ createdAt: 10 });
        await db.doc('users/b').set({ createdAt: 20 });
        await db.doc('users/c').set({ createdAt: 20 });
        await db.doc('users/d').set({ createdAt: 30 });

        return db;
    };

    it('orders by a field and then by document id', async () => {
        const db = await seed();
        const snap = await db.collection('users').orderBy('createdAt', 'desc').orderBy('__name__', 'desc').get();

        expect(snap.docs.map((doc) => doc.id)).toEqual([
            'd',
            'c',
            'b',
            'a',
        ]);
    });

    it('pages with startAfter without repeating or skipping a tie', async () => {
        const db = await seed();
        const page = (after?: [number, string]) => {
            const query = db.collection('users').orderBy('createdAt', 'desc').orderBy('__name__', 'desc');

            return (after ? query.startAfter(...after) : query).limit(2).get();
        };

        const first = await page();
        const second = await page([20, 'c']);
        const third = await page([10, 'a']);

        expect(first.docs.map((doc) => doc.id)).toEqual(['d', 'c']);
        expect(second.docs.map((doc) => doc.id)).toEqual(['b', 'a']);
        expect(third.docs).toEqual([]);
    });

    it('counts and sums over a filtered query, including collection groups', async () => {
        const db = new FakeFirestore();

        await db.doc('users/u1/pointTransactions/t1').set({
            type: 'DEDUCT', amount: 3, createdAt: 100,
        });
        await db.doc('users/u2/pointTransactions/t2').set({
            type: 'DEDUCT', amount: 5, createdAt: 200,
        });
        await db.doc('users/u2/pointTransactions/t3').set({
            type: 'REFUND', amount: 2, createdAt: 200,
        });

        const deducts = db.collectionGroup('pointTransactions').where('type', '==', 'DEDUCT');

        expect((await deducts.count().get()).data().count).toBe(2);
        expect((await deducts.aggregate({ total: AggregateField.sum('amount') }).get()).data().total).toBe(8);
        expect((await deducts.where('createdAt', '>=', 500).aggregate({ total: AggregateField.sum('amount') }).get()).data().total).toBe(0);
    });
});
