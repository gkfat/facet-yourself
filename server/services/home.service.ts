import { BaseService } from './base.service';
import { FixedContentService } from './fixedContent.service';
import type {
    HomePreviewItem, HomePreviewQuery, HomePreviewResponse,
} from '../../shared/schemas/api/home.schema';
import type { FixedContentType } from '../../shared/utils/fixedContentKeys';
import { NotFoundError } from '../../shared/types/errors';

/** A published line is kept a while; a missing one only briefly, so content that goes live shows up soon. */
const FOUND_TTL_MS = 10 * 60 * 1000;
const MISSING_TTL_MS = 60 * 1000;

type CacheEntry = {
    value: HomePreviewItem;
    expiresAt: number;
};

/**
 * What this instance has already read, by content type and key. The keys come from validated input (12 signs and
 * 12 life path numbers), so the map cannot grow beyond a couple of dozen entries.
 */
export class PreviewCache {
    private readonly entries = new Map<string, CacheEntry>();

    constructor(private readonly clock: () => number = Date.now) {}

    get(key: string): CacheEntry | null {
        const entry = this.entries.get(key);

        if (!entry) return null;

        if (entry.expiresAt <= this.clock()) {
            this.entries.delete(key);

            return null;
        }

        return entry;
    }

    set(key: string, value: HomePreviewItem, ttlMs: number): void {
        this.entries.set(key, {
            value, expiresAt: this.clock() + ttlMs,
        });
    }
}

/** A serverless instance serves many requests: the cache has to outlive the service, which is made for each one. */
const sharedCache = new PreviewCache();

type HomeServiceOptions = {
    content?: FixedContentService;
    cache?: PreviewCache;
};

type Wanted = {
    field: keyof HomePreviewResponse;
    type: FixedContentType;
    key: string;
};

export class HomeService extends BaseService {
    protected serviceName = 'home';

    private readonly content: FixedContentService;
    private readonly cache: PreviewCache;

    constructor(options: HomeServiceOptions = {}) {
        super();
        this.content = options.content ?? new FixedContentService();
        this.cache = options.cache ?? sharedCache;
    }

    /**
     * The title and one-line summary of the sign's and the life path number's published content. A line that is not
     * published is null and does not fail the other. `beforeRead` runs once, and only when something has to be read
     * from the store: that is where a caller limits how often that may happen, so a request answered from memory
     * costs nothing.
     */
    async preview(query: HomePreviewQuery, beforeRead: () => Promise<void> = async () => undefined): Promise<HomePreviewResponse> {
        const wanted: Wanted[] = [
            ...(query.sign ? [
                {
                    field: 'zodiac' as const, type: 'ZODIAC' as const, key: query.sign,
                },
            ] : []), ...(query.lifePath ? [
                {
                    field: 'numerology' as const, type: 'NUMEROLOGY' as const, key: query.lifePath,
                },
            ] : []),
        ];
        const response: HomePreviewResponse = {
            zodiac: null, numerology: null,
        };
        const misses: Wanted[] = [];

        for (const item of wanted) {
            const cached = this.cache.get(this.cacheKey(item));

            if (cached) {
                response[item.field] = cached.value;
            } else {
                misses.push(item);
            }
        }

        if (!misses.length) return response;

        await beforeRead();

        await Promise.all(misses.map(async (item) => {
            response[item.field] = await this.read(item);
        }));

        return response;
    }

    private cacheKey({
        type, key,
    }: Wanted): string {
        return `${type}:${key}`;
    }

    private async read(item: Wanted): Promise<HomePreviewItem> {
        try {
            const {
                title, summary,
            } = await this.content.getPublished(item.type, item.key);
            const value = {
                title, summary,
            };

            this.cache.set(this.cacheKey(item), value, FOUND_TTL_MS);

            return value;
        } catch (error) {
            // Not published (yet) is an answer, not a failure; anything else is
            if (!(error instanceof NotFoundError)) throw error;

            this.cache.set(this.cacheKey(item), null, MISSING_TTL_MS);

            return null;
        }
    }
}
