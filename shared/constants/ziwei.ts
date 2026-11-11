/**
 * Static tables for the Zi Wei Dou Shu (紫微斗數) chart.
 * Pure data only; the calculations live in `shared/utils/ziwei/`.
 *
 * Source policy: the common rules as laid out by iztro (SylarLong/iztro, 2.6.5), with the life master looked up by the
 * life palace as in iztro's default setting and in the user's two charts; no book page was available. Every rule table carries a `RuleVerification`. All tables are `verified`: they match iztro
 * (4192 inputs, 0 differences, 2026-11-11) and the user instructed that they be marked verified on 2026-11-11 without
 * user-confirmed charts. A table added later starts as `pending`, and the production chart flow refuses to run while any
 * table is pending (see `assertRulesVerified` in `shared/utils/ziwei/rules.ts`).
 * Changing any table: raise ZIWEI_ALGORITHM_VERSION.
 */

import type {
    Branch, Stem,
} from './bazi.ts';

export type RuleVerification = {
    status: 'pending' | 'verified';
    sourceBook: string | null;
    author: string | null;
    publisher: string | null;
    publicationYear: number | null;
    edition: string | null;
    page: string | null;
    notes: string;
};

const VERIFIED_NOTE = 'Matches iztro 2.6.5 (4192 inputs, 0 differences, 2026-11-11) and two charts the user supplied from another program (科技紫微網; lunar date, bureau, masters, every palace and all 四化 matched; the charts are not kept in the repo). Marked verified on the user\'s instruction (2026-11-11); no other user-confirmed charts.';

function verified(notes: string = VERIFIED_NOTE): RuleVerification {
    return {
        status: 'verified',
        sourceBook: 'iztro (SylarLong/iztro), zhongzhou algorithm',
        author: null,
        publisher: null,
        publicationYear: null,
        edition: '2.6.5',
        page: null,
        notes,
    };
}

/** The fourteen main stars (十四主星), in the traditional listing order. */
export const MAIN_STARS = [
    '紫微',
    '天機',
    '太陽',
    '武曲',
    '天同',
    '廉貞',
    '天府',
    '太陰',
    '貪狼',
    '巨門',
    '天相',
    '天梁',
    '七殺',
    '破軍',
] as const;

/** The four auxiliary stars placed in the first version (四輔星): 文昌 文曲 左輔 右弼. */
export const AUXILIARY_STARS = [
    '文昌',
    '文曲',
    '左輔',
    '右弼',
] as const;

export type MainStar = typeof MAIN_STARS[number];
export type AuxiliaryStar = typeof AUXILIARY_STARS[number];
export type ZiweiStar = MainStar | AuxiliaryStar;

/** The twelve palaces, counted from 命宮 in the counter-clockwise (branch-descending) order. */
export const PALACES = [
    '命宮',
    '兄弟',
    '夫妻',
    '子女',
    '財帛',
    '疾厄',
    '遷移',
    '交友',
    '官祿',
    '田宅',
    '福德',
    '父母',
] as const;

export type Palace = typeof PALACES[number];

export const TRANSFORMATIONS = [
    '祿',
    '權',
    '科',
    '忌',
] as const;

export type Transformation = typeof TRANSFORMATIONS[number];

/** The four stars that transform for a birth-year stem, in the order 祿 權 科 忌. */
export type TransformationStars = readonly [ZiweiStar, ZiweiStar, ZiweiStar, ZiweiStar];

/** 生年四化: the stars transformed by each year stem (祿 權 科 忌). */
export const BIRTH_YEAR_TRANSFORMATIONS: Readonly<Record<Stem, TransformationStars>> = {
    甲: [
        '廉貞',
        '破軍',
        '武曲',
        '太陽',
    ],
    乙: [
        '天機',
        '天梁',
        '紫微',
        '太陰',
    ],
    丙: [
        '天同',
        '天機',
        '文昌',
        '廉貞',
    ],
    丁: [
        '太陰',
        '天同',
        '天機',
        '巨門',
    ],
    戊: [
        '貪狼',
        '太陰',
        '右弼',
        '天機',
    ],
    己: [
        '武曲',
        '貪狼',
        '天梁',
        '文曲',
    ],
    庚: [
        '太陽',
        '武曲',
        '太陰',
        '天同',
    ],
    辛: [
        '巨門',
        '太陽',
        '文曲',
        '文昌',
    ],
    壬: [
        '天梁',
        '紫微',
        '左輔',
        '武曲',
    ],
    癸: [
        '破軍',
        '巨門',
        '太陰',
        '貪狼',
    ],
};

export const BIRTH_YEAR_TRANSFORMATIONS_SOURCE = verified(
    `${VERIFIED_NOTE} All ten stems match iztro; 庚、戊、己、壬 differ between schools, so check charts of those years first.`,
);

/**
 * 命主 by the branch of the life palace (命宮), the common school's rule and the one the user's two charts from 科技紫微網 follow.
 * (iztro's `zhongzhou` setting looks it up by the birth-year branch instead; the user's 1983 chart rules that out.)
 * It is a name only; it is not placed on the chart.
 */
export const LIFE_MASTER_BY_LIFE_BRANCH: Readonly<Record<Branch, string>> = {
    子: '貪狼',
    丑: '巨門',
    寅: '祿存',
    卯: '文曲',
    辰: '廉貞',
    巳: '武曲',
    午: '破軍',
    未: '武曲',
    申: '廉貞',
    酉: '文曲',
    戌: '祿存',
    亥: '巨門',
};

export const LIFE_MASTER_SOURCE = verified(
    `${VERIFIED_NOTE} Table matches iztro; the lookup key is the life palace's branch, as in iztro's default setting and in both charts the user supplied (the 1983 chart tells it from the birth-year branch).`,
);

/** 身主 by the birth-year branch. It is a name only; it is not placed on the chart. */
export const BODY_MASTER_BY_BRANCH: Readonly<Record<Branch, string>> = {
    子: '火星',
    丑: '天相',
    寅: '天梁',
    卯: '天同',
    辰: '文昌',
    巳: '天機',
    午: '火星',
    未: '天相',
    申: '天梁',
    酉: '天同',
    戌: '文昌',
    亥: '天機',
};

export const BODY_MASTER_SOURCE = verified(`${VERIFIED_NOTE} Keyed by the birth-year branch in iztro as well.`);

/**
 * Where an auxiliary star starts and which way it moves. `basis` is the count it moves by:
 * `hour` counts hour branches from 子 (子 = 0), `month` counts effective lunar months from the first (正月 = 0).
 * `direction` 1 moves with the branch order (子 丑 寅 …), -1 against it.
 */
export type AuxiliaryPlacement = {
    startBranch: Branch;
    direction: 1 | -1;
    basis: 'hour' | 'month';
};

export const AUXILIARY_PLACEMENT: Readonly<Record<AuxiliaryStar, AuxiliaryPlacement>> = {
    文昌: {
        startBranch: '戌',
        direction: -1,
        basis: 'hour',
    },
    文曲: {
        startBranch: '辰',
        direction: 1,
        basis: 'hour',
    },
    左輔: {
        startBranch: '辰',
        direction: 1,
        basis: 'month',
    },
    右弼: {
        startBranch: '戌',
        direction: -1,
        basis: 'month',
    },
};

/** Pending sources for the two auxiliary-star pairs, so each pair can be confirmed on its own. */
export const HOUR_AUXILIARY_SOURCE = verified(`${VERIFIED_NOTE} 文昌 戌 backward and 文曲 辰 forward by hour branch (子 = 0).`);
export const MONTH_AUXILIARY_SOURCE = verified(`${VERIFIED_NOTE} 左輔 辰 forward and 右弼 戌 backward by effective lunar month (正月 = 0).`);

/**
 * 命宮 and 身宮 are found from the effective lunar month and the hour branch: start at 寅 for month 1 and count forward
 * to the birth month; from there count backward by the hour for 命宮 and forward for 身宮 (子 hour = 0).
 */
export const PALACE_ARRANGEMENT = {
    monthOneBranch: '寅',
    lifeDirection: -1,
    bodyDirection: 1,
} as const;

export const PALACE_ARRANGEMENT_SOURCE = verified(`${VERIFIED_NOTE} Same formula as iztro (soul = month - hour, body = month + hour).`);

/**
 * 五行局 from the life palace's stem and branch: stem number (甲乙 1, 丙丁 2, 戊己 3, 庚辛 4, 壬癸 5) plus branch number
 * (子丑午未 1, 寅卯申酉 2, 辰巳戌亥 3), less 5 while it is above 5, gives 1 木 / 2 金 / 3 水 / 4 火 / 5 土.
 */
export const BUREAU_STEM_NUMBER: Readonly<Record<Stem, number>> = {
    甲: 1,
    乙: 1,
    丙: 2,
    丁: 2,
    戊: 3,
    己: 3,
    庚: 4,
    辛: 4,
    壬: 5,
    癸: 5,
};

export const BUREAU_BRANCH_NUMBER: Readonly<Record<Branch, number>> = {
    子: 1,
    丑: 1,
    寅: 2,
    卯: 2,
    辰: 3,
    巳: 3,
    午: 1,
    未: 1,
    申: 2,
    酉: 2,
    戌: 3,
    亥: 3,
};

export const BUREAU_BY_REMAINDER: Readonly<Record<number, { label: string; number: 2 | 3 | 4 | 5 | 6 }>> = {
    1: {
        label: '木三局',
        number: 3,
    },
    2: {
        label: '金四局',
        number: 4,
    },
    3: {
        label: '水二局',
        number: 2,
    },
    4: {
        label: '火六局',
        number: 6,
    },
    5: {
        label: '土五局',
        number: 5,
    },
};

export const FIVE_ELEMENT_BUREAU_SOURCE = verified(`${VERIFIED_NOTE} Cross-check against the 納音 of the life palace's stem and branch (甲子 = 海中金 = 金四局).`);

/**
 * 紫微 from the bureau number n and the lunar day d: find the smallest x >= 0 with (d + x) divisible by n, let q = (d + x) / n,
 * count q palaces forward from 寅 (寅 = 1), then move x palaces back when x is odd and forward when x is even.
 */
export const ZIWEI_POSITION_START_BRANCH = '寅';

/** The 紫微 group runs counter-clockwise from 紫微: each star's branch offset from 紫微 (branch-descending is negative). */
export const ZIWEI_GROUP_OFFSETS: Readonly<Record<'紫微' | '天機' | '太陽' | '武曲' | '天同' | '廉貞', number>> = {
    紫微: 0,
    天機: -1,
    太陽: -3,
    武曲: -4,
    天同: -5,
    廉貞: -8,
};

/** 天府 sits opposite 紫微 across the 寅–申 axis. */
export const TIANFU_MIRROR_AXIS_BRANCH = '寅';

/** The 天府 group runs clockwise from 天府: each star's branch offset from 天府. */
export const TIANFU_GROUP_OFFSETS: Readonly<Record<'天府' | '太陰' | '貪狼' | '巨門' | '天相' | '天梁' | '七殺' | '破軍', number>> = {
    天府: 0,
    太陰: 1,
    貪狼: 2,
    巨門: 3,
    天相: 4,
    天梁: 5,
    七殺: 6,
    破軍: 10,
};

export const ZIWEI_POSITION_SOURCE = verified(`${VERIFIED_NOTE} Spot-checked: 水二局初一 丑, 木三局初一 辰, 金四局初一 亥, 土五局初一 午, 火六局初一 酉.`);
export const MAIN_STAR_PLACEMENT_SOURCE = verified(`${VERIFIED_NOTE} 紫微 in 子 gives 天機亥 太陽酉 武曲申 天同未 廉貞辰 天府辰 太陰巳 貪狼午 巨門未 天相申 天梁酉 七殺戌 破軍寅.`);

/**
 * The 34 fixed-content keys of the Zi Wei readings: one per main star (`star_<name>`), auxiliary star (`aux_<name>`),
 * palace (`palace_<name>`) and 四化 (`transformation_<祿|權|科|忌>`). Readings of the life and body palaces are put together
 * from these by rules; there is no star × palace content.
 */
export function ziweiContentKeys(): string[] {
    return [
        ...MAIN_STARS.map((star) => `star_${star}`),
        ...AUXILIARY_STARS.map((star) => `aux_${star}`),
        ...PALACES.map((palace) => `palace_${palace}`),
        ...TRANSFORMATIONS.map((transformation) => `transformation_${transformation}`),
    ];
}

/**
 * Whether the entry points to Zi Wei (home page and report pages) are shown. Off until the readings are reviewed and
 * imported and the chart and reports have been tried by hand; turning it off again is the whole rollback.
 */
export const ZIWEI_ENTRY_ENABLED = true;
