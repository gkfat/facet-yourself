import {
    beforeEach, describe, expect, it, vi,
} from 'vitest';
import { FakeFirestore } from '../test-utils/fakeFirestore';
import { HexagramService } from './hexagram.service';
import {
    dailyHexagramResponseSchema, hexagramCastResponseSchema,
} from '../../shared/schemas/api/hexagram.schema';
import {
    hexagramContentKey, hexagramLineContentKey,
} from '../../shared/constants/hexagrams';
import {
    AuthError, InsufficientPointsError, NotFoundError,
} from '../../shared/types/errors';
import {
    hexagramOf, readingPlan, type ReadingMode,
} from '../../shared/utils/hexagram';
import { castHexagram } from '../../shared/utils/hexagramCast';
import { addMonths } from '../../shared/utils/time';

const holder = vi.hoisted(() => ({ db: undefined as unknown }));

vi.mock('../utils/firebaseAdmin', () => ({ getAdminFirestore: () => holder.db }));

// 2026-11-09 12:00 in Taipei
const NOW = Date.UTC(2026, 10, 9, 4);
const DAY = 24 * 60 * 60 * 1000;
const TODAY = '2026-11-09';
const REQUEST_A = '0b0d6f5e-2f3e-4a62-9d8a-77f0a1f7a8a1';
const REQUEST_B = '5b1a4f0e-6c1d-4f43-8f6d-3a5f0d2f1c11';

const contentDoc = (key: string, status = 'PUBLISHED') => ({
    contentType: 'HEXAGRAM',
    key,
    body: {
        title: `title of ${key}`, summary: `summary of ${key}`, disclaimer: '僅供娛樂與自我反思參考',
    },
    contentVersion: '1',
    status,
    updatedAt: 1,
    publishedAt: status === 'PUBLISHED' ? 1 : null,
});

/** A subject whose first cast of the day has the reading mode asked for, found by trying subjects in turn. */
function subjectWhere(mode: ReadingMode, date = TODAY): string {
    for (let n = 0; n < 5000; n += 1) {
        if (readingPlan(castHexagram(`probe-${n}`, date, 0)).mode === mode) return `probe-${n}`;
    }

    throw new Error(`no subject found for the mode ${mode}`);
}

describe('HexagramService', () => {
    let db: FakeFirestore;
    let clock: { now: number };
    let service: HexagramService;

    /** Publish the readings a cast of this subject, day and number needs. */
    const publishFor = async (subject: string, seq: number, date = TODAY, status = 'PUBLISHED') => {
        const lines = castHexagram(subject, date, seq);
        const cast = hexagramOf(lines);
        const keys = [
            hexagramContentKey(cast.primary.order),
            ...(cast.changed ? [hexagramContentKey(cast.changed.order)] : []),
            ...(cast.moving.length === 1 ? [hexagramLineContentKey(cast.primary.order, cast.moving[0] as number)] : []),
        ];

        for (const key of keys) await db.doc(`fixedContents/HEXAGRAM_${key}`).set(contentDoc(key, status));

        return {
            lines, cast,
        };
    };
    const publishUpTo = async (subject: string, count: number, date = TODAY) => {
        for (let seq = 0; seq < count; seq += 1) await publishFor(subject, seq, date);
    };
    const giveBatch = async (uid: string, remaining: number) => {
        await db.doc(`users/${uid}/pointBatches/b1`).set({
            source: 'PURCHASE', sourceRef: null, granted: remaining, remaining, expiresAt: null, createdAt: NOW - DAY,
        });
    };
    const balance = async (uid: string) => (await db.doc(`users/${uid}/pointBatches/b1`).get()).data()?.remaining;
    const casts = (uid = 'u1') => db.paths().filter((path) => path.startsWith(`users/${uid}/hexagramDraws/`));
    const charges = (uid = 'u1') => db.paths().filter((path) => path.startsWith(`users/${uid}/pointTransactions/`));

    beforeEach(() => {
        db = new FakeFirestore();
        holder.db = db;
        clock = { now: NOW };
        service = new HexagramService({ clock: () => clock.now });
    });

    describe('the free cast of the day', () => {
        it('casts, stores it with its expiry and spends nothing', async () => {
            const { lines } = await publishFor('u1', 0);
            const response = hexagramCastResponseSchema.parse(await service.draw('u1'));

            expect(response).toMatchObject({
                date: TODAY, nextCost: 1, cast: {
                    seq: 0, paid: false, lines: [...lines],
                },
            });
            expect(casts()).toEqual([`users/u1/hexagramDraws/${TODAY}_0`]);
            expect((await db.doc(`users/u1/hexagramDraws/${TODAY}_0`).get()).data()).toEqual({
                date: TODAY,
                seq: 0,
                lines: [...lines],
                drawnAt: NOW,
                expiresAt: addMonths(NOW, 3),
                drawVersion: 'hexagram-v1',
                paid: false,
                pointTransactionId: null,
                requestId: null,
            });
            expect(charges()).toEqual([]);
        });

        it('is the same cast when asked again without paying', async () => {
            await publishFor('u1', 0);

            const first = await service.draw('u1');

            clock.now += 3 * 60 * 60 * 1000;

            expect(await service.draw('u1')).toEqual(first);
            expect(casts()).toHaveLength(1);
        });

        it('is the same on another device: the day reads back the same cast', async () => {
            await publishFor('u1', 0);

            const { cast } = await service.draw('u1');
            const today = dailyHexagramResponseSchema.parse(await new HexagramService({ clock: () => clock.now }).getToday('u1'));

            expect(today).toMatchObject({
                drawn: true, nextCost: 1,
            });
            expect(today.drawn && today.casts).toEqual([cast]);
        });

        it('stores one cast when two requests cast at once, and charges nothing', async () => {
            await publishFor('u1', 0);
            await giveBatch('u1', 5);

            const [a, b] = await Promise.all([service.draw('u1'), service.draw('u1')]);

            expect(a.cast).toEqual(b.cast);
            expect(casts()).toHaveLength(1);
            expect(charges()).toEqual([]);
            expect(await balance('u1')).toBe(5);
        });

        it('starts again from the free cast the next Taipei day', async () => {
            await publishUpTo('u1', 1);
            await service.draw('u1');
            clock.now += DAY;
            await publishFor('u1', 0, '2026-11-10');

            const next = await service.draw('u1');

            expect(next).toMatchObject({
                date: '2026-11-10', cast: {
                    seq: 0, paid: false,
                },
            });
            expect(casts()).toEqual(['users/u1/hexagramDraws/2026-11-09_0', 'users/u1/hexagramDraws/2026-11-10_0']);
        });

        it('is a 404 that stores and spends nothing when a reading is not published', async () => {
            await publishFor('u1', 0, TODAY, 'DRAFT');

            await expect(service.draw('u1')).rejects.toBeInstanceOf(NotFoundError);
            expect(casts()).toEqual([]);
        });
    });

    describe('a cast after the first', () => {
        it('costs a point when the price is confirmed, and is stored with its payment', async () => {
            await publishUpTo('u1', 2);
            await giveBatch('u1', 3);
            await service.draw('u1');

            const second = hexagramCastResponseSchema.parse(await service.draw('u1', {
                requestId: REQUEST_A, confirmCharge: true,
            }));

            expect(second).toMatchObject({
                nextCost: 1, cast: {
                    seq: 1, paid: true,
                },
            });
            expect(await balance('u1')).toBe(2);
            expect((await db.doc(`users/u1/hexagramDraws/${TODAY}_1`).get()).data()).toMatchObject({
                seq: 1, paid: true, pointTransactionId: `hexagram:u1:${TODAY}:1`, requestId: REQUEST_A,
            });
            expect((await db.doc(`users/u1/pointTransactions/hexagram:u1:${TODAY}:1`).get()).data()).toMatchObject({
                type: 'DEDUCT', amount: 1, reason: 'HEXAGRAM_CAST', reference: `${TODAY}_1`,
            });
        });

        it('is a different cast from the first', async () => {
            await publishUpTo('u1', 4);
            await giveBatch('u1', 3);
            await service.draw('u1');

            const second = await service.draw('u1', { confirmCharge: true });

            expect(second.cast.lines).toEqual([...castHexagram('u1', TODAY, 1)]);
        });

        it('does not cost anything without the confirmation: it answers with the latest cast', async () => {
            await publishUpTo('u1', 2);
            await giveBatch('u1', 3);

            const first = await service.draw('u1');
            const again = await service.draw('u1', { requestId: REQUEST_B });

            expect(again.cast).toEqual(first.cast);
            expect(casts()).toHaveLength(1);
            expect(charges()).toEqual([]);
            expect(await balance('u1')).toBe(3);
        });

        it('stores nothing and spends nothing when the points are not enough', async () => {
            await publishUpTo('u1', 2);
            await service.draw('u1');

            await expect(service.draw('u1', { confirmCharge: true })).rejects.toBeInstanceOf(InsufficientPointsError);
            expect(casts()).toEqual([`users/u1/hexagramDraws/${TODAY}_0`]);
            expect(charges()).toEqual([]);
        });

        it('stores nothing and spends nothing when the points ran out and a point batch is empty', async () => {
            await publishUpTo('u1', 2);
            await giveBatch('u1', 0);
            await service.draw('u1');

            await expect(service.draw('u1', { confirmCharge: true })).rejects.toBeInstanceOf(InsufficientPointsError);
            expect(casts()).toHaveLength(1);
            expect(await balance('u1')).toBe(0);
        });

        it('answers a resent request with the cast it made and charges once', async () => {
            await publishUpTo('u1', 2);
            await giveBatch('u1', 3);
            await service.draw('u1');

            const first = await service.draw('u1', {
                requestId: REQUEST_A, confirmCharge: true,
            });
            const resent = await service.draw('u1', {
                requestId: REQUEST_A, confirmCharge: true,
            });

            expect(resent.cast).toEqual(first.cast);
            expect(casts()).toHaveLength(2);
            expect(charges()).toHaveLength(1);
            expect(await balance('u1')).toBe(2);
        });

        it('gives two requests that confirm at once a number each and charges each', async () => {
            await publishUpTo('u1', 3);
            await giveBatch('u1', 5);
            await service.draw('u1');

            const [a, b] = await Promise.all([
                service.draw('u1', {
                    requestId: REQUEST_A, confirmCharge: true,
                }), service.draw('u1', {
                    requestId: REQUEST_B, confirmCharge: true,
                }),
            ]);

            expect([a.cast.seq, b.cast.seq].sort()).toEqual([1, 2]);
            expect(casts()).toHaveLength(3);
            expect(charges()).toHaveLength(2);
            expect(await balance('u1')).toBe(3);
        });

        it('has no limit but the points', async () => {
            await publishUpTo('u1', 6);
            await giveBatch('u1', 4);
            await service.draw('u1');

            for (let paid = 1; paid <= 4; paid += 1) {
                await service.draw('u1', {
                    requestId: crypto.randomUUID(), confirmCharge: true,
                });
            }

            expect(casts()).toHaveLength(5);
            expect(await balance('u1')).toBe(0);
            await expect(service.draw('u1', { confirmCharge: true })).rejects.toBeInstanceOf(InsufficientPointsError);
        });

        it('is a 404 that does not charge when a reading is not published', async () => {
            await publishFor('u1', 0);
            await publishFor('u1', 1, TODAY, 'DRAFT');
            await giveBatch('u1', 3);
            await service.draw('u1');

            await expect(service.draw('u1', { confirmCharge: true })).rejects.toBeInstanceOf(NotFoundError);
            expect(casts()).toHaveLength(1);
            expect(charges()).toEqual([]);
            expect(await balance('u1')).toBe(3);
        });

        it('confirming the price on a day with no cast is still the free cast', async () => {
            await publishUpTo('u1', 1);
            await giveBatch('u1', 3);

            const response = await service.draw('u1', { confirmCharge: true });

            expect(response.cast).toMatchObject({
                seq: 0, paid: false,
            });
            expect(await balance('u1')).toBe(3);
            expect(charges()).toEqual([]);
        });

        it('keeps the casts of two accounts apart', async () => {
            await publishUpTo('u1', 1);
            await publishUpTo('u2', 1);
            await service.draw('u1');
            await service.draw('u2');

            expect(casts('u1')).toHaveLength(1);
            expect(casts('u2')).toHaveLength(1);
        });
    });

    describe('what the reading is made of', () => {
        it('has no changed hexagram and no line when nothing moves', async () => {
            const subject = subjectWhere('none');

            await publishFor(subject, 0);

            const { cast } = await service.draw(subject);

            expect(cast).toMatchObject({
                mode: 'none', moving: [], changed: null, movingLine: null,
            });
            expect(cast.content.key).toBe(String(cast.primary.order));
        });

        it('adds the statement and the reading of the line when one line moves', async () => {
            const subject = subjectWhere('single');
            const { cast: expected } = await publishFor(subject, 0);
            const { cast } = await service.draw(subject);
            const position = expected.moving[0] as number;

            expect(cast.mode).toBe('single');
            expect(cast.movingLine).toMatchObject({
                position,
                statement: expected.primary.lines[position - 1],
                content: { key: `${expected.primary.order}_${position}` },
            });
            expect(cast.changed?.face.order).toBe(expected.changed?.order);
            expect(cast.changed?.content.title).toBe(`title of ${expected.changed?.order}`);
            expect(cast.changed?.content.summary).toBe(`summary of ${expected.changed?.order}`);
        });

        it('gives only the two hexagrams when two or more lines move', async () => {
            const subject = subjectWhere('multiple');
            const { cast: expected } = await publishFor(subject, 0);
            const { cast } = await service.draw(subject);

            expect(cast.mode).toBe('multiple');
            expect(cast.movingLine).toBeNull();
            expect(cast.moving).toEqual([...expected.moving]);
            expect(cast.changed?.face.name).toBe(expected.changed?.name);
        });
    });

    describe('getToday', () => {
        it('says nothing has been cast and that the next one is free', async () => {
            expect(dailyHexagramResponseSchema.parse(await service.getToday('u1'))).toEqual({
                date: TODAY, drawn: false, nextCost: 0,
            });
        });

        it('lists the casts of the day in the order they were cast, and never writes', async () => {
            await publishUpTo('u1', 11);
            await giveBatch('u1', 12);
            await service.draw('u1');

            // The tenth number sorts before the second as text: the order is the number
            for (let paid = 1; paid <= 10; paid += 1) {
                await service.draw('u1', {
                    requestId: crypto.randomUUID(), confirmCharge: true,
                });
            }

            const before = db.paths();
            const today = dailyHexagramResponseSchema.parse(await service.getToday('u1'));

            expect(today.drawn && today.casts.map((cast) => cast.seq)).toEqual([
                0,
                1,
                2,
                3,
                4,
                5,
                6,
                7,
                8,
                9,
                10,
            ]);
            expect(today.drawn && today.casts.map((cast) => cast.paid)).toEqual([false, ...Array.from({ length: 10 }, () => true)]);
            expect(db.paths()).toEqual(before);
        });

        it('rejects a stored cast that is not well formed instead of showing it', async () => {
            await db.doc(`users/u1/hexagramDraws/${TODAY}_0`).set({
                date: TODAY, seq: 0, lines: [
                    7,
                    7,
                    7,
                ], drawnAt: NOW, expiresAt: NOW + 1, drawVersion: 'hexagram-v1', paid: false, pointTransactionId: null, requestId: null,
            });

            await expect(service.getToday('u1')).rejects.toThrow();
        });
    });

    describe('a visitor', () => {
        const SESSION = 'guest-session-1';

        it('gets the free cast, stores nothing and cannot cast again', async () => {
            await publishFor(`guest:${SESSION}`, 0);

            const response = hexagramCastResponseSchema.parse(await service.drawForGuest(SESSION));

            expect(response).toMatchObject({
                date: TODAY, nextCost: null, cast: {
                    seq: 0, paid: false,
                },
            });
            expect(db.paths().filter((path) => path.includes('hexagramDraws'))).toEqual([]);
            expect(db.paths().filter((path) => path.includes('pointTransactions'))).toEqual([]);
        });

        it('gets the same hexagram for the rest of the day', async () => {
            await publishFor(`guest:${SESSION}`, 0);

            const first = await service.drawForGuest(SESSION);

            clock.now += 3 * 60 * 60 * 1000;

            expect(await service.drawForGuest(SESSION)).toEqual(first);
        });

        it('is asked to sign in to pay for another cast', async () => {
            await publishFor(`guest:${SESSION}`, 0);

            await expect(service.drawForGuest(SESSION, { confirmCharge: true })).rejects.toBeInstanceOf(AuthError);
        });

        it('only learns the date when asking, and that the next cast is free', () => {
            expect(dailyHexagramResponseSchema.parse(service.getTodayForGuest())).toEqual({
                date: TODAY, drawn: false, nextCost: 0,
            });
        });

        it('is a 404 when a reading is not published', async () => {
            await publishFor(`guest:${SESSION}`, 0, TODAY, 'DRAFT');

            await expect(service.drawForGuest(SESSION)).rejects.toBeInstanceOf(NotFoundError);
        });
    });
});
