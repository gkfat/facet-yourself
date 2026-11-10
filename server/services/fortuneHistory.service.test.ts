import {
    beforeEach, describe, expect, it, vi,
} from 'vitest';
import { FakeFirestore } from '../test-utils/fakeFirestore';
import { FortuneHistoryService } from './fortuneHistory.service';
import { fortuneHistoryResponseSchema } from '../../shared/schemas/api/fortuneHistory.schema';
import { FORTUNE_HISTORY_HEXAGRAM_READ_LIMIT } from '../../shared/constants/fortuneHistory';
import { ValidationError } from '../../shared/types/errors';
import { castHexagram } from '../../shared/utils/hexagramCast';
import { taipeiDateKey } from '../../shared/utils/time';

const holder = vi.hoisted(() => ({ db: undefined as unknown }));

vi.mock('../utils/firebaseAdmin', () => ({ getAdminFirestore: () => holder.db }));
vi.mock('../utils/logger', async (importOriginal) => ({
    ...(await importOriginal<typeof import('../utils/logger')>()),
    logEvent: () => undefined,
}));

// 2026-11-10 12:00 in Taipei; the window starts on 2026-08-10
const NOW = Date.UTC(2026, 10, 10, 4);
const DAY = 24 * 60 * 60 * 1000;

/** The Taipei date this many days before today */
const daysAgo = (days: number) => taipeiDateKey(new Date(NOW - days * DAY));

const contentDoc = (type: string, key: string) => ({
    contentType: type,
    key,
    body: {
        title: key, summary: `summary of ${key}`, disclaimer: '僅供娛樂與自我探索',
    },
    contentVersion: '1',
    status: 'PUBLISHED',
    updatedAt: 1,
    publishedAt: 1,
});

describe('FortuneHistoryService', () => {
    let db: FakeFirestore;
    let service: FortuneHistoryService;

    const tarotOn = (uid: string, date: string) => db.doc(`users/${uid}/tarotDraws/${date}`).set({
        cardIndex: 0, orientation: 'upright', drawnAt: NOW, expiresAt: NOW, drawVersion: 'tarot-v1',
    });
    const runeOn = (uid: string, date: string) => db.doc(`users/${uid}/runeDraws/${date}`).set({
        symbolIndex: 0, orientation: 'upright', drawnAt: NOW, expiresAt: NOW, drawVersion: 'rune-v1',
    });
    const castOn = (uid: string, date: string, seq: number) => db.doc(`users/${uid}/hexagramDraws/${date}_${seq}`).set({
        date,
        seq,
        lines: [...castHexagram(uid, date, seq)],
        drawnAt: NOW,
        expiresAt: NOW,
        drawVersion: 'hexagram-v1',
        paid: seq > 0,
        pointTransactionId: seq > 0 ? `hexagram:${uid}:${date}:${seq}` : null,
        requestId: null,
    });

    beforeEach(() => {
        db = new FakeFirestore();
        holder.db = db;
        service = new FortuneHistoryService({ clock: () => NOW });
    });

    it('lists the dates with a record newest first, with the tarot and rune of each day and their content', async () => {
        await db.doc('fixedContents/TAROT_0_upright').set(contentDoc('TAROT', '0_upright'));
        await db.doc('fixedContents/RUNE_0_upright').set(contentDoc('RUNE', '0_upright'));
        await tarotOn('u1', daysAgo(0));
        await runeOn('u1', daysAgo(0));
        await tarotOn('u1', daysAgo(3));
        await runeOn('u1', daysAgo(5));

        const history = fortuneHistoryResponseSchema.parse(await service.list('u1'));

        expect(history.days.map((day) => day.date)).toEqual([
            daysAgo(0),
            daysAgo(3),
            daysAgo(5),
        ]);
        expect(history.days[0]).toMatchObject({
            tarot: { content: { key: '0_upright' } }, rune: { content: { key: '0_upright' } }, hexagrams: [],
        });
        expect(history.days[1]).toMatchObject({
            tarot: { card: { index: 0 } }, rune: null,
        });
        expect(history.days[2]).toMatchObject({
            tarot: null, rune: { rune: { index: 0 } },
        });
        expect(history.nextBefore).toBeNull();
        expect(history.truncated).toBe(false);
    });

    it('answers an empty history when there is no record', async () => {
        expect(await service.list('u1')).toEqual({
            days: [], nextBefore: null, truncated: false,
        });
    });

    it('pages by date: the second page starts after the first and repeats nothing', async () => {
        // 16 dates with a record: the tarot of each, and the rune of today
        for (let n = 0; n < 16; n += 1) await tarotOn('u1', daysAgo(n));

        await runeOn('u1', daysAgo(0));

        const first = await service.list('u1');

        expect(first.days).toHaveLength(14);
        expect(first.days[0]?.date).toBe(daysAgo(0));
        expect(first.nextBefore).toBe(daysAgo(13));

        const second = await service.list('u1', { before: first.nextBefore ?? undefined });

        expect(second.days.map((day) => day.date)).toEqual([daysAgo(14), daysAgo(15)]);
        expect(second.nextBefore).toBeNull();
    });

    it('does not list a date that has no record, and gives no cursor when the page holds them all', async () => {
        await tarotOn('u1', daysAgo(1));
        await tarotOn('u1', daysAgo(40));

        const page = await service.list('u1', { limit: 2 });

        expect(page.days.map((day) => day.date)).toEqual([daysAgo(1), daysAgo(40)]);
        expect(page.nextBefore).toBeNull();
    });

    it('gives the oldest date of a page as the cursor when an older one exists', async () => {
        await tarotOn('u1', daysAgo(1));
        await tarotOn('u1', daysAgo(2));
        await tarotOn('u1', daysAgo(3));

        const page = await service.list('u1', { limit: 2 });

        expect(page.days.map((day) => day.date)).toEqual([daysAgo(1), daysAgo(2)]);
        expect(page.nextBefore).toBe(daysAgo(2));
    });

    it('shows nothing older than three months, even if it still exists', async () => {
        await tarotOn('u1', '2026-08-09');
        await runeOn('u1', '2026-07-01');
        await tarotOn('u1', '2026-08-10');

        expect((await service.list('u1')).days.map((day) => day.date)).toEqual(['2026-08-10']);
    });

    it('refuses a cursor later than today or earlier than the start of the window', async () => {
        await expect(service.list('u1', { before: '2026-11-11' })).rejects.toBeInstanceOf(ValidationError);
        await expect(service.list('u1', { before: '2026-08-09' })).rejects.toBeInstanceOf(ValidationError);
        await expect(service.list('u1', { before: '2026-08-10' })).resolves.toMatchObject({ days: [] });
        await expect(service.list('u1', { before: '2026-11-10' })).resolves.toMatchObject({ days: [] });
    });

    it('lists every cast of a day in the order they were cast, with the paid ones marked', async () => {
        for (const seq of [
            2,
            0,
            1,
        ]) await castOn('u1', daysAgo(2), seq);

        await tarotOn('u1', daysAgo(2));

        const [day] = (await service.list('u1')).days;

        expect(day?.hexagrams.map((cast) => [cast.seq, cast.paid])).toEqual([
            [0, false],
            [1, true],
            [2, true],
        ]);
        expect(day?.tarot).not.toBeNull();
    });

    it('leaves the casts out when the hexagram part is switched off', async () => {
        await castOn('u1', daysAgo(2), 0);
        await tarotOn('u1', daysAgo(3));

        const off = new FortuneHistoryService({
            clock: () => NOW, hexagramEnabled: false,
        });

        expect((await off.list('u1')).days.map((day) => day.date)).toEqual([daysAgo(3)]);
        expect((await service.list('u1')).days.map((day) => day.date)).toEqual([daysAgo(2), daysAgo(3)]);
    });

    it('says so when the casts of the window are more than can be read', async () => {
        for (let seq = 0; seq <= FORTUNE_HISTORY_HEXAGRAM_READ_LIMIT; seq += 1) await castOn('u1', daysAgo(2), seq);

        expect((await service.list('u1')).truncated).toBe(true);
        expect((await service.list('u1', { before: daysAgo(2) })).truncated).toBe(false);
    });

    it('shows each account only its own records', async () => {
        await tarotOn('u1', daysAgo(1));
        await runeOn('u2', daysAgo(2));
        await castOn('u2', daysAgo(3), 0);

        expect((await service.list('u1')).days.map((day) => day.date)).toEqual([daysAgo(1)]);
        expect((await service.list('u2')).days.map((day) => day.date)).toEqual([daysAgo(2), daysAgo(3)]);
        expect((await service.list('nobody')).days).toEqual([]);
    });

    it('writes nothing', async () => {
        await tarotOn('u1', daysAgo(1));
        await runeOn('u1', daysAgo(1));
        await castOn('u1', daysAgo(1), 0);

        const before = db.paths().sort();

        await service.list('u1');
        await service.list('u1', { before: daysAgo(0) });

        expect(db.paths().sort()).toEqual(before);
    });
});
