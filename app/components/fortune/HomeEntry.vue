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
            <span
                v-if="member && countedTotal"
                class="today__progress"
            >
                今天已揭曉 <strong>{{ doneCount }}</strong> / {{ countedTotal }}
            </span>
        </header>

        <ul class="today__tiles">
            <li
                v-for="(entry, position) in entries"
                :key="entry.label"
                class="tile"
                :class="{ 'tile--done': member && entry.done }"
                :style="{ '--i': position }"
            >
                <span class="tile__icon">
                    <v-icon
                        :icon="member && entry.done && entry.counted ? 'mdi-check' : entry.icon"
                        size="22"
                    />
                </span>
                <span class="tile__label">{{ entry.label }}</span>
                <span class="tile__text">{{ member ? entry.text : entry.hint }}</span>
            </li>
        </ul>

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

const {
    isAuthenticated, initialized,
} = useAuth();
const {
    today: tarotToday, load: loadTarot,
} = useDailyTarot();
const {
    today: kinToday, load: loadKin,
} = useKinToday();
const {
    today: runeToday, load: loadRune,
} = useDailyRune();
const {
    today: horoscopeToday, status: horoscopeStatus, load: loadHoroscope,
} = useDailyHoroscope();

const tarotDrawn = computed(() => (tarotToday.value?.drawn ? tarotToday.value : null));
const kinUnlocked = computed(() => (kinToday.value?.unlocked ? kinToday.value : null));
const runeDrawn = computed(() => (runeToday.value?.drawn ? runeToday.value : null));
const horoscopeMoon = computed(() => horoscopeToday.value?.bodies.find((entry) => entry.body === 'MOON') ?? null);

/** One line for each part that is switched on. */
const entries = computed(() => [
    ...(TAROT_ENTRY_ENABLED
        ? [{
            label: '今日塔羅',
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
            icon: 'mdi-calendar-star',
            hint: '算出今天的 Kin',
            done: Boolean(kinUnlocked.value),
            counted: true,
            text: kinUnlocked.value
                ? `${kinName(kinUnlocked.value.kin)}（Kin ${kinUnlocked.value.kin.kinNumber}）`
                : '還沒揭曉，每天可以揭曉一次',
        }]
        : []),
    ...(RUNE_ENTRY_ENABLED
        ? [{
            label: '盧恩符文',
            icon: 'mdi-alpha-r-circle-outline',
            hint: '每天抽一枚符文',
            done: Boolean(runeDrawn.value),
            counted: true,
            text: runeDrawn.value
                ? `${runeDrawn.value.rune.glyph} ${runeDrawn.value.rune.name}（${RUNE_ORIENTATION_LABELS[runeDrawn.value.rune.orientation]}）`
                : '還沒抽符，每天可以抽一枚',
        }]
        : []),
    // Read, not drawn: it is always there, so it never counts as something still to do
    ...(HOROSCOPE_ENTRY_ENABLED
        ? [{
            label: '星座運勢',
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

const member = computed(() => initialized.value && isAuthenticated.value);
const counted = computed(() => entries.value.filter((entry) => entry.counted));
const countedTotal = computed(() => counted.value.length);
const doneCount = computed(() => counted.value.filter((entry) => entry.done).length);
const allDone = computed(() => counted.value.every((entry) => entry.done));

/** Today's date as the app counts it (Taipei), for the corner of the card */
const dateLabel = new Intl.DateTimeFormat('zh-TW', {
    timeZone: 'Asia/Taipei', month: 'numeric', day: 'numeric', weekday: 'short',
}).format(new Date());
// Only a member's cards are asked for; a visitor sees the invitation and nothing of today's results.
watch(() => initialized.value && isAuthenticated.value, (member) => {
    if (!member) return;

    if (TAROT_ENTRY_ENABLED) void loadTarot();
    if (KIN_ENTRY_ENABLED) void loadKin();
    if (RUNE_ENTRY_ENABLED) void loadRune();
    if (HOROSCOPE_ENTRY_ENABLED) void loadHoroscope();
}, { immediate: true });
</script>

<style scoped>
/* Paper in the app's amber: quieter than the multi-dimension card beside it, but the one that changes every day. */
.today {
    --gold: #b7791f;
    --gold-deep: #8a5a12;

    /* The card asks how wide it is, not the screen: two tiles across beside the other card, four on its own */
    container-type: inline-size;
    height: 100%;
    padding: 24px;
    border: 1px solid rgba(183, 121, 31, 0.3);
    border-radius: 14px;
    background: linear-gradient(165deg, #fffaf0 0%, #fff3da 100%);
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
    color: var(--gold-deep);
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

.today__progress {
    padding: 3px 12px;
    border: 1px solid rgba(183, 121, 31, 0.45);
    border-radius: 999px;
    font-size: 0.8125rem;
    color: var(--gold-deep);
}

.today__progress strong {
    font-size: 1rem;
}

.today__tiles {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px;
    padding: 0;
    margin: 18px 0 0;
    list-style: none;
}

@container (min-width: 560px) {
    .today__tiles {
        grid-template-columns: repeat(4, minmax(0, 1fr));
    }
}

.tile {
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding: 12px;
    border: 1px solid rgba(0, 0, 0, 0.08);
    border-radius: 12px;
    background: rgba(255, 255, 255, 0.8);
    animation: tile-in 0.4s ease backwards;
    animation-delay: calc(var(--i) * 70ms);
}

.tile--done {
    border-color: rgba(183, 121, 31, 0.6);
    background: #fff;
}

.tile__icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 34px;
    height: 34px;
    margin-bottom: 2px;
    border-radius: 50%;
    color: var(--gold-deep);
    background: rgba(183, 121, 31, 0.12);
}

.tile--done .tile__icon {
    color: #fff;
    background: var(--gold);
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
    background: var(--gold-deep);
}

.today__cta.v-btn--variant-outlined {
    color: var(--gold-deep);
    border-color: rgba(138, 90, 18, 0.5);
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
