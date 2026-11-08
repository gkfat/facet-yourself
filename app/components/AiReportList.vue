<template>
    <section>
        <LoadingState v-if="loading" />

        <v-alert
            v-else-if="failed"
            type="error"
            variant="tonal"
        >
            暫時無法讀取分析紀錄，請重新整理頁面再試一次。
        </v-alert>

        <div
            v-else-if="!reports.length"
            class="text-body-2 text-medium-emphasis"
        >
            <p class="mb-3">
                還沒有分析紀錄。選一個或多個系統，也可以附上想問的事，由 AI 生成專屬於你的解讀。
            </p>
            <v-btn
                to="/report"
                color="primary"
                prepend-icon="mdi-creation-outline"
            >
                開始生成
            </v-btn>
        </div>

        <template v-else>
            <div class="d-flex justify-end mb-4">
                <v-btn
                    to="/report"
                    color="primary"
                    variant="flat"
                    size="large"
                    rounded="pill"
                    class="create"
                    prepend-icon="mdi-plus"
                    append-icon="mdi-creation-outline"
                >
                    新增綜合分析
                </v-btn>
            </div>

            <v-card
                v-for="item in reports"
                :key="item.id"
                variant="outlined"
                class="mb-3"
            >
                <v-card-text>
                    <div class="d-flex flex-wrap align-center ga-2 mb-2">
                        <span class="text-caption text-medium-emphasis">{{ new Date(item.createdAt).toLocaleString('zh-TW') }}</span>
                        <v-spacer />
                        <template v-if="item.status === 'GENERATING'">
                            <FacetLoader
                                :size="28"
                                label="報告生成中"
                            />
                            <span
                                class="text-body-2"
                                role="status"
                            >生成中，通常不到一分鐘…</span>
                        </template>
                        <template v-else-if="item.status === 'FAILED'">
                            <span class="text-body-2 text-warning mr-2">這次沒有成功，已退 {{ item.cost }} 點</span>
                            <v-btn
                                :to="retryTo(item)"
                                size="small"
                                variant="tonal"
                                prepend-icon="mdi-refresh"
                            >
                                再問一次
                            </v-btn>
                        </template>
                        <v-btn
                            :to="`/ai-reports/${item.id}`"
                            size="small"
                            color="primary"
                            variant="flat"
                            append-icon="mdi-arrow-right"
                        >
                            查看報告
                        </v-btn>
                    </div>

                    <div class="d-flex flex-wrap ga-2 mb-2">
                        <v-chip
                            v-for="source in item.sources"
                            :key="source.snapshotId"
                            size="small"
                            variant="tonal"
                            :prepend-icon="metaOf(source.system)?.icon"
                            :style="{ color: metaOf(source.system)?.tone }"
                        >
                            <span class="chip__text">{{ source.position }}</span>
                        </v-chip>
                    </div>

                    <p class="text-body-2 mb-0">
                        {{ item.question ? `你的提問：${item.question}` : '未提問，依報告分析' }}
                    </p>
                </v-card-text>
            </v-card>
        </template>
    </section>
</template>

<script lang="ts" setup>
import {
    aiReportSummarySchema, type AiReportSummary,
} from '../../shared/schemas/api/aiReport.schema';
import {
    DIMENSION_META, assessmentDimensions,
} from '../utils/reportDimensions';

const POLL_MS = 3000;

const { get } = useApi();
const { refresh: refreshPoints } = usePoints();

const reports = ref<AiReportSummary[]>([]);
const loading = ref(true);
const failed = ref(false);

const dimensions = [...DIMENSION_META, ...assessmentDimensions()];
const metaOf = (system: string) => dimensions.find((meta) => meta.value === system);

const running = () => reports.value.some((item) => item.status === 'GENERATING');

/** `silent` reads again without swapping the list for a loading state (while a report is being made) */
async function load(silent = false) {
    if (!silent) loading.value = true;

    try {
        reports.value = aiReportSummarySchema.array().parse(await get<unknown>('/api/ai-reports'));
        failed.value = false;
    } catch (error) {
        console.error('[ai-reports] failed to load:', error);

        if (!silent) failed.value = true;
    } finally {
        loading.value = false;
    }
}

// While a report is being made, look again until none is (a failure gives the points back)
let timer: ReturnType<typeof setInterval> | null = null;

watch(() => running(), (isRunning) => {
    if (timer) clearInterval(timer);

    timer = isRunning ? setInterval(() => void load(true).then(refreshPoints), POLL_MS) : null;
});

onMounted(load);

onBeforeUnmount(() => {
    if (timer) clearInterval(timer);
});
</script>

<style scoped>
.create {
    padding-inline: 24px;
    font-weight: 700;
    letter-spacing: 0.08em;
    box-shadow: 0 4px 14px rgba(var(--v-theme-primary), 0.35);
    transition: transform 0.15s, box-shadow 0.15s;
}

.create:hover {
    transform: translateY(-1px);
    box-shadow: 0 6px 18px rgba(var(--v-theme-primary), 0.45);
}

.chip__text {
    color: rgb(var(--v-theme-on-surface));
}
</style>
