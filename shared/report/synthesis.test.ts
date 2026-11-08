import {
    describe, expect, it,
} from 'vitest';
import { STABLE_MAPPINGS } from '../ontology/mappings';
import { bloodTermsOf } from '../ontology/mappings/blood';
import { mayaKinTermsOf } from '../ontology/mappings/mayaKin';
import { mbtiTermsOf } from '../ontology/mappings/mbti';
import { numerologyTermsOf } from '../ontology/mappings/numerology';
import { zodiacTermsOf } from '../ontology/mappings/zodiac';
import { ZODIACS } from '../schemas/common';
import { selectFacets } from './facets';
import {
    MAX_SYNTHESIS, selectSynthesis,
} from './synthesis';

const axisOf = (end: string) => end.slice(0, 2);

/** What a report of the member's terms says together: the traits it shows, and the interactions found among them */
const reportOf = (terms: string[]) => {
    const facets = selectFacets(terms, new Set(terms), STABLE_MAPPINGS);

    return {
        facets, synthesis: selectSynthesis(facets),
    };
};

/** Every value of the systems that give a report from terms alone, with the name to say which one fell short */
const memberTerms: Array<[string, string[]]> = [
    ...['E', 'I'].flatMap((a) => ['N', 'S'].flatMap((b) => ['T', 'F'].flatMap((c) => ['J', 'P'].map((d) => [`MBTI ${a}${b}${c}${d}`, mbtiTermsOf(`${a}${b}${c}${d}`)] as [string, string[]])))),
    ...ZODIACS.map((sign) => [`ZODIAC ${sign}`, zodiacTermsOf(sign)] as [string, string[]]),
    ...([
        'A',
        'B',
        'AB',
        'O',
    ] as const).map((type) => [`BLOOD ${type}`, bloodTermsOf(type)] as [string, string[]]),
    ...[
        1,
        2,
        3,
        4,
        5,
        6,
        7,
        8,
        9,
        11,
        22,
        33,
    ].map((number) => [`NUMEROLOGY ${number}`, numerologyTermsOf(number)] as [string, string[]]),
    ...Array.from({ length: 20 }, (_, seal) => Array.from({ length: 13 }, (__, tone) => [
        `KIN seal ${seal + 1} tone ${tone + 1}`, mayaKinTermsOf({
            solarSeal: seal + 1, galacticTone: tone + 1,
        }),
    ] as [string, string[]])).flat(),
];

describe('selectSynthesis', () => {
    it('finds something to say about the traits of every report that shows traits of two axes', () => {
        const missing = memberTerms.flatMap(([name, terms]) => {
            const {
                facets, synthesis, 
            } = reportOf(terms);
            const axes = new Set(facets.map((facet) => axisOf(facet.end.id)));

            return axes.size >= 2 && synthesis.length === 0 ? [`${name}: ${facets.map((facet) => facet.end.id).join(' ')}`] : [];
        });

        expect(missing).toEqual([]);
    });

    it('joins only traits the report shows, and at most the number laid down', () => {
        for (const [, terms] of memberTerms) {
            const {
                facets, synthesis, 
            } = reportOf(terms);
            const shown = new Set(facets.map((facet) => facet.end.id));

            expect(synthesis.length).toBeLessThanOrEqual(MAX_SYNTHESIS);
            expect(synthesis.every((item) => item.ends.every((end) => shown.has(end)))).toBe(true);
        }
    });

    it('is the same for the same member', () => {
        const [, terms = []] = memberTerms[0] ?? [];

        expect(reportOf(terms).synthesis.map((item) => item.rule.id)).toEqual(reportOf(terms).synthesis.map((item) => item.rule.id));
    });
});
