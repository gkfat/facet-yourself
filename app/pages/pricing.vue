<template>
    <div class="report-page">
        <ReportBanner
            title="點數方案"
            headline="想看得更深的時候，再用點數"
            tagline="不買也沒關係，免費的內容都在"
            tone="amber"
        />

        <GuestNotice>
            登入即贈 {{ WELCOME_POINTS }} 點，可以直接用在多維度分析，先試試再決定。
        </GuestNotice>

        <!-- What the points are mostly for, said first: the plans below only make sense once this is clear -->
        <section class="mb-6">
            <h2 class="section-title">
                多維度分析是什麼？
            </h2>
            <v-card
                variant="outlined"
                class="mt-2"
            >
                <v-card-text>
                    <p class="mb-4">
                        單一角度只照見你的一部分。多維度分析把你選的幾個維度放在一起，由 AI 比對它們互相呼應、彼此拉扯的地方，寫成一份只屬於你的完整報告。
                    </p>
                    <ol class="steps">
                        <li
                            v-for="(step, index) in STEPS"
                            :key="step.title"
                            class="steps__item"
                        >
                            <span class="steps__no">{{ index + 1 }}</span>
                            <div>
                                <div class="text-subtitle-2">
                                    {{ step.title }}
                                </div>
                                <div class="text-body-2 text-medium-emphasis">
                                    {{ step.text }}
                                </div>
                            </div>
                        </li>
                    </ol>
                    <v-btn
                        to="/report"
                        variant="text"
                        color="primary"
                        append-icon="mdi-arrow-right"
                        class="mt-3 px-0"
                    >
                        看看多維度分析
                    </v-btn>
                </v-card-text>
            </v-card>
        </section>

        <!-- The three plans: each one is written for a different state of mind, not just a bigger number -->
        <section class="mb-6">
            <h2 class="section-title">
                選一個適合你的步調
            </h2>
            <p class="text-body-2 text-medium-emphasis mb-4">
                點數買了不會過期，也不是訂閱。想用的時候再用，不用急著用完。
            </p>

            <v-progress-linear
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
            <v-alert
                v-else-if="!plans.length"
                type="info"
                variant="tonal"
            >
                方案準備中，目前還不能購買。免費的內容都可以照常使用。
            </v-alert>
            <v-row v-else>
                <v-col
                    v-for="plan in plans"
                    :key="plan.packageId"
                    cols="12"
                    md="4"
                    :order="plan.featured ? 'first' : undefined"
                    :order-md="plan.index"
                >
                    <PricingPlanCard
                        :name="plan.name"
                        :tagline="plan.tagline"
                        :points="plan.points"
                        :price="plan.price"
                        :per-point="plan.perPoint"
                        :facts="plan.facts"
                        :audience="plan.audience"
                        :badge="plan.badge"
                        :featured="plan.featured"
                        :to="plan.to"
                        :action="plan.action"
                    />
                </v-col>
            </v-row>

            <p class="text-caption text-medium-emphasis mt-3 mb-0">
                點數為數位內容，購買後立即提供，恕不退款。
            </p>
        </section>
    </div>
</template>

<script lang="ts" setup>
import { WELCOME_POINTS } from '../../shared/constants/points';
import type { PointPackageItem } from '../../shared/schemas/api/payment.schema';
import {
    POINTS_YARDSTICK, yardstickReach,
} from '../../shared/utils/multiDimensionPricing';

useHead({ title: '點數方案' });

const { isAuthenticated } = useAuth();

const packages = ref<PointPackageItem[]>([]);
const loading = ref(true);
const loadError = ref<string | null>(null);

/**
 * What each of the three plans says to its reader. The API gives the plans smallest first; the amounts, the prices
 * and everything derived from them come from it, only the wording is written here.
 *
 * - small: for someone still deciding. Low stakes, one whole experience, no regret.
 * - medium: for someone who wants to compare several dimensions. The one the page points to.
 * - large: for someone who comes back over time, or explores with people around them.
 */
const TIER_COPY = [
    {
        name: '先試一份',
        tagline: '還在觀望也沒關係，先拿一份完整的看看，有幫助再說。',
        audience: '適合第一次來、想先確認有沒有幫助的人',
    },
    {
        name: '一次看清楚',
        tagline: '把幾個角度放在一起，看它們怎麼互相呼應、又在哪裡拉扯。',
        audience: '適合想認真了解自己、願意多比較幾組維度的人',
    },
    {
        name: '長期陪伴',
        tagline: '不趕時間，隨著自己的變化，一次次回來重新看。',
        audience: '適合把自我探索當成習慣，或想和身邊的人一起探索的人',
    },
] as const;

/** How a multi-dimension report comes about, in the order the reader goes through it */
const STEPS = [
    {
        title: '選兩個以上的維度',
        text: '星座、MBTI、人類圖、各項自我分析……從你已經做過、或有興趣的開始。',
    },
    {
        title: '比對呼應與拉扯',
        text: '找出幾個維度共同指向的地方，也看它們彼此不一致的地方。',
    },
    {
        title: '得到專屬的報告',
        text: '由 AI 寫成一份只屬於你的解讀，之後可以回來重看。',
    },
] as const;

const FEATURED_TIER = 1;

const formatAmount = (value: number) => Number(value.toFixed(1)).toString();

const plans = computed(() => {
    const [smallest] = packages.value;
    const hasThreeTiers = packages.value.length === TIER_COPY.length;
    const lowestPerPoint = Math.min(...packages.value.map((item) => item.price.amount / item.points));

    return packages.value.map((item, index) => {
        const copy = hasThreeTiers ? TIER_COPY[index] : undefined;
        const perPoint = item.price.amount / item.points;
        const saving = smallest && index > 0
            ? Math.round((1 - perPoint / (smallest.price.amount / smallest.points)) * 100)
            : 0;
        const reach = yardstickReach(item.points);
        const facts = [
            ...(reach > 0 ? [`約可做 ${reach} 份 ${POINTS_YARDSTICK.length} 維度分析`] : []),
            item.validityDays ? `自購買起 ${item.validityDays} 天內有效` : '點數沒有使用期限',
            ...(saving > 0 ? [`每點比最小的方案省 ${saving}%`] : []),
        ];
        const featured = hasThreeTiers && index === FEATURED_TIER;

        return {
            packageId: item.packageId,
            index,
            name: copy?.name ?? `${item.points} 點`,
            tagline: copy?.tagline ?? '',
            audience: copy?.audience,
            points: item.points,
            price: `${item.price.amount} ${item.price.currency}`,
            perPoint: `${formatAmount(perPoint)} ${item.price.currency}`,
            facts,
            featured,
            badge: featured ? '推薦' : saving > 0 && perPoint === lowestPerPoint ? '每點最划算' : undefined,
            to: isAuthenticated.value ? { path: '/purchase', query: { package: item.packageId } } : '/login',
            action: isAuthenticated.value ? '選這個方案' : '登入後購買',
        };
    });
});

onMounted(async () => {
    try {
        packages.value = await $fetch<PointPackageItem[]>('/api/point-packages');
    } catch (error) {
        console.error('[pricing] failed to load packages:', error);
        loadError.value = '無法載入方案，請稍後再試。';
    } finally {
        loading.value = false;
    }
});
</script>

<style scoped>
.steps {
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: 0;
    margin: 0;
    list-style: none;
}

.steps__item {
    display: flex;
    align-items: flex-start;
    gap: 12px;
}

.steps__no {
    display: inline-flex;
    flex: none;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    margin-top: 1px;
    border-radius: 50%;
    font-size: 0.8125rem;
    font-weight: 700;
    color: rgb(var(--v-theme-primary));
    background: rgba(var(--v-theme-primary), 0.1);
}

.section-title {
    margin-bottom: 4px;
    font-size: 1.125rem;
    font-weight: 700;
    letter-spacing: 0.04em;
}
</style>
