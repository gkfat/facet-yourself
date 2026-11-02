import { bloodTermsOf } from '../../ontology/mappings/blood';
import type { BloodType } from '../../schemas/common';
import {
    adviceOfBody, readingsOfBody, type FixedContentBody,
} from './common';
import type { SystemReportInput } from '../types';

/** The blood-type report: the type itself is the only fact there is. */
export function bloodReportInput(params: { bloodType: Exclude<BloodType, 'UNKNOWN'>; body: FixedContentBody }): SystemReportInput {
    const [term] = bloodTermsOf(params.bloodType);

    return {
        system: 'BLOOD',
        position: `${params.bloodType} 型`,
        facts: [
            {
                label: '血型', value: `${params.bloodType} 型`, term,
            },
        ],
        // The reviewed reading is the overview, as the sun sign's is in the zodiac report: a quote, then a card for each part
        interpretations: readingsOfBody(params.body, term).map((reading) => ({
            ...reading, overview: true,
        })),
        traits: bloodTermsOf(params.bloodType),
        advice: adviceOfBody(params.body),
        disclaimer: params.body.disclaimer,
        basis: [],
    };
}
