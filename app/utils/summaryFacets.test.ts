import {
    describe, expect, it,
} from 'vitest';
import {
    groupByFact, parseSummary,
} from './summaryFacets';

describe('parseSummary', () => {
    it('tells a trait with the fact it follows from, and the overuse that comes after it', () => {
        const {
            facets, others, 
        } = parseSummary([
            '從「接收資訊：直覺（N）」來看，你傾向「創新突破」：愛嘗試新做法、跳出框架。',
            '用得太過時：點子多、完成少。',
            '土星、天王星集中在第 3 宮：可能是…',
        ]);

        expect(facets).toEqual([
            {
                from: '「接收資訊：直覺（N）」', name: '創新突破', description: '愛嘗試新做法、跳出框架', overuse: '點子多、完成少',
            },
        ]);
        expect(others).toEqual(['土星、天王星集中在第 3 宮：可能是…']);
    });

    it('takes a trait with no fact in front of it as one with no source to say', () => {
        expect(parseSummary(['你傾向「專注深耕」：選定方向長期深入。']).facets[0]).toMatchObject({
            from: '', name: '專注深耕',
        });
    });
});

describe('groupByFact', () => {
    it('puts the traits of one fact together, in the order the facts first come', () => {
        const facet = (from: string, name: string) => ({
            from, name, description: '', overuse: '',
        });
        const groups = groupByFact([
            facet('甲', 'a'),
            facet('乙', 'b'),
            facet('甲', 'c'),
        ]);

        expect(groups.map((group) => [group.from, group.facets.map((item) => item.name)])).toEqual([['甲', ['a', 'c']], ['乙', ['b']]]);
    });
});
