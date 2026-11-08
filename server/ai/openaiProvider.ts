import type OpenAI from 'openai';
import { zodResponseFormat } from 'openai/helpers/zod';
import {
    AiOutputError, type AiReportGeneration, type AiReportProvider, type GenerateOptions,
} from './provider';
import {
    REPORT_PROMPT_VERSION, buildReportSystemPrompt, buildReportUserPrompt,
} from './reportPrompt';
import type { ReasoningEffort } from '../../shared/constants/ai';
import {
    aiAnalysisOutputSchema, type AiAnalysisInput,
} from '../../shared/schemas/firestore/aiAnalysis.schema';

type OpenAiProviderOptions = {
    client: Pick<OpenAI, 'chat'>;
    model: string;
    maxOutputTokens: number;
    reasoningEffort: ReasoningEffort;
};

/**
 * OpenAI via the official SDK. The response is constrained to the report schema
 * (structured outputs), then checked again by assessAiReport before anyone sees it.
 */
export class OpenAiReportProvider implements AiReportProvider {
    readonly promptVersion = REPORT_PROMPT_VERSION;

    private readonly client: Pick<OpenAI, 'chat'>;
    private readonly model: string;
    private readonly maxOutputTokens: number;
    private readonly reasoningEffort: ReasoningEffort;

    constructor(options: OpenAiProviderOptions) {
        this.client = options.client;
        this.model = options.model;
        this.maxOutputTokens = options.maxOutputTokens;
        this.reasoningEffort = options.reasoningEffort;
    }

    async generate(input: AiAnalysisInput, options: GenerateOptions): Promise<AiReportGeneration> {
        const completion = await this.client.chat.completions.parse({
            model: this.model,
            max_completion_tokens: this.maxOutputTokens,
            reasoning_effort: this.reasoningEffort,
            messages: [
                {
                    role: 'system', content: buildReportSystemPrompt(input.question !== undefined, input.candidates.length > 0),
                }, {
                    role: 'user', content: buildReportUserPrompt(input),
                },
            ],
            response_format: zodResponseFormat(aiAnalysisOutputSchema, 'ai_report'),
        }, { signal: options.signal });

        const choice = completion.choices[0];

        if (!choice || !completion.usage) throw new AiOutputError('UNPARSEABLE');
        if (choice.message.refusal || choice.finish_reason === 'content_filter') throw new AiOutputError('REFUSED');
        if (choice.finish_reason === 'length') throw new AiOutputError('TRUNCATED');
        if (!choice.message.parsed) throw new AiOutputError('UNPARSEABLE');

        return {
            output: choice.message.parsed,
            usage: {
                inputTokens: completion.usage.prompt_tokens,
                outputTokens: completion.usage.completion_tokens,
            },
            modelName: completion.model,
        };
    }
}
