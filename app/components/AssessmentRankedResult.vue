<template>
    <div>
        <!-- The overview: the ones that stand out, in order -->
        <v-card
            variant="outlined"
            class="mb-4"
        >
            <v-card-title>你最突出的 {{ top.length }} 項</v-card-title>
            <v-card-text>
                <div class="d-flex flex-wrap ga-2 mb-3">
                    <v-chip
                        v-for="(entry, index) in topEntries"
                        :key="entry.id"
                        size="large"
                        color="success"
                        variant="flat"
                        :prepend-icon="`mdi-numeric-${index + 1}-circle`"
                    >
                        {{ entry.name }}
                    </v-chip>
                </div>
                <p class="text-body-2 mb-1">
                    由左至右是第 1 到第 {{ top.length }} 名，下面每一項都有說明與發揮的方向。
                </p>
                <p
                    v-if="tieBroken"
                    class="text-body-2 mb-1"
                >
                    第 {{ top.length }} 名和第 {{ top.length + 1 }} 名的分數相同，依固定的順序決定了哪一項進入前 {{ top.length }}。
                </p>
                <p class="text-body-2 text-medium-emphasis mb-0">
                    排在後面的只是「較不突出」，不代表不足；每個人都有全部的優勢，只是用的程度與場合不同。
                </p>
            </v-card-text>
        </v-card>

        <!-- Each of the first ones in one card -->
        <v-card
            v-for="(entry, index) in topEntries"
            :key="entry.id"
            variant="outlined"
            class="mb-3"
        >
            <v-card-text>
                <div class="d-flex align-center ga-2 mb-2">
                    <v-chip
                        size="small"
                        color="success"
                        variant="flat"
                    >
                        第 {{ index + 1 }} 名
                    </v-chip>
                    <span class="text-subtitle-1 font-weight-bold">{{ entry.body?.title ?? entry.name }}</span>
                    <v-spacer />
                    <span class="text-subtitle-2">{{ entry.score }}</span>
                </div>
                <v-progress-linear
                    :model-value="entry.score"
                    color="success"
                    height="6"
                    rounded
                    class="mb-3"
                />
                <template v-if="entry.body">
                    <p class="mb-3">
                        {{ entry.body.summary }}
                    </p>
                    <v-row dense>
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

        <!-- All of them, in order -->
        <v-card
            variant="outlined"
            class="mb-4"
        >
            <v-card-title>全部 {{ ranked.length }} 項的排序</v-card-title>
            <v-card-text>
                <div
                    v-for="(entry, index) in ranked"
                    :key="entry.id"
                    class="rank-row"
                    :class="{ 'rank-row--rest': !entry.top }"
                >
                    <span class="rank-row__no">{{ index + 1 }}</span>
                    <span class="rank-row__name">{{ entry.name }}</span>
                    <v-progress-linear
                        class="rank-row__bar"
                        :model-value="entry.score"
                        :color="entry.top ? 'success' : undefined"
                        height="6"
                        rounded
                    />
                    <span class="rank-row__score">{{ entry.score }}</span>
                </div>
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
import type { FixedResultResponse } from '../../shared/schemas/api/fixedResult.schema';
import type { AssessmentResult } from '../../shared/schemas/api/assessment.schema';

const props = defineProps<{
    /** What each strength is called, by id */
    names: Readonly<Record<string, string>>;
    result: AssessmentResult;
}>();

type Score = {
    id: string; score: number;
};

const scores = computed<Score[]>(() => {
    const raw = props.result.result.scores;

    if (!Array.isArray(raw)) return [];

    return raw.flatMap((entry) => (typeof entry?.dimension === 'string' && typeof entry?.score === 'number'
        ? [{
            id: entry.dimension, score: entry.score,
        }]
        : []));
});

const top = computed<string[]>(() => {
    const raw = props.result.result.top;

    return Array.isArray(raw) ? raw.filter((id): id is string => typeof id === 'string') : [];
});

const tieBroken = computed(() => props.result.result.tieBroken === true);
const nameOf = (id: string) => props.names[id] ?? id;

const PREFIX_LENGTH = props.result.assessmentId.length + 1;

const bodyOf = (id: string) => props.result.content.find((item) => item.key.slice(PREFIX_LENGTH) === id);

const topEntries = computed(() => top.value.map((id) => ({
    id, name: nameOf(id), score: scores.value.find((entry) => entry.id === id)?.score ?? 0, body: bodyOf(id),
})));

const ranked = computed(() => scores.value.map((entry) => ({
    ...entry, name: nameOf(entry.id), top: top.value.includes(entry.id),
})));

/** What a content says besides its headline: how it shows, how it turns when overdone, how to use it, a question */
const rowsOf = (body: FixedResultResponse) => [
    {
        label: '日常的樣子', text: body.dailyBehavior,
    },
    {
        label: '用得太過時', text: body.overuse[0]?.whenOverused ?? '',
    },
    {
        label: '怎麼發揮', text: body.growthAdvice,
    },
    {
        label: '想一想', text: body.growthReflection?.reflectionQuestion ?? '',
    },
].filter((row) => row.text);

const disclaimer = computed(() => props.result.content[0]?.disclaimer ?? '');
</script>

<style scoped>
/* One line for each strength: its place, its name, a bar and the score */
.rank-row {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 4px 0;
}

.rank-row__no {
    width: 1.5rem;
    text-align: right;
    font-variant-numeric: tabular-nums;
    color: rgba(var(--v-theme-on-surface), 0.6);
}

.rank-row__name {
    width: 7.5rem;
    flex-shrink: 0;
}

.rank-row__bar {
    flex: 1;
}

.rank-row__score {
    width: 2.5rem;
    text-align: right;
    font-variant-numeric: tabular-nums;
}

/* The ones that do not stand out: quieter, not a lack */
.rank-row--rest {
    opacity: 0.7;
}
</style>
