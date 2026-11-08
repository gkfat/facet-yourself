/**
 * Detailed-report generation settings (CTX-CON-014, NFR-008, NFR-009).
 * They are plain constants so they can be tuned in one place after launch.
 */
export const DEFAULT_OPENAI_MODEL = 'gpt-5-mini';

/** List price (USD per million tokens) of the default model at the time of writing. */
export const DEFAULT_AI_PRICE_INPUT_PER_MTOK = 0.25;
export const DEFAULT_AI_PRICE_OUTPUT_PER_MTOK = 2;

/** How hard the model thinks before it writes; the reasoning counts against the output cap, and `minimal` is the cheapest. */
export const REASONING_EFFORTS = [
    'minimal',
    'low',
    'medium',
    'high',
] as const;

export type ReasoningEffort = typeof REASONING_EFFORTS[number];

/** Reading across several reports takes more than the wording of one: `OPENAI_REASONING_EFFORT` turns it down again. */
export const DEFAULT_REASONING_EFFORT: ReasoningEffort = 'low';

/** Upper bound for one report's output, reasoning included (decision: standard length). */
export const REPORT_MAX_OUTPUT_TOKENS = 12_000;

/** What the model is given of each report's reviewed readings: this many, each cut at this many characters (a birth chart has dozens). */
export const AI_READINGS_PER_SOURCE = 8;
export const AI_READING_MAX_CHARS = 300;

/** One generation attempt is abandoned after this long and counts as a failure (NFR-009). */
export const REPORT_TIMEOUT_MS = 120_000;

/**
 * A report still GENERATING this long after it was created lost its worker
 * (the function was killed): it is failed and refunded the next time it is read.
 */
export const REPORT_STALE_AFTER_MS = REPORT_TIMEOUT_MS + 60_000;

/** Per member: at most 3 generations an hour and 10 a day, regeneration included. */
export const REPORT_LIMIT_PER_HOUR = 3;
export const REPORT_LIMIT_PER_DAY = 10;

export const REPORT_RETENTION_MONTHS = 6;

export const REPORT_DISCLAIMER = '本報告為娛樂與自我探索用途，由 AI 依你提供的資料產生，不代表心理評估、診斷或專業建議，也不應作為重要決策的唯一依據。';

/** Points for the AI analysis of one system's report (the base report is free). */
export const SINGLE_ANALYSIS_COST = 1;

/** The member's own question that may go with an AI analysis, in characters. */
export const AI_QUESTION_MAX_LENGTH = 100;
