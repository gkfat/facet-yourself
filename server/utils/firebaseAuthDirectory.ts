import { getAuth } from 'firebase-admin/auth';
import type { UserRecord } from 'firebase-admin/auth';
import { getFirebaseAdminApp } from './firebaseAdmin';

/** What the back office needs to know about a Firebase Authentication account. */
export type AuthAccount = {
    uid: string;
    disabled: boolean;
    lastSignInAt: number | null;
    /** The latest of the sign-in and the ID token refresh: a signed-in member opening the site refreshes it (about hourly). */
    lastActiveAt: number | null;
};

/** The Firebase Authentication calls of the user management, behind a seam so tests need no Firebase. */
export type AuthDirectory = {
    /** The accounts that exist among these uids (at most 100 per call). */
    getAccounts: (uids: string[]) => Promise<AuthAccount[]>;
    getAccount: (uid: string) => Promise<AuthAccount | null>;
    findUidByEmail: (email: string) => Promise<string | null>;
    /** Disabling also revokes refresh tokens, so no new ID token can be obtained. */
    setDisabled: (uid: string, disabled: boolean) => Promise<void>;
};

const FIREBASE_BATCH_LIMIT = 100;

function isNotFound(error: unknown): boolean {
    return typeof error === 'object' && error !== null && (error as { code?: unknown }).code === 'auth/user-not-found';
}

function toAccount(record: UserRecord): AuthAccount {
    const signedIn = record.metadata.lastSignInTime ? Date.parse(record.metadata.lastSignInTime) : Number.NaN;

    const refreshed = record.metadata.lastRefreshTime ? Date.parse(record.metadata.lastRefreshTime) : Number.NaN;
    const times = [signedIn, refreshed].filter((time) => !Number.isNaN(time));

    return {
        uid: record.uid,
        disabled: record.disabled,
        lastSignInAt: Number.isNaN(signedIn) ? null : signedIn,
        lastActiveAt: times.length > 0 ? Math.max(...times) : null,
    };
}

export function createFirebaseAuthDirectory(): AuthDirectory {
    const auth = () => getAuth(getFirebaseAdminApp());

    return {
        async getAccounts(uids) {
            if (uids.length > FIREBASE_BATCH_LIMIT) {
                throw new RangeError(`At most ${FIREBASE_BATCH_LIMIT} accounts can be read at once`);
            }

            if (uids.length === 0) return [];

            const result = await auth().getUsers(uids.map((uid) => ({ uid })));

            return result.users.map(toAccount);
        },

        async getAccount(uid) {
            try {
                return toAccount(await auth().getUser(uid));
            } catch (error) {
                if (isNotFound(error)) return null;

                throw error;
            }
        },

        async findUidByEmail(email) {
            try {
                return (await auth().getUserByEmail(email)).uid;
            } catch (error) {
                if (isNotFound(error)) return null;

                throw error;
            }
        },

        async setDisabled(uid, disabled) {
            await auth().updateUser(uid, { disabled });

            if (disabled) await auth().revokeRefreshTokens(uid);
        },
    };
}
