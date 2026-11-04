// Plain `.ts` import specifiers: this file is also run directly by Node
// (type stripping) from scripts/, where extensionless imports do not resolve.
import type { AssessmentId } from './ids.ts';

/**
 * Whether the entrances to an assessment (the home page, the page of the reports) are shown. Each is turned on when its
 * contents are published and a whole test has been taken; the pages themselves work without it.
 */
export const ASSESSMENT_ENTRY_ENABLED: Readonly<Record<AssessmentId, boolean>> = {
    'enneagram': true,
    'hexaco': true,
    'via-strengths': true,
    'riasec': true,
    'emotional-intelligence': true,
    'attachment-style': true,
    'core-values': true,
    'psychological-needs': true,
};
