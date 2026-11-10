/*
 * What a cast is made of, without the text of the hexagrams: the page draws a cast from this alone, so the 64 hexagrams
 * with their classical text stay out of the browser bundle.
 */

/**
 * One line of a cast by three coins: heads count 3 and tails 2, so the sum is 6 (old yin), 7 (young yang),
 * 8 (young yin) or 9 (old yang). Old lines move and turn into their opposite in the changed hexagram.
 */
export type LineValue = 6 | 7 | 8 | 9;

export type HexagramLines = readonly [LineValue, LineValue, LineValue, LineValue, LineValue, LineValue];

export const LINE_LABELS: Readonly<Record<LineValue, string>> = {
    6: '老陰',
    7: '少陽',
    8: '少陰',
    9: '老陽',
};

export const LINE_VALUES: readonly LineValue[] = [
    6,
    7,
    8,
    9,
];

export const isLineValue = (value: unknown): value is LineValue => value === 6 || value === 7 || value === 8 || value === 9;

/** Six values as the lines of a cast, or a RangeError: a stored or computed cast is never trusted to be well formed. */
export function toHexagramLines(values: readonly unknown[]): HexagramLines {
    const [
        first,
        second,
        third,
        fourth,
        fifth,
        sixth,
        ...rest
    ] = values;

    if (rest.length > 0 || !isLineValue(first) || !isLineValue(second) || !isLineValue(third) || !isLineValue(fourth) || !isLineValue(fifth) || !isLineValue(sixth)) {
        throw new RangeError('A cast has exactly six lines, each 6, 7, 8 or 9');
    }

    return [
        first,
        second,
        third,
        fourth,
        fifth,
        sixth,
    ];
}

export const isYangLine = (value: LineValue): boolean => value === 7 || value === 9;

export const isMovingLine = (value: LineValue): boolean => value === 6 || value === 9;

/** The six lines as solid (true) or broken (false) from the bottom: what the cast shows. */
export const yangOf = (lines: readonly LineValue[]): boolean[] => lines.map(isYangLine);

/** The six lines of the hexagram the moving lines turn it into: a moving line turns into its opposite. */
export const changedYangOf = (lines: readonly LineValue[]): boolean[] => lines.map((line) => (isMovingLine(line) ? !isYangLine(line) : isYangLine(line)));
