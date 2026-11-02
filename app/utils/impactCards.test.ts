import {
    describe, expect, it,
} from 'vitest';
import { impactCards } from './impactCards';

const segment = (context: string, text: string) => ({
    text, sources: [{ fragment: `A1.A|${context}` }],
});

describe('impactCards', () => {
    const blocks = [
        {
            key: 'impact:A1.A',
            segments: [
                segment('time:past', '過去的句子。'),
                segment('object:self', '甲對自己。'),
                segment('object:partner', '甲對伴侶。'),
                segment('domain:work', '甲的決策。'),
            ],
        },
        {
            key: 'impact:B2.A',
            segments: [segment('object:self', '乙對自己。')],
        },
        {
            key: 'summary', segments: [segment('object:self', '不屬於影響面向')],
        },
    ];

    it('puts what every trait says of a context into one card, in the order of the traits', () => {
        const [object] = impactCards(blocks);
        const self = object?.cards.find((card) => card.context === 'object:self');

        expect(object?.label).toBe('對象');
        expect(self?.text).toBe('甲對自己。乙對自己。');
    });

    it('has no card for the time values, nor for a context nobody says anything of', () => {
        const contexts = impactCards(blocks).flatMap((group) => group.cards.map((card) => card.context));

        expect(contexts).not.toContain('time:past');
        expect(contexts).toContain('object:partner');
        expect(contexts).not.toContain('object:family');
    });

    it('keeps the cards of a group in the order the contexts are listed', () => {
        const [object] = impactCards(blocks);

        expect(object?.cards.map((card) => card.context)).toEqual(['object:self', 'object:partner']);
    });

    it('leaves out the blocks that are not maps of effects', () => {
        const [object] = impactCards(blocks);

        expect(object?.cards[0]?.text).not.toContain('不屬於');
    });
});
