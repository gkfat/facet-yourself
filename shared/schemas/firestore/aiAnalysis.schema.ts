import { z } from 'zod';
import { snapshotSystemSchema } from './reportSnapshot.schema';

/**
 * The parts of an AI report after the facts, in the order they are read: what stands out, the good and the bad the reports
 * share, the member seen across past, present and future, an answer to what they asked (only when they asked), and a
 * conclusion. Each part is a short lead and, for most, a list of points: how many are laid down here, so that what the
 * model is asked for, what is checked and what is shown are the same.
 */
export const AI_REPORT_SECTIONS = [
    {
        key: 'highlights', title: '值得注意的點', points: {
            min: 3, max: 5, 
        },
    },
    {
        key: 'positives', title: '共同的優勢', points: {
            min: 3, max: 5, 
        },
    },
    {
        key: 'negatives', title: '共同的劣勢與需要留意的地方', points: {
            min: 3, max: 5, 
        },
    },
    {
        key: 'past', title: '過去', points: {
            min: 0, max: 0, 
        },
    },
    {
        key: 'present', title: '現在', points: {
            min: 0, max: 0, 
        },
    },
    {
        key: 'future', title: '未來', points: {
            min: 2, max: 4, 
        },
    },
    {
        key: 'question', title: '回應你的提問', points: {
            min: 3, max: 5, 
        },
    },
    {
        key: 'conclusion', title: '結論與提醒', points: {
            min: 3, max: 5, 
        },
    },
] as const;

export type AiReportSectionKey = typeof AI_REPORT_SECTIONS[number]['key'];

/** The sections an answer has to contain, in order: the answer to the question is only there when a question was asked. */
export const aiReportSectionKeys = (hasQuestion: boolean): AiReportSectionKey[] => AI_REPORT_SECTIONS
    .map((section) => section.key)
    .filter((key) => hasQuestion || key !== 'question');

const sectionKeySchema = z.enum(AI_REPORT_SECTIONS.map((section) => section.key) as [AiReportSectionKey, ...AiReportSectionKey[]]);

/** One of the single-dimension reports the AI report is made from, as sentences of that report. */
export const aiSourceInputSchema = z.object({
    system: snapshotSystemSchema,
    position: z.string().min(1),
    facts: z.array(z.string().min(1)),
    facets: z.array(z.string().min(1)),
    notes: z.array(z.string().min(1)),
});

/** What the insight rules found across several systems, as the model gets it: an id to cite, the rule's wording and the facts behind it. */
export const aiCandidateSchema = z.object({
    id: z.string().min(1),
    /** The rule's sentence, with its kind and whether its sources are independent */
    text: z.string().min(1),
    /** What the member can check against their life */
    hypothesis: z.string().min(1),
    /** The terms (facts) that made the rule fire */
    sources: z.array(z.string().min(1)),
});

/**
 * Everything the model may know: today's date (so that past, present and future mean something), the reports the member
 * brought, the insights the rules found across them when there are several, and the one question the member may have typed
 * (it is data to answer, never instructions).
 */
export const aiAnalysisInputSchema = z.object({
    today: z.string().min(1),
    sources: z.array(aiSourceInputSchema).min(1),
    candidates: z.array(aiCandidateSchema),
    question: z.string().min(1).optional(),
});

/** What the model returns; the checks on length, order and what is cited come after parsing. */
export const aiAnalysisOutputSchema = z.object({
    sections: z.array(z.object({
        key: sectionKeySchema,
        /** The lead: a short paragraph that says what the part comes to */
        content: z.string(),
        /** The points of the part, each a short label, a colon and a sentence or two; none for the parts that are only a lead */
        points: z.array(z.string()),
        /** The insights (by id) it rests on, when it rests on any */
        candidateIds: z.array(z.string()),
    })),
});

export type AiSourceInput = z.infer<typeof aiSourceInputSchema>;
export type AiCandidate = z.infer<typeof aiCandidateSchema>;
export type AiAnalysisInput = z.infer<typeof aiAnalysisInputSchema>;
export type AiAnalysisOutput = z.infer<typeof aiAnalysisOutputSchema>;
