import {
    BRANCHES,
    BRANCH_BREAKS,
    BRANCH_CLASHES,
    BRANCH_COMBINES,
    BRANCH_HARMS,
    BRANCH_MEETINGS,
    BRANCH_PUNISHMENTS,
    BRANCH_SELF_PUNISHMENTS,
    BRANCH_TRIADS,
    BRANCH_ZODIAC,
    LIFE_STAGES,
    LIFE_STAGE_START,
    NAYIN_ELEMENT_OF_CHAR,
    NAYIN_NAMES,
    SEASON_OF_BRANCH,
    STEMS,
    STEM_COMBINES,
    TIGER_MONTH_START_STEM,
    YUE_JIANG,
    type Branch,
    type Element,
    type LifeStage,
    type Polarity,
    type Season,
    type Stem,
} from '../../constants/bazi';
import type { PillarPosition } from './analysis';
import {
    branchIndex,
    ganzhiIndex,
    stemIndex,
    stemPolarity,
    type Ganzhi,
} from './ganzhi';
import type { FourPillars } from './pillars';
import { termAround } from './solarTerms';

export type RelationKind =
    | 'STEM_COMBINE'
    | 'BRANCH_COMBINE'
    | 'BRANCH_CLASH'
    /** 三合: all three branches of a triad are in the chart */
    | 'BRANCH_TRIAD'
    /** 半合: two branches of a triad, one of them the middle branch; not a whole triad */
    | 'BRANCH_HALF_TRIAD'
    | 'BRANCH_MEETING'
    | 'BRANCH_PUNISH'
    | 'BRANCH_SELF_PUNISH'
    | 'BRANCH_BREAK'
    | 'BRANCH_HARM';

export type Relation = {
    kind: RelationKind;
    /** The characters, e.g. 甲己, 卯戌 or 申子辰. */
    pair: string;
    /** The pillars they sit in, in year-to-hour order (two, or three for a 三合 and a 三會). */
    positions: PillarPosition[];
    /** The element a 三合, 半合 or 三會 gathers. */
    element?: Element;
};

export type NayinInfo = {
    name: string;
    element: Element;
};

export type ChartFacts = {
    /** Life stage of the day stem in each pillar's branch (地勢). */
    stages: Array<{ position: PillarPosition; stage: LifeStage }>;
    /** Life stage of each pillar's own stem in its own branch (自坐). */
    ownStages: Array<{ position: PillarPosition; stage: LifeStage }>;
    /** The two empty branches (空亡) of the ten-day span each pillar belongs to. */
    voids: Array<{ position: PillarPosition; branches: [Branch, Branch] }>;
    /** The day pillar's empty branches and the other pillars whose branch falls in them. */
    dayVoid: { branches: [Branch, Branch]; positions: PillarPosition[] };
    nayin: Array<{ position: PillarPosition } & NayinInfo>;
    /** Null when the birth time is unknown. */
    mingGong: Ganzhi | null;
    taiYuan: Ganzhi;
    zodiac: string;
    /** Polarity of the year stem. */
    yearPolarity: Polarity;
    /** The solar term (any of the 24) the birth falls in, and the season of the month. */
    solarTerm: string;
    season: Season;
    relations: Relation[];
};

const POSITIONS: readonly PillarPosition[] = [
    'year',
    'month',
    'day',
    'hour',
];

/** Life stage of a stem at a branch. */
export function lifeStageOf(stem: Stem, branch: Branch): LifeStage {
    const start = branchIndex(LIFE_STAGE_START[stem]);
    const offset = branchIndex(branch) - start;
    const steps = stemPolarity(stem) === 'YANG' ? offset : -offset;

    return LIFE_STAGES[((steps % 12) + 12) % 12] as LifeStage;
}

/** 納音 of a sexagenary pair. */
export function nayinOf(pair: Ganzhi): NayinInfo {
    const name = NAYIN_NAMES[Math.floor(ganzhiIndex(pair) / 2)] as string;

    return {
        name,
        element: NAYIN_ELEMENT_OF_CHAR[name.slice(-1)] as Element,
    };
}

/** The two branches left out of the ten-day span (旬) that starts with the pair's 甲 day. */
export function voidBranchesOf(pair: Ganzhi): [Branch, Branch] {
    const spanStart = Math.floor(ganzhiIndex(pair) / 10) * 10;
    const startBranch = spanStart % 12;

    return [BRANCHES[(startBranch + 10) % 12] as Branch, BRANCHES[(startBranch + 11) % 12] as Branch];
}

/**
 * 月將: the branch of the Sun's sign, which changes at each 中氣 (not at each 節 like the month). It is the one of the
 * last 中氣 the Sun has passed, so the 命宮 follows the Sun through the month.
 */
export function yueJiangOf(instant: Date): Branch {
    const {
        current, previous, 
    } = termAround(instant);
    const zhongQi = current.monthBranch === null ? current : previous;
    const branch = YUE_JIANG[zhongQi.name];

    if (!branch) throw new Error(`No 月將 for the term ${zhongQi.name}`);

    return branch;
}

const MAO_INDEX = 3;

/**
 * 命宮 by 月將加時: lay the 月將 on the hour branch and read off which branch stands at 卯, the rising point.
 * The stem follows the year stem by 五虎遁, counted from 寅.
 */
export function mingGongOf(yearStem: Stem, yueJiang: Branch, hourBranch: Branch): Ganzhi {
    const branchAtMao = (branchIndex(yueJiang) + MAO_INDEX - branchIndex(hourBranch) + 12) % 12;
    const fromYin = (branchAtMao - branchIndex('寅') + 12) % 12;
    const startStem = TIGER_MONTH_START_STEM[stemIndex(yearStem) % 5] as Stem;

    return {
        stem: STEMS[(stemIndex(startStem) + fromYin) % 10] as Stem,
        branch: BRANCHES[branchAtMao] as Branch,
    };
}

/** 胎元: one stem after the month stem and three branches after the month branch. */
export function taiYuanOf(month: Ganzhi): Ganzhi {
    return {
        stem: STEMS[(stemIndex(month.stem) + 1) % 10] as Stem,
        branch: BRANCHES[(branchIndex(month.branch) + 3) % 12] as Branch,
    };
}

type PillarSet = Pick<FourPillars, 'year' | 'month' | 'day' | 'hour'>;

function presentPillars(pillars: PillarSet) {
    return POSITIONS.flatMap((position) => {
        const pillar = pillars[position];

        return pillar ? [
            {
                position, pillar,
            },
        ] : [];
    });
}

const inGroup = (group: readonly Branch[], first: Branch, second: Branch) => first !== second && group.includes(first) && group.includes(second);
const isPair = (list: ReadonlyArray<readonly [Branch, Branch]>, first: Branch, second: Branch) => list.some(([x, y]) => (x === first && y === second) || (x === second && y === first));

/** The first pillar (year to hour) that holds a branch. */
function positionOfBranch(present: ReturnType<typeof presentPillars>, branch: Branch): PillarPosition | undefined {
    return present.find(({ pillar }) => pillar.branch === branch)?.position;
}

/** 三合, 半合 and 三會: groups of branches, each shown once with the pillars they sit in. */
function findGroups(present: ReturnType<typeof presentPillars>): Relation[] {
    const relations: Relation[] = [];
    const order = (positions: Array<PillarPosition | undefined>): PillarPosition[] => POSITIONS.filter((position) => positions.includes(position));

    for (const triad of BRANCH_TRIADS) {
        const found = triad.branches.map((branch) => positionOfBranch(present, branch));

        if (found.every((position) => position !== undefined)) {
            relations.push({
                kind: 'BRANCH_TRIAD', pair: triad.branches.join(''), positions: order(found), element: triad.element,
            });
            continue;
        }

        // A half needs the middle branch; the whole triad would have been listed above
        const centerPosition = positionOfBranch(present, triad.center);

        if (centerPosition === undefined) continue;

        for (const branch of triad.branches.filter((item) => item !== triad.center)) {
            const other = positionOfBranch(present, branch);

            if (other === undefined) continue;

            const pair = triad.branches.filter((item) => item === triad.center || item === branch).join('');

            relations.push({
                kind: 'BRANCH_HALF_TRIAD', pair, positions: order([centerPosition, other]), element: triad.element,
            });
        }
    }

    for (const meeting of BRANCH_MEETINGS) {
        const found = meeting.branches.map((branch) => positionOfBranch(present, branch));

        if (found.every((position) => position !== undefined)) {
            relations.push({
                kind: 'BRANCH_MEETING', pair: meeting.branches.join(''), positions: order(found), element: meeting.element,
            });
        }
    }

    return relations;
}

export function findRelations(pillars: PillarSet): Relation[] {
    const present = presentPillars(pillars);
    const relations: Relation[] = [];

    for (let i = 0; i < present.length; i++) {
        for (let j = i + 1; j < present.length; j++) {
            const a = present[i]!;
            const b = present[j]!;
            const positions: PillarPosition[] = [a.position, b.position];
            const stems = [a.pillar.stem, b.pillar.stem];
            const branches = [a.pillar.branch, b.pillar.branch] as const;
            const [first, second] = branches;

            const stemMatch = STEM_COMBINES.find(([x, y]) => stems.includes(x) && stems.includes(y));

            if (stemMatch) {
                relations.push({
                    kind: 'STEM_COMBINE', pair: stemMatch.join(''), positions,
                });
            }

            const combine = BRANCH_COMBINES.find(([x, y]) => branches.includes(x) && branches.includes(y));

            if (combine) {
                relations.push({
                    kind: 'BRANCH_COMBINE', pair: combine.join(''), positions,
                });
            }

            const clash = BRANCH_CLASHES.find(([x, y]) => branches.includes(x) && branches.includes(y));

            if (clash) {
                relations.push({
                    kind: 'BRANCH_CLASH', pair: clash.join(''), positions,
                });
            }

            if (BRANCH_PUNISHMENTS.some((group) => inGroup(group, first, second))) {
                relations.push({
                    kind: 'BRANCH_PUNISH', pair: `${first}${second}`, positions,
                });
            }

            if (first === second && BRANCH_SELF_PUNISHMENTS.includes(first)) {
                relations.push({
                    kind: 'BRANCH_SELF_PUNISH', pair: `${first}${second}`, positions,
                });
            }

            if (isPair(BRANCH_BREAKS, first, second)) {
                relations.push({
                    kind: 'BRANCH_BREAK', pair: `${first}${second}`, positions,
                });
            }

            if (isPair(BRANCH_HARMS, first, second)) {
                relations.push({
                    kind: 'BRANCH_HARM', pair: `${first}${second}`, positions,
                });
            }
        }
    }

    return [...relations, ...findGroups(present)];
}

/** Deterministic chart facts; only facts, no judgement of good or bad. */
export function computeFacts(pillars: FourPillars, instant: Date): ChartFacts {
    const dayStem = pillars.day.stem;
    const present = presentPillars(pillars);
    const dayVoidBranches = voidBranchesOf(pillars.day);
    const monthBranch = pillars.month.branch;

    return {
        stages: present.map(({
            position, pillar,
        }) => ({
            position, stage: lifeStageOf(dayStem, pillar.branch),
        })),
        ownStages: present.map(({
            position, pillar,
        }) => ({
            position, stage: lifeStageOf(pillar.stem, pillar.branch),
        })),
        voids: present.map(({
            position, pillar,
        }) => ({
            position, branches: voidBranchesOf(pillar),
        })),
        dayVoid: {
            branches: dayVoidBranches,
            positions: present
                .filter(({
                    position, pillar,
                }) => position !== 'day' && dayVoidBranches.includes(pillar.branch))
                .map(({ position }) => position),
        },
        nayin: present.map(({
            position, pillar,
        }) => ({
            position, ...nayinOf(pillar),
        })),
        mingGong: pillars.hour ? mingGongOf(pillars.year.stem, yueJiangOf(instant), pillars.hour.branch) : null,
        taiYuan: taiYuanOf(pillars.month),
        zodiac: BRANCH_ZODIAC[pillars.year.branch],
        yearPolarity: stemPolarity(pillars.year.stem),
        solarTerm: termAround(instant).current.name,
        season: SEASON_OF_BRANCH[monthBranch],
        relations: findRelations(pillars),
    };
}
