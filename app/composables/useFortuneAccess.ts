import type { ZodType } from 'zod';
import { taipeiDateKey } from '../../shared/utils/time';

const KEY_PREFIX = 'fortune';

function statusOf(error: unknown): number | undefined {
    if (typeof error !== 'object' || error === null) return undefined;

    const candidate = error as { statusCode?: number; status?: number };

    return candidate.statusCode ?? candidate.status;
}

/**
 * How one of the daily parts (a draw, an unlock) is asked for and revealed by whoever is looking.
 *
 * A member's answer lives on the server. A visitor's does not: the server works it out from the guest session and
 * the date without keeping it, so what the visitor has already revealed today is remembered here, in the browser
 * (the same place the session id is kept), and dropped as soon as the Taipei date or the session changes.
 */
/** What reveal sends and how it reads the answer, for a part that is revealed with a request body. */
export type RevealOptions<T> = {
    body?: Record<string, unknown>;
    /** Turns the server's answer into what is kept and returned; the answer as it is when absent */
    parse?: (raw: unknown) => T;
};

export function useFortuneAccess<T extends { date: string }>(kind: string, schema: ZodType<T>) {
    const {
        get, post,
    } = useApi();
    const { settled } = useViewer();
    const {
        sessionId, restore, ensureSession, forget,
    } = useGuestSession();

    const storageKey = (id: string) => `${KEY_PREFIX}:${kind}:${id}`;

    /** What this session revealed today, or null. Storage is untrusted input: it is parsed again. */
    function readKept(): T | null {
        restore();

        if (!sessionId.value) return null;

        try {
            const raw = sessionStorage.getItem(storageKey(sessionId.value));
            const parsed = raw ? schema.safeParse(JSON.parse(raw)) : null;

            return parsed?.success && parsed.data.date === taipeiDateKey(new Date()) ? parsed.data : null;
        } catch (error) {
            console.warn(`[useFortuneAccess] cannot read what ${kind} revealed:`, error);

            return null;
        }
    }

    function keep(response: T): void {
        if (!sessionId.value) return;

        try {
            sessionStorage.setItem(storageKey(sessionId.value), JSON.stringify(response));
        } catch (error) {
            console.warn(`[useFortuneAccess] cannot keep what ${kind} revealed:`, error);
        }
    }

    /** What has been revealed today: the server's answer for a member, the browser's memory for a visitor. */
    async function ask(url: string): Promise<T | null> {
        const who = await settled();

        if (who === 'guest') return readKept();

        return get<T>(url, {}, 'optional');
    }

    /** Reveal today's part. A visitor gets a session first, and a fresh one if theirs has expired. */
    async function reveal(url: string, options: RevealOptions<T> = {}): Promise<T> {
        const who = await settled();
        const send = async (): Promise<T> => {
            const raw = await post<unknown>(url, options.body, {}, 'optional');

            return options.parse ? options.parse(raw) : raw as T;
        };

        if (who === 'member') return send();

        await ensureSession();

        try {
            const response = await send();

            keep(response);

            return response;
        } catch (error) {
            if (statusOf(error) !== 401) throw error;

            // The session is gone (it lasts a day): start another one and try once more
            forget();
            await ensureSession();

            const response = await send();

            keep(response);

            return response;
        }
    }

    return {
        ask, reveal,
    };
}
