import {
    describe, expect, it,
} from 'vitest';
import { RUNE_COUNT } from './runes';
import {
    RUNE_SPRITE, runeSpriteCell,
} from './runeSprite';

describe('runeSpriteCell', () => {
    it('keeps the back right after the stones, inside the sheet', () => {
        expect(RUNE_SPRITE.back).toBe(RUNE_COUNT);
        expect(RUNE_SPRITE.cols * RUNE_SPRITE.rows).toBeGreaterThan(RUNE_SPRITE.back);
    });

    it('puts the first cell at the top left and the one after the fifth on the second row', () => {
        expect(runeSpriteCell(0)).toEqual({
            size: '500% 500%', position: '0% 0%',
        });
        expect(runeSpriteCell(4).position).toBe('100% 0%');
        expect(runeSpriteCell(5).position).toBe('0% 25%');
    });

    it('refuses a cell that is not on the sheet', () => {
        expect(() => runeSpriteCell(-1)).toThrow(RangeError);
        expect(() => runeSpriteCell(RUNE_SPRITE.back + 1)).toThrow(RangeError);
    });
});
