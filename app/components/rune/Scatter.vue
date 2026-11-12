<template>
    <div
        class="scatter"
        :class="{ 'scatter--in': shown, 'scatter--busy': busy }"
        role="group"
        aria-label="選一顆符石"
    >
        <div
            v-for="index in RUNE_COUNT"
            :key="index"
            class="scatter__cell"
        >
            <div
                class="scatter__stone"
                :class="{ 'scatter__stone--picked': picked === index - 1, 'scatter__stone--other': picked !== null && picked !== index - 1 }"
                :style="styleOf(index - 1)"
            >
                <RuneStone
                    :rune="null"
                    :flipped="false"
                    :interactive="shown && !busy"
                    :busy="busy && picked === index - 1"
                    compact
                    @reveal="emit('pick', index - 1)"
                />
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { RUNE_COUNT } from '../../../shared/constants/runes';

/**
 * All 24 stones lying face down, each nudged and turned a little, so that choosing one feels like drawing it.
 * Which one is chosen makes no difference to the result: the day's rune is fixed by the account and the date, and
 * the backs are all the same so that none of them seems to stand for a particular rune.
 */
defineProps<{
    /** Position of the stone the member chose, while the draw is under way */
    picked: number | null;
    busy: boolean;
}>();

const emit = defineEmits<{ pick: [index: number] }>();

/**
 * A fixed pseudo-random scatter (the same every time): the nudge in px and the turn in degrees of stone `index`.
 * Each stone stays well inside its own cell, so none touches another.
 */
function styleOf(index: number) {
    return {
        '--dx': `${((index * 7) % 21) - 10}px`,
        '--dy': `${((index * 11) % 29) - 14}px`,
        '--r': `${((index * 13) % 33) - 16}deg`,
        '--n': index,
    };
}

// The stones come up one after another once the page is up, so the scattering is seen.
const shown = ref(false);

onMounted(() => {
    setTimeout(() => {
        shown.value = true;
    }, 60);
});
</script>

<style scoped>
.scatter {
    --stone-width: clamp(44px, 9vw, 68px);

    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(calc(var(--stone-width) * 1.55), 1fr));
    gap: 4px;
    width: 100%;
    max-width: 780px;
    margin: 0 auto;
    padding: 20px 12px;
    border-radius: 16px;

    /* A dark cloth the stones are cast on: a fine weave over the night blue of the other fortune slates, darker at the edges */
    background:
        radial-gradient(120% 100% at 50% 40%, rgba(0, 0, 0, 0) 55%, rgba(0, 0, 0, 0.4) 100%),
        repeating-linear-gradient(45deg, rgba(255, 255, 255, 0.035) 0 1px, rgba(255, 255, 255, 0) 1px 4px),
        repeating-linear-gradient(-45deg, rgba(0, 0, 0, 0.14) 0 1px, rgba(0, 0, 0, 0) 1px 4px),
        radial-gradient(120% 90% at 50% 0%, #2b3763 0%, rgba(43, 55, 99, 0) 70%),
        linear-gradient(180deg, #1c2547 0%, #141a35 100%);
    box-shadow: inset 0 2px 14px rgba(0, 0, 0, 0.5);
}

.scatter__cell {
    display: flex;
    align-items: center;
    justify-content: center;
    height: calc(var(--stone-width) * 1.25 + 34px);
}

.scatter__stone {
    opacity: 0;
    transform: translate(0, 0) rotate(0deg) scale(0.5);
    transition: transform 0.5s cubic-bezier(0.2, 0.8, 0.2, 1), opacity 0.4s ease;
    transition-delay: calc(var(--n) * 25ms);
}

.scatter--in .scatter__stone {
    opacity: 1;
    transform: translate(var(--dx), var(--dy)) rotate(var(--r)) scale(1);
}

.scatter--in:not(.scatter--busy) .scatter__stone:hover,
.scatter--in:not(.scatter--busy) .scatter__stone:focus-within {
    transform: translate(var(--dx), calc(var(--dy) - 8px)) rotate(var(--r)) scale(1);
    transition-delay: 0s;
}

.scatter__stone--picked {
    transition-delay: 0s;
}

.scatter__stone--other {
    opacity: 0.2;
    transition-delay: 0s;
}

@media (prefers-reduced-motion: reduce) {
    .scatter__stone {
        transition: none;
    }
}
</style>
