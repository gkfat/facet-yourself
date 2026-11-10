<template>
    <div>
        <LoadingState
            v-if="status === 'loading'"
            class="mb-4"
        />

        <v-alert
            v-if="status === 'failed'"
            type="error"
            variant="tonal"
            class="mb-4"
        >
            暫時無法取得今天的卦象，請稍後再試。
            <template #append>
                <v-btn
                    size="small"
                    @click="load"
                >
                    重試
                </v-btn>
            </template>
        </v-alert>

        <v-alert
            v-else-if="status === 'missing'"
            type="info"
            variant="tonal"
            class="mb-4"
        >
            今天的內容還在準備中，晚一點再回來看看。
        </v-alert>

        <!-- Nothing cast yet today -->
        <v-card
            v-if="!current && status === 'ready'"
            variant="outlined"
            class="mb-4"
        >
            <v-card-text class="text-center">
                <HexagramCoins
                    :heads="null"
                    :rolling="false"
                />
                <p class="text-body-1 mt-3 mb-1">
                    用三枚銅錢擲六次，由下往上排出一個卦。
                </p>
                <p class="text-body-2 text-medium-emphasis mb-4">
                    每天第一卦免費。這是這一刻的狀態，不是預言。
                </p>
                <v-btn
                    color="primary"
                    size="large"
                    :loading="casting"
                    :disabled="casting"
                    @click="onFirstCast"
                >
                    開始擲錢
                </v-btn>
            </v-card-text>
        </v-card>

        <v-alert
            v-if="problem === 'missing'"
            type="info"
            variant="tonal"
            class="mb-4"
        >
            這一卦的內容還在準備中，沒有扣點，晚一點再試。
        </v-alert>
        <v-alert
            v-else-if="problem === 'failed'"
            type="error"
            variant="tonal"
            class="mb-4"
        >
            這次沒有起成卦，也沒有扣點，請稍後再試。
        </v-alert>
        <v-alert
            v-else-if="problem === 'insufficient'"
            type="warning"
            variant="tonal"
            class="mb-4"
        >
            點數不足，沒有起卦也沒有扣點。
            <template #append>
                <v-btn
                    size="small"
                    to="/pricing"
                >
                    取得點數
                </v-btn>
            </template>
        </v-alert>

        <template v-if="current && drawings">
            <!-- More than one cast today: pick which to read -->
            <v-chip-group
                v-if="casts.length > 1"
                v-model="selectedSeq"
                mandatory
                class="mb-2"
                selected-class="text-primary"
            >
                <v-chip
                    v-for="item in casts"
                    :key="item.seq"
                    :value="item.seq"
                    variant="outlined"
                    @click="onPickCast"
                >
                    第 {{ item.seq + 1 }} 卦
                </v-chip>
            </v-chip-group>

            <!-- Tossing: three coins for each of the six lines, the member throws each one -->
            <v-card
                v-if="tossing"
                variant="outlined"
                class="mb-4"
            >
                <v-card-text class="toss">
                    <p class="toss__step">
                        第 {{ tossed + 1 }} 爻，共六爻
                    </p>
                    <HexagramCoins
                        :heads="coinHeads"
                        :rolling="rolling"
                    />
                    <p
                        class="toss__result"
                        aria-live="polite"
                    >
                        {{ tossMessage }}
                    </p>
                    <div class="toss__actions">
                        <v-btn
                            color="primary"
                            :disabled="rolling || autoTossing"
                            @click="tossNext"
                        >
                            擲第 {{ tossed + 1 }} 爻
                        </v-btn>
                        <v-btn
                            variant="text"
                            :disabled="rolling || autoTossing"
                            @click="tossAll"
                        >
                            自動擲完
                        </v-btn>
                    </div>
                    <figure class="toss__lines">
                        <HexagramLines
                            :yang="drawings.primary"
                            :moving="current.moving"
                            :shown="shown"
                            :label="hexagramAriaLabel(current.primary.name, current, shown)"
                        />
                        <figcaption>你擲出的爻，由下往上排</figcaption>
                    </figure>
                </v-card-text>
            </v-card>

            <template v-else>
                <HexagramReading
                    :cast="current"
                    class="mb-6"
                />

                <!-- Another cast: a member pays a point for each one after the first; a visitor signs in -->
                <v-card
                    v-if="nextCost !== null && member"
                    variant="outlined"
                    class="mb-4"
                >
                    <v-card-text class="d-flex align-center flex-wrap ga-3">
                        <span class="text-body-2">想再起一卦？每多起一卦扣 {{ nextCost }} 點。</span>
                        <v-spacer />
                        <v-btn
                            variant="tonal"
                            :disabled="casting"
                            @click="confirming = true"
                        >
                            再起一卦（{{ nextCost }} 點）
                        </v-btn>
                    </v-card-text>
                </v-card>
                <v-alert
                    v-else-if="!member"
                    type="info"
                    variant="tonal"
                    class="mb-4"
                >
                    訪客每天可以起一次免費的卦。登入後可以保存每天的卦，也能再起一卦（每卦 1 點）。
                    <template #append>
                        <v-btn
                            size="small"
                            to="/login"
                        >
                            登入
                        </v-btn>
                    </template>
                </v-alert>
            </template>
        </template>

        <!-- The price, shown before it is paid -->
        <v-dialog
            v-model="confirming"
            max-width="420"
        >
            <v-card>
                <v-card-title>再起一卦</v-card-title>
                <v-card-text>
                    <p class="mb-2">
                        這一卦會扣 <strong>{{ nextCost }} 點</strong>。
                    </p>
                    <p class="text-medium-emphasis">
                        目前有 {{ balance ?? '—' }} 點。
                    </p>
                    <v-alert
                        v-if="balance === 0"
                        type="warning"
                        variant="tonal"
                        class="mt-3"
                    >
                        點數不足，先取得點數才能再起一卦。
                    </v-alert>
                </v-card-text>
                <v-card-actions>
                    <v-spacer />
                    <v-btn @click="confirming = false">
                        取消
                    </v-btn>
                    <v-btn
                        v-if="balance === 0"
                        color="primary"
                        to="/pricing"
                    >
                        取得點數
                    </v-btn>
                    <v-btn
                        v-else
                        color="primary"
                        :disabled="casting"
                        @click="onPaidCast"
                    >
                        扣 {{ nextCost }} 點，開始擲錢
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </div>
</template>

<script lang="ts" setup>
import type { HexagramCastItem } from '../../../shared/schemas/api/hexagram.schema';
import {
    headsOf, hexagramAriaLabel, hexagramDrawings, tossResultText,
} from '../../utils/hexagramView';

const {
    today, status, casting, problem, load, cast,
} = useDailyHexagram();
const {
    isAuthenticated, initialized,
} = useAuth();
const {
    balance, refresh: refreshPoints,
} = usePoints();

const member = computed(() => initialized.value && isAuthenticated.value);
const casts = computed<HexagramCastItem[]>(() => (today.value?.drawn ? today.value.casts : []));
const nextCost = computed(() => today.value?.nextCost ?? null);

/** The cast being read: the one picked, or the latest of the day. */
const selectedSeq = ref<number | null>(null);
const current = computed(() => casts.value.find((item) => item.seq === selectedSeq.value) ?? casts.value[casts.value.length - 1] ?? null);
const drawings = computed(() => (current.value ? hexagramDrawings(current.value) : null));

const confirming = ref(false);

/** The cast that is being thrown line by line, and how many of its six lines have been thrown. */
const tossingSeq = ref<number | null>(null);
const tossed = ref(0);
const rolling = ref(false);
/** Whether the rest of the lines are being thrown one after the other without the member pressing each time. */
const autoTossing = ref(false);
/** How many of the three coins came up heads in the last toss; null before the first. */
const coinHeads = ref<number | null>(null);
const tossMessage = ref('按下按鈕，擲出第一爻。');

/** Whether the cast being read is still being thrown: its reading is shown only when all six lines are in. */
const tossing = computed(() => Boolean(current.value) && current.value?.seq === tossingSeq.value && tossed.value < 6);
const shown = computed(() => (current.value?.seq === tossingSeq.value ? tossed.value : 6));

const sleep = (ms: number) => new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
});
const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
let session = 0;

/** Throw the coins for the next line: the coins spin, the faces change in the air, and the line is laid down. */
async function tossNext(): Promise<void> {
    const item = current.value;

    if (!item || rolling.value || tossed.value >= 6) return;

    const mine = session;
    const value = item.lines[tossed.value];

    if (value === undefined) return;

    rolling.value = true;
    tossMessage.value = '銅錢在空中⋯';

    if (!reducedMotion()) {
        await sleep(480);
        if (mine !== session) return;
    }

    coinHeads.value = headsOf(value);

    if (!reducedMotion()) {
        await sleep(520);
        if (mine !== session) return;
    }

    tossMessage.value = tossResultText(tossed.value + 1, value);
    tossed.value += 1;
    rolling.value = false;
}

/** Throw all the lines that are left, one after the other: each one is thrown with its own spin of the coins. */
async function tossAll(): Promise<void> {
    if (!current.value || rolling.value || autoTossing.value) return;

    const mine = session;

    autoTossing.value = true;

    try {
        while (tossed.value < 6 && mine === session) {
            await tossNext();

            // A short breath between two throws, so each line can be seen being laid down
            if (tossed.value < 6 && mine === session && !reducedMotion()) await sleep(450);
        }
    } finally {
        if (mine === session) autoTossing.value = false;
    }
}

/** A cast just made is thrown line by line; with less motion asked for it is shown whole at once. */
function startTossing(seq: number): void {
    session += 1;
    selectedSeq.value = seq;
    tossingSeq.value = seq;
    tossed.value = reducedMotion() ? 6 : 0;
    rolling.value = false;
    autoTossing.value = false;
    coinHeads.value = null;
    tossMessage.value = '按下按鈕，擲出第一爻。';
}

function onPickCast() {
    // Reading an earlier cast shows it whole
    session += 1;
    tossingSeq.value = null;
    rolling.value = false;
    autoTossing.value = false;
}

/** Cast, and start throwing the cast that comes back when it is a new one. */
async function run(confirmCharge: boolean) {
    const seen = new Set(casts.value.map((item) => item.seq));

    await cast(confirmCharge);

    const made = casts.value.find((item) => !seen.has(item.seq));

    if (made) startTossing(made.seq);
}

async function onFirstCast() {
    await run(false);
}

/** The price has been agreed: the dialog closes first, then the cast is made and thrown on the page. */
async function onPaidCast() {
    confirming.value = false;
    await run(true);
}

// The page may stay open past Taipei midnight: asking again when it is looked at again gives the new day.
function onVisible() {
    if (document.visibilityState === 'visible') void load();
}

onMounted(() => {
    void load();
    if (member.value) void refreshPoints();
    document.addEventListener('visibilitychange', onVisible);
});

onBeforeUnmount(() => {
    session += 1;
    document.removeEventListener('visibilitychange', onVisible);
});
</script>

<style scoped>
.toss {
    text-align: center;
}

.toss__step {
    margin: 0;
    font-size: 0.9rem;
    color: rgba(var(--v-theme-on-surface), 0.7);
}

.toss__result {
    min-height: 1.6em;
    margin: 4px 0 12px;
    font-weight: 600;
}

.toss__actions {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 8px;
}

.toss__lines {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    margin: 20px 0 0;
    font-size: 0.8rem;
    color: rgba(var(--v-theme-on-surface), 0.6);
}
</style>
