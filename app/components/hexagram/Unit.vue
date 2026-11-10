<template>
    <v-card
        variant="outlined"
        class="unit"
    >
        <v-card-text class="unit__body">
            <p class="unit__role">
                {{ role }}
            </p>
            <p class="unit__order">
                第 {{ face.order }} 卦
            </p>
            <h3 class="unit__name font-display">
                {{ face.name }}卦
            </h3>
            <p class="unit__trigrams">
                上{{ face.upper }}下{{ face.lower }}
            </p>
            <HexagramLines
                class="unit__lines"
                :yang="yang"
                :moving="moving"
                :label="label"
            />
        </v-card-text>
    </v-card>
</template>

<script lang="ts" setup>
import type { HexagramFace } from '../../../shared/schemas/api/hexagram.schema';

/**
 * One hexagram as a small card, the same for the one that was cast and the one it turns into: which hexagram it is
 * (its number, its name, its two trigrams) and its six lines.
 */
withDefaults(defineProps<{
    face: HexagramFace;
    /** The six lines from the bottom: true for a solid (yang) line */
    yang: readonly boolean[];
    /** Positions of the lines that are changing, drawn in the accent color */
    moving?: readonly number[];
    /** What a screen reader says in place of the drawing */
    label: string;
    /** What this hexagram is in the cast: the hexagram that was cast, or where it is heading */
    role: string;
}>(), { moving: () => [] });
</script>

<style scoped>
.unit {
    flex: 0 1 15rem;
    min-width: 12rem;
}

.unit__body {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
    padding: 16px 20px 20px;
    text-align: center;
}

.unit__role {
    margin: 0 0 6px;
    padding: 1px 10px;
    border-radius: 999px;
    background: rgba(var(--v-theme-primary), 0.08);
    font-size: 0.75rem;
    letter-spacing: 0.08em;
    color: rgb(var(--v-theme-primary));
}

.unit__order {
    margin: 0;
    font-size: 0.8rem;
    color: rgba(var(--v-theme-night), 0.6);
}

.unit__name {
    margin: 0;
    font-size: 1.375rem;
    line-height: 1.4;
}

.unit__trigrams {
    margin: 0 0 12px;
    font-size: 0.85rem;
    color: rgba(var(--v-theme-night), 0.6);
}
</style>
