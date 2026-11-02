import { numerologyTermsOf } from '../../ontology/mappings/numerology';
import { buildBasis } from '../../utils/analysisBasis';
import {
    birthdayNumber, lifePathNumber,
} from '../../utils/numerology';
import {
    adviceOfBody, readingsOfBody, type FixedContentBody,
} from './common';
import type { SystemReportInput } from '../types';

/**
 * The life path number report. It depends on the birth date alone, so it is the same whenever it is made: the year
 * number (which changes with the year) is not part of it.
 */
export function numerologyReportInput(params: { birthDate: string; body: FixedContentBody }): SystemReportInput {
    const lifePath = lifePathNumber(params.birthDate);
    const terms = numerologyTermsOf(lifePath);

    return {
        system: 'NUMEROLOGY',
        position: `生命靈數 ${lifePath}`,
        facts: [
            {
                label: '生命靈數', value: String(lifePath), term: terms[0],
            }, {
                label: '生日數', value: String(birthdayNumber(params.birthDate)),
            },
        ],
        // The reviewed reading is the overview, as in the zodiac and blood-type reports: a quote, then a card for each part
        interpretations: readingsOfBody(params.body, terms[0]).map((reading) => ({
            ...reading, overview: true,
        })),
        traits: terms,
        advice: adviceOfBody(params.body),
        disclaimer: params.body.disclaimer,
        basis: [buildBasis('NUMEROLOGY', { birthDate: params.birthDate })],
    };
}
