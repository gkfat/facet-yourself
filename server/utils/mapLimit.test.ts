import {
    describe, expect, it,
} from 'vitest';
import { mapLimit } from './mapLimit';

describe('mapLimit', () => {
    it('keeps the order of the items and never runs more than the limit at once', async () => {
        let running = 0;
        let peak = 0;

        const result = await mapLimit([
            1,
            2,
            3,
            4,
            5,
        ], 2, async (item) => {
            running += 1;
            peak = Math.max(peak, running);
            await new Promise((resolve) => setTimeout(resolve, 5 - item));
            running -= 1;

            return item * 10;
        });

        expect(result).toEqual([
            10,
            20,
            30,
            40,
            50,
        ]);
        expect(peak).toBeLessThanOrEqual(2);
    });

    it('handles no items', async () => {
        expect(await mapLimit([], 3, (item: number) => Promise.resolve(item))).toEqual([]);
    });
});
