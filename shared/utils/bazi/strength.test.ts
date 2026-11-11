import {
    describe, expect, it,
} from 'vitest';
import {
    ELEMENTS,
    HIDDEN_STEM_SHARES,
    HIDDEN_STEMS,
    PATTERN_KEYS,
    PATTERN_OF_TEN_GOD,
    STRENGTH_LEVELS,
    STRENGTH_WEIGHTS,
    TEN_GODS,
    BRANCHES,
} from '../../constants/bazi';
import { calculatePillars } from './pillars';
import {
    analyzeStrength, elementPhases, strengthLevelOf, usefulSetOf,
} from './strength';

function strengthAt(birthDate: string, birthTime: string | null) {
    return analyzeStrength(calculatePillars({
        birthDate,
        birthTime,
        standardOffsetMinutes: 480,
        instant: new Date(`${birthDate}T${birthTime ?? '12:00'}:00+08:00`),
    }));
}

describe('reference chart 2049-10-12 06:00 (己巳 甲戌 庚申 己卯)', () => {
    const result = strengthAt('2049-10-12', '06:00');

    it('scores about 68 and judges 身強', () => {
        expect(result.score).toBe(67.6);
        expect(result.level).toBe('strong');
        expect(result.side).toBe('STRONG');
    });

    it('shows where the score comes from', () => {
        const points = Object.fromEntries(result.parts.map((part) => [part.source, part.points]));

        expect(points).toEqual({
            yearStem: 8,
            monthStem: 0,
            hourStem: 12,
            yearBranch: 3.2,
            monthBranch: 36,
            dayBranch: 8.4,
            hourBranch: 0,
        });
    });

    it('gives the pattern 偏印格 in the 印 group', () => {
        expect(result.pattern).toEqual({
            key: '偏印', tenGod: '偏印', group: 'resource', revealed: [],
        });
    });

    it('takes 食傷 as 用神, 官殺 as 喜神 and avoids 比劫 and 印, as the printed chart does (水 火 and 金 土)', () => {
        expect(result.useful).toMatchObject({
            useful: 'output', favorable: ['power'], avoid: ['peer', 'resource'],
        });
    });

    it('has no 仇神 (財 feeds neither 金 nor 土) and leaves 財 as 閒神', () => {
        expect(result.useful?.rival).toEqual([]);
        expect(result.useful?.idle).toEqual(['wealth']);
    });

    it('shows no 透干 when none of 戊辛丁 stands in the year, month or hour stem', () => {
        expect(result.pattern.revealed).toEqual([]);
    });

    it('gives 土旺 金相 火休 木囚 水死 for a 戌 month', () => {
        expect(result.phases).toEqual({
            earth: '旺', metal: '相', fire: '休', wood: '囚', water: '死',
        });
    });
});

describe('strength levels', () => {
    it.each([
        [100, 'taiwang'],
        [75, 'taiwang'],
        [74.9, 'strong'],
        [55, 'strong'],
        [54.9, 'balanced'],
        [45, 'balanced'],
        [44.9, 'weak'],
        [30, 'weak'],
        [29.9, 'taiwei'],
        [0, 'taiwei'],
    ])('score %f is %s', (score, level) => {
        expect(strengthLevelOf(score)).toBe(level);
    });
});

describe('element phases', () => {
    it('gives each element a different phase for every month element', () => {
        for (const month of ELEMENTS) {
            const phases = elementPhases(month);

            expect(new Set(Object.values(phases)).size).toBe(5);
            expect(phases[month]).toBe('旺');
        }
    });

    it('gives 木 month: 木旺 火相 水休 金囚 土死', () => {
        expect(elementPhases('wood')).toEqual({
            wood: '旺', fire: '相', water: '休', metal: '囚', earth: '死',
        });
    });
});

describe('balanced charts', () => {
    it('list no useful gods', () => {
        // Walk forward from a fixed date until a balanced chart turns up, so the test stays deterministic
        let found = null;

        for (let day = 0; day < 4000 && !found; day++) {
            const date = new Date(Date.UTC(2000, 0, 1) + day * 86400000).toISOString().slice(0, 10);
            const result = strengthAt(date, '10:00');

            if (result.level === 'balanced') found = result;
        }

        expect(found).not.toBeNull();
        expect(found!.side).toBe('BALANCED');
        expect(found!.useful).toBeNull();
        expect(found!.score).toBeGreaterThanOrEqual(45);
        expect(found!.score).toBeLessThan(55);
    });
});

describe('unknown birth time', () => {
    it('scales the score to the characters that are known and stays within 0 to 100', () => {
        const result = strengthAt('2049-10-12', null);

        expect(result.parts).toHaveLength(5);
        expect(result.parts.reduce((total, part) => total + part.weight, 0)).toBe(80);
        expect(result.score).toBeGreaterThanOrEqual(0);
        expect(result.score).toBeLessThanOrEqual(100);
        // 8 + 0 + 3.2 + 36 + 8.4 = 55.6 of 80 -> 69.5
        expect(result.score).toBe(69.5);
    });
});

describe('table completeness', () => {
    it('has weights adding to 100', () => {
        expect(Object.values(STRENGTH_WEIGHTS).reduce((total, weight) => total + weight, 0)).toBe(100);
    });

    it('has hidden-stem shares adding to ten for every branch', () => {
        for (const branch of BRANCHES) {
            const shares = HIDDEN_STEM_SHARES[HIDDEN_STEMS[branch].length as 1 | 2 | 3];

            expect(shares).toHaveLength(HIDDEN_STEMS[branch].length);
            expect(shares.reduce((total, share) => total + share, 0)).toBe(10);
        }
    });

    it('has five levels and ten patterns, one pattern per ten god', () => {
        expect(STRENGTH_LEVELS).toHaveLength(5);
        expect(PATTERN_KEYS).toHaveLength(10);
        expect(TEN_GODS.map((god) => PATTERN_OF_TEN_GOD[god]).sort()).toEqual([...PATTERN_KEYS].sort());
    });
});

describe('a hidden stem of the month that shows above (透干)', () => {
    it('lists the main-qi stem and where it shows', () => {
        // 2001-11-05 10:00 is 辛巳 戊戌 壬申 乙巳: 戌 hides 戊 辛 丁, and 戊 is the month stem, 辛 the year stem
        const { revealed } = strengthAt('2001-11-05', '10:00').pattern;

        expect(revealed).toEqual([
            {
                stem: '戊', role: 'MAIN', tenGod: '七殺', positions: ['month'],
            }, {
                stem: '辛', role: 'MIDDLE', tenGod: '正印', positions: ['year'],
            },
        ]);
    });

    it('lists a residual stem that shows in two places', () => {
        // 1995-07-20 10:00 is 乙亥 癸未 壬子 乙巳: 未 hides 己 丁 乙, and 乙 shows in the year and the hour
        const { revealed } = strengthAt('1995-07-20', '10:00').pattern;

        expect(revealed).toEqual([
            {
                stem: '乙', role: 'RESIDUAL', tenGod: '傷官', positions: ['year', 'hour'],
            },
        ]);
    });
});

describe('喜用神 from the power of the elements', () => {
    it('matches a second printed chart: 丙 day master, 身弱, 用神 火 and 喜神 木, avoiding 金', () => {
        // 癸亥 辛酉 丙辰 庚寅: 火 7 and 木 10 are below an even share of 12, 金 26 is far above it
        const {
            useful, side, 
        } = strengthAt('2043-09-10', '04:00');

        expect(side).toBe('WEAK');
        expect(useful).toMatchObject({
            useful: 'peer', favorable: ['resource'], avoid: ['wealth'],
        });
        // 土 (食傷) feeds 金, so it is 仇神; 水 (官殺) is what is left
        expect(useful?.rival).toEqual(['output']);
        expect(useful?.idle).toEqual(['power']);
    });

    it('splits the five groups between the five names, once each, on any chart', () => {
        for (const date of [
            '1995-03-10',
            '1995-07-20',
            '2001-11-05',
            '1988-12-15',
            '1990-05-20',
            '2043-09-10',
            '2049-10-12',
        ]) {
            const {
                useful, side, 
            } = strengthAt(date, '10:00');

            if (!useful) continue;

            const named = [
                useful.useful,
                ...useful.favorable,
                ...useful.avoid,
                ...useful.rival,
                ...useful.idle,
            ];

            expect(new Set(named).size, date).toBe(named.length);
            expect(named, date).toHaveLength(5);
            // The helpful camp is 比劫 and 印 for a weak chart and the other three for a strong one
            const helping = ['peer', 'resource'];
            const goodCamp = [useful.useful, ...useful.favorable];

            expect(goodCamp.every((group) => helping.includes(group) === (side === 'WEAK')), date).toBe(true);
            expect(useful.avoid.every((group) => helping.includes(group) === (side === 'STRONG')), date).toBe(true);
        }
    });

    it('still names a 用神 and a 忌神 when no group is below or above an even share', () => {
        // A 火 day master, strong: 食傷 (土), 財 (金) and 官殺 (水) all at 20, above the even share of 12
        const power = {
            fire: 0, earth: 20, metal: 20, water: 20, wood: 0,
        };
        const useful = usefulSetOf('fire', 'STRONG', power);

        expect(useful.useful).toBe('output');
        expect(useful.favorable).toEqual([]);
        // 比劫 (火) and 印 (木) are both 0, none above the even share, so the heavier of them is still 忌神
        expect(useful.avoid).toHaveLength(1);
    });
});
