import {
    beforeEach, describe, expect, it, vi,
} from 'vitest';
import { FakeFirestore } from '../test-utils/fakeFirestore';
import { HexagramService } from './hexagram.service';
import { historyHexagramItemSchema } from '../../shared/schemas/api/fortuneHistory.schema';
import { FORTUNE_HISTORY_HEXAGRAM_READ_LIMIT } from '../../shared/constants/fortuneHistory';
import {
    hexagramContentKey, hexagramLineContentKey,
} from '../../shared/constants/hexagrams';
import { hexagramOf } from '../../shared/utils/hexagram';
import { castHexagram } from '../../shared/utils/hexagramCast';

const holder = vi.hoisted(() => ({
    db: undefined as unknown,
    logs: [] as { severity?: string; message: string }[],
}));

vi.mock('../utils/firebaseAdmin', () => ({ getAdminFirestore: () => holder.db }));
vi.mock('../utils/logger', async (importOriginal) => ({
    ...(await importOriginal<typeof import('../utils/logger')>()),
    logEvent: (entry: { severity?: string; message: string }) => {
        holder.logs.push(entry);
    },
}));

// 2026-11-10 12:00 in Taipei
const NOW = Date.UTC(2026, 10, 10, 4);
const FROM = '2026-08-10';
const TO = '2026-11-10';

const contentDoc = (key: string) => ({
    contentType: 'HEXAGRAM',
    key,
    body: {
        title: `title of ${key}`, summary: `summary of ${key}`, disclaimer: '僅供娛樂與自我反思參考',
    },
    contentVersion: '1',
    status: 'PUBLISHED',
    updatedAt: 1,
    publishedAt: 1,
});

describe('HexagramService history reads', () => {
    let db: FakeFirestore;
    let service: HexagramService;

    const storedCast = (uid: string, date: string, seq: number) => ({
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
    const seed = async (uid: string, date: string, seq: number, withContent = true) => {
        await db.doc(`users/${uid}/hexagramDraws/${date}_${seq}`).set(storedCast(uid, date, seq));

        if (!withContent) return;

        const cast = hexagramOf(castHexagram(uid, date, seq));
        const keys = [
            hexagramContentKey(cast.primary.order),
            ...(cast.changed ? [hexagramContentKey(cast.changed.order)] : []),
            ...(cast.moving.length === 1 ? [hexagramLineContentKey(cast.primary.order, cast.moving[0] as number)] : []),
        ];

        for (const key of keys) await db.doc(`fixedContents/HEXAGRAM_${key}`).set(contentDoc(key));
    };

    beforeEach(() => {
        db = new FakeFirestore();
        holder.db = db;
        holder.logs = [];
        service = new HexagramService({ clock: () => NOW });
    });

    it('lists the casts of the range newest date first and, within a day, in the order they were cast', async () => {
        for (const seq of [
            2,
            0,
            10,
            1,
        ]) await seed('u1', '2026-11-05', seq);
        await seed('u1', '2026-11-08', 0);
        await seed('u1', '2026-08-09', 0);
        await seed('u1', '2026-11-11', 0);

        const listed = await service.listRange('u1', FROM, TO);

        expect(listed.map((entry) => `${entry.date}#${entry.item.seq}`)).toEqual([
            '2026-11-08#0',
            '2026-11-05#0',
            '2026-11-05#1',
            '2026-11-05#2',
            '2026-11-05#10',
        ]);
        expect(listed.map((entry) => entry.item.paid)).toEqual([
            false,
            false,
            true,
            true,
            true,
        ]);

        for (const entry of listed) historyHexagramItemSchema.parse(entry.item);
    });

    it('lists the dates that have a cast once each, newest first, without reading any reading', async () => {
        await seed('u1', '2026-11-05', 0, false);
        await seed('u1', '2026-11-05', 1, false);
        await seed('u1', '2026-11-08', 0, false);

        expect(await service.recordedDates('u1', FROM, TO)).toEqual({
            dates: ['2026-11-08', '2026-11-05'],
            truncated: false,
        });
    });

    it('returns only the casts of that account', async () => {
        await seed('u1', '2026-11-05', 0);
        await seed('u2', '2026-11-06', 0);

        expect((await service.listRange('u1', FROM, TO)).map((entry) => entry.date)).toEqual(['2026-11-05']);
        expect((await service.recordedDates('u2', FROM, TO)).dates).toEqual(['2026-11-06']);
    });

    it('keeps a cast whose readings are gone, with null readings and a warning', async () => {
        await seed('u1', '2026-11-05', 0, false);

        const [entry] = await service.listRange('u1', FROM, TO);

        expect(entry?.item).toMatchObject({
            seq: 0, content: null,
        });
        expect(entry?.item.primary.name).toBeTruthy();
        expect(holder.logs.filter((log) => log.severity === 'WARNING')).toHaveLength(1);
        historyHexagramItemSchema.parse(entry?.item);
    });

    it('says so when the window holds more casts than are read', async () => {
        const batch = db.batch();

        for (let seq = 0; seq <= FORTUNE_HISTORY_HEXAGRAM_READ_LIMIT; seq += 1) {
            batch.set(db.doc(`users/u1/hexagramDraws/2026-11-05_${seq}`), { date: '2026-11-05' });
        }

        await batch.commit();

        const { truncated } = await service.recordedDates('u1', FROM, TO);

        expect(truncated).toBe(true);
        expect(holder.logs.some((log) => log.severity === 'WARNING')).toBe(true);
    });

    it('returns nothing and writes nothing', async () => {
        await seed('u1', '2026-11-05', 0);

        const before = db.paths().sort();

        expect(await service.listRange('u1', '2026-11-06', TO)).toEqual([]);
        await service.listRange('u1', FROM, TO);
        await service.recordedDates('u1', FROM, TO);

        expect(db.paths().sort()).toEqual(before);
    });
});
