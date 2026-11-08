import { getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getScriptFirestore } from './lib/admin.ts';
import {
    applyAdminClaim, parseAdminArgs,
} from './lib/adminClaims.ts';

/**
 * Grant or revoke the `admin` custom claim that opens /admin.
 * Usage: pnpm admin:grant <email> [--revoke]
 * The account must already exist in Firebase Authentication (sign in once on the site).
 * The person has to sign out and in again for a new token to carry the change.
 */
let command;

try {
    command = parseAdminArgs(process.argv.slice(2));
} catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
}

// Initialises the firebase-admin app from the same credentials as the server.
getScriptFirestore();

const app = getApps()[0];

if (!app) throw new Error('Firebase app was not initialised');

const auth = getAuth(app);
const {
    email, revoke, 
} = command;

try {
    const user = await auth.getUserByEmail(email);

    await auth.setCustomUserClaims(user.uid, applyAdminClaim(user.customClaims, revoke));

    if (revoke) {
        // Make tokens already issued stop working at their next refresh.
        await auth.revokeRefreshTokens(user.uid);
        console.log(`Revoked admin for ${email} (uid ${user.uid}).`);
    } else {
        const google = user.providerData.some((provider) => provider.providerId === 'google.com');

        console.log(`Granted admin to ${email} (uid ${user.uid}). Sign out and in again for it to take effect.`);
        if (!google) console.warn('Warning: this account has no Google sign-in; /admin requires one.');
        if (!user.emailVerified) console.warn('Warning: this account\'s email is not verified; /admin requires it.');
    }
} catch (error) {
    if (typeof error === 'object' && error !== null && (error as { code?: unknown }).code === 'auth/user-not-found') {
        console.error(`No Firebase Authentication user with email ${email}. Sign in on the site with that account once, then run this again.`);
    } else {
        console.error(`Failed: ${error instanceof Error ? error.message : String(error)}`);
    }
    process.exit(1);
}
