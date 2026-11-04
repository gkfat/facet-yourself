import {
    describe, expect, it,
} from 'vitest';
import { aiQuestionSchema } from './aiQuestion.schema';

describe('aiQuestionSchema', () => {
    it('trims the question and treats an empty one as none', () => {
        expect(aiQuestionSchema.parse('  我適合換工作嗎？ ')).toBe('我適合換工作嗎？');
        expect(aiQuestionSchema.parse('   ')).toBeUndefined();
        expect(aiQuestionSchema.parse(undefined)).toBeUndefined();
    });

    it('accepts 100 characters and turns away 101', () => {
        expect(aiQuestionSchema.safeParse('問'.repeat(100)).success).toBe(true);
        expect(aiQuestionSchema.safeParse('問'.repeat(101)).success).toBe(false);
    });

    it('turns away a question that is not text', () => {
        expect(aiQuestionSchema.safeParse(5).success).toBe(false);
    });
});
