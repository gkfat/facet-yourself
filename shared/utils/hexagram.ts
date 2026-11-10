import {
    hexagramByYang, type Hexagram,
} from '../constants/hexagrams.ts';
import {
    changedYangOf, isMovingLine, yangOf, type HexagramLines,
} from './hexagramLines.ts';

export * from './hexagramLines.ts';

/** Part of the hashed text and of every stored cast, so a rule change never mixes with older casts. */
export const HEXAGRAM_DRAW_VERSION = 'hexagram-v1';

/** Points a cast costs after the free one of the day. */
export const HEXAGRAM_EXTRA_CAST_COST = 1;

export type HexagramCast = {
    primary: Hexagram;
    /** The hexagram the moving lines turn it into; null when no line moves */
    changed: Hexagram | null;
    /** Positions (1 is the bottom line) of the moving lines, lowest first */
    moving: readonly number[];
};

/** The hexagram of a cast, the one it changes into, and where it moves. Derived from the six lines only. */
export function hexagramOf(lines: HexagramLines): HexagramCast {
    const moving = lines.flatMap((line, index) => (isMovingLine(line) ? [index + 1] : []));
    const primary = hexagramByYang(yangOf(lines));

    return {
        primary,
        changed: moving.length === 0 ? null : hexagramByYang(changedYangOf(lines)),
        moving,
    };
}

/**
 * How much of the text a cast is read with: the judgment alone when no line moves ('none'), the judgment and the
 * statement of the one moving line ('single'), and only the two hexagrams when two or more move ('multiple', which
 * is also the case of all six moving).
 */
export type ReadingMode = 'none' | 'single' | 'multiple';

export type ReadingPlan = {
    mode: ReadingMode;
    moving: readonly number[];
};

export function readingPlan(lines: HexagramLines): ReadingPlan {
    const moving = lines.flatMap((line, index) => (isMovingLine(line) ? [index + 1] : []));

    return {
        mode: moving.length === 0 ? 'none' : moving.length === 1 ? 'single' : 'multiple',
        moving,
    };
}

