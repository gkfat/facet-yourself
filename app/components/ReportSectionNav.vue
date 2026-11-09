<template>
    <nav
        class="section-nav"
        :class="{ 'section-nav--sticky': sticky }"
        aria-label="報告章節"
    >
        <v-btn
            v-for="item in items"
            :key="item.id"
            size="small"
            variant="tonal"
            rounded="pill"
            @click="jump(item.id)"
        >
            {{ item.label }}
        </v-btn>
        <!-- Something that belongs with the sections, at the far end (the guide to reading) -->
        <div class="section-nav__extra">
            <slot />
        </div>
    </nav>
</template>

<script lang="ts" setup>
withDefaults(defineProps<{
    items: ReadonlyArray<{ id: string; label: string }>;
    /** Stays under the app bar while the report scrolls (the section nav); off for an index inside a section */
    sticky?: boolean;
}>(), { sticky: true });

function jump(id: string) {
    const target = document.getElementById(id);

    if (!target) {
        console.error('[report-nav] section not found:', id);

        return;
    }

    const calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    target.scrollIntoView({
        behavior: calm ? 'auto' : 'smooth', block: 'start',
    });
}
</script>

<style scoped>
.section-nav {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin: 0 -4px 16px;
    padding: 8px 4px;
}

/* Stays under the app bar while the report scrolls */
.section-nav--sticky {
    position: sticky;
    top: var(--v-layout-top, 64px);
    z-index: 4;
    background: rgb(var(--v-theme-background));
}

.section-nav__extra {
    margin-left: auto;
}
</style>
