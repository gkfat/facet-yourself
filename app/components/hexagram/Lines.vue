<template>
    <svg
        class="lines"
        viewBox="0 0 120 108"
        role="img"
        :aria-label="label"
    >
        <title>{{ label }}</title>
        <!-- From the bottom: line 0 is the lowest. A solid bar is yang, a broken one yin. -->
        <g
            v-for="(isYang, index) in yang"
            :key="index"
            class="line"
            :class="{ 'line--shown': index < shown, 'line--moving': moving.includes(index + 1) }"
            :style="{ '--i': index }"
            :transform="`translate(0 ${88 - index * 17})`"
        >
            <template v-if="isYang">
                <rect
                    x="8"
                    y="0"
                    width="104"
                    height="9"
                    rx="2"
                    class="bar"
                />
            </template>
            <template v-else>
                <rect
                    x="8"
                    y="0"
                    width="44"
                    height="9"
                    rx="2"
                    class="bar"
                />
                <rect
                    x="68"
                    y="0"
                    width="44"
                    height="9"
                    rx="2"
                    class="bar"
                />
            </template>

        </g>
    </svg>
</template>

<script lang="ts" setup>
/**
 * The drawing of a hexagram from the bottom up, line by line. `shown` is how many lines are laid out so far, so the
 * page can lay a cast out one line after the other; the drawing itself is drawn, not written with the Unicode
 * hexagram characters, which many devices have no font for.
 */
const props = withDefaults(defineProps<{
    /** The six lines from the bottom: true for a solid (yang) line */
    yang: readonly boolean[];
    /** Positions (1 is the bottom) of the lines that are changing, drawn in the accent color */
    moving?: readonly number[];
    /** How many lines are laid out, from the bottom */
    shown?: number;
    /** What a screen reader says in place of the drawing */
    label: string;
}>(), {
    moving: () => [],
    shown: 6,
});

const shown = computed(() => props.shown);
</script>

<style scoped>
.lines {
    display: block;
    width: 120px;
    max-width: 100%;
    height: auto;
    overflow: visible;
}

.bar {
    fill: rgb(var(--v-theme-on-surface));
}

/* A line that is changing is drawn in the accent color: the same places are colored in the hexagram it turns into */
.line--moving .bar {
    fill: rgb(var(--v-theme-accent));
}

/* A line that is not laid out yet is invisible; it fades in when the page lays it out */
.line {
    opacity: 0;
    transition: opacity 0.35s ease;
}

.line--shown {
    opacity: 1;
}

@media (prefers-reduced-motion: reduce) {
    .line {
        transition: none;
    }
}
</style>
