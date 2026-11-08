<template>
    <section class="banner">
        <div
            class="banner__bg"
            :class="{ 'banner__bg--extended': extended }"
            :style="{ '--banner-accent': accent }"
            aria-hidden="true"
        />
        <h1 class="banner__title">
            {{ title }}
        </h1>
        <p
            v-if="headline"
            class="banner__headline font-display"
        >
            {{ headline }}
        </p>
        <p
            v-if="tagline"
            class="banner__tagline"
        >
            {{ tagline }}
        </p>
    </section>
</template>

<script lang="ts" setup>
import {
    PALETTE, TONES,
} from '../../shared/constants/palette';

const props = withDefaults(defineProps<{
    title: string;
    /** The big second line, e.g. the type or the sign */
    headline?: string;
    /** A few words under the headline: the verdict on it, e.g. 深入專注的洞察者 */
    tagline?: string;
    /** Run the backdrop on behind the first card below, so the card sits on its edge */
    extended?: boolean;
    tone?: 'green' | 'amber' | 'red';
}>(), {
    headline: undefined,
    tagline: undefined,
    extended: false,
    tone: 'green',
});

// The short rule under the title: which kind of page this is
const ACCENTS = {
    green: TONES.teal,
    amber: PALETTE.accent,
    red: TONES.rose,
} as const;

const accent = computed(() => ACCENTS[props.tone]);
</script>

<style scoped>
.banner {
    position: relative;
    margin-bottom: 20px;
    padding: 20px 0 8px;
    text-align: center;
}

/*
 * Full-width backdrop under the app bar. It sits at z-index -1, so the page that uses it needs the
 * `report-page` class (a stacking context) to keep it behind the content.
 */
.banner__bg {
    position: absolute;
    top: -16px;
    bottom: 0;
    left: 50%;
    z-index: -1;
    width: 100vw;
    transform: translateX(-50%);
    background-color: rgb(var(--v-theme-paper));
    border-bottom: 1px solid rgba(var(--v-theme-night), 0.1);
}

/* Film grain over the paper */
.banner__bg::after {
    content: '';
    position: absolute;
    inset: 0;
    background-image: var(--grain-light);
    opacity: 0.07;
}

.banner__bg--extended {
    bottom: -48px;
}

.banner__title {
    margin: 0;
    font-size: 1rem;
    font-weight: 500;
    letter-spacing: 0.3em;
    color: rgb(var(--v-theme-primary));
}

/* A short rule in the page's own color closes the title */
.banner__title::after {
    content: '';
    display: block;
    width: 28px;
    height: 2px;
    margin: 10px auto 0;
    background: var(--banner-accent);
}

.banner__tagline {
    margin: 10px 0 0;
    font-size: clamp(1.05rem, 3vw, 1.35rem);
    font-weight: 500;
    letter-spacing: 0.12em;
    color: rgba(var(--v-theme-on-surface), 0.72);
}

.banner__headline {
    margin: 8px 0 0;
    font-size: clamp(2.25rem, 8vw, 3.5rem);
    font-weight: 700;
    line-height: 1.2;
    color: rgb(var(--v-theme-night));
}
</style>
