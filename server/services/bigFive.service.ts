import { BaseService } from './base.service';
import { FixedContentService } from './fixedContent.service';
import { GuestSessionService } from './guestSession.service';
import { BigFiveRepository } from '../repositories/bigFive.repository';
import { UserRepository } from '../repositories/user.repository';
import {
    BIG_FIVE_TRAITS,
    BIG_FIVE_TRAIT_INFO,
    BIG_FIVE_VERSION,
} from '../../shared/constants/bigFive';
import type {
    BigFiveResult, BigFiveSubmissionRequest,
} from '../../shared/schemas/api/bigFive.schema';
import type { MbtiType } from '../../shared/schemas/common';
import type { BigFiveAttemptDoc } from '../../shared/schemas/firestore/bigFive.schema';
import { bigFiveCombinations } from '../../shared/utils/bigFiveCombinations';
import { compareWithMbti } from '../../shared/utils/bigFiveMbtiComparison';
import {
    bigFiveLevel, bigFiveLevels, findBigFiveAnswerIssues, scoreBigFive, type BigFiveScores,
} from '../../shared/utils/bigFiveScoring';
import { addMonths } from '../../shared/utils/time';
import {
    NotFoundError, ValidationError,
} from '../../shared/types/errors';

const ATTEMPT_RETENTION_MONTHS = 3;
/** How many of the newest attempts are looked at for one that has not expired yet */
const LATEST_LOOKUP_LIMIT = 5;

type BigFiveServiceOptions = {
    repository?: BigFiveRepository;
    users?: UserRepository;
    fixedContent?: FixedContentService;
    guestSessions?: GuestSessionService;
    clock?: () => number;
};

/** Who is submitting: a signed-in member, a guest with a session, or neither. */
export type BigFiveActor = {
    uid: string | null;
    guestSessionId: string | null;
};

export class BigFiveService extends BaseService {
    protected serviceName = 'big-five';

    private readonly repository: BigFiveRepository;
    private readonly users: UserRepository;
    private readonly fixedContent: FixedContentService;
    private readonly guestSessions: GuestSessionService;
    private readonly clock: () => number;

    constructor(options: BigFiveServiceOptions = {}) {
        super();
        this.repository = options.repository ?? new BigFiveRepository();
        this.users = options.users ?? new UserRepository();
        this.fixedContent = options.fixedContent ?? new FixedContentService();
        this.guestSessions = options.guestSessions ?? new GuestSessionService();
        this.clock = options.clock ?? Date.now;
    }

    /**
     * Score the answers on the server (a score from the client is never trusted). A signed-in member's attempt is kept for
     * 3 months; a guest's is only shown. The contents are fetched before anything is saved: a result that cannot be
     * presented is not stored. A failure to store never costs the member the result.
     */
    async submit(input: BigFiveSubmissionRequest, actor: BigFiveActor): Promise<BigFiveResult> {
        if (input.version !== BIG_FIVE_VERSION) {
            throw new NotFoundError('Big Five version');
        }

        const issues = findBigFiveAnswerIssues(input.answers);

        if (issues.length > 0) {
            throw new ValidationError('Invalid answers', { issues });
        }

        const scores = scoreBigFive(input.answers);
        const now = this.clock();
        const mbti = await this.mbtiOf(actor);
        const result = await this.present(BIG_FIVE_VERSION, scores, mbti, now);

        if (!actor.uid) return result;

        const attempt: BigFiveAttemptDoc = {
            version: BIG_FIVE_VERSION,
            answers: input.answers.map((answer) => ({
                questionId: answer.questionId, value: answer.value,
            })),
            scores,
            completedAt: now,
            expiresAt: addMonths(now, ATTEMPT_RETENTION_MONTHS),
        };

        try {
            await this.repository.create(actor.uid, attempt);

            return {
                ...result, persisted: true, expiresAt: attempt.expiresAt,
            };
        } catch (error) {
            this.logError('failed to save Big Five attempt', {
                action: 'submit', userId: actor.uid, error,
            });

            return {
                ...result, saveFailed: true,
            };
        }
    }

    /** The member's newest result that has not expired, with the MBTI they have now; not found when there is none. */
    async latest(uid: string): Promise<BigFiveResult> {
        const now = this.clock();
        const attempts = await this.repository.listNewest(uid, LATEST_LOOKUP_LIMIT);
        const found = attempts.find(({ attempt }) => attempt.expiresAt > now);

        if (!found) {
            throw new NotFoundError('Big Five result');
        }

        const result = await this.present(found.attempt.version, found.attempt.scores, await this.mbtiOf({
            uid, guestSessionId: null,
        }), found.attempt.completedAt);

        return {
            ...result, persisted: true, expiresAt: found.attempt.expiresAt,
        };
    }

    /** The result as it is shown: each trait with its level and its content, and the comparison with the MBTI when there is one. */
    private async present(version: string, scores: BigFiveScores, mbti: MbtiType | null, completedAt: number): Promise<BigFiveResult> {
        const traits = await Promise.all(BIG_FIVE_TRAITS.map(async (trait) => {
            const level = bigFiveLevel(scores[trait]);

            return {
                trait,
                name: BIG_FIVE_TRAIT_INFO[trait].name,
                score: scores[trait],
                level,
                content: await this.fixedContent.getPublished('BIGFIVE', `${trait}_${level}`),
            };
        }));
        const combinations = await Promise.all(bigFiveCombinations(bigFiveLevels(scores)).map(async ({
            traits, sides, contentKey,
        }) => ({
            traits, sides, content: await this.fixedContent.getPublished('BIGFIVE', contentKey),
        })));
        const comparison = await Promise.all(compareWithMbti(scores, mbti).map(async (item) => ({
            ...item,
            content: item.contentKey ? await this.fixedContent.getPublished('BIGFIVE', item.contentKey) : null,
        })));

        return {
            version,
            traits,
            combinations: combinations.map(({
                traits: pair, sides, content,
            }) => ({
                traits: [pair[0], pair[1]], sides: [sides[0], sides[1]], content,
            })),
            mbti,
            comparison: comparison.map(({
                pair, trait, letter, result, content,
            }) => ({
                pair, trait, letter, result, content,
            })),
            completedAt,
            persisted: false,
            saveFailed: false,
            expiresAt: null,
        };
    }

    /** The MBTI type of the member (when it is still valid) or of the guest's session; null when there is none. */
    private async mbtiOf(actor: BigFiveActor): Promise<MbtiType | null> {
        if (actor.uid) {
            const user = await this.users.getById(actor.uid);

            if (!user || user.mbti === null) return null;

            return user.mbtiExpiresAt === null || user.mbtiExpiresAt > this.clock() ? user.mbti : null;
        }

        if (!actor.guestSessionId) return null;

        try {
            return (await this.guestSessions.getProfile(actor.guestSessionId)).mbti;
        } catch (error) {
            // An unknown or expired session just means there is no MBTI to compare with
            if (error instanceof NotFoundError) return null;

            throw error;
        }
    }
}
