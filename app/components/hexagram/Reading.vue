<template>
    <article :aria-label="`${cast.primary.name}卦的解讀`">
        <!-- First the hexagram that was cast, with its whole reading -->
        <HexagramChapter
            role="現在的卦"
            :face="cast.primary"
            :content="cast.content"
            :yang="drawings.primary"
            :moving="cast.moving"
            :label="hexagramAriaLabel(cast.primary.name, cast)"
            :note="primaryNote"
        >
            <!-- Where one line is changing: what that line says -->
            <v-card
                v-if="cast.mode === 'single' && cast.movingLine"
                variant="outlined"
                class="mb-4"
            >
                <v-card-title>正在變動的爻：{{ linePositionName(cast.movingLine.position) }}</v-card-title>
                <v-card-text>
                    <blockquote class="quote">
                        <p class="quote__text">
                            <span class="text-caption text-medium-emphasis d-block mb-1">經文原文</span>{{ cast.movingLine.statement }}
                        </p>
                    </blockquote>
                    <section class="line-part">
                        <h3 class="text-subtitle-1 font-weight-medium mb-1">
                            解讀
                        </h3>
                        <p class="mb-0">
                            {{ cast.movingLine.content.summary }}
                        </p>
                    </section>
                    <section
                        v-if="cast.movingLine.content.growthAdvice"
                        class="line-part"
                    >
                        <h3 class="text-subtitle-1 font-weight-medium mb-1">
                            建議
                        </h3>
                        <p class="mb-0">
                            {{ cast.movingLine.content.growthAdvice }}
                        </p>
                    </section>
                </v-card-text>
            </v-card>
        </HexagramChapter>

        <!-- Then, when a line is changing, the hexagram it turns into, with its whole reading -->
        <template v-if="cast.changed && drawings.changed">
            <div
                class="turn"
                aria-hidden="true"
            >
                <v-icon icon="mdi-arrow-down-bold" />
                <span>變動之後</span>
            </div>
            <HexagramChapter
                future
                role="之後的走向"
                :face="cast.changed.face"
                :content="cast.changed.content"
                :yang="drawings.changed"
                :moving="cast.moving"
                :label="changedAriaLabel(cast.changed.face.name)"
                :note="headingNote"
            />
        </template>

        <p class="text-caption text-medium-emphasis mb-0">
            {{ cast.content.disclaimer }}
        </p>
    </article>
</template>

<script lang="ts" setup>
import type { HexagramCastItem } from '../../../shared/schemas/api/hexagram.schema';
import {
    changedAriaLabel, hexagramAriaLabel, hexagramDrawings, linePositionName, movementNote,
} from '../../utils/hexagramView';

const props = defineProps<{ cast: HexagramCastItem }>();

const drawings = computed(() => hexagramDrawings(props.cast));

/** Under the hexagram that was cast: whether a line is changing, and what the orange lines mean */
const primaryNote = computed(() => `${movementNote(props.cast)}${props.cast.moving.length > 0 ? '：橘色的爻正在變動，變動之後排出的卦，就是這件事之後可能的走向，見下方。' : ''}`);

/** Under the hexagram it turns into: which lines are changing and what that means for how it is read */
const headingNote = computed(() => {
    const { cast } = props;
    const names = cast.moving.map(linePositionName).join('、');

    return cast.mode === 'single'
        ? `${names}正在變動，變動之後，這件事可能走向「${cast.changed?.face.name}」，到時的狀態可能是這樣。`
        : `有 ${cast.moving.length} 個爻正在變動（${names}），不逐爻細讀，看這一卦之後可能走向哪裡就好。到時的狀態可能是這樣。`;
});
</script>

<style scoped>
/* The turn from one hexagram to the next: an arrow pointing down, the way the reading goes */
.turn {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
    margin: 12px 0 20px;
    font-size: 0.85rem;
    color: rgba(var(--v-theme-night), 0.6);
}

.quote {
    margin: 0 0 20px;
    padding: 16px 20px;
    border-left: 4px solid rgb(var(--v-theme-primary));
    border-radius: 0 8px 8px 0;
    background: rgba(var(--v-theme-primary), 0.06);
}

.quote__text {
    margin: 0;
    font-size: 1.125rem;
    font-weight: 500;
    line-height: 1.8;
}
.line-part + .line-part {
    margin-top: 16px;
}

.line-part:first-of-type {
    margin-top: 0;
}
</style>
