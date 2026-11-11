import {
    describe, expect, it,
} from 'vitest';
import { BRANCHES } from '../../constants/bazi';
import {
    AUXILIARY_STARS,
    MAIN_STARS,
    PALACES,
} from '../../constants/ziwei';
import {
    buildPalaces,
    placeAuxiliaryStars,
    placeMainStars,
    ziweiBranchOf,
} from './stars';

describe('ziweiBranchOf', () => {
    it.each([
        [
            2,
            1,
            '丑',
        ],
        [
            3,
            1,
            '辰',
        ],
        [
            4,
            1,
            '亥',
        ],
        [
            5,
            1,
            '午',
        ],
        [
            6,
            1,
            '酉',
        ],
    ] as const)('puts 紫微 for a %i-局 on day %i at %s', (bureau, day, branch) => {
        expect(ziweiBranchOf(bureau, day)).toBe(branch);
    });

    it('puts 紫微 on 寅 when the day is the bureau number itself', () => {
        expect(ziweiBranchOf(2, 2)).toBe('寅');
        expect(ziweiBranchOf(3, 3)).toBe('寅');
        expect(ziweiBranchOf(5, 5)).toBe('寅');
    });

    it('handles the last day of the month', () => {
        // day 30 on a 5-局: quotient 6, 寅 + 5 = 未
        expect(ziweiBranchOf(5, 30)).toBe('未');
        // day 30 on a 4-局: shortfall 2, quotient 8, 寅 + 7 = 酉, then 2 forward = 亥
        expect(ziweiBranchOf(4, 30)).toBe('亥');
    });

    it('can reach every branch', () => {
        const reached = new Set<string>();

        for (const bureau of [
            2,
            3,
            4,
            5,
            6,
        ]) {
            for (let day = 1; day <= 30; day++) reached.add(ziweiBranchOf(bureau, day));
        }

        expect(reached.size).toBe(12);
    });

    it('rejects a day or bureau out of range', () => {
        expect(() => ziweiBranchOf(3, 0)).toThrow(/Invalid lunar day/);
        expect(() => ziweiBranchOf(3, 31)).toThrow(/Invalid lunar day/);
        expect(() => ziweiBranchOf(7, 1)).toThrow(/Invalid bureau number/);
    });
});

describe('placeMainStars', () => {
    it('places the fourteen stars for 紫微 in 子', () => {
        expect(placeMainStars('子')).toEqual({
            紫微: '子',
            天機: '亥',
            太陽: '酉',
            武曲: '申',
            天同: '未',
            廉貞: '辰',
            天府: '辰',
            太陰: '巳',
            貪狼: '午',
            巨門: '未',
            天相: '申',
            天梁: '酉',
            七殺: '戌',
            破軍: '寅',
        });
    });

    it('puts 天府 opposite 紫微 across the 寅–申 axis', () => {
        expect(placeMainStars('寅').天府).toBe('寅');
        expect(placeMainStars('申').天府).toBe('申');
        expect(placeMainStars('午').天府).toBe('戌');
        expect(placeMainStars('丑').天府).toBe('卯');
    });

    it('places every main star exactly once for each 紫微 position', () => {
        for (const ziwei of BRANCHES) {
            const placed = placeMainStars(ziwei);

            expect(Object.keys(placed).sort()).toEqual([...MAIN_STARS].sort());
        }
    });
});

describe('placeAuxiliaryStars', () => {
    it('places 文昌 and 文曲 by the hour', () => {
        expect(placeAuxiliaryStars(1, '子')).toMatchObject({
            文昌: '戌',
            文曲: '辰',
        });
        expect(placeAuxiliaryStars(1, '丑')).toMatchObject({
            文昌: '酉',
            文曲: '巳',
        });
        expect(placeAuxiliaryStars(1, '亥')).toMatchObject({
            文昌: '亥',
            文曲: '卯',
        });
    });

    it('places 左輔 and 右弼 by the effective lunar month', () => {
        expect(placeAuxiliaryStars(1, '子')).toMatchObject({
            左輔: '辰',
            右弼: '戌',
        });
        expect(placeAuxiliaryStars(2, '子')).toMatchObject({
            左輔: '巳',
            右弼: '酉',
        });
        expect(placeAuxiliaryStars(12, '子')).toMatchObject({
            左輔: '卯',
            右弼: '亥',
        });
    });

    it('moves 文昌 and 文曲 through all twelve branches over the twelve hours', () => {
        const changs = BRANCHES.map((hour) => placeAuxiliaryStars(1, hour).文昌);
        const qus = BRANCHES.map((hour) => placeAuxiliaryStars(1, hour).文曲);

        expect(new Set(changs).size).toBe(12);
        expect(new Set(qus).size).toBe(12);
    });

    it('moves 左輔 and 右弼 through all twelve branches over the twelve months', () => {
        const zuos = Array.from({ length: 12 }, (_, index) => placeAuxiliaryStars(index + 1, '子').左輔);
        const yous = Array.from({ length: 12 }, (_, index) => placeAuxiliaryStars(index + 1, '子').右弼);

        expect(new Set(zuos).size).toBe(12);
        expect(new Set(yous).size).toBe(12);
    });

    it('rejects a month outside 1–12', () => {
        expect(() => placeAuxiliaryStars(0, '子')).toThrow(/Invalid lunar month/);
        expect(() => placeAuxiliaryStars(13, '子')).toThrow(/Invalid lunar month/);
    });
});

describe('buildPalaces', () => {
    const palaces = buildPalaces('寅', placeMainStars('子'), placeAuxiliaryStars(1, '子'));

    it('builds twelve palaces in order from 命宮, one per branch', () => {
        expect(palaces.map((item) => item.palace)).toEqual([...PALACES]);
        expect(new Set(palaces.map((item) => item.branch)).size).toBe(12);
        expect(palaces[0]).toMatchObject({
            palace: '命宮',
            branch: '寅',
        });
        expect(palaces[1]?.branch).toBe('丑');
    });

    it('places every main and auxiliary star in exactly one palace', () => {
        const mains = palaces.flatMap((item) => item.mainStars.map((placement) => placement.star));
        const auxiliaries = palaces.flatMap((item) => item.auxiliaryStars.map((placement) => placement.star));

        expect([...mains].sort()).toEqual([...MAIN_STARS].sort());
        expect([...auxiliaries].sort()).toEqual([...AUXILIARY_STARS].sort());
    });

    it('starts every star without a 四化 mark', () => {
        for (const item of palaces) {
            for (const placement of [...item.mainStars, ...item.auxiliaryStars]) expect(placement.transformation).toBeNull();
        }
    });

    it('marks a palace without main stars as empty and never writes borrowed stars into it', () => {
        const empty = palaces.filter((item) => item.isEmpty);

        // Whatever palaces are empty, the flag must follow the main stars alone
        for (const item of empty) expect(item.mainStars).toEqual([]);

        expect(palaces.filter((item) => item.mainStars.length === 0)).toEqual(empty);
    });

    it('keeps a palace with only an auxiliary star empty', () => {
        const mainStars = placeMainStars('子');
        const onlyAuxiliary = buildPalaces('寅', mainStars, {
            文昌: '卯',
            文曲: '卯',
            左輔: '卯',
            右弼: '卯',
        });
        const target = onlyAuxiliary.find((item) => item.branch === '卯');

        expect(Object.values(mainStars)).not.toContain('卯');
        expect(target?.auxiliaryStars).toHaveLength(4);
        expect(target?.isEmpty).toBe(true);
    });
});
