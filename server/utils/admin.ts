import type { H3Event } from 'h3';
import { requireAuth } from './auth';
import { logEvent } from './logger';
import { ForbiddenError } from '../../shared/types/errors';
import type { AuthTokenPayload } from '../../shared/types/auth';

const GOOGLE_PROVIDER = 'google.com';

/**
 * Why a verified token is not an administrator, or null when it is one.
 * Every condition must hold: the `admin` claim, a verified email and a Google sign-in.
 */
export function adminDenialReason(auth: AuthTokenPayload): string | null {
    if (auth.admin !== true) return 'missing admin claim';
    if (auth.email_verified !== true) return 'email not verified';
    if (auth.signInProvider !== GOOGLE_PROVIDER) return 'not signed in with Google';

    return null;
}

/** Throw ForbiddenError unless the token belongs to the administrator. */
export function assertAdmin(auth: AuthTokenPayload): void {
    const reason = adminDenialReason(auth);

    if (!reason) return;

    logEvent({
        severity: 'WARNING',
        message: 'admin access denied',
        module: 'admin',
        action: 'requireAdmin',
        userId: auth.uid,
        data: { reason },
    });

    throw new ForbiddenError('Administrator access required');
}

/**
 * Require the super administrator for a route (401 when not signed in, 403 when not an administrator).
 * Usage: const admin = await requireAdmin(event);
 */
export async function requireAdmin(event: H3Event): Promise<AuthTokenPayload> {
    const auth = await requireAuth(event);

    assertAdmin(auth);

    return auth;
}
