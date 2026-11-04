import type { HomePreviewResponse } from '../../shared/schemas/api/home.schema';
import {
    createPreviewLoader, previewKeyOf,
} from '../utils/homePreview';

/** Typing in the date fills it in step by step; ask only once it has settled. */
const SETTLE_MS = 300;

/** One for the whole visit: an answer is kept, so going back and forth between dates asks nothing twice. */
const loader = createPreviewLoader((key) => $fetch('/api/home/preview', {
    query: {
        sign: key.sign, lifePath: key.lifePath,
    },
}));

/**
 * The sign and life path number of the birth date, which are known at once, and the summaries of both, which
 * follow when the server has answered (never, when it does not: the names stand on their own).
 */
export function useHomePreview(birthDate: Ref<string>) {
    const key = computed(() => previewKeyOf(birthDate.value));
    // The same sign and number are the same question, whatever the date
    const keyId = computed(() => (key.value ? `${key.value.sign}|${key.value.lifePath}` : ''));
    const summaries = ref<HomePreviewResponse | null>(null);

    let timer: ReturnType<typeof setTimeout> | null = null;
    let latest = 0;

    function stopWaiting() {
        if (!timer) return;

        clearTimeout(timer);
        timer = null;
    }

    watch(keyId, () => {
        stopWaiting();
        latest += 1;
        summaries.value = null;

        const asked = key.value;

        if (!asked) return;

        const mine = latest;

        timer = setTimeout(async () => {
            timer = null;

            const answer = await loader.load(asked);

            // An answer for a date that has since been changed is of no use
            if (mine === latest) summaries.value = answer;
        }, SETTLE_MS);
    }, { immediate: true });

    onScopeDispose(stopWaiting);

    return {
        key, summaries,
    };
}
