import {
    GALACTIC_TONES, KIN_ORACLE_LABELS, KIN_ORACLE_MEANINGS, SOLAR_SEALS,
} from '../../constants/mayaKin';
import { mayaKinTermsOf } from '../../ontology/mappings/mayaKin';
import { buildBasis } from '../../utils/analysisBasis';
import {
    kinName, kinOf, kinOracle, sealName, toneName, type Kin,
} from '../../utils/mayaKin';
import {
    adviceOfBody, readingsOfBody, type FixedContentBody,
} from './common';
import type { SystemReportInput } from '../types';

/** The four oracle positions around the main Kin, with what each is said to stand for in the Dreamspell */
const ORACLE_POSITIONS: Array<{ label: string; key: keyof ReturnType<typeof kinOracle>; meaning: string }> = [
    {
        label: KIN_ORACLE_LABELS.guide, key: 'guide', meaning: KIN_ORACLE_MEANINGS.guide,
    },
    {
        label: KIN_ORACLE_LABELS.analog, key: 'analog', meaning: KIN_ORACLE_MEANINGS.analog,
    },
    {
        label: KIN_ORACLE_LABELS.antipode, key: 'antipode', meaning: KIN_ORACLE_MEANINGS.antipode,
    },
    {
        label: KIN_ORACLE_LABELS.occult, key: 'occult', meaning: KIN_ORACLE_MEANINGS.occult,
    },
];

/** One position of the oracle as a fact: the name of its Kin, and under it the Kin number and what the position is for */
const oracleFact = (position: typeof ORACLE_POSITIONS[number], kin: Kin) => ({
    label: position.label, value: `${kinName(kin)}\nKin ${kin.kinNumber}・${position.meaning}`,
});

/**
 * The birth Kin report. The seal and the tone are the facts the mapping works on; their keywords are shown as the
 * Dreamspell table gives them. The report says plainly that this is the Dreamspell calendar of the twentieth century and
 * not an old Maya one.
 */
export function mayaKinReportInput(params: { birthDate: string; body: FixedContentBody }): SystemReportInput {
    const kin = kinOf(params.birthDate);
    const [sealTerm, toneTerm] = mayaKinTermsOf(kin);
    const seal = SOLAR_SEALS[kin.solarSeal - 1];
    const tone = GALACTIC_TONES[kin.galacticTone - 1];
    const oracle = kinOracle(kin);

    return {
        system: 'MAYA_KIN',
        position: `Kin ${kin.kinNumber}・${kinName(kin)}`,
        facts: [
            {
                label: 'Kin 編號', value: String(kin.kinNumber),
            },
            {
                label: '圖騰', value: sealName(kin.solarSeal), term: sealTerm,
            },
            {
                label: '圖騰的關鍵字', value: seal ? seal.keywords.join('、') : '',
            },
            {
                label: '調性', value: toneName(kin.galacticTone), term: toneTerm,
            },
            {
                label: '調性的關鍵字', value: tone ? tone.keyword : '',
            },
            // The five-Kin oracle: the main Kin above, then these four
            ...ORACLE_POSITIONS.map((position) => oracleFact(position, oracle[position.key])),
            {
                // The second line is the subtitle of the card
                label: '曆法', value: 'Dreamspell\n二十世紀提出的新曆法，不是古瑪雅原有的曆法',
            },
        ].filter((fact) => fact.value !== ''),
        // The reviewed reading is the overview, as in the zodiac, blood-type and life-path reports: a quote, then a card for each part
        interpretations: readingsOfBody(params.body).map((reading) => ({
            ...reading, overview: true,
        })),
        traits: mayaKinTermsOf(kin),
        advice: adviceOfBody(params.body),
        disclaimer: params.body.disclaimer,
        basis: [buildBasis('MAYA_KIN', { birthDate: params.birthDate })],
    };
}
