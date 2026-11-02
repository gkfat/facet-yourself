import {
    describe, expect, it,
} from 'vitest';
import { factTerms } from './factTerms';

describe('factTerms', () => {
    it('gives the one term of a fact with its value', () => {
        expect(factTerms({
            label: '類型', value: '投射者', term: 'hd:type:PROJECTOR',
        })).toEqual([
            {
                term: 'hd:type:PROJECTOR', value: '投射者',
            },
        ]);
    });

    it('gives a term for each thing a fact lists, and none for a fact with no term', () => {
        expect(factTerms({
            label: '有定義的能量中心', value: 'A、B', terms: [
                {
                    term: 't:a', value: 'A',
                }, {
                    term: 't:b', value: 'B',
                },
            ],
        }).map((entry) => entry.term)).toEqual(['t:a', 't:b']);
        expect(factTerms({
            label: '策略', value: '等待邀請',
        })).toEqual([]);
    });
});
