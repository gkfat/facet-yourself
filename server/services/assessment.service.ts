import { BaseService } from './base.service';
import { FixedContentService } from './fixedContent.service';
import { AssessmentRepository } from '../repositories/assessment.repository';
import {
    ASSESSMENTS, findAssessment, findAssessmentBySystem,
    type AssessmentDefinition,
} from '../../shared/assessments';
import { ASSESSMENT_ENTRY_ENABLED } from '../../shared/assessments/entry';
import {
    findScaleIssues, findSelectionIssues,
} from '../../shared/assessments/scoring';
import type {
    AssessmentResult, AssessmentSubmissionRequest, AssessmentSummary,
} from '../../shared/schemas/api/assessment.schema';
import type { FixedResultResponse } from '../../shared/schemas/api/fixedResult.schema';
import type { AssessmentAttemptDoc } from '../../shared/schemas/firestore/assessmentAttempt.schema';
import { addMonths } from '../../shared/utils/time';
import type { SystemReportInput } from '../../shared/report/types';
import {
    NotFoundError, UnprocessableError, ValidationError, errorMessage,
} from '../../shared/types/errors';

const ATTEMPT_RETENTION_MONTHS = 3;
/** How many of the newest attempts are looked at for the one asked about: a member does not make that many */
const LOOKUP_LIMIT = 100;

type AssessmentServiceOptions = {
    repository?: AssessmentRepository;
    fixedContent?: FixedContentService;
    definitions?: readonly AssessmentDefinition[];
    clock?: () => number;
};

/** Who is submitting: a signed-in member, or nobody known (a guest, whose result is only shown). */
export type AssessmentActor = {
    uid: string | null;
};

/** The result of an assessment as the plain object it is stored and sent as */
function recordOf(result: unknown): Record<string, unknown> {
    if (typeof result !== 'object' || result === null || Array.isArray(result)) {
        throw new TypeError('The result of an assessment must be an object');
    }

    return Object.fromEntries(Object.entries(result));
}

export class AssessmentService extends BaseService {
    protected serviceName = 'assessment';

    private readonly repository: AssessmentRepository;
    private readonly fixedContent: FixedContentService;
    private readonly definitions: readonly AssessmentDefinition[];
    private readonly clock: () => number;

    constructor(options: AssessmentServiceOptions = {}) {
        super();
        this.repository = options.repository ?? new AssessmentRepository();
        this.fixedContent = options.fixedContent ?? new FixedContentService();
        this.definitions = options.definitions ?? ASSESSMENTS;
        this.clock = options.clock ?? Date.now;
    }

    /** The assessments with the entry flag of each and, for a signed-in member, whether they have a result that has not expired. */
    async list(uid: string | null): Promise<AssessmentSummary[]> {
        const now = this.clock();
        const attempts = uid ? await this.repository.listNewest(uid, LOOKUP_LIMIT) : [];

        return this.definitions.map((definition) => {
            const summary: AssessmentSummary = {
                assessmentId: definition.id,
                title: definition.title,
                kind: definition.kind,
                version: definition.version,
                entryEnabled: ASSESSMENT_ENTRY_ENABLED[definition.id],
            };

            if (!uid) return summary;

            const found = attempts.find(({ attempt }) => attempt.assessmentId === definition.id && attempt.expiresAt > now);

            return {
                ...summary, hasResult: found !== undefined, resultExpiresAt: found?.attempt.expiresAt ?? null,
            };
        });
    }

    /**
     * Score the answers on the server (a score from the client is never trusted). A signed-in member's attempt is kept for
     * 3 months; a guest's is only shown. The contents are fetched before anything is saved: a result that cannot be
     * presented is not stored. A failure to store never costs the member the result.
     */
    async submit(assessmentId: string, input: AssessmentSubmissionRequest, actor: AssessmentActor): Promise<AssessmentResult> {
        const definition = this.require(assessmentId);

        if (input.version !== definition.version) {
            throw new NotFoundError('Assessment version');
        }

        const issues = definition.kind === 'scale'
            ? findScaleIssues(input.answers ?? [], definition.items)
            : findSelectionIssues({
                selected: input.selected ?? [], ranked: input.ranked ?? [],
            }, definition.options, definition.pick, definition.rank);

        if (issues.length > 0) {
            throw new ValidationError('Invalid answers', { issues });
        }

        const result = recordOf(definition.kind === 'scale'
            ? definition.evaluate(input.answers ?? [])
            : definition.evaluate({
                selected: input.selected ?? [], ranked: input.ranked ?? [],
            }));
        const content = await this.contentOf(definition, result);
        const now = this.clock();
        const presented: AssessmentResult = {
            assessmentId: definition.id,
            version: definition.version,
            result,
            content,
            completedAt: now,
            persisted: false,
            saveFailed: false,
            expiresAt: null,
        };

        if (!actor.uid) return presented;

        const attempt: AssessmentAttemptDoc = {
            assessmentId: definition.id,
            version: definition.version,
            answers: {
                scaleAnswers: (input.answers ?? []).map((answer) => ({
                    questionId: answer.questionId, value: answer.value,
                })),
                selected: input.selected ?? [],
                ranked: input.ranked ?? [],
            },
            result,
            completedAt: now,
            expiresAt: addMonths(now, ATTEMPT_RETENTION_MONTHS),
        };

        try {
            await this.repository.create(actor.uid, attempt);

            return {
                ...presented, persisted: true, expiresAt: attempt.expiresAt,
            };
        } catch (error) {
            this.logError('failed to save assessment attempt', {
                action: 'submit', userId: actor.uid, error,
            });

            return {
                ...presented, saveFailed: true,
            };
        }
    }

    /** The member's newest result of this assessment that has not expired; not found when there is none. */
    async latest(assessmentId: string, uid: string): Promise<AssessmentResult> {
        const definition = this.require(assessmentId);
        const now = this.clock();
        const attempts = await this.repository.listNewest(uid, LOOKUP_LIMIT);

        for (const { attempt } of attempts) {
            if (attempt.assessmentId !== definition.id || attempt.expiresAt <= now) continue;

            let result: Record<string, unknown>;

            try {
                result = recordOf(definition.parseResult(attempt.result));
            } catch (error) {
                // A result of an older version of the items that no longer fits is skipped, not shown wrongly
                this.logWarn('an assessment attempt no longer fits its schema', {
                    action: 'latest', userId: uid, data: {
                        assessmentId: definition.id, version: attempt.version, reason: errorMessage(error),
                    },
                });
                continue;
            }

            return {
                assessmentId: definition.id,
                version: attempt.version,
                result,
                content: await this.contentOf(definition, result),
                completedAt: attempt.completedAt,
                persisted: true,
                saveFailed: false,
                expiresAt: attempt.expiresAt,
            };
        }

        throw new NotFoundError('Assessment result');
    }

    /** Whether `systemId` is the system of a self-analysis this service defines */
    handles(systemId: string): boolean {
        return findAssessmentBySystem(systemId, this.definitions) !== null;
    }

    /**
     * What the member's newest result of a self-analysis is worth to a multi-dimension report. A result that has expired
     * or was never made stops the report, as a missing birth time does, before anything is paid for.
     */
    async reportInputOf(uid: string, systemId: string): Promise<SystemReportInput> {
        const definition = findAssessmentBySystem(systemId, this.definitions);

        if (!definition) throw new ValidationError(`No self-analysis for ${systemId}`);

        let latest: AssessmentResult;

        try {
            latest = await this.latest(definition.id, uid);
        } catch (error) {
            if (error instanceof NotFoundError) {
                throw new UnprocessableError(`Complete ${definition.title} first`, 'ASSESSMENT_REQUIRED');
            }

            throw error;
        }

        return definition.reportInput(latest.result, Object.fromEntries(latest.content.map((content) => [content.key, content])));
    }

    private require(assessmentId: string): AssessmentDefinition {
        const definition = findAssessment(assessmentId, this.definitions);

        if (!definition) {
            throw new NotFoundError('Assessment');
        }

        return definition;
    }

    /** The published contents a result needs; a content that is not published is not found, and nothing is shown or stored */
    private async contentOf(definition: AssessmentDefinition, result: Record<string, unknown>): Promise<FixedResultResponse[]> {
        const keys = [...new Set(definition.contentKeysOf(result))];

        return Promise.all(keys.map((key) => this.fixedContent.getPublished('ASSESSMENT', key)));
    }
}
