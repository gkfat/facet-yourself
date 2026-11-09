import type { Firestore } from 'firebase-admin/firestore';
import type { ImportRow } from '../../shared/utils/fixedContentImport.ts';
import { fixedContentId } from '../../shared/utils/fixedContentKeys.ts';

export type ApplyOutcome = {
    created: string[];
    updated: string[];
    unchanged: string[];
};

/**
 * Whether two stored values are the same content. The order of the fields of an object does not matter (Firestore hands
 * a map back with its fields sorted, the import file has them in the order of the schema), the order of a list does.
 */
export function sameContent(a: unknown, b: unknown): boolean {
    if (Array.isArray(a) || Array.isArray(b)) {
        return Array.isArray(a) && Array.isArray(b) && a.length === b.length && a.every((item, index) => sameContent(item, b[index]));
    }

    if (a !== null && b !== null && typeof a === 'object' && typeof b === 'object') {
        const left = a as Record<string, unknown>;
        const right = b as Record<string, unknown>;
        const keys = Object.keys(left);

        return keys.length === Object.keys(right).length && keys.every((key) => Object.hasOwn(right, key) && sameContent(left[key], right[key]));
    }

    return a === b;
}

/**
 * Write rows into fixedContents/{type}_{key}. The document id is derived from
 * the content, so re-importing a combination updates it instead of duplicating it.
 * contentVersion only increases when body or status actually changed.
 */
export async function applyFixedContent(
    db: Firestore,
    rows: readonly ImportRow[],
    now: number,
): Promise<ApplyOutcome> {
    const outcome: ApplyOutcome = {
        created: [], updated: [], unchanged: [],
    };

    for (const row of rows) {
        const id = fixedContentId(row.contentType, row.key);
        const ref = db.collection('fixedContents').doc(id);

        await db.runTransaction(async (tx) => {
            const snap = await tx.get(ref);
            const current = snap.exists
                ? snap.data() as { body: unknown; status: string; contentVersion: string; publishedAt: number | null }
                : null;

            if (current && sameContent(current.body, row.body) && current.status === row.status) {
                outcome.unchanged.push(id);
                return;
            }

            const publishedAt = row.status === 'PUBLISHED'
                ? (current?.status === 'PUBLISHED' && current.publishedAt ? current.publishedAt : now)
                : null;

            tx.set(ref, {
                contentType: row.contentType,
                key: row.key,
                body: row.body,
                contentVersion: String(current ? Number(current.contentVersion) + 1 : 1),
                status: row.status,
                updatedAt: now,
                publishedAt,
            });

            (current ? outcome.updated : outcome.created).push(id);
        });
    }

    return outcome;
}
