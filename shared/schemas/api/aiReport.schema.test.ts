import {
    describe, expect, it,
} from 'vitest';
import { aiReportRequestSchema } from './aiReport.schema';

describe('aiReportRequestSchema', () => {
    it('accepts one system, or several different ones', () => {
        expect(aiReportRequestSchema.safeParse({ systems: ['ZODIAC'] }).success).toBe(true);
        expect(aiReportRequestSchema.safeParse({ systems: ['ZODIAC', 'MBTI'] }).success).toBe(true);
    });

    it('turns away no system, a system twice, today\'s systems and a self-analysis that is not defined', () => {
        expect(aiReportRequestSchema.safeParse({ systems: [] }).success).toBe(false);
        expect(aiReportRequestSchema.safeParse({ systems: ['ZODIAC', 'ZODIAC'] }).success).toBe(false);
        expect(aiReportRequestSchema.safeParse({ systems: ['ZODIAC', 'TAROT'] }).success).toBe(false);
        expect(aiReportRequestSchema.safeParse({ systems: ['ZODIAC', 'NOT_A_SYSTEM'] }).success).toBe(false);
    });

    it('takes an optional question of at most 100 characters', () => {
        expect(aiReportRequestSchema.parse({ systems: ['ZODIAC'] }).question).toBeUndefined();
        expect(aiReportRequestSchema.parse({
            systems: ['ZODIAC'], question: ' 想問的事 ',
        }).question).toBe('想問的事');
        expect(aiReportRequestSchema.safeParse({
            systems: ['ZODIAC'], question: '問'.repeat(101),
        }).success).toBe(false);
    });
});
