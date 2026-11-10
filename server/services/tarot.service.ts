import { BaseService } from './base.service';
import {
    DailyDrawEngine, guestDrawSubject, type DailyDrawRecord,
} from './dailyDraw.engine';
import { FixedContentService } from './fixedContent.service';
import { TarotRepository } from '../repositories/tarot.repository';
import {
    toMillis, toOptionalMillis,
} from '../utils/firestoreTime';
import {
    TAROT_CARDS, TAROT_RETENTION_MONTHS, tarotContentKey,
} from '../../shared/constants/tarot';
import type { HistoryTarotItem } from '../../shared/schemas/api/fortuneHistory.schema';
import type {
    DailyTarotResponse, TarotCardResponse,
} from '../../shared/schemas/api/tarot.schema';
import type { FixedResultResponse } from '../../shared/schemas/api/fixedResult.schema';
import { tarotDrawDocSchema } from '../../shared/schemas/firestore/tarot.schema';
import {
    TAROT_DRAW_VERSION, drawDailyCard,
} from '../../shared/utils/tarot';

type TarotServiceOptions = {
    repository?: TarotRepository;
    content?: FixedContentService;
    clock?: () => number;
};

export class TarotService extends BaseService {
    protected serviceName = 'tarot';

    private readonly engine: DailyDrawEngine;

    constructor(options: TarotServiceOptions = {}) {
        super();
        this.engine = new DailyDrawEngine(
            {
                contentType: 'TAROT',
                drawVersion: TAROT_DRAW_VERSION,
                retentionMonths: TAROT_RETENTION_MONTHS,
                pick: (uid, dateKey) => {
                    const {
                        cardIndex, orientation, 
                    } = drawDailyCard(uid, dateKey);

                    return {
                        symbolIndex: cardIndex, orientation,
                    };
                },
                contentKey: tarotContentKey,
                // The stored document keeps the field names it has always had
                toDocument: (record) => ({
                    cardIndex: record.symbolIndex,
                    orientation: record.orientation,
                    drawnAt: record.drawnAt,
                    expiresAt: record.expiresAt,
                    drawVersion: record.drawVersion,
                }),
                fromDocument: (raw) => {
                    const doc = tarotDrawDocSchema.parse({
                        ...raw,
                        drawnAt: toMillis(raw.drawnAt),
                        expiresAt: toOptionalMillis(raw.expiresAt),
                    });

                    return {
                        symbolIndex: doc.cardIndex,
                        orientation: doc.orientation,
                        drawnAt: doc.drawnAt,
                        expiresAt: doc.expiresAt,
                        drawVersion: doc.drawVersion,
                    };
                },
            },
            options.repository ?? new TarotRepository(),
            options.content ?? new FixedContentService(),
            options.clock ?? Date.now,
        );
    }

    /** Today's draw if there is one. Never writes. */
    async getToday(uid: string): Promise<DailyTarotResponse> {
        const today = await this.engine.getToday(uid);

        if (!today) {
            return {
                date: this.engine.today(), drawn: false,
            };
        }

        return this.toResponse(today.date, today.record, today.content);
    }

    /** Draw today's card; the first call of a Taipei day creates the record and any later one returns it. */
    async draw(uid: string): Promise<DailyTarotResponse> {
        const result = await this.engine.draw(uid);

        if (result.created) {
            this.logInfo('tarot drawn', {
                action: 'draw',
                userId: uid,
            });
        }

        return this.toResponse(result.date, result.record, result.content);
    }

    /** The Taipei dates from `from` to `to` that have a kept draw, newest first. Reads only ids. Never writes. */
    recordedDates(uid: string, from: string, to: string): Promise<string[]> {
        return this.engine.recordedDates(uid, from, to);
    }

    /** The kept draws of the Taipei dates `from` to `to`, newest first, with their content. Never writes. */
    async listRange(uid: string, from: string, to: string): Promise<{ date: string; item: HistoryTarotItem }[]> {
        const listed = await this.engine.listRange(uid, from, to);

        return listed.map(({
            date, record, content,
        }) => {
            if (!content) {
                this.logWarn('tarot content missing for a kept draw', {
                    action: 'listRange', userId: uid, data: { date },
                });
            }

            return {
                date, item: {
                    card: this.cardOf(record), content,
                },
            };
        });
    }

    /** A visitor never has a kept draw: asking only tells the date. */
    getTodayForGuest(): DailyTarotResponse {
        return {
            date: this.engine.today(), drawn: false,
        };
    }

    /** A visitor's draw: decided by the session and the date, and not stored. */
    async drawForGuest(sessionId: string): Promise<DailyTarotResponse> {
        const result = await this.engine.drawEphemeral(guestDrawSubject(sessionId));

        return this.toResponse(result.date, result.record, result.content);
    }

    private toResponse(date: string, record: DailyDrawRecord, content: FixedResultResponse): DailyTarotResponse {
        return {
            date,
            drawn: true,
            card: this.cardOf(record),
            content,
        };
    }

    private cardOf(record: DailyDrawRecord): TarotCardResponse {
        const card = TAROT_CARDS[record.symbolIndex];

        if (!card) throw new RangeError(`Unknown tarot card index ${record.symbolIndex}`);

        return {
            index: card.index,
            roman: card.roman,
            name: card.name,
            englishName: card.englishName,
            orientation: record.orientation,
            illustration: card.illustration,
        };
    }
}
