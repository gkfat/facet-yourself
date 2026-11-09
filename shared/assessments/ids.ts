// Plain `.ts` import specifiers: this file is also run directly by Node
// (type stripping) from scripts/, where extensionless imports do not resolve.

/** The self-assessments there are to be, by the id used in paths and in the fixed content keys. */
export const ASSESSMENT_IDS = [
    'enneagram',
    'hexaco',
    'via-strengths',
    'riasec',
    'emotional-intelligence',
    'attachment-style',
    'core-values',
    'psychological-needs',
    'career-anchors',
    'conflict-style',
    'resilience',
] as const;

export type AssessmentId = typeof ASSESSMENT_IDS[number];

/** The same assessments by the id a multi-dimension report uses for a system (upper case, like the other systems) */
export const ASSESSMENT_SYSTEM_BY_ID = {
    'enneagram': 'ENNEAGRAM',
    'hexaco': 'HEXACO',
    'via-strengths': 'VIA_STRENGTHS',
    'riasec': 'RIASEC',
    'emotional-intelligence': 'EMOTIONAL_INTELLIGENCE',
    'attachment-style': 'ATTACHMENT_STYLE',
    'core-values': 'CORE_VALUES',
    'psychological-needs': 'PSYCHOLOGICAL_NEEDS',
    'career-anchors': 'CAREER_ANCHORS',
    'conflict-style': 'CONFLICT_STYLE',
    'resilience': 'RESILIENCE',
} as const satisfies Record<AssessmentId, string>;

export type AssessmentSystemId = typeof ASSESSMENT_SYSTEM_BY_ID[AssessmentId];

/** The system ids as a tuple, so that they can join the other systems in an enum */
export const ASSESSMENT_SYSTEM_IDS = [
    'ENNEAGRAM',
    'HEXACO',
    'VIA_STRENGTHS',
    'RIASEC',
    'EMOTIONAL_INTELLIGENCE',
    'ATTACHMENT_STYLE',
    'CORE_VALUES',
    'PSYCHOLOGICAL_NEEDS',
    'CAREER_ANCHORS',
    'CONFLICT_STYLE',
    'RESILIENCE',
] as const satisfies readonly AssessmentSystemId[];
