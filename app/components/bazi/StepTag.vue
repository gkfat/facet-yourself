<template>
    <!-- Which place of the reading a card has: a step of the order to look in, or something added to it -->
    <span
        class="tag"
        :class="step ? 'tag--step' : 'tag--extra'"
    >{{ step ? `第 ${step} 步` : '補充' }}</span>
</template>

<script lang="ts" setup>
defineProps<{
    /** The place in the order of the four steps; left out for a card that is only added to them */
    step?: 1 | 2 | 3 | 4;
}>();
</script>

<style scoped>
.tag {
    display: inline-block;
    margin-right: 8px;
    padding: 1px 8px;
    border: 1px solid;
    border-radius: 999px;
    font-family: var(--font-body);
    font-size: 0.75rem;
    font-weight: 600;
    letter-spacing: 0.04em;
    vertical-align: middle;
}

.tag--step {
    color: rgb(var(--v-theme-on-primary));
    border-color: rgb(var(--v-theme-primary));
    background: rgb(var(--v-theme-primary));
}

.tag--extra {
    color: rgba(var(--v-theme-on-surface), 0.7);
    border-color: rgba(var(--v-theme-on-surface), 0.3);
    background: transparent;
}
</style>
