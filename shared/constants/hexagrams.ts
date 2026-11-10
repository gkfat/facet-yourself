import {
    HEXAGRAM_COUNT, TRIGRAM_LINES, type TrigramName,
} from './hexagramShape.ts';
import {
    HEXAGRAM_TEXTS, type HexagramText,
} from './hexagramTexts.ts';

export * from './hexagramShape.ts';

/** King Wen order: the name, the upper trigram and the lower trigram of each hexagram. */
const HEXAGRAM_TABLE: readonly (readonly [string, TrigramName, TrigramName])[] = [
    [
        '乾',
        '乾',
        '乾',
    ],
    [
        '坤',
        '坤',
        '坤',
    ],
    [
        '屯',
        '坎',
        '震',
    ],
    [
        '蒙',
        '艮',
        '坎',
    ],
    [
        '需',
        '坎',
        '乾',
    ],
    [
        '訟',
        '乾',
        '坎',
    ],
    [
        '師',
        '坤',
        '坎',
    ],
    [
        '比',
        '坎',
        '坤',
    ],
    [
        '小畜',
        '巽',
        '乾',
    ],
    [
        '履',
        '乾',
        '兌',
    ],
    [
        '泰',
        '坤',
        '乾',
    ],
    [
        '否',
        '乾',
        '坤',
    ],
    [
        '同人',
        '乾',
        '離',
    ],
    [
        '大有',
        '離',
        '乾',
    ],
    [
        '謙',
        '坤',
        '艮',
    ],
    [
        '豫',
        '震',
        '坤',
    ],
    [
        '隨',
        '兌',
        '震',
    ],
    [
        '蠱',
        '艮',
        '巽',
    ],
    [
        '臨',
        '坤',
        '兌',
    ],
    [
        '觀',
        '巽',
        '坤',
    ],
    [
        '噬嗑',
        '離',
        '震',
    ],
    [
        '賁',
        '艮',
        '離',
    ],
    [
        '剝',
        '艮',
        '坤',
    ],
    [
        '復',
        '坤',
        '震',
    ],
    [
        '无妄',
        '乾',
        '震',
    ],
    [
        '大畜',
        '艮',
        '乾',
    ],
    [
        '頤',
        '艮',
        '震',
    ],
    [
        '大過',
        '兌',
        '巽',
    ],
    [
        '坎',
        '坎',
        '坎',
    ],
    [
        '離',
        '離',
        '離',
    ],
    [
        '咸',
        '兌',
        '艮',
    ],
    [
        '恆',
        '震',
        '巽',
    ],
    [
        '遯',
        '乾',
        '艮',
    ],
    [
        '大壯',
        '震',
        '乾',
    ],
    [
        '晉',
        '離',
        '坤',
    ],
    [
        '明夷',
        '坤',
        '離',
    ],
    [
        '家人',
        '巽',
        '離',
    ],
    [
        '睽',
        '離',
        '兌',
    ],
    [
        '蹇',
        '坎',
        '艮',
    ],
    [
        '解',
        '震',
        '坎',
    ],
    [
        '損',
        '艮',
        '兌',
    ],
    [
        '益',
        '巽',
        '震',
    ],
    [
        '夬',
        '兌',
        '乾',
    ],
    [
        '姤',
        '乾',
        '巽',
    ],
    [
        '萃',
        '兌',
        '坤',
    ],
    [
        '升',
        '坤',
        '巽',
    ],
    [
        '困',
        '兌',
        '坎',
    ],
    [
        '井',
        '坎',
        '巽',
    ],
    [
        '革',
        '兌',
        '離',
    ],
    [
        '鼎',
        '離',
        '巽',
    ],
    [
        '震',
        '震',
        '震',
    ],
    [
        '艮',
        '艮',
        '艮',
    ],
    [
        '漸',
        '巽',
        '艮',
    ],
    [
        '歸妹',
        '震',
        '兌',
    ],
    [
        '豐',
        '震',
        '離',
    ],
    [
        '旅',
        '離',
        '艮',
    ],
    [
        '巽',
        '巽',
        '巽',
    ],
    [
        '兌',
        '兌',
        '兌',
    ],
    [
        '渙',
        '巽',
        '坎',
    ],
    [
        '節',
        '坎',
        '兌',
    ],
    [
        '中孚',
        '巽',
        '兌',
    ],
    [
        '小過',
        '震',
        '艮',
    ],
    [
        '既濟',
        '坎',
        '離',
    ],
    [
        '未濟',
        '離',
        '坎',
    ],
];

export type Hexagram = HexagramText & {
    /** 1 to 64, King Wen order */
    order: number;
    name: string;
    upper: TrigramName;
    lower: TrigramName;
    /** The six lines from the bottom: true for a solid (yang) line */
    yang: readonly boolean[];
};

function build(): readonly Hexagram[] {
    if (HEXAGRAM_TABLE.length !== HEXAGRAM_COUNT || HEXAGRAM_TEXTS.length !== HEXAGRAM_COUNT) {
        throw new RangeError(`Expected ${HEXAGRAM_COUNT} hexagrams, got ${HEXAGRAM_TABLE.length} names and ${HEXAGRAM_TEXTS.length} texts`);
    }

    return HEXAGRAM_TABLE.map(([
        name,
        upper,
        lower,
    ], index) => {
        const text = HEXAGRAM_TEXTS[index] as HexagramText;

        return {
            ...text,
            order: index + 1,
            name,
            upper,
            lower,
            yang: [...TRIGRAM_LINES[lower], ...TRIGRAM_LINES[upper]].map((line) => line === 1),
        };
    });
}

export const HEXAGRAMS: readonly Hexagram[] = build();

const yangKey = (yang: readonly boolean[]): string => yang.map((line) => (line ? '1' : '0')).join('');

const BY_LINES: ReadonlyMap<string, Hexagram> = new Map(HEXAGRAMS.map((hexagram) => [yangKey(hexagram.yang), hexagram]));

/** The hexagram whose six lines (from the bottom) are these. Every combination of six lines is one of the 64. */
export function hexagramByYang(yang: readonly boolean[]): Hexagram {
    const hexagram = BY_LINES.get(yangKey(yang));

    if (!hexagram) throw new RangeError(`No hexagram has the lines ${yangKey(yang)}`);

    return hexagram;
}

/** The hexagram at this King Wen position (1 to 64). */
export function hexagramByOrder(order: number): Hexagram {
    const hexagram = HEXAGRAMS[order - 1];

    if (!hexagram) throw new RangeError(`Unknown hexagram ${order}`);

    return hexagram;
}
