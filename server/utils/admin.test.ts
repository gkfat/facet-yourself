import type { H3Event } from 'h3';
import {
    describe, expect, it, vi,
} from 'vitest';
import {
    adminDenialReason, assertAdmin, requireAdmin,
} from './admin';
import {
    AuthError, ForbiddenError,
} from '../../shared/types/errors';
import type { AuthTokenPayload } from '../../shared/types/auth';

const holder = vi.hoisted(() => ({ auth: null as unknown }));

vi.mock('./logger', () => ({ logEvent: vi.fn() }));
vi.mock('./auth', () => ({
    requireAuth: () => {
        if (!holder.auth) return Promise.reject(new AuthError('Missing or invalid authorization header'));

        return Promise.resolve(holder.auth);
    },
}));

const admin: AuthTokenPayload = {
    uid: 'u1',
    email: 'boss@example.com',
    email_verified: true,
    admin: true,
    signInProvider: 'google.com',
};

describe('assertAdmin', () => {
    it('accepts the administrator', () => {
        expect(adminDenialReason(admin)).toBeNull();
        expect(() => assertAdmin(admin)).not.toThrow();
    });

    it.each([
        ['no admin claim', { admin: undefined }],
        ['admin claim false', { admin: false }],
        ['email not verified', { email_verified: false }],
        ['email verification missing', { email_verified: undefined }],
        ['not a Google sign-in', { signInProvider: 'password' }],
        ['sign-in provider missing', { signInProvider: undefined }],
    ])('refuses with 403 when %s', (_name, patch) => {
        const auth = {
            ...admin, ...patch,
        };

        expect(adminDenialReason(auth)).not.toBeNull();

        try {
            assertAdmin(auth);
            expect.unreachable('assertAdmin should have thrown');
        } catch (error) {
            expect(error).toBeInstanceOf(ForbiddenError);
            expect((error as ForbiddenError).statusCode).toBe(403);
        }
    });
});

describe('requireAdmin', () => {
    const event = {} as H3Event;

    it('returns the administrator', async () => {
        holder.auth = admin;

        await expect(requireAdmin(event)).resolves.toEqual(admin);
    });

    it('lets the authentication error through when nobody is signed in', async () => {
        holder.auth = null;

        await expect(requireAdmin(event)).rejects.toBeInstanceOf(AuthError);
    });

    it('answers 403 for a signed-in member without the claim', async () => {
        holder.auth = {
            ...admin, admin: false,
        };

        await expect(requireAdmin(event)).rejects.toBeInstanceOf(ForbiddenError);
    });
});
