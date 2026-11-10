import { BaseService } from './base.service';
import { HexagramService } from './hexagram.service';
import { RuneService } from './rune.service';
import { TarotService } from './tarot.service';
import {
    FORTUNE_HISTORY_PAGE_DAYS, fortuneHistoryWindowStart,
} from '../../shared/constants/fortuneHistory';
import { HEXAGRAM_ENTRY_ENABLED } from '../../shared/constants/hexagramShape';
import type {
    FortuneHistoryDay, FortuneHistoryResponse,
} from '../../shared/schemas/api/fortuneHistory.schema';
import { ValidationError } from '../../shared/types/errors';
import {
    DAY_MS, taipeiDateKey, taipeiDayStart,
} from '../../shared/utils/time';

type FortuneHistoryServiceOptions = {
    tarot?: TarotService;
    rune?: RuneService;
    hexagram?: HexagramService;
    /** Whether the casts are part of the history; follows the entry switch of the hexagram part */
    hexagramEnabled?: boolean;
    clock?: () => number;
};

export type FortuneHistoryRequest = {
    /** Only dates before this one are listed */
    before?: string;
    limit?: number;
};

/** The Taipei date before another one. */
const dayBefore = (date: string): string => taipeiDateKey(new Date(taipeiDayStart(date) - DAY_MS));

/**
 * What a member drew in the last three months, a page of dates at a time. Reads only: it merges what the tarot, rune and
 * hexagram parts already keep and writes nothing. The dates that have a record are worked out from document ids alone,
 * so the readings are loaded for the dates of the page only.
 */
export class FortuneHistoryService extends BaseService {
    protected serviceName = 'fortune-history';

    private readonly tarot: TarotService;

    private readonly rune: RuneService;

    private readonly hexagram: HexagramService;

    private readonly hexagramEnabled: boolean;

    private readonly clock: () => number;

    constructor(options: FortuneHistoryServiceOptions = {}) {
        super();
        this.clock = options.clock ?? Date.now;
        this.tarot = options.tarot ?? new TarotService({ clock: this.clock });
        this.rune = options.rune ?? new RuneService({ clock: this.clock });
        this.hexagram = options.hexagram ?? new HexagramService({ clock: this.clock });
        this.hexagramEnabled = options.hexagramEnabled ?? HEXAGRAM_ENTRY_ENABLED;
    }

    async list(uid: string, request: FortuneHistoryRequest = {}): Promise<FortuneHistoryResponse> {
        const now = this.clock();
        const today = taipeiDateKey(new Date(now));
        const windowStart = fortuneHistoryWindowStart(now);
        const limit = request.limit ?? FORTUNE_HISTORY_PAGE_DAYS;

        if (request.before !== undefined && (request.before > today || request.before < windowStart)) {
            throw new ValidationError('before is outside of the history window');
        }

        const newest = request.before === undefined ? today : dayBefore(request.before);

        if (newest < windowStart) {
            return {
                days: [], nextBefore: null, truncated: false,
            };
        }

        const [
            tarotDates,
            runeDates,
            hexagramDates,
        ] = await Promise.all([
            this.tarot.recordedDates(uid, windowStart, newest),
            this.rune.recordedDates(uid, windowStart, newest),
            this.hexagramEnabled
                ? this.hexagram.recordedDates(uid, windowStart, newest)
                : Promise.resolve({
                    dates: [], truncated: false,
                }),
        ]);

        const dates = [
            ...new Set([
                ...tarotDates,
                ...runeDates,
                ...hexagramDates.dates,
            ]),
        ].sort().reverse();
        const page = dates.slice(0, limit);
        const oldest = page[page.length - 1];
        const newestOfPage = page[0];

        if (oldest === undefined || newestOfPage === undefined) {
            return {
                days: [], nextBefore: null, truncated: hexagramDates.truncated,
            };
        }

        // Every date between the two ends of the page that has a record is on the page, so one range per part is enough
        const [
            tarotItems,
            runeItems,
            hexagramItems,
        ] = await Promise.all([
            this.tarot.listRange(uid, oldest, newestOfPage),
            this.rune.listRange(uid, oldest, newestOfPage),
            this.hexagramEnabled ? this.hexagram.listRange(uid, oldest, newestOfPage) : Promise.resolve([]),
        ]);

        const days: FortuneHistoryDay[] = page.map((date) => ({
            date,
            tarot: tarotItems.find((entry) => entry.date === date)?.item ?? null,
            rune: runeItems.find((entry) => entry.date === date)?.item ?? null,
            hexagrams: hexagramItems.filter((entry) => entry.date === date).map((entry) => entry.item),
        }));

        this.logInfo('fortune history read', {
            action: 'list',
            userId: uid,
            data: {
                days: days.length, hasMore: dates.length > limit, truncated: hexagramDates.truncated,
            },
        });

        return {
            days,
            nextBefore: dates.length > limit ? oldest : null,
            truncated: hexagramDates.truncated,
        };
    }
}
