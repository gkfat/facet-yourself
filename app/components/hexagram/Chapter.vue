<template>
    <section :aria-label="`${face.name}卦的解讀`">
        <!-- The hexagram, then its whole reading: the same parts for the one that was cast and the one it turns into -->
        <div class="unit-row">
            <HexagramUnit
                :role="role"
                :face="face"
                :yang="yang"
                :moving="moving"
                :label="label"
            />
        </div>
        <p
            v-if="note"
            class="note text-body-2 text-medium-emphasis"
        >
            {{ note }}
        </p>

        <!-- Overview: the headline, then what to build on and what to watch -->
        <v-card
            variant="outlined"
            class="mb-4"
        >
            <v-card-title>概覽</v-card-title>
            <v-card-text>
                <blockquote class="quote">
                    <p class="quote__headline">
                        {{ content.title }}
                    </p>
                    <p class="quote__summary">
                        {{ content.summary }}
                    </p>
                </blockquote>

                <section
                    v-if="content.strengths.length"
                    class="mb-6"
                >
                    <div class="text-subtitle-1 font-weight-medium mb-2">
                        <v-icon
                            color="success"
                            size="20"
                        >
                            mdi-thumb-up-outline
                        </v-icon>
                        可能的優勢
                    </div>
                    <v-row dense>
                        <v-col
                            v-for="item in content.strengths"
                            :key="item"
                            cols="12"
                            sm="6"
                            md="4"
                        >
                            <v-card
                                variant="outlined"
                                height="100%"
                            >
                                <v-card-text class="text-subtitle-1 font-weight-medium">
                                    {{ item }}
                                </v-card-text>
                            </v-card>
                        </v-col>
                    </v-row>
                </section>

                <section v-if="content.blindSpots.length">
                    <div class="text-subtitle-1 font-weight-medium mb-2">
                        <v-icon
                            color="warning"
                            size="20"
                        >
                            mdi-eye-outline
                        </v-icon>
                        {{ future ? '到時可以留意的地方' : '可以留意的地方' }}
                    </div>
                    <v-row dense>
                        <v-col
                            v-for="item in content.blindSpots"
                            :key="item"
                            cols="12"
                            sm="6"
                            md="4"
                        >
                            <v-card
                                variant="outlined"
                                height="100%"
                            >
                                <v-card-text class="text-subtitle-1">
                                    {{ item }}
                                </v-card-text>
                            </v-card>
                        </v-col>
                    </v-row>
                </section>
            </v-card-text>
        </v-card>

        <!-- How the moment shows in everyday life -->
        <v-card
            v-if="content.dailyBehavior || areas.length"
            variant="outlined"
            class="mb-4"
        >
            <v-card-title>{{ future ? '到時日常可能的樣子' : '日常的樣子' }}</v-card-title>
            <v-card-text>
                <p
                    v-if="content.dailyBehavior"
                    class="mb-4"
                >
                    {{ content.dailyBehavior }}
                </p>
                <v-row
                    v-if="areas.length"
                    dense
                >
                    <v-col
                        v-for="area in areas"
                        :key="area.label"
                        cols="12"
                        sm="6"
                    >
                        <v-card
                            variant="outlined"
                            height="100%"
                        >
                            <v-card-text>
                                <div class="text-subtitle-2 mb-1">
                                    {{ area.label }}
                                </div>
                                <p class="mb-0">
                                    {{ area.text }}
                                </p>
                            </v-card-text>
                        </v-card>
                    </v-col>
                </v-row>
            </v-card-text>
        </v-card>

        <!-- Anything that belongs to this hexagram alone, such as the line that is changing -->
        <slot />

        <!-- What to build on, what to notice, and a question to think over -->
        <v-card
            v-if="reflectionRows.length"
            variant="outlined"
            class="mb-4"
        >
            <v-card-title>成長與反思</v-card-title>
            <v-card-text>
                <v-row dense>
                    <v-col
                        v-for="row in reflectionRows"
                        :key="row.label"
                        cols="12"
                        sm="6"
                    >
                        <v-card
                            variant="outlined"
                            height="100%"
                        >
                            <v-card-text>
                                <div class="text-subtitle-2 mb-1">
                                    <v-icon
                                        :icon="row.icon"
                                        size="18"
                                        class="mr-1"
                                    />
                                    {{ row.label }}
                                </div>
                                <p class="mb-0">
                                    {{ row.text }}
                                </p>
                            </v-card-text>
                        </v-card>
                    </v-col>
                </v-row>
            </v-card-text>
        </v-card>

        <!-- Something to do with it -->
        <v-card
            v-if="content.growthAdvice.trim()"
            variant="outlined"
            class="mb-4"
        >
            <v-card-title>{{ future ? '可以先做的準備' : '給你的建議' }}</v-card-title>
            <v-card-text>
                <blockquote class="quote quote--last">
                    <p class="quote__text">
                        {{ content.growthAdvice }}
                    </p>
                </blockquote>
            </v-card-text>
        </v-card>

        <!-- The classical text, as it is -->
        <v-card
            variant="outlined"
            class="mb-4"
        >
            <v-card-title>經文原文</v-card-title>
            <v-card-text>
                <section
                    v-for="part in classical"
                    :key="part.label"
                    class="life-area"
                >
                    <h3 class="text-subtitle-1 font-weight-medium mb-1">
                        {{ part.label }}
                    </h3>
                    <p class="mb-0">
                        {{ part.text }}
                    </p>
                </section>
            </v-card-text>
        </v-card>
    </section>
</template>

<script lang="ts" setup>
import type {
    HexagramCastItem, HexagramFace,
} from '../../../shared/schemas/api/hexagram.schema';

/**
 * One hexagram and everything the reading says of it: its card, the overview, everyday life, growth and reflection,
 * advice and the original text. A cast has one chapter for the hexagram that was cast and, when a line is changing, a
 * second for the hexagram it turns into, so both are read the same way and as fully.
 */
const props = withDefaults(defineProps<{
    face: HexagramFace;
    content: HexagramCastItem['content'];
    /** The six lines from the bottom: true for a solid (yang) line */
    yang: readonly boolean[];
    /** Positions of the lines that are changing, drawn in the accent color */
    moving?: readonly number[];
    /** What a screen reader says in place of the drawing */
    label: string;
    /** What this hexagram is in the cast */
    role: string;
    /** The hexagram the cast turns into: what is said of it is about how things will be then */
    future?: boolean;
    /** A line under the card: what is changing, or how to get to the other hexagram */
    note?: string;
}>(), {
    moving: () => [],
    future: false,
    note: '',
});

const areaLabels = [
    ['work', '工作與學習'],
    ['relationships', '人際關係'],
    ['stress', '有壓力時'],
    ['decision', '做決定時'],
    ['habits', '日常習慣'],
] as const;
const areas = computed(() => {
    const lifeContexts = props.content.lifeContexts;

    return lifeContexts ? areaLabels.map(([key, label]) => ({
        label, text: lifeContexts[key],
    })) : [];
});

/** The same labels and icons the other reports give the parts of the practice */
const reflectionRows = computed(() => [
    {
        label: '可以發揮的地方', icon: 'mdi-check-circle-outline', text: props.content.growthReflection?.useStrength ?? '',
    },
    {
        label: '一個值得觀察的習慣', icon: 'mdi-eye-outline', text: props.content.growthReflection?.watchHabit ?? '',
    },
    {
        label: '想一想', icon: 'mdi-help-circle-outline', text: props.content.growthReflection?.reflectionQuestion ?? '',
    },
].filter((row) => row.text));

const classical = computed(() => [
    {
        label: '卦辭', text: props.face.judgment,
    },
    {
        label: '彖辭', text: props.face.tuan,
    },
    {
        label: '大象', text: props.face.image,
    },
]);
</script>

<style scoped>
.unit-row {
    margin-bottom: 12px;
}

.note {
    margin: 0 0 20px;
    text-align: center;
}

/* The headline of the reading: set apart as a quotation, with an accent edge (the same as the other reports). */
.quote {
    margin: 0 0 20px;
    padding: 16px 20px;
    border-left: 4px solid rgb(var(--v-theme-primary));
    border-radius: 0 8px 8px 0;
    background: rgba(var(--v-theme-primary), 0.06);
}

.quote--last {
    margin-bottom: 0;
}

.quote__headline {
    margin: 0 0 8px;
    font-size: clamp(1.25rem, 3.4vw, 1.625rem);
    font-weight: 700;
    line-height: 1.4;
}

.quote__summary {
    margin: 0;
    font-size: 1rem;
    line-height: 1.8;
    color: rgba(var(--v-theme-night), 0.75);
}

.quote__text {
    margin: 0;
    font-size: 1.125rem;
    font-weight: 500;
    line-height: 1.8;
}

/* Each part of the original text: its name on its own line, the text across the full width */
.life-area + .life-area {
    margin-top: 20px;
}
</style>
