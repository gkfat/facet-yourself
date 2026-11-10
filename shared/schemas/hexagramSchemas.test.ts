import {
    describe, expect, it,
} from 'vitest';
import { hexagramDrawDocSchema } from './firestore/hexagramDraw.schema';
import { hexagramCastRequestSchema } from './api/hexagram.schema';

const free = {
    date: '2026-11-09',
    seq: 0,
    lines: [
        7,
        8,
        9,
        6,
        7,
        8,
    ],
    drawnAt: 1,
    expiresAt: 2,
    drawVersion: 'hexagram-v1',
    paid: false,
    pointTransactionId: null,
    requestId: null,
};

describe('hexagramDrawDocSchema', () => {
    it('accepts the free cast of the day and a paid one', () => {
        expect(hexagramDrawDocSchema.safeParse(free).success).toBe(true);
        expect(hexagramDrawDocSchema.safeParse({
            ...free, seq: 1, paid: true, pointTransactionId: 'hexagram:u1:2026-11-09:1', requestId: '0b0d6f5e-2f3e-4a62-9d8a-77f0a1f7a8a1',
        }).success).toBe(true);
    });

    it('refuses lines that are not six values of 6 to 9', () => {
        expect(hexagramDrawDocSchema.safeParse({
            ...free, lines: [
                7,
                8,
                9,
                6,
                7,
            ],
        }).success).toBe(false);
        expect(hexagramDrawDocSchema.safeParse({
            ...free, lines: [
                7,
                8,
                9,
                6,
                7,
                5,
            ],
        }).success).toBe(false);
    });

    it('refuses a paid first cast, a free later cast and a paid cast without its transaction', () => {
        expect(hexagramDrawDocSchema.safeParse({
            ...free, paid: true, pointTransactionId: 'x',
        }).success).toBe(false);
        expect(hexagramDrawDocSchema.safeParse({
            ...free, seq: 1,
        }).success).toBe(false);
        expect(hexagramDrawDocSchema.safeParse({
            ...free, seq: 1, paid: true,
        }).success).toBe(false);
    });
});

describe('hexagramCastRequestSchema', () => {
    it('accepts an empty body, an idempotency key and the confirmation of the price', () => {
        expect(hexagramCastRequestSchema.safeParse({}).success).toBe(true);
        expect(hexagramCastRequestSchema.safeParse({ requestId: '0b0d6f5e-2f3e-4a62-9d8a-77f0a1f7a8a1' }).success).toBe(true);
        expect(hexagramCastRequestSchema.safeParse({
            requestId: '0b0d6f5e-2f3e-4a62-9d8a-77f0a1f7a8a1', confirmCharge: true,
        }).success).toBe(true);
    });

    it('refuses a confirmation that is not a boolean', () => {
        expect(hexagramCastRequestSchema.safeParse({ confirmCharge: 'yes' }).success).toBe(false);
    });

    it('refuses a date, an identity, lines, a sequence number or free text', () => {
        for (const extra of [
            { date: '2026-11-09' },
            { uid: 'u1' },
            {
                lines: [
                    7,
                    7,
                    7,
                    7,
                    7,
                    7,
                ], 
            },
            { seq: 3 },
            { question: '今年運勢如何？' },
        ]) {
            expect(hexagramCastRequestSchema.safeParse(extra).success).toBe(false);
        }
    });

    it('refuses a request id that is not a uuid', () => {
        expect(hexagramCastRequestSchema.safeParse({ requestId: 'abc' }).success).toBe(false);
    });
});
