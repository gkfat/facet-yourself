<template>
    <header
        :id="id"
        class="section-heading"
    >
        <h2 class="section-heading__title">
            {{ title }}
        </h2>
        <p class="section-heading__note">
            {{ note }}
        </p>
    </header>
</template>

<script lang="ts" setup>
defineProps<{
    /** The anchor the section nav jumps to */
    id: string;
    title: string;
    /** One line on what kind of information the section holds */
    note: string;
}>();
</script>

<style scoped>
.section-heading {
    margin: 32px 0 16px;
    padding-bottom: 8px;
    border-bottom: 2px solid rgb(var(--v-theme-primary));
    /* The anchor lands below the app bar and the section nav */
    scroll-margin-top: calc(var(--v-layout-top, 64px) + 56px);
}

.section-heading__title {
    font-size: 1.5rem;
    line-height: 1.3;
    letter-spacing: 0.06em;
}

.section-heading__note {
    margin: 2px 0 0;
    font-size: 0.875rem;
    color: rgba(var(--v-theme-on-surface), 0.7);
}
</style>
