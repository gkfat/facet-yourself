<template>
    <div class="report-page">
        <ReportBanner
            title="大五人格"
            headline="你的五個特質"
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
                    還沒有大五人格的結果。回答 50 題，看你在開放性、盡責性、外向性、親和性與情緒敏感性上的傾向。
                </p>
                <v-btn
                    color="primary"
                    to="/big-five"
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

            <!-- How to read the scores, before the scores -->
            <v-card
                variant="outlined"
                class="mb-4"
            >
                <v-card-title>怎麼看這份結果</v-card-title>
                <v-card-text>
                    <p class="text-body-2 mb-2">
                        每個特質的分數是 0 到 100，代表你自己的回答偏向這個特質高端的程度：偏低（低於 40）、居中（40 到 60）、偏高（高於 60）。
                    </p>
                    <p class="text-body-2 mb-0">
                        分數只描述你在這個量表上的自我回答，不與他人比較，也不是診斷。特質沒有好壞，只是不同的傾向。
                    </p>
                </v-card-text>
            </v-card>

            <!-- 01: the five traits together, in a line each and as bars -->
            <v-card
                variant="outlined"
                class="mb-4"
            >
                <v-card-text>
                    <v-chip
                        size="small"
                        class="mb-2"
                    >
                        01｜整體人格輪廓
                    </v-chip>
                    <h2 class="text-h6 mb-2">
                        五大維度總覽
                    </h2>
                    <blockquote
                        v-if="overview"
                        class="lead mb-4"
                    >
                        <p class="lead__text">
                            {{ overview }}
                        </p>
                    </blockquote>
                    <div
                        v-for="trait in result.traits"
                        :key="trait.trait"
                        class="mb-3"
                    >
                        <div class="d-flex align-center ga-2 mb-1">
                            <span class="text-subtitle-2 font-weight-bold">{{ trait.name }}</span>
                            <v-chip
                                size="x-small"
                                :color="LEVEL_COLORS[trait.level]"
                                variant="tonal"
                            >
                                {{ LEVEL_LABELS[trait.level] }}
                            </v-chip>
                            <v-spacer />
                            <span class="text-subtitle-2">{{ trait.score }}</span>
                        </div>
                        <v-progress-linear
                            :model-value="trait.score"
                            :color="LEVEL_COLORS[trait.level]"
                            height="10"
                            rounded
                        />
                        <div class="d-flex justify-space-between text-caption text-medium-emphasis mt-1">
                            <span>低：{{ BIG_FIVE_TRAIT_INFO[trait.trait].low }}</span>
                            <span class="text-right">高：{{ BIG_FIVE_TRAIT_INFO[trait.trait].high }}</span>
                        </div>
                    </div>
                </v-card-text>
            </v-card>

            <!-- 02: each of the five traits -->
            <v-card
                variant="outlined"
                class="mb-4"
            >
                <v-card-text>
                    <v-chip
                        size="small"
                        class="mb-2"
                    >
                        02｜各維度分析
                    </v-chip>
                    <h2 class="text-h6 mb-3">
                        五個人格維度逐項解讀
                    </h2>
                    <v-row dense>
                        <v-col
                            v-for="trait in result.traits"
                            :key="trait.trait"
                            cols="12"
                            md="6"
                        >
                            <v-card
                                variant="outlined"
                                height="100%"
                            >
                                <v-card-text>
                                    <div class="d-flex align-center ga-2 mb-1">
                                        <span class="text-subtitle-1 font-weight-bold">{{ trait.name }}</span>
                                        <v-chip
                                            size="x-small"
                                            :color="LEVEL_COLORS[trait.level]"
                                            variant="tonal"
                                        >
                                            {{ LEVEL_LABELS[trait.level] }}・{{ trait.score }}
                                        </v-chip>
                                    </div>
                                    <div class="text-body-2 font-weight-medium mb-1">
                                        {{ trait.content.title }}
                                    </div>
                                    <p class="text-body-2 mb-3">
                                        {{ trait.content.summary }}
                                    </p>

                                    <div
                                        v-if="trait.content.strengths.length"
                                        class="mt-3"
                                    >
                                        <div class="text-caption font-weight-bold text-medium-emphasis">
                                            可能的優勢
                                        </div>
                                        <ul class="pl-5 text-body-2">
                                            <li
                                                v-for="item in trait.content.strengths"
                                                :key="item"
                                            >
                                                {{ item }}
                                            </li>
                                        </ul>
                                    </div>
                                    <div
                                        v-if="trait.content.blindSpots.length"
                                        class="mt-3"
                                    >
                                        <div class="text-caption font-weight-bold text-medium-emphasis">
                                            可能的盲點
                                        </div>
                                        <ul class="pl-5 text-body-2">
                                            <li
                                                v-for="item in trait.content.blindSpots"
                                                :key="item"
                                            >
                                                {{ item }}
                                            </li>
                                        </ul>
                                    </div>
                                    <div
                                        v-if="trait.content.dailyBehavior"
                                        class="mt-3"
                                    >
                                        <div class="text-caption font-weight-bold text-medium-emphasis">
                                            日常行為表現
                                        </div>
                                        <p class="text-body-2 mb-0">
                                            {{ trait.content.dailyBehavior }}
                                        </p>
                                    </div>
                                </v-card-text>
                            </v-card>
                        </v-col>
                    </v-row>
                </v-card-text>
            </v-card>

            <!-- 03: what pairs of traits say together -->
            <v-card
                variant="outlined"
                class="mb-4"
            >
                <v-card-text>
                    <v-chip
                        size="small"
                        class="mb-2"
                    >
                        03｜人格組合
                    </v-chip>
                    <h2 class="text-h6 mb-2">
                        跨維度交互分析
                    </h2>
                    <p class="text-body-2 text-medium-emphasis mb-3">
                        兩個特質放在一起看，比單獨看更貼近你。這只是傾向的描述，不是把你歸成固定的類型。
                    </p>
                    <v-row
                        v-if="result.combinations.length"
                        dense
                    >
                        <v-col
                            v-for="item in result.combinations"
                            :key="item.content.key"
                            cols="12"
                            md="6"
                        >
                            <v-card
                                variant="outlined"
                                height="100%"
                            >
                                <v-card-text>
                                    <div class="text-subtitle-1 font-weight-bold mb-1">
                                        {{ item.content.title }}
                                    </div>
                                    <p class="text-body-2 mb-0">
                                        {{ item.content.summary }}
                                    </p>
                                </v-card-text>
                            </v-card>
                        </v-col>
                    </v-row>
                    <p
                        v-else
                        class="text-body-2 mb-0"
                    >
                        你的特質多落在居中，沒有特別突出的組合；這代表你在不同情境下比較有彈性。
                    </p>
                </v-card-text>
            </v-card>

            <!-- 04: the five traits together in five areas of life -->
            <v-card
                variant="outlined"
                class="mb-4"
            >
                <v-card-text>
                    <v-chip
                        size="small"
                        class="mb-2"
                    >
                        04｜生活情境
                    </v-chip>
                    <h2 class="text-h6 mb-3">
                        不同情境中的可能表現
                    </h2>
                    <v-row dense>
                        <v-col
                            v-for="area in lifeAreas"
                            :key="area.key"
                            cols="12"
                            md="6"
                        >
                            <v-card
                                variant="outlined"
                                height="100%"
                            >
                                <v-card-text>
                                    <div class="text-subtitle-1 font-weight-bold mb-1">
                                        {{ area.label }}
                                    </div>
                                    <p class="text-body-2 mb-0">
                                        {{ area.text }}
                                    </p>
                                </v-card-text>
                            </v-card>
                        </v-col>
                    </v-row>
                </v-card-text>
            </v-card>

            <!-- 05: what to build on, what to notice, how to adjust, what to think over -->
            <v-card
                variant="outlined"
                class="mb-4"
            >
                <v-card-text>
                    <v-chip
                        size="small"
                        class="mb-2"
                    >
                        05｜成長與反思
                    </v-chip>
                    <h2 class="text-h6 mb-3">
                        可執行的自我探索建議
                    </h2>
                    <v-row dense>
                        <v-col
                            v-for="group in growthGroups"
                            :key="group.key"
                            cols="12"
                            md="6"
                        >
                            <v-card
                                variant="outlined"
                                height="100%"
                            >
                                <v-card-text>
                                    <div class="text-subtitle-1 font-weight-bold mb-1">
                                        {{ group.label }}
                                    </div>
                                    <ul class="pl-5 text-body-2">
                                        <li
                                            v-for="item in group.items"
                                            :key="item"
                                        >
                                            {{ item }}
                                        </li>
                                    </ul>
                                </v-card-text>
                            </v-card>
                        </v-col>
                    </v-row>
                </v-card-text>
            </v-card>

            <!-- Held against the MBTI: where the two models agree and where they do not, a clue and not a mistake -->
            <v-card
                variant="outlined"
                class="mb-4"
            >
                <v-card-title>與 MBTI 對照</v-card-title>
                <v-card-text>
                    <template v-if="result.mbti">
                        <p class="text-body-2 text-medium-emphasis mb-3">
                            你的 MBTI 是 {{ result.mbti }}。兩個量表看的面向不完全相同，一致讓你更確定，有差異則是了解自己的線索，不代表哪一個錯了。
                        </p>
                        <v-row dense>
                            <v-col
                                v-for="item in result.comparison"
                                :key="item.pair"
                                cols="12"
                                md="6"
                            >
                                <v-card
                                    variant="outlined"
                                    height="100%"
                                >
                                    <v-card-text>
                                        <div class="d-flex align-center ga-2 mb-1">
                                            <span class="text-subtitle-1 font-weight-bold">{{ PAIR_LABELS[item.pair] }}</span>
                                            <v-chip
                                                size="x-small"
                                                :color="COMPARISON_COLORS[item.result]"
                                                variant="tonal"
                                            >
                                                {{ COMPARISON_LABELS[item.result] }}
                                            </v-chip>
                                        </div>
                                        <p class="text-caption text-medium-emphasis mb-2">
                                            你的 MBTI 在這一組是 {{ item.letter }}
                                        </p>
                                        <template v-if="item.content">
                                            <div class="text-body-2 font-weight-medium mb-1">
                                                {{ item.content.title }}
                                            </div>
                                            <p class="text-body-2 mb-0">
                                                {{ item.content.summary }}
                                            </p>
                                        </template>
                                        <p
                                            v-else
                                            class="text-body-2 mb-0"
                                        >
                                            這個特質落在中間，兩個量表在這一組沒有明顯的一致或差異。
                                        </p>
                                    </v-card-text>
                                </v-card>
                            </v-col>
                        </v-row>
                    </template>
                    <template v-else>
                        <p class="text-body-2 mb-3">
                            還沒有 MBTI 結果。做完 16 型人格測驗，就能把兩個量表放在一起看：哪裡一致，哪裡不同。
                        </p>
                        <v-btn
                            to="/test"
                            variant="tonal"
                            color="primary"
                        >
                            開始 16 型人格測驗
                        </v-btn>
                    </template>
                </v-card-text>
            </v-card>

            <p class="text-caption text-medium-emphasis mb-4">
                {{ disclaimer }}
            </p>

            <div class="d-flex justify-center mb-4">
                <v-btn
                    variant="outlined"
                    prepend-icon="mdi-restart"
                    to="/big-five?retake=1"
                >
                    重新測驗
                </v-btn>
            </div>
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
import { BIG_FIVE_TRAIT_INFO } from '../../../shared/constants/bigFive';
import type { BigFiveResult } from '../../../shared/schemas/api/bigFive.schema';

useHead({ title: '大五人格' });

const { isAuthenticated } = useAuth();
const { load: loadExploration } = useExploration();
const {
    loadLatest, pendingSave, savePending: sendPending,
} = useBigFive();

const LEVEL_LABELS = {
    low: '偏低', mid: '居中', high: '偏高',
} as const;
const LEVEL_COLORS = {
    low: 'info', mid: 'primary', high: 'success',
} as const;
const PAIR_LABELS = {
    ei: '外向性 ↔ E／I',
    sn: '開放性 ↔ S／N',
    tf: '親和性 ↔ T／F',
    jp: '盡責性 ↔ J／P',
} as const;
const COMPARISON_LABELS = {
    match: '一致', differ: '有差異', neutral: '居中',
} as const;
const COMPARISON_COLORS = {
    match: 'success', differ: 'warning', neutral: undefined,
} as const;

const loading = ref(true);
const loadError = ref<string | null>(null);
const result = ref<BigFiveResult | null>(null);
const pending = ref(false);
const saving = ref(false);
const saveError = ref<string | null>(null);

/** The short tendency phrase of a trait: what follows the colon in the title of its content ("好奇、愛想像、喜歡新點子") */
const phraseOf = (title: string) => title.slice(title.indexOf('：') + 1);

/** 01: the five traits in a sentence, each as its own short phrase */
const overview = computed(() => {
    const parts = result.value?.traits.map((trait) => `${trait.name}${LEVEL_LABELS[trait.level]}，${phraseOf(trait.content.title)}`) ?? [];

    return parts.length ? `你的整體輪廓：${parts.join('；')}。` : '';
});

const LIFE_AREAS = [
    { key: 'work', label: '工作與學習' },
    { key: 'relationships', label: '人際關係' },
    { key: 'stress', label: '壓力與情緒' },
    { key: 'decision', label: '決策方式' },
    { key: 'habits', label: '習慣與自我管理' },
] as const;

/** 04: for each area of life, what the five traits say there, one after another */
const lifeAreas = computed(() => LIFE_AREAS.map((area) => ({
    ...area,
    text: (result.value?.traits ?? []).map((trait) => trait.content.lifeContexts?.[area.key] ?? '').filter(Boolean).join(''),
})).filter((area) => area.text));

/** 05: what to build on, what habit to notice, how to adjust and what to think over: one line from each trait */
const growthGroups = computed(() => {
    const traits = result.value?.traits ?? [];

    return [
        {
            key: 'use', label: '可以發揮的優勢', items: traits.map((trait) => trait.content.growthReflection?.useStrength ?? ''),
        },
        {
            key: 'watch', label: '值得留意的慣性', items: traits.map((trait) => trait.content.growthReflection?.watchHabit ?? ''),
        },
        {
            key: 'adjust', label: '改善或調整方向', items: traits.map((trait) => trait.content.growthAdvice),
        },
        {
            key: 'reflect', label: '自我反思問題', items: traits.map((trait) => trait.content.growthReflection?.reflectionQuestion ?? ''),
        },
    ].map((group) => ({
        ...group, items: group.items.filter(Boolean),
    })).filter((group) => group.items.length);
});

const disclaimer = computed(() => result.value?.traits[0]?.content.disclaimer ?? '僅供自我探索，不是診斷。');

async function load() {
    loading.value = true;
    loadError.value = null;

    try {
        result.value = await loadLatest();
        pending.value = pendingSave() !== null;
    } catch (error) {
        console.error('[big-five] failed to load result:', error);
        loadError.value = '無法載入結果，請稍後再試。';
    } finally {
        loading.value = false;
    }
}

/** A guest's answers, now sent for the account that has just signed in */
async function savePending() {
    saving.value = true;
    saveError.value = null;

    try {
        const saved = await sendPending();

        if (saved) result.value = saved;

        pending.value = false;
        await loadExploration();
    } catch (error) {
        console.error('[big-five] save failed:', error);
        saveError.value = '儲存失敗，請稍後再試。';
    } finally {
        saving.value = false;
    }
}

onMounted(load);
</script>

<style scoped>
.lead {
    margin: 0 0 16px;
    padding: 16px 20px;
    border-left: 4px solid rgb(var(--v-theme-primary));
    border-radius: 0 8px 8px 0;
    background: rgba(var(--v-theme-primary), 0.06);
}

.lead__text {
    margin: 0;
    font-size: 1rem;
    line-height: 1.8;
}
</style>
