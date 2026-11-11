import { z } from 'zod';
import {
    fixedContentBodySchema,
    fixedContentStatusSchema,
    fixedContentTypeSchema,
} from '../schemas/firestore/fixedContent.schema.ts';
import {
    expectedFixedContentIds, fixedContentId, isValidContentKey,
} from './fixedContentKeys.ts';
import { findForbiddenHexagramWords } from './hexagramWording.ts';
import {
    ZIWEI_DISCLAIMER, findForbiddenZiweiWords, findZiweiWordingIssues,
} from './ziweiWording.ts';

/**
 * Import file rows. JSON rows carry a nested body; CSV rows are flat and are
 * converted to the same shape. Lists in CSV are separated with `|`.
 */
/**
 * Where a Zi Wei reading comes from, kept in the import file (which is in version control), not in the stored document.
 * The chart rules and the written interpretation are recorded apart, and a reading that is not a draft says who reviewed it.
 */
export const ziweiProvenanceSchema = z.object({
    /** The rule set the chart is laid out by, e.g. the algorithm version and what it was checked against */
    algorithmSource: z.string().trim().min(1),
    /** What the written interpretation rests on; never a book or a site copied as it is */
    interpretationSource: z.string().trim().min(1),
    /** ORIGINAL: written by a person for this site. AI_DRAFT: drafted with an AI and needs a person's review. */
    authoring: z.enum(['ORIGINAL', 'AI_DRAFT']),
    reviewedBy: z.string().trim().min(1).nullable().default(null),
});

export type ZiweiProvenance = z.infer<typeof ziweiProvenanceSchema>;

export const importRowSchema = z.object({
    contentType: fixedContentTypeSchema,
    key: z.string().min(1),
    body: fixedContentBodySchema,
    status: fixedContentStatusSchema.default('DRAFT'),
    provenance: ziweiProvenanceSchema.optional(),
}).superRefine((row, ctx) => {
    if (!isValidContentKey(row.contentType, row.key)) {
        ctx.addIssue({
            code: 'custom',
            path: ['key'],
            message: `"${row.key}" is not a legal key for ${row.contentType}`,
        });
    }

    // A reading of a hexagram is the state of one moment: no verdicts of luck, no certainty, no clinical or money advice.
    if (row.contentType === 'HEXAGRAM') {
        const found = findForbiddenHexagramWords(JSON.stringify(row.body));

        if (found.length > 0) {
            ctx.addIssue({
                code: 'custom',
                path: ['body'],
                message: `a hexagram reading must not use: ${found.join('、')}`,
            });
        }
    }

    // A Zi Wei reading is a symbolic reading for self-exploration: tentative wording, no verdicts of luck, and a recorded origin.
    if (row.contentType === 'ZIWEI') {
        // The fixed disclaimer is checked as a whole below; the wording check is for the part written for this reading
        const {
            disclaimer, ...written 
        } = row.body;

        for (const message of findZiweiWordingIssues(row.key, JSON.stringify(written))) {
            ctx.addIssue({
                code: 'custom', path: ['body'], message,
            });
        }

        // It begins with the fixed sentence; a reading may add a reminder after it (the health palace does), which has to keep to the wording rules too
        if (!disclaimer.startsWith(ZIWEI_DISCLAIMER)) {
            ctx.addIssue({
                code: 'custom',
                path: ['body', 'disclaimer'],
                message: `the disclaimer of a Zi Wei reading has to begin with: ${ZIWEI_DISCLAIMER}`,
            });
        } else {
            const added = findForbiddenZiweiWords(disclaimer.slice(ZIWEI_DISCLAIMER.length));

            if (added.length > 0) {
                ctx.addIssue({
                    code: 'custom',
                    path: ['body', 'disclaimer'],
                    message: `what is added to the disclaimer must not use: ${added.join('、')}`,
                });
            }
        }

        if (!row.provenance) {
            ctx.addIssue({
                code: 'custom',
                path: ['provenance'],
                message: 'a Zi Wei reading has to record its algorithm source, interpretation source and how it was written',
            });
        } else if (row.status !== 'DRAFT' && row.provenance.reviewedBy === null) {
            ctx.addIssue({
                code: 'custom',
                path: ['provenance', 'reviewedBy'],
                message: `a Zi Wei reading with status ${row.status} has to name who reviewed it`,
            });
        }
    }

    // The page puts each strength's "when overused" note on that strength's card, matched by name.
    // A strength without a note, or a note without a strength, would show as a half-empty or stray card.
    if (row.body.overuse.length > 0) {
        const strengths = new Set(row.body.strengths.map((name) => name.trim()));
        const noted = new Set(row.body.overuse.map((item) => item.strength.trim()));
        const missing = [...strengths].filter((name) => !noted.has(name));
        const stray = [...noted].filter((name) => !strengths.has(name));

        if (missing.length > 0 || stray.length > 0) {
            ctx.addIssue({
                code: 'custom',
                path: ['body', 'overuse'],
                message: `strengths and overuse must list the same names (no note for: ${missing.join('、') || '-'}; not a strength: ${stray.join('、') || '-'})`,
            });
        }
    }
});

export type ImportRow = z.infer<typeof importRowSchema>;

export type ImportError = {
    /** 1-based position in the file (JSON array index or CSV data row) */
    row: number;
    message: string;
};

export type ParsedImport = {
    rows: ImportRow[];
    errors: ImportError[];
};

/** RFC 4180-style CSV: quoted fields, doubled quotes, CRLF or LF. */
export function parseCsvRecords(text: string): string[][] {
    const records: string[][] = [];
    let record: string[] = [];
    let field = '';
    let inQuotes = false;

    for (let i = 0; i < text.length; i += 1) {
        const char = text[i];

        if (inQuotes) {
            if (char === '"' && text[i + 1] === '"') {
                field += '"';
                i += 1;
            } else if (char === '"') {
                inQuotes = false;
            } else {
                field += char;
            }
            continue;
        }

        if (char === '"') {
            inQuotes = true;
        } else if (char === ',') {
            record.push(field);
            field = '';
        } else if (char === '\n' || char === '\r') {
            if (char === '\r' && text[i + 1] === '\n') i += 1;
            record.push(field);
            field = '';
            if (record.some((value) => value !== '')) records.push(record);
            record = [];
        } else {
            field += char;
        }
    }

    record.push(field);
    if (record.some((value) => value !== '')) records.push(record);

    return records;
}

const LIST_COLUMNS = ['strengths', 'blindSpots'] as const;

function splitList(value: string): string[] {
    return value.split('|').map((item) => item.trim()).filter((item) => item !== '');
}

function csvRecordToRaw(header: string[], record: string[]): Record<string, unknown> {
    const cell = (name: string) => (record[header.indexOf(name)] ?? '').trim();
    const body: Record<string, unknown> = {};

    for (const name of header) {
        if ([
            'contentType',
            'key',
            'status',
        ].includes(name)) continue;

        body[name] = (LIST_COLUMNS as readonly string[]).includes(name)
            ? splitList(cell(name))
            : cell(name);
    }

    return {
        contentType: cell('contentType'),
        key: cell('key'),
        status: cell('status') || undefined,
        body,
    };
}

function validateRaw(raws: unknown[]): ParsedImport {
    const rows: ImportRow[] = [];
    const errors: ImportError[] = [];
    const seen = new Set<string>();

    raws.forEach((raw, index) => {
        const result = importRowSchema.safeParse(raw);
        const row = index + 1;

        if (!result.success) {
            const message = result.error.issues
                .map((issue) => `${issue.path.join('.') || '(row)'}: ${issue.message}`)
                .join('; ');

            errors.push({
                row, message,
            });
            return;
        }

        const id = fixedContentId(result.data.contentType, result.data.key);

        if (seen.has(id)) {
            errors.push({
                row, message: `duplicate entry for ${id}`,
            });
            return;
        }

        seen.add(id);
        rows.push(result.data);
    });

    return {
        rows, errors,
    };
}

export function parseImportJson(text: string): ParsedImport {
    let data: unknown;

    try {
        data = JSON.parse(text);
    } catch (error) {
        return {
            rows: [],
            errors: [
                {
                    row: 0,
                    message: `invalid JSON: ${error instanceof Error ? error.message : String(error)}`,
                },
            ],
        };
    }

    if (!Array.isArray(data)) {
        return {
            rows: [],
            errors: [
                {
                    row: 0, message: 'JSON must be an array of rows',
                },
            ],
        };
    }

    return validateRaw(data);
}

export function parseImportCsv(text: string): ParsedImport {
    const [header, ...records] = parseCsvRecords(text.charCodeAt(0) === 0xFEFF ? text.slice(1) : text);

    if (!header) {
        return {
            rows: [],
            errors: [
                {
                    row: 0, message: 'CSV is empty',
                },
            ],
        };
    }

    const missing = [
        'contentType',
        'key',
        'title',
        'summary',
        'disclaimer',
    ].filter((name) => !header.includes(name));

    if (missing.length > 0) {
        return {
            rows: [],
            errors: [
                {
                    row: 0, message: `CSV is missing columns: ${missing.join(', ')}`,
                },
            ],
        };
    }

    return validateRaw(records.map((record) => csvRecordToRaw(header, record)));
}

export type CoverageReport = {
    expected: number;
    published: number;
    /** expected ids with no document at all */
    missing: string[];
    /** documents that exist but are not PUBLISHED */
    unpublished: string[];
    /** documents whose id is not an expected combination */
    unexpected: string[];
    complete: boolean;
};

/**
 * Compare stored documents with the full list of required ones (FR-009).
 */
export function computeCoverage(docs: ReadonlyArray<{ id: string; status: string }>): CoverageReport {
    const expectedIds = expectedFixedContentIds();
    const expectedSet = new Set(expectedIds);
    const byId = new Map(docs.map((doc) => [doc.id, doc.status]));

    const missing = expectedIds.filter((id) => !byId.has(id));
    const unpublished = expectedIds.filter((id) => byId.has(id) && byId.get(id) !== 'PUBLISHED');
    const unexpected = docs.map((doc) => doc.id).filter((id) => !expectedSet.has(id));
    const published = expectedIds.length - missing.length - unpublished.length;

    return {
        expected: expectedIds.length,
        published,
        missing,
        unpublished,
        unexpected,
        complete: missing.length === 0 && unpublished.length === 0,
    };
}
