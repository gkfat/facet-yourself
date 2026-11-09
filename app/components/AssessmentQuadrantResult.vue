<template>
    <div>
        <!-- Where the answers fall on the two dimensions -->
        <v-card
            variant="outlined"
            class="mb-4"
        >
            <v-card-title>你在兩個向度上的位置</v-card-title>
            <v-card-text>
                <div class="map-wrap">
                    <div class="map-axis map-axis--y">
                        <span>{{ layout.rowLabels[0] }}</span>
                        <span>{{ layout.rowLabels[1] }}</span>
                    </div>
                    <div class="map-body">
                        <div class="map">
                            <div
                                v-for="cell in cells"
                                :key="cell.id"
                                class="map__cell"
                                :class="{
                                    'map__cell--primary': cell.id === primary,
                                    'map__cell--near': between.includes(cell.id),
                                }"
                            >
                                {{ layout.names[cell.id] }}
                            </div>
                            <span
                                class="map__dot"
                                :style="{ left: `${columnScore}%`, top: `${rowScore}%` }"
                            />
                        </div>
                    </div>
                    <div class="map-axis map-axis--x">
                        <span>{{ layout.columnLabels[0] }}</span>
                        <span>{{ layout.columnLabels[1] }}</span>
                    </div>
                </div>

                <div
                    v-for="entry in sides"
                    :key="entry.id"
                    class="mt-4"
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
                    class="mt-3"
                >
                    {{ line }}
                </v-alert>
            </v-card-text>
        </v-card>

        <!-- The quadrant it falls in, then the neighbours when a dimension is in the middle -->
        <v-card
            v-for="(entry, index) in quadrants"
            :key="entry.id"
            variant="outlined"
            class="mb-3"
        >
            <v-card-text>
                <div class="d-flex align-center ga-2 mb-1">
                    <v-chip
                        size="small"
                        :color="index === 0 ? 'success' : 'primary'"
                        variant="flat"
                    >
                        {{ index === 0 ? '最貼近' : '也可以參考' }}・{{ layout.names[entry.id] }}
                    </v-chip>
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
                        <v-col
                            v-for="row in rowsOf(entry.body)"
                            :key="row.label"
                            cols="12"
                            md="6"
                        >
                            <div class="text-caption text-medium-emphasis">
                                {{ row.label }}
                            </div>
                            <p class="mb-2">
                                {{ row.text }}
                            </p>
                        </v-col>
                    </v-row>
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
import { quadrantLayoutOf } from '../utils/assessmentQuadrants';
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

const layout = computed(() => quadrantLayoutOf(props.result.assessmentId));
const isQuadrant = (value: unknown): value is string => typeof value === 'string' && layout.value.cells.includes(value);

const sides = computed(() => {
    const raw = props.result.result.scores;

    if (!Array.isArray(raw)) return [];

    return raw.flatMap((entry) => {
        const info = props.dimensions.find((candidate) => candidate.id === entry?.dimension);

        if (!info || typeof entry.score !== 'number' || !isLevel(entry.level)) return [];

        const level: Level = entry.level;

        return [{
            id: info.id, name: info.name, low: info.low, high: info.high, score: entry.score as number, level,
        }];
    });
});

const scoreOf = (id: string) => sides.value.find((entry) => entry.id === id)?.score ?? 50;
const rowScore = computed(() => scoreOf(layout.value.rowDimension));
const columnScore = computed(() => scoreOf(layout.value.columnDimension));

const primary = computed<string | null>(() => (isQuadrant(props.result.result.primary) ? props.result.result.primary : null));
const between = computed<string[]>(() => {
    const raw = props.result.result.between;

    return Array.isArray(raw) ? raw.filter(isQuadrant) : [];
});

/** Rows of the map: the row dimension low on top, high below; the column dimension low on the left, high on the right */
const cells = computed(() => layout.value.cells.map((id) => ({ id })));

const quadrants = computed(() => [...(primary.value ? [primary.value] : []), ...between.value].map((id) => ({
    id,
    body: props.result.content.find((item) => item.key === `${props.result.assessmentId}_quadrant-${id}`),
})));

const rowsOf = (body: FixedResultResponse) => [
    {
        label: layout.value.settingLabel, text: body.loveStyle,
    }, {
        label: '日常的樣子', text: body.dailyBehavior,
    }, {
        label: '怎麼照顧自己與關係', text: body.growthAdvice,
    }, {
        label: '可以運用的長處', text: body.growthReflection?.useStrength ?? '',
    }, {
        label: '可以留意的習慣', text: body.growthReflection?.watchHabit ?? '',
    }, {
        label: '想一想', text: body.growthReflection?.reflectionQuestion ?? '',
    },
].filter((row) => row.text);

const disclaimer = computed(() => props.result.content[0]?.disclaimer ?? '');
</script>

<style scoped>
.map-wrap {
    display: grid;
    grid-template-columns: 2.75rem 1fr;
    gap: 4px 8px;
    max-width: 28rem;
    margin: 0 auto;
}

.map {
    position: relative;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 4px;
}

.map__cell {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 5rem;
    padding: 8px;
    border: 1px solid rgba(var(--v-theme-on-surface), 0.12);
    border-radius: 8px;
    text-align: center;
    font-size: 0.875rem;
    color: rgba(var(--v-theme-on-surface), 0.6);
}

.map__cell--near {
    background: rgba(var(--v-theme-primary), 0.08);
    color: rgb(var(--v-theme-on-surface));
}

.map__cell--primary {
    background: rgba(var(--v-theme-success), 0.16);
    border-color: rgb(var(--v-theme-success));
    color: rgb(var(--v-theme-on-surface));
    font-weight: 700;
}

.map__dot {
    position: absolute;
    width: 14px;
    height: 14px;
    border-radius: 50%;
    background: rgb(var(--v-theme-primary));
    border: 2px solid white;
    box-shadow: 0 0 0 1px rgb(var(--v-theme-primary));
    transform: translate(-50%, -50%);
}

.map-axis {
    display: flex;
    justify-content: space-between;
    font-size: 0.75rem;
    color: rgba(var(--v-theme-on-surface), 0.6);
}

.map-axis--x {
    grid-column: 2;
}

.map-axis--y {
    flex-direction: column;
    text-align: right;
}

.list {
    margin: 0;
    padding-left: 1.25rem;
}
</style>
