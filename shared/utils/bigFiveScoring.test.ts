import {
    describe, expect, it,
} from 'vitest';
import {
    BIG_FIVE_QUESTIONS, BIG_FIVE_TRAITS,
} from '../constants/bigFive';
import {
    bigFiveLevel, bigFiveLevels, findBigFiveAnswerIssues, scoreBigFive,
} from './bigFiveScoring';

const answersWith = (valueOf: (question: typeof BIG_FIVE_QUESTIONS[number]) => number) => BIG_FIVE_QUESTIONS.map((question) => ({
    questionId: question.id, value: valueOf(question),
}));

describe('BIG_FIVE_QUESTIONS', () => {
    it('has 50 questions with their own ids, 10 for each trait and at least one reversed for each', () => {
        expect(BIG_FIVE_QUESTIONS).toHaveLength(50);
        expect(new Set(BIG_FIVE_QUESTIONS.map((question) => question.id)).size).toBe(50);

        for (const trait of BIG_FIVE_TRAITS) {
            const items = BIG_FIVE_QUESTIONS.filter((question) => question.trait === trait);

            expect(items, trait).toHaveLength(10);
            expect(items.some((question) => question.reversed), trait).toBe(true);
        }
    });

    it('asks the five traits in turn, five questions to a round', () => {
        for (let round = 0; round < 10; round += 1) {
            const traits = BIG_FIVE_QUESTIONS.slice(round * 5, round * 5 + 5).map((question) => question.trait);

            expect(new Set(traits).size).toBe(5);
        }
    });
});

describe('scoreBigFive', () => {
    it('gives 100 for every trait when every straight item is 5 and every reversed one is 1', () => {
        const scores = scoreBigFive(answersWith((question) => (question.reversed ? 1 : 5)));

        expect(Object.values(scores)).toEqual([
            100,
            100,
            100,
            100,
            100,
        ]);
        expect(Object.values(bigFiveLevels(scores))).toEqual([
            'high',
            'high',
            'high',
            'high',
            'high',
        ]);
    });

    it('gives 50 and the middle level when everything is 3', () => {
        const scores = scoreBigFive(answersWith(() => 3));

        expect(Object.values(scores)).toEqual([
            50,
            50,
            50,
            50,
            50,
        ]);
        expect(Object.values(bigFiveLevels(scores)).every((level) => level === 'mid')).toBe(true);
    });

    it('gives 0 when every straight item is 1 and every reversed one is 5', () => {
        expect(Object.values(scoreBigFive(answersWith((question) => (question.reversed ? 5 : 1))))).toEqual([
            0,
            0,
            0,
            0,
            0,
        ]);
    });

    it('turns a reversed item over: answering it 5 counts as 1 for its trait', () => {
        const target = BIG_FIVE_QUESTIONS.find((question) => question.reversed && question.trait === 'extraversion');
        const base = scoreBigFive(answersWith(() => 3));
        const changed = scoreBigFive(answersWith((question) => (question.id === target?.id ? 5 : 3)));

        expect(changed.extraversion).toBeLessThan(base.extraversion);
        expect(changed.extraversion).toBe(Math.round(((((9 * 3 + 1) / 10) - 1) / 4) * 100));
        expect(changed.openness).toBe(base.openness);
    });

    it('throws for an answer set that is not valid', () => {
        expect(() => scoreBigFive([])).toThrow(RangeError);
    });
});

describe('bigFiveLevel', () => {
    it('cuts at 40 and 60: 39 is low, 40 and 60 are middle, 61 is high', () => {
        expect(bigFiveLevel(39)).toBe('low');
        expect(bigFiveLevel(40)).toBe('mid');
        expect(bigFiveLevel(60)).toBe('mid');
        expect(bigFiveLevel(61)).toBe('high');
    });
});

describe('findBigFiveAnswerIssues', () => {
    const complete = answersWith(() => 3);

    it('finds nothing in a complete set', () => {
        expect(findBigFiveAnswerIssues(complete)).toEqual([]);
    });

    it('names the missing, duplicate, unknown and out-of-range answers', () => {
        const answers = [
            ...complete.slice(1),
            {
                questionId: 'bf02', value: 4,
            },
            {
                questionId: 'bf99', value: 3,
            },
            {
                questionId: 'bf03', value: 6,
            },
        ];
        const issues = findBigFiveAnswerIssues(answers.filter((answer, index) => !(answer.questionId === 'bf03' && index < 10)));
        const reasons = new Map(issues.map((issue) => [issue.questionId, issue.reason]));

        expect(reasons.get('bf01')).toBe('missing');
        expect(reasons.get('bf02')).toBe('duplicate');
        expect(reasons.get('bf99')).toBe('unknown');
        expect(reasons.get('bf03')).toBe('invalid-value');
    });

    it('turns away values that are 0, 6, fractional or not numbers', () => {
        for (const value of [
            0,
            6,
            2.5,
            Number.NaN,
        ]) {
            const issues = findBigFiveAnswerIssues(complete.map((answer, index) => (index === 0
                ? {
                    ...answer, value,
                }
                : answer)));

            expect(issues, String(value)).toEqual([
                {
                    questionId: 'bf01', reason: 'invalid-value',
                },
            ]);
        }
    });
});
