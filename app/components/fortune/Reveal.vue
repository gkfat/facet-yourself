<template>
    <section
        class="reveal"
        :class="{ 'reveal--shown': shown }"
        :aria-label="label"
    >
        <!-- The thing itself rests on a pool of lamplight, as on the dark cloth of a casting -->
        <div class="reveal__stage">
            <div
                class="reveal__glow"
                aria-hidden="true"
            />
            <div class="reveal__object">
                <slot />
            </div>
            <div
                class="reveal__floor"
                aria-hidden="true"
            />
        </div>

        <div class="reveal__text">
            <p class="reveal__eyebrow">
                {{ eyebrow }}
            </p>
            <h2 class="reveal__name">
                {{ title }}
            </h2>
            <p
                v-if="subtitle"
                class="reveal__subtitle"
            >
                {{ subtitle }}
            </p>
            <p
                v-if="badge"
                class="reveal__badge"
                :class="{ 'reveal__badge--reversed': turn === 'reversed' }"
            >
                <span
                    v-if="turn"
                    class="reveal__turn"
                    aria-hidden="true"
                />
                {{ badge }}
            </p>
        </div>
    </section>
</template>

<script lang="ts" setup>
/**
 * The top of a reading: the night slab that holds what was drawn (a stone, a card, a hexagram) with its name beside
 * or under it. The drawn thing goes in the default slot; the slab only sets the stage.
 */
withDefaults(defineProps<{
    /** The small line over the name: what this is */
    eyebrow: string;
    /** The name, big, in the display face */
    title: string;
    subtitle?: string;
    /** A small outlined label: the orientation of a card or stone, or how many lines are changing */
    badge?: string;
    /** When the badge is an orientation: a tiny stone, upright or turned over */
    turn?: 'upright' | 'reversed';
    /** Whether what was drawn is in view: the lamplight comes up behind it */
    shown?: boolean;
    /** What a screen reader says for the whole slab */
    label: string;
}>(), {
    subtitle: undefined,
    badge: undefined,
    turn: undefined,
    shown: true,
});
</script>

<style scoped>
/* The dark band of the site (night ink, stars, grain), here as a small slab that holds one stone */
.reveal {
    --honey: #e9cf98;

    position: relative;
    display: grid;
    grid-template-columns: 1fr;
    justify-items: center;
    gap: 4px;
    margin-bottom: 20px;
    padding: 28px 20px 22px;
    overflow: hidden;
    color: #eef0f7;
    text-align: center;
    background:
        var(--stars),
        radial-gradient(120% 90% at 50% 0%, #2b3763 0%, rgba(43, 55, 99, 0) 70%),
        linear-gradient(180deg, #1c2547 0%, #141a35 100%);
    border: 1px solid rgba(233, 207, 152, 0.18);
    border-radius: 20px;
}

/* The grain over everything on the slab, so the dark reads as cloth and not as a screen */
.reveal::after {
    content: '';
    position: absolute;
    inset: 0;
    pointer-events: none;
    background-image: var(--grain-dark);
    opacity: 0.05;
}

.reveal__stage {
    position: relative;
    display: grid;
    place-items: center;
    width: min(280px, 100%);
    padding: 10px 0 18px;
}

.reveal__glow {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 120%;
    aspect-ratio: 1;
    background: radial-gradient(closest-side, rgba(233, 207, 152, 0.3), rgba(233, 207, 152, 0));
    opacity: 0;
    transform: translate(-50%, -52%) scale(0.7);
    transition: opacity 1s ease 0.35s, transform 1.2s ease 0.35s;
}

.reveal--shown .reveal__glow {
    opacity: 1;
    transform: translate(-50%, -52%) scale(1);
}

.reveal__object {
    position: relative;
}

/* Under the stone, so it sits on the cloth and does not float */
.reveal__floor {
    position: absolute;
    bottom: 8px;
    left: 50%;
    width: 62%;
    height: 14px;
    background: radial-gradient(closest-side, rgba(0, 0, 0, 0.55), rgba(0, 0, 0, 0));
    transform: translateX(-50%);
}

.reveal__text {
    position: relative;
    z-index: 1;
}

.reveal__eyebrow {
    margin: 0 0 4px;
    font-size: 0.8125rem;
    letter-spacing: 0.32em;
    color: rgba(238, 240, 247, 0.62);
}

.reveal__name {
    margin: 0;
    font-family: var(--font-display);
    font-size: clamp(2.25rem, 9vw, 3rem);
    font-weight: 700;
    line-height: 1.1;
    letter-spacing: 0.05em;
    color: var(--honey);
}

.reveal__subtitle {
    margin: 6px 0 0;
    font-family: var(--font-display);
    font-size: 1.0625rem;
    letter-spacing: 0.16em;
}

.reveal__badge {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    margin: 14px 0 0;
    padding: 4px 14px 4px 10px;
    font-size: 0.875rem;
    letter-spacing: 0.2em;
    color: var(--honey);
    border: 1px solid rgba(233, 207, 152, 0.45);
    border-radius: 999px;
}

/* A tiny stone that is upright, or turned over when the rune came up reversed */
.reveal__turn {
    width: 8px;
    height: 11px;
    background: currentcolor;
    border-radius: 45% 45% 50% 50%;
}

.reveal__badge--reversed .reveal__turn {
    transform: rotate(180deg);
}

/* Wide enough, the stone sits on the left and the name beside it */
@media (min-width: 640px) {
    .reveal {
        grid-template-columns: auto 1fr;
        grid-template-areas: 'stage text';
        align-items: center;
        justify-items: start;
        column-gap: 40px;
        padding: 32px 44px;
        text-align: left;
    }

    .reveal__stage {
        grid-area: stage;
        width: 280px;
    }

    .reveal__text {
        grid-area: text;
    }
}

@media (prefers-reduced-motion: reduce) {
    .reveal__glow {
        transition: none;
    }
}
</style>
