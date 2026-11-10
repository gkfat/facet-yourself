import type { Transaction } from 'firebase-admin/firestore';
import { BaseService } from './base.service';
import { guestDrawSubject } from './dailyDraw.engine';
import { FixedContentService } from './fixedContent.service';
import { PointService } from './point.service';
import { HexagramRepository } from '../repositories/hexagram.repository';
import { toMillis } from '../utils/firestoreTime';
import {
    hexagramContentKey, hexagramLineContentKey, type Hexagram,
} from '../../shared/constants/hexagrams';
import type { HistoryHexagramItem } from '../../shared/schemas/api/fortuneHistory.schema';
import type {
    DailyHexagramResponse, HexagramCastItem, HexagramCastResponse, HexagramFace,
} from '../../shared/schemas/api/hexagram.schema';
import {
    hexagramDrawDocSchema, type HexagramDrawDoc,
} from '../../shared/schemas/firestore/hexagramDraw.schema';
import { FORTUNE_HISTORY_HEXAGRAM_READ_LIMIT } from '../../shared/constants/fortuneHistory';
import {
    AuthError, NotFoundError,
} from '../../shared/types/errors';
import {
    HEXAGRAM_DRAW_VERSION, HEXAGRAM_EXTRA_CAST_COST, hexagramOf, readingPlan, toHexagramLines,
    type HexagramLines,
} from '../../shared/utils/hexagram';
import { castHexagram } from '../../shared/utils/hexagramCast';
import {
    addMonths, taipeiDateKey,
} from '../../shared/utils/time';

/** How long a cast is kept before the expiry job removes it (RULE-014). */
export const HEXAGRAM_RETENTION_MONTHS = 3;

type HexagramServiceOptions = {
    repository?: HexagramRepository;
    content?: FixedContentService;
    points?: PointService;
    clock?: () => number;
};

export type HexagramCastRequest = {
    /** Idempotency key of the member's action: the same key answers with the cast it already made */
    requestId?: string;
    /** The member agreed to pay for this cast */
    confirmCharge?: boolean;
};

const faceOf = (hexagram: Hexagram): HexagramFace => ({
    order: hexagram.order,
    name: hexagram.name,
    upper: hexagram.upper,
    lower: hexagram.lower,
    judgment: hexagram.judgment,
    tuan: hexagram.tuan,
    image: hexagram.image,
});

/** What a cast costs: nothing for the first of the day, a point for each one after it. */
const costOfNext = (casts: number): 0 | 1 => (casts === 0 ? 0 : HEXAGRAM_EXTRA_CAST_COST);

export class HexagramService extends BaseService {
    protected serviceName = 'hexagram';

    private readonly repository: HexagramRepository;

    private readonly content: FixedContentService;

    private readonly points: PointService;

    private readonly clock: () => number;

    constructor(options: HexagramServiceOptions = {}) {
        super();
        this.clock = options.clock ?? Date.now;
        this.repository = options.repository ?? new HexagramRepository();
        this.content = options.content ?? new FixedContentService();
        this.points = options.points ?? new PointService({ clock: this.clock });
    }

    /** Today's casts of a member, in the order they were cast. Never writes. */
    async getToday(uid: string): Promise<DailyHexagramResponse> {
        const date = taipeiDateKey(new Date(this.clock()));
        const docs = this.parseDay((await this.repository.day(uid, date).get()).docs.map((doc) => doc.data()));

        if (docs.length === 0) {
            return {
                date, drawn: false, nextCost: 0,
            };
        }

        return {
            date,
            drawn: true,
            casts: await Promise.all(docs.map((doc) => this.itemOf(doc.seq, doc.paid, toHexagramLines(doc.lines)))),
            nextCost: costOfNext(docs.length),
        };
    }

    /**
     * Cast for a member. The first cast of a Taipei day is free; every one after it costs a point and is made only when
     * the request confirms the price. Everything happens in one transaction: today's casts are read, the number of this
     * cast is taken, the point is spent and the record is written, or none of it is. The written readings are read first
     * in the same transaction: a hexagram without published readings is a 404 that costs nothing.
     *
     * - A request whose `requestId` already made a cast today answers with that cast and costs nothing more.
     * - A request that does not confirm the price, on a day that already has a cast, answers with the latest cast: it
     *   cannot be charged, so a retry, a second tab or a request from before the first cast never pays.
     */
    async draw(uid: string, request: HexagramCastRequest = {}): Promise<HexagramCastResponse> {
        const now = this.clock();
        const date = taipeiDateKey(new Date(now));
        const result = await this.repository.runTransaction(async (tx) => {
            const docs = this.parseDay((await tx.get(this.repository.day(uid, date))).docs.map((doc) => doc.data()));
            const same = request.requestId ? docs.find((doc) => doc.requestId === request.requestId) : undefined;
            const latest = docs[docs.length - 1];

            if (same) return {
                doc: same, created: false, casts: docs.length,
            };

            if (latest && request.confirmCharge !== true) return {
                doc: latest, created: false, casts: docs.length,
            };

            const seq = latest ? latest.seq + 1 : 0;
            const ref = this.repository.ref(uid, date, seq);

            // Read the place of the new cast too, so that another request taking the same number makes this one retry
            if ((await tx.get(ref)).exists) throw new Error(`The cast ${date}_${seq} of ${uid} already exists`);

            const lines = castHexagram(uid, date, seq);

            // Fails with a 404 before anything is spent when a reading is missing
            await this.itemOf(seq, seq > 0, lines);

            const transactionId = `hexagram:${uid}:${date}:${seq}`;
            const plan = seq > 0
                ? await this.points.planDeduction(tx, {
                    uid,
                    amount: HEXAGRAM_EXTRA_CAST_COST,
                    reason: 'HEXAGRAM_CAST',
                    transactionId,
                    reference: `${date}_${seq}`,
                })
                : null;
            const doc: HexagramDrawDoc = {
                date,
                seq,
                lines: [...lines],
                drawnAt: now,
                expiresAt: addMonths(now, HEXAGRAM_RETENTION_MONTHS),
                drawVersion: HEXAGRAM_DRAW_VERSION,
                paid: seq > 0,
                pointTransactionId: seq > 0 ? transactionId : null,
                requestId: request.requestId ?? null,
            };

            plan?.apply();
            this.write(tx, ref, doc);

            return {
                doc, created: true, casts: docs.length + 1,
            };
        });

        if (result.created) {
            this.logInfo('hexagram cast', {
                action: 'draw', userId: uid, data: {
                    seq: result.doc.seq, paid: result.doc.paid,
                },
            });
        }

        return {
            date,
            cast: await this.itemOf(result.doc.seq, result.doc.paid, toHexagramLines(result.doc.lines)),
            nextCost: costOfNext(result.casts),
        };
    }

    /**
     * The Taipei dates from `from` to `to` that have a kept cast, newest first. Reads only the document ids, at most
     * {@link FORTUNE_HISTORY_HEXAGRAM_READ_LIMIT} of them: `truncated` says the window held more, so the oldest are
     * missing. Never writes.
     */
    async recordedDates(uid: string, from: string, to: string): Promise<{ dates: string[]; truncated: boolean }> {
        const snap = await this.repository.range(uid, from, to, FORTUNE_HISTORY_HEXAGRAM_READ_LIMIT).select().get();
        const truncated = snap.docs.length >= FORTUNE_HISTORY_HEXAGRAM_READ_LIMIT;

        if (truncated) {
            this.logWarn('hexagram history reached the read limit', {
                action: 'recordedDates', userId: uid, data: { limit: FORTUNE_HISTORY_HEXAGRAM_READ_LIMIT },
            });
        }

        return {
            dates: [...new Set(snap.docs.map((doc) => doc.id.slice(0, 10)))].sort().reverse(),
            truncated,
        };
    }

    /**
     * The kept casts of the Taipei dates `from` to `to`, newest date first and, within a date, in the order they were
     * cast, each with its readings (null where one is no longer published). Never writes.
     */
    async listRange(uid: string, from: string, to: string): Promise<{ date: string; item: HistoryHexagramItem }[]> {
        const snap = await this.repository.range(uid, from, to, FORTUNE_HISTORY_HEXAGRAM_READ_LIMIT).get();
        const docs = snap.docs
            .map((doc) => this.parseDoc(doc.data()))
            .sort((a, b) => b.date.localeCompare(a.date) || a.seq - b.seq);

        return Promise.all(docs.map(async (doc) => ({
            date: doc.date,
            item: await this.historyItemOf(uid, doc),
        })));
    }

    /** A visitor keeps no casts: asking only tells the date. */
    getTodayForGuest(): DailyHexagramResponse {
        return {
            date: taipeiDateKey(new Date(this.clock())), drawn: false, nextCost: 0,
        };
    }

    /**
     * A visitor's free cast: decided by the session and the date, and not stored, so the same session gets the same
     * hexagram for the rest of the Taipei day. A visitor cannot pay: asking for a paid cast is a 401.
     */
    async drawForGuest(sessionId: string, request: HexagramCastRequest = {}): Promise<HexagramCastResponse> {
        if (request.confirmCharge === true) throw new AuthError('Sign in to cast again');

        const date = taipeiDateKey(new Date(this.clock()));

        return {
            date,
            cast: await this.itemOf(0, false, castHexagram(guestDrawSubject(sessionId), date, 0)),
            nextCost: null,
        };
    }

    /** The cast as the page shows it. Throws a NotFoundError when a reading it needs is not published. */
    private async itemOf(seq: number, paid: boolean, lines: HexagramLines): Promise<HexagramCastItem> {
        const cast = hexagramOf(lines);
        const { mode } = readingPlan(lines);
        const [
            content,
            changed,
            movingLine,
        ] = await Promise.all([
            this.content.getPublished('HEXAGRAM', hexagramContentKey(cast.primary.order)),
            cast.changed
                ? this.content.getPublished('HEXAGRAM', hexagramContentKey(cast.changed.order))
                : Promise.resolve(null),
            mode === 'single' ? this.movingLineOf(cast.primary, cast.moving[0] ?? 0) : Promise.resolve(null),
        ]);

        return {
            seq,
            paid,
            lines: [...lines],
            mode,
            moving: [...cast.moving],
            primary: faceOf(cast.primary),
            content,
            changed: cast.changed && changed
                ? {
                    face: faceOf(cast.changed), content: changed,
                }
                : null,
            movingLine,
        };
    }

    /** A kept cast as the history shows it: when a reading is gone the cast stays, with its readings null and a warning. */
    private async historyItemOf(uid: string, doc: HexagramDrawDoc): Promise<HistoryHexagramItem> {
        const lines = toHexagramLines(doc.lines);

        try {
            return await this.itemOf(doc.seq, doc.paid, lines);
        } catch (error) {
            if (!(error instanceof NotFoundError)) throw error;

            this.logWarn('hexagram content missing for a kept cast', {
                action: 'listRange', userId: uid, data: {
                    date: doc.date, seq: doc.seq,
                },
            });

            const cast = hexagramOf(lines);
            const { mode } = readingPlan(lines);
            const position = cast.moving[0] ?? 0;
            const statement = cast.primary.lines[position - 1];

            return {
                seq: doc.seq,
                paid: doc.paid,
                lines: [...lines],
                mode,
                moving: [...cast.moving],
                primary: faceOf(cast.primary),
                content: null,
                changed: cast.changed
                    ? {
                        face: faceOf(cast.changed), content: null,
                    }
                    : null,
                movingLine: mode === 'single' && statement !== undefined
                    ? {
                        position, statement, content: null,
                    }
                    : null,
            };
        }
    }

    private async movingLineOf(primary: Hexagram, position: number): Promise<HexagramCastItem['movingLine']> {
        const statement = primary.lines[position - 1];

        if (statement === undefined) throw new RangeError(`Hexagram ${primary.order} has no line ${position}`);

        return {
            position,
            statement,
            content: await this.content.getPublished('HEXAGRAM', hexagramLineContentKey(primary.order, position)),
        };
    }

    /** The stored casts of a day, checked (they are untrusted input) and in the order they were cast. */
    private parseDay(raws: Record<string, unknown>[]): HexagramDrawDoc[] {
        return raws
            .map((raw) => this.parseDoc(raw))
            .sort((a, b) => a.seq - b.seq);
    }

    private parseDoc(raw: Record<string, unknown>): HexagramDrawDoc {
        return hexagramDrawDocSchema.parse({
            ...raw,
            drawnAt: toMillis(raw.drawnAt),
            expiresAt: toMillis(raw.expiresAt),
        });
    }

    private write(tx: Transaction, ref: ReturnType<HexagramRepository['ref']>, doc: HexagramDrawDoc): void {
        tx.create(ref, doc);
    }
}
