<template>
    <div>
        <!-- The code: the types it is made of, highest first -->
        <v-card
            variant="outlined"
            class="mb-4"
        >
            <v-card-title>你的三碼興趣代碼</v-card-title>
            <v-card-text>
                <div class="d-flex flex-wrap ga-4 mb-3">
                    <div
                        v-for="(entry, index) in topEntries"
                        :key="entry.id"
                        class="code-tile"
                    >
                        <v-avatar
                            :color="index === 0 ? 'success' : 'primary'"
                            variant="flat"
                            size="64"
                        >
                            <span class="code-tile__letter">{{ entry.letter }}</span>
                        </v-avatar>
                        <div class="text-subtitle-2 mt-1">
                            {{ entry.label }}
                        </div>
                        <div class="text-caption text-medium-emphasis">
                            第 {{ index + 1 }} 名・{{ entry.score }}
                        </div>
                    </div>
                </div>
                <p class="text-body-2 mb-2">
                    代碼 {{ code }}，依分數由高到低排列。
                </p>
                <p
                    v-if="tieBroken"
                    class="text-body-2 mb-2"
                >
                    第三名和第四名的分數相同，依固定的順序（R、I、A、S、E、C）決定了哪一型進入三碼。
                </p>
                <v-alert
                    type="info"
                    variant="tonal"
                    density="compact"
                >
                    這是興趣的描述，不是能力或適性的判定，也不是建議你必須從事的職業；興趣會隨著經驗改變。
                </v-alert>
            </v-card-text>
        </v-card>

        <!-- What the three together say -->
        <v-card
            v-if="codeBody"
            variant="outlined"
            class="mb-4"
        >
            <v-card-title>三種興趣放在一起</v-card-title>
            <v-card-text>
                <blockquote class="quote">
                    <p class="quote__text">
                        {{ codeBody.summary }}
                    </p>
                </blockquote>
                <v-row
                    dense
                    class="mt-2"
                >
                    <v-col
                        v-for="row in rowsOf(codeBody, ['workStyle', 'growthAdvice'])"
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
            </v-card-text>
        </v-card>

        <!-- Each of the three in one card -->
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
                        :color="index === 0 ? 'success' : 'primary'"
                        variant="flat"
                    >
                        第 {{ index + 1 }} 名
                    </v-chip>
                    <span class="text-subtitle-1 font-weight-bold">{{ entry.body?.title ?? entry.label }}</span>
                    <v-spacer />
                    <span class="text-subtitle-2">{{ entry.score }}</span>
                </div>
                <v-progress-linear
                    :model-value="entry.score"
                    :color="index === 0 ? 'success' : 'primary'"
                    height="6"
                    rounded
                    class="mb-3"
                />
                <template v-if="entry.body">
                    <p class="mb-3">
                        {{ entry.body.summary }}
                    </p>
                    <div
                        v-if="entry.body.strengths.length"
                        class="d-flex flex-wrap ga-2 mb-3"
                    >
                        <v-chip
                            v-for="item in entry.body.strengths"
                            :key="item"
                            size="small"
                            variant="tonal"
                        >
                            {{ item }}
                        </v-chip>
                    </div>
                    <v-row dense>
                        <v-col
                            v-for="row in rowsOf(entry.body, ['workStyle', 'dailyBehavior', 'question'])"
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
            <v-card-title>六種興趣的分數</v-card-title>
            <v-card-text>
                <div
                    v-for="(entry, index) in ranked"
                    :key="entry.id"
                    class="rank-row"
                    :class="{ 'rank-row--rest': !entry.top }"
                >
                    <span class="rank-row__no">{{ index + 1 }}</span>
                    <span class="rank-row__name">{{ entry.label }}</span>
                    <v-progress-linear
                        class="rank-row__bar"
                        :model-value="entry.score"
                        :color="entry.top ? 'success' : undefined"
                        height="6"
                        rounded
                    />
                    <span class="rank-row__score">{{ entry.score }}</span>
                </div>
                <p class="text-caption text-medium-emphasis mt-2 mb-0">
                    前三名組成代碼；其他三種只是目前較不吸引你，不代表你做不來。
                </p>
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
    /** What each type is called, by id, with its letter in brackets: 實作型（R） */
    names: Readonly<Record<string, string>>;
    result: AssessmentResult;
}>();

const scores = computed(() => {
    const raw = props.result.result.scores;

    if (!Array.isArray(raw)) return [];

    return raw.flatMap((entry) => (typeof entry?.dimension === 'string' && typeof entry?.score === 'number'
        ? [{
            id: entry.dimension as string, score: entry.score as number,
        }]
        : []));
});

const top = computed<string[]>(() => {
    const raw = props.result.result.top;

    return Array.isArray(raw) ? raw.filter((id): id is string => typeof id === 'string') : [];
});

const tieBroken = computed(() => props.result.result.tieBroken === true);
const labelOf = (id: string) => props.names[id] ?? id;
const letterOf = (id: string) => /（(.)）/.exec(labelOf(id))?.[1] ?? '';
const code = computed(() => top.value.map(letterOf).join(''));

const PREFIX_LENGTH = props.result.assessmentId.length + 1;

/** The content of a type is keyed `type-R`; the one of the set of the three, `code-IAS` */
const bodyOfType = (id: string) => props.result.content.find((item) => item.key.slice(PREFIX_LENGTH) === `type-${letterOf(id)}`);
const codeBody = computed(() => props.result.content.find((item) => item.key.slice(PREFIX_LENGTH).startsWith('code-')));

const topEntries = computed(() => top.value.map((id) => ({
    id,
    label: labelOf(id),
    letter: letterOf(id),
    score: scores.value.find((entry) => entry.id === id)?.score ?? 0,
    body: bodyOfType(id),
})));

const ranked = computed(() => scores.value.map((entry) => ({
    ...entry, label: labelOf(entry.id), top: top.value.includes(entry.id),
})));

type RowKey = 'workStyle' | 'growthAdvice' | 'dailyBehavior' | 'question';

const LABELS: Readonly<Record<RowKey, string>> = {
    workStyle: '偏好的環境',
    growthAdvice: '可以怎麼探索',
    dailyBehavior: '日常的樣子',
    question: '想一想',
};

/** The parts of a content to show, in the order asked for, leaving out what it does not have */
const rowsOf = (body: FixedResultResponse, keys: readonly RowKey[]) => keys.map((key) => ({
    label: LABELS[key],
    text: key === 'question' ? body.growthReflection?.reflectionQuestion ?? '' : body[key],
})).filter((row) => row.text);

const disclaimer = computed(() => props.result.content[0]?.disclaimer ?? '');
</script>

<style scoped>
.code-tile {
    text-align: center;
    min-width: 6rem;
}

.code-tile__letter {
    font-size: 1.75rem;
    font-weight: 700;
    color: white;
}

.quote {
    margin: 0;
    padding: 16px 20px;
    border-left: 4px solid rgb(var(--v-theme-primary));
    border-radius: 0 8px 8px 0;
    background: rgba(var(--v-theme-primary), 0.06);
}

.quote__text {
    margin: 0;
    line-height: 1.8;
}

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

.rank-row--rest {
    opacity: 0.7;
}
</style>
