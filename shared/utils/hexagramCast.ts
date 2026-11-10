import { createHash } from 'node:crypto';
import {
    HEXAGRAM_DRAW_VERSION, toHexagramLines, type HexagramLines,
} from './hexagram.ts';
import { HEXAGRAM_LINE_COUNT } from '../constants/hexagrams.ts';

const COINS_PER_LINE = 3;

/**
 * The six lines of one cast. Deterministic on purpose: the same subject, Taipei date and number of the cast of the
 * day always give the same lines, so a retry, a second device or a visitor's reload sees the same hexagram. The
 * first 18 bits of SHA-256(`subject|date|seq|version`) are the coins, three per line from the bottom; a set bit is
 * heads (3), a clear one tails (2). That gives 6, 7, 8 and 9 with the odds 1/8, 3/8, 3/8 and 1/8 of three coins, and
 * every one of the 64 hexagrams the same odds. `seq` 0 is the free cast of the day, 1 and up are paid ones.
 */
export function castHexagram(subject: string, dateKey: string, seq: number): HexagramLines {
    const digest = createHash('sha256').update(`${subject}|${dateKey}|${seq}|${HEXAGRAM_DRAW_VERSION}`).digest();
    const bit = (index: number): number => ((digest[index >> 3] ?? 0) >> (7 - (index & 7))) & 1;
    const lines = Array.from({ length: HEXAGRAM_LINE_COUNT }, (_unused, line) => {
        let sum = 0;

        for (let coin = 0; coin < COINS_PER_LINE; coin += 1) sum += bit(line * COINS_PER_LINE + coin) === 1 ? 3 : 2;

        return sum;
    });

    return toHexagramLines(lines);
}
