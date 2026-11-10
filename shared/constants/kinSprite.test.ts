import {
    describe, expect, it,
} from 'vitest';
import {
    KIN_SPRITE, kinSpriteCell,
} from './kinSprite';
import { SOLAR_SEAL_COUNT } from './mayaKin';

describe('kinSpriteCell', () => {
    it('has exactly one cell for each solar seal', () => {
        expect(KIN_SPRITE.cols * KIN_SPRITE.rows).toBe(SOLAR_SEAL_COUNT);
    });

    it('puts the first seal at the top left and the sixth on the second row', () => {
        expect(kinSpriteCell(1)).toEqual({
            size: '500% 400%', position: '0% 0%',
        });
        expect(kinSpriteCell(5).position).toBe('100% 0%');
        expect(kinSpriteCell(6).position).toBe('0% 33.33333333333333%');
    });

    it('puts the last seal at the bottom right', () => {
        expect(kinSpriteCell(SOLAR_SEAL_COUNT).position).toBe('100% 100%');
    });

    it('refuses a seal that is not on the sheet', () => {
        expect(() => kinSpriteCell(0)).toThrow(RangeError);
        expect(() => kinSpriteCell(SOLAR_SEAL_COUNT + 1)).toThrow(RangeError);
        expect(() => kinSpriteCell(1.5)).toThrow(RangeError);
    });
});
