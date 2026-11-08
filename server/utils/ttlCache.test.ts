import {
    describe, expect, it, vi,
} from 'vitest';
import { TtlCache } from './ttlCache';

describe('TtlCache', () => {
    it('computes once within the ttl and again after it', async () => {
        let now = 0;
        const cache = new TtlCache<number>(1000, () => now);
        const compute = vi.fn().mockResolvedValue(1);

        await cache.get('a', compute);
        now = 999;
        await cache.get('a', compute);
        expect(compute).toHaveBeenCalledTimes(1);

        now = 1000;
        await cache.get('a', compute);
        expect(compute).toHaveBeenCalledTimes(2);
    });

    it('keeps keys apart and shares a computation in flight', async () => {
        const cache = new TtlCache<number>(1000, () => 0);
        const compute = vi.fn().mockResolvedValue(1);

        await Promise.all([cache.get('a', compute), cache.get('a', compute)]);
        await cache.get('b', compute);

        expect(compute).toHaveBeenCalledTimes(2);
    });

    it('does not keep a failure', async () => {
        const cache = new TtlCache<number>(1000, () => 0);
        const compute = vi.fn().mockRejectedValueOnce(new Error('down')).mockResolvedValue(2);

        await expect(cache.get('a', compute)).rejects.toThrow('down');
        await expect(cache.get('a', compute)).resolves.toBe(2);
    });
});
