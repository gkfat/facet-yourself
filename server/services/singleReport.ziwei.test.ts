import { readFileSync } from 'node:fs';
import {
    beforeEach, describe, expect, it, vi,
} from 'vitest';
import { FakeFirestore } from '../test-utils/fakeFirestore';
import { GuestSessionService } from './guestSession.service';
import { SingleReportService } from './singleReport.service';
import { singleReportResponseSchema } from '../../shared/schemas/api/singleReport.schema';
import { NotFoundError } from '../../shared/types/errors';
import { parseImportJson } from '../../shared/utils/fixedContentImport';
import { ZIWEI_DISCLAIMER } from '../../shared/utils/ziweiWording';

const holder = vi.hoisted(() => ({ db: undefined as unknown }));

vi.mock('../utils/firebaseAdmin', () => ({ getAdminFirestore: () => holder.db }));

const NOW = Date.UTC(2026, 9, 28, 4);
const rows = parseImportJson(readFileSync(new URL('../../content/fixed/ziwei.json', import.meta.url), 'utf8')).rows;

const user = (birthData: Record<string, unknown> | null) => ({
    email: 'a@example.com',
    birthData,
    bloodType: 'O',
    mbti: null,
    mbtiExpiresAt: null,
    createdAt: NOW,
    updatedAt: NOW,
});

const born = (extra: Record<string, unknown> = {}) => ({
    birthDate: '1990-05-17', zodiac: 'taurus', birthTime: '10:00', birthPlace: 'tw-taipei', ...extra,
});

describe('SingleReportService: the Zi Wei report', () => {
    let db: FakeFirestore;
    let service: SingleReportService;

    const publishAll = async (status = 'PUBLISHED') => {
        for (const row of rows) {
            await db.doc(`fixedContents/ZIWEI_${row.key}`).set({
                contentType: 'ZIWEI', key: row.key, body: row.body, contentVersion: '1', status, updatedAt: NOW, publishedAt: status === 'PUBLISHED' ? NOW : null,
            });
        }
    };

    beforeEach(async () => {
        db = new FakeFirestore();
        holder.db = db;
        service = new SingleReportService({ clock: () => NOW });
        await db.doc('users/u1').set(user(born()));
        await publishAll();
    });

    it('makes a report the API schema accepts, from the chart and the published readings', async () => {
        const report = await service.generate({ uid: 'u1' }, 'ZIWEI');

        expect(singleReportResponseSchema.safeParse(report).success).toBe(true);
        expect(report.basis).toMatchObject([
            {
                system: 'ZIWEI', ruleVersion: 'sanhe-v2', 
            },
        ]);
        expect(report.position).toContain('命宮');
        expect(report.persisted).toBe(true);
    });

    it('shows the chart as facts and says what the first version leaves out', async () => {
        const report = await service.generate({ uid: 'u1' }, 'ZIWEI');
        const text = (key: string) => report.blocks.find((block) => block.key === key)?.segments.map((segment) => segment.text).join('\n') ?? '';

        expect(text('facts')).toContain('五行局');
        expect(text('facts')).toContain('命宮');
        expect(text('limits')).toContain('簡化版');
        expect(text('limits')).toContain(ZIWEI_DISCLAIMER);
    });

    it('keeps the report once for the same chart, as it does for the other systems', async () => {
        await service.generate({ uid: 'u1' }, 'ZIWEI');
        await service.generate({ uid: 'u1' }, 'ZIWEI');

        expect(db.paths().filter((path) => path.includes('/reportSnapshots/'))).toHaveLength(1);
    });

    it('does not make the report without a birth time, and does not guess one', async () => {
        await db.doc('users/u1').set(user(born({ birthTime: null })));

        await expect(service.generate({ uid: 'u1' }, 'ZIWEI')).rejects.toMatchObject({ code: 'BIRTH_TIME_REQUIRED' });
    });

    it('asks for the birth date first when there is none', async () => {
        await db.doc('users/u1').set(user(null));

        await expect(service.generate({ uid: 'u1' }, 'ZIWEI')).rejects.toMatchObject({ code: 'PROFILE_REQUIRED' });
    });

    it('turns the report away when a reading it needs is not published, and keeps nothing', async () => {
        await publishAll('DRAFT');

        await expect(service.generate({ uid: 'u1' }, 'ZIWEI')).rejects.toBeInstanceOf(NotFoundError);
        expect(db.paths().filter((path) => path.includes('/reportSnapshots/'))).toEqual([]);
    });

    it('works out the chart in the default zone, and says so, when the saved city is no longer on the list', async () => {
        await db.doc('users/u1').set(user(born({ birthPlace: 'tw-no-longer-listed' })));
        const report = await service.generate({ uid: 'u1' }, 'ZIWEI');

        expect(report.blocks.find((block) => block.key === 'limits')?.segments.map((segment) => segment.text).join('')).toContain('沒有出生城市');
    });

    it('gives a guest the same report from the session, and keeps nothing', async () => {
        const guests = new GuestSessionService({ clock: () => NOW });
        const { sessionId } = await guests.create();

        await guests.saveProfile(sessionId, {
            birthData: born(), bloodType: 'UNKNOWN',
        } as never);
        const report = await service.generate({ guestSessionId: sessionId }, 'ZIWEI');

        expect(report).toMatchObject({
            kind: 'SINGLE', persisted: false, id: null,
        });
        expect(db.paths().filter((path) => path.includes('/reportSnapshots/'))).toEqual([]);
    });
});
