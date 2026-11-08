type Entry<T> = {
    value: T;
    expiresAt: number;
};

/**
 * A small in-memory cache that forgets after `ttlMs`. Concurrent callers for the same key share one computation,
 * and a failed computation is not kept.
 */
export class TtlCache<T> {
    private readonly entries = new Map<string, Entry<Promise<T>>>();

    constructor(
        private readonly ttlMs: number,
        private readonly clock: () => number = Date.now,
    ) {}

    get(key: string, compute: () => Promise<T>): Promise<T> {
        const now = this.clock();
        const hit = this.entries.get(key);

        if (hit && hit.expiresAt > now) return hit.value;

        const value = compute();

        this.entries.set(key, {
            value, expiresAt: now + this.ttlMs,
        });
        value.catch(() => {
            if (this.entries.get(key)?.value === value) this.entries.delete(key);
        });

        return value;
    }
}
