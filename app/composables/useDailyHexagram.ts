import {
    dailyHexagramResponseSchema, hexagramCastResponseSchema,
} from '../../shared/schemas/api/hexagram.schema';
import type {
    DailyHexagramResponse, HexagramCastResponse,
} from '../../shared/schemas/api/hexagram.schema';

/** `missing`: the readings for today's hexagram are not published yet (404). */
export type DailyHexagramStatus = 'idle' | 'loading' | 'ready' | 'missing' | 'failed';

/** Why the last cast did not happen, when it did not: not enough points, or anything else. */
export type HexagramCastProblem = 'insufficient' | 'missing' | 'failed' | null;

function statusOf(error: unknown): number | undefined {
    if (typeof error !== 'object' || error === null) return undefined;

    const candidate = error as { statusCode?: number; status?: number };

    return candidate.statusCode ?? candidate.status;
}

/** A cast as the state of the day it was made on: what a visitor keeps, and what a member's list is merged with. */
function dayOf(response: HexagramCastResponse): DailyHexagramResponse {
    return {
        date: response.date, drawn: true, casts: [response.cast], nextCost: response.nextCost,
    };
}

/**
 * Today's hexagram casts, shared by the fortune page and the home block. The server decides the Taipei date, the
 * lines and what a cast costs; the client only asks (GET) or casts (POST) and shows what comes back. A member's casts
 * live on the server; a visitor's one free cast is kept in the browser for the day (see `useFortuneAccess`).
 */
export function useDailyHexagram() {
    const {
        ask, reveal,
    } = useFortuneAccess<DailyHexagramResponse>('hexagram', dailyHexagramResponseSchema);
    const { refresh: refreshPoints } = usePoints();
    const today = useState<DailyHexagramResponse | null>('dailyHexagram', () => null);
    const status = useState<DailyHexagramStatus>('dailyHexagramStatus', () => 'idle');
    const casting = ref(false);
    const problem = ref<HexagramCastProblem>(null);

    /** Ask what has been cast today. Writes nothing. */
    async function load(): Promise<void> {
        if (status.value !== 'ready') status.value = 'loading';

        try {
            today.value = await ask('/api/hexagram/daily');
            status.value = 'ready';
        } catch (error) {
            if (statusOf(error) === 404) {
                status.value = 'missing';

                return;
            }

            console.error('[useDailyHexagram] request failed:', error);
            status.value = 'failed';
        }
    }

    /**
     * Cast a hexagram. The first of the day is free; for every one after it the caller passes `confirmCharge` once the
     * member has agreed to the price. The request carries a fresh key, so a resend of this very cast is answered with
     * the same hexagram and costs nothing more.
     */
    async function cast(confirmCharge = false): Promise<void> {
        if (casting.value) return;

        casting.value = true;
        problem.value = null;

        try {
            const answer = await reveal('/api/hexagram/daily', {
                body: {
                    requestId: crypto.randomUUID(), ...(confirmCharge ? { confirmCharge: true } : {}),
                },
                parse: (raw) => dayOf(hexagramCastResponseSchema.parse(raw)),
            });
            const newest = answer.drawn ? answer.casts[0] : undefined;
            const before = today.value?.drawn ? today.value.casts : [];

            if (answer.drawn && newest) {
                // A member's list is what the server has: the new cast joins it (or is the one already there)
                const casts = [...before.filter((item) => item.seq !== newest.seq), newest].sort((a, b) => a.seq - b.seq);

                today.value = {
                    ...answer, casts,
                };
            } else {
                today.value = answer;
            }

            status.value = 'ready';

            if (confirmCharge) void refreshPoints();
        } catch (error) {
            const code = statusOf(error);

            if (code === 402) problem.value = 'insufficient';
            else if (code === 404) problem.value = 'missing';
            else {
                console.error('[useDailyHexagram] cast failed:', error);
                problem.value = 'failed';
            }
        } finally {
            casting.value = false;
        }
    }

    function clear(): void {
        today.value = null;
        status.value = 'idle';
        problem.value = null;
    }

    return {
        today, status, casting, problem, load, cast, clear,
    };
}
