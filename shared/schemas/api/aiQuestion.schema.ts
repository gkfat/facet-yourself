import { z } from 'zod';
import { AI_QUESTION_MAX_LENGTH } from '../../constants/ai';

/** The optional question that goes with an AI analysis: trimmed, at most 100 characters, and none when it is left empty. */
export const aiQuestionSchema = z.string()
    .trim()
    .refine((value) => [...value].length <= AI_QUESTION_MAX_LENGTH, `the question is at most ${AI_QUESTION_MAX_LENGTH} characters`)
    .transform((value) => (value === '' ? undefined : value))
    .optional();
