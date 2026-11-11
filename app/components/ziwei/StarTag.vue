<template>
    <span class="star">
        <span
            v-if="!sealOnly"
            :class="minor ? 'star__name star__name--minor' : 'star__name'"
        >{{ placement.star }}</span>
        <!-- 四化 as a small round seal: one character, a tone for each of the four -->
        <span
            v-if="placement.transformation"
            class="seal"
            :class="`seal--${SEAL_CLASS[placement.transformation]}`"
            :aria-label="`化${placement.transformation}`"
        >{{ placement.transformation }}</span>
    </span>
</template>

<script lang="ts" setup>
import type { Transformation } from '../../../shared/constants/ziwei';

defineProps<{
    placement: { star: string; transformation: Transformation | null };
    minor?: boolean;
    /** Draw only the seal of the 四化, for a list that names the star beside it */
    sealOnly?: boolean;
}>();

const SEAL_CLASS: Readonly<Record<Transformation, string>> = {
    祿: 'lu',
    權: 'quan',
    科: 'ke',
    忌: 'ji',
};
</script>

<style scoped>
.star {
    display: inline-flex;
    align-items: center;
    gap: 4px;
}

.star__name {
    font-family: var(--font-display);
    font-size: 1.05rem;
    font-weight: 700;
    letter-spacing: 0.04em;
}

.star__name--minor {
    font-family: var(--font-body);
    font-size: 0.78rem;
    font-weight: 400;
    letter-spacing: 0;
    opacity: 0.72;
}

/* The tones come from the palette; 化忌 is the warm accent, not red, because it is something to watch and not a warning */
.seal {
    --seal: #2e7b68;

    display: inline-grid;
    place-items: center;
    inline-size: 1.15rem;
    block-size: 1.15rem;
    border: 1px solid var(--seal);
    border-radius: 50%;
    color: var(--seal);
    font-family: var(--font-display);
    font-size: 0.7rem;
    font-weight: 700;
    line-height: 1;
}

.seal--lu { --seal: #2e7b68; }
.seal--quan { --seal: #3b4ea0; }
.seal--ke { --seal: #2a7f8c; }
.seal--ji { --seal: #b4694a; }

/* On the dark life-palace card the seals are the light version of the same tones */
:global(.palace--life) .seal {
    border-color: color-mix(in srgb, var(--seal) 35%, #ffffff);
    background: color-mix(in srgb, var(--seal) 28%, transparent);
    color: #ffffff;
}
</style>
