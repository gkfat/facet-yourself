import type { H3Event } from 'h3';
import {
    beforeEach, describe, expect, it, vi,
} from 'vitest';
import { requireViewer } from './viewer';
import { AuthError } from '../../shared/types/errors';

const holder = vi.hoisted(() => ({
    header: undefined as string | undefined,
    active: true,
}));

vi.mock('h3', () => ({ getHeader: () => holder.header }));
vi.mock('../services/guestSession.service', () => ({
    GuestSessionService: class {
        isActive() {
            return Promise.resolve(holder.active);
        }
    },
}));

const SESSION_ID = 'a'.repeat(32);

const eventOf = (auth: { uid: string } | null) => ({ context: { auth } }) as unknown as H3Event;

describe('requireViewer', () => {
    beforeEach(() => {
        holder.header = undefined;
        holder.active = true;
    });

    it('is the member when a token was verified, ignoring any session header', async () => {
        holder.header = SESSION_ID;

        expect(await requireViewer(eventOf({ uid: 'u1' }))).toEqual({
            kind: 'member', uid: 'u1',
        });
    });

    it('is the guest when a live session is sent', async () => {
        holder.header = SESSION_ID;

        expect(await requireViewer(eventOf(null))).toEqual({
            kind: 'guest', sessionId: SESSION_ID,
        });
    });

    it('is a 401 without a token or a session header', async () => {
        await expect(requireViewer(eventOf(null))).rejects.toBeInstanceOf(AuthError);
    });

    it('is a 401 for a malformed session header', async () => {
        holder.header = 'short';

        await expect(requireViewer(eventOf(null))).rejects.toBeInstanceOf(AuthError);
    });

    it('is a 401 for a session that is missing, expired or claimed', async () => {
        holder.header = SESSION_ID;
        holder.active = false;

        await expect(requireViewer(eventOf(null))).rejects.toBeInstanceOf(AuthError);
    });
});
