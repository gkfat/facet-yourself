<template>
    <section
        v-if="entries.length"
        class="today"
        aria-label="今日運勢"
    >
        <header class="today__head">
            <div>
                <span class="today__eyebrow">TODAY · {{ dateLabel }}</span>
                <h2 class="today__title">
                    今日運勢
                </h2>
                <p class="today__lead">
                    {{ member ? '每天花一分鐘，看看今天給你的提醒。' : '每天翻塔羅、算今日 Kin、抽盧恩符文，不用登入就能試試。' }}
                </p>
            </div>
        </header>

        <div
            v-for="section in sections"
            :key="section.value"
            class="today__group"
        >
            <h3 class="today__group-title">
                {{ section.label }}
            </h3>
            <ul class="today__tiles">
                <li
                    v-for="entry in section.entries"
                    :key="entry.label"
                    class="tile"
                    :class="{ 'tile--done': member && entry.done }"
                    :style="{ '--i': entries.indexOf(entry) }"
                >
                    <NuxtLink
                        :to="`/fortune?tab=${entry.group}#${entry.view}`"
                        class="tile__link"
                    >
                        <span class="tile__icon">
                            <v-icon
                                :icon="member && entry.done && entry.counted ? 'mdi-check' : entry.icon"
                                size="22"
                            />
                        </span>
                        <span class="tile__label">{{ entry.label }}</span>
                        <span class="tile__text">{{ member ? entry.text : entry.hint }}</span>
                    </NuxtLink>
                </li>
            </ul>
        </div>

        <footer class="today__foot">
            <v-btn
                v-if="initialized"
                to="/fortune"
                :variant="member && allDone ? 'outlined' : 'flat'"
                class="today__cta"
                append-icon="mdi-arrow-right"
            >
                {{ member && allDone ? '再看一次今天的運勢' : '看今天的運勢' }}
            </v-btn>
        </footer>
    </section>
</template>

<script lang="ts" setup>
import { HEXAGRAM_ENTRY_ENABLED } from '../../../shared/constants/hexagramShape';
import { HOROSCOPE_ENTRY_ENABLED } from '../../../shared/constants/horoscope';
import { KIN_ENTRY_ENABLED } from '../../../shared/constants/mayaKin';
import {
    RUNE_ENTRY_ENABLED, RUNE_ORIENTATION_LABELS,
} from '../../../shared/constants/runes';
import {
    TAROT_ENTRY_ENABLED, TAROT_ORIENTATION_LABELS,
} from '../../../shared/constants/tarot';
import { ZODIAC_LABELS } from '../../../shared/constants/zodiacLabels';
import { kinName } from '../../../shared/utils/mayaKin';
import { castHeadline } from '../../utils/hexagramView';

const {
    isAuthenticated, initialized,
} = useAuth();
const {
    today: tarotToday, load: loadTarot,
} = useDailyTarot();
const {
    today: kinToday, show: showKin,
} = useKinToday();
const {
    today: runeToday, load: loadRune,
} = useDailyRune();
const {
    today: hexagramToday, load: loadHexagram,
} = useDailyHexagram();
const {
    today: horoscopeToday, status: horoscopeStatus, load: loadHoroscope,
} = useDailyHoroscope();

const tarotDrawn = computed(() => (tarotToday.value?.drawn ? tarotToday.value : null));
const kinUnlocked = computed(() => (kinToday.value?.unlocked ? kinToday.value : null));
const runeDrawn = computed(() => (runeToday.value?.drawn ? runeToday.value : null));
/** The latest cast of the day: the page counts the day's hexagram as done once there is one. */
const hexagramLatest = computed(() => (hexagramToday.value?.drawn ? hexagramToday.value.casts[hexagramToday.value.casts.length - 1] ?? null : null));
const horoscopeMoon = computed(() => horoscopeToday.value?.bodies.find((entry) => entry.body === 'MOON') ?? null);

/** One line for each part that is switched on. */
const entries = computed(() => [
    ...(TAROT_ENTRY_ENABLED
        ? [{
            label: '今日塔羅',
            view: 'tarot',
            group: 'divination' as const,
            icon: 'mdi-cards-playing-outline',
            hint: '每天翻一張牌',
            done: Boolean(tarotDrawn.value),
            counted: true,
            text: tarotDrawn.value
                ? `${tarotDrawn.value.card.name}（${TAROT_ORIENTATION_LABELS[tarotDrawn.value.card.orientation]}）`
                : '還沒翻牌，每天可以翻一張',
        }]
        : []),
    ...(KIN_ENTRY_ENABLED
        ? [{
            label: '今日 Kin',
            view: 'kin',
            group: 'calendar' as const,
            icon: 'mdi-calendar-star',
            hint: '看今天的 Kin',
            // Shown as soon as it is looked at, so it is never something still to do
            done: true,
            counted: false,
            text: kinUnlocked.value
                ? `${kinName(kinUnlocked.value.kin)}（Kin ${kinUnlocked.value.kin.kinNumber}）`
                : '看今天的 Kin 與調性',
        }]
        : []),
    ...(RUNE_ENTRY_ENABLED
        ? [{
            label: '盧恩符文',
            view: 'rune',
            group: 'divination' as const,
            icon: 'mdi-alpha-r-circle-outline',
            hint: '每天抽一枚符文',
            done: Boolean(runeDrawn.value),
            counted: true,
            text: runeDrawn.value
                ? `${runeDrawn.value.rune.glyph} ${runeDrawn.value.rune.name}（${RUNE_ORIENTATION_LABELS[runeDrawn.value.rune.orientation]}）`
                : '還沒抽符，每天可以抽一枚',
        }]
        : []),
    ...(HEXAGRAM_ENTRY_ENABLED
        ? [{
            label: '易經卦象',
            view: 'hexagram',
            group: 'divination' as const,
            icon: 'mdi-yin-yang',
            hint: '每天擲一卦',
            done: Boolean(hexagramLatest.value),
            counted: true,
            text: hexagramLatest.value ? castHeadline(hexagramLatest.value) : '還沒起卦，每天第一卦免費',
        }]
        : []),
    // Read, not drawn: it is always there, so it never counts as something still to do
    ...(HOROSCOPE_ENTRY_ENABLED
        ? [{
            label: '星座運勢',
            view: 'horoscope',
            group: 'calendar' as const,
            icon: 'mdi-zodiac-leo',
            hint: '以你的星座看今天',
            done: true,
            counted: false,
            text: horoscopeToday.value && horoscopeMoon.value
                ? `${ZODIAC_LABELS[horoscopeToday.value.sign]}，月亮在你的第 ${horoscopeMoon.value.house} 宮`
                : horoscopeStatus.value === 'needsProfile' ? '先填寫出生日期，就能看你的星座運勢' : '以你的星座看今天',
        }]
        : []),
]);

type FortuneGroup = 'divination' | 'calendar';

/** Same two groups as the tabs of the fortune page. */
const GROUPS: readonly { value: FortuneGroup; label: string }[] = [
    {
        value: 'divination', label: '抽牌卜卦',
    },
    {
        value: 'calendar', label: '星象與曆法',
    },
];

const sections = computed(() => GROUPS
    .map((group) => ({
        ...group, entries: entries.value.filter((entry) => entry.group === group.value),
    }))
    .filter((group) => group.entries.length));

const member = computed(() => initialized.value && isAuthenticated.value);
const counted = computed(() => entries.value.filter((entry) => entry.counted));
const allDone = computed(() => counted.value.every((entry) => entry.done));

/** Today's date as the app counts it (Taipei), for the corner of the card */
const dateLabel = new Intl.DateTimeFormat('zh-TW', {
    timeZone: 'Asia/Taipei', month: 'numeric', day: 'numeric', weekday: 'short',
}).format(new Date());
// Only a member's cards are asked for; a visitor sees the invitation and nothing of today's results.
watch(() => initialized.value && isAuthenticated.value, (member) => {
    if (!member) return;

    if (TAROT_ENTRY_ENABLED) void loadTarot();
    if (KIN_ENTRY_ENABLED) void showKin();
    if (RUNE_ENTRY_ENABLED) void loadRune();
    if (HEXAGRAM_ENTRY_ENABLED) void loadHexagram();
    if (HOROSCOPE_ENTRY_ENABLED) void loadHoroscope();
}, { immediate: true });
</script>

<style scoped>
/* A plain card in the app's blue: quieter than the multi-dimension band after it, but the one that changes every day. */
.today {
    --tint: rgb(var(--v-theme-primary));

    /* The card asks how wide it is, not the screen: two tiles across beside the other card, four on its own */
    container-type: inline-size;
    height: 100%;
    padding: 24px;
    border: 1px solid rgba(var(--v-theme-night), 0.14);
    border-radius: 14px;
    background: rgb(var(--v-theme-surface));
}

.today__head {
    display: flex;
    flex-wrap: wrap;
    align-items: flex-end;
    justify-content: space-between;
    gap: 10px;
}

.today__eyebrow {
    font-size: 0.75rem;
    letter-spacing: 0.16em;
    color: var(--tint);
}

.today__title {
    margin: 4px 0 4px;
    font-size: 1.5rem;
    font-weight: 800;
    letter-spacing: 0.04em;
}

.today__lead {
    margin: 0;
    font-size: 0.875rem;
    line-height: 1.7;
    color: rgba(var(--v-theme-on-surface), 0.7);
}

.today__group {
    margin-top: 18px;
}

.today__group-title {
    font-size: 0.8125rem;
    font-weight: 700;
    letter-spacing: 0.12em;
    color: rgba(var(--v-theme-on-surface), 0.62);
}

.today__tiles {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px;
    padding: 0;
    margin: 8px 0 0;
    list-style: none;
}

@container (min-width: 560px) {
    .today__tiles {
        grid-template-columns: repeat(4, minmax(0, 1fr));
    }
}

.tile {
    border: 1px solid rgba(var(--v-theme-night), 0.08);
    border-radius: 12px;
    background: rgb(var(--v-theme-background));
    animation: tile-in 0.4s ease backwards;
    animation-delay: calc(var(--i) * 70ms);
    transition: border-color 0.15s ease;
}

.tile:hover,
.tile:focus-within {
    border-color: rgba(var(--v-theme-primary), 0.55);
}

.tile__link {
    display: flex;
    flex-direction: column;
    gap: 4px;
    height: 100%;
    padding: 12px;
    border-radius: 12px;
    color: inherit;
    text-decoration: none;
}

.tile--done {
    border-color: rgba(var(--v-theme-primary), 0.55);
    background: rgb(var(--v-theme-surface));
}

.tile__icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 34px;
    height: 34px;
    margin-bottom: 2px;
    border-radius: 50%;
    color: var(--tint);
    background: rgba(var(--v-theme-primary), 0.1);
}

.tile--done .tile__icon {
    color: #fff;
    background: var(--tint);
}

.tile__label {
    font-size: 0.9375rem;
    font-weight: 700;
    letter-spacing: 0.04em;
}

.tile__text {
    font-size: 0.8125rem;
    line-height: 1.5;
    color: rgba(var(--v-theme-on-surface), 0.68);
}

.tile--done .tile__text {
    color: rgb(var(--v-theme-on-surface));
}

.today__foot {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 10px 14px;
    margin-top: 18px;
}

.today__cta {
    font-weight: 700;
    letter-spacing: 0.08em;
}

/* Gold on paper while there is something to turn over; an outline once everything is */
.today__cta.v-btn--variant-flat {
    color: #fff;
    background: var(--tint);
}

.today__cta.v-btn--variant-outlined {
    color: var(--tint);
    border-color: rgba(var(--v-theme-primary), 0.5);
}

.today__note {
    font-size: 0.8125rem;
    color: rgba(var(--v-theme-on-surface), 0.62);
}

@keyframes tile-in {
    from {
        opacity: 0;
        transform: translateY(6px);
    }
}

@media (prefers-reduced-motion: reduce) {
    .tile {
        animation: none;
    }
}
</style>
