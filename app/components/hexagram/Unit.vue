<template>
    <FortuneReveal
        :eyebrow="role"
        :title="`${face.name}卦`"
        :subtitle="`第 ${face.order} 卦 · 上${face.upper}下${face.lower}`"
        :label="`${role}：${face.name}卦`"
    >
        <HexagramLines
            class="unit__lines"
            :yang="yang"
            :moving="moving"
            :label="label"
        />
    </FortuneReveal>
</template>

<script lang="ts" setup>
import type { HexagramFace } from '../../../shared/schemas/api/hexagram.schema';

/**
 * One hexagram on the night slab, the same for the one that was cast and the one it turns into: which hexagram it is
 * (its number, its name, its two trigrams) and its six lines, drawn in lamplight.
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
/* On the dark slab the bars are lamplight and the lines that are changing an ember */
.unit__lines {
    width: min(170px, 46vw);
}

.unit__lines :deep(.bar) {
    fill: #e9cf98;
}

.unit__lines :deep(.line--moving .bar) {
    fill: #e8946b;
}
</style>
