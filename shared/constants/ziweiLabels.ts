import type { Branch } from './bazi';

/**
 * Where each branch sits on the traditional chart: four columns and four rows, the middle two by two left to the
 * summary. Read left to right, top to bottom: 巳午未申 / 辰 … 酉 / 卯 … 戌 / 寅丑子亥.
 */
export const ZIWEI_GRID_BRANCHES: ReadonlyArray<{ branch: Branch; row: number; column: number }> = [
    {
        branch: '巳', row: 1, column: 1, 
    },
    {
        branch: '午', row: 1, column: 2, 
    },
    {
        branch: '未', row: 1, column: 3, 
    },
    {
        branch: '申', row: 1, column: 4, 
    },
    {
        branch: '辰', row: 2, column: 1, 
    },
    {
        branch: '酉', row: 2, column: 4, 
    },
    {
        branch: '卯', row: 3, column: 1, 
    },
    {
        branch: '戌', row: 3, column: 4, 
    },
    {
        branch: '寅', row: 4, column: 1, 
    },
    {
        branch: '丑', row: 4, column: 2, 
    },
    {
        branch: '子', row: 4, column: 3, 
    },
    {
        branch: '亥', row: 4, column: 4, 
    },
];

/** The steps of "how to read a Zi Wei chart", in the order to look. */
export const ZIWEI_READING_STEPS: ReadonlyArray<{ title: string; text: string }> = [
    {
        title: '第 1 步：先看五行局、命主與身主',
        text: '五行局由命宮的干支算出，是整張命盤排星的基礎；命主與身主是傳統裡用來描述你的兩個代表星，只作參考，不在命盤上占位置。',
    },
    {
        title: '第 2 步：找到「命宮」',
        text: '標著「命」的宮位是你面對世界的基本態度與行事風格，是看整張命盤最先要參照的位置。標著「身」的宮位是身宮，與命宮可能是同一宮。',
    },
    {
        title: '第 3 步：看命宮與身宮裡的星',
        text: '每一顆星都有它象徵的特質。星可能不只一顆；沒有主星的宮位叫空宮，這是命盤的事實，命盤上不會替它填星，報告裡才會借對宮的主星來幫助理解，並標明是借星。',
    },
    {
        title: '第 4 步：留意星上的四化',
        text: '「祿、權、科、忌」是由出生年的天干決定的四個標記，附在星上。化忌象徵容易放不下、值得多留意的地方，不是壞事的預告。',
    },
];

/**
 * The sentence every Zi Wei reading carries. It says 不代表必然發生 on purpose, so it is kept apart from the wording check
 * (which bans 必) and a reading's disclaimer has to begin with exactly this text. It lives here, with no imports, because
 * the pages show it and must not pull in the wording lists.
 */
export const ZIWEI_DISCLAIMER = '象徵性解讀，非科學測量；內容適合自我探索，不代表必然發生的事件';

export const ZIWEI_LEAP_NOTE = '出生在農曆閏月，各派算法不同，可能有差異（本站閏月初一至十五日歸原月，十六日起歸下個月）。';

export const ZIWEI_LATE_ZI_NOTE = '出生在 23:00–24:00 的晚子時，本站日期不換日、時支為子；各派算法不同，可能有差異。';

type HourNote =
    | { kind: 'LATE_ZI' }
    | { kind: 'HOUR_BOUNDARY'; minutesFromBoundary?: number; neighbourBranch?: string };

/** The sentence for a notice about the hour: the late 子 hour, or a birth close to the edge of an hour. */
export function ziweiHourNoteText(note: HourNote): string {
    return note.kind === 'LATE_ZI'
        ? ZIWEI_LATE_ZI_NOTE
        : `出生時間距時辰交界只有 ${note.minutesFromBoundary ?? 0} 分鐘，時辰也可能是${note.neighbourBranch ?? ''}時，命盤可能因此不同。`;
}
