import {
    afterEach, beforeEach, describe, expect, it, vi,
} from 'vitest';
import { FakeFirestore } from '../test-utils/fakeFirestore';
import { FixedContentService } from './fixedContent.service';
import { RateLimitService } from './rateLimit.service';
import { keyedHash } from '../utils/hmac';

const holder = vi.hoisted(() => ({
    db: undefined as unknown,
    query: {} as Record<string, unknown>,
    headers: {} as Record<string, string>,
    ip: '203.0.113.7',
}));

vi.mock('../utils/firebaseAdmin', () => ({ getAdminFirestore: () => holder.db }));
// h3 is not a package of this project's own (Nitro brings it), so it is stood in for here, errors included
vi.mock('h3', () => {
    class H3Error extends Error {
        statusCode = 500;
    }

    return {
        H3Error,
        createError: (options: { statusCode: number; message: string }) => Object.assign(new H3Error(options.message), options),
        defineEventHandler: (handler: unknown) => handler,
        getQuery: () => holder.query,
        setResponseHeader: (_event: unknown, name: string, value: string) => {
            holder.headers[name] = value;
        },
    };
});
vi.mock('../utils/clientIp', () => ({ getClientIp: () => holder.ip }));
vi.mock('../../config/config', () => ({ requireServerSecret: () => 'test-secret' }));

type Handler = (event: unknown) => Promise<unknown>;

const NOW = Date.UTC(2026, 10, 4, 12, 0, 0);

function contentDoc(type: string, key: string) {
    return {
        contentType: type,
        key,
        body: {
            title: `${type} ${key}`, summary: `summary of ${type} ${key}`, disclaimer: '僅供娛樂與自我探索',
        },
        contentVersion: '1',
        status: 'PUBLISHED',
        updatedAt: 1,
        publishedAt: 1,
    };
}

describe('GET /api/home/preview', () => {
    let db: FakeFirestore;
    let handler: Handler;

    const call = (query: Record<string, unknown>) => {
        holder.query = query;

        return handler({});
    };
    const limiterPaths = () => db.paths().filter((path) => path.startsWith('rateLimits/'));

    beforeEach(async () => {
        vi.useFakeTimers({ toFake: ['Date'] });
        vi.setSystemTime(NOW);

        db = new FakeFirestore();
        holder.db = db;
        holder.headers = {};
        holder.ip = '203.0.113.7';

        await db.doc('fixedContents/ZODIAC_aries').set(contentDoc('ZODIAC', 'aries'));
        await db.doc('fixedContents/NUMEROLOGY_7').set(contentDoc('NUMEROLOGY', '7'));

        // A module of its own, so what an earlier test cached in memory is not there
        vi.resetModules();
        handler = (await import('../api/home/preview.get')).default as unknown as Handler;
    });

    afterEach(() => {
        vi.useRealTimers();
        vi.restoreAllMocks();
    });

    it('answers with both lines, and lets a shared cache keep the answer', async () => {
        expect(await call({
            sign: 'aries', lifePath: '7',
        })).toEqual({
            zodiac: {
                title: 'ZODIAC aries', summary: 'summary of ZODIAC aries',
            },
            numerology: {
                title: 'NUMEROLOGY 7', summary: 'summary of NUMEROLOGY 7',
            },
        });
        expect(holder.headers['Cache-Control']).toMatch(/^public, s-maxage=\d+/);
    });

    it.each([
        ['an unknown sign', { sign: 'dragon' }],
        ['a life path number that does not exist', { lifePath: '10' }],
        ['a life path number out of range', { lifePath: '44' }],
        ['neither', {}],
        ['a sign sent twice', { sign: ['aries', 'taurus'] }],
        ['only something else', { birthDate: '1990-01-01' }],
    ])('refuses %s with a 400, without reading the store or using up the limit', async (_name, query) => {
        const read = vi.spyOn(FixedContentService.prototype, 'getPublished');

        await expect(call(query)).rejects.toMatchObject({ statusCode: 400 });

        expect(read).not.toHaveBeenCalled();
        expect(limiterPaths()).toHaveLength(0);
        expect(holder.headers['Cache-Control']).toBe('no-store');
    });

    it('ignores what it does not know', async () => {
        expect(await call({
            sign: 'aries', birthDate: '1990-01-01', extra: 'x',
        })).toMatchObject({ zodiac: { title: 'ZODIAC aries' } });
    });

    it('counts only what has to be read: the second request is answered from memory', async () => {
        await call({ sign: 'aries' });
        await call({ sign: 'aries' });
        await call({ sign: 'aries' });

        expect(limiterPaths()).toHaveLength(1);
        expect((await db.doc(limiterPaths()[0] as string).get()).data()?.count).toBe(1);
    });

    it('keeps the address out of the limiter\'s key', async () => {
        await call({ sign: 'aries' });

        expect(limiterPaths().join('')).not.toContain('203.0.113.7');
        expect(limiterPaths()[0]).toContain(keyedHash('ip:203.0.113.7', 'test-secret'));
    });

    it('answers 429 once that address has used up its reads, and reads nothing more', async () => {
        const key = `homePreview_${keyedHash('ip:203.0.113.7', 'test-secret')}`;

        for (let n = 0; n < 60; n++) await new RateLimitService().consume(key, 60, 60 * 1000);

        const read = vi.spyOn(FixedContentService.prototype, 'getPublished');

        await expect(call({ sign: 'aries' })).rejects.toMatchObject({ statusCode: 429 });

        expect(read).not.toHaveBeenCalled();
        expect(holder.headers['Cache-Control']).toBe('no-store');
    });

    it('does not let one address\'s limit stop another', async () => {
        const key = `homePreview_${keyedHash('ip:203.0.113.7', 'test-secret')}`;

        for (let n = 0; n < 60; n++) await new RateLimitService().consume(key, 60, 60 * 1000);

        holder.ip = '198.51.100.9';

        expect(await call({ sign: 'aries' })).toMatchObject({ zodiac: { title: 'ZODIAC aries' } });
    });

    it('still answers from memory when the address is over its limit', async () => {
        await call({ sign: 'aries' });

        const key = `homePreview_${keyedHash('ip:203.0.113.7', 'test-secret')}`;

        for (let n = 0; n < 60; n++) await new RateLimitService().consume(key, 60, 60 * 1000).catch(() => undefined);

        expect(await call({ sign: 'aries' })).toMatchObject({ zodiac: { title: 'ZODIAC aries' } });
    });
});
