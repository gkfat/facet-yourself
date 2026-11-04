<template>
    <div>
        <!-- All the sides at a glance -->
        <v-card
            variant="outlined"
            class="mb-4"
        >
            <v-card-title>四個面向一覽</v-card-title>
            <v-card-text>
                <div
                    v-for="entry in sides"
                    :key="entry.id"
                    class="mb-4"
                >
                    <div class="d-flex align-center ga-2 mb-1">
                        <span class="text-subtitle-2 font-weight-bold">{{ entry.name }}</span>
                        <v-chip
                            size="x-small"
                            :color="LEVEL_COLORS[entry.level]"
                            variant="tonal"
                        >
                            {{ LEVEL_LABELS[entry.level] }}
                        </v-chip>
                        <v-spacer />
                        <span class="text-subtitle-2">{{ entry.score }}</span>
                    </div>
                    <v-progress-linear
                        :model-value="entry.score"
                        :color="LEVEL_COLORS[entry.level]"
                        height="10"
                        rounded
                    />
                    <div class="d-flex justify-space-between text-caption text-medium-emphasis mt-1">
                        <span>低：{{ entry.low }}</span>
                        <span class="text-right">高：{{ entry.high }}</span>
                    </div>
                </div>
                <v-alert
                    v-for="line in notes"
                    :key="line"
                    type="info"
                    variant="tonal"
                    density="compact"
                    class="mb-2"
                >
                    {{ line }}
                </v-alert>
            </v-card-text>
        </v-card>

        <!-- One card for each side -->
        <v-card
            v-for="entry in sides"
            :key="entry.id"
            variant="outlined"
            class="mb-3"
        >
            <v-card-text>
                <div class="d-flex align-center ga-2 mb-1">
                    <v-chip
                        size="small"
                        :color="LEVEL_COLORS[entry.level]"
                        variant="flat"
                    >
                        {{ entry.name }}・{{ LEVEL_LABELS[entry.level] }}
                    </v-chip>
                    <v-spacer />
                    <span class="text-subtitle-2">{{ entry.score }}</span>
                </div>
                <template v-if="entry.body">
                    <div class="text-subtitle-1 font-weight-bold mb-2">
                        {{ entry.body.title }}
                    </div>
                    <p class="mb-3">
                        {{ entry.body.summary }}
                    </p>
                    <v-row dense>
                        <v-col
                            v-if="entry.body.strengths.length"
                            cols="12"
                            md="6"
                        >
                            <div class="text-caption text-medium-emphasis mb-1">
                                你的優勢
                            </div>
                            <ul class="list">
                                <li
                                    v-for="item in entry.body.strengths"
                                    :key="item"
                                >
                                    {{ item }}
                                </li>
                            </ul>
                        </v-col>
                        <v-col
                            v-if="entry.body.blindSpots.length"
                            cols="12"
                            md="6"
                        >
                            <div class="text-caption text-medium-emphasis mb-1">
                                可以留意的地方
                            </div>
                            <ul class="list">
                                <li
                                    v-for="item in entry.body.blindSpots"
                                    :key="item"
                                >
                                    {{ item }}
                                </li>
                            </ul>
                        </v-col>
                    </v-row>
                    <p
                        v-if="entry.body.growthAdvice"
                        class="mt-2 mb-0"
                    >
                        <span class="text-caption text-medium-emphasis mr-2">怎麼練習</span>{{ entry.body.growthAdvice }}
                    </p>
                    <div
                        v-if="entry.body.growthPractice"
                        class="practice mt-3"
                    >
                        <div class="text-subtitle-2 mb-2">
                            練習步驟
                        </div>
                        <div
                            v-for="step in stepsOf(entry.body.growthPractice)"
                            :key="step.label"
                            class="practice__row"
                        >
                            <span class="practice__label">{{ step.label }}</span>
                            <span>{{ step.text }}</span>
                        </div>
                    </div>
                </template>
            </v-card-text>
        </v-card>

        <p
            v-if="disclaimer"
            class="text-caption text-medium-emphasis mb-4"
        >
            {{ disclaimer }}
        </p>
    </div>
</template>

<script lang="ts" setup>
import type { ScaleDimensionInfo } from '../../shared/assessments/types';
import type { AssessmentResult } from '../../shared/schemas/api/assessment.schema';
import type { FixedResultResponse } from '../../shared/schemas/api/fixedResult.schema';

const props = defineProps<{
    dimensions: readonly ScaleDimensionInfo[];
    notes: readonly string[];
    result: AssessmentResult;
}>();

type Level = 'low' | 'mid' | 'high';

const LEVEL_LABELS: Readonly<Record<Level, string>> = {
    low: '偏低', mid: '居中', high: '偏高',
};
const LEVEL_COLORS: Readonly<Record<Level, string>> = {
    low: 'info', mid: 'primary', high: 'success',
};

const isLevel = (value: unknown): value is Level => value === 'low' || value === 'mid' || value === 'high';

/** Each side with its score and level, in the order the result gives them, and the content that tells it */
const sides = computed(() => {
    const raw = props.result.result.scores;

    if (!Array.isArray(raw)) return [];

    return raw.flatMap((entry) => {
        const info = props.dimensions.find((candidate) => candidate.id === entry?.dimension);

        if (!info || typeof entry.score !== 'number' || !isLevel(entry.level)) return [];

        const level: Level = entry.level;

        return [{
            id: info.id,
            name: info.name,
            low: info.low,
            high: info.high,
            score: entry.score as number,
            level,
            body: props.result.content.find((item) => item.key === `${props.result.assessmentId}_${info.id}_${level}`),
        }];
    });
});

const stepsOf = (practice: NonNullable<FixedResultResponse['growthPractice']>) => [
    {
        label: '先觀察', text: practice.habitToObserve,
    }, {
        label: '試著做', text: practice.behaviorToTry,
    }, {
        label: '想一想', text: practice.reflectionQuestion,
    }, {
        label: '本週練習', text: practice.weeklyPractice,
    },
];

const disclaimer = computed(() => props.result.content[0]?.disclaimer ?? '');
</script>

<style scoped>
.list {
    margin: 0;
    padding-left: 1.25rem;
}

.practice {
    padding: 12px 16px;
    border-radius: 8px;
    background: rgba(var(--v-theme-primary), 0.06);
}

.practice__row {
    display: flex;
    gap: 12px;
    padding: 2px 0;
}

.practice__label {
    flex-shrink: 0;
    width: 4.5rem;
    color: rgba(var(--v-theme-on-surface), 0.6);
    font-size: 0.875rem;
}
</style>
