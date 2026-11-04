import type { H3Event } from 'h3';
import { getHeader } from 'h3';
import { GuestSessionService } from '../services/guestSession.service';
import { guestSessionIdSchema } from '../../shared/schemas/firestore/guestSession.schema';
import { AuthError } from '../../shared/types/errors';

/** Who is asking: a signed-in member, or a visitor holding a live guest session. */
export type Viewer =
    | { kind: 'member'; uid: string }
    | { kind: 'guest'; sessionId: string };

/**
 * Resolve the viewer of a route classified `optional`. The middleware has already verified a token when one was
 * sent. A malformed session header counts as no session, and a session that is missing, expired or claimed is not
 * usable: both end in 401.
 */
export async function requireViewer(event: H3Event): Promise<Viewer> {
    const uid = event.context.auth?.uid;

    if (uid) return {
        kind: 'member', uid,
    };

    const sessionId = guestSessionIdSchema.safeParse(getHeader(event, 'x-guest-session-id'));

    if (!sessionId.success) throw new AuthError('Sign in or start a guest session first');

    if (!(await new GuestSessionService().isActive(sessionId.data))) {
        throw new AuthError('The guest session has expired');
    }

    return {
        kind: 'guest', sessionId: sessionId.data,
    };
}
