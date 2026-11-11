<template>
    <section
        class="palace"
        :class="{
            'palace--life': isLife,
            'palace--body': isBody && !isLife,
            'palace--empty': palace.isEmpty,
        }"
        :aria-label="`${palace.palace}（${palace.branch}宮）：${summary}`"
    >
        <!-- The branch of the palace, stamped large and faint: it is the palace's place on the chart -->
        <span
            class="palace__stamp"
            aria-hidden="true"
        >{{ palace.branch }}</span>

        <header class="palace__head">
            <h4 class="palace__name">
                {{ palace.palace }}
            </h4>
            <span
                v-if="isLife"
                class="palace__tag"
            >命</span>
            <span
                v-if="isBody"
                class="palace__tag palace__tag--body"
            >身</span>
        </header>

        <div
            v-if="palace.mainStars.length > 0"
            class="palace__stars"
        >
            <ZiweiStarTag
                v-for="placement in palace.mainStars"
                :key="placement.star"
                :placement="placement"
            />
        </div>
        <p
            v-else
            class="palace__empty"
        >
            空宮
        </p>

        <div
            v-if="palace.auxiliaryStars.length > 0"
            class="palace__minor"
        >
            <ZiweiStarTag
                v-for="placement in palace.auxiliaryStars"
                :key="placement.star"
                :placement="placement"
                minor
            />
        </div>

        <!-- Borrowed stars are a way of reading an empty palace, not stars of the palace: said so, in a smaller voice -->
        <p
            v-if="borrowed && borrowed.borrowedStars.length > 0"
            class="palace__borrowed"
        >
            <span class="palace__borrowed-tag">借星</span>
            借對宮（{{ borrowed.borrowedFromPalace }}）的{{ borrowed.borrowedStars.map((placement) => placement.star).join('、') }}來讀，非本宮的星。
        </p>
    </section>
</template>

<script lang="ts" setup>
import type { ZiweiResponse } from '../../../shared/schemas/api/ziwei.schema';
import type { BorrowedStars } from '../../../shared/utils/ziwei/types';

type Palace = ZiweiResponse['palaces'][number];

const props = defineProps<{
    palace: Palace;
    isLife: boolean;
    isBody: boolean;
    borrowed: BorrowedStars | null;
}>();

const summary = computed(() => {
    const stars = [
        ...props.palace.mainStars,
        ...props.palace.auxiliaryStars,
    ].map((placement) => `${placement.star}${placement.transformation ? `化${placement.transformation}` : ''}`);

    return props.palace.isEmpty ? `空宮${stars.length > 0 ? `，${stars.join('、')}` : ''}` : stars.join('、');
});
</script>

<style scoped>
.palace {
    position: relative;
    isolation: isolate;
    overflow: hidden;
    min-block-size: 104px;
    padding: 10px 12px 12px;
    border: 1px solid rgba(var(--v-theme-primary), 0.16);
    border-radius: 10px;
    background: rgb(var(--v-theme-surface));
    color: rgb(var(--v-theme-ink));
}

.palace__stamp {
    position: absolute;
    inset-block-end: 4px;
    inset-inline-end: 10px;
    z-index: -1;
    font-family: var(--font-display);
    font-size: 3.2rem;
    font-weight: 900;
    line-height: 1;
    color: rgb(var(--v-theme-primary));
    opacity: 0.08;
    pointer-events: none;
}

.palace__head {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-block-end: 6px;
}

.palace__name {
    margin: 0;
    font-family: var(--font-display);
    font-size: 0.82rem;
    font-weight: 600;
    letter-spacing: 0.12em;
    color: rgb(var(--v-theme-secondary));
}

.palace__tag {
    display: inline-grid;
    place-items: center;
    inline-size: 1.15rem;
    block-size: 1.15rem;
    border-radius: 4px;
    background: rgb(var(--v-theme-night));
    color: #ffffff;
    font-family: var(--font-display);
    font-size: 0.7rem;
    font-weight: 700;
}

.palace__tag--body {
    background: rgb(var(--v-theme-accent));
}

.palace__stars,
.palace__minor {
    display: flex;
    flex-wrap: wrap;
    gap: 2px 10px;
}

.palace__minor {
    margin-block-start: 4px;
}

.palace__empty {
    margin: 0;
    font-size: 0.8rem;
    letter-spacing: 0.3em;
    color: rgb(var(--v-theme-secondary));
}

.palace--empty {
    border-style: dashed;
    background: transparent;
}

.palace__borrowed {
    margin: 8px 0 0;
    font-size: 0.7rem;
    line-height: 1.5;
    color: rgb(var(--v-theme-secondary));
}

.palace__borrowed-tag {
    margin-inline-end: 4px;
    padding: 0 4px;
    border: 1px solid currentcolor;
    border-radius: 3px;
    font-size: 0.65rem;
}

/* The body palace: marked by the warm accent, so it never competes with the life palace */
.palace--body {
    border-color: rgb(var(--v-theme-accent));
    box-shadow: inset 3px 0 0 rgb(var(--v-theme-accent));
}

/* The life palace is the one reversed card on the chart: the place to start reading */
.palace--life {
    border-color: rgb(var(--v-theme-night));
    background: rgb(var(--v-theme-night));
    color: #ffffff;
}

.palace--life .palace__name {
    color: rgba(255, 255, 255, 0.72);
}

.palace--life .palace__stamp {
    color: #ffffff;
    opacity: 0.1;
}

.palace--life .palace__tag {
    background: #ffffff;
    color: rgb(var(--v-theme-night));
}

.palace--life .palace__tag--body {
    background: rgb(var(--v-theme-accent));
    color: #ffffff;
}

.palace--life .palace__empty,
.palace--life .palace__borrowed {
    color: rgba(255, 255, 255, 0.78);
}

@media (prefers-reduced-motion: no-preference) {
    .palace {
        transition: border-color 0.15s ease;
    }
}
</style>
