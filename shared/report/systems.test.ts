import {
    describe, expect, it,
} from 'vitest';
import { ASSESSMENTS } from '../assessments';
import {
    fakeScaleAssessment, fakeSelectionAssessment,
} from '../assessments/testing';
import {
    BASE_MULTI_REPORT_SYSTEMS, MULTI_REPORT_SYSTEMS, isMultiReportSystem, multiReportSystems,
} from './systems';

describe('the systems a multi-dimension report can combine', () => {
    it('are the lasting ones and the self-analyses that are defined', () => {
        expect(MULTI_REPORT_SYSTEMS).toEqual([...BASE_MULTI_REPORT_SYSTEMS, ...ASSESSMENTS.map((definition) => definition.systemId)]);
    });

    it('take in every self-analysis that is defined, without any other change', () => {
        const definitions = [fakeScaleAssessment(), fakeSelectionAssessment()];

        expect(multiReportSystems(definitions)).toEqual([
            ...BASE_MULTI_REPORT_SYSTEMS,
            'HEXACO',
            'CORE_VALUES',
        ]);
        expect(isMultiReportSystem('CORE_VALUES', definitions)).toBe(true);
        expect(isMultiReportSystem('CORE_VALUES', [])).toBe(false);
        expect(isMultiReportSystem('EMOTIONAL_INTELLIGENCE')).toBe(false);
        expect(isMultiReportSystem('TAROT')).toBe(false);
    });
});
