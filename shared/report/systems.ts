/** The systems whose single-dimension report is built so far; the rest follow system by system. */
import {
    ASSESSMENTS, assessmentSystems, type AssessmentDefinition, type AssessmentSystemId,
} from '../assessments';

export const SINGLE_REPORT_SYSTEMS = [
    'ZODIAC',
    'BLOOD',
    'NUMEROLOGY',
    'MBTI',
    'MAYA_KIN',
    'BAZI',
    'HUMAN_DESIGN',
    'TAROT',
    'RUNE',
    'HOROSCOPE',
] as const;

export type SingleReportSystem = typeof SINGLE_REPORT_SYSTEMS[number];

/** The lasting systems with a report of their own that a multi-dimension report combines; today's tarot, runes and horoscope are only held up against them. */
export const BASE_MULTI_REPORT_SYSTEMS = [
    'ZODIAC',
    'BLOOD',
    'MBTI',
    'NUMEROLOGY',
    'MAYA_KIN',
    'BAZI',
    'HUMAN_DESIGN',
] as const;

/** What a multi-dimension report may combine: the lasting systems and every self-analysis (a result of it is what the report uses) */
export type MultiReportSystem = typeof BASE_MULTI_REPORT_SYSTEMS[number] | AssessmentSystemId;

/** The systems offered: the lasting ones and the self-analyses that are defined, so a new analysis is offered without a change here */
export const multiReportSystems = (definitions: readonly AssessmentDefinition[] = ASSESSMENTS): MultiReportSystem[] => [...BASE_MULTI_REPORT_SYSTEMS, ...assessmentSystems(definitions)];

export const MULTI_REPORT_SYSTEMS: readonly MultiReportSystem[] = multiReportSystems();

export const isMultiReportSystem = (value: string, definitions: readonly AssessmentDefinition[] = ASSESSMENTS): value is MultiReportSystem => (multiReportSystems(definitions) as readonly string[]).includes(value);
