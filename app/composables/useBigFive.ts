import { BIG_FIVE_VERSION } from '../../shared/constants/bigFive';
import {
    bigFiveResultSchema, type BigFiveResult,
} from '../../shared/schemas/api/bigFive.schema';

const DRAFT_KEY = 'bigFiveDraft';
const RESULT_KEY = 'bigFiveResult';

export type BigFiveAnswers = Record<string, number>;

/** What a guest keeps in this tab: the result, and the answers it was made from so it can be saved after signing in */
type StoredResult = {
    result: BigFiveResult;
    answers: BigFiveAnswers;
};

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
        console.warn(`[useBigFive] ${key} unreadable:`, error);

        return null;
    }
}

function writeJson(key: string, value: unknown) {
    try {
        if (value === null) sessionStorage.removeItem(key);
        else sessionStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
        console.warn('[useBigFive] sessionStorage unavailable:', error);
    }
}

/** An object of numbers, as written to the tab before; whatever else is in it is dropped */
function numberRecord(raw: unknown): BigFiveAnswers {
    if (typeof raw !== 'object' || raw === null) return {};

    return Object.fromEntries(Object.entries(raw).filter((entry): entry is [string, number] => typeof entry[1] === 'number'));
}

const toList = (answers: BigFiveAnswers) => Object.entries(answers).map(([questionId, value]) => ({
    questionId, value,
}));

/**
 * The Big Five test from the page's side: the answers given so far are kept in this tab (a reload does not lose them), a
 * signed-in member's result is read back from the server, and a guest's result lives only in this tab.
 */
export const useBigFive = () => {
    const {
        get, post,
    } = useApi();
    const { isAuthenticated } = useAuth();
    const { restore } = useGuestSession();

    /** The answers given so far, as the draft kept in this tab */
    const readDraft = (): BigFiveAnswers => numberRecord(readJson(DRAFT_KEY));

    const writeDraft = (answers: BigFiveAnswers) => writeJson(DRAFT_KEY, answers);

    const readStored = (): StoredResult | null => {
        const raw = readJson(RESULT_KEY);

        if (typeof raw !== 'object' || raw === null) return null;

        const parsed = bigFiveResultSchema.safeParse('result' in raw ? raw.result : null);

        if (!parsed.success) return null;

        return {
            result: parsed.data, answers: numberRecord('answers' in raw ? raw.answers : null),
        };
    };

    /** Forget the result kept in this tab and the draft: the next test starts from nothing */
    const reset = () => {
        writeJson(RESULT_KEY, null);
        writeJson(DRAFT_KEY, null);
    };

    /**
     * Send the answers. A signed-in member's result is kept by the server; a guest's only shows, so it is kept in this
     * tab with its answers, and the draft is cleared either way.
     */
    const submit = async (answers: BigFiveAnswers): Promise<BigFiveResult> => {
        // The guest session (when there is one) lets the server hold the result against the MBTI the guest has taken
        restore();

        const result = await post<BigFiveResult>('/api/big-five/results', {
            version: BIG_FIVE_VERSION, answers: toList(answers),
        }, {}, 'optional');

        writeJson(RESULT_KEY, result.persisted
            ? null
            : {
                result, answers,
            });
        writeJson(DRAFT_KEY, null);

        return result;
    };

    /** The result to show: the member's newest from the server, or the guest's from this tab; null when there is none. */
    const loadLatest = async (): Promise<BigFiveResult | null> => {
        if (!isAuthenticated.value) return readStored()?.result ?? null;

        try {
            return await get<BigFiveResult>('/api/big-five/results/latest');
        } catch (error) {
            // 404 only means no result yet: a result the member made as a guest and has not saved can still be shown
            if (statusOf(error) === 404) return readStored()?.result ?? null;

            throw error;
        }
    };

    /** A guest's result waiting in this tab to be saved after signing in */
    const pendingSave = (): StoredResult | null => (isAuthenticated.value ? readStored() : null);

    /** Send what a guest answered, now that there is an account to keep it in */
    const savePending = async (): Promise<BigFiveResult | null> => {
        const stored = readStored();

        return stored ? submit(stored.answers) : null;
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
