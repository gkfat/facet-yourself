import {
    describe, expect, it,
} from 'vitest';
import {
    BRANCHES, STEMS,
    type Branch,
} from '../../constants/bazi';
import { PALACES } from '../../constants/ziwei';
import {
    bodyPalaceBranch,
    branchOfPalace,
    fiveElementBureauOf,
    lifePalaceBranch,
    palaceAtBranch,
    palaceStem,
} from './palaces';

describe('lifePalaceBranch and bodyPalaceBranch', () => {
    it('puts month 1 子 hour at 寅 for both palaces', () => {
        expect(lifePalaceBranch(1, '子')).toBe('寅');
        expect(bodyPalaceBranch(1, '子')).toBe('寅');
    });

    it('counts the life palace backward and the body palace forward by the hour', () => {
        // month 1, 寅 hour (2): 寅 - 2 = 子, 寅 + 2 = 辰
        expect(lifePalaceBranch(1, '寅')).toBe('子');
        expect(bodyPalaceBranch(1, '寅')).toBe('辰');
    });

    it('reaches all twelve life-palace branches for the twelve hours of one month', () => {
        const branches = BRANCHES.map((hour) => lifePalaceBranch(5, hour));

        expect(new Set(branches).size).toBe(12);
    });

    it('wraps around the end of the branch ring', () => {
        // month 12 starts at 寅 + 11 = 丑; 子 hour keeps it at 丑
        expect(lifePalaceBranch(12, '子')).toBe('丑');
        expect(lifePalaceBranch(12, '丑')).toBe('子');
        expect(bodyPalaceBranch(12, '丑')).toBe('寅');
    });

    it('puts the body palace on the life palace when the hour is 子', () => {
        for (let month = 1; month <= 12; month++) {
            expect(bodyPalaceBranch(month, '子')).toBe(lifePalaceBranch(month, '子'));
        }
    });

    it('puts the body palace on a different branch for any other hour', () => {
        for (const hour of BRANCHES.filter((branch) => branch !== '子' && branch !== '午')) {
            expect(bodyPalaceBranch(3, hour)).not.toBe(lifePalaceBranch(3, hour));
        }
    });

    it('puts the body palace on the life palace again at the 午 hour', () => {
        // 午 = 6 steps; forward and backward by 6 land on the same branch
        expect(bodyPalaceBranch(3, '午')).toBe(lifePalaceBranch(3, '午'));
    });

    it('rejects a month outside 1–12', () => {
        expect(() => lifePalaceBranch(0, '子')).toThrow(/Invalid lunar month/);
        expect(() => bodyPalaceBranch(13, '子')).toThrow(/Invalid lunar month/);
        expect(() => lifePalaceBranch(1.5, '子')).toThrow(/Invalid lunar month/);
    });
});

describe('palace order', () => {
    it('runs counter-clockwise from the life palace', () => {
        expect(palaceAtBranch('寅', '寅')).toBe('命宮');
        expect(palaceAtBranch('丑', '寅')).toBe('兄弟');
        expect(palaceAtBranch('卯', '寅')).toBe('父母');
    });

    it('is its own inverse with branchOfPalace for every life branch', () => {
        for (const life of BRANCHES) {
            for (const palace of PALACES) {
                expect(palaceAtBranch(branchOfPalace(palace, life), life)).toBe(palace);
            }
        }
    });
});

describe('palaceStem', () => {
    it('starts the 寅 palace at the 五虎遁 stem', () => {
        const expected = {
            甲: '丙',
            乙: '戊',
            丙: '庚',
            丁: '壬',
            戊: '甲',
            己: '丙',
            庚: '戊',
            辛: '庚',
            壬: '壬',
            癸: '甲',
        } as const;

        for (const stem of STEMS) expect(palaceStem(stem, '寅')).toBe(expected[stem]);
    });

    it('advances one stem per branch and wraps through 子 and 丑', () => {
        // 甲 year: 寅丙 卯丁 辰戊 巳己 午庚 未辛 申壬 酉癸 戌甲 亥乙 子丙 丑丁
        expect(palaceStem('甲', '子')).toBe('丙');
        expect(palaceStem('甲', '丑')).toBe('丁');
        expect(palaceStem('甲', '午')).toBe('庚');
    });
});

describe('fiveElementBureauOf', () => {
    // 納音 of the sexagenary cycle gives the 局: 水二 木三 金四 土五 火六 (check values from the 納音 table)
    it.each([
        [
            '甲',
            '子',
            '金四局',
        ], // 海中金
        [
            '丙',
            '寅',
            '火六局',
        ], // 爐中火
        [
            '戊',
            '辰',
            '木三局',
        ], // 大林木
        [
            '庚',
            '午',
            '土五局',
        ], // 路旁土
        [
            '壬',
            '申',
            '金四局',
        ], // 劍鋒金
        [
            '甲',
            '戌',
            '火六局',
        ], // 山頭火
        [
            '丙',
            '子',
            '水二局',
        ], // 澗下水
        [
            '戊',
            '寅',
            '土五局',
        ], // 城頭土
        [
            '庚',
            '辰',
            '金四局',
        ], // 白蠟金
        [
            '壬',
            '午',
            '木三局',
        ], // 楊柳木
        [
            '甲',
            '申',
            '水二局',
        ], // 泉中水
        [
            '丙',
            '戌',
            '土五局',
        ], // 屋上土
    ] as const)('maps %s%s to %s', (stem, branch, label) => {
        expect(fiveElementBureauOf(stem, branch).label).toBe(label);
    });

    it('covers all five bureaus over the sixty stem-branch pairs', () => {
        const labels = new Set<string>();

        for (let n = 0; n < 60; n++) labels.add(fiveElementBureauOf(STEMS[n % 10]!, BRANCHES[n % 12] as Branch).label);

        expect(labels.size).toBe(5);
    });
});
