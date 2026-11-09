<template>
    <div class="takeaway">
        <span class="takeaway__label">{{ label }}</span>
        <div class="takeaway__body">
            <slot />
        </div>
    </div>
</template>

<script lang="ts" setup>
withDefaults(defineProps<{ label?: string }>(), { label: '重點' });
</script>

<style scoped>
/* The one-line answer of a card, ahead of the chart that shows it */
.takeaway {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 6px 12px;
    padding: 10px 14px;
    border-left: 4px solid rgb(var(--v-theme-primary));
    border-radius: 4px 12px 12px 4px;
    background: rgba(var(--v-theme-primary), 0.08);
}

.takeaway__label {
    flex: none;
    font-size: 0.75rem;
    font-weight: 700;
    letter-spacing: 0.12em;
    color: rgb(var(--v-theme-primary));
}

.takeaway__body {
    display: flex;
    flex: 1 1 12rem;
    flex-wrap: wrap;
    align-items: center;
    gap: 6px 8px;
    min-width: 0;
    font-size: 0.95rem;
    font-weight: 600;
}
</style>
