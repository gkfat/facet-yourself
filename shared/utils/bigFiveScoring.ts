// Plain `.ts` import specifiers: this file is also run directly by Node
// (type stripping) from scripts/, where extensionless imports do not resolve.
import {
    BIG_FIVE_HIGH_ABOVE,
    BIG_FIVE_LOW_BELOW,
    BIG_FIVE_QUESTIONS,
    BIG_FIVE_TRAITS,
    type BigFiveLevel,
    type BigFiveQuestion,
    type BigFiveTrait,
} from '../constants/bigFive.ts';

export type BigFiveAnswer = {
    questionId: string;
    value: number;
};

export type BigFiveAnswerIssue = {
    questionId: string;
    reason: 'missing' | 'unknown' | 'duplicate' | 'invalid-value';
};

export type BigFiveScores = Record<BigFiveTrait, number>;

export type BigFiveLevels = Record<BigFiveTrait, BigFiveLevel>;

/** What is wrong with a submission: every question answered exactly once with a whole number from 1 to 5, and nothing else. */
export function findBigFiveAnswerIssues(answers: readonly BigFiveAnswer[], questions: readonly BigFiveQuestion[] = BIG_FIVE_QUESTIONS): BigFiveAnswerIssue[] {
    const issues: BigFiveAnswerIssue[] = [];
    const known = new Set(questions.map((question) => question.id));
    const seen = new Set<string>();

    for (const answer of answers) {
        if (!known.has(answer.questionId)) {
            issues.push({
                questionId: answer.questionId, reason: 'unknown',
            });
            continue;
        }

        if (seen.has(answer.questionId)) {
            issues.push({
                questionId: answer.questionId, reason: 'duplicate',
            });
            continue;
        }

        seen.add(answer.questionId);

        if (!Number.isInteger(answer.value) || answer.value < 1 || answer.value > 5) {
            issues.push({
                questionId: answer.questionId, reason: 'invalid-value',
            });
        }
    }

    for (const question of questions) {
        if (!seen.has(question.id)) {
            issues.push({
                questionId: question.id, reason: 'missing',
            });
        }
    }

    return issues;
}

/** The level of a score: below 40 low, 40 to 60 middle, above 60 high. */
export function bigFiveLevel(score: number): BigFiveLevel {
    if (score < BIG_FIVE_LOW_BELOW) return 'low';

    return score > BIG_FIVE_HIGH_ABOVE ? 'high' : 'mid';
}

/**
 * The score of each trait, 0 to 100: a reversed item is turned over (6 - answer), the items of the trait are averaged and
 * the average (1 to 5) is put on a scale of 0 to 100 and rounded. Throws if the answers are not a complete, legal set:
 * check them with `findBigFiveAnswerIssues` first.
 */
export function scoreBigFive(answers: readonly BigFiveAnswer[], questions: readonly BigFiveQuestion[] = BIG_FIVE_QUESTIONS): BigFiveScores {
    const issues = findBigFiveAnswerIssues(answers, questions);

    if (issues.length > 0) throw new RangeError(`Big Five answers are not valid: ${issues.map((issue) => `${issue.questionId} ${issue.reason}`).join(', ')}`);

    const valueOf = new Map(answers.map((answer) => [answer.questionId, answer.value]));

    return Object.fromEntries(BIG_FIVE_TRAITS.map((trait) => {
        const items = questions.filter((question) => question.trait === trait);
        const total = items.reduce((sum, question) => {
            const value = valueOf.get(question.id) ?? 0;

            return sum + (question.reversed ? 6 - value : value);
        }, 0);

        return [trait, Math.round(((total / items.length - 1) / 4) * 100)];
    })) as BigFiveScores;
}

export function bigFiveLevels(scores: BigFiveScores): BigFiveLevels {
    return Object.fromEntries(BIG_FIVE_TRAITS.map((trait) => [trait, bigFiveLevel(scores[trait])])) as BigFiveLevels;
}
