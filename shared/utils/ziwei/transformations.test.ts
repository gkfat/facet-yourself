import {
    describe, expect, it,
} from 'vitest';
import {
    STEMS,
    type Stem,
} from '../../constants/bazi';
import {
    BIRTH_YEAR_TRANSFORMATIONS,
    TRANSFORMATIONS,
} from '../../constants/ziwei';
import {
    placeAuxiliaryStars, placeMainStars, buildPalaces, 
} from './stars';
import {
    birthYearTransformationsOf,
    markTransformations,
} from './transformations';

function chartPalaces() {
    return buildPalaces('寅', placeMainStars('子'), placeAuxiliaryStars(1, '子'));
}

describe('birthYearTransformationsOf', () => {
    it('gives 祿 權 科 忌 in order for every one of the ten stems', () => {
        for (const stem of STEMS) {
            const result = birthYearTransformationsOf(stem);

            expect(result.map((item) => item.transformation)).toEqual([...TRANSFORMATIONS]);
            expect(result.map((item) => item.star)).toEqual([...BIRTH_YEAR_TRANSFORMATIONS[stem]]);
        }
    });

    it('matches known stems', () => {
        expect(birthYearTransformationsOf('甲').map((item) => item.star)).toEqual([
            '廉貞',
            '破軍',
            '武曲',
            '太陽',
        ]);
        expect(birthYearTransformationsOf('壬')[2]).toEqual({
            transformation: '科',
            star: '左輔',
        });
    });
});

describe('markTransformations', () => {
    it('attaches each mark to the star it lands on, main or auxiliary, without adding stars', () => {
        for (const stem of STEMS as readonly Stem[]) {
            const before = chartPalaces();
            const marked = markTransformations(before, birthYearTransformationsOf(stem));
            const starCount = (palaces: typeof before) => palaces.reduce(
                (sum, palace) => sum + palace.mainStars.length + palace.auxiliaryStars.length,
                0,
            );
            const marks = marked.flatMap((palace) => [...palace.mainStars, ...palace.auxiliaryStars]).filter((placement) => placement.transformation !== null);

            expect(starCount(marked)).toBe(starCount(before));
            expect(marks.map((placement) => placement.transformation).sort()).toEqual([...TRANSFORMATIONS].sort());
        }
    });

    it('marks a main star for 甲 and an auxiliary star for 壬 科', () => {
        const jia = markTransformations(chartPalaces(), birthYearTransformationsOf('甲'));
        const ren = markTransformations(chartPalaces(), birthYearTransformationsOf('壬'));
        const find = (palaces: typeof jia, star: string) => palaces
            .flatMap((palace) => [...palace.mainStars, ...palace.auxiliaryStars])
            .find((placement) => placement.star === star);

        expect(find(jia, '廉貞')?.transformation).toBe('祿');
        expect(find(jia, '太陽')?.transformation).toBe('忌');
        expect(find(ren, '左輔')?.transformation).toBe('科');
    });

    it('does not change the palaces it was given', () => {
        const before = chartPalaces();
        const snapshot = JSON.stringify(before);

        markTransformations(before, birthYearTransformationsOf('甲'));

        expect(JSON.stringify(before)).toBe(snapshot);
    });

    it('throws when a transformed star is not on the chart', () => {
        const withoutAuxiliary = chartPalaces().map((palace) => ({
            ...palace,
            auxiliaryStars: [],
        }));

        expect(() => markTransformations(withoutAuxiliary, birthYearTransformationsOf('壬'))).toThrow(/Expected 4/);
    });
});
