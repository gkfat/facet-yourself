import {
    describe, expect, it,
} from 'vitest';
import {
    HEXACO_ASSESSMENT, HEXACO_DIMENSIONS, HEXACO_ITEMS,
} from './hexaco';
import { findDefinitionIssues } from './index';
import { fixedContentBodySchema } from '../schemas/firestore/fixedContent.schema';
import { assembleMultiReport } from '../report/assembleMultiReport';
import { mbtiReportInput } from '../report/adapters/mbti';
import content from '../../content/fixed/hexaco.json';

const answerAll = (value: (dimension: string, reversed: boolean) => number) => HEXACO_ITEMS.map((item) => ({
    questionId: item.id, value: value(item.dimension, item.reversed === true),
}));

describe('HEXACO', () => {
    it('is a sound definition, with 10 items for each of the six dimensions, and reversed items in each', () => {
        expect(findDefinitionIssues(HEXACO_ASSESSMENT)).toEqual([]);
        expect(HEXACO_ITEMS).toHaveLength(60);

        for (const dimension of HEXACO_DIMENSIONS) {
            const own = HEXACO_ITEMS.filter((item) => item.dimension === dimension);

            expect(own).toHaveLength(10);
            expect(own.some((item) => item.reversed)).toBe(true);
        }
    });

    it('turns a reversed item over: agreeing with every statement of a dimension is not the top of it', () => {
        const result = HEXACO_ASSESSMENT.evaluate(answerAll(() => 5));

        expect(result).toMatchObject({
            scores: HEXACO_DIMENSIONS.map((dimension) => ({
                dimension, score: 50, level: 'mid',
            })), 
        });
    });

    it('gives a high level when the answers lean to one end of every dimension, and a low level for the other end', () => {
        const high = HEXACO_ASSESSMENT.evaluate(answerAll((_, reversed) => (reversed ? 1 : 5)));
        const low = HEXACO_ASSESSMENT.evaluate(answerAll((_, reversed) => (reversed ? 5 : 1)));

        expect(high).toMatchObject({
            scores: HEXACO_DIMENSIONS.map((dimension) => ({
                dimension, score: 100, level: 'high',
            })), 
        });
        expect(low).toMatchObject({
            scores: HEXACO_DIMENSIONS.map((dimension) => ({
                dimension, score: 0, level: 'low',
            })), 
        });
    });

    it('asks for the content of each dimension at its level, and every one of them is in the published file', () => {
        const result = HEXACO_ASSESSMENT.evaluate(answerAll((_, reversed) => (reversed ? 1 : 5)));
        const keys = HEXACO_ASSESSMENT.contentKeysOf(result);

        expect(keys).toEqual(HEXACO_DIMENSIONS.map((dimension) => `hexaco_${dimension}_high`));
        expect(content.map((row) => row.key).sort()).toEqual([...HEXACO_ASSESSMENT.allContentKeys].sort());
    });

    it('has a content body that is valid and carries the disclaimer about our own items, without calling any level a defect', () => {
        for (const row of content) {
            const body = fixedContentBodySchema.parse(row.body);

            expect(body.disclaimer).toContain('沒有經過信度與效度驗證');
            expect(`${body.title}${body.summary}`).not.toMatch(/缺陷|不誠實|病/);
        }
    });

    it('maps both ends of every dimension, and nothing else', () => {
        const terms = new Set(HEXACO_ASSESSMENT.traitMappings.map((entry) => entry.term));

        expect(terms.size).toBe(12);
        expect(HEXACO_ASSESSMENT.traitMappings.every((entry) => entry.system === 'HEXACO' && entry.kind === 'trait')).toBe(true);
    });

    it('reports what it found for a multi-dimension report, grounded in terms of its own', () => {
        const result = HEXACO_ASSESSMENT.evaluate(answerAll((dimension, reversed) => (dimension === 'openness' ? (reversed ? 5 : 1) : reversed ? 1 : 5)));
        const contents = Object.fromEntries(content.map((row) => [
            row.key, {
                ...fixedContentBodySchema.parse(row.body), contentType: 'ASSESSMENT' as const, key: row.key, contentVersion: '1',
            },
        ]));
        const input = HEXACO_ASSESSMENT.reportInput(result, contents);

        expect(input.system).toBe('HEXACO');
        expect(input.facts).toHaveLength(6);
        expect(input.traits).toContain('hexaco:openness:low');
        expect(input.traits).toContain('hexaco:conscientiousness:high');
        expect(input.basis[0]).toMatchObject({
            system: 'HEXACO', ruleVersion: 'hexaco-ref-v1',
        });
    });

    it('can be put together with another system in a multi-dimension report, and the report names it', () => {
        const result = HEXACO_ASSESSMENT.evaluate(answerAll((_, reversed) => (reversed ? 1 : 5)));
        const contents = Object.fromEntries(content.map((row) => [
            row.key, {
                ...fixedContentBodySchema.parse(row.body), contentType: 'ASSESSMENT' as const, key: row.key, contentVersion: '1',
            },
        ]));
        const mbti = mbtiReportInput({
            type: 'ISTJ', dimensions: null, testVersion: null, body: fixedContentBodySchema.parse(content[0]?.body),
        });
        const report = assembleMultiReport([HEXACO_ASSESSMENT.reportInput(result, contents), mbti], []);

        expect(report.systems).toEqual(expect.arrayContaining(['HEXACO', 'MBTI']));
        expect(JSON.stringify(report.blocks)).toContain('自製的 HEXACO 人格問卷');
    });
});
