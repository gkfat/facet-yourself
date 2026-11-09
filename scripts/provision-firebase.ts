import { readFileSync } from 'node:fs';
import { getApps } from 'firebase-admin/app';
import { getSecurityRules } from 'firebase-admin/security-rules';
import { getScriptFirestore } from './lib/admin.ts';

/**
 * One-time (idempotent) Firebase setup that normally needs the Firebase CLI:
 *  - release firestore.rules
 *  - single-field index exemptions for the expiry job (collection-group queries on `expiresAt`)
 *  - single-field index exemptions for the admin dashboard (collection-group queries on `drawnAt` and `createdAt`)
 *  - TTL policies for guestSessions, welcomeGrants and rateLimits
 * Usage: node scripts/provision-firebase.ts [--dry-run]
 */
const dryRun = process.argv.includes('--dry-run');

const TTL_GROUPS = [
    'guestSessions',
    'welcomeGrants',
    'rateLimits',
];
const EXPIRY_QUERY_GROUPS = [
    'testAttempts',
    'humanDesign',
    'tarotDraws',
    'kinUnlocks',
    'runeDraws',
    'reportSnapshots',
    'assessmentAttempts',
    'aiReports',
];
/** Fields the admin dashboard queries across all members: the daily draws by `drawnAt`, the AI reports by `createdAt`. */
const DASHBOARD_FIELD_INDEXES = [
    {
        group: 'tarotDraws', field: 'drawnAt',
    },
    {
        group: 'runeDraws', field: 'drawnAt',
    },
    {
        group: 'aiReports', field: 'createdAt',
    },
];

getScriptFirestore();
const app = getApps()[0];

if (!app) throw new Error('Firebase app was not initialised');

const projectId = getApps()[0]?.options.projectId as string;
const accessToken = (await app.options.credential?.getAccessToken())?.access_token;

if (!accessToken) throw new Error('Could not obtain an access token from the service account');

const base = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)`;

async function patchField(group: string, field: string, mask: string, body: Record<string, unknown>) {
    const name = `projects/${projectId}/databases/(default)/collectionGroups/${group}/fields/${field}`;
    const response = await fetch(`${base}/collectionGroups/${group}/fields/${field}?updateMask=${mask}`, {
        method: 'PATCH',
        headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            name, ...body,
        }),
    });

    if (!response.ok) {
        const detail = await response.text();

        throw new Error(`${group}.${field}.${mask}: HTTP ${response.status} ${detail.slice(0, 300)}`);
    }
}

const failures: string[] = [];

async function attempt(label: string, work: () => Promise<void>) {
    if (dryRun) {
        console.log(`[dry-run] ${label}`);
        return;
    }

    try {
        await work();
        console.log(`ok: ${label}`);
    } catch (error) {
        failures.push(label);
        console.error(`FAILED: ${label}: ${error instanceof Error ? error.message : String(error)}`);
    }
}

await attempt('release firestore.rules', async () => {
    await getSecurityRules(app).releaseFirestoreRulesetFromSource(readFileSync('firestore.rules', 'utf8'));
});

for (const group of EXPIRY_QUERY_GROUPS) {
    await attempt(`index exemption ${group}.expiresAt (collection group)`, () => patchField(group, 'expiresAt', 'indexConfig', {
        indexConfig: {
            indexes: [
                {
                    queryScope: 'COLLECTION_GROUP', fields: [
                        {
                            fieldPath: 'expiresAt', order: 'ASCENDING',
                        },
                    ],
                }, {
                    queryScope: 'COLLECTION', fields: [
                        {
                            fieldPath: 'expiresAt', order: 'ASCENDING',
                        },
                    ],
                },
            ],
        },
    }));
}

for (const {
    group, field,
} of DASHBOARD_FIELD_INDEXES) {
    await attempt(`index exemption ${group}.${field} (collection group)`, () => patchField(group, field, 'indexConfig', {
        indexConfig: {
            indexes: [
                // Both directions: the AI reports are read newest first
                ...(['COLLECTION_GROUP', 'COLLECTION'] as const).flatMap((queryScope) => (['ASCENDING', 'DESCENDING'] as const).map((order) => ({
                    queryScope, fields: [
                        {
                            fieldPath: field, order,
                        },
                    ],
                }))),
            ],
        },
    }));
}

for (const group of TTL_GROUPS) {
    await attempt(`TTL ${group}.expiresAt`, () => patchField(group, 'expiresAt', 'ttlConfig', { ttlConfig: {} }));
}

if (failures.length > 0) {
    console.error(`${failures.length} step(s) failed.`);
    process.exit(1);
}
