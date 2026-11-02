/**
 * The picture of every stone on one sheet: the 24 stones with their rune on them, in the order of the runes (0 to 23),
 * then the blank back. Each cell is 320 x 400 (the 4:5 of a stone), laid out left to right and top to bottom. A
 * reversed rune is the cell turned half round.
 */
export const RUNE_SPRITE = {
    url: '/rune/sprite.png',
    cols: 5,
    rows: 5,
    /** The back: right after the 24 stones */
    back: 24,
} as const;

/** CSS `background-size` and `background-position` that show one cell of the sheet, filling the box it is set on. */
export function runeSpriteCell(cell: number): { size: string; position: string } {
    const {
        cols, rows,
    } = RUNE_SPRITE;

    if (!Number.isInteger(cell) || cell < 0 || cell > RUNE_SPRITE.back) {
        throw new RangeError(`Unknown cell ${cell} of the rune sprite`);
    }

    return {
        size: `${cols * 100}% ${rows * 100}%`,
        position: `${(cell % cols) / (cols - 1) * 100}% ${Math.floor(cell / cols) / (rows - 1) * 100}%`,
    };
}
