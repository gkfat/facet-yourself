import { z } from 'zod';
import { snapshotSystemSchema } from './reportSnapshot.schema';

/**
 * The parts of an AI report after the facts, in the order the model writes them: what stands out, each strength with what
 * it costs, the member seen across past, present and future, an answer to what they asked (only when they asked), a
 * conclusion, and the summary of all of it (written last so that it sums up what was written, shown first). Each part is a
 * short lead and, for most, a list of points: how many are laid down here, so that what the model is asked for, what is
 * checked and what is shown are the same.
 */
export const AI_REPORT_SECTIONS = [
    {
        key: 'highlights', title: '值得注意的點', points: {
            min: 3, max: 5, 
        },
    },
    {
        key: 'tradeoffs', title: '優勢與代價', points: {
            min: 3, max: 5, 
        },
    },
    {
        // One point: the question that checks the guess about the past against the member's own life
        key: 'past', title: '過去', points: {
            min: 1, max: 1, 
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
    {
        key: 'summary', title: '一句話總結', points: {
            min: 0, max: 0, 
        },
    },
] as const;

export type AiReportSectionKey = typeof AI_REPORT_SECTIONS[number]['key'];

/** The sections an answer has to contain, in order: the answer to the question is only there when a question was asked. */
export const aiReportSectionKeys = (hasQuestion: boolean): AiReportSectionKey[] => AI_REPORT_SECTIONS
    .map((section) => section.key)
    .filter((key) => hasQuestion || key !== 'question');

const sectionKeySchema = z.enum(AI_REPORT_SECTIONS.map((section) => section.key) as [AiReportSectionKey, ...AiReportSectionKey[]]);

/**
 * One of the single-dimension reports the AI report is made from, as sentences of that report: the facts, the traits they
 * point at, what the tradition says of the result (the reviewed readings), how the traits meet (each with the question that
 * checks it) and the practices of the reading. The model writes from these and from nothing else.
 */
export const aiSourceInputSchema = z.object({
    system: snapshotSystemSchema,
    position: z.string().min(1),
    facts: z.array(z.string().min(1)),
    facets: z.array(z.string().min(1)),
    readings: z.array(z.string().min(1)),
    interactions: z.array(z.string().min(1)),
    practices: z.array(z.string().min(1)),
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
        points: z.array(z.object({
            text: z.string(),
            /** The systems (as the reports name them) the point rests on; none when it rests on the reports as a whole */
            systems: z.array(z.string()),
        })),
        /** The insights (by id) it rests on, when it rests on any */
        candidateIds: z.array(z.string()),
    })),
});

export type AiSourceInput = z.infer<typeof aiSourceInputSchema>;
export type AiCandidate = z.infer<typeof aiCandidateSchema>;
export type AiAnalysisInput = z.infer<typeof aiAnalysisInputSchema>;
export type AiAnalysisOutput = z.infer<typeof aiAnalysisOutputSchema>;
