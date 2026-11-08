import { BaseService } from './base.service';
import { PointService } from './point.service';
import { RateLimitService } from './rateLimit.service';
import { ReportSnapshotService } from './reportSnapshot.service';
import { SingleReportService } from './singleReport.service';
import { ReportSnapshotRepository } from '../repositories/reportSnapshot.repository';
import { getAiProvider } from '../ai';
import {
    AiOutputError, type AiReportProvider,
} from '../ai/provider';
import {
    assessAiReport, parseAiAnalysisOutput, specificTerms,
} from '../ai/quality';
import { REPORT_PROMPT_VERSION } from '../ai/reportPrompt';
import { getServerConfig } from '../../config/config';
import { runInBackground } from '../utils/background';
import {
    AI_READING_MAX_CHARS, AI_READINGS_PER_SOURCE, DEFAULT_AI_PRICE_INPUT_PER_MTOK, DEFAULT_AI_PRICE_OUTPUT_PER_MTOK, REPORT_LIMIT_PER_DAY,
    REPORT_LIMIT_PER_HOUR, REPORT_STALE_AFTER_MS, REPORT_TIMEOUT_MS,
} from '../../shared/constants/ai';
import { assembleMultiReport } from '../../shared/report/assembleMultiReport';
import { assembleSingleReport } from '../../shared/report/assembleSingleReport';
import type { MultiReportSystem } from '../../shared/report/systems';
import type {
    AiReportItem, AiReportSummary,
} from '../../shared/schemas/api/aiReport.schema';
import type { AiUsageRecord } from '../../shared/schemas/firestore/aiUsage.schema';
import {
    AI_REPORT_SECTIONS, type AiAnalysisInput, type AiAnalysisOutput, type AiCandidate,
} from '../../shared/schemas/firestore/aiAnalysis.schema';
import {
    aiReportDocSchema, type AiReportDoc, type AiReportSource,
} from '../../shared/schemas/firestore/aiReport.schema';
import type { SnapshotBlock } from '../../shared/schemas/firestore/reportSnapshot.schema';
import { aiReportCost } from '../../shared/utils/multiDimensionPricing';
import { SNAPSHOT_RETENTION_MONTHS } from '../../shared/utils/reportSnapshot';
import {
    addMonths, taipeiDateKey,
} from '../../shared/utils/time';
import {
    ConflictError, InsufficientPointsError, NotFoundError, UnprocessableError, ValidationError, errorMessage,
} from '../../shared/types/errors';

const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;
const MAX_LISTED = 100;

type Pricing = {
    inputPerMtok: number;
    outputPerMtok: number;
};

type AiReportServiceOptions = {
    repository?: ReportSnapshotRepository;
    single?: SingleReportService;
    snapshots?: ReportSnapshotService;
    points?: PointService;
    rateLimit?: RateLimitService;
    getProvider?: () => AiReportProvider;
    /** Runs the generation after the response; replaced in tests so they can wait for it */
    background?: (task: () => Promise<void>, onError: (error: unknown) => void) => Promise<void>;
    pricing?: () => Pricing;
    timeoutMs?: number;
    clock?: () => number;
};

type FailureReason = 'TIMEOUT' | 'AI_ERROR' | 'INVALID_OUTPUT' | 'REFUSED' | 'TRUNCATED' | 'UNPARSEABLE' | 'STALE';

type Made = {
    failed: true;
} | {
    failed: false; blocks: SnapshotBlock[]; modelName: string; promptVersion: string;
};

type Accepted = {
    id: string; status: AiReportDoc['status']; pointsDeducted: number;
};

const chargeTransactionId = (id: string) => `ai_report_${id}`;

/** The sentences of a block of a report, when it has any. */
const textsOf = (blocks: readonly SnapshotBlock[], key: string, kind?: string): string[] => blocks
    .filter((block) => block.key === key || block.key.startsWith(`${key}:`))
    .flatMap((block) => block.segments.filter((segment) => !kind || segment.kind === kind).map((segment) => segment.text));

const withoutVersion = (texts: string[]) => texts.filter((text) => !text.startsWith('規則版本'));

/**
 * What the tradition of a system says of the member's result, for the model: the overview first, then the readings of the
 * facts and of the groups, without the name of the tradition in front, each cut short and no more than a few (a birth chart has dozens).
 */
function readingsOf(blocks: readonly SnapshotBlock[]): string[] {
    const texts = [
        ...textsOf(blocks, 'overview'),
        ...textsOf(blocks, 'facts', 'SYSTEM_INTERPRETATION'),
        ...textsOf(blocks, 'readings'),
    ];

    return texts.slice(0, AI_READINGS_PER_SOURCE).map((text) => {
        const plain = text.replace(/^【.+?】/, '');

        return [...plain].length > AI_READING_MAX_CHARS ? `${[...plain].slice(0, AI_READING_MAX_CHARS).join('')}…` : plain;
    });
}

const aiSegment = (text: string, sources: SnapshotBlock['segments'][number]['sources']): SnapshotBlock['segments'][number] => ({
    text, kind: 'AI_INFERENCE', sources, timeSensitive: false, asOf: null,
});

/**
 * What one report says in a line, to lay it out for the member: the first thing its tradition says of the result, else the
 * first thing its rules conclude, else its first fact. Taken from the report as it is, never written by the AI.
 */
function summaryOf(content: ReturnType<typeof assembleSingleReport>): SnapshotBlock['segments'][number] | undefined {
    const firstOf = (key: string, kind?: string) => content.blocks.find((block) => block.key === key)?.segments.find((segment) => !kind || segment.kind === kind);

    return firstOf('overview') ?? firstOf('summary') ?? firstOf('facts', 'SYSTEM_INTERPRETATION') ?? firstOf('facts', 'FACT');
}

/**
 * What the member brought, laid out first: one block for each report, with its title (where the member stands in it) and
 * its summary, exactly as that report gave them and never written by the AI. The whole report is not repeated.
 */
function factBlocks(contents: ReadonlyArray<ReturnType<typeof assembleSingleReport>>): SnapshotBlock[] {
    return contents.flatMap((content) => {
        const summary = summaryOf(content);
        const [system] = content.systems;

        return system && summary ? [
            {
                key: `facts:${system}`, title: content.position, segments: [summary],
            },
        ] : [];
    });
}

/**
 * The sections of the AI's answer as blocks, every sentence marked as the AI's inference and citing the insights (or else
 * the systems) it rests on. The first sentence of a block is the lead of the part, the ones after it are its points; a point
 * that says which of the systems it rests on cites those (that were brought) and the insights of its part.
 */
function aiBlocks(output: AiAnalysisOutput, systems: ReadonlyArray<AiReportSource['system']>): SnapshotBlock[] {
    const titles = new Map<string, string>(AI_REPORT_SECTIONS.map((section) => [section.key, section.title]));

    return output.sections.map((section) => {
        const cited = section.candidateIds.map((rule) => ({ rule }));
        const sources = cited.length > 0 ? cited : systems.map((system) => ({ system }));

        return {
            key: `ai:${section.key}`,
            title: titles.get(section.key) ?? section.key,
            segments: [
                aiSegment(section.content, sources), ...section.points.map((point) => {
                    const basis = systems.filter((system) => point.systems.includes(system)).map((system) => ({ system }));

                    return aiSegment(point.text, basis.length > 0 ? [...basis, ...cited] : sources);
                }),
            ],
        };
    });
}

/**
 * The AI report: the one kind there is, made from one or more of the member's single-dimension reports (which it
 * names in `sources`) and, when they wrote one, a question. It costs 1 point for one system and what the systems add up
 * to for several, is made after the response, and is given its points back when it fails. The Idempotency-Key is its id,
 * so the same key never charges or generates twice. The report lays the member's facts out first (as the reports gave them),
 * then a mentor, who reads them as psychology, fate-reading and mystic traditions at once, picks out what stands out, weighs
 * the good and the bad, looks across past, present and future, answers the question and concludes. What the model sees is only
 * those facts and facets, the question and today's date; with several systems the rules first find the insights across them.
 */
export class AiReportService extends BaseService {
    protected serviceName = 'ai-report';

    private readonly repository: ReportSnapshotRepository;
    private readonly single: SingleReportService;
    private readonly snapshots: ReportSnapshotService;
    private readonly points: PointService;
    private readonly rateLimit: RateLimitService;
    private readonly getProvider: () => AiReportProvider;
    private readonly background: NonNullable<AiReportServiceOptions['background']>;
    private readonly pricing: () => Pricing;
    private readonly timeoutMs: number;
    private readonly clock: () => number;

    constructor(options: AiReportServiceOptions = {}) {
        super();
        this.clock = options.clock ?? Date.now;
        this.repository = options.repository ?? new ReportSnapshotRepository();
        this.single = options.single ?? new SingleReportService({ clock: this.clock });
        this.snapshots = options.snapshots ?? new ReportSnapshotService({ clock: this.clock });
        this.points = options.points ?? new PointService({ clock: this.clock });
        this.rateLimit = options.rateLimit ?? new RateLimitService({ clock: this.clock });
        this.getProvider = options.getProvider ?? getAiProvider;
        this.background = options.background ?? runInBackground;
        this.pricing = options.pricing ?? (() => {
            const config = getServerConfig();

            return {
                inputPerMtok: config.aiPriceInputPerMtok ?? DEFAULT_AI_PRICE_INPUT_PER_MTOK,
                outputPerMtok: config.aiPriceOutputPerMtok ?? DEFAULT_AI_PRICE_OUTPUT_PER_MTOK,
            };
        });
        this.timeoutMs = options.timeoutMs ?? REPORT_TIMEOUT_MS;
    }

    /**
     * Charge the price of the systems and start the report. Asking again with the same key only says where the first
     * request got to. Everything the report needs is checked before any point is taken, so nothing is paid for nothing.
     */
    async create(uid: string, systems: readonly MultiReportSystem[], jobId: string, question?: string): Promise<Accepted> {
        const cost = aiReportCost(systems);

        if (cost === null || new Set(systems).size !== systems.length) {
            throw new ValidationError('This choice of systems is not offered');
        }

        const ref = this.repository.aiReportRef(uid, jobId);
        const before = await ref.get();

        if (before.exists) {
            return {
                id: jobId, status: aiReportDocSchema.parse(before.data()).status, pointsDeducted: 0,
            };
        }

        const inputs = await this.single.memberInputs(uid, systems);
        const contents = inputs.map((input) => assembleSingleReport(input));
        const candidates = systems.length === 1 ? [] : this.candidatesOf(assembleMultiReport(inputs, await this.single.todayInputs(uid)));

        // The AI only rewrites what the rules found across several systems; with nothing found there is nothing to pay for
        if (systems.length > 1 && candidates.length === 0) {
            throw new UnprocessableError('No insight was found across these systems', 'NO_INSIGHTS');
        }

        const { availableBalance } = await this.points.getBalance(uid);

        if (availableBalance < cost) {
            throw new InsufficientPointsError('Not enough points', {
                required: cost, available: availableBalance,
            });
        }

        await this.rateLimit.consume(`ai_report_hour_${uid}`, REPORT_LIMIT_PER_HOUR, HOUR_MS);
        await this.rateLimit.consume(`ai_report_day_${uid}`, REPORT_LIMIT_PER_DAY, DAY_MS);

        const sources: AiReportSource[] = [];

        for (const content of contents) {
            const { id } = await this.snapshots.saveOrReuse(uid, content);

            sources.push({
                system: content.systems[0] as AiReportSource['system'], snapshotId: id, position: content.position,
            });
        }

        const now = this.clock();
        const request: AiAnalysisInput = {
            today: taipeiDateKey(new Date(now)),
            sources: contents.map((content) => ({
                system: content.systems[0] as AiReportSource['system'],
                position: content.position,
                facts: [...textsOf(content.blocks, 'facts', 'FACT'), ...textsOf(content.blocks, 'time', 'FACT')],
                facets: textsOf(content.blocks, 'summary'),
                readings: readingsOf(content.blocks),
                interactions: textsOf(content.blocks, 'synthesis'),
                practices: textsOf(content.blocks, 'advice'),
                notes: withoutVersion(textsOf(content.blocks, 'limits')),
            })),
            candidates,
            ...(question ? { question } : {}),
        };
        const started = await this.repository.runTransaction(async (tx) => {
            const snap = await tx.get(ref);

            // Lost a race with the same key: its winner is generating
            if (snap.exists) return false;

            const plan = await this.points.planDeduction(tx, {
                uid,
                amount: cost,
                reason: systems.length === 1 ? 'SINGLE_AI_ANALYSIS' : 'MULTI_REPORT',
                transactionId: chargeTransactionId(jobId),
                reference: jobId,
            });

            plan.apply();
            tx.set(ref, {
                sources,
                question: question ?? null,
                status: 'GENERATING',
                failureReason: null,
                // The facts are laid out at once; the AI's parts are added to them when it is done
                blocks: factBlocks(contents),
                cost,
                modelName: null,
                promptVersion: null,
                createdAt: now,
                expiresAt: addMonths(now, SNAPSHOT_RETENTION_MONTHS),
            } satisfies AiReportDoc);

            return true;
        });

        if (!started) {
            return {
                id: jobId, status: aiReportDocSchema.parse((await ref.get()).data()).status, pointsDeducted: 0,
            };
        }

        this.logInfo('ai report accepted', {
            action: 'create', userId: uid, data: {
                id: jobId, systems: systems.length, cost,
            },
        });

        void this.background(
            () => this.generate(uid, jobId, request),
            (error) => this.logError('background ai report crashed', {
                action: 'generate', userId: uid, data: { id: jobId }, error,
            }),
        );

        return {
            id: jobId, status: 'GENERATING', pointsDeducted: cost,
        };
    }

    /** The member's AI reports that have not expired, newest first, as the cards of the list need them. One whose worker vanished is failed (and refunded) here, where the member would see it hang. */
    async list(uid: string): Promise<AiReportSummary[]> {
        const read = async () => {
            const snap = await this.repository.aiReportsRef(uid).orderBy('createdAt', 'desc').limit(MAX_LISTED).get();

            return snap.docs.map((doc) => ({
                id: doc.id, doc: aiReportDocSchema.parse(doc.data()),
            }));
        };
        const now = this.clock();
        let rows = await read();
        const stale = rows.filter(({ doc }) => this.isStale(doc));

        if (stale.length > 0) {
            await Promise.all(stale.map(({ id }) => this.fail(uid, id, 'STALE')));
            rows = await read();
        }

        return rows
            .filter(({ doc }) => doc.expiresAt > now)
            .map(({
                id, doc: {
                    blocks: _blocks, modelName: _modelName, promptVersion: _promptVersion, ...rest
                },
            }) => ({
                id, ...rest,
            }));
    }

    /** One report of the member to read, or not found: someone else's id, a missing one and an expired one look the same. */
    async get(uid: string, id: string): Promise<AiReportItem> {
        const ref = this.repository.aiReportRef(uid, id);
        const read = async () => {
            const snap = await ref.get();

            if (!snap.exists) throw new NotFoundError('AI report');

            return aiReportDocSchema.parse(snap.data());
        };
        let doc = await read();

        if (this.isStale(doc)) {
            await this.fail(uid, id, 'STALE');
            doc = await read();
        }

        if (doc.expiresAt <= this.clock()) throw new NotFoundError('AI report');

        return {
            id, ...doc,
        };
    }

    /** The member deletes one of their reports. One still being made is refused: the worker would give the points back or finish it. */
    async delete(uid: string, id: string): Promise<void> {
        const ref = this.repository.aiReportRef(uid, id);

        await this.repository.runTransaction(async (tx) => {
            const snap = await tx.get(ref);

            if (!snap.exists) throw new NotFoundError('AI report');

            if (aiReportDocSchema.parse(snap.data()).status === 'GENERATING') {
                throw new ConflictError('The report is still being made', undefined, 'REPORT_GENERATING');
            }

            tx.delete(ref);
        });

        this.logInfo('ai report deleted', {
            action: 'delete', userId: uid, data: { id },
        });
    }

    private isStale(doc: AiReportDoc): boolean {
        return doc.status === 'GENERATING' && this.clock() - doc.createdAt >= REPORT_STALE_AFTER_MS;
    }

    /** The insights the rules found across the systems, each under the id of its rule, as the model gets them. */
    private candidatesOf(content: ReturnType<typeof assembleMultiReport>): AiCandidate[] {
        const insights = content.blocks.find((item) => item.key === 'insights')?.segments ?? [];

        return insights.flatMap((item) => {
            const id = item.sources.find((source) => source.rule)?.rule;

            return id && item.confirmQuestion ? [
                {
                    id,
                    text: item.text,
                    hypothesis: item.confirmQuestion,
                    sources: item.sources.flatMap((source) => (source.term ? [source.term] : [])),
                },
            ] : [];
        });
    }

    /** The background job: ask the model, check the answer, then complete or fail-and-refund. Never throws. */
    private async generate(uid: string, id: string, request: AiAnalysisInput): Promise<void> {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), this.timeoutMs);

        try {
            const made = await this.make(request, controller.signal, uid, id);

            if (made.failed) {
                await this.fail(uid, id, 'INVALID_OUTPUT');

                return;
            }

            await this.complete(uid, id, made);
        } catch (error) {
            await this.fail(uid, id, this.reasonFor(error, controller.signal), error);
        } finally {
            clearTimeout(timer);
        }
    }

    private reasonFor(error: unknown, signal: AbortSignal): FailureReason {
        if (signal.aborted) return 'TIMEOUT';
        if (error instanceof AiOutputError) return error.reason;

        return 'AI_ERROR';
    }

    /** Ask the mentor, check the answer, and turn its sections into blocks. */
    private async make(input: AiAnalysisInput, signal: AbortSignal, uid: string, id: string): Promise<Made> {
        const generation = await this.getProvider().generate(input, { signal });

        await this.recordUsage(uid, id, generation.modelName, generation.usage);

        const output = parseAiAnalysisOutput(generation.output);
        const quality = output
            ? assessAiReport(output, {
                hasQuestion: input.question !== undefined,
                candidateIds: input.candidates.map((candidate) => candidate.id),
                systems: input.sources.map((source) => source.system),
                terms: specificTerms(input),
            })
            : null;

        if (quality && quality.warnings.length > 0) this.logQualityWarnings(uid, id, quality.warnings.map((finding) => finding.code));

        if (!output || !quality || quality.fatal.length > 0) {
            this.logRejected(uid, id, quality?.fatal.map((finding) => finding.code) ?? ['SCHEMA']);

            return { failed: true };
        }

        return {
            failed: false,
            blocks: aiBlocks(output, input.sources.map((source) => source.system)),
            modelName: generation.modelName,
            promptVersion: REPORT_PROMPT_VERSION,
        };
    }

    /** Not a failure: what the checks only count, so that the quality of the reports can be watched. */
    private logQualityWarnings(uid: string, id: string, codes: string[]): void {
        this.logWarn('ai report passed with quality warnings', {
            action: 'generate', userId: uid, data: {
                id, codes,
            },
        });
    }

    private logRejected(uid: string, id: string, codes: string[]): void {
        this.logWarn('ai report rejected by quality checks', {
            action: 'generate', userId: uid, data: {
                id, codes,
            },
        });
    }

    private async complete(uid: string, id: string, made: Extract<Made, { failed: false }>): Promise<void> {
        const ref = this.repository.aiReportRef(uid, id);

        await this.repository.runTransaction(async (tx) => {
            const snap = await tx.get(ref);

            if (!snap.exists) return;

            const doc = aiReportDocSchema.parse(snap.data());

            // It may have been failed meanwhile (stale reaper) or deleted; never overwrite that
            if (doc.status !== 'GENERATING') return;

            tx.update(ref, {
                status: 'COMPLETED', blocks: [...doc.blocks, ...made.blocks], modelName: made.modelName, promptVersion: made.promptVersion,
            });
        });
    }

    /** Mark the report failed and give the points back, in one transaction so the refund happens exactly once. */
    private async fail(uid: string, id: string, reason: FailureReason, error?: unknown): Promise<void> {
        const ref = this.repository.aiReportRef(uid, id);

        await this.repository.runTransaction(async (tx) => {
            const snap = await tx.get(ref);

            if (!snap.exists) return;

            if (aiReportDocSchema.parse(snap.data()).status !== 'GENERATING') return;

            const refund = await this.points.planRefund(tx, {
                uid,
                deductTransactionId: chargeTransactionId(id),
                refundTransactionId: `refund_ai_report_${id}`,
                reference: id,
            });

            refund?.apply();
            tx.update(ref, {
                status: 'FAILED', failureReason: reason,
            });
        });

        this.logWarn('ai report failed and refunded', {
            action: 'fail',
            userId: uid,
            data: {
                id, reason, detail: error ? errorMessage(error).slice(0, 200) : undefined,
            },
        });
    }

    private async recordUsage(uid: string, id: string, modelName: string, usage: {
        inputTokens: number; outputTokens: number;
    }): Promise<void> {
        const price = this.pricing();
        const record: AiUsageRecord = {
            userId: uid,
            reportId: id,
            modelName,
            inputTokens: usage.inputTokens,
            outputTokens: usage.outputTokens,
            estimatedCost: (usage.inputTokens / 1_000_000) * price.inputPerMtok + (usage.outputTokens / 1_000_000) * price.outputPerMtok,
            createdAt: this.clock(),
        };

        await this.repository.usageRef().set(record);
    }
}
