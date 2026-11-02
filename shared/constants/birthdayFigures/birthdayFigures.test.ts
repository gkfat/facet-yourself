import {
    describe, expect, it,
} from 'vitest';
import {
    FIGURES_BY_DAY, figuresOn,
} from './index';

const DAYS_IN_MONTH = [
    31,
    29,
    31,
    30,
    31,
    30,
    31,
    31,
    30,
    31,
    30,
    31,
];
const ALL_DAYS = DAYS_IN_MONTH.flatMap((count, month) => Array.from({ length: count }, (_, day) => `${String(month + 1).padStart(2, '0')}-${String(day + 1).padStart(2, '0')}`));
const THIS_YEAR = new Date().getUTCFullYear();

describe('FIGURES_BY_DAY', () => {
    it('has the 366 days of the year and no other key', () => {
        expect(Object.keys(FIGURES_BY_DAY).sort()).toEqual([...ALL_DAYS].sort());
    });

    it('has exactly three people, each with a name and a role, for every day', () => {
        for (const day of ALL_DAYS) {
            const figures = FIGURES_BY_DAY[day] ?? [];

            expect(figures, day).toHaveLength(3);
            for (const figure of figures) {
                expect(figure.name.trim(), day).not.toBe('');
                expect(figure.nameEn.trim(), day).not.toBe('');
                expect(figure.role.trim(), day).not.toBe('');
            }
        }
    });

    it('has a year of birth in the past for everyone', () => {
        for (const day of ALL_DAYS) {
            for (const figure of FIGURES_BY_DAY[day] ?? []) {
                expect(Number.isInteger(figure.year), `${day} ${figure.name}`).toBe(true);
                expect(figure.year, `${day} ${figure.name}`).toBeGreaterThan(-1000);
                expect(figure.year, `${day} ${figure.name}`).toBeLessThan(THIS_YEAR);
            }
        }
    });

    it('lists nobody on two days or twice on one', () => {
        const names = ALL_DAYS.flatMap((day) => (FIGURES_BY_DAY[day] ?? []).map((figure) => figure.name));

        expect(names.filter((name, index) => names.indexOf(name) !== index)).toEqual([]);
    });
});

describe('figuresOn', () => {
    it('gives 29 February its own three people', () => {
        expect(figuresOn('2000-02-29')).toBe(FIGURES_BY_DAY['02-29']);
        expect(figuresOn('2000-02-29')).not.toEqual(FIGURES_BY_DAY['02-28']);
        expect(figuresOn('2000-02-29')).not.toEqual(FIGURES_BY_DAY['03-01']);
    });

    it('gives the same people for the same month and day of different years', () => {
        expect(figuresOn('1985-06-15')).toEqual(figuresOn('2003-06-15'));
        expect(figuresOn('1985-06-15')).not.toBeNull();
    });

    it('gives null, and does not throw, for a date that is not real', () => {
        for (const date of [
            '',
            'not-a-date',
            '2023-02-29',
            '2024-13-01',
            '2024-04-31',
        ]) {
            expect(figuresOn(date), date).toBeNull();
        }
    });
});
