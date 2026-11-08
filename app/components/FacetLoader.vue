<template>
    <svg
        class="facet-loader"
        :style="{ width: `${size}px` }"
        viewBox="0 0 100 90"
        role="img"
        :aria-label="label"
    >
        <circle
            class="facet-loader__ring facet-loader__ring--a"
            cx="38"
            cy="34"
            r="26"
        />
        <circle
            class="facet-loader__ring facet-loader__ring--b"
            cx="62"
            cy="34"
            r="26"
        />
        <circle
            class="facet-loader__ring facet-loader__ring--c"
            cx="50"
            cy="56"
            r="26"
        />
        <circle
            class="facet-loader__core"
            cx="50"
            cy="42"
            r="3"
        />
    </svg>
</template>

<script lang="ts" setup>
withDefaults(defineProps<{
    /** Width in px */
    size?: number;
    /** What the screen reader says while it runs */
    label?: string;
}>(), {
    size: 72,
    label: '處理中',
});
</script>

<style scoped>
/* The three circles of the brand mark: they drift apart and settle together again, over and over, while something is being worked out. */
.facet-loader {
    display: block;
    height: auto;
    color: rgb(var(--v-theme-primary));
    overflow: visible;
}

.facet-loader__ring {
    fill: currentColor;
    fill-opacity: 0.1;
    stroke: currentColor;
    stroke-opacity: 0.7;
    stroke-width: 1.5;
    animation: facet-gather 2.8s cubic-bezier(0.45, 0, 0.25, 1) infinite;
}

.facet-loader__ring--a {
    --from: -9px, -5px;
}

.facet-loader__ring--b {
    --from: 9px, -5px;
}

.facet-loader__ring--c {
    --from: 0, 10px;
}

.facet-loader__core {
    fill: rgb(var(--v-theme-accent));
    transform-origin: 50px 42px;
    animation: facet-pulse 2.8s ease-in-out infinite;
}

@keyframes facet-gather {
    0%,
    100% {
        transform: translate(var(--from));
    }

    50% {
        transform: translate(0, 0);
    }
}

@keyframes facet-pulse {
    0%,
    100% {
        opacity: 0.3;
        transform: scale(0.7);
    }

    50% {
        opacity: 1;
        transform: scale(1.2);
    }
}

/* Reduced motion: the circles rest together, the dot stays lit */
@media (prefers-reduced-motion: reduce) {
    .facet-loader__ring,
    .facet-loader__core {
        animation: none;
    }
}
</style>
