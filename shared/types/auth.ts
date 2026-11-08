/**
 * Verified Firebase ID token claims we rely on.
 */
export type AuthTokenPayload = {
    uid: string;
    email?: string;
    email_verified?: boolean;
    /**
     * Stable Google account id (token claim firebase.identities['google.com']).
     * Unlike uid it survives deleting and recreating the Firebase Auth user,
     * so the welcome-grant ledger keys on it.
     */
    googleSub?: string;
    /** Custom claim `admin`: true only for the super administrator (set by `pnpm admin:grant`). */
    admin?: boolean;
    /** Token claim firebase.sign_in_provider, e.g. `google.com`. */
    signInProvider?: string;
};
