import {
    describe, expect, it,
} from 'vitest';
import {
    BRANCHES,
    BRANCH_CLASHES,
    BRANCH_COMBINES,
    BRANCH_ZODIAC,
    LIFE_STAGES,
    LIFE_STAGE_START,
    NAYIN_ELEMENT_OF_CHAR,
    NAYIN_NAMES,
    SEASON_OF_BRANCH,
    STEMS,
    STEM_COMBINES,
} from '../../constants/bazi';
import {
    computeFacts,
    findRelations,
    lifeStageOf,
    mingGongOf,
    nayinOf,
    taiYuanOf,
    voidBranchesOf,
    yueJiangOf,
} from './facts';
import {
    branchIndex, ganzhiFromIndex, ganzhiLabel,
} from './ganzhi';
import { calculatePillars } from './pillars';

function factsOf(birthDate: string, birthTime: string | null) {
    const instant = new Date(`${birthDate}T${birthTime ?? '12:00'}:00+08:00`);
    const pillars = calculatePillars({
        birthDate,
        birthTime,
        standardOffsetMinutes: 480,
        instant,
    });

    return computeFacts(pillars, instant);
}

describe('reference chart 1989-10-27 06:00 (己巳 甲戌 庚申 己卯)', () => {
    const facts = factsOf('1989-10-27', '06:00');

    it('gives the 地勢 of the day master in each branch', () => {
        expect(facts.stages.map((item) => item.stage)).toEqual([
            '長生',
            '衰',
            '臨官',
            '胎',
        ]);
    });

    it('gives the 自坐 of each pillar stem in its own branch', () => {
        expect(facts.ownStages.map((item) => item.stage)).toEqual([
            '帝旺',
            '養',
            '臨官',
            '病',
        ]);
    });

    it('gives each pillar its own 旬空 and finds none of the other branches in the day pillar\'s', () => {
        expect(facts.voids.map((item) => item.branches.join(''))).toEqual([
            '戌亥',
            '申酉',
            '子丑',
            '申酉',
        ]);
        expect(facts.dayVoid).toEqual({
            branches: ['子', '丑'], positions: [],
        });
    });

    it('gives the 納音 of the four pillars', () => {
        expect(facts.nayin.map((item) => item.name)).toEqual([
            '大林木',
            '山頭火',
            '石榴木',
            '城頭土',
        ]);
        expect(facts.nayin.map((item) => item.element)).toEqual([
            'wood',
            'fire',
            'wood',
            'earth',
        ]);
    });

    it('gives 命宮 丁卯 and 胎元 乙丑', () => {
        expect(ganzhiLabel(facts.mingGong!)).toBe('丁卯');
        expect(ganzhiLabel(facts.taiYuan)).toBe('乙丑');
    });

    it('gives the zodiac, yin year, term and season at birth', () => {
        expect(facts.zodiac).toBe('蛇');
        expect(facts.yearPolarity).toBe('YIN');
        expect(facts.solarTerm).toBe('霜降');
        expect(facts.season).toBe('秋');
    });

    it('lists the combinations, the punishment and the break, and no clash', () => {
        expect(facts.relations).toEqual([
            {
                kind: 'STEM_COMBINE', pair: '甲己', positions: ['year', 'month'],
            },
            {
                kind: 'BRANCH_COMBINE', pair: '巳申', positions: ['year', 'day'],
            },
            {
                kind: 'BRANCH_PUNISH', pair: '巳申', positions: ['year', 'day'],
            },
            {
                kind: 'BRANCH_BREAK', pair: '巳申', positions: ['year', 'day'],
            },
            {
                kind: 'STEM_COMBINE', pair: '甲己', positions: ['month', 'hour'],
            },
            {
                kind: 'BRANCH_COMBINE', pair: '卯戌', positions: ['month', 'hour'],
            },
        ]);
    });
});

describe('without a birth time', () => {
    it('has no 命宮 and no hour entries, but still has 胎元', () => {
        const facts = factsOf('1989-10-27', null);

        expect(facts.mingGong).toBeNull();
        expect(ganzhiLabel(facts.taiYuan)).toBe('乙丑');
        expect(facts.stages).toHaveLength(3);
        expect(facts.nayin).toHaveLength(3);
    });
});

describe('a clash and the day-void rule', () => {
    it('lists a 六合 between two pillars', () => {
        // 2024-02-29 08:30 is 甲辰 丙寅 癸亥 丙辰: 寅 and 亥 combine, and no branches clash
        const facts = factsOf('2024-02-29', '08:30');

        expect(facts.relations.some((item) => item.kind === 'BRANCH_COMBINE' && item.pair === '寅亥')).toBe(true);
        expect(facts.relations.some((item) => item.kind === 'BRANCH_CLASH')).toBe(false);
    });

    it('lists a 六沖 between two pillars', () => {
        // 2000-01-01 12:00 is 己卯 丙子 戊午 戊午: the 子 month clashes with both 午
        const clashes = factsOf('2000-01-01', '12:00').relations.filter((item) => item.kind === 'BRANCH_CLASH');

        expect(clashes).toEqual([
            {
                kind: 'BRANCH_CLASH', pair: '子午', positions: ['month', 'day'],
            }, {
                kind: 'BRANCH_CLASH', pair: '子午', positions: ['month', 'hour'],
            },
        ]);
    });

    it('marks the pillars whose branch is in the day pillar\'s void', () => {
        // 2000-01-01 12:00 is 己卯 丙子 戊午 戊午; 戊午 sits in the 甲寅 span whose void is 子丑
        const facts = factsOf('2000-01-01', '12:00');

        expect(facts.dayVoid.branches).toEqual(['子', '丑']);
        expect(facts.dayVoid.positions).toEqual(['month']);
    });
});

describe('table completeness', () => {
    it('gives every stem twelve distinct life stages around the twelve branches', () => {
        expect(Object.keys(LIFE_STAGE_START)).toHaveLength(10);

        for (const stem of STEMS) {
            const stages = BRANCHES.map((branch) => lifeStageOf(stem, branch));

            expect(new Set(stages).size).toBe(12);
            expect(lifeStageOf(stem, LIFE_STAGE_START[stem])).toBe('長生');
        }
    });

    it('runs yang stems forward and yin stems backward', () => {
        expect(LIFE_STAGES.map((_, i) => lifeStageOf('庚', BRANCHES[(branchIndex('巳') + i) % 12]!))).toEqual([...LIFE_STAGES]);
        expect(LIFE_STAGES.map((_, i) => lifeStageOf('乙', BRANCHES[(branchIndex('午') - i + 12) % 12]!))).toEqual([...LIFE_STAGES]);
        // 乙 reaches 臨官 at 卯 and 帝旺 at 寅
        expect(lifeStageOf('乙', '卯')).toBe('臨官');
        expect(lifeStageOf('乙', '寅')).toBe('帝旺');
    });

    it('has thirty distinct 納音 whose last character is an element', () => {
        expect(NAYIN_NAMES).toHaveLength(30);
        expect(new Set(NAYIN_NAMES).size).toBe(30);

        for (const name of NAYIN_NAMES) {
            expect(NAYIN_ELEMENT_OF_CHAR[name.slice(-1)]).toBeDefined();
        }

        expect(nayinOf(ganzhiFromIndex(0)).name).toBe('海中金');
        expect(nayinOf(ganzhiFromIndex(1)).name).toBe('海中金');
        expect(nayinOf(ganzhiFromIndex(59)).name).toBe('大海水');
    });

    it('leaves exactly two branches empty in every ten-day span', () => {
        for (let span = 0; span < 6; span++) {
            const used = new Set<string>();

            for (let i = 0; i < 10; i++) {
                used.add(ganzhiFromIndex(span * 10 + i).branch);
            }

            const [first, second] = voidBranchesOf(ganzhiFromIndex(span * 10));

            expect(used.size).toBe(10);
            expect(used.has(first)).toBe(false);
            expect(used.has(second)).toBe(false);

            for (let i = 0; i < 10; i++) {
                expect(voidBranchesOf(ganzhiFromIndex(span * 10 + i))).toEqual([first, second]);
            }
        }
    });

    it('uses each stem once in the combine table, each branch once in the combine and the clash tables', () => {
        expect(STEM_COMBINES.flat().sort()).toEqual([...STEMS].sort());
        expect(BRANCH_COMBINES.flat().sort()).toEqual([...BRANCHES].sort());
        expect(BRANCH_CLASHES.flat().sort()).toEqual([...BRANCHES].sort());

        for (const [a, b] of BRANCH_CLASHES) {
            expect(Math.abs(branchIndex(a) - branchIndex(b))).toBe(6);
        }
    });

    it('has a zodiac animal and a season for every branch, three branches per season', () => {
        expect(Object.keys(BRANCH_ZODIAC)).toHaveLength(12);
        expect(new Set(Object.values(BRANCH_ZODIAC)).size).toBe(12);

        const bySeason = new Map<string, number>();

        for (const season of Object.values(SEASON_OF_BRANCH)) {
            bySeason.set(season, (bySeason.get(season) ?? 0) + 1);
        }

        expect([...bySeason.values()]).toEqual([
            3,
            3,
            3,
            3,
        ]);
    });
});

describe('formulas', () => {
    it('derives 胎元 from the month pillar', () => {
        expect(ganzhiLabel(taiYuanOf({
            stem: '甲', branch: '戌',
        }))).toBe('乙丑');
        expect(ganzhiLabel(taiYuanOf({
            stem: '癸', branch: '丑',
        }))).toBe('甲辰');
    });

    it('derives 命宮 by laying the 月將 on the hour branch and reading off 卯', () => {
        // Two printed charts: 己 year, 月將 卯, 卯 hour -> 丁卯; 癸 year, 月將 辰, 寅 hour -> 丁巳
        expect(ganzhiLabel(mingGongOf('己', '卯', '卯'))).toBe('丁卯');
        expect(ganzhiLabel(mingGongOf('癸', '辰', '寅'))).toBe('丁巳');
        // The 月將 on the hour branch itself leaves 卯 carrying the 月將 moved by the distance from the hour to 卯
        expect(mingGongOf('甲', '子', '子').branch).toBe('卯');
        // The index wraps round: 月將 子 on the 寅 hour, 卯 is one step on from 寅, so it carries 丑
        expect(mingGongOf('甲', '子', '寅').branch).toBe('丑');
    });

    it('takes the 月將 from the last 中氣, not from the 節 that starts the month', () => {
        // 戌 month (寒露 to 立冬): 辰 until 霜降 (about 10-23), 卯 after it
        expect(yueJiangOf(new Date('1989-10-15T12:00:00+08:00'))).toBe('辰');
        expect(yueJiangOf(new Date('1989-10-27T06:00:00+08:00'))).toBe('卯');
        // 酉 month (白露 to 寒露): 辰 from 秋分 (about 9-23), and before it 處暑 gives 巳
        expect(yueJiangOf(new Date('1983-09-25T04:00:00+08:00'))).toBe('辰');
        expect(yueJiangOf(new Date('1983-09-12T12:00:00+08:00'))).toBe('巳');
    });
});

describe('relations between branches', () => {
    const pillar = (stem: string, branch: string) => ({
        stem: stem as never, branch: branch as never,
    });
    // The stems are chosen so that none of them combine, which leaves the branches to speak
    const relationsOf = (branches: [string, string, string, string | null]) => findRelations({
        year: pillar('甲', branches[0]),
        month: pillar('丙', branches[1]),
        day: pillar('戊', branches[2]),
        hour: branches[3] ? pillar('庚', branches[3]) : null,
    });
    const kindsOf = (branches: [string, string, string, string | null], kind: string) => relationsOf(branches).filter((item) => item.kind === kind);

    it('lists a whole 三合 once, with the three pillars and the element, and no halves', () => {
        const relations = relationsOf([
            '申',
            '子',
            '辰',
            '寅',
        ]);

        expect(relations.filter((item) => item.kind === 'BRANCH_TRIAD')).toEqual([
            {
                kind: 'BRANCH_TRIAD', pair: '申子辰', positions: [
                    'year',
                    'month',
                    'day',
                ], element: 'water',
            },
        ]);
        expect(relations.some((item) => item.kind === 'BRANCH_HALF_TRIAD' && item.element === 'water')).toBe(false);
    });

    it('lists a 半合 only when it holds the middle branch', () => {
        expect(kindsOf([
            '子',
            '辰',
            '午',
            '午',
        ], 'BRANCH_HALF_TRIAD')).toEqual([
            {
                kind: 'BRANCH_HALF_TRIAD', pair: '子辰', positions: ['year', 'month'], element: 'water',
            },
        ]);
        // 申 and 辰 are both of the water triad, but without 子 they are no 半合
        expect(kindsOf([
            '申',
            '辰',
            '午',
            '午',
        ], 'BRANCH_HALF_TRIAD').filter((item) => item.element === 'water')).toEqual([]);
    });

    it('lists a 三會 only when all three branches of a season are there', () => {
        expect(kindsOf([
            '寅',
            '卯',
            '辰',
            '午',
        ], 'BRANCH_MEETING')).toEqual([
            {
                kind: 'BRANCH_MEETING', pair: '寅卯辰', positions: [
                    'year',
                    'month',
                    'day',
                ], element: 'wood',
            },
        ]);
        expect(kindsOf([
            '寅',
            '卯',
            '午',
            '午',
        ], 'BRANCH_MEETING')).toEqual([]);
    });

    it('lists 刑 between different branches of a group, and 自刑 for the same branch twice', () => {
        expect(kindsOf([
            '寅',
            '巳',
            '子',
            '午',
        ], 'BRANCH_PUNISH').map((item) => item.pair)).toEqual(['寅巳']);
        expect(kindsOf([
            '子',
            '卯',
            '丑',
            '午',
        ], 'BRANCH_PUNISH').map((item) => item.pair)).toEqual(['子卯']);
        expect(kindsOf([
            '辰',
            '子',
            '辰',
            '午',
        ], 'BRANCH_SELF_PUNISH')).toEqual([
            {
                kind: 'BRANCH_SELF_PUNISH', pair: '辰辰', positions: ['year', 'day'],
            },
        ]);
        // 子 twice is no 自刑
        expect(kindsOf([
            '子',
            '子',
            '丑',
            '寅',
        ], 'BRANCH_SELF_PUNISH')).toEqual([]);
    });

    it('lists 破 and 害 for each of their pairs', () => {
        expect(kindsOf([
            '子',
            '酉',
            '寅',
            '辰',
        ], 'BRANCH_BREAK').map((item) => item.pair)).toEqual(['子酉']);
        expect(kindsOf([
            '子',
            '未',
            '寅',
            '辰',
        ], 'BRANCH_HARM').map((item) => item.pair)).toEqual(['子未']);
    });

    it('lists nothing for pillars with no relation, and works without an hour', () => {
        expect(relationsOf([
            '子',
            '寅',
            '辰',
            null,
        ]).filter((item) => item.kind !== 'BRANCH_HALF_TRIAD')).toEqual([]);
        expect(kindsOf([
            '申',
            '子',
            '辰',
            null,
        ], 'BRANCH_TRIAD')).toHaveLength(1);
    });
});
