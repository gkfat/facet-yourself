// Plain `.ts` import specifiers: this file is also run directly by Node
// (type stripping) from scripts/, where extensionless imports do not resolve.
// Kept apart from analysisBasis.ts, whose tarot and rune versions reach node:crypto, which the pages cannot load.
import type { AssessmentSystemId } from '../assessments/ids.ts';
import { analysisBasisSchema } from '../schemas/analysisBasis.schema.ts';
import type {
    AnalysisBasis, BasisInputs,
} from '../schemas/analysisBasis.schema.ts';

/** The basis of a self-analysis result: the version of the items that were answered is the rule version. */
export function buildAssessmentBasis(system: AssessmentSystemId, version: string, inputs: BasisInputs = {}): AnalysisBasis {
    return analysisBasisSchema.parse({
        system,
        method: 'self-assessment-questionnaire',
        ruleVersion: version,
        inputs,
    });
}
