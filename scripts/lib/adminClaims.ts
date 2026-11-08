import { z } from 'zod';

export type AdminCommand = {
    email: string;
    revoke: boolean;
};

const emailSchema = z.string().trim().pipe(z.email());

/**
 * Read `<email> [--revoke]` from the command line. Throws a readable error for anything else,
 * so a typo never reaches Firebase.
 */
export function parseAdminArgs(argv: string[]): AdminCommand {
    const revoke = argv.includes('--revoke');
    const rest = argv.filter((arg) => arg !== '--revoke');
    const unknown = rest.find((arg) => arg.startsWith('-'));

    if (unknown) throw new Error(`Unknown option: ${unknown}`);
    if (rest.length !== 1) throw new Error('Usage: pnpm admin:grant <email> [--revoke]');

    const parsed = emailSchema.safeParse(rest[0]);

    if (!parsed.success) throw new Error(`Not a valid email address: ${rest[0]}`);

    return {
        email: parsed.data, revoke,
    };
}

/** The custom claims after granting or revoking `admin`; every other claim is kept as it is. */
export function applyAdminClaim(existing: Record<string, unknown> | undefined, revoke: boolean): Record<string, unknown> {
    const claims = { ...existing };

    delete claims.admin;

    return revoke ? claims : {
        ...claims, admin: true,
    };
}
