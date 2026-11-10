import {
    describe, expect, it,
} from 'vitest';
import {
    HEXAGRAMS, HEXAGRAM_COUNT, TRIGRAM_NAMES, hexagramByOrder, hexagramByYang, hexagramContentKeys,
} from '../constants/hexagrams';
import {
    LINE_VALUES, hexagramOf, readingPlan, toHexagramLines, type HexagramLines,
} from './hexagram';
import { castHexagram } from './hexagramCast';

const lines = (...values: number[]): HexagramLines => toHexagramLines(values);

describe('the 64 hexagrams', () => {
    it('are 64, in order, each with all of its text', () => {
        expect(HEXAGRAMS).toHaveLength(HEXAGRAM_COUNT);
        expect(HEXAGRAMS.map((hexagram) => hexagram.order)).toEqual(Array.from({ length: 64 }, (_unused, index) => index + 1));
        expect(new Set(HEXAGRAMS.map((hexagram) => hexagram.name)).size).toBe(64);

        for (const hexagram of HEXAGRAMS) {
            expect(hexagram.judgment.trim(), `judgment of ${hexagram.name}`).not.toBe('');
            expect(hexagram.tuan.trim(), `tuan of ${hexagram.name}`).not.toBe('');
            expect(hexagram.image.trim(), `image of ${hexagram.name}`).not.toBe('');
            expect(hexagram.lines, `lines of ${hexagram.name}`).toHaveLength(6);
            expect(hexagram.lines.every((line) => line.trim() !== '')).toBe(true);
        }
    });

    it('have 384 line statements in all', () => {
        expect(HEXAGRAMS.reduce((sum, hexagram) => sum + hexagram.lines.length, 0)).toBe(384);
    });

    it('are told apart by their trigrams: all 64 pairs are used once', () => {
        const pairs = new Set(HEXAGRAMS.map((hexagram) => `${hexagram.upper}${hexagram.lower}`));

        expect(pairs.size).toBe(64);
        expect(TRIGRAM_NAMES).toHaveLength(8);
    });

    it('are told apart by their six lines: all 64 patterns are used once', () => {
        const patterns = new Set(HEXAGRAMS.map((hexagram) => hexagram.yang.map(Number).join('')));

        expect(patterns.size).toBe(64);
    });

    it('put the pure hexagrams and the well known ones where King Wen has them', () => {
        expect(hexagramByYang([
            true,
            true,
            true,
            true,
            true,
            true,
        ]).name).toBe('乾');
        expect(hexagramByYang([
            false,
            false,
            false,
            false,
            false,
            false,
        ]).name).toBe('坤');
        // 泰: earth above heaven, 否: heaven above earth
        expect(hexagramByYang([
            true,
            true,
            true,
            false,
            false,
            false,
        ]).name).toBe('泰');
        expect(hexagramByYang([
            false,
            false,
            false,
            true,
            true,
            true,
        ]).name).toBe('否');
        // 既濟 is every line in its place: yang, yin, yang, yin, yang, yin from the bottom
        expect(hexagramByYang([
            true,
            false,
            true,
            false,
            true,
            false,
        ]).name).toBe('既濟');
        expect(hexagramByYang([
            false,
            true,
            false,
            true,
            false,
            true,
        ]).name).toBe('未濟');
        expect(hexagramByOrder(1).name).toBe('乾');
        expect(hexagramByOrder(64).name).toBe('未濟');
    });

    it('come in pairs: the odd one and the next are each other turned over or inverted', () => {
        // In King Wen order hexagrams 2n-1 and 2n are either upside down or, when that is the same, every line flipped
        for (let order = 1; order <= 64; order += 2) {
            const first = hexagramByOrder(order).yang;
            const second = hexagramByOrder(order + 1).yang;
            const reversed = [...first].reverse();
            const inverted = first.map((line) => !line);
            const matches = reversed.every((line, index) => line === second[index]);
            const flips = inverted.every((line, index) => line === second[index]);

            expect(matches || flips, `pair ${order} and ${order + 1}`).toBe(true);

            // Only a hexagram that reads the same upside down is paired by inversion
            if (reversed.every((line, index) => line === first[index])) expect(flips).toBe(true);
        }
    });

    it('have 448 reading keys: 64 hexagrams and 6 lines each, none twice', () => {
        const keys = hexagramContentKeys();

        expect(keys).toHaveLength(448);
        expect(new Set(keys).size).toBe(448);
        expect(keys).toContain('1');
        expect(keys).toContain('64_6');
        expect(keys).not.toContain('65');
        expect(keys).not.toContain('1_7');
    });
});

describe('hexagramOf', () => {
    it('finds the hexagram of the lines and has no changed one when nothing moves', () => {
        const cast = hexagramOf(lines(7, 7, 7, 7, 7, 7));

        expect(cast.primary.name).toBe('乾');
        expect(cast.changed).toBeNull();
        expect(cast.moving).toEqual([]);
    });

    it('turns the moving lines into their opposite for the changed hexagram', () => {
        // The second line from the bottom is old yang: it turns yin, which makes 同人 (fire below, heaven above)
        const cast = hexagramOf(lines(7, 9, 7, 7, 7, 7));

        expect(cast.primary.name).toBe('乾');
        expect(cast.moving).toEqual([2]);
        expect(cast.changed?.name).toBe('同人');
    });

    it('moves old yin to yang and old yang to yin, and leaves the young lines alone', () => {
        // Bottom to top: old yin, young yang, young yin, old yang, young yang, young yin
        const cast = hexagramOf(lines(6, 7, 8, 9, 7, 8));

        expect(cast.moving).toEqual([1, 4]);
        expect(cast.primary.yang).toEqual([
            false,
            true,
            false,
            true,
            true,
            false,
        ]);
        expect(cast.changed?.yang).toEqual([
            true,
            true,
            false,
            false,
            true,
            false,
        ]);
    });

    it('turns all six old lines into the opposite hexagram', () => {
        expect(hexagramOf(lines(9, 9, 9, 9, 9, 9)).changed?.name).toBe('坤');
        expect(hexagramOf(lines(6, 6, 6, 6, 6, 6)).changed?.name).toBe('乾');
    });
});

describe('readingPlan', () => {
    it('reads the judgment alone when no line moves', () => {
        expect(readingPlan(lines(7, 8, 7, 8, 7, 8))).toEqual({
            mode: 'none', moving: [],
        });
    });

    it('reads one moving line with its statement', () => {
        expect(readingPlan(lines(7, 8, 6, 8, 7, 8))).toEqual({
            mode: 'single', moving: [3],
        });
    });

    it('reads only the two hexagrams when two or more lines move', () => {
        expect(readingPlan(lines(9, 8, 6, 8, 7, 8)).mode).toBe('multiple');
        expect(readingPlan(lines(9, 9, 9, 6, 6, 6))).toEqual({
            mode: 'multiple', moving: [
                1,
                2,
                3,
                4,
                5,
                6,
            ],
        });
    });
});

describe('toHexagramLines', () => {
    it('refuses anything but six lines of 6 to 9', () => {
        expect(() => toHexagramLines([
            7,
            7,
            7,
            7,
            7,
        ])).toThrow(RangeError);
        expect(() => toHexagramLines([
            7,
            7,
            7,
            7,
            7,
            7,
            7,
        ])).toThrow(RangeError);
        expect(() => toHexagramLines([
            7,
            7,
            7,
            7,
            7,
            5,
        ])).toThrow(RangeError);
        expect(() => toHexagramLines([
            7,
            7,
            7,
            7,
            7,
            '7',
        ])).toThrow(RangeError);
    });
});

describe('castHexagram', () => {
    it('gives the same lines for the same subject, date and number', () => {
        expect(castHexagram('u1', '2026-11-09', 0)).toEqual(castHexagram('u1', '2026-11-09', 0));
    });

    it('decides each number of the day on its own', () => {
        const casts = Array.from({ length: 12 }, (_unused, seq) => castHexagram('u1', '2026-11-09', seq).join(''));

        expect(new Set(casts).size).toBeGreaterThan(1);
    });

    it('differs between subjects and between dates', () => {
        const base = castHexagram('u1', '2026-11-09', 0).join('');
        const others = [
            'u2',
            'u3',
            'u4',
            'u5',
            'u6',
        ].map((subject) => castHexagram(subject, '2026-11-09', 0).join(''));
        const days = [
            '2026-11-10',
            '2026-11-11',
            '2026-11-12',
            '2026-11-13',
            '2026-11-14',
        ].map((date) => castHexagram('u1', date, 0).join(''));

        expect(others.some((cast) => cast !== base)).toBe(true);
        expect(days.some((cast) => cast !== base)).toBe(true);
    });

    it('always gives six lines of 6 to 9', () => {
        for (let seq = 0; seq < 200; seq += 1) {
            const cast = castHexagram(`u${seq}`, '2026-11-09', seq);

            expect(cast).toHaveLength(6);
            expect(cast.every((line) => LINE_VALUES.includes(line))).toBe(true);
        }
    });

    it('gives each line 6, 7, 8 and 9 with the odds of three coins, and every hexagram the same odds', () => {
        const samples = 100_000;
        const lineCounts = new Map<number, number>();
        const hexagramCounts = new Map<number, number>();
        let moving = 0;

        for (let index = 0; index < samples; index += 1) {
            const cast = castHexagram(`subject-${index}`, '2026-11-09', index % 5);
            const { primary } = hexagramOf(cast);

            hexagramCounts.set(primary.order, (hexagramCounts.get(primary.order) ?? 0) + 1);

            for (const line of cast) {
                lineCounts.set(line, (lineCounts.get(line) ?? 0) + 1);
                if (line === 6 || line === 9) moving += 1;
            }
        }

        const lineTotal = samples * 6;
        const near = (count: number | undefined, share: number, tolerance: number) => Math.abs((count ?? 0) / lineTotal - share) <= tolerance;

        expect(near(lineCounts.get(6), 1 / 8, 0.005)).toBe(true);
        expect(near(lineCounts.get(7), 3 / 8, 0.005)).toBe(true);
        expect(near(lineCounts.get(8), 3 / 8, 0.005)).toBe(true);
        expect(near(lineCounts.get(9), 1 / 8, 0.005)).toBe(true);
        expect(Math.abs(moving / lineTotal - 1 / 4)).toBeLessThan(0.005);

        // All 64 come up, each about samples / 64 times (within 10%)
        const expected = samples / 64;

        expect(hexagramCounts.size).toBe(64);

        for (const [order, count] of hexagramCounts) {
            expect(Math.abs(count - expected) / expected, `hexagram ${order}`).toBeLessThan(0.1);
        }
    });
});
