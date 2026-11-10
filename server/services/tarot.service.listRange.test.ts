import {
    beforeEach, describe, expect, it, vi,
} from 'vitest';
import { FakeFirestore } from '../test-utils/fakeFirestore';
import { TarotService } from './tarot.service';
import { historyTarotItemSchema } from '../../shared/schemas/api/fortuneHistory.schema';

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

const draw = (cardIndex: number, orientation = 'upright') => ({
    cardIndex, orientation, drawnAt: NOW, expiresAt: NOW, drawVersion: 'tarot-v1',
});
const contentDoc = (key: string) => ({
    contentType: 'TAROT',
    key,
    body: {
        title: key, summary: `summary of ${key}`, disclaimer: '僅供娛樂與自我探索',
    },
    contentVersion: '1',
    status: 'PUBLISHED',
    updatedAt: 1,
    publishedAt: 1,
});

describe('TarotService.listRange', () => {
    let db: FakeFirestore;
    let service: TarotService;

    const seed = async (uid: string, date: string, cardIndex: number, orientation = 'upright', withContent = true) => {
        await db.doc(`users/${uid}/tarotDraws/${date}`).set(draw(cardIndex, orientation));

        if (withContent) await db.doc(`fixedContents/TAROT_${cardIndex}_${orientation}`).set(contentDoc(`${cardIndex}_${orientation}`));
    };

    beforeEach(() => {
        db = new FakeFirestore();
        holder.db = db;
        holder.logs = [];
        service = new TarotService({ clock: () => NOW });
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
        expect(listed.map((entry) => historyTarotItemSchema.parse(entry.item).card.index)).toEqual([
            4,
            3,
            2,
        ]);
        expect(listed[1]?.item).toMatchObject({
            card: { orientation: 'reversed' }, content: {
                contentType: 'TAROT', key: '3_reversed', 
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
        expect((await db.doc('users/u1/tarotDraws/2026-11-02').get()).data()).toEqual(draw(1));
    });
});
