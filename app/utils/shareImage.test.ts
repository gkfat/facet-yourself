import {
    describe, expect, it,
} from 'vitest';
import { wrapLines } from './shareImage';

/** Every character is 10 wide */
const measure = (text: string) => [...text].length * 10;

describe('wrapLines', () => {
    it('keeps a short text on one line', () => {
        expect(wrapLines('直接而有行動力', 100, measure, 3)).toEqual(['直接而有行動力']);
    });

    it('breaks a long text at the width, without splitting a character', () => {
        expect(wrapLines('一二三四五六七八', 30, measure, 3)).toEqual([
            '一二三',
            '四五六',
            '七八',
        ]);
    });

    it('ends the last line in an ellipsis that still fits when the text runs past the lines', () => {
        const lines = wrapLines('一二三四五六七八九十', 30, measure, 2);

        expect(lines).toEqual(['一二三', '四五…']);
        expect(lines.every((line) => measure(line) <= 30)).toBe(true);
    });

    it('starts a new line at a line break', () => {
        expect(wrapLines('甲乙\n丙丁', 100, measure, 3)).toEqual(['甲乙', '丙丁']);
    });

    it('is empty for an empty text', () => {
        expect(wrapLines('  ', 100, measure, 3)).toEqual([]);
    });
});
