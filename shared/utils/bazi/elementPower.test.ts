import {
    describe, expect, it,
} from 'vitest';
import { elementPowerOf } from './elementPower';
import { calculatePillars } from './pillars';

function powerAt(birthDate: string, birthTime: string | null) {
    return elementPowerOf(calculatePillars({
        birthDate,
        birthTime,
        standardOffsetMinutes: 480,
        instant: new Date(`${birthDate}T${birthTime ?? '12:00'}:00+08:00`),
    }));
}

describe('elementPowerOf', () => {
    it('gives 金 15, 木 13, 水 2, 火 7, 土 23 for 己巳 甲戌 庚申 己卯 (a printed chart)', () => {
        expect(powerAt('1989-10-27', '06:00')).toEqual({
            metal: 15, wood: 13, water: 2, fire: 7, earth: 23,
        });
    });

    it('gives 金 26, 木 10, 水 11, 火 7, 土 6 for 癸亥 辛酉 丙辰 庚寅 (a second printed chart)', () => {
        expect(powerAt('1983-09-25', '04:00')).toEqual({
            metal: 26, wood: 10, water: 11, fire: 7, earth: 6,
        });
    });

    it('adds up to 60 with the hour', () => {
        const power = powerAt('2001-11-05', '10:00');

        expect(Object.values(power).reduce((sum, value) => sum + value, 0)).toBe(60);
    });

    it('leaves the hour out when the time is unknown', () => {
        const power = powerAt('1989-10-27', null);

        // Three stems (15) and three branches, the month one counted double (8 + 16 + 8)
        expect(Object.values(power).reduce((sum, value) => sum + value, 0)).toBe(47);
    });
});
