<template>
    <div>
        <!-- A visitor keeps no draws, so there is nothing to ask for -->
        <v-alert
            v-if="viewer === 'guest'"
            type="info"
            variant="tonal"
            class="mb-4"
        >
            訪客的抽取不會被保存，登入後才能回頭看最近 3 個月的紀錄。
            <template #append>
                <v-btn
                    to="/login"
                    size="small"
                    color="primary"
                >
                    登入
                </v-btn>
            </template>
        </v-alert>

        <LoadingState v-else-if="viewer === 'unknown' || status === 'idle' || status === 'loading'" />

        <v-alert
            v-else-if="status === 'failed'"
            type="error"
            variant="tonal"
            class="mb-4"
        >
            暫時無法取得歷史紀錄，請稍後再試。
            <template #append>
                <v-btn
                    size="small"
                    @click="loadFirst"
                >
                    重試
                </v-btn>
            </template>
        </v-alert>

        <template v-else>
            <p class="text-body-2 text-medium-emphasis mb-4">
                最近 3 個月每天抽到的塔羅、盧恩與卦象，由新到舊。點開一項可以重讀當天的內容。
            </p>

            <v-alert
                v-if="truncated"
                type="warning"
                variant="tonal"
                class="mb-4"
            >
                這段期間的卦象太多，只列出較新的部分，更早的卦沒有全部顯示。
            </v-alert>

            <v-card
                v-if="days.length === 0"
                variant="outlined"
                class="mb-4"
            >
                <v-card-text class="text-center">
                    <v-icon
                        icon="mdi-history"
                        size="40"
                        class="mb-2 text-medium-emphasis"
                    />
                    <p class="text-body-1 mb-1">
                        最近 3 個月還沒有紀錄
                    </p>
                    <p class="text-body-2 text-medium-emphasis mb-4">
                        每天抽一張牌、一枚符文或起一卦，這裡就會留下紀錄。
                    </p>
                    <v-btn
                        to="/fortune"
                        color="primary"
                        variant="tonal"
                    >
                        回今日運勢
                    </v-btn>
                </v-card-text>
            </v-card>

            <v-card
                v-for="{ day, casts } in rows"
                :key="day.date"
                variant="outlined"
                class="mb-4"
            >
                <v-card-title class="text-subtitle-1 font-weight-bold">
                    {{ day.date }}
                </v-card-title>
                <v-expansion-panels
                    variant="accordion"
                    flat
                >
                    <v-expansion-panel v-if="day.tarot">
                        <v-expansion-panel-title>
                            <div class="item">
                                <div class="item__mark item__mark--card">
                                    <TarotCard
                                        :card="day.tarot.card"
                                        flipped
                                        compact
                                        class="item__tarot"
                                    />
                                </div>
                                <div>
                                    <div class="item__kind">
                                        塔羅
                                    </div>
                                    <div class="item__title">
                                        {{ tarotTitle(day.tarot) }}
                                    </div>
                                    <div class="item__sub">
                                        {{ day.tarot.card.englishName }}
                                    </div>
                                </div>
                            </div>
                        </v-expansion-panel-title>
                        <v-expansion-panel-text>
                            <FixedResultView
                                v-if="day.tarot.content"
                                :result="day.tarot.content"
                            />
                            <p
                                v-else
                                class="text-body-2 text-medium-emphasis mb-0"
                            >
                                這一項的內容目前無法顯示。
                            </p>
                        </v-expansion-panel-text>
                    </v-expansion-panel>

                    <v-expansion-panel v-if="day.rune">
                        <v-expansion-panel-title>
                            <div class="item">
                                <div class="item__mark item__mark--card">
                                    <RuneStone
                                        :rune="day.rune.rune"
                                        flipped
                                        compact
                                        class="item__rune"
                                    />
                                </div>
                                <div>
                                    <div class="item__kind">
                                        盧恩符文
                                    </div>
                                    <div class="item__title">
                                        {{ runeTitle(day.rune) }}
                                    </div>
                                    <div class="item__sub">
                                        {{ day.rune.rune.meaning }}
                                    </div>
                                </div>
                            </div>
                        </v-expansion-panel-title>
                        <v-expansion-panel-text>
                            <FixedResultView
                                v-if="day.rune.content"
                                :result="day.rune.content"
                            />
                            <p
                                v-else
                                class="text-body-2 text-medium-emphasis mb-0"
                            >
                                這一項的內容目前無法顯示。
                            </p>
                        </v-expansion-panel-text>
                    </v-expansion-panel>

                    <v-expansion-panel
                        v-for="{ item: cast, reading } in casts"
                        :key="cast.seq"
                    >
                        <v-expansion-panel-title>
                            <div class="item">
                                <div class="item__mark">
                                    <HexagramLines
                                        class="item__lines"
                                        :yang="hexagramDrawings(cast).primary"
                                        :moving="cast.moving"
                                        :label="hexagramAriaLabel(cast.primary.name, cast)"
                                    />
                                </div>
                                <div>
                                    <div class="item__kind">
                                        易經卦象
                                    </div>
                                    <div class="item__title">
                                        {{ hexagramTitle(cast) }}
                                    </div>
                                    <div class="item__sub">
                                        {{ hexagramSubtitle(cast) }}
                                    </div>
                                </div>
                            </div>
                        </v-expansion-panel-title>
                        <v-expansion-panel-text>
                            <HexagramReading
                                v-if="reading"
                                :cast="reading"
                            />
                            <p
                                v-else
                                class="text-body-2 text-medium-emphasis mb-0"
                            >
                                這一項的內容目前無法顯示。
                            </p>
                        </v-expansion-panel-text>
                    </v-expansion-panel>
                </v-expansion-panels>
            </v-card>

            <div
                v-if="nextBefore"
                class="text-center mb-4"
            >
                <v-alert
                    v-if="moreFailed"
                    type="error"
                    variant="tonal"
                    class="mb-3"
                >
                    暫時無法載入更早的紀錄，請再試一次。
                </v-alert>
                <v-btn
                    variant="tonal"
                    :loading="loadingMore"
                    :disabled="loadingMore"
                    @click="loadMore"
                >
                    載入更多
                </v-btn>
            </div>
        </template>
    </div>
</template>

<script lang="ts" setup>
import {
    hexagramAriaLabel, hexagramDrawings,
} from '../../utils/hexagramView';
import {
    hexagramSubtitle, hexagramTitle, readableCast, runeTitle, tarotTitle,
} from '../../utils/fortuneHistoryView';

const { viewer } = useViewer();
const {
    days, nextBefore, truncated, status, loadingMore, moreFailed, loadFirst, loadMore,
} = useFortuneHistory();

/** Each day with its casts, and for each cast the reading as the component takes it (null when a reading has been taken down: the record stays, the reading does not) */
const rows = computed(() => days.value.map((day) => ({
    day,
    casts: day.hexagrams.map((item) => ({
        item, reading: readableCast(item),
    })),
})));

// Only a member has a history to ask for; a visitor sees the prompt and no request is made
watch(viewer, (who) => {
    if (who === 'member' && status.value === 'idle') void loadFirst();
}, { immediate: true });
</script>

<style scoped>
.item {
    display: flex;
    align-items: center;
    gap: 14px;
    min-width: 0;
}

.item__mark {
    display: flex;
    flex: none;
    align-items: center;
    justify-content: center;
    width: 56px;
}

.item__mark--card {
    height: 72px;
}

.item__tarot {
    --tarot-width: 40px;
}

.item__rune {
    --stone-width: 44px;
}

.item__lines {
    width: 48px;
}

.item__kind {
    font-size: 0.75rem;
    letter-spacing: 0.08em;
    color: rgba(var(--v-theme-on-surface), 0.6);
}

.item__title {
    font-size: 1rem;
    font-weight: 700;
    line-height: 1.4;
}

.item__sub {
    font-size: 0.8125rem;
    line-height: 1.5;
    color: rgba(var(--v-theme-on-surface), 0.6);
}
</style>
