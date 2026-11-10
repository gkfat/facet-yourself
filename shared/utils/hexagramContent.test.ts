import {
    describe, expect, it,
} from 'vitest';
import hexagram from '../../content/fixed/hexagram.json';
import {
    HEXAGRAMS, hexagramContentKeys,
} from '../constants/hexagrams';
import { importRowSchema } from './fixedContentImport';
import { findForbiddenHexagramWords } from './hexagramWording';

describe('content/fixed/hexagram.json', () => {
    it('has exactly the 448 readings of the 64 hexagrams and their lines, each once', () => {
        const keys = hexagram.map((row) => row.key);

        expect(keys).toHaveLength(448);
        expect(new Set(keys).size).toBe(448);
        expect([...keys].sort()).toEqual(hexagramContentKeys().sort());
    });

    it('is valid import rows of the HEXAGRAM type', () => {
        for (const row of hexagram) {
            const parsed = importRowSchema.safeParse(row);

            expect(parsed.success, `${row.key}: ${parsed.success ? '' : parsed.error.message}`).toBe(true);
            expect(row.contentType).toBe('HEXAGRAM');
        }
    });

    it('uses none of the words a reading must not use', () => {
        const found = hexagram.map((row) => ({
            key: row.key, words: findForbiddenHexagramWords(JSON.stringify(row.body)),
        })).filter((entry) => entry.words.length > 0);

        expect(found).toEqual([]);
    });

    it('names each hexagram and each line in its titles, so a reading is never shown under the wrong one', () => {
        const byKey = new Map(hexagram.map((row) => [row.key, row.body.title]));

        for (const entry of HEXAGRAMS) {
            expect(byKey.get(String(entry.order)), `hexagram ${entry.order}`).toContain(entry.name);

            for (let position = 1; position <= 6; position += 1) {
                expect(byKey.get(`${entry.order}_${position}`), `${entry.order}_${position}`).toContain(entry.name);
            }
        }
    });

    it('carries the statement that it is a state of the moment and not a prediction', () => {
        for (const row of hexagram) {
            expect(row.body.disclaimer, row.key).toContain('不預測未來');
        }
    });

    it('has a summary and advice for every reading, and the hexagram readings also name strengths, a blind spot, the five areas of life and a question to think over', () => {
        for (const row of hexagram) {
            expect(row.body.summary.trim(), row.key).not.toBe('');
            expect(row.body.growthAdvice.trim(), row.key).not.toBe('');

            if (!row.key.includes('_')) {
                expect(row.body.strengths.length, row.key).toBeGreaterThan(0);
                expect(row.body.blindSpots.length, row.key).toBeGreaterThan(0);
                expect(row.body.dailyBehavior.trim(), row.key).not.toBe('');
                expect(Object.values(row.body.lifeContexts), row.key).toHaveLength(5);
                expect(Object.values(row.body.lifeContexts).every((text) => text.trim() !== ''), row.key).toBe(true);
                expect(Object.values(row.body.growthReflection).every((text) => text.trim() !== ''), row.key).toBe(true);
            }
        }
    });
});
