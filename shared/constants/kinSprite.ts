import { SOLAR_SEAL_COUNT } from './mayaKin';

/**
 * The glyph of every solar seal on one sheet: the 20 seals in the order of the seals (1 to 20), each cell 320 x 320,
 * laid out left to right and top to bottom.
 */
export const KIN_SPRITE = {
    url: '/kin/sprite.png',
    cols: 5,
    rows: 4,
} as const;

/** CSS `background-size` and `background-position` that show the glyph of one seal (1 to 20), filling the box it is set on. */
export function kinSpriteCell(seal: number): { size: string; position: string } {
    const {
        cols, rows,
    } = KIN_SPRITE;

    if (!Number.isInteger(seal) || seal < 1 || seal > SOLAR_SEAL_COUNT) {
        throw new RangeError(`Unknown solar seal ${seal} of the kin sprite`);
    }

    const cell = seal - 1;

    return {
        size: `${cols * 100}% ${rows * 100}%`,
        position: `${(cell % cols) / (cols - 1) * 100}% ${Math.floor(cell / cols) / (rows - 1) * 100}%`,
    };
}
