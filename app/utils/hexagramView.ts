import type { HexagramCastItem } from '../../shared/schemas/api/hexagram.schema';
import {
    changedYangOf, yangOf, type LineValue,
} from '../../shared/utils/hexagramLines';

/** What each position is called, from the bottom: the first line is the 初爻 and the sixth the 上爻. */
export const LINE_POSITION_NAMES = [
    '初爻',
    '二爻',
    '三爻',
    '四爻',
    '五爻',
    '上爻',
] as const;

export const linePositionName = (position: number): string => LINE_POSITION_NAMES[position - 1] ?? `第 ${position} 爻`;

/** The lines of a cast as the page stores them (checked to be six values of 6 to 9 by the response schema). */
export const lineValues = (cast: Pick<HexagramCastItem, 'lines'>): LineValue[] => cast.lines;

/**
 * What each kind of line is called for someone who has never read the Yijing: a solid or a broken line, and whether it
 * is changing. A line is changing when the three coins all land the same way (old yang 9, old yin 6).
 */
export const LINE_PLAIN_LABELS: Readonly<Record<LineValue, string>> = {
    6: '陰爻（正在變動）',
    7: '陽爻（穩定）',
    8: '陰爻（穩定）',
    9: '陽爻（正在變動）',
};

/** How many of the three coins landed heads for this line: a head counts 3 and a tail 2, so heads = value − 6. */
export const headsOf = (value: LineValue): number => value - 6;

/** The three coins of a line as faces, heads (正) first: 9 is 正正正, 8 is 正正反, 7 is 正反反, 6 is 反反反. */
export const coinFaces = (value: LineValue): string => `${'正'.repeat(headsOf(value))}${'反'.repeat(3 - headsOf(value))}`;

/** What is said after a toss: which line it was, how the coins landed and what that makes of the line. */
export const tossResultText = (position: number, value: LineValue): string => `${linePositionName(position)}：${coinFaces(value)}（合計 ${value}）→ ${LINE_PLAIN_LABELS[value]}`;

/**
 * What a screen reader says for the drawing of a hexagram: the name, the six lines from the bottom with what each is,
 * and which lines move. The drawing carries nothing a reader could not get from this.
 */
export function hexagramAriaLabel(name: string, cast: Pick<HexagramCastItem, 'lines' | 'moving'>, shown = 6): string {
    const lines = lineValues(cast).slice(0, shown).map((value, index) => `${linePositionName(index + 1)}${LINE_PLAIN_LABELS[value]}`);
    // A line that has not been thrown yet is not given away by saying it will change
    const moving = cast.moving.filter((position) => position <= shown).map(linePositionName);

    return [`${name}卦，由下而上：${lines.join('、')}`, moving.length > 0 ? `正在變動的爻：${moving.join('、')}` : '沒有正在變動的爻'].join('。');
}

/** The label of the hexagram it changes into: its lines are the cast's with the moving ones turned over. */
export function changedAriaLabel(name: string): string {
    return `之後的走向：${name}卦`;
}

/** The two drawings of a cast: the hexagram that was cast, and the one it changes into (none when no line moves). */
export function hexagramDrawings(cast: Pick<HexagramCastItem, 'lines' | 'changed'>): { primary: boolean[]; changed: boolean[] | null } {
    const lines = lineValues(cast);

    return {
        primary: yangOf(lines),
        changed: cast.changed ? changedYangOf(lines) : null,
    };
}

/** One line for the cards of the fortune page and the home page: the name, with the one it turns into if any. */
export function castHeadline(cast: Pick<HexagramCastItem, 'primary' | 'changed'>): string {
    return cast.changed ? `${cast.primary.name} → ${cast.changed.face.name}` : cast.primary.name;
}

/** What the cast says about change, for the cards: how many lines are changing, or that none is. */
export function movementNote(cast: Pick<HexagramCastItem, 'moving'>): string {
    return cast.moving.length === 0 ? '沒有正在變動的爻' : `${cast.moving.length} 個爻正在變動`;
}
