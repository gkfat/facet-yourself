<template>
    <v-app>
        <NuxtLayout>
            <NuxtPage />
        </NuxtLayout>
    </v-app>
</template>

<script lang="ts" setup>
useHead({
    titleTemplate: '%s | Facet yourself',
    meta: [
        {
            property: 'og:type',
            content: 'website',
        },
        {
            property: 'og:locale',
            content: 'zh_TW',
        },
    ],
});
</script>

<style>
/* A page with a full-width banner: its own stacking context keeps the banner's backdrop behind the content. */
.report-page {
    position: relative;
    isolation: isolate;
}

/* In-page links (the cards that point to the form) glide instead of jumping. */
@media (prefers-reduced-motion: no-preference) {
    html {
        scroll-behavior: smooth;
    }
}

/* Outlined cards use a soft grey edge everywhere, not the text color. */
.v-card--variant-outlined {
    border-color: rgba(var(--v-theme-night), 0.12);
    /* Opaque, so a backdrop behind the card (a banner) does not show through its header */
    background-color: rgb(var(--v-theme-surface));
}

/*
 * Alerts are one quiet color each: a faint wash and a hairline edge in the type's color, the icon in that color,
 * and the text in the page's own ink, so a notice reads as part of the page and not as a colored bar.
 */
.v-alert.v-alert--variant-tonal {
    border: 1px solid color-mix(in srgb, currentColor 24%, transparent);
    border-radius: 10px;
}

.v-alert.v-alert--variant-tonal .v-alert__underlay {
    opacity: 0.07;
}

.v-alert.v-alert--variant-tonal .v-alert__content {
    color: rgba(var(--v-theme-on-surface), var(--v-high-emphasis-opacity));
    font-size: 0.9375rem;
    line-height: 1.6;
}

.v-alert.v-alert--variant-tonal .v-alert__prepend {
    margin-inline-end: 12px;
}
</style>
