import {
    describe, expect, it,
} from 'vitest';
import { multiReportRequestSchema } from './multiReport.schema';

describe('multiReportRequestSchema', () => {
    it('accepts two or more different lasting systems', () => {
        expect(multiReportRequestSchema.safeParse({ systems: ['ZODIAC', 'MBTI'] }).success).toBe(true);
    });

    it('turns away one system, a system twice, today\'s systems and a self-analysis that is not defined', () => {
        expect(multiReportRequestSchema.safeParse({ systems: ['ZODIAC'] }).success).toBe(false);
        expect(multiReportRequestSchema.safeParse({ systems: ['ZODIAC', 'ZODIAC'] }).success).toBe(false);
        expect(multiReportRequestSchema.safeParse({ systems: ['ZODIAC', 'TAROT'] }).success).toBe(false);
        expect(multiReportRequestSchema.safeParse({ systems: ['ZODIAC', 'ENNEAGRAM'] }).success).toBe(false);
    });
});
