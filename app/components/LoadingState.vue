<template>
    <div
        class="loading-state"
        role="status"
    >
        <FacetLoader
            :size="size"
            :label="label"
        />
        <p
            v-if="text"
            class="loading-state__text"
        >
            {{ text }}
        </p>
    </div>
</template>

<script lang="ts" setup>
withDefaults(defineProps<{
    /** Width of the circles in px */
    size?: number;
    /** What a screen reader says while it loads */
    label?: string;
    /** An optional line under the circles, for waits worth explaining */
    text?: string;
}>(), {
    size: 64,
    label: '載入中',
    text: undefined,
});
</script>

<style scoped>
/* What every screen shows while its content is on the way: the brand's three circles, centered where the content will be */
.loading-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    padding: 24px 0;
}

.loading-state__text {
    margin: 0;
    font-size: 0.875rem;
    color: rgba(var(--v-theme-on-surface), 0.65);
}
</style>
