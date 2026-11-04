<template>
    <div class="report-page">
        <v-alert
            v-if="!definition"
            type="warning"
            variant="tonal"
        >
            找不到這個自我分析。
            <NuxtLink to="/self-reports">回到自我分析</NuxtLink>
        </v-alert>

        <template v-else>
            <ReportBanner
                :title="definition.title"
                :headline="`你的${definition.title}`"
                tagline="你自己回答出來的傾向，不與他人比較"
                tone="green"
            />

            <v-alert
                type="info"
                variant="tonal"
                density="compact"
                class="mb-4"
            >
                這份報告的題目沒有經過信度與效度驗證，只能幫你自我探索，不是心理評估或診斷。
            </v-alert>

            <v-progress-circular
                v-if="loading"
                indeterminate
            />

            <v-alert
                v-else-if="loadError"
                type="error"
                variant="tonal"
            >
                {{ loadError }}
            </v-alert>

            <v-card
                v-else-if="!result"
                variant="outlined"
            >
                <v-card-text>
                    <p class="text-body-1 mb-4">
                        還沒有{{ definition.title }}的結果。
                    </p>
                    <v-btn
                        color="primary"
                        :to="`/assessment/${definition.id}`"
                    >
                        開始測驗
                    </v-btn>
                </v-card-text>
            </v-card>

            <template v-else>
                <v-alert
                    v-if="pending"
                    type="info"
                    variant="tonal"
                    class="mb-4"
                >
                    這次的結果只留在這個瀏覽器。
                    <v-btn
                        size="small"
                        variant="text"
                        :loading="saving"
                        @click="savePending"
                    >
                        儲存到我的帳號（保存 3 個月）
                    </v-btn>
                    <span v-if="saveError">{{ saveError }}</span>
                </v-alert>
                <v-alert
                    v-else-if="!isAuthenticated"
                    type="info"
                    variant="tonal"
                    class="mb-4"
                >
                    結果只留在這個瀏覽器；
                    <NuxtLink to="/login">登入</NuxtLink>
                    後重新測驗，可以把結果保存 3 個月。
                </v-alert>

                <!-- How to read the result, before the result -->
                <v-card
                    variant="outlined"
                    class="mb-4"
                >
                    <v-card-title>怎麼看這份結果</v-card-title>
                    <v-card-text>
                        <p
                            v-if="isRanked"
                            class="text-body-2 mb-2"
                        >
                            每一項有 0 到 100 的分數，只用來排出先後：分數越高，代表你的回答越偏向這一項。前幾名是你目前最突出的，後面的只是較不突出。
                        </p>
                        <p
                            v-else-if="view === 'code'"
                            class="text-body-2 mb-2"
                        >
                            每一型有 0 到 100 的分數，代表你對這一類活動的喜歡程度；分數最高的三型，依序排成你的三碼興趣代碼。
                        </p>
                        <p
                            v-else-if="definition.kind === 'scale'"
                            class="text-body-2 mb-2"
                        >
                            分數是 0 到 100，代表你自己的回答偏向這個面向的程度：偏低（低於 40）、居中（40 到 60）、偏高（高於 60）。
                        </p>
                        <p
                            v-else
                            class="text-body-2 mb-2"
                        >
                            這份結果沒有分數，列出的是你自己選出的項目，以及你排的先後順序。
                        </p>
                        <p class="text-body-2 mb-0">
                            題目由本站自行設計，沒有經過信度與效度驗證，也不是任何既有量表。結果只描述你的自我回答，不與他人比較，也不是診斷；沒有好壞高下，只是不同的傾向。
                        </p>
                    </v-card-text>
                </v-card>

                <v-card
                    v-if="definition.kind === 'scale' && !ownLayout && notes.length"
                    variant="outlined"
                    class="mb-4"
                >
                    <v-card-text>
                        <p
                            v-for="line in notes"
                            :key="line"
                            class="text-body-1 mb-1"
                        >
                            {{ line }}
                        </p>
                    </v-card-text>
                </v-card>

                <v-card
                    v-if="scores.length && !ownLayout"
                    variant="outlined"
                    class="mb-4"
                >
                    <v-card-text>
                        <div
                            v-for="entry in scores"
                            :key="entry.dimension"
                            class="mb-3"
                        >
                            <div class="d-flex align-center ga-2 mb-1">
                                <span class="text-subtitle-2 font-weight-bold">{{ infoOf(entry.dimension)?.name ?? entry.dimension }}</span>
                                <v-chip
                                    v-if="entry.level"
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
                                :color="entry.level ? LEVEL_COLORS[entry.level] : 'primary'"
                                height="10"
                                rounded
                            />
                            <div
                                v-if="infoOf(entry.dimension)"
                                class="d-flex justify-space-between text-caption text-medium-emphasis mt-1"
                            >
                                <span>低：{{ infoOf(entry.dimension)?.low }}</span>
                                <span class="text-right">高：{{ infoOf(entry.dimension)?.high }}</span>
                            </div>
                        </div>
                    </v-card-text>
                </v-card>

                <AssessmentCodeResult
                    v-if="view === 'code'"
                    :names="dimensionNames"
                    :result="result"
                />
                <AssessmentRankedResult
                    v-else-if="isRanked"
                    :names="dimensionNames"
                    :result="result"
                />
                <AssessmentProfileResult
                    v-else-if="view === 'profile' && definition.kind === 'scale'"
                    :dimensions="definition.dimensions ?? []"
                    :notes="notes"
                    :result="result"
                />
                <AssessmentQuadrantResult
                    v-else-if="view === 'quadrant' && definition.kind === 'scale'"
                    :dimensions="definition.dimensions ?? []"
                    :notes="notes"
                    :result="result"
                />
                <AssessmentSelectionResult
                    v-else-if="definition.kind === 'selection'"
                    :names="optionNames"
                    :result="result"
                    :synthesis="synthesis"
                />
                <template v-else>
                    <FixedResultView
                        v-for="(item, index) in result.content"
                        :key="item.key"
                        :result="item"
                        :show-disclaimer="index === result.content.length - 1"
                    />
                </template>

                <div class="d-flex justify-center mb-4">
                    <v-btn
                        variant="outlined"
                        prepend-icon="mdi-restart"
                        :to="{ path: `/assessment/${definition.id}`, query: { retake: '1' } }"
                    >
                        重新測驗
                    </v-btn>
                </div>
            </template>
        </template>

        <!-- Back to where the reports are listed -->
        <v-fab
            app
            extended
            color="primary"
            location="bottom end"
            to="/self-reports"
            prepend-icon="mdi-arrow-left"
            text="自我分析報告"
        />
    </div>
</template>

<script lang="ts" setup>
import {
    findAssessment, type AssessmentSynthesis, type DimensionScore,
} from '../../../shared/assessments';
import type { AssessmentResult } from '../../../shared/schemas/api/assessment.schema';

const LEVEL_LABELS = {
    low: '偏低', mid: '居中', high: '偏高',
} as const;
const LEVEL_COLORS = {
    low: 'info', mid: 'primary', high: 'success',
} as const;

const route = useRoute();
const rawId = String(route.params.id);
const definition = findAssessment(rawId);
const { isAuthenticated } = useAuth();
const { load: loadExploration } = useExploration();
const {
    loadLatest, pendingSave, savePending: sendPending,
} = useAssessment(rawId, definition?.version ?? '');

useHead({ title: definition?.title ?? '自我分析' });

const loading = ref(true);
const loadError = ref<string | null>(null);
const result = ref<AssessmentResult | null>(null);
const pending = ref(false);
const saving = ref(false);
const saveError = ref<string | null>(null);

/** What a dimension is called and what its two ends lean toward, when the assessment says */
const infoOf = (dimension: string) => (definition?.kind === 'scale' ? definition.dimensions?.find((info) => info.id === dimension) : undefined);

/** Whether the result is laid out as a ranked list: the first few told in full, then all of them in order */
const view = computed(() => (definition?.kind === 'scale' ? definition.view : undefined));
const isRanked = computed(() => view.value === 'ranked');

/** Whether the result is told by its own layout, so that the general score bars and notes are left out */
const ownLayout = computed(() => view.value !== undefined);

/** What each dimension of a scale is called, by id */
const dimensionNames = computed<Record<string, string>>(() => (definition?.kind === 'scale' ? Object.fromEntries((definition.dimensions ?? []).map((info) => [info.id, info.name])) : {}));

/** What each option of a pick is called, by id */
const optionNames = computed<Record<string, string>>(() => (definition?.kind === 'selection' ? Object.fromEntries(definition.options.map((option) => [option.id, option.name])) : {}));

/** What the picks say together, when the assessment says */
const synthesis = computed<AssessmentSynthesis>(() => {
    const empty = {
        portrait: [], tensions: [],
    };

    if (!definition || !result.value) return empty;

    try {
        return definition.synthesisOf?.(result.value.result) ?? empty;
    } catch (error) {
        console.warn('[assessment] result does not fit the definition:', error);

        return empty;
    }
});

/** What the assessment says about the result beyond its scores, when it does */
const notes = computed<string[]>(() => {
    if (!definition || !result.value) return [];

    try {
        return definition.notesOf?.(result.value.result) ?? [];
    } catch (error) {
        console.warn('[assessment] result does not fit the definition:', error);

        return [];
    }
});

/** The dimension scores of a result that has them; a result of another shape just shows its contents */
const scores = computed<DimensionScore[]>(() => {
    const raw = result.value?.result.scores;

    return Array.isArray(raw) ? raw.filter((entry): entry is DimensionScore => typeof entry?.dimension === 'string' && typeof entry?.score === 'number') : [];
});

async function load() {
    if (!definition) {
        loading.value = false;

        return;
    }

    try {
        result.value = await loadLatest();
        pending.value = result.value !== null && pendingSave() !== null;
    } catch (error) {
        console.error('[assessment] load failed:', error);
        loadError.value = '讀取失敗，請稍後再試。';
    } finally {
        loading.value = false;
    }
}

async function savePending() {
    saving.value = true;
    saveError.value = null;

    try {
        const saved = await sendPending();

        if (saved) result.value = saved;

        pending.value = false;
        await loadExploration();
    } catch (error) {
        console.error('[assessment] save failed:', error);
        saveError.value = '儲存失敗，請稍後再試。';
    } finally {
        saving.value = false;
    }
}

onMounted(load);
</script>
