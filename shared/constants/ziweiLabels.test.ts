import {
    describe, expect, it,
} from 'vitest';
import { BRANCHES } from './bazi';
import {
    ZIWEI_GRID_BRANCHES, ZIWEI_READING_STEPS,
} from './ziweiLabels';

describe('the chart layout', () => {
    it('gives each of the twelve branches one place', () => {
        expect(ZIWEI_GRID_BRANCHES).toHaveLength(12);
        expect([...ZIWEI_GRID_BRANCHES.map((cell) => cell.branch)].sort()).toEqual([...BRANCHES].sort());
        expect(new Set(ZIWEI_GRID_BRANCHES.map((cell) => `${cell.row},${cell.column}`)).size).toBe(12);
    });

    it('puts the twelve around the edge of a four by four grid and leaves the middle two by two free', () => {
        for (const cell of ZIWEI_GRID_BRANCHES) {
            const onEdge = cell.row === 1 || cell.row === 4 || cell.column === 1 || cell.column === 4;

            expect(onEdge, cell.branch).toBe(true);
            expect(cell.row).toBeGreaterThanOrEqual(1);
            expect(cell.row).toBeLessThanOrEqual(4);
            expect(cell.column).toBeGreaterThanOrEqual(1);
            expect(cell.column).toBeLessThanOrEqual(4);
        }
    });

    it('follows the traditional chart: 巳午未申 on top, 寅丑子亥 below, 辰卯 on the left and 酉戌 on the right', () => {
        const at = (row: number) => ZIWEI_GRID_BRANCHES.filter((cell) => cell.row === row).sort((a, b) => a.column - b.column).map((cell) => cell.branch);

        expect(at(1)).toEqual([
            '巳',
            '午',
            '未',
            '申',
        ]);
        expect(at(4)).toEqual([
            '寅',
            '丑',
            '子',
            '亥',
        ]);
        expect(at(2)).toEqual(['辰', '酉']);
        expect(at(3)).toEqual(['卯', '戌']);
    });
});

describe('the reading steps', () => {
    it('has four steps, in order, each with its own words', () => {
        expect(ZIWEI_READING_STEPS).toHaveLength(4);
        ZIWEI_READING_STEPS.forEach((step, index) => {
            expect(step.title).toContain(`第 ${index + 1} 步`);
            expect(step.text.length).toBeGreaterThan(20);
        });
    });

    it('says 化忌 is not a prediction of bad news, and that the borrowed stars are named as borrowed', () => {
        const text = ZIWEI_READING_STEPS.map((step) => step.text).join('');

        expect(text).toContain('不是壞事的預告');
        expect(text).toContain('標明是借星');
    });
});
