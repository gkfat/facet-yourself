import { BaseService } from './base.service';
import {
    DailyDrawEngine, guestDrawSubject, type DailyDrawRecord,
} from './dailyDraw.engine';
import { FixedContentService } from './fixedContent.service';
import { RuneRepository } from '../repositories/rune.repository';
import {
    toMillis, toOptionalMillis,
} from '../utils/firestoreTime';
import {
    RUNES, RUNE_RETENTION_MONTHS, runeContentKey,
} from '../../shared/constants/runes';
import type { HistoryRuneItem } from '../../shared/schemas/api/fortuneHistory.schema';
import type {
    DailyRuneResponse, RuneResponse,
} from '../../shared/schemas/api/rune.schema';
import type { FixedResultResponse } from '../../shared/schemas/api/fixedResult.schema';
import { runeDrawDocSchema } from '../../shared/schemas/firestore/runeDraw.schema';
import {
    RUNE_DRAW_VERSION, drawDailyRune,
} from '../../shared/utils/rune';

type RuneServiceOptions = {
    repository?: RuneRepository;
    content?: FixedContentService;
    clock?: () => number;
};

export class RuneService extends BaseService {
    protected serviceName = 'rune';

    private readonly engine: DailyDrawEngine;

    constructor(options: RuneServiceOptions = {}) {
        super();
        this.engine = new DailyDrawEngine(
            {
                contentType: 'RUNE',
                drawVersion: RUNE_DRAW_VERSION,
                retentionMonths: RUNE_RETENTION_MONTHS,
                pick: (uid, dateKey) => {
                    const {
                        runeIndex, orientation, 
                    } = drawDailyRune(uid, dateKey);

                    return {
                        symbolIndex: runeIndex, orientation,
                    };
                },
                contentKey: runeContentKey,
                toDocument: (record) => ({
                    symbolIndex: record.symbolIndex,
                    orientation: record.orientation,
                    drawnAt: record.drawnAt,
                    expiresAt: record.expiresAt,
                    drawVersion: record.drawVersion,
                }),
                // A stored reversed draw of a symmetric rune cannot be valid: the schema refuses it
                fromDocument: (raw) => runeDrawDocSchema.parse({
                    ...raw,
                    drawnAt: toMillis(raw.drawnAt),
                    expiresAt: toOptionalMillis(raw.expiresAt),
                }),
            },
            options.repository ?? new RuneRepository(),
            options.content ?? new FixedContentService(),
            options.clock ?? Date.now,
        );
    }

    /** Today's draw if there is one. Never writes. */
    async getToday(uid: string): Promise<DailyRuneResponse> {
        const today = await this.engine.getToday(uid);

        if (!today) {
            return {
                date: this.engine.today(), drawn: false,
            };
        }

        return this.toResponse(today.date, today.record, today.content);
    }

    /** Draw today's rune; the first call of a Taipei day creates the record and any later one returns it. */
    async draw(uid: string): Promise<DailyRuneResponse> {
        const result = await this.engine.draw(uid);

        if (result.created) {
            this.logInfo('rune drawn', {
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
    async listRange(uid: string, from: string, to: string): Promise<{ date: string; item: HistoryRuneItem }[]> {
        const listed = await this.engine.listRange(uid, from, to);

        return listed.map(({
            date, record, content,
        }) => {
            if (!content) {
                this.logWarn('rune content missing for a kept draw', {
                    action: 'listRange', userId: uid, data: { date },
                });
            }

            return {
                date, item: {
                    rune: this.runeOf(record), content,
                },
            };
        });
    }

    /** A visitor never has a kept draw: asking only tells the date. */
    getTodayForGuest(): DailyRuneResponse {
        return {
            date: this.engine.today(), drawn: false,
        };
    }

    /** A visitor's draw: decided by the session and the date, and not stored. */
    async drawForGuest(sessionId: string): Promise<DailyRuneResponse> {
        const result = await this.engine.drawEphemeral(guestDrawSubject(sessionId));

        return this.toResponse(result.date, result.record, result.content);
    }

    private toResponse(date: string, record: DailyDrawRecord, content: FixedResultResponse): DailyRuneResponse {
        return {
            date,
            drawn: true,
            rune: this.runeOf(record),
            content,
        };
    }

    private runeOf(record: DailyDrawRecord): RuneResponse {
        const rune = RUNES[record.symbolIndex];

        if (!rune) throw new RangeError(`Unknown rune index ${record.symbolIndex}`);

        return {
            index: rune.index,
            name: rune.name,
            glyph: rune.glyph,
            meaning: rune.meaning,
            orientation: record.orientation,
            illustration: rune.illustration,
        };
    }
}
