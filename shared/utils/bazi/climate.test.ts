import {
    describe, expect, it,
} from 'vitest';
import {
    analyzeClimate, powerLevelOf,  
} from './climate';
import { computeFacts } from './facts';
import { calculatePillars } from './pillars';

function climateAt(birthDate: string, birthTime: string) {
    const moment = {
        birthDate,
        birthTime,
        standardOffsetMinutes: 480,
        instant: new Date(`${birthDate}T${birthTime}:00+08:00`),
    };
    const pillars = calculatePillars(moment);

    return analyzeClimate(pillars, computeFacts(pillars, moment.instant).relations);
}

describe('power levels of fire and water', () => {
    it('splits at 0, 1–14, 15–34, 35–54 and 55', () => {
        expect(powerLevelOf(0)).toBe('none');
        expect(powerLevelOf(0.5)).toBe('weak');
        expect(powerLevelOf(14.9)).toBe('weak');
        expect(powerLevelOf(15)).toBe('moderate');
        expect(powerLevelOf(34.9)).toBe('moderate');
        expect(powerLevelOf(35)).toBe('strong');
        expect(powerLevelOf(54.9)).toBe('strong');
        expect(powerLevelOf(55)).toBe('excessive');
    });
});

describe('the lean of the month', () => {
    it('keeps temperature, humidity and lean apart (丑 cold and damp, 辰 mild and damp with no lean)', () => {
        // 1960-01-12 is a 丑 month (己亥 丁丑 己亥 乙丑)
        const chou = climateAt('1960-01-12', '02:00');

        expect([
            chou.temperature,
            chou.humidity,
            chou.monthBias,
        ]).toEqual([
            'cold',
            'moist',
            'cold',
        ]);

        const chen = climateAt('2000-04-15', '10:00');

        expect(chen.month).toBe('辰');
        expect([
            chen.temperature,
            chen.humidity,
            chen.monthBias,
        ]).toEqual([
            'mild',
            'moist',
            'none',
        ]);
        // damp earth never makes the chart 偏濕: there is no such status
        expect([
            'cold',
            'hot',
            'dry',
            'balanced',
        ]).toContain(chen.status);
    });
});

describe('a cold month', () => {
    it('is 偏寒 and needs warming when fire is weak', () => {
        // 己亥 丁丑 己亥 乙丑: fire is weak (12)
        const climate = climateAt('1960-01-12', '02:00');

        expect(climate.elements.fire.level).toBe('weak');
        expect(climate.regulation.warming).toBe('insufficient');
        expect(climate.status).toBe('cold');
        expect(climate.needs).toEqual(['warming']);
        expect(climate.summary).toBe('命局偏寒，暖局需求較高');
    });

    it('is balanced when fire is moderate, even with a lot of water', () => {
        // 己亥 丙子 庚寅 丁丑: fire 27.6 and water 48
        const climate = climateAt('1960-01-03', '02:00');

        expect(climate.regulation.warming).toBe('moderate');
        expect(climate.status).toBe('balanced');
        expect(climate.needs).toEqual([]);
    });

    it('does not take water that is both there and strong for a balance when fire is lacking', () => {
        const climate = climateAt('1960-12-12', '15:00');

        expect(climate.elements.water.level).toBe('excessive');
        expect(climate.status).toBe('cold');
        expect(climate.excess).toEqual(['moistening']);
    });
});

describe('a hot month', () => {
    it('is 偏熱 and needs moistening when water is weak', () => {
        const climate = climateAt('1960-05-22', '02:00');

        expect(climate.regulation.moistening).toBe('insufficient');
        expect(climate.status).toBe('hot');
        expect(climate.needs).toEqual(['moistening']);
    });

    it('is balanced when water is moderate', () => {
        const climate = climateAt('1960-05-12', '02:00');

        expect(climate.regulation.moistening).toBe('moderate');
        expect(climate.status).toBe('balanced');
    });

    it('marks fire far too strong against a lacking water, and still reads 偏熱', () => {
        const climate = climateAt('1962-06-12', '15:00');

        expect(climate.excess).toEqual(['warming']);
        expect(climate.status).toBe('hot');
    });
});

describe('a dry month', () => {
    it('is 偏燥 and needs moistening when water is weak', () => {
        const climate = climateAt('1960-09-12', '10:00');

        expect(climate.monthBias).toBe('dry');
        expect(climate.status).toBe('dry');
        expect(climate.needs).toEqual(['moistening']);
    });

    it('is balanced when water is moderate', () => {
        const climate = climateAt('1960-08-12', '02:00');

        expect(climate.elements.fire.present).toBe(false);
        expect(climate.regulation.moistening).toBe('moderate');
        expect(climate.status).toBe('balanced');
    });
});

describe('whatever the month', () => {
    it('reads a balanced chart with far too much water and no fire as 偏寒, not 偏濕', () => {
        // 申 month: water 58, fire none
        const climate = climateAt('1984-08-22', '02:00');

        expect(climate.monthBias).toBe('dry');
        expect(climate.status).toBe('cold');
        expect(climate.needs).toEqual(['warming']);
        expect(climate.summary).toBe('水力過旺而火不足，偏寒，暖局需求較高');
    });
});

describe('合 and 沖', () => {
    it('are marked on fire and water and never change the power', () => {
        // 1962-12-22 10:00: 壬寅 壬子 甲午 己巳, 子午 clash puts both fire and water in a clash
        const climate = climateAt('1962-12-22', '10:00');

        expect(climate.influences).toEqual(expect.arrayContaining([
            {
                element: 'fire', kind: 'CLASHED',
            }, {
                element: 'water', kind: 'CLASHED',
            },
        ]));
        expect(climate.elements.fire.power).toBe(15.6);
        expect(climate.elements.water.power).toBe(60);
    });

    it('lists no influence for a chart whose fire and water are in none', () => {
        const climate = climateAt('1960-01-12', '02:00');

        expect(climate.influences.filter((item) => item.element === 'fire')).toEqual([]);
    });
});
