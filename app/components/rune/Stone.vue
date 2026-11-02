<template>
    <div
        class="stone"
        :class="{ 'stone--flipped': flipped, 'stone--compact': compact }"
    >
        <div class="stone__inner">
            <!-- Back: the face-down stone, the way in when it has not been drawn -->
            <component
                :is="interactive ? 'button' : 'div'"
                class="stone__face stone__back"
                :type="interactive ? 'button' : undefined"
                :aria-label="interactive ? '抽出今天的符文' : undefined"
                :disabled="interactive && busy ? true : undefined"
                :tabindex="flipped ? -1 : undefined"
                :style="spriteStyle(RUNE_SPRITE.back)"
                @click="interactive && emit('reveal')"
            >
                <!-- The back has no mark, the same on every stone: the rune is not told by the back -->
                <span
                    v-if="interactive && !compact"
                    class="stone__hint"
                >
                    {{ busy ? '抽取中…' : '點一下抽符' }}
                </span>
            </component>

            <!-- Front: the stone with its rune already on it, a cell of the sheet that holds them all -->
            <div
                class="stone__face stone__front"
                :aria-hidden="!flipped"
            >
                <!-- A reversed rune is the stone turned half round -->
                <div
                    v-if="rune"
                    class="stone__art"
                    :class="{ 'stone__art--reversed': rune.orientation === 'reversed' }"
                    role="img"
                    :aria-label="`${rune.name}（${rune.meaning}）`"
                    :style="spriteStyle(rune.index)"
                />
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import {
    RUNE_SPRITE, runeSpriteCell,
} from '../../../shared/constants/runeSprite';
import type { RuneResponse } from '../../../shared/schemas/api/rune.schema';

withDefaults(defineProps<{
    /** The drawn rune; null while the stone is still face down */
    rune: RuneResponse | null;
    flipped: boolean;
    /** The back can be clicked to draw */
    interactive?: boolean;
    /** A draw is in progress */
    busy?: boolean;
    /** A small face-down stone, as in a scatter: no hint text. Its width is `--stone-width`. */
    compact?: boolean;
}>(), {
    interactive: false,
    busy: false,
    compact: false,
});

const emit = defineEmits<{ reveal: [] }>();

/** Shows one cell of the sheet of stones on the element it is set on */
function spriteStyle(cell: number) {
    const {
        size, position,
    } = runeSpriteCell(cell);

    return {
        backgroundImage: `url(${RUNE_SPRITE.url})`, backgroundSize: size, backgroundPosition: position,
    };
}
</script>

<style scoped>
.stone {
    width: var(--stone-width, min(200px, 56vw));
    aspect-ratio: 4 / 5;
    margin: 0 auto;
    perspective: 1000px;
}

.stone__inner {
    position: relative;
    width: 100%;
    height: 100%;
    transform-style: preserve-3d;
    transition: transform 0.7s ease;
}

.stone--flipped .stone__inner {
    transform: rotateY(180deg);
}

.stone__face {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 12px;
    padding: 0;
    border: 0;
    background-color: transparent;
    background-repeat: no-repeat;
    backface-visibility: hidden;
    -webkit-backface-visibility: hidden;
}

/* The stone is drawn flat in a picture of its own; the shadow is part of it */
.stone__back {
    color: #d8dee9;
}

button.stone__back {
    cursor: pointer;
    font: inherit;
}

/* No frame on hover; the keyboard focus is shown as a soft glow that follows the shape of the stone */
button.stone__back:focus-visible {
    outline: none;
    filter: drop-shadow(0 0 6px rgba(var(--v-theme-primary), 0.6));
}

.stone__hint {
    font-size: 0.875rem;
    letter-spacing: 0.1em;
}

.stone__front {
    transform: rotateY(180deg);
}

.stone__art {
    width: 100%;
    height: 100%;
    background-repeat: no-repeat;
}

.stone__art--reversed {
    transform: rotate(180deg);
}

@media (prefers-reduced-motion: reduce) {
    .stone__inner {
        transition: none;
    }
}
</style>
