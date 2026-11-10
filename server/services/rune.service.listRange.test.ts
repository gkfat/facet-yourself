import {
    beforeEach, describe, expect, it, vi,
} from 'vitest';
import { FakeFirestore } from '../test-utils/fakeFirestore';
import { RuneService } from './rune.service';
import { historyRuneItemSchema } from '../../shared/schemas/api/fortuneHistory.schema';

const holder = vi.hoisted(() => ({
    db: undefined as unknown,
    logs: [] as { severity?: string; message: string; userId?: string }[],
}));

vi.mock('../utils/firebaseAdmin', () => ({ getAdminFirestore: () => holder.db }));
vi.mock('../utils/logger', async (importOriginal) => ({
    ...(await importOriginal<typeof import('../utils/logger')>()),
    logEvent: (entry: { severity?: string; message: string; userId?: string }) => {
        holder.logs.push(entry);
    },
}));

// 2026-11-10 12:00 in Taipei
const NOW = Date.UTC(2026, 10, 10, 4);

const draw = (symbolIndex: number, orientation = 'upright') => ({
    symbolIndex, orientation, drawnAt: NOW, expiresAt: NOW, drawVersion: 'rune-v1',
});
const contentDoc = (key: string) => ({
    contentType: 'RUNE',
    key,
    body: {
        title: key, summary: `summary of ${key}`, disclaimer: '僅供娛樂與自我探索',
    },
    contentVersion: '1',
    status: 'PUBLISHED',
    updatedAt: 1,
    publishedAt: 1,
});

describe('RuneService.listRange', () => {
    let db: FakeFirestore;
    let service: RuneService;

    const seed = async (uid: string, date: string, symbolIndex: number, orientation = 'upright', withContent = true) => {
        await db.doc(`users/${uid}/runeDraws/${date}`).set(draw(symbolIndex, orientation));

        if (withContent) await db.doc(`fixedContents/RUNE_${symbolIndex}_${orientation}`).set(contentDoc(`${symbolIndex}_${orientation}`));
    };

    beforeEach(() => {
        db = new FakeFirestore();
        holder.db = db;
        holder.logs = [];
        service = new RuneService({ clock: () => NOW });
    });

    it('lists the draws inside the range, newest first, and leaves out the ones outside it', async () => {
        await seed('u1', '2026-08-09', 1);
        await seed('u1', '2026-08-10', 2);
        await seed('u1', '2026-11-01', 3, 'reversed');
        await seed('u1', '2026-11-10', 4);
        await seed('u1', '2026-11-11', 5);

        const listed = await service.listRange('u1', '2026-08-10', '2026-11-10');

        expect(listed.map((entry) => entry.date)).toEqual([
            '2026-11-10',
            '2026-11-01',
            '2026-08-10',
        ]);
        expect(listed.map((entry) => historyRuneItemSchema.parse(entry.item).rune.index)).toEqual([
            4,
            3,
            2,
        ]);
        expect(listed[1]?.item).toMatchObject({
            rune: { orientation: 'reversed' }, content: {
                contentType: 'RUNE', key: '3_reversed', 
            },
        });
    });

    it('lists the dates that have a draw without reading any content', async () => {
        await seed('u1', '2026-11-02', 1, 'upright', false);
        await seed('u1', '2026-11-05', 2, 'upright', false);

        expect(await service.recordedDates('u1', '2026-08-10', '2026-11-10')).toEqual(['2026-11-05', '2026-11-02']);
    });

    it('returns only the draws of that account', async () => {
        await seed('u1', '2026-11-02', 1);
        await seed('u2', '2026-11-03', 2);

        expect((await service.listRange('u1', '2026-08-10', '2026-11-10')).map((entry) => entry.date)).toEqual(['2026-11-02']);
        expect(await service.recordedDates('u2', '2026-08-10', '2026-11-10')).toEqual(['2026-11-03']);
    });

    it('keeps a draw whose content is gone, with null content and a warning that carries no content', async () => {
        await seed('u1', '2026-11-02', 1, 'upright', false);
        await seed('u1', '2026-11-03', 2);

        const listed = await service.listRange('u1', '2026-08-10', '2026-11-10');

        expect(listed.map((entry) => [entry.date, entry.item.content === null])).toEqual([['2026-11-03', false], ['2026-11-02', true]]);
        expect(holder.logs.filter((entry) => entry.severity === 'WARNING')).toHaveLength(1);
    });

    it('returns an empty list when there is nothing in the range', async () => {
        expect(await service.listRange('u1', '2026-08-10', '2026-11-10')).toEqual([]);
        expect(await service.recordedDates('u1', '2026-08-10', '2026-11-10')).toEqual([]);
    });

    it('writes nothing', async () => {
        await seed('u1', '2026-11-02', 1);

        const before = db.paths().sort();

        await service.listRange('u1', '2026-08-10', '2026-11-10');
        await service.recordedDates('u1', '2026-08-10', '2026-11-10');

        expect(db.paths().sort()).toEqual(before);
        expect((await db.doc('users/u1/runeDraws/2026-11-02').get()).data()).toEqual(draw(1));
    });
});
