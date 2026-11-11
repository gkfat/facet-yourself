import {
    describe, expect, it, vi,
} from 'vitest';
import { AppError } from '../../shared/types/errors';
import {
    ZIWEI_RULES_UNVERIFIED_CODE,
    ZiweiService,
} from './ziwei.service';

// A rule table that is not verified: the real guard throws this, so the mock stands in for a table added later as pending
vi.mock('../../shared/utils/ziwei/rules', async (importOriginal) => {
    const original = await importOriginal<typeof import('../../shared/utils/ziwei/rules')>();

    return {
        ...original,
        assertRulesVerified: () => {
            throw new original.UnverifiedRulesError(['birthYearTransformations']);
        },
    };
});

vi.mock('../utils/logger', () => ({ logEvent: vi.fn() }));

describe('ZiweiService with an unverified rule table', () => {
    it('refuses with 503 and a clear code, listing the unverified tables', () => {
        let thrown: unknown;

        try {
            new ZiweiService().calculate({
                birthDate: '1990-05-17',
                birthTime: '10:00',
                birthPlace: 'tw-taipei',
            });
        } catch (error) {
            thrown = error;
        }

        expect(thrown).toBeInstanceOf(AppError);
        expect((thrown as AppError).statusCode).toBe(503);
        expect((thrown as AppError).code).toBe(ZIWEI_RULES_UNVERIFIED_CODE);
        expect((thrown as AppError).details?.rules).toEqual(['birthYearTransformations']);
    });
});
