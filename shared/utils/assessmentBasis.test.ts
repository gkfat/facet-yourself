import {
    describe, expect, it,
} from 'vitest';
import { ANALYSIS_SYSTEMS } from '../schemas/analysisBasis.schema';
import { buildAssessmentBasis } from './assessmentBasis';

describe('buildAssessmentBasis', () => {
    it('uses the version of the items as the rule version, and a self-analysis is a system of the basis', () => {
        expect(buildAssessmentBasis('HEXACO', 'hexaco-ref-v1')).toMatchObject({
            system: 'HEXACO', ruleVersion: 'hexaco-ref-v1',
        });
        expect(ANALYSIS_SYSTEMS).toContain('CORE_VALUES');
    });
});
