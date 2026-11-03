import {
    describe, expect, it,
} from 'vitest';
import {
    findScaleIssues, findSelectionIssues, levelOf, rankDimensions, scoreDimensions,
} from './scoring';
import {
    FAKE_OPTIONS, FAKE_SCALE_ITEMS,
} from './testing';

const answersWith = (valueOf: (item: typeof FAKE_SCALE_ITEMS[number]) => number) => FAKE_SCALE_ITEMS.map((item) => ({
    questionId: item.id, value: valueOf(item),
}));

describe('levelOf', () => {
    it('cuts at 40 and 60: 39 is low, 40 and 60 are middle, 61 is high', () => {
        expect(levelOf(39)).toBe('low');
        expect(levelOf(40)).toBe('mid');
        expect(levelOf(60)).toBe('mid');
        expect(levelOf(61)).toBe('high');
    });
});

describe('scoreDimensions', () => {
    it('gives 100 when every straight item is 5 and every reversed one is 1', () => {
        const scores = scoreDimensions(answersWith((item) => (item.reversed ? 1 : 5)), FAKE_SCALE_ITEMS);

        expect(scores).toEqual([
            {
                dimension: 'novelty', score: 100, level: 'high',
            }, {
                dimension: 'order', score: 100, level: 'high',
            },
        ]);
    });

    it('gives 50 and the middle level when everything is 3', () => {
        expect(scoreDimensions(answersWith(() => 3), FAKE_SCALE_ITEMS).map((score) => [score.score, score.level])).toEqual([[50, 'mid'], [50, 'mid']]);
    });

    it('gives 0 when every straight item is 1 and every reversed one is 5', () => {
        expect(scoreDimensions(answersWith((item) => (item.reversed ? 5 : 1)), FAKE_SCALE_ITEMS).every((score) => score.score === 0)).toBe(true);
    });

    it('turns a reversed item over: answering it 5 counts as 1 for its dimension', () => {
        const [novelty] = scoreDimensions(answersWith((item) => (item.id === 'fs02' ? 5 : 3)), FAKE_SCALE_ITEMS);

        expect(novelty?.score).toBe(Math.round((((3 + 1) / 2 - 1) / 4) * 100));
    });

    it('lists the dimensions in the order they first come, and leaves the level out when asked', () => {
        const scores = scoreDimensions(answersWith(() => 3), FAKE_SCALE_ITEMS, false);

        expect(scores.map((score) => score.dimension)).toEqual(['novelty', 'order']);
        expect(scores.every((score) => score.level === null)).toBe(true);
    });

    it('throws for answers that are not complete and legal', () => {
        expect(() => scoreDimensions([], FAKE_SCALE_ITEMS)).toThrow(RangeError);
    });
});

describe('findScaleIssues', () => {
    const complete = answersWith(() => 3);

    it('finds nothing in a complete set', () => {
        expect(findScaleIssues(complete, FAKE_SCALE_ITEMS)).toEqual([]);
    });

    it('names the missing, duplicate and unknown answers', () => {
        const issues = findScaleIssues([
            ...complete.slice(1),
            {
                questionId: 'fs02', value: 4,
            },
            {
                questionId: 'zz99', value: 3,
            },
        ], FAKE_SCALE_ITEMS);
        const reasons = new Map(issues.map((issue) => [issue.id, issue.reason]));

        expect(reasons.get('fs01')).toBe('missing');
        expect(reasons.get('fs02')).toBe('duplicate');
        expect(reasons.get('zz99')).toBe('unknown');
    });

    it('turns away values that are 0, 6, fractional or not numbers', () => {
        for (const value of [
            0,
            6,
            2.5,
            Number.NaN,
        ]) {
            expect(findScaleIssues(complete.map((answer, index) => (index === 0
                ? {
                    ...answer, value,
                }
                : answer)), FAKE_SCALE_ITEMS), String(value)).toEqual([
                {
                    id: 'fs01', reason: 'invalid-value',
                },
            ]);
        }
    });
});

describe('findSelectionIssues', () => {
    it('finds nothing in a legal pick', () => {
        expect(findSelectionIssues({
            selected: [
                'a',
                'b',
                'c',
            ], ranked: ['b', 'a'],
        }, FAKE_OPTIONS, 3, 2)).toEqual([]);
    });

    it('names an option that is not on the list, one taken twice, a wrong count and a rank that was not picked', () => {
        const issues = findSelectionIssues({
            selected: [
                'a',
                'a',
                'zz',
            ], ranked: ['d'],
        }, FAKE_OPTIONS, 3, 2);
        const pairs = issues.map((issue) => `${issue.id}:${issue.reason}`);

        expect(pairs).toContain('a:duplicate');
        expect(pairs).toContain('zz:unknown');
        expect(pairs).toContain('d:not-selected');
        expect(pairs).toContain('ranked:wrong-count');
    });

    it('turns away too few or too many picks', () => {
        expect(findSelectionIssues({
            selected: ['a', 'b'], ranked: ['a', 'b'],
        }, FAKE_OPTIONS, 3, 2).map((issue) => issue.id)).toContain('selected');
    });
});

describe('rankDimensions', () => {
    it('puts the highest first and keeps the first-come order among equal scores', () => {
        const ranked = rankDimensions([
            {
                dimension: 'x', score: 50, level: null,
            },
            {
                dimension: 'y', score: 80, level: null,
            },
            {
                dimension: 'z', score: 50, level: null,
            },
        ]);

        expect(ranked.map((score) => score.dimension)).toEqual([
            'y',
            'x',
            'z',
        ]);
    });
});
