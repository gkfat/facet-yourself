import {
    PALACES, type Palace,
} from '../../constants/ziwei';
import type {
    BorrowedStars, PalaceChart,
} from './types';

const OPPOSITE_PALACE_STEP = PALACES.length / 2;

/**
 * Interpretation layer only: the main stars of the opposite palace, for a palace that has none of its own.
 * Returns null when the palace is not empty. Auxiliary stars are never borrowed, and nothing is written back to the chart.
 * It needs only the palaces, and imports nothing heavy, so a page can use it.
 */
export function borrowedStarsOf(chart: { palaces: readonly PalaceChart[] }, palace: Palace): BorrowedStars | null {
    const own = chart.palaces.find((item) => item.palace === palace);

    if (!own) throw new Error(`Unknown palace: ${palace}`);

    if (!own.isEmpty) return null;

    const oppositeName = PALACES[(PALACES.indexOf(palace) + OPPOSITE_PALACE_STEP) % PALACES.length] as Palace;
    const opposite = chart.palaces.find((item) => item.palace === oppositeName);

    if (!opposite) throw new Error(`Unknown palace: ${oppositeName}`);

    return {
        borrowedFromPalace: oppositeName,
        borrowedStars: opposite.mainStars.map((placement) => ({ ...placement })),
    };
}
