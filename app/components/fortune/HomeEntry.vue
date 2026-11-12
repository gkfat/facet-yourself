<template>
    <section
        v-if="entries.length"
        class="today"
        aria-labelledby="today-title"
    >
        <div class="today__body">
            <div class="today__copy">
                <span class="today__eyebrow">TODAY · {{ dateLabel }}</span>
                <h2
                    id="today-title"
                    class="today__title font-display"
                >
                    今日運勢
                </h2>
                <p class="today__lead">
                    {{ member ? '每天花一分鐘，看看今天給你的提醒。' : '每天翻塔羅、算今日 Kin、抽盧恩符文，不用登入就能試試。' }}
                </p>

                <ul
                    v-if="chips.length"
                    class="today__chips"
                >
                    <li
                        v-for="entry in chips"
                        :key="entry.label"
                    >
                        <NuxtLink
                            :to="`/fortune/${entry.view}`"
                            class="chip"
                        >
                            <v-icon
                                :icon="entry.icon"
                                size="16"
                            />
                            <span class="chip__label">{{ entry.label }}</span>
                            <span class="chip__text">{{ member ? entry.text : entry.hint }}</span>
                        </NuxtLink>
                    </li>
                </ul>

                <v-btn
                    v-if="initialized"
                    to="/fortune"
                    :variant="member && allDone ? 'outlined' : 'flat'"
                    class="today__cta"
                    append-icon="mdi-arrow-right"
                >
                    {{ member && allDone ? '再看一次今天的運勢' : '看今天的運勢' }}
                </v-btn>
            </div>

            <!-- Three kinds of divination, each on its own tile and drawn as the thing itself; in the band below the rings overlap -->
            <ul class="today__rings">
                <li
                    v-for="entry in rings"
                    :key="entry.label"
                    class="piece"
                    :class="{ 'piece--done': member && entry.done }"
                    :style="{ '--i': entries.indexOf(entry) }"
                >
                    <NuxtLink
                        :to="`/fortune/${entry.view}`"
                        class="piece__link"
                    >
                        <span
                            class="piece__disc"
                            aria-hidden="true"
                        >
                            <TarotCard
                                v-if="entry.view === 'tarot'"
                                :card="member && tarotDrawn ? tarotDrawn.card : null"
                                :flipped="Boolean(member && tarotDrawn)"
                                compact
                                class="piece__tarot"
                            />
                            <RuneStone
                                v-else-if="entry.view === 'rune'"
                                :rune="member && runeDrawn ? runeDrawn.rune : null"
                                :flipped="Boolean(member && runeDrawn)"
                                compact
                                class="piece__stone"
                            />
                            <HexagramLines
                                v-else
                                class="piece__lines"
                                :class="{ 'piece__lines--ghost': !(member && hexagramLatest) }"
                                :yang="member && hexagramLatest ? hexagramDrawings(hexagramLatest).primary : GHOST_LINES"
                                :moving="member && hexagramLatest ? hexagramLatest.moving : []"
                                label=""
                            />
                        </span>
                        <span class="piece__label">{{ entry.label }}</span>
                        <span class="piece__text">{{ member && entry.done ? entry.result : entry.hint }}</span>
                    </NuxtLink>
                </li>
            </ul>
        </div>
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
import {
    castHeadline, hexagramDrawings,
} from '../../utils/hexagramView';

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
            result: tarotDrawn.value
                ? `${tarotDrawn.value.card.name}（${TAROT_ORIENTATION_LABELS[tarotDrawn.value.card.orientation]}）`
                : '',
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
            result: '',
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
            result: runeDrawn.value
                ? `${runeDrawn.value.rune.name}（${RUNE_ORIENTATION_LABELS[runeDrawn.value.rune.orientation]}）`
                : '',
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
            result: hexagramLatest.value ? castHeadline(hexagramLatest.value) : '',
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
            result: '',
            text: horoscopeToday.value && horoscopeMoon.value
                ? `${ZODIAC_LABELS[horoscopeToday.value.sign]}，月亮在你的第 ${horoscopeMoon.value.house} 宮`
                : horoscopeStatus.value === 'needsProfile' ? '先填寫出生日期，就能看你的星座運勢' : '以你的星座看今天',
        }]
        : []),
]);

/** The lines drawn faintly while no hexagram is cast: only a picture of what is to come, not a cast */
const GHOST_LINES = [true, false, true, true, false, true];

/** The three kinds of divination are the point of the band; the calendar parts sit lightly beside them. */
const rings = computed(() => entries.value.filter((entry) => entry.group === 'divination'));
const chips = computed(() => entries.value.filter((entry) => entry.group === 'calendar'));

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
/*
 * The day to the night of the band below: the same full-width band, type and linework, in the pale paper of the banners.
 * Where the next band lays three dimensions over one another, here the three are still apart, each on its own tile.
 */
.today {
    --ink: rgb(var(--v-theme-night));

    /* The content asks how wide the page's column is; only the backdrop runs edge to edge */
    container-type: inline-size;
    position: relative;
    isolation: isolate;
    color: var(--ink);
}

.today::before,
.today::after {
    content: '';
    position: absolute;
    top: 0;
    bottom: 0;
    left: 50%;
    z-index: -1;
    width: 100vw;
    transform: translateX(-50%);
    pointer-events: none;
}

.today::before {
    background-color: rgb(var(--v-theme-paper));
    border-top: 1px solid rgba(var(--v-theme-night), 0.1);
}

/* The same film grain as the night band, in ink */
.today::after {
    background-image: var(--grain-light);
    opacity: 0.05;
}

.today__body {
    display: flex;
    flex-direction: column;
    gap: 28px;
    padding: 44px 0;
}

.today__copy {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
}

.today__eyebrow {
    font-size: 0.75rem;
    letter-spacing: 0.16em;
    color: rgb(var(--v-theme-primary));
}

.today__title {
    margin: 6px 0 10px;
    font-size: 1.625rem;
    line-height: 1.4;
    letter-spacing: 0.02em;
}

.today__lead {
    max-width: 30em;
    margin: 0 0 18px;
    font-size: 0.9375rem;
    line-height: 1.8;
    color: rgba(var(--v-theme-on-surface), 0.78);
}

.today__chips {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    padding: 0;
    margin: 0 0 20px;
    list-style: none;
}

.chip {
    display: inline-flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 2px 6px;
    padding: 6px 12px;
    font-size: 0.8125rem;
    line-height: 1.5;
    color: inherit;
    text-decoration: none;
    background: rgba(255, 255, 255, 0.6);
    border: 1px solid rgba(var(--v-theme-night), 0.18);
    border-radius: 16px;
    transition: border-color 0.15s ease;
}

.chip:hover,
.chip:focus-visible {
    border-color: rgba(var(--v-theme-primary), 0.7);
}

.chip__label {
    font-weight: 700;
}

.chip__text {
    color: rgba(var(--v-theme-on-surface), 0.7);
}

.today__cta {
    font-weight: 700;
    letter-spacing: 0.08em;
}

.today__cta.v-btn--variant-flat {
    color: #f4f7fb;
    background: var(--ink);
}

.today__cta.v-btn--variant-outlined {
    color: var(--ink);
    border-color: rgba(var(--v-theme-night), 0.5);
}

.today__rings {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 6px;
    padding: 0;
    margin: 0;
    list-style: none;
}

.piece {
    animation: piece-in 0.5s ease backwards;
    animation-delay: calc(var(--i) * 90ms);
}

.piece__link {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    color: inherit;
    text-align: center;
    text-decoration: none;
    border-radius: 12px;
}

.piece__link:focus-visible {
    outline: 2px solid rgb(var(--v-theme-primary));
    outline-offset: 4px;
}

/* The tile: a rounded square of the night band's ink, holding one thing. Dashed while it is still to be drawn. */
.piece__disc {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    aspect-ratio: 1;
    margin-bottom: 4px;
    background:
        var(--stars),
        radial-gradient(90% 70% at 50% 0%, #2b3763 0%, rgba(43, 55, 99, 0) 75%),
        linear-gradient(180deg, #1c2547 0%, #141a35 100%);
    border: 1.2px dashed rgba(233, 207, 152, 0.5);
    border-radius: 22px;
    transition: border-color 0.2s ease, transform 0.25s ease, box-shadow 0.25s ease;
}

/* Drawn: the line is whole and the tile has a faint glow of lamplight */
.piece--done .piece__disc {
    border-style: solid;
    border-color: rgba(233, 207, 152, 0.75);
    box-shadow: 0 0 14px rgba(233, 207, 152, 0.25);
}

.piece__link:hover .piece__disc,
.piece__link:focus-visible .piece__disc {
    border-color: #e9cf98;
    transform: translateY(-3px);
}

.piece__tarot {
    --tarot-width: 48px;
}

.piece__stone {
    --stone-width: 64px;
}

.piece__lines {
    width: 56px;
}

.piece__lines :deep(.bar) {
    fill: #e9cf98;
}

/* Not cast yet: the lines are only a trace of what is to come */
.piece__lines--ghost {
    opacity: 0.3;
}

.piece__label {
    font-size: 0.875rem;
    font-weight: 700;
    letter-spacing: 0.04em;
    white-space: nowrap;
}

.piece__text {
    font-size: 0.6875rem;
    line-height: 1.5;
    color: rgba(var(--v-theme-on-surface), 0.68);
}

.piece--done .piece__text {
    color: rgb(var(--v-theme-on-surface));
}

@container (min-width: 560px) {
    /* Mirrors the band below: the tiles on the left, the words on the right */
    .today__body {
        flex-direction: row-reverse;
        align-items: center;
        gap: 40px;
    }

    .today__copy {
        flex: 0 0 38%;
    }

    .today__rings {
        flex: 1 1 0;
        gap: 14px;
    }

    .piece__tarot {
        --tarot-width: 78px;
    }

    .piece__stone {
        --stone-width: 100px;
    }

    .piece__lines {
        width: 88px;
    }

    .piece__label {
        font-size: 0.9375rem;
    }

    .piece__text {
        font-size: 0.75rem;
    }
}

@keyframes piece-in {
    from {
        opacity: 0;
        transform: translateY(8px);
    }
}

@media (prefers-reduced-motion: reduce) {
    .piece {
        animation: none;
    }

    .piece__disc {
        transition: none;
    }
}
</style>
