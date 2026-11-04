import type {
    AiAnalysisInput, AiAnalysisOutput,
} from '../../shared/schemas/firestore/aiAnalysis.schema';

/**
 * What the app needs from an AI service. Only the OpenAI implementation exists;
 * nothing above this file depends on which model answers.
 */
export type AiGeneration<Output> = {
    output: Output;
    usage: {
        inputTokens: number;
        outputTokens: number;
    };
    modelName: string;
};

export type GenerateOptions = {
    /** Aborted when the attempt runs out of time. */
    signal: AbortSignal;
};

export type AiReportGeneration = AiGeneration<AiAnalysisOutput>;

/** The AI report: the member's reports (and question) read by one mentor (see `AiReportService`). */
export type AiReportProvider = {
    generate(input: AiAnalysisInput, options: GenerateOptions): Promise<AiReportGeneration>;
};

/**
 * The model answered, but not with a usable report (refusal, cut off, or not parseable).
 * `reason` is safe to store and show; it never contains model output.
 */
export class AiOutputError extends Error {
    readonly reason: 'REFUSED' | 'TRUNCATED' | 'UNPARSEABLE';

    constructor(reason: AiOutputError['reason']) {
        super(`AI output unusable: ${reason}`);
        this.name = 'AiOutputError';
        this.reason = reason;
    }
}
