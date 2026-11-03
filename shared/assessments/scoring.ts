// Plain `.ts` import specifiers: this file is also run directly by Node
// (type stripping) from scripts/, where extensionless imports do not resolve.
import type {
    DimensionScore, ScaleAnswer, ScaleItem, SelectionAnswer, SelectionOption,
} from './types.ts';

/** Below this a dimension is low; above HIGH_ABOVE it is high; in between it is middle */
export const LOW_BELOW = 40;
export const HIGH_ABOVE = 60;

export const SCALE_MIN = 1;
export const SCALE_MAX = 5;

export type AnswerIssue = {
    id: string;
    reason: 'missing' | 'unknown' | 'duplicate' | 'invalid-value' | 'wrong-count' | 'not-selected';
};

export function levelOf(score: number): 'low' | 'mid' | 'high' {
    if (score < LOW_BELOW) return 'low';

    return score > HIGH_ABOVE ? 'high' : 'mid';
}

/** What is wrong with the answers to a scale: every item answered once, with a whole number from 1 to 5, and nothing else. */
export function findScaleIssues(answers: readonly ScaleAnswer[], items: readonly ScaleItem[]): AnswerIssue[] {
    const issues: AnswerIssue[] = [];
    const known = new Set(items.map((item) => item.id));
    const seen = new Set<string>();

    for (const answer of answers) {
        if (!known.has(answer.questionId)) {
            issues.push({
                id: answer.questionId, reason: 'unknown',
            });
            continue;
        }

        if (seen.has(answer.questionId)) {
            issues.push({
                id: answer.questionId, reason: 'duplicate',
            });
            continue;
        }

        seen.add(answer.questionId);

        if (!Number.isInteger(answer.value) || answer.value < SCALE_MIN || answer.value > SCALE_MAX) {
            issues.push({
                id: answer.questionId, reason: 'invalid-value',
            });
        }
    }

    for (const item of items) {
        if (!seen.has(item.id)) {
            issues.push({
                id: item.id, reason: 'missing',
            });
        }
    }

    return issues;
}

/** What is wrong with a pick: only options of the list, the number asked for, none twice, and the ranked ones among the picked. */
export function findSelectionIssues(answer: SelectionAnswer, options: readonly SelectionOption[], pick: number, rank: number): AnswerIssue[] {
    const issues: AnswerIssue[] = [];
    const known = new Set(options.map((option) => option.id));
    const seen = new Set<string>();

    for (const id of answer.selected) {
        if (!known.has(id)) {
            issues.push({
                id, reason: 'unknown',
            });
        } else if (seen.has(id)) {
            issues.push({
                id, reason: 'duplicate',
            });
        }

        seen.add(id);
    }

    if (answer.selected.length !== pick) {
        issues.push({
            id: 'selected', reason: 'wrong-count',
        });
    }

    const ranked = new Set<string>();

    for (const id of answer.ranked) {
        if (!seen.has(id)) {
            issues.push({
                id, reason: 'not-selected',
            });
        } else if (ranked.has(id)) {
            issues.push({
                id, reason: 'duplicate',
            });
        }

        ranked.add(id);
    }

    if (answer.ranked.length !== rank) {
        issues.push({
            id: 'ranked', reason: 'wrong-count',
        });
    }

    return issues;
}

/**
 * The score of each dimension of a scale, 0 to 100, in the order the dimensions first come in the items: a reversed item is
 * turned over (6 - answer), the items of the dimension are averaged, and the average (1 to 5) is put on a scale of 0 to
 * 100 and rounded. The answers must be complete and legal: check them with `findScaleIssues` first.
 */
export function scoreDimensions(answers: readonly ScaleAnswer[], items: readonly ScaleItem[], withLevel = true): DimensionScore[] {
    const issues = findScaleIssues(answers, items);

    if (issues.length > 0) throw new RangeError(`Answers are not valid: ${issues.map((issue) => `${issue.id} ${issue.reason}`).join(', ')}`);

    const valueOf = new Map(answers.map((answer) => [answer.questionId, answer.value]));
    const dimensions = [...new Set(items.map((item) => item.dimension))];

    return dimensions.map((dimension) => {
        const own = items.filter((item) => item.dimension === dimension);
        const total = own.reduce((sum, item) => {
            const value = valueOf.get(item.id) ?? 0;

            return sum + (item.reversed ? SCALE_MAX + SCALE_MIN - value : value);
        }, 0);
        const score = Math.round(((total / own.length - SCALE_MIN) / (SCALE_MAX - SCALE_MIN)) * 100);

        return {
            dimension, score, level: withLevel ? levelOf(score) : null,
        };
    });
}

/** The dimensions from the highest score down; equal scores keep the order the dimensions first come in, so the same answers always give the same order. */
export function rankDimensions(scores: readonly DimensionScore[]): DimensionScore[] {
    return scores.map((score, index) => ({
        score, index,
    })).sort((first, second) => second.score.score - first.score.score || first.index - second.index).map(({ score }) => score);
}
