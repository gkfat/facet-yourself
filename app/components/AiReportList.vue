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
            <v-card
                v-for="item in reports"
                :key="item.id"
                variant="outlined"
                class="mb-3"
            >
                <v-card-text>
                    <div class="d-flex flex-wrap align-center ga-2 mb-2">
                        <div class="d-flex flex-column">
                            <span class="text-caption text-medium-emphasis">{{ new Date(item.createdAt).toLocaleString('zh-TW') }}</span>
                            <span class="text-caption text-medium-emphasis">{{ expiryLabel(item.expiresAt) }}</span>
                        </div>
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
                            v-if="item.status !== 'GENERATING'"
                            :to="`/ai-reports/${item.id}`"
                            size="small"
                            color="primary"
                            variant="flat"
                            append-icon="mdi-arrow-right"
                        >
                            查看報告
                        </v-btn>
                        <v-btn
                            v-if="item.status !== 'GENERATING'"
                            size="small"
                            color="error"
                            variant="text"
                            prepend-icon="mdi-delete-outline"
                            @click="deleting = item"
                        >
                            刪除
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

        <v-dialog
            :model-value="Boolean(deleting)"
            max-width="420"
            :persistent="removing"
            @update:model-value="deleting = null"
        >
            <v-card>
                <v-card-title class="pt-5 px-6">
                    刪除這份分析？
                </v-card-title>
                <v-card-text class="px-6">
                    刪除後無法復原，已用掉的點數也不會退回。
                    <v-alert
                        v-if="removeError"
                        type="error"
                        variant="tonal"
                        class="mt-3"
                    >
                        {{ removeError }}
                    </v-alert>
                </v-card-text>
                <v-card-actions class="px-6 pb-5">
                    <v-spacer />
                    <v-btn
                        variant="text"
                        :disabled="removing"
                        @click="deleting = null"
                    >
                        取消
                    </v-btn>
                    <v-btn
                        color="error"
                        variant="flat"
                        :loading="removing"
                        @click="remove"
                    >
                        刪除
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </section>
</template>

<script lang="ts" setup>
import {
    aiReportItemSchema, aiReportSummarySchema, type AiReportSummary,
} from '../../shared/schemas/api/aiReport.schema';
import {
    DIMENSION_META, assessmentDimensions,
} from '../utils/reportDimensions';

const POLL_MS = 3000;

const {
    get, del,
} = useApi();
const { refresh: refreshPoints } = usePoints();

const reports = ref<AiReportSummary[]>([]);
const loading = ref(true);
const failed = ref(false);

const deleting = ref<AiReportSummary | null>(null);
const removing = ref(false);
const removeError = ref<string | null>(null);

watch(deleting, () => {
    removeError.value = null;
});

const expiryLabel = (expiresAt: number) => `${new Date(expiresAt).toLocaleDateString('zh-TW')} 到期`;

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

async function remove() {
    const target = deleting.value;

    if (!target) return;

    removing.value = true;
    removeError.value = null;

    try {
        await del<unknown>(`/api/ai-reports/${target.id}`);
        reports.value = reports.value.filter((item) => item.id !== target.id);
        deleting.value = null;
    } catch (error) {
        console.error('[ai-reports] failed to delete:', error);
        removeError.value = '暫時無法刪除，請稍後再試。';
    } finally {
        removing.value = false;
    }
}

/** Looks at the reports being made one by one (a document each), and reads the whole list again only once one of them is no longer being made */
async function checkRunning() {
    const ids = reports.value.filter((item) => item.status === 'GENERATING').map((item) => item.id);

    try {
        const items = await Promise.all(ids.map(async (id) => aiReportItemSchema.parse(await get<unknown>(`/api/ai-reports/${id}`))));

        if (items.every((item) => item.status === 'GENERATING')) return;
    } catch (error) {
        // One that is gone or cannot be read: the list says what is left
        console.error('[ai-reports] failed to check the reports being made:', error);
    }

    await load(true);
    await refreshPoints();
}

// While a report is being made, look again until none is (a failure gives the points back)
let timer: ReturnType<typeof setInterval> | null = null;

watch(() => running(), (isRunning) => {
    if (timer) clearInterval(timer);

    timer = isRunning ? setInterval(() => void checkRunning(), POLL_MS) : null;
});

onMounted(load);

onBeforeUnmount(() => {
    if (timer) clearInterval(timer);
});
</script>

<style scoped>
.chip__text {
    color: rgb(var(--v-theme-on-surface));
}
</style>
