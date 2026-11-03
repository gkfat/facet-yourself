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
                :headline="`${definition.title}測驗`"
                tagline="依照你平常的樣子回答，沒有對錯"
                tone="green"
            />

            <v-alert
                type="info"
                variant="tonal"
                density="compact"
                class="mb-4"
            >
                題目由本站自行設計，沒有經過信度與效度驗證，也不是任何既有量表；結果只是一面幫你自我探索的鏡子，不是診斷。
            </v-alert>

            <v-alert
                v-if="submitted"
                type="success"
                variant="tonal"
                class="mb-4"
            >
                作答完成，正在前往你的結果⋯⋯
            </v-alert>

            <template v-else-if="definition.kind === 'scale'">
                <p class="text-body-2 text-medium-emphasis mb-3">
                    已作答 {{ answeredCount }}／{{ definition.items.length }} 題；離開前的作答會暫存在這個瀏覽器，回來可以接著做。
                </p>
                <v-progress-linear
                    :model-value="progress"
                    class="mb-4"
                />

                <v-card
                    v-for="item in pageItems"
                    :key="item.id"
                    class="question mb-3"
                    :class="{ 'question--answered': isAnswered(item.id) }"
                >
                    <v-card-text>
                        <div class="d-flex align-start ga-2 mb-2">
                            <span class="question__text">{{ item.text }}</span>
                            <v-spacer />
                            <v-icon
                                :icon="isAnswered(item.id) ? 'mdi-check-circle' : 'mdi-circle-outline'"
                                :color="isAnswered(item.id) ? 'success' : undefined"
                                :aria-label="isAnswered(item.id) ? '已作答' : '尚未作答'"
                                class="question__mark"
                            />
                        </div>
                        <v-radio-group
                            v-model="draft.scale[item.id]"
                            inline
                            hide-details
                            color="success"
                        >
                            <v-radio
                                v-for="option in SCALE_OPTIONS"
                                :key="option.value"
                                :label="option.label"
                                :value="option.value"
                            />
                        </v-radio-group>
                    </v-card-text>
                </v-card>

                <v-alert
                    v-if="submitError"
                    type="error"
                    variant="tonal"
                    class="mb-3"
                >
                    {{ submitError }}
                </v-alert>

                <div class="d-flex justify-space-between">
                    <v-btn
                        :disabled="page === 0"
                        @click="page -= 1"
                    >
                        上一頁
                    </v-btn>
                    <v-btn
                        v-if="page < pageCount - 1"
                        color="primary"
                        :disabled="!pageComplete"
                        @click="page += 1"
                    >
                        下一頁
                    </v-btn>
                    <v-btn
                        v-else
                        color="primary"
                        :disabled="!canSubmit"
                        :loading="submitting"
                        @click="submit"
                    >
                        送出
                    </v-btn>
                </div>
            </template>

            <template v-else>
                <p class="text-body-2 text-medium-emphasis mb-3">
                    先選出 {{ definition.pick }} 項最符合你的，再把其中 {{ definition.rank }} 項依重要程度排序。已選 {{ draft.selected.length }}／{{ definition.pick }}。
                </p>

                <v-row dense>
                    <v-col
                        v-for="option in definition.options"
                        :key="option.id"
                        cols="12"
                        sm="6"
                    >
                        <v-card
                            class="question"
                            :class="{ 'question--answered': draft.selected.includes(option.id) }"
                            :disabled="!draft.selected.includes(option.id) && draft.selected.length >= definition.pick"
                            @click="toggleOption(option.id)"
                        >
                            <v-card-text>
                                <div class="d-flex align-center ga-2">
                                    <span class="text-subtitle-1 font-weight-medium">{{ option.name }}</span>
                                    <v-spacer />
                                    <v-chip
                                        v-if="rankOf(option.id) > 0"
                                        size="small"
                                        color="success"
                                    >
                                        第 {{ rankOf(option.id) }}
                                    </v-chip>
                                </div>
                                <p class="text-body-2 mb-0">
                                    {{ option.description }}
                                </p>
                            </v-card-text>
                        </v-card>
                    </v-col>
                </v-row>

                <div
                    v-if="draft.selected.length === definition.pick"
                    class="mt-4"
                >
                    <p class="text-body-2 mb-2">
                        依序點選最重要的 {{ definition.rank }} 項（再點一次取消）：
                    </p>
                    <v-chip
                        v-for="id in draft.selected"
                        :key="id"
                        class="mr-2 mb-2"
                        :color="rankOf(id) > 0 ? 'success' : undefined"
                        @click="toggleRank(id)"
                    >
                        {{ nameOf(id) }}
                    </v-chip>
                </div>

                <v-alert
                    v-if="submitError"
                    type="error"
                    variant="tonal"
                    class="my-3"
                >
                    {{ submitError }}
                </v-alert>

                <v-btn
                    class="mt-4"
                    color="primary"
                    :disabled="!canSubmit"
                    :loading="submitting"
                    @click="submit"
                >
                    送出
                </v-btn>
            </template>
        </template>
    </div>
</template>

<script lang="ts" setup>
import {
    findAssessment,
} from '../../../shared/assessments';
import type { AssessmentDraft } from '../../composables/useAssessment';

const SCALE_OPTIONS = [
    {
        value: 1, label: '非常不同意',
    },
    {
        value: 2, label: '不同意',
    },
    {
        value: 3, label: '普通',
    },
    {
        value: 4, label: '同意',
    },
    {
        value: 5, label: '非常同意',
    },
] as const;
const SCALE_PAGE_SIZE = 5;

const route = useRoute();
const rawId = String(route.params.id);
const definition = findAssessment(rawId);
const { load: loadExploration } = useExploration();
const {
    readDraft, writeDraft, submit: sendAnswers, reset,
} = useAssessment(rawId, definition?.version ?? '');

useHead({ title: definition ? `${definition.title}測驗` : '自我分析' });

const draft = reactive<AssessmentDraft>({
    scale: {}, selected: [], ranked: [],
});
const page = ref(0);
const submitting = ref(false);
const submitted = ref(false);
const submitError = ref<string | null>(null);

const items = definition?.kind === 'scale' ? definition.items : [];
const pageCount = Math.max(1, Math.ceil(items.length / SCALE_PAGE_SIZE));
const pageItems = computed(() => items.slice(page.value * SCALE_PAGE_SIZE, (page.value + 1) * SCALE_PAGE_SIZE));
const isAnswered = (id: string) => draft.scale[id] !== undefined;
const answeredCount = computed(() => items.filter((item) => isAnswered(item.id)).length);
const progress = computed(() => (items.length ? (answeredCount.value / items.length) * 100 : 0));
const pageComplete = computed(() => pageItems.value.every((item) => isAnswered(item.id)));

const canSubmit = computed(() => {
    if (!definition) return false;

    if (definition.kind === 'scale') return answeredCount.value === items.length;

    return draft.selected.length === definition.pick && draft.ranked.length === definition.rank;
});

const nameOf = (id: string) => (definition?.kind === 'selection' ? definition.options.find((option) => option.id === id)?.name ?? id : id);
const rankOf = (id: string) => draft.ranked.indexOf(id) + 1;

function toggleOption(id: string) {
    const index = draft.selected.indexOf(id);

    if (index >= 0) {
        draft.selected.splice(index, 1);
        draft.ranked = draft.ranked.filter((rankedId) => rankedId !== id);

        return;
    }

    if (definition?.kind === 'selection' && draft.selected.length < definition.pick) draft.selected.push(id);
}

function toggleRank(id: string) {
    if (definition?.kind !== 'selection') return;

    if (draft.ranked.includes(id)) {
        draft.ranked = draft.ranked.filter((rankedId) => rankedId !== id);

        return;
    }

    if (draft.ranked.length < definition.rank) draft.ranked.push(id);
}

function messageOf(error: unknown, fallback: string): string {
    if (typeof error === 'object' && error !== null && 'data' in error) {
        const data = (error as { data?: { message?: string } }).data;

        if (data?.message) return data.message;
    }

    return error instanceof Error ? error.message : fallback;
}

onMounted(() => {
    // Arriving from "retake" starts from nothing; otherwise pick up the answers kept in this tab
    if (route.query.retake) {
        reset();

        return;
    }

    Object.assign(draft, readDraft());

    // Continue from the first page that still has something to answer
    const firstOpen = items.findIndex((item) => !isAnswered(item.id));

    page.value = firstOpen < 0 ? pageCount - 1 : Math.floor(firstOpen / SCALE_PAGE_SIZE);
});

// What has been answered survives a reload
watch(draft, () => writeDraft({
    scale: { ...draft.scale },
    selected: [...draft.selected],
    ranked: [...draft.ranked],
}), { deep: true });

watch(page, () => {
    window.scrollTo({
        top: 0, behavior: 'smooth',
    });
});

async function submit() {
    submitting.value = true;
    submitError.value = null;

    try {
        await sendAnswers({
            scale: { ...draft.scale },
            selected: [...draft.selected],
            ranked: [...draft.ranked],
        });
        submitted.value = true;
        void loadExploration();
        await navigateTo(`/analysis/${rawId}`);
    } catch (error) {
        console.error('[assessment] submit failed:', error);
        submitError.value = messageOf(error, '送出失敗，請稍後再試。');
    } finally {
        submitting.value = false;
    }
}
</script>

<style scoped>
.question {
    border-left: 4px solid rgba(var(--v-theme-on-surface), 0.12);
    transition: background-color 0.2s, border-color 0.2s;
}

.question__mark {
    opacity: 0.45;
}

.question--answered {
    border-left-color: rgb(var(--v-theme-success));
    background: rgba(var(--v-theme-success), 0.07);
}

.question--answered .question__mark {
    opacity: 1;
}
</style>
