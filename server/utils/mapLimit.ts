/** `mapper` over every item with at most `limit` in flight, results in the order of the items. */
export async function mapLimit<T, R>(items: readonly T[], limit: number, mapper: (item: T) => Promise<R>): Promise<R[]> {
    const results: R[] = new Array<R>(items.length);
    let next = 0;

    const worker = async () => {
        while (next < items.length) {
            const index = next;

            next += 1;
            results[index] = await mapper(items[index] as T);
        }
    };

    await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));

    return results;
}
