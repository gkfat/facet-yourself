import {
    AI_REPORT_SECTIONS, aiAnalysisOutputSchema, aiReportSectionKeys, type AiAnalysisOutput,
} from '../../shared/schemas/firestore/aiAnalysis.schema';

/**
 * Checks on an AI reading before it is shown (FR-017, NFR-007, NFR-013).
 * `fatal` problems make the report unusable (it is failed and refunded);
 * `warnings` are only counted, so quality can be watched without blocking users.
 */
export type QualityFinding = {
    code: string;
    section?: string;
    detail: string;
};

export type QualityReport = {
    fatal: QualityFinding[];
    warnings: QualityFinding[];
};

/** Wording that reads as a diagnosis or medical claim. A heuristic net, not a guarantee. */
export const DIAGNOSTIC_PATTERN = /(診斷|確診|罹患|患有|病症|疾病|精神疾|人格障礙|憂鬱症|躁鬱|焦慮症|強迫症|過動症|自閉症|思覺失調|創傷後壓力|醫師建議|服用藥|藥物治療|心理治療)/;

/** Wording that foretells death or a lifespan: the future is told as what may come up, never as that. */
export const FATALISTIC_PATTERN = /(壽命|短命|早逝|必死|會死|大限將至|命中注定)/;

/** Absolute wording that contradicts "this is only a reading of the data". */
export const OVERCONFIDENT_PATTERN = /(一定會|絕對(會|是|不)|必然|百分之百|肯定(會|是)|毫無疑問|永遠不會)/;

/** A report does not say how strong or how sure something is as a number or a share. */
const PERCENT_PATTERN = /(%|％|百分之)/;

const MIN_CONTENT_LENGTH = 20;
const MIN_POINT_LENGTH = 8;

type AssessOptions = {
    /** Whether the member asked something: the answer to it is then a section of its own */
    hasQuestion: boolean;
    /** The ids of the insights the rules found, which the sections may cite */
    candidateIds: readonly string[];
};

/**
 * The checks on an AI report: the sections in the order laid down (the answer to the question only when one was asked),
 * each with a lead long enough and the number of points laid down for it, each point long enough, no diagnosis, no
 * foretelling of death, no percentage, and only insights the rules really found are cited. When the rules found insights, the part that picks out what stands out has to rest on at least one.
 */
export function assessAiReport(output: AiAnalysisOutput, options: AssessOptions): QualityReport {
    const fatal: QualityFinding[] = [];
    const warnings: QualityFinding[] = [];
    const expected: string[] = aiReportSectionKeys(options.hasQuestion);
    const actual: string[] = output.sections.map((section) => section.key);

    if (actual.length !== expected.length || expected.some((key, index) => actual[index] !== key)) {
        fatal.push({
            code: 'STRUCTURE', detail: `sections must be exactly ${expected.join(', ')} in order`,
        });

        return {
            fatal, warnings,
        };
    }

    const known = new Set(options.candidateIds);

    for (const section of output.sections) {
        const text = [section.content, ...section.points].join('\n');
        const spec = AI_REPORT_SECTIONS.find((item) => item.key === section.key);

        if ([...section.content].length < MIN_CONTENT_LENGTH) {
            fatal.push({
                code: 'TOO_SHORT', section: section.key, detail: 'the lead is too short to be a real analysis',
            });
        }

        if (spec && (section.points.length < spec.points.min || section.points.length > spec.points.max)) {
            fatal.push({
                code: 'POINTS', section: section.key, detail: `this part has ${spec.points.min === spec.points.max ? spec.points.max : `${spec.points.min} to ${spec.points.max}`} points`,
            });
        }

        if (section.points.some((point) => [...point.trim()].length < MIN_POINT_LENGTH)) {
            fatal.push({
                code: 'POINT_TOO_SHORT', section: section.key, detail: 'a point is too short to say anything',
            });
        }

        if (DIAGNOSTIC_PATTERN.test(text)) {
            fatal.push({
                code: 'DIAGNOSTIC', section: section.key, detail: 'contains diagnosis or medical wording',
            });
        }

        if (FATALISTIC_PATTERN.test(text)) {
            fatal.push({
                code: 'FATALISTIC', section: section.key, detail: 'foretells death or a lifespan',
            });
        }

        if (PERCENT_PATTERN.test(text)) {
            fatal.push({
                code: 'PERCENT', section: section.key, detail: 'shows a percentage, which says how strong something is and the report gives no such number',
            });
        }

        if (section.candidateIds.some((id) => !known.has(id))) {
            fatal.push({
                code: 'UNKNOWN_CITATION', section: section.key, detail: 'cites an insight that was not found',
            });
        }

        if (OVERCONFIDENT_PATTERN.test(text)) {
            warnings.push({
                code: 'OVERCONFIDENT', section: section.key, detail: 'absolute wording',
            });
        }
    }

    const highlights = output.sections.find((section) => section.key === 'highlights');

    if (known.size > 0 && highlights && highlights.candidateIds.length === 0) {
        fatal.push({
            code: 'NO_CITATION', section: 'highlights', detail: 'the part that picks out what stands out has to rest on an insight the rules found',
        });
    }

    return {
        fatal, warnings,
    };
}

/** Parse untrusted model output into the report shape; null when it does not fit. */
export function parseAiAnalysisOutput(value: unknown): AiAnalysisOutput | null {
    const parsed = aiAnalysisOutputSchema.safeParse(value);

    return parsed.success ? parsed.data : null;
}
