import type {
    HistoryHexagramItem, HistoryRuneItem, HistoryTarotItem,
} from '../../shared/schemas/api/fortuneHistory.schema';
import type { HexagramCastItem } from '../../shared/schemas/api/hexagram.schema';
import { RUNE_ORIENTATION_LABELS } from '../../shared/constants/runes';
import { TAROT_ORIENTATION_LABELS } from '../../shared/constants/tarot';
import { movementNote } from './hexagramView';

/** The card of a day: its name and which way up it was drawn. */
export const tarotTitle = (item: HistoryTarotItem): string => `${item.card.name}（${TAROT_ORIENTATION_LABELS[item.card.orientation]}）`;

/** The rune of a day: its name and which way up it was drawn. */
export const runeTitle = (item: HistoryRuneItem): string => `${item.rune.name}（${RUNE_ORIENTATION_LABELS[item.rune.orientation]}）`;

/** A cast of a day: the hexagram, and the one it turns into when a line is changing. */
export const hexagramTitle = (item: HistoryHexagramItem): string => (item.changed
    ? `${item.primary.name}卦 → ${item.changed.face.name}卦`
    : `${item.primary.name}卦`);

/** Under the title of a cast: which one of the day it was, whether it was paid for, and how much of it is changing. */
export const hexagramSubtitle = (item: HistoryHexagramItem): string => [
    `第 ${item.seq + 1} 卦`,
    item.paid ? '加卦' : '',
    movementNote(item),
].filter(Boolean).join(' · ');

/**
 * The cast as the reading component takes it, or null when any reading it needs is gone (the cast is then listed
 * without its reading, since the component shows whole readings only).
 */
export function readableCast(item: HistoryHexagramItem): HexagramCastItem | null {
    const {
        content, changed, movingLine,
    } = item;

    if (!content) return null;

    let changedPart: HexagramCastItem['changed'] = null;
    let movingPart: HexagramCastItem['movingLine'] = null;

    if (changed) {
        if (!changed.content) return null;

        changedPart = {
            face: changed.face, content: changed.content,
        };
    }

    if (movingLine) {
        if (!movingLine.content) return null;

        movingPart = {
            position: movingLine.position, statement: movingLine.statement, content: movingLine.content,
        };
    }

    return {
        ...item, content, changed: changedPart, movingLine: movingPart,
    };
}
