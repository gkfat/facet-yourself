<template>
    <div class="home">
        <section class="hero">
            <div
                class="hero__bg"
                aria-hidden="true"
            />
            <p class="hero__tags">
                自我探索 · 自我覺察 · 更了解自己
            </p>
            <h1 class="hero__title font-display">
                各種面向綜觀自我，更進一步了解自己
            </h1>
            <p class="hero__lead">
                從你好奇的角度開始，一個一個拼出更完整的自己。
            </p>
        </section>

        <!-- One thing to a row: the birth date first (the way in), what it shows at once, what changes every day, the deeper reading, then every single report -->
        <div class="stack">
            <!-- One place to start: the birth date, what more it can unlock, and what signing in adds -->
            <v-card
                id="fill"
                class="start"
                variant="outlined"
            >
                <v-card-text>
                    <h2 class="start__title">
                        從你的生日開始
                    </h2>
                    <p class="start__lead">
                        填上出生日期，馬上看到你的星座與生命靈數。
                    </p>
                    <ProfileBirthDateSelect v-model="birthDateInput" />

                    <v-expansion-panels
                        variant="accordion"
                        class="extra mt-3"
                    >
                        <v-expansion-panel elevation="0">
                            <v-expansion-panel-title>
                                補充更多資料，解鎖人類圖、八字與血型分析
                                <span class="extra__optional">選填</span>
                            </v-expansion-panel-title>
                            <v-expansion-panel-text>
                                <v-row>
                                    <v-col
                                        cols="12"
                                        sm="6"
                                    >
                                        <v-select
                                            v-model="bloodTypeInput"
                                            :items="bloodTypeItems"
                                            label="血型"
                                            hide-details
                                        />
                                    </v-col>
                                    <v-col
                                        cols="12"
                                        sm="6"
                                    >
                                        <v-select
                                            v-model="genderInput"
                                            :items="genderItems"
                                            label="性別（選填）"
                                            hint="只用來決定八字大運的排法"
                                            persistent-hint
                                        />
                                    </v-col>
                                </v-row>

                                <p class="text-body-2 text-medium-emphasis mt-5 mb-3">
                                    再填出生時間與出生城市，可以計算人類圖，星座分析也會多一層進階內容。
                                </p>
                                <v-row>
                                    <v-col
                                        cols="12"
                                        md="7"
                                    >
                                        <ProfileBirthTimeSelect
                                            v-model="birthTimeInput"
                                            label="時段"
                                        />
                                    </v-col>
                                    <v-col
                                        cols="12"
                                        md="5"
                                    >
                                        <ProfileCitySelect
                                            v-model="birthPlaceInput"
                                            label="出生城市"
                                            hint="輸入中文或英文即可搜尋"
                                        />
                                    </v-col>
                                </v-row>
                            </v-expansion-panel-text>
                        </v-expansion-panel>
                    </v-expansion-panels>

                    <!-- Signing in is the same form's next step, not a second thing on the page -->
                    <div
                        v-if="initialized && !isAuthenticated"
                        class="start__login"
                    >
                        <span
                            class="coin"
                            aria-hidden="true"
                        >{{ WELCOME_POINTS }}</span>
                        <p class="start__login-text">
                            登入後保存你的資料與結果，首次登入贈 {{ WELCOME_POINTS }} 點{{ welcomeReachNote }}
                        </p>
                        <v-btn
                            to="/login"
                            color="primary"
                            size="small"
                            append-icon="mdi-arrow-right"
                        >
                            立即登入
                        </v-btn>
                    </div>
                    <p
                        v-else-if="savedNote"
                        class="text-caption text-medium-emphasis mt-3 mb-0"
                    >
                        {{ savedNote }}
                    </p>
                </v-card-text>
            </v-card>

            <!-- A first result, as soon as there is a date -->
            <HomePreview :birth-date="birthDateInput" />

            <FortuneHomeEntry />
            <HomeMultiFeature :unlocked="progress.multiDimensionUnlocked" />

            <v-card variant="outlined">
                <v-card-title>從不同的角度，認識自己</v-card-title>
                <v-card-subtitle class="text-wrap">
                    一個人很難用單一說法說完。從你好奇的那個開始，每一個都照見你的一部分。
                </v-card-subtitle>
                <v-card-text>
                    <HomeAnalysisList :groups="groups" />
                </v-card-text>
            </v-card>
        </div>
    </div>
</template>

<script lang="ts" setup>
import {
    BAZI_ENTRY_ENABLED,
} from '../../shared/constants/bazi';
import { assessmentCards } from '../utils/assessmentCards';
import {
    SYSTEMS, type Analysis,
} from '../utils/homeAnalyses';
import { KIN_ENTRY_ENABLED } from '../../shared/constants/mayaKin';
import { TONES } from '../../shared/constants/palette';
import { WELCOME_POINTS } from '../../shared/constants/points';
import {
    BLOOD_TYPE_LABELS, GENDER_LABELS, ZODIAC_LABELS,
} from '../../shared/constants/zodiacLabels';
import {
    BLOOD_TYPES, GENDERS,
} from '../../shared/schemas/common';
import type { Zodiac } from '../../shared/schemas/common';
import { HUMAN_DESIGN_TYPE_LABELS } from '../../shared/constants/humanDesignLabels';
import type { HumanDesignResponse } from '../../shared/schemas/api/humanDesign.schema';
import { kinName, kinOf } from '../../shared/utils/mayaKin';
import { lifePathNumber } from '../../shared/utils/numerology';
import {
    POINTS_YARDSTICK, yardstickReach,
} from '../../shared/utils/multiDimensionPricing';
import { zodiacFromIsoDate } from '../../shared/utils/zodiac';

useHead({ title: '多維度自我分析' });

const { isAuthenticated, initialized } = useAuth();
const { get } = useApi();
const {
    state, progress,
} = useExploration();

// What the visitor has entered: the member's saved profile when signed in, otherwise the guest session's.
// Saved a moment after they stop typing, once there is a full date.
const {
    birthDate: birthDateInput,
    bloodType: bloodTypeInput,
    gender: genderInput,
    birthTime: birthTimeInput,
    birthPlace: birthPlaceInput,
    savedNote,
} = useProfile();

const bloodTypeItems = BLOOD_TYPES.map((value) => ({
    title: BLOOD_TYPE_LABELS[value], value,
}));

const genderItems = [
    {
        title: '不提供', value: null,
    },
    ...GENDERS.map((value) => ({
        title: GENDER_LABELS[value], value,
    })),
];

const zodiacSign = computed<Zodiac | null>(() => (birthDateInput.value ? zodiacFromIsoDate(birthDateInput.value) : null));
/** An unknown blood type has nothing to analyse (RULE-002). */
const analysableBloodType = computed(() => (bloodTypeInput.value && bloodTypeInput.value !== 'UNKNOWN' ? bloodTypeInput.value : null));

/** Unlocked once the birth date, time and city are all there: what a birth chart needs. */
const advancedUnlocked = computed(() => Boolean(zodiacSign.value && birthTimeInput.value && birthPlaceInput.value));

/** What the welcome points are worth, in reports of the size the pricing page measures by */
const welcomeReach = yardstickReach(WELCOME_POINTS);
const welcomeReachNote = welcomeReach > 0 ? `，約可做 ${welcomeReach} 份 ${POINTS_YARDSTICK.length} 維度分析` : '';

/** The human design type a member's saved chart has, for the button; guests only know that a chart exists */
const humanDesignType = ref<string | null>(null);

watch(() => [state.value.hasHumanDesign, isAuthenticated.value], async ([has, signedIn]) => {
    humanDesignType.value = null;

    if (!has || !signedIn) return;

    try {
        const chart = await get<HumanDesignResponse>('/api/human-design');

        humanDesignType.value = HUMAN_DESIGN_TYPE_LABELS[chart.type];
    } catch (error) {
        console.error('[home] human design type failed:', error);
    }
}, { immediate: true });

const baziBadge = useBaziBadge(birthDateInput);

// Every analysis the app offers; the ones whose data is missing stay disabled.
const analyses = computed<Analysis[]>(() => {
    const baziReady = Boolean(zodiacSign.value && birthTimeInput.value);
    const baziDayMaster = baziReady ? baziBadge.value : '';
    const sign = zodiacSign.value;
    const bloodType = analysableBloodType.value;
    const mbti = state.value.mbti;

    return [
        {
            key: 'zodiac',
            system: 'symbolic',
            title: '星座分析',
            icon: 'mdi-star-four-points-outline',
            tone: TONES.violet,
            description: '從出生時太陽所在的位置，看你天生的性格傾向與行事風格。',
            need: '需要：出生日期',
            action: sign ? `看星座分析（${ZODIAC_LABELS[sign]}）` : '看星座分析',
            lockedHint: '先填寫出生日期',
            ready: sign !== null,
            to: sign ? '/full-report/zodiac' : undefined,
        },
        {
            key: 'blood',
            system: 'symbolic',
            title: '血型分析',
            icon: 'mdi-water-outline',
            tone: TONES.rose,
            description: '用常見的血型性格說法，看你與人相處和面對事情的習慣。',
            need: '需要：血型',
            action: bloodType ? `看血型分析（${BLOOD_TYPE_LABELS[bloodType]}）` : '看血型分析',
            lockedHint: '先選擇血型',
            ready: bloodType !== null,
            to: bloodType ? '/full-report/blood' : undefined,
        },
        ...(BAZI_ENTRY_ENABLED
            ? [{
                key: 'bazi',
                system: 'symbolic' as const,
                title: '八字命盤',
                icon: 'mdi-yin-yang',
                tone: TONES.copper,
                description: '由出生的年、月、日、時排出四柱，看五行的分布、日主的強弱與每十年的節奏。',
                need: '需要：出生日期與時間',
                action: baziReady ? `看八字命盤（${baziDayMaster}）` : '看八字命盤',
                lockedHint: '先填寫出生日期與時間',
                ready: baziReady,
                to: '/full-report/bazi',
            }]
            : []),
        ...(KIN_ENTRY_ENABLED
            ? [{
                key: 'mayaKin',
                system: 'symbolic' as const,
                title: '瑪雅 Kin',
                icon: 'mdi-calendar-star',
                tone: TONES.plum,
                description: '依出生日期以 Dreamspell 曆法算出你的圖騰與調性，看你的本質與象徵。',
                need: '需要：出生日期',
                action: birthDateInput.value && sign ? `看瑪雅 Kin（${kinName(kinOf(birthDateInput.value))}）` : '看瑪雅 Kin',
                lockedHint: '先填寫出生日期',
                ready: sign !== null,
                to: '/full-report/maya-kin',
            }]
            : []),
        {
            key: 'numerology',
            system: 'symbolic',
            title: '生命靈數',
            icon: 'mdi-numeric',
            tone: TONES.steel,
            description: '把出生日期化成數字，看你的天賦傾向與今年的節奏。',
            need: '需要：出生日期',
            action: birthDateInput.value && sign ? `看生命靈數（數字 ${lifePathNumber(birthDateInput.value)}）` : '看生命靈數',
            lockedHint: '先填寫出生日期',
            ready: sign !== null,
            to: '/full-report/numerology',
        },
        {
            key: 'mbti',
            system: 'personality',
            title: 'MBTI 人格分析',
            icon: 'mdi-head-cog-outline',
            tone: TONES.indigo,
            description: '從回答問題的方式，看你如何獲取能量、接收資訊與做決定。',
            need: mbti ? '需要：16 型人格測驗（已完成）' : '需要：回答 48 題，約 10 分鐘',
            action: mbti ? `看 MBTI 分析（${mbti}）` : '開始測驗',
            lockedHint: '開始測驗',
            // The test is the way in, so it is always open
            ready: true,
            to: mbti ? '/full-report/mbti' : '/test',
        },
        ...assessmentCards().map((card) => {
            const done = state.value.assessmentDone[card.id] === true;

            return {
                key: card.id,
                system: card.system,
                title: card.title,
                icon: card.icon,
                tone: card.tone,
                description: card.description,
                need: done ? `需要：${card.title}測驗（已完成）` : '需要：回答題目，約 10 分鐘',
                action: done ? `看${card.title}結果` : '開始測驗',
                lockedHint: '開始測驗',
                // The test is the way in, so it is always open
                ready: true,
                to: done ? card.resultTo : card.takeTo,
            };
        }),
        {
            key: 'humanDesign',
            system: 'personality',
            title: '人類圖分析',
            icon: 'mdi-vector-triangle',
            tone: TONES.teal,
            description: '依出生當下的星體位置，看你的能量怎麼運作、怎樣做決定最順。',
            need: '需要：出生日期、時間與城市',
            action: state.value.hasHumanDesign ? `看人類圖分析（${humanDesignType.value ?? '已計算'}）` : '看人類圖分析',
            lockedHint: '先填寫出生時間與城市',
            ready: advancedUnlocked.value,
            to: '/full-report/human-design',
        },
    ];
});

// Each analysis appears once, under the kind it belongs to
const groups = computed(() => SYSTEMS
    .map((system) => ({
        ...system,
        items: analyses.value.filter((analysis) => analysis.system === system.key),
    }))
    .filter((group) => group.items.length > 0));
</script>

<style scoped>
.extra__optional {
    flex: 0 0 auto;
    margin-inline-start: auto;
    padding-inline-start: 8px;
    white-space: nowrap;
}

/* Everything inside the page stays in the container; only the background runs edge to edge. */
.home {
    position: relative;
    isolation: isolate;
}

.hero {
    position: relative;
    margin-bottom: 24px;
    padding: 28px 0 0;
}

/*
 * Full-width night sky: from under the app bar down past the hero text, ending partway into the
 * birth-date card so the card sits on its lower edge.
 */
.hero__bg {
    position: absolute;
    top: -16px;
    bottom: -100px;
    left: 50%;
    z-index: -1;
    width: 100vw;
    transform: translateX(-50%);
    overflow: hidden;
    background-color: rgb(var(--v-theme-night));
    background-image: var(--stars);
}

/* Film grain over the sky */
.hero__bg::after {
    content: '';
    position: absolute;
    inset: 0;
    background-image: var(--grain-dark);
    opacity: 0.06;
}

.hero__tags {
    margin: 0 0 8px;
    font-size: 0.8125rem;
    font-weight: 500;
    letter-spacing: 0.12em;
    color: rgba(174, 187, 233, 0.8);
}

.hero__title {
    margin: 0 0 14px;
    font-size: clamp(1.75rem, 4.2vw, 2.5rem);
    line-height: 1.35;
    letter-spacing: 0.02em;
    color: #f4f6fc;
    text-wrap: balance;
}

.hero__lead {
    max-width: 28em;
    margin: 0;
    font-size: 1.0625rem;
    line-height: 1.8;
    color: rgba(244, 246, 252, 0.78);
}

/* The one card on the backdrop: the date, what more it can unlock, and signing in */
.start {
    scroll-margin-top: 80px;
    border-color: rgba(var(--v-theme-night), 0.14);
    box-shadow: 0 10px 28px rgba(var(--v-theme-night), 0.18);
}

.start__title {
    margin: 0;
    font-size: 1.125rem;
    font-weight: 700;
    letter-spacing: 0.04em;
}

.start__lead {
    margin: 4px 0 14px;
    font-size: 0.875rem;
    color: rgba(var(--v-theme-on-surface), 0.65);
}

.start__login {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 10px 12px;
    margin-top: 16px;
    padding-top: 16px;
    border-top: 1px dashed rgba(var(--v-theme-night), 0.24);
}

.start__login-text {
    flex: 1 1 14em;
    margin: 0;
    font-size: 0.875rem;
    line-height: 1.6;
    color: rgba(var(--v-theme-on-surface), 0.78);
}

.coin {
    display: inline-flex;
    flex: none;
    align-items: center;
    justify-content: center;
    width: 30px;
    height: 30px;
    border-radius: 50%;
    background: rgb(var(--v-theme-accent));
    font-size: 0.8125rem;
    font-weight: 700;
    color: #fff;
}

/* One thing to a row, each as wide as the page */
.stack {
    display: flex;
    flex-direction: column;
    gap: 24px;
    margin-bottom: 24px;
}
</style>
