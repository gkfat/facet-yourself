import {
    isRealDate, isoDateSchema, numerologySchema, type Zodiac,
} from '../../shared/schemas/common';
import {
    homePreviewResponseSchema, type HomePreviewResponse,
} from '../../shared/schemas/api/home.schema';
import { lifePathNumber } from '../../shared/utils/numerology';
import { zodiacFromIsoDate } from '../../shared/utils/zodiac';

/** What the preview asks the server: the sign and the life path number, never the birth date. */
export type PreviewKey = {
    sign: Zodiac;
    lifePath: string;
};

/** The key of a birth date, or null while it is empty, half filled in or not a real date. */
export function previewKeyOf(birthDate: string | null | undefined): PreviewKey | null {
    if (!birthDate || !isoDateSchema.safeParse(birthDate).success || !isRealDate(birthDate)) return null;

    const lifePath = numerologySchema.safeParse(String(lifePathNumber(birthDate)));

    return lifePath.success
        ? {
            sign: zodiacFromIsoDate(birthDate), lifePath: lifePath.data,
        }
        : null;
}

const keyString = ({
    sign, lifePath,
}: PreviewKey) => `${sign}|${lifePath}`;

/**
 * Gets the summaries for a key at most once: an answer is kept for the rest of the visit, and two asks for the same
 * key at the same time share one request. Anything that goes wrong (the network, a 429, an answer of the wrong
 * shape) gives null, is not kept, and is not retried: the preview then shows only the names.
 */
export function createPreviewLoader(fetcher: (key: PreviewKey) => Promise<unknown>) {
    const answers = new Map<string, HomePreviewResponse>();
    const inFlight = new Map<string, Promise<HomePreviewResponse | null>>();

    async function fetchOnce(key: PreviewKey): Promise<HomePreviewResponse | null> {
        try {
            const parsed = homePreviewResponseSchema.safeParse(await fetcher({
                sign: key.sign, lifePath: key.lifePath,
            }));

            if (!parsed.success) {
                console.warn('[home preview] unexpected answer:', parsed.error.issues);

                return null;
            }

            answers.set(keyString(key), parsed.data);

            return parsed.data;
        } catch (error) {
            console.warn('[home preview] summaries unavailable:', error);

            return null;
        }
    }

    return {
        async load(key: PreviewKey): Promise<HomePreviewResponse | null> {
            const id = keyString(key);
            const known = answers.get(id);

            if (known) return known;

            const pending = inFlight.get(id) ?? fetchOnce(key).finally(() => inFlight.delete(id));

            inFlight.set(id, pending);

            return pending;
        },
    };
}
