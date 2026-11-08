import {
    describe, expect, it,
} from 'vitest';
import {
    applyAdminClaim, parseAdminArgs,
} from './adminClaims';

describe('parseAdminArgs', () => {
    it('reads an email', () => {
        expect(parseAdminArgs(['boss@example.com'])).toEqual({
            email: 'boss@example.com', revoke: false,
        });
    });

    it('reads --revoke before or after the email', () => {
        expect(parseAdminArgs(['--revoke', 'boss@example.com']).revoke).toBe(true);
        expect(parseAdminArgs(['boss@example.com', '--revoke']).revoke).toBe(true);
    });

    it('refuses a missing, extra or malformed email and unknown options', () => {
        expect(() => parseAdminArgs([])).toThrow('Usage');
        expect(() => parseAdminArgs(['a@example.com', 'b@example.com'])).toThrow('Usage');
        expect(() => parseAdminArgs(['not-an-email'])).toThrow('valid email');
        expect(() => parseAdminArgs(['a@example.com', '--force'])).toThrow('Unknown option');
    });
});

describe('applyAdminClaim', () => {
    it('adds admin and keeps the other claims', () => {
        expect(applyAdminClaim({ plan: 'x' }, false)).toEqual({
            plan: 'x', admin: true,
        });
        expect(applyAdminClaim(undefined, false)).toEqual({ admin: true });
    });

    it('removes only admin on revoke', () => {
        expect(applyAdminClaim({
            plan: 'x', admin: true,
        }, true)).toEqual({ plan: 'x' });
        expect(applyAdminClaim(undefined, true)).toEqual({});
    });
});
