<template>
    <div class="report-page">
        <ReportBanner
            title="綜合分析"
            headline="綜觀並深入分析不同面向的你"
            tone="green"
        />

        <GuestNotice v-if="!isAuthenticated">
            綜合分析要登入後，用點數取得，登入後可以在「分析紀錄」分頁回頭看過去的報告。
        </GuestNotice>

        <template v-else>
            <v-tabs
                v-model="tab"
                class="mb-4"
            >
                <v-tab value="new">
                    新分析
                </v-tab>
                <v-tab value="history">
                    分析紀錄
                </v-tab>
            </v-tabs>

            <AiReportList v-if="tab === 'history'" />

            <template v-else>
                <v-alert
                    v-if="problem"
                    :type="problem.type"
                    variant="tonal"
                    class="mb-4"
                >
                    {{ problem.message }}
                    <template
                        v-if="problem.to"
                        #append
                    >
                        <v-btn
                            :to="problem.to"
                            size="small"
                            variant="text"
                        >
                            {{ problem.action }}
                        </v-btn>
                    </template>
                </v-alert>

                <v-card
                    variant="outlined"
                    class="mb-8 picker"
                >
                    <v-card-text class="pa-5">
                        <div class="text-subtitle-1 font-weight-medium mb-3">
                            選擇要分析的維度
                        </div>

                        <DimensionWeb
                            :options="options"
                            :selected="selected"
                            class="mb-4"
                        />

                        <v-chip-group
                            v-model="selected"
                            multiple
                            column
                            class="chips mb-4"
                        >
                            <v-chip
                                v-for="option in options"
                                :key="option.value"
                                :value="option.value"
                                :disabled="!option.ready"
                                :title="option.ready ? undefined : `需要：${option.need}`"
                                :prepend-icon="option.icon"
                                filter
                                variant="outlined"
                                color="primary"
                                size="large"
                            >
                                {{ option.label }}
                            </v-chip>
                        </v-chip-group>

                        <v-textarea
                            v-model="question"
                            label="想問 AI 的事（選填）"
                            placeholder="例如：我最近在猶豫要不要換工作，這些特質怎麼看？"
                            :counter="AI_QUESTION_MAX_LENGTH"
                            :maxlength="AI_QUESTION_MAX_LENGTH"
                            rows="2"
                            auto-grow
                            variant="outlined"
                            hide-details="auto"
                            class="mb-4"
                        />

                        <div class="d-flex flex-wrap align-center ga-3">
                            <div>
                                <div class="text-body-1 font-weight-medium">
                                    {{ cost === null ? '請選擇至少一個系統' : `已選 ${selected.length} 個系統，共 ${cost} 點` }}
                                </div>
                            </div>
                            <v-spacer />
                            <v-btn
                                color="primary"
                                size="x-large"
                                variant="flat"
                                class="start"
                                :disabled="cost === null"
                                prepend-icon="mdi-creation-outline"
                                @click="confirming = true"
                            >
                                {{ startLabel }}
                            </v-btn>
                        </div>
                    </v-card-text>
                </v-card>
            </template>
        </template>

        <v-dialog
            v-model="confirming"
            max-width="480"
            :persistent="starting"
        >
            <v-card>
                <v-card-title class="pt-5 px-6">
                    確認送出分析
                </v-card-title>
                <v-card-text class="px-6">
                    <div class="text-body-2 text-medium-emphasis mb-2">
                        分析的維度
                    </div>
                    <div class="d-flex flex-wrap ga-2 mb-4">
                        <v-chip
                            v-for="option in chosen"
                            :key="option.value"
                            :prepend-icon="option.icon"
                            variant="tonal"
                            color="primary"
                        >
                            {{ option.label }}
                        </v-chip>
                    </div>

                    <div class="text-body-2 text-medium-emphasis mb-1">
                        你的提問
                    </div>
                    <p class="mb-4 question">
                        {{ question.trim() || '未提問，依報告分析' }}
                    </p>

                    <v-divider class="mb-4" />

                    <div class="d-flex align-center">
                        <span>將扣除</span>
                        <v-spacer />
                        <span class="text-h6">{{ cost }} 點</span>
                    </div>
                    <div
                        v-if="balance !== null && cost !== null"
                        class="d-flex align-center text-body-2 text-medium-emphasis"
                    >
                        <span>目前 {{ balance }} 點</span>
                        <v-spacer />
                        <span>送出後剩 {{ balance - cost }} 點</span>
                    </div>
                    <p class="text-caption text-medium-emphasis mt-3 mb-0">
                        送出後在背景產生，沒有成功會自動退點。
                    </p>
                </v-card-text>
                <v-card-actions class="px-6 pb-5">
                    <v-spacer />
                    <v-btn
                        variant="text"
                        :disabled="starting"
                        @click="confirming = false"
                    >
                        取消
                    </v-btn>
                    <v-btn
                        color="primary"
                        variant="flat"
                        :loading="starting"
                        @click="start"
                    >
                        確認送出
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </div>
</template>

<script lang="ts" setup>
import { AI_QUESTION_MAX_LENGTH } from '../../../shared/constants/ai';
import type { MultiReportSystem } from '../../../shared/report/systems';
import type { AiReportAccepted } from '../../../shared/schemas/api/aiReport.schema';
import { aiReportCost } from '../../../shared/utils/multiDimensionPricing';
import {
    DIMENSION_META, assessmentDimensions, type DimensionMeta,
} from '../../utils/reportDimensions';

useHead({ title: '綜合分析' });

const route = useRoute();
const router = useRouter();

/** The tab lives in the path (/report, /report/history), so analytics counts each as its own page and the old /ai-reports address and a finished request can land on the history */
const tab = computed<'new' | 'history'>({
    get: () => (route.params.tab === 'history' ? 'history' : 'new'),
    set: (value) => {
        void router.replace({ path: value === 'history' ? '/report/history' : '/report' });
    },
});

type Problem = {
    type: 'error' | 'warning' | 'info';
    message: string;
    to?: string;
    action?: string;
};

const {
    isAuthenticated, initAuthListener,
} = useAuth();
const { post } = useApi();
const {
    state, progress,
} = useExploration();
const {
    balance, refresh: refreshPoints,
} = usePoints();

const selected = ref<MultiReportSystem[]>([]);
const starting = ref(false);
const confirming = ref(false);
const question = ref('');
const problem = ref<Problem | null>(null);

const dimensions = [...DIMENSION_META, ...assessmentDimensions()];

/** Whether the member has what a dimension needs: a layer of the exploration, or a result of a self-analysis that has not expired */
const readyOf = (meta: DimensionMeta) => (meta.assessmentId
    ? state.value.assessmentDone[meta.assessmentId] === true
    : Object.entries(progress.value.done).some(([layer, done]) => layer === meta.value && done));

const options = computed(() => dimensions.map((meta) => ({
    ...meta,
    ready: readyOf(meta),
})));

const cost = computed(() => aiReportCost(selected.value));
const chosen = computed(() => options.value.filter((option) => selected.value.includes(option.value)));
const startLabel = computed(() => {
    if (cost.value === null) return '開始分析';

    return `${selected.value.length === 1 ? '開始深入分析' : '開始綜合分析'}（${cost.value} 點）`;
});

// A link may bring the systems and the question (a report's own page, or "ask again"): choose them once what the member has is known
const requested = typeof route.query.systems === 'string' ? route.query.systems.split(',') : [];
let preselected = requested.length === 0;

// The question travels in the history state, not the address: free text a member typed must not end up in the URL (and so in analytics)
const requestedQuestion: unknown = window.history.state?.question;

if (typeof requestedQuestion === 'string') question.value = [...requestedQuestion].slice(0, AI_QUESTION_MAX_LENGTH).join('');

watch(options, (all) => {
    if (preselected) return;

    const wanted = all.filter((option) => option.ready && requested.includes(option.value)).map((option) => option.value);

    if (wanted.length === 0) return;

    selected.value = wanted;
    preselected = true;
}, { immediate: true });

function problemFrom(error: unknown): Problem {
    const failure = error as {
        statusCode?: number;
        data?: { code?: string };
    };

    if (failure.statusCode === 402) {
        return {
            type: 'warning', message: '點數不足，沒有扣點。', to: '/pricing/points', action: '查看點數',
        };
    }

    if (failure.statusCode === 429) {
        return {
            type: 'warning', message: '產生次數已達上限（每小時 3 次、每天 10 次），沒有扣點，請稍後再試。',
        };
    }

    if (failure.statusCode === 404) {
        return {
            type: 'info', message: '其中一個系統的解讀內容還在準備中，沒有扣點，晚一點再回來看看。',
        };
    }

    const code = failure.data?.code;

    if (code === 'NO_INSIGHTS') {
        return {
            type: 'info', message: '這個組合目前沒有找到跨系統的洞見，沒有扣點。換一個組合，或只選一個系統試試。',
        };
    }

    if (code === 'MBTI_REQUIRED') {
        return {
            type: 'info', message: '請先完成 16 型人格測驗。', to: '/test', action: '去測驗',
        };
    }

    if (code && ['PROFILE_REQUIRED', 'BLOOD_REQUIRED', 'BIRTH_TIME_REQUIRED', 'BIRTH_PLACE_REQUIRED'].includes(code)) {
        return {
            type: 'info', message: '有系統需要的資料還沒填寫，沒有扣點。', to: '/#fill', action: '去填寫',
        };
    }

    return {
        type: 'error', message: '暫時無法產生報告，沒有扣點，請稍後再試。',
    };
}

async function start() {
    starting.value = true;
    problem.value = null;

    try {
        await post<AiReportAccepted>(
            '/api/ai-reports',
            { systems: selected.value, question: question.value.trim() || undefined },
            { headers: { 'Idempotency-Key': crypto.randomUUID().replaceAll('-', '') } },
        );

        selected.value = [];
        question.value = '';
        confirming.value = false;

        // The balance is refreshed in the background (it handles its own errors) so the page does not wait for it
        void refreshPoints();

        // The list of AI reports shows it being made and the result when it is done
        await navigateTo('/report/history');
    } catch (error) {
        console.error('[report] failed to start:', error);
        confirming.value = false;
        problem.value = problemFrom(error);
    } finally {
        starting.value = false;
    }
}

onMounted(initAuthListener);
</script>

<style scoped>
.chips :deep(.v-slide-group__content) {
    justify-content: center;
}

.question {
    white-space: pre-wrap;
    overflow-wrap: anywhere;
}

.picker {
    background: rgba(var(--v-theme-primary), 0.03);
}

.start {
    min-width: 280px;
    font-size: 1.05rem;
    font-weight: 700;
    letter-spacing: 0.04em;
    box-shadow: 0 4px 14px rgba(var(--v-theme-primary), 0.35);
}

</style>
