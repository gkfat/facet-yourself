import {
    describe, expect, it, vi,
} from 'vitest';
import { calculateChart } from './chart';
import { UnverifiedRulesError } from './rules';

// A rule table that is not verified: the real guard throws this, so the mock stands in for a table added later as pending
vi.mock('./rules', async (importOriginal) => {
    const original = await importOriginal<typeof import('./rules')>();

    return {
        ...original,
        assertRulesVerified: () => {
            throw new original.UnverifiedRulesError(['birthYearTransformations']);
        },
    };
});

describe('calculateChart with an unverified rule table', () => {
    it('refuses to chart instead of using the table', () => {
        expect(() => calculateChart({
            birthDate: '1990-05-17',
            birthTime: '10:00',
            standardOffsetMinutes: 480,
            instant: new Date('1990-05-17T10:00:00+08:00'),
        })).toThrow(UnverifiedRulesError);
    });
});
