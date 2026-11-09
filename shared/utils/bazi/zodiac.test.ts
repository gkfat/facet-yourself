import {
    describe, expect, it, 
} from 'vitest';
import { baziZodiacOfDate } from './zodiac';

describe('baziZodiacOfDate', () => {
    it('uses the previous year before 立春', () => {
        expect(baziZodiacOfDate('1990-01-15')).toBe('蛇');
        expect(baziZodiacOfDate('1990-03-15')).toBe('馬');
    });

    it('follows the 12-year cycle', () => {
        expect(baziZodiacOfDate('2024-06-01')).toBe('龍');
        expect(baziZodiacOfDate('1984-06-01')).toBe('鼠');
    });
});
