import {
    fortuneHistoryResponseSchema, type FortuneHistoryDay, type FortuneHistoryResponse,
} from '../../shared/schemas/api/fortuneHistory.schema';

/** `loading`: the first page is on its way. `failed`: the first page did not come; see `moreFailed` for the later ones. */
export type FortuneHistoryStatus = 'idle' | 'loading' | 'ready' | 'failed';

/**
 * The history of a member's daily draws, a page of dates at a time. Members only: the page that uses it does not
 * ask for a visitor. The server decides who and which window; the client only asks for the first page, then for the
 * dates before the oldest one it has.
 */
export function useFortuneHistory() {
    const { get } = useApi();
    const days = ref<FortuneHistoryDay[]>([]);
    const nextBefore = ref<string | null>(null);
    const truncated = ref(false);
    const status = ref<FortuneHistoryStatus>('idle');
    const loadingMore = ref(false);
    const moreFailed = ref(false);

    async function fetchPage(before?: string): Promise<FortuneHistoryResponse> {
        const raw = await get<unknown>('/api/fortune/history', { query: before ? { before } : {} });

        return fortuneHistoryResponseSchema.parse(raw);
    }

    /** Ask for the newest page, replacing what is shown. A request already on its way is not repeated. */
    async function loadFirst(): Promise<void> {
        if (status.value === 'loading') return;

        status.value = 'loading';
        moreFailed.value = false;

        try {
            const page = await fetchPage();

            days.value = page.days;
            nextBefore.value = page.nextBefore;
            truncated.value = page.truncated;
            status.value = 'ready';
        } catch (error) {
            console.error('[useFortuneHistory] first page failed:', error);
            status.value = 'failed';
        }
    }

    /** Add the page of dates before the oldest one shown. Does nothing without an older date or while one is on its way. */
    async function loadMore(): Promise<void> {
        const before = nextBefore.value;

        if (!before || loadingMore.value || status.value !== 'ready') return;

        loadingMore.value = true;
        moreFailed.value = false;

        try {
            const page = await fetchPage(before);
            const shown = new Set(days.value.map((day) => day.date));

            days.value = [...days.value, ...page.days.filter((day) => !shown.has(day.date))];
            nextBefore.value = page.nextBefore;
            truncated.value = truncated.value || page.truncated;
        } catch (error) {
            console.error('[useFortuneHistory] next page failed:', error);
            moreFailed.value = true;
        } finally {
            loadingMore.value = false;
        }
    }

    return {
        days, nextBefore, truncated, status, loadingMore, moreFailed, loadFirst, loadMore,
    };
}
