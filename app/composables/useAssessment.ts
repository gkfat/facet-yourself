import {
    assessmentResultSchema, type AssessmentResult,
} from '../../shared/schemas/api/assessment.schema';

/** What has been answered so far: a scale fills `scale`; a pick fills `selected` and `ranked` */
export type AssessmentDraft = {
    scale: Record<string, number>;
    selected: string[];
    ranked: string[];
};

/** What a guest keeps in this tab: the result, and the draft it was made from so it can be saved after signing in */
type StoredResult = {
    result: AssessmentResult;
    draft: AssessmentDraft;
};

const emptyDraft = (): AssessmentDraft => ({
    scale: {}, selected: [], ranked: [],
});

function statusOf(error: unknown): number | undefined {
    if (typeof error !== 'object' || error === null) return undefined;

    const candidate = error as { statusCode?: number; status?: number };

    return candidate.statusCode ?? candidate.status;
}

function readJson(key: string): unknown {
    try {
        const raw = sessionStorage.getItem(key);

        return raw ? JSON.parse(raw) : null;
    } catch (error) {
        console.warn(`[useAssessment] ${key} unreadable:`, error);

        return null;
    }
}

function writeJson(key: string, value: unknown) {
    try {
        if (value === null) sessionStorage.removeItem(key);
        else sessionStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
        console.warn('[useAssessment] sessionStorage unavailable:', error);
    }
}

const stringList = (raw: unknown): string[] => (Array.isArray(raw) ? raw.filter((entry): entry is string => typeof entry === 'string') : []);

/** A draft as written to the tab before; whatever else is in it is dropped */
function draftOf(raw: unknown): AssessmentDraft {
    if (typeof raw !== 'object' || raw === null) return emptyDraft();

    const scale = 'scale' in raw && typeof raw.scale === 'object' && raw.scale !== null ? raw.scale : {};

    return {
        scale: Object.fromEntries(Object.entries(scale).filter((entry): entry is [string, number] => typeof entry[1] === 'number')),
        selected: stringList('selected' in raw ? raw.selected : null),
        ranked: stringList('ranked' in raw ? raw.ranked : null),
    };
}

/**
 * One self-analysis from the page's side: the answers given so far are kept in this tab (a reload does not lose them),
 * a signed-in member's result is read back from the server, and a guest's result lives only in this tab.
 */
export const useAssessment = (assessmentId: string, version: string) => {
    const {
        get, post,
    } = useApi();
    const { isAuthenticated } = useAuth();
    const draftKey = `assessmentDraft:${assessmentId}`;
    const resultKey = `assessmentResult:${assessmentId}`;

    const readDraft = (): AssessmentDraft => draftOf(readJson(draftKey));

    const writeDraft = (draft: AssessmentDraft) => writeJson(draftKey, draft);

    const readStored = (): StoredResult | null => {
        const raw = readJson(resultKey);

        if (typeof raw !== 'object' || raw === null) return null;

        const parsed = assessmentResultSchema.safeParse('result' in raw ? raw.result : null);

        return parsed.success
            ? {
                result: parsed.data, draft: draftOf('draft' in raw ? raw.draft : null),
            }
            : null;
    };

    /** Forget the result kept in this tab and the draft: the next time starts from nothing */
    const reset = () => {
        writeJson(resultKey, null);
        writeJson(draftKey, null);
    };

    /** Send the answers; a guest's result only shows, so it is kept in this tab with its draft, and the draft is cleared either way */
    const submit = async (draft: AssessmentDraft): Promise<AssessmentResult> => {
        const result = await post<AssessmentResult>(`/api/assessments/${assessmentId}/results`, {
            version,
            answers: Object.entries(draft.scale).map(([questionId, value]) => ({
                questionId, value,
            })),
            selected: draft.selected,
            ranked: draft.ranked,
        }, {}, 'optional');

        writeJson(resultKey, result.persisted
            ? null
            : {
                result, draft,
            });
        writeJson(draftKey, null);

        return result;
    };

    /** The result to show: the member's newest from the server, or the guest's from this tab; null when there is none */
    const loadLatest = async (): Promise<AssessmentResult | null> => {
        if (!isAuthenticated.value) return readStored()?.result ?? null;

        try {
            return await get<AssessmentResult>(`/api/assessments/${assessmentId}/results/latest`);
        } catch (error) {
            // 404 only means no result yet: a result the member made as a guest and has not saved can still be shown
            if (statusOf(error) === 404) return readStored()?.result ?? null;

            throw error;
        }
    };

    /** A guest's result waiting in this tab to be saved after signing in */
    const pendingSave = (): StoredResult | null => (isAuthenticated.value ? readStored() : null);

    /** Send what a guest answered, now that there is an account to keep it in */
    const savePending = async (): Promise<AssessmentResult | null> => {
        const stored = readStored();

        return stored ? submit(stored.draft) : null;
    };

    return {
        readDraft,
        writeDraft,
        submit,
        loadLatest,
        pendingSave,
        savePending,
        reset,
    };
};
