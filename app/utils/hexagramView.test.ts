import {
    describe, expect, it,
} from 'vitest';
import {
    castHeadline, changedAriaLabel, coinFaces, headsOf, hexagramAriaLabel, hexagramDrawings, linePositionName, movementNote, tossResultText,
} from './hexagramView';
import type { HexagramCastItem } from '../../shared/schemas/api/hexagram.schema';

const reading = {
    contentType: 'HEXAGRAM' as const,
    key: '1',
    contentVersion: '1',
    title: 't',
    summary: 's',
    strengths: [],
    blindSpots: [],
    loveStyle: '',
    workStyle: '',
    communicationStyle: '',
    growthAdvice: '',
    coreNeeds: null,
    situations: null,
    relationshipBlindSpots: [],
    relationshipPoints: [],
    lovePoints: [],
    workPoints: [],
    overuse: [],
    growthPractice: null,
    dailyBehavior: '',
    lifeContexts: null,
    growthReflection: null,
    disclaimer: 'd',
};

const face = (order: number, name: string) => ({
    order, name, upper: '乾' as const, lower: '乾' as const, judgment: 'j', tuan: 't', image: 'i',
});

describe('linePositionName', () => {
    it('calls the six lines from the bottom 初爻 to 上爻', () => {
        expect([
            1,
            2,
            3,
            4,
            5,
            6,
        ].map(linePositionName)).toEqual([
            '初爻',
            '二爻',
            '三爻',
            '四爻',
            '五爻',
            '上爻',
        ]);
    });
});

describe('hexagramAriaLabel', () => {
    it('says the name, every line from the bottom and the moving ones', () => {
        const label = hexagramAriaLabel('乾', {
            lines: [
                7,
                9,
                7,
                7,
                7,
                6,
            ], moving: [2, 6],
        });

        expect(label).toBe('乾卦，由下而上：初爻陽爻（穩定）、二爻陽爻（正在變動）、三爻陽爻（穩定）、四爻陽爻（穩定）、五爻陽爻（穩定）、上爻陰爻（正在變動）。正在變動的爻：二爻、上爻');
    });

    it('says there is no moving line when none moves', () => {
        expect(hexagramAriaLabel('坤', {
            lines: [
                8,
                8,
                8,
                8,
                8,
                8,
            ], moving: [],
        })).toContain('沒有正在變動的爻');
    });

    it('says only the lines shown so far while the cast is still being laid out', () => {
        const label = hexagramAriaLabel('乾', {
            lines: [
                7,
                9,
                7,
                7,
                7,
                6,
            ], moving: [2, 6],
        }, 2);

        expect(label).toContain('初爻陽爻（穩定）、二爻陽爻（正在變動）');
        expect(label).not.toContain('三爻');
        // The sixth line moves, but it has not been thrown yet
        expect(label).not.toContain('上爻');
    });

    it('names the hexagram it changes into in plain words', () => {
        expect(changedAriaLabel('同人')).toBe('之後的走向：同人卦');
    });
});

describe('hexagramDrawings', () => {
    it('draws the cast, and the changed hexagram with the moving lines turned over', () => {
        const drawings = hexagramDrawings({
            lines: [
                6,
                7,
                8,
                9,
                7,
                8,
            ], changed: {
                face: face(2, '坤'), content: reading,
            },
        });

        expect(drawings.primary).toEqual([
            false,
            true,
            false,
            true,
            true,
            false,
        ]);
        expect(drawings.changed).toEqual([
            true,
            true,
            false,
            false,
            true,
            false,
        ]);
    });

    it('draws no changed hexagram when no line moves', () => {
        expect(hexagramDrawings({
            lines: [
                7,
                7,
                7,
                7,
                7,
                7,
            ], changed: null,
        }).changed).toBeNull();
    });
});

describe('the lines for the cards', () => {
    const cast = (changed: HexagramCastItem['changed'], moving: number[]) => ({
        primary: face(1, '乾'), changed, moving,
    });

    it('is the name alone, or the name and what it turns into', () => {
        expect(castHeadline(cast(null, []))).toBe('乾');
        expect(castHeadline(cast({
            face: face(13, '同人'), content: reading,
        }, [2]))).toBe('乾 → 同人');
    });

    it('says how many lines move', () => {
        expect(movementNote({ moving: [] })).toBe('沒有正在變動的爻');
        expect(movementNote({ moving: [1, 4] })).toBe('2 個爻正在變動');
    });
});

describe('a toss of the coins', () => {
    it('shows the three coins as faces, heads first', () => {
        expect(([
            6,
            7,
            8,
            9,
        ] as const).map(coinFaces)).toEqual([
            '反反反',
            '正反反',
            '正正反',
            '正正正',
        ]);
    });

    it('says how many of the three coins land heads for each line: 9 is three, 6 is none', () => {
        expect(([
            6,
            7,
            8,
            9,
        ] as const).map(headsOf)).toEqual([
            0,
            1,
            2,
            3,
        ]);
    });

    it('says which line it was and what came up, in plain words', () => {
        expect(tossResultText(1, 7)).toBe('初爻：正反反（合計 7）→ 陽爻（穩定）');
        expect(tossResultText(6, 6)).toBe('上爻：反反反（合計 6）→ 陰爻（正在變動）');
        expect(tossResultText(3, 9)).toBe('三爻：正正正（合計 9）→ 陽爻（正在變動）');
        expect(tossResultText(4, 8)).toBe('四爻：正正反（合計 8）→ 陰爻（穩定）');
    });
});
