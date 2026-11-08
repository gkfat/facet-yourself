<template>
    <div class="report-page">
        <ReportBanner
            title="分析報告"
            :headline="headline"
            :extended="Boolean(report)"
            tone="green"
        />

        <v-card
            v-if="loading"
            variant="outlined"
            class="mb-4"
        >
            <v-card-text>
                <LoadingState />
            </v-card-text>
        </v-card>

        <v-alert
            v-else-if="missing"
            type="info"
            variant="tonal"
            class="mb-4"
        >
            找不到這份報告，可能已超過保存期限（6 個月）。
        </v-alert>

        <v-alert
            v-else-if="failed"
            type="error"
            variant="tonal"
            class="mb-4"
        >
            暫時無法讀取這份報告，請重新整理頁面再試一次。
        </v-alert>

        <template v-else-if="report">
            <v-card
                v-if="report.status === 'GENERATING'"
                variant="outlined"
                class="mb-4"
            >
                <v-card-text class="d-flex align-center ga-4">
                    <FacetLoader
                        :size="64"
                        label="報告生成中"
                    />
                    <p
                        class="text-body-2 mb-0"
                        role="status"
                    >
                        導師正在閱讀你的報告，通常不到一分鐘；下面是你帶來的事實，可以先看。
                    </p>
                </v-card-text>
            </v-card>

            <v-alert
                v-else-if="report.status === 'FAILED'"
                type="warning"
                variant="tonal"
                class="mb-4"
            >
                這次分析沒有成功，已退回 {{ report.cost }} 點。下面是你帶來的事實，仍然可以閱讀。
                <template #append>
                    <v-btn
                        :to="retryTo(report)"
                        size="small"
                        variant="text"
                    >
                        再問一次
                    </v-btn>
                </template>
            </v-alert>

            <AiReportView :report="report" />
        </template>

        <!-- Back to the list of analyses, as the other reports go back to theirs -->
        <v-fab
            app
            extended
            color="primary"
            location="bottom end"
            to="/report?tab=history"
            prepend-icon="mdi-arrow-left"
            text="分析紀錄"
        />
    </div>
</template>

<script lang="ts" setup>
import {
    aiReportItemSchema, type AiReportItem,
} from '../../../shared/schemas/api/aiReport.schema';

useHead({ title: '分析報告' });

const POLL_MS = 3000;

const route = useRoute();
const { get } = useApi();
const { initAuthListener } = useAuth();
const { refresh: refreshPoints } = usePoints();

const report = ref<AiReportItem | null>(null);
const loading = ref(true);
const missing = ref(false);
const failed = ref(false);

const headline = computed(() => {
    const sources = report.value?.sources ?? [];

    if (sources.length === 0) return undefined;

    return sources.length === 1 ? `深入分析：${sources[0]?.position}` : `綜合分析：${sources.length} 個維度`;
});

async function load(silent = false) {
    if (!silent) loading.value = true;

    try {
        report.value = aiReportItemSchema.parse(await get<unknown>(`/api/ai-reports/${String(route.params.id)}`));
    } catch (error) {
        const failure = error as { statusCode?: number };

        if (silent) {
            console.error('[ai-report] refresh failed:', error);

            return;
        }

        if (failure.statusCode === 404) missing.value = true;
        else {
            console.error('[ai-report] failed to load:', error);
            failed.value = true;
        }
    } finally {
        loading.value = false;
    }
}

// While the report is being made, look again until it is done or has failed (a failure gives the points back)
let timer: ReturnType<typeof setInterval> | null = null;

watch(() => report.value?.status, (status) => {
    if (timer) clearInterval(timer);

    timer = status === 'GENERATING' ? setInterval(() => void load(true).then(refreshPoints), POLL_MS) : null;
});

onMounted(() => {
    initAuthListener();
    void load();
});

onBeforeUnmount(() => {
    if (timer) clearInterval(timer);
});
</script>
