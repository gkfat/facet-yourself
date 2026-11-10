/*
 * The shape of the hexagrams, without their text: the counts and the trigrams. The page and the API schemas use this
 * alone, so the classical text of the 64 hexagrams stays out of the browser bundle.
 */

/** The 64 hexagrams of the Zhouyi in King Wen order, each made of a lower and an upper trigram. */
export const HEXAGRAM_COUNT = 64;
export const HEXAGRAM_LINE_COUNT = 6;

export const TRIGRAM_NAMES = [
    '乾',
    '兌',
    '離',
    '震',
    '巽',
    '坎',
    '艮',
    '坤',
] as const;

export type TrigramName = (typeof TRIGRAM_NAMES)[number];

/** A trigram's three lines from the bottom: 1 is a solid (yang) line, 0 a broken (yin) one. */
export const TRIGRAM_LINES: Readonly<Record<TrigramName, readonly [0 | 1, 0 | 1, 0 | 1]>> = {
    乾: [
        1,
        1,
        1,
    ],
    兌: [
        1,
        1,
        0,
    ],
    離: [
        1,
        0,
        1,
    ],
    震: [
        1,
        0,
        0,
    ],
    巽: [
        0,
        1,
        1,
    ],
    坎: [
        0,
        1,
        0,
    ],
    艮: [
        0,
        0,
        1,
    ],
    坤: [
        0,
        0,
        0,
    ],
};

/** Key of a hexagram's plain-language reading: `<order>`. */
export function hexagramContentKey(order: number): string {
    return String(order);
}

/** Key of a line's plain-language reading: `<order>_<position 1..6>`. */
export function hexagramLineContentKey(order: number, position: number): string {
    return `${order}_${position}`;
}

/** Every key the readings can have: 64 hexagrams and 6 lines each, 448 in all. */
export function hexagramContentKeys(): string[] {
    return Array.from({ length: HEXAGRAM_COUNT }, (_unused, index) => index + 1).flatMap((order) => [hexagramContentKey(order), ...Array.from({ length: HEXAGRAM_LINE_COUNT }, (_unused, line) => hexagramLineContentKey(order, line + 1))]);
}

/**
 * Whether the home page block, the daily fortune page and the side menu show the hexagram. Off until the 448 readings
 * are written, reviewed and imported, since casting answers 404 without them.
 */
export const HEXAGRAM_ENTRY_ENABLED = true;
