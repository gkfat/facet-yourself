import type { H3Event } from 'h3';
import {
    beforeEach, describe, expect, it, vi,
} from 'vitest';

const holder = vi.hoisted(() => ({
    body: undefined as unknown,
    viewer: {
        kind: 'member', uid: 'u1', 
    } as { kind: 'member'; uid: string } | { kind: 'guest'; sessionId: string } | AuthErrorLike,
    headers: {} as Record<string, string>,
    calls: [] as { method: string; args: unknown[] }[],
}));

type AuthErrorLike = { kind: 'none' };

const lines = [
    7,
    8,
    9,
    6,
    7,
    8,
];
const face = {
    order: 1, name: '乾', upper: '乾', lower: '乾', judgment: 'j', tuan: 't', image: 'i',
};
const content = {
    contentType: 'HEXAGRAM', key: '1', contentVersion: '1', title: 'title', summary: 's', strengths: [], blindSpots: [], growthAdvice: '', disclaimer: 'd',
};
const cast = {
    seq: 0, paid: false, lines, mode: 'none', moving: [], primary: face, content, changed: null, movingLine: null,
};

vi.mock('h3', () => ({
    defineEventHandler: (handler: unknown) => handler,
    setResponseHeader: (_event: unknown, name: string, value: string) => {
        holder.headers[name] = value;
    },
    readBody: () => Promise.resolve(holder.body),
}));
// The error handler only turns an AppError into an H3 error; the status code is the AppError's own
vi.mock('../../utils/errorHandler', () => ({ toH3Error: (error: unknown) => error }));
vi.mock('../../utils/viewer', async () => {
    const { AuthError: Auth } = await import('../../../shared/types/errors');

    return {
        requireViewer: () => {
            if ('kind' in holder.viewer && holder.viewer.kind === 'none') throw new Auth('Sign in or start a guest session first');

            return Promise.resolve(holder.viewer);
        },
    };
});
vi.mock('../../services/hexagram.service', () => ({
    HexagramService: class {
        getToday(uid: string) {
            holder.calls.push({
                method: 'getToday', args: [uid],
            });

            return Promise.resolve({
                date: '2026-11-09', drawn: true, casts: [cast], nextCost: 1,
            });
        }

        getTodayForGuest() {
            holder.calls.push({
                method: 'getTodayForGuest', args: [],
            });

            return {
                date: '2026-11-09', drawn: false, nextCost: 0,
            };
        }

        draw(uid: string, request: unknown) {
            holder.calls.push({
                method: 'draw', args: [uid, request],
            });

            return Promise.resolve({
                date: '2026-11-09', cast, nextCost: 1,
            });
        }

        drawForGuest(sessionId: string, request: unknown) {
            holder.calls.push({
                method: 'drawForGuest', args: [sessionId, request],
            });

            return Promise.resolve({
                date: '2026-11-09', cast, nextCost: null,
            });
        }
    },
}));

const { default: getDaily } = await import('./daily.get');
const { default: postDaily } = await import('./daily.post');

const event = {} as H3Event;
const run = (handler: unknown) => (handler as (event: H3Event) => Promise<unknown>)(event);
const statusOf = async (handler: unknown) => {
    try {
        await run(handler);

        return 200;
    } catch (error) {
        return (error as { statusCode?: number }).statusCode;
    }
};

describe('GET /api/hexagram/daily', () => {
    beforeEach(() => {
        holder.viewer = {
            kind: 'member', uid: 'u1',
        };
        holder.body = undefined;
        holder.headers = {};
        holder.calls = [];
    });

    it('lists the casts of the day of the member and is not cached', async () => {
        expect(await run(getDaily)).toMatchObject({
            drawn: true, nextCost: 1, casts: [{ seq: 0 }],
        });
        expect(holder.calls).toEqual([
            {
                method: 'getToday', args: ['u1'],
            },
        ]);
        expect(holder.headers['Cache-Control']).toBe('private, no-store');
    });

    it('only tells a visitor the date', async () => {
        holder.viewer = {
            kind: 'guest', sessionId: 's'.repeat(32),
        };

        expect(await run(getDaily)).toEqual({
            date: '2026-11-09', drawn: false, nextCost: 0,
        });
        expect(holder.calls).toEqual([
            {
                method: 'getTodayForGuest', args: [],
            },
        ]);
    });

    it('is a 401 without a token or a session', async () => {
        holder.viewer = { kind: 'none' };

        expect(await statusOf(getDaily)).toBe(401);
        expect(holder.calls).toEqual([]);
    });
});

describe('POST /api/hexagram/daily', () => {
    beforeEach(() => {
        holder.viewer = {
            kind: 'member', uid: 'u1',
        };
        holder.body = undefined;
        holder.headers = {};
        holder.calls = [];
    });

    it('casts for the member, with no body at all', async () => {
        expect(await run(postDaily)).toMatchObject({
            nextCost: 1, cast: { seq: 0 },
        });
        expect(holder.calls).toEqual([
            {
                method: 'draw', args: ['u1', {}],
            },
        ]);
        expect(holder.headers['Cache-Control']).toBe('private, no-store');
    });

    it('passes the idempotency key and the confirmation of the price on', async () => {
        holder.body = {
            requestId: '0b0d6f5e-2f3e-4a62-9d8a-77f0a1f7a8a1', confirmCharge: true,
        };
        await run(postDaily);

        expect(holder.calls).toEqual([
            {
                method: 'draw', args: [
                    'u1', {
                        requestId: '0b0d6f5e-2f3e-4a62-9d8a-77f0a1f7a8a1', confirmCharge: true,
                    },
                ],
            },
        ]);
    });

    it('casts the free cast of a visitor, who has no account to name', async () => {
        holder.viewer = {
            kind: 'guest', sessionId: 's'.repeat(32),
        };

        expect(await run(postDaily)).toMatchObject({ nextCost: null });
        expect(holder.calls).toEqual([
            {
                method: 'drawForGuest', args: ['s'.repeat(32), {}],
            },
        ]);
    });

    it.each([
        ['a date', { date: '2026-11-01' }],
        ['an identity', { uid: 'someone-else' }],
        [
            'lines', {
                lines: [
                    9,
                    9,
                    9,
                    9,
                    9,
                    9,
                ], 
            },
        ],
        ['a number of the cast', { seq: 0 }],
        ['a question', { question: '今年的運勢如何？' }],
        ['a request id that is not a uuid', { requestId: 'abc' }],
        ['a confirmation that is not a boolean', { confirmCharge: 'yes' }],
    ])('is refused when it carries %s, and casts nothing', async (_name, body) => {
        holder.body = body;

        expect(await statusOf(postDaily)).toBe(400);
        expect(holder.calls).toEqual([]);
    });

    it('is a 401 without a token or a session, before the body is looked at', async () => {
        holder.viewer = { kind: 'none' };
        holder.body = { question: 'x' };

        expect(await statusOf(postDaily)).toBe(401);
        expect(holder.calls).toEqual([]);
    });
});
