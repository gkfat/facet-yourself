import {
    describe, expect, it,
} from 'vitest';
import {
    RESILIENCE_ASSESSMENT as assessment, RESILIENCE_DIMENSIONS, RESILIENCE_ITEMS,
} from './resilience';
import { findDefinitionIssues } from './index';
import { fixedContentBodySchema } from '../schemas/firestore/fixedContent.schema';
import content from '../../content/fixed/resilience.json';

/** Answers that make a dimension read high, low or about in the middle */
const answers = (lean: Record<string, 'high' | 'low' | 'mid'>) => RESILIENCE_ITEMS.map((item) => {
    const side = lean[item.dimension] ?? 'mid';
    const toward = side === 'high' ? 5 : 1;
    const value = side === 'mid' ? 3 : item.reversed ? 6 - toward : toward;

    return {
        questionId: item.id, value,
    };
});

type Scores = { scores: { dimension: string; score: number; level: string }[] };

describe('resilience', () => {
    it('is a sound definition with six items for each of the four dimensions, at least one turned against it', () => {
        expect(findDefinitionIssues(assessment)).toEqual([]);
        expect(RESILIENCE_ITEMS).toHaveLength(24);
        expect(assessment.kind === 'scale' && assessment.view).toBe('profile');

        for (const dimension of RESILIENCE_DIMENSIONS) {
            const own = RESILIENCE_ITEMS.filter((item) => item.dimension === dimension);

            expect(own).toHaveLength(6);
            expect(own.some((item) => item.reversed)).toBe(true);
        }
    });

    it('turns a reversed item over before it counts', () => {
        // Agreeing with everything, reversed items included, cannot reach the top
        const result = assessment.evaluate(RESILIENCE_ITEMS.map((item) => ({
            questionId: item.id, value: 5,
        }))) as Scores;

        expect(result.scores.every((entry) => entry.score < 100)).toBe(true);
    });

    it('scores each dimension on its own with its level', () => {
        const result = assessment.evaluate(answers({
            recovery: 'high', coping: 'low', support: 'mid', meaning: 'high',
        })) as Scores;
        const levelOf = (dimension: string) => result.scores.find((entry) => entry.dimension === dimension)?.level;

        expect(levelOf('recovery')).toBe('high');
        expect(levelOf('coping')).toBe('low');
        expect(levelOf('support')).toBe('mid');
        expect(levelOf('meaning')).toBe('high');
    });

    it('rejects answers that are missing or out of range', () => {
        expect(() => assessment.evaluate(answers({}).slice(1))).toThrow(RangeError);
    });

    it('says a low level is a resource not yet used, and points to professional help, without judging', () => {
        const lines = (assessment.notesOf?.(assessment.evaluate(answers({ coping: 'low' }))) ?? []).join('');

        expect(lines).toContain('較少用到');
        expect(lines).toContain('不是心理評估或診斷');
        expect(lines).toContain('尋求專業協助');
        expect(lines).not.toMatch(/脆弱|不健康|不足/);
    });

    it('has a content for each dimension and level, none judging, each pointing to professional help', () => {
        expect(content.map((row) => row.key).sort()).toEqual([...assessment.allContentKeys].sort());

        for (const row of content) {
            const body = fixedContentBodySchema.parse(row.body);

            expect(body.disclaimer).toContain('尋求專業協助');
            expect(body.growthPractice).not.toBeNull();
            expect(JSON.stringify(body)).not.toMatch(/脆弱|不健康|障礙|病態|治療/);
        }

        for (const row of content.filter((entry) => entry.key.endsWith('_low'))) {
            expect(row.body.summary).toContain('目前較少用到');
        }
    });

    it('maps the terms it speaks of to ends of the axes', () => {
        expect(assessment.traitMappings.length).toBeGreaterThan(0);
        expect(new Set(assessment.traitMappings.map((entry) => entry.term)).size).toBe(5);
    });
});
