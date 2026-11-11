import {
    describe, expect, it,
} from 'vitest';
import { ZIWEI_ENTRY_ENABLED } from '../../shared/constants/ziwei';
import { DIMENSION_META } from './reportDimensions';

describe('Zi Wei among the dimensions a report can combine', () => {
    it('is offered exactly when its entry is on, and it is on', () => {
        expect(ZIWEI_ENTRY_ENABLED).toBe(true);
        expect(DIMENSION_META.some((item) => item.value === 'ZIWEI')).toBe(ZIWEI_ENTRY_ENABLED);
    });

    it('adds Zi Wei after the dimensions that were already offered, without changing them', () => {
        expect(DIMENSION_META.map((item) => item.value)).toEqual([
            'ZODIAC',
            'BLOOD',
            'MBTI',
            'HUMAN_DESIGN',
            'NUMEROLOGY',
            'BAZI',
            'MAYA_KIN',
            'ZIWEI',
        ]);
    });
});
