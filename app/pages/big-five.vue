<template>
    <div class="report-page">
        <ReportBanner
            title="大五人格"
            headline="大五人格測驗"
            tagline="50 題，約 10 分鐘；看你在五個特質上的傾向"
            tone="green"
        />

        <v-alert
            v-if="submitted"
            type="success"
            variant="tonal"
            class="mb-4"
        >
            作答完成，正在前往你的結果⋯⋯
        </v-alert>

        <template v-else>
            <p class="text-body-2 text-medium-emphasis mb-3">
                依照你平常的樣子回答，沒有對錯。已作答 {{ answeredCount }}／{{ questions.length }} 題；離開前的作答會暫存在這個瀏覽器，回來可以接著做。
            </p>
            <v-progress-linear
                :model-value="progress"
                class="mb-4"
            />

            <v-card
                v-for="question in pageQuestions"
                :key="question.id"
                class="question mb-3"
                :class="{ 'question--answered': isAnswered(question.id) }"
            >
                <v-card-text>
                    <div class="d-flex align-start ga-2 mb-2">
                        <span class="question__text">{{ question.text }}</span>
                        <v-spacer />
                        <v-icon
                            :icon="isAnswered(question.id) ? 'mdi-check-circle' : 'mdi-circle-outline'"
                            :color="isAnswered(question.id) ? 'success' : undefined"
                            :aria-label="isAnswered(question.id) ? '已作答' : '尚未作答'"
                            class="question__mark"
                        />
                    </div>
                    <v-radio-group
                        v-model="answers[question.id]"
                        inline
                        hide-details
                        color="success"
                    >
                        <v-radio
                            v-for="option in BIG_FIVE_OPTIONS"
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
                    :disabled="!allAnswered"
                    :loading="submitting"
                    @click="submit"
                >
                    送出
                </v-btn>
            </div>
        </template>
    </div>
</template>

<script lang="ts" setup>
import {
    BIG_FIVE_OPTIONS, BIG_FIVE_PAGE_SIZE, BIG_FIVE_QUESTIONS,
} from '../../shared/constants/bigFive';

useHead({ title: '大五人格測驗' });

const route = useRoute();
const { load: loadExploration } = useExploration();
const {
    readDraft, writeDraft, submit: sendAnswers, reset,
} = useBigFive();

const questions = BIG_FIVE_QUESTIONS;
const answers = reactive<Record<string, number>>({});
const page = ref(0);
const submitting = ref(false);
const submitted = ref(false);
const submitError = ref<string | null>(null);

const pageCount = Math.max(1, Math.ceil(questions.length / BIG_FIVE_PAGE_SIZE));
const pageQuestions = computed(() => questions.slice(page.value * BIG_FIVE_PAGE_SIZE, (page.value + 1) * BIG_FIVE_PAGE_SIZE));
const answeredCount = computed(() => questions.filter((question) => answers[question.id] !== undefined).length);
const progress = computed(() => (answeredCount.value / questions.length) * 100);
const pageComplete = computed(() => pageQuestions.value.every((question) => answers[question.id] !== undefined));
const allAnswered = computed(() => answeredCount.value === questions.length);

const isAnswered = (questionId: string) => answers[questionId] !== undefined;

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

    Object.assign(answers, readDraft());

    // Continue from the first page that still has something to answer
    const firstOpen = questions.findIndex((question) => answers[question.id] === undefined);

    page.value = firstOpen < 0 ? pageCount - 1 : Math.floor(firstOpen / BIG_FIVE_PAGE_SIZE);
});

// What has been answered survives a reload
watch(answers, () => writeDraft({ ...answers }), { deep: true });

// Each page of questions starts at the top
watch(page, () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

async function submit() {
    submitting.value = true;
    submitError.value = null;

    try {
        await sendAnswers({ ...answers });
        submitted.value = true;
        // What other screens show may have changed with the result, but nothing here waits for it: the result page is the next thing to see
        void loadExploration();
        await navigateTo('/analysis/big-five');
    } catch (error) {
        console.error('[big-five] submit failed:', error);
        submitError.value = messageOf(error, '送出失敗，請稍後再試。');
    } finally {
        submitting.value = false;
    }
}
</script>

<style scoped>
/* Not answered yet: plain and muted, so what is left to do stands out */
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

.question--answered .question__text {
    color: rgba(var(--v-theme-on-surface), 0.75);
}
</style>
