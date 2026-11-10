import {
    describe, expect, it,
} from 'vitest';
import {
    hexagramSubtitle, hexagramTitle, readableCast, runeTitle, tarotTitle,
} from './fortuneHistoryView';
import type { HistoryHexagramItem } from '../../shared/schemas/api/fortuneHistory.schema';

const content = {
    contentType: 'HEXAGRAM' as const,
    key: '1',
    contentVersion: '1',
    title: 't',
    summary: 's',
    strengths: [],
    blindSpots: [],
    growthAdvice: '',
    disclaimer: 'd',
};
const face = (order: number, name: string) => ({
    order, name, upper: '乾' as const, lower: '乾' as const, judgment: 'j', tuan: 't', image: 'i',
});
const cast = (overrides: Partial<HistoryHexagramItem> = {}): HistoryHexagramItem => ({
    seq: 0,
    paid: false,
    lines: [
        7,
        7,
        7,
        7,
        7,
        7,
    ],
    mode: 'none',
    moving: [],
    primary: face(1, '乾'),
    content,
    changed: null,
    movingLine: null,
    ...overrides,
});

describe('titles', () => {
    it('names the card and the rune with the way up they were drawn', () => {
        expect(tarotTitle({
            card: {
                index: 0, roman: '0', name: '愚者', englishName: 'The Fool', orientation: 'reversed', illustration: null,
            },
            content: null,
        })).toBe('愚者（逆位）');
        expect(runeTitle({
            rune: {
                index: 0, name: 'Fehu', glyph: 'ᚠ', meaning: '財富', orientation: 'upright', illustration: null,
            },
            content: null,
        })).toBe('Fehu（正位）');
    });

    it('names the hexagram and the one it turns into', () => {
        expect(hexagramTitle(cast())).toBe('乾卦');
        expect(hexagramTitle(cast({
            changed: {
                face: face(2, '坤'), content,
            },
        }))).toBe('乾卦 → 坤卦');
    });

    it('says which cast of the day it was and whether it was paid for', () => {
        expect(hexagramSubtitle(cast())).toBe('第 1 卦 · 沒有正在變動的爻');
        expect(hexagramSubtitle(cast({
            seq: 2, paid: true, moving: [3],
        }))).toBe('第 3 卦 · 加卦 · 1 個爻正在變動');
    });
});

describe('readableCast', () => {
    it('gives the cast to the reading component when all its readings are there', () => {
        const item = cast({
            mode: 'single',
            moving: [2],
            changed: {
                face: face(2, '坤'), content,
            },
            movingLine: {
                position: 2, statement: 'x', content,
            },
        });

        expect(readableCast(item)).toEqual(item);
    });

    it.each([
        ['the hexagram', { content: null }],
        [
            'the hexagram it turns into', {
                changed: {
                    face: face(2, '坤'), content: null,
                },
            },
        ],
        [
            'the moving line', {
                movingLine: {
                    position: 2, statement: 'x', content: null,
                },
            },
        ],
    ])('is null when the reading of %s is gone', (_name, overrides) => {
        expect(readableCast(cast(overrides))).toBeNull();
    });
});
