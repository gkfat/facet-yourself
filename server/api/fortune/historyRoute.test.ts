import type { H3Event } from 'h3';
import {
    beforeEach, describe, expect, it, vi,
} from 'vitest';

const holder = vi.hoisted(() => ({
    query: {} as Record<string, unknown>,
    signedIn: true,
    headers: {} as Record<string, string>,
    calls: [] as { method: string; args: unknown[] }[],
}));

vi.mock('h3', () => ({
    defineEventHandler: (handler: unknown) => handler,
    getQuery: () => holder.query,
    setResponseHeader: (_event: unknown, name: string, value: string) => {
        holder.headers[name] = value;
    },
}));
// The error handler only turns an AppError into an H3 error; the status code is the AppError's own
vi.mock('../../utils/errorHandler', () => ({ toH3Error: (error: unknown) => error }));
vi.mock('../../utils/auth', async () => {
    const { AuthError: Auth } = await import('../../../shared/types/errors');

    return {
        requireAuth: () => {
            if (!holder.signedIn) throw new Auth('Missing or invalid authorization header');

            return Promise.resolve({ uid: 'u1' });
        },
    };
});
vi.mock('../../services/fortuneHistory.service', () => ({
    FortuneHistoryService: class {
        list(uid: string, request: unknown) {
            holder.calls.push({
                method: 'list', args: [uid, request],
            });

            return Promise.resolve({
                days: [], nextBefore: null, truncated: false,
            });
        }
    },
}));

const { default: getHistory } = await import('./history.get');

const event = {} as H3Event;
const run = () => (getHistory as unknown as (event: H3Event) => Promise<unknown>)(event);
const statusOf = async () => {
    try {
        await run();

        return 200;
    } catch (error) {
        return (error as { statusCode?: number }).statusCode;
    }
};

describe('GET /api/fortune/history', () => {
    beforeEach(() => {
        holder.query = {};
        holder.signedIn = true;
        holder.headers = {};
        holder.calls = [];
    });

    it('asks for the first page of the member and is not cached', async () => {
        expect(await run()).toEqual({
            days: [], nextBefore: null, truncated: false,
        });
        expect(holder.calls).toEqual([
            {
                method: 'list', args: ['u1', { limit: 14 }],
            },
        ]);
        expect(holder.headers['Cache-Control']).toBe('private, no-store');
    });

    it('passes the cursor and the page size on', async () => {
        holder.query = {
            before: '2026-11-01', limit: '5',
        };
        await run();

        expect(holder.calls).toEqual([
            {
                method: 'list', args: [
                    'u1', {
                        before: '2026-11-01', limit: 5,
                    },
                ],
            },
        ]);
    });

    it.each([
        ['limit above 14', { limit: '15' }],
        ['limit of zero', { limit: '0' }],
        ['limit that is not a number', { limit: 'many' }],
        ['before that is not a date', { before: 'yesterday' }],
        ['before that is not a real date', { before: '2026-02-31' }],
        ['a field that is not accepted', { uid: 'someone-else' }],
    ])('is a 400 for a %s, without asking the service', async (_name, query) => {
        holder.query = query;

        expect(await statusOf()).toBe(400);
        expect(holder.calls).toEqual([]);
    });

    it('is a 401 for a visitor or a request without a token, without asking the service', async () => {
        holder.signedIn = false;

        expect(await statusOf()).toBe(401);
        expect(holder.calls).toEqual([]);
    });
});
