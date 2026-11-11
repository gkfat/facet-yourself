import {
    describe, expect, it,
} from 'vitest';
import { ziweiRequestSchema } from './ziwei.schema';

const valid = {
    birthDate: '1990-05-17',
    birthTime: '10:00',
};

function issuePaths(input: unknown): string[] {
    const result = ziweiRequestSchema.safeParse(input);

    return result.success ? [] : result.error.issues.map((issue) => issue.path.join('.'));
}

describe('ziweiRequestSchema', () => {
    it('accepts a date and a time, with or without a place', () => {
        expect(ziweiRequestSchema.safeParse(valid).success).toBe(true);
        expect(ziweiRequestSchema.safeParse({
            ...valid,
            birthPlace: 'tw-taipei',
        }).success).toBe(true);
        expect(ziweiRequestSchema.safeParse({
            ...valid,
            birthPlace: null,
        }).success).toBe(true);
    });

    it('requires the birth time and never accepts null for it', () => {
        expect(issuePaths({ birthDate: '1990-05-17' })).toContain('birthTime');
        expect(issuePaths({
            ...valid,
            birthTime: null,
        })).toContain('birthTime');
    });

    it('rejects a malformed time', () => {
        expect(issuePaths({
            ...valid,
            birthTime: '9:00',
        })).toContain('birthTime');
        expect(issuePaths({
            ...valid,
            birthTime: '24:00',
        })).toContain('birthTime');
    });

    it('rejects a date that does not exist', () => {
        expect(issuePaths({
            ...valid,
            birthDate: '2023-02-30',
        })).toContain('birthDate');
        expect(issuePaths({
            ...valid,
            birthDate: '1990-5-17',
        })).toContain('birthDate');
    });

    it('rejects a future date', () => {
        expect(issuePaths({
            ...valid,
            birthDate: '2099-01-01',
        })).toContain('birthDate');
    });

    it('rejects a year before the supported range and states the range', () => {
        const result = ziweiRequestSchema.safeParse({
            ...valid,
            birthDate: '1900-12-31',
        });

        expect(result.success).toBe(false);
        expect(JSON.stringify(result.error?.issues)).toContain('1901–2099');
    });

    it('accepts the first supported year', () => {
        expect(ziweiRequestSchema.safeParse({
            ...valid,
            birthDate: '1901-01-01',
        }).success).toBe(true);
    });

    it('rejects a place that is not in the preset list', () => {
        expect(issuePaths({
            ...valid,
            birthPlace: 'nowhere',
        })).toContain('birthPlace');
    });
});
