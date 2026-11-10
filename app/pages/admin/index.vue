<template>
    <div>
        <h1 class="admin-title">
            儀表板
        </h1>

        <v-row>
            <v-col
                cols="12"
                sm="6"
                md="4"
            >
                <v-card variant="outlined" class="h-100">
                    <v-card-text>
                        <div class="metric-label">
                            總會員數
                        </div>
                        <v-progress-linear
                            v-if="members.loading.value"
                            indeterminate
                        />
                        <div
                            v-else-if="members.data.value"
                            class="metric-value"
                        >
                            {{ members.data.value.total.toLocaleString('zh-TW') }}
                        </div>
                        <AdminErrorLine :message="members.error.value" />
                    </v-card-text>
                </v-card>
            </v-col>
            <v-col
                cols="12"
                sm="6"
                md="4"
            >
                <v-card variant="outlined" class="h-100">
                    <v-card-text>
                        <div class="metric-label">
                            本月新會員
                        </div>
                        <v-progress-linear
                            v-if="members.loading.value"
                            indeterminate
                        />
                        <div
                            v-else-if="members.data.value"
                            class="metric-value"
                        >
                            {{ members.data.value.thisMonth.toLocaleString('zh-TW') }}
                        </div>
                        <div class="metric-note">
                            以台北時間的月份計算
                        </div>
                    </v-card-text>
                </v-card>
            </v-col>
            <v-col
                cols="12"
                md="4"
            >
                <v-card variant="outlined" class="h-100">
                    <v-card-text>
                        <div class="metric-label">
                            本月 OpenAI 預估成本
                        </div>
                        <v-progress-linear
                            v-if="aiCost.loading.value"
                            indeterminate
                        />
                        <div
                            v-else-if="aiCost.data.value"
                            class="metric-value"
                        >
                            {{ usd(aiCost.data.value.month.cost) }}
                        </div>
                        <div
                            v-if="aiCost.data.value"
                            class="metric-sub"
                        >
                            約 {{ twd(aiCost.data.value.month.cost) }}
                        </div>
                        <div
                            v-if="aiCost.data.value"
                            class="metric-note"
                        >
                            輸入 {{ aiCost.data.value.month.inputTokens.toLocaleString('zh-TW') }}
                            ／輸出 {{ aiCost.data.value.month.outputTokens.toLocaleString('zh-TW') }} tokens
                        </div>
                        <AdminErrorLine :message="aiCost.error.value" />
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>

        <v-row>
            <v-col
                cols="12"
                md="6"
            >
                <v-card variant="outlined" class="h-100">
                    <v-card-title class="section-title">
                        每日今日運勢使用數（近 {{ DAYS }} 天）
                    </v-card-title>
                    <v-card-text>
                        <v-progress-linear
                            v-if="draws.loading.value"
                            indeterminate
                        />
                        <AdminTrendChart
                            v-else-if="draws.data.value"
                            :labels="draws.data.value.days.map((day) => shortDate(day.date))"
                            :datasets="[
                                {
                                    label: '塔羅', data: draws.data.value.days.map((day) => day.tarot), color: TONES.indigo,
                                },
                                {
                                    label: '盧恩', data: draws.data.value.days.map((day) => day.rune), color: TONES.copper,
                                },
                                {
                                    label: '卦象', data: draws.data.value.days.map((day) => day.hexagram), color: TONES.teal,
                                },
                            ]"
                            aria-label="每日塔羅、盧恩與卦象使用數"
                        />
                        <AdminErrorLine :message="draws.error.value" />
                        <p class="note">
                            僅含會員，訪客的抽取沒有紀錄；抽取紀錄只保存 3 個月，更早的天數沒有資料。<template v-if="draws.data.value?.earliestDrawAt">
                                目前最早的紀錄是 {{ formatAdminTime(draws.data.value.earliestDrawAt) }}。
                            </template>
                            星座運勢與 Maya Kin 不在統計內。
                        </p>
                    </v-card-text>
                </v-card>
            </v-col>

            <v-col
                cols="12"
                md="6"
            >
                <v-card variant="outlined" class="h-100">
                    <v-card-title class="section-title">
                        每日點數消耗（近 {{ DAYS }} 天）
                    </v-card-title>
                    <v-card-text>
                        <v-progress-linear
                            v-if="points.loading.value"
                            indeterminate
                        />
                        <template v-else-if="points.data.value">
                            <AdminTrendChart
                                :labels="points.data.value.days.map((day) => shortDate(day.date))"
                                :datasets="[
                                    {
                                        label: '扣點', data: points.data.value.days.map((day) => day.deducted), color: TONES.indigo,
                                    },
                                    {
                                        label: '退款', data: points.data.value.days.map((day) => day.refunded), color: TONES.rose,
                                    },
                                ]"
                                aria-label="每日點數扣點與退款"
                            />
                            <p class="note">
                                期間合計：扣 {{ pointsTotal.deducted }} 點、退 {{ pointsTotal.refunded }} 點，淨消耗 {{ pointsTotal.net }} 點（扣點減退款）。
                            </p>
                            <p
                                v-if="points.data.value.deductedByReason.length"
                                class="note"
                            >
                                扣點用途：
                                <span
                                    v-for="entry in points.data.value.deductedByReason"
                                    :key="entry.reason"
                                    class="reason"
                                >{{ REASON_LABELS[entry.reason] }} {{ entry.deducted }}</span>
                            </p>
                        </template>
                        <AdminErrorLine :message="points.error.value" />
                    </v-card-text>
                </v-card>
            </v-col>

            <v-col
                cols="12"
                md="6"
            >
                <v-card variant="outlined" class="h-100">
                    <v-card-title class="section-title">
                        每日 OpenAI 預估成本（美金，近 {{ DAYS }} 天）
                    </v-card-title>
                    <v-card-text>
                        <v-progress-linear
                            v-if="aiCost.loading.value"
                            indeterminate
                        />
                        <AdminTrendChart
                            v-else-if="aiCost.data.value"
                            type="line"
                            decimals
                            :labels="aiCost.data.value.days.map((day) => shortDate(day.date))"
                            :datasets="[{
                                label: '預估成本', data: aiCost.data.value.days.map((day) => day.cost), color: TONES.teal,
                            }]"
                            aria-label="每日 OpenAI 預估成本"
                        />
                        <AdminErrorLine :message="aiCost.error.value" />
                        <p class="note">
                            預估值：以 token 數乘上設定的單價計算，OpenAI 調價或更換 model 後會與帳單有落差。已刪除帳號的用量仍計入。
                        </p>
                        <p
                            v-if="aiCost.data.value"
                            class="note"
                        >
                            近 {{ DAYS }} 天合計 {{ usd(aiCostTotal) }}（約 {{ twd(aiCostTotal) }}）。新台幣以固定匯率 1 美元 = {{ aiCost.data.value.usdToTwdRate }} 元換算，不是即時匯率。
                        </p>
                    </v-card-text>
                </v-card>
            </v-col>

            <v-col
                cols="12"
                md="6"
            >
                <v-card variant="outlined" class="h-100">
                    <v-card-title class="section-title">
                        單維度分析排行
                    </v-card-title>
                    <v-card-text>
                        <v-progress-linear
                            v-if="analyses.loading.value"
                            indeterminate
                        />
                        <template v-else-if="analyses.data.value">
                            <p
                                v-if="analyses.data.value.items.length === 0"
                                class="text-medium-emphasis"
                            >
                                目前沒有分析紀錄
                            </p>
                            <div
                                v-for="item in analyses.data.value.items"
                                :key="item.system"
                                class="rank-row"
                            >
                                <span class="rank-name">{{ item.label }}</span>
                                <v-progress-linear
                                    :model-value="rankPercent(item.count)"
                                    height="8"
                                    rounded
                                    color="primary"
                                />
                                <span class="rank-count">{{ item.count }}</span>
                            </div>
                        </template>
                        <AdminErrorLine :message="analyses.error.value" />
                        <p class="note">
                            數字是已產生的分析快照數，不等於操作次數；快照只保存 3 個月，且相同內容會重用同一份。
                        </p>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>

        <v-row>
            <v-col cols="12">
                <v-card
                    variant="outlined"
                    class="h-100"
                >
                    <v-card-title class="section-title">
                        多維度 AI 報告使用狀況（近 {{ DAYS }} 天）
                    </v-card-title>
                    <v-card-text>
                        <v-progress-linear
                            v-if="aiReports.loading.value"
                            indeterminate
                        />
                        <template v-else-if="aiReports.data.value">
                            <v-row>
                                <v-col
                                    v-for="stat in aiReportStats"
                                    :key="stat.label"
                                    cols="6"
                                    sm="4"
                                    md
                                >
                                    <div class="metric-label">
                                        {{ stat.label }}
                                    </div>
                                    <div class="metric-value metric-value--small">
                                        {{ stat.value }}
                                    </div>
                                </v-col>
                            </v-row>

                            <AdminTrendChart
                                :labels="aiReports.data.value.days.map((day) => shortDate(day.date))"
                                :datasets="[
                                    {
                                        label: '成功', data: aiReports.data.value.days.map((day) => day.completed), color: TONES.green,
                                    },
                                    {
                                        label: '失敗', data: aiReports.data.value.days.map((day) => day.failed), color: TONES.rose,
                                    },
                                ]"
                                aria-label="每日 AI 報告成功與失敗次數"
                            />

                            <h3 class="sub-title">
                                每份報告使用的維度數
                            </h3>
                            <p
                                v-if="aiReports.data.value.dimensionCounts.length === 0"
                                class="text-medium-emphasis"
                            >
                                期間內沒有 AI 報告
                            </p>
                            <div class="chips">
                                <v-chip
                                    v-for="entry in aiReports.data.value.dimensionCounts"
                                    :key="entry.dimensions"
                                    variant="tonal"
                                    size="small"
                                >
                                    {{ entry.dimensions }} 個維度：{{ entry.count }} 份
                                </v-chip>
                            </div>

                            <h3 class="sub-title">
                                使用者的提問（最新 {{ aiReports.data.value.questions.length }} 筆）
                            </h3>
                            <p
                                v-if="aiReports.data.value.questions.length === 0"
                                class="text-medium-emphasis"
                            >
                                期間內沒有人填寫提問
                            </p>
                            <v-table
                                v-else
                                density="comfortable"
                            >
                                <thead>
                                    <tr>
                                        <th class="text-no-wrap">
                                            時間
                                        </th>
                                        <th>提問</th>
                                        <th>維度</th>
                                        <th class="text-no-wrap">
                                            結果
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr
                                        v-for="entry in aiReports.data.value.questions"
                                        :key="`${entry.createdAt}-${entry.question}`"
                                    >
                                        <td class="text-no-wrap">
                                            {{ formatAdminTime(entry.createdAt) }}
                                        </td>
                                        <td class="question">
                                            {{ entry.question }}
                                        </td>
                                        <td>{{ entry.systems.join('、') }}</td>
                                        <td class="text-no-wrap">
                                            <v-chip
                                                :color="STATUS_COLORS[entry.status]"
                                                size="small"
                                                variant="tonal"
                                            >
                                                {{ STATUS_LABELS[entry.status] }}
                                            </v-chip>
                                        </td>
                                    </tr>
                                </tbody>
                            </v-table>
                            <p class="note">
                                提問是使用者填寫的原文，不顯示是誰問的。報告只保存 3 個月。<template v-if="aiReports.data.value.truncated">
                                    期間內的報告超過 {{ aiReports.data.value.scanned.toLocaleString('zh-TW') }} 筆，只統計最新的這些，較早日期的次數不完整。
                                </template>
                            </p>
                        </template>
                        <AdminErrorLine :message="aiReports.error.value" />
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>
    </div>
</template>

<script lang="ts" setup>
import { TONES } from '../../../shared/constants/palette';
import type {
    AdminAiReports, AdminAnalysisRank, AdminDailyAiCost, AdminDailyDraws, AdminDailyPoints, AdminMembersSummary,
} from '../../../shared/schemas/api/adminDashboard.schema';

definePageMeta({
    layout: 'admin',
    middleware: 'admin',
});

useHead({ title: '後台儀表板' });

const DAYS = 30;

const REASON_LABELS: Record<string, string> = {
    SINGLE_AI_ANALYSIS: '單維度 AI 分析',
    MULTI_REPORT: '綜合報告',
    HEXAGRAM_CAST: '卦象加卦',
    WELCOME: '新手贈點',
    PURCHASE: '購買',
};

const STATUS_LABELS: Record<string, string> = {
    COMPLETED: '成功',
    FAILED: '失敗',
    GENERATING: '進行中',
};

const STATUS_COLORS: Record<string, string> = {
    COMPLETED: 'success',
    FAILED: 'error',
    GENERATING: 'warning',
};

const members = useAdminResource<AdminMembersSummary>('/api/admin/dashboard/members');
const aiReports = useAdminResource<AdminAiReports>('/api/admin/dashboard/ai-reports', { days: DAYS });
const analyses = useAdminResource<AdminAnalysisRank>('/api/admin/dashboard/analyses');
const draws = useAdminResource<AdminDailyDraws>('/api/admin/dashboard/daily-draws', { days: DAYS });
const points = useAdminResource<AdminDailyPoints>('/api/admin/dashboard/points', { days: DAYS });
const aiCost = useAdminResource<AdminDailyAiCost>('/api/admin/dashboard/ai-cost', { days: DAYS });

const usd = (value: number) => `US$${value.toFixed(value < 1 ? 4 : 2)}`;
const twd = (usdValue: number) => `NT$${(usdValue * (aiCost.data.value?.usdToTwdRate ?? 0)).toLocaleString('zh-TW', {
    minimumFractionDigits: 2, maximumFractionDigits: 2,
})}`;
const aiCostTotal = computed(() => (aiCost.data.value?.days ?? []).reduce((sum, day) => sum + day.cost, 0));

const pointsTotal = computed(() => {
    const days = points.data.value?.days ?? [];
    const deducted = days.reduce((sum, day) => sum + day.deducted, 0);
    const refunded = days.reduce((sum, day) => sum + day.refunded, 0);

    return {
        deducted, refunded, net: deducted - refunded,
    };
});

const aiReportStats = computed(() => {
    const data = aiReports.data.value;

    if (!data) return [];

    const finished = data.totals.completed + data.totals.failed;

    return [
        {
            label: '報告總數', value: String(finished + data.totals.generating),
        },
        {
            label: '成功', value: String(data.totals.completed),
        },
        {
            label: '失敗', value: String(data.totals.failed),
        },
        {
            label: '成功率', value: finished === 0 ? '—' : `${Math.round((data.totals.completed / finished) * 100)}%`,
        },
        {
            label: '單份最多維度', value: data.maxDimensions === 0 ? '—' : `${data.maxDimensions} 個`,
        },
    ];
});

const rankTop = computed(() => analyses.data.value?.items[0]?.count ?? 1);
const rankPercent = (count: number) => Math.round((count / rankTop.value) * 100);

onMounted(() => {
    // Each figure loads on its own; a failure shows where it happened and the rest still appear
    void Promise.all([
        members.load(),
        analyses.load(),
        aiReports.load(),
        draws.load(),
        points.load(),
        aiCost.load(),
    ]);
});
</script>

<style scoped>
.admin-title {
    font-size: 1.5rem;
    font-weight: 600;
    margin-bottom: 16px;
}

.metric-label {
    font-size: 0.875rem;
    color: rgba(var(--v-theme-on-surface), var(--v-medium-emphasis-opacity));
}

.metric-value {
    font-size: 2rem;
    font-weight: 600;
    line-height: 1.3;
}

.metric-value--small {
    font-size: 1.5rem;
}

.sub-title {
    font-size: 0.9375rem;
    font-weight: 600;
    margin: 20px 0 8px;
}

.chips {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
}

.question {
    min-width: 12rem;
    overflow-wrap: anywhere;
}

.metric-sub {
    font-size: 1rem;
    color: rgba(var(--v-theme-on-surface), var(--v-medium-emphasis-opacity));
}

.metric-note,
.note {
    font-size: 0.8125rem;
    color: rgba(var(--v-theme-on-surface), var(--v-medium-emphasis-opacity));
}

.note {
    margin-top: 12px;
    line-height: 1.6;
}

.section-title {
    font-size: 1rem;
    font-weight: 600;
    white-space: normal;
}

.reason {
    margin-inline-end: 12px;
}

.rank-row {
    display: grid;
    grid-template-columns: 9rem 1fr 3rem;
    align-items: center;
    gap: 12px;
    margin-bottom: 10px;
}

.rank-count {
    text-align: right;
    font-variant-numeric: tabular-nums;
}
</style>
