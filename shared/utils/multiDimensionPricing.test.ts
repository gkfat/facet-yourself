import {
    describe, expect, it,
} from 'vitest';
import {
    fakeScaleAssessment, fakeSelectionAssessment,
} from '../assessments/testing';
import {
    multiReportCost, yardstickReach,
} from './multiDimensionPricing';

describe('multiReportCost', () => {
    it('is the sum of the systems\' own prices times 1.2, rounded down', () => {
        // 2 x 1.2 = 2.4
        expect(multiReportCost(['ZODIAC', 'MBTI'])).toBe(2);
        // 3 x 1.2 = 3.6
        expect(multiReportCost([
            'ZODIAC',
            'BLOOD',
            'MBTI',
        ])).toBe(3);
        // 6 x 1.2 = 7.2
        expect(multiReportCost([
            'MBTI',
            'HUMAN_DESIGN',
            'BAZI',
        ])).toBe(7);
        // 10 x 1.2 = 12
        expect(multiReportCost([
            'ZODIAC',
            'BLOOD',
            'MBTI',
            'NUMEROLOGY',
            'MAYA_KIN',
            'HUMAN_DESIGN',
            'BAZI',
        ])).toBe(12);
    });

    it('prices the human design at 2 points and the BaZi chart at 3', () => {
        // 1 + 2 = 3 -> 3.6
        expect(multiReportCost(['ZODIAC', 'HUMAN_DESIGN'])).toBe(3);
        // 1 + 3 = 4 -> 4.8
        expect(multiReportCost(['ZODIAC', 'BAZI'])).toBe(4);
        // 2 + 3 = 5 -> 6
        expect(multiReportCost(['HUMAN_DESIGN', 'BAZI'])).toBe(6);
    });

    it('is the same whether or not the combination was ever written down: there is no cheaper branch', () => {
        expect(multiReportCost(['ZODIAC', 'MBTI'])).toBe(multiReportCost(['MBTI', 'ZODIAC']));
        expect(multiReportCost([
            'ZODIAC',
            'ZODIAC',
            'MBTI',
        ])).toBe(2);
    });

    it('is not offered for fewer than two systems', () => {
        expect(multiReportCost([])).toBeNull();
        expect(multiReportCost(['ZODIAC'])).toBeNull();
        expect(multiReportCost(['ZODIAC', 'ZODIAC'])).toBeNull();
    });
});

describe('multiReportCost with self-analyses', () => {
    const scale = fakeScaleAssessment();
    const pick = fakeSelectionAssessment();

    it('prices a self-analysis at the base price its definition names, as any other system', () => {
        // (1 + 1) x 1.2 = 2.4
        expect(multiReportCost(['ZODIAC', 'HEXACO'], [scale, pick])).toBe(2);
        // (1 + 1 + 1) x 1.2 = 3.6
        expect(multiReportCost([
            'ZODIAC',
            'HEXACO',
            'CORE_VALUES',
        ], [scale, pick])).toBe(3);
        // (1 + 3) x 1.2 = 4.8
        expect(multiReportCost(['ZODIAC', 'HEXACO'], [
            {
                ...scale, basePrice: 3,
            }, pick,
        ])).toBe(4);
    });

    it('still never costs more than the cap', () => {
        expect(multiReportCost(['BAZI', 'HEXACO'], [
            {
                ...scale, basePrice: 40,
            },
        ])).toBe(30);
    });

    it('does not price a self-analysis that is not defined', () => {
        expect(() => multiReportCost(['ZODIAC', 'HEXACO'], [])).toThrow('No base price for HEXACO');
    });
});

describe('yardstickReach', () => {
    it('counts how many three-dimension reports the points pay for, rounded down', () => {
        // ZODIAC + MBTI + NUMEROLOGY = 3 x 1.2 = 3.6, so 3 points
        expect(yardstickReach(2)).toBe(0);
        expect(yardstickReach(3)).toBe(1);
        expect(yardstickReach(8)).toBe(2);
        expect(yardstickReach(30)).toBe(10);
    });

    it('is zero for no points', () => {
        expect(yardstickReach(0)).toBe(0);
    });
});
