<template>
    <div class="groups">
        <BaziTakeaway class="mb-3">
            <template v-if="topRow">
                <v-chip
                    size="small"
                    variant="tonal"
                    prepend-icon="mdi-arrow-up-circle-outline"
                >
                    {{ topRow.label }}偏多
                </v-chip>
                <span class="groups__lead">{{ topRow.hint }}</span>
            </template>
            <span
                v-else
                class="text-body-2 text-medium-emphasis"
            >五類分布相對平均，沒有特別偏多的一類。</span>
        </BaziTakeaway>

        <p class="text-body-2 mb-3">
            十神共有十個，兩兩一組，歸成五類。每一類的數字，是它在八個字（天干與地支本氣）裡出現的次數；每個十神下面標出它落在哪一柱。
        </p>

        <div
            v-for="row in rows"
            :key="row.group"
            class="group"
            :class="{ 'group--top': row.dominant }"
            :style="{ '--group-color': row.color }"
        >
            <div class="group__head">
                <span class="group__name">{{ row.label }}</span>
                <span class="group__pair">{{ row.members.join('、') }}</span>
                <span class="group__count">{{ row.count }}</span>
            </div>
            <div class="group__track">
                <div
                    v-if="row.count > 0"
                    class="group__fill"
                    :style="{ width: ready ? `${row.percent}%` : '0%' }"
                />
            </div>
            <p class="group__hint">
                {{ row.hint }}
            </p>
            <div class="group__gods">
                <div
                    v-for="god in row.gods"
                    :key="god.name"
                    class="god"
                    :class="{ 'god--none': god.count === 0 }"
                >
                    <div class="god__head">
                        <span class="god__name">{{ god.name }}</span>
                        <span class="god__count">{{ god.count === 0 ? '沒有' : `${god.count} 個` }}</span>
                    </div>
                    <div
                        v-if="god.places.length"
                        class="god__places"
                    >
                        <v-chip
                            v-for="place in god.places"
                            :key="place.key"
                            size="x-small"
                            :variant="place.counted ? 'tonal' : 'outlined'"
                            :class="{ 'god__place--hidden': !place.counted }"
                        >
                            {{ place.text }}
                        </v-chip>
                    </div>
                    <p class="god__meaning">
                        {{ god.meaning }}
                    </p>
                </div>
            </div>
        </div>

        <p class="text-caption text-medium-emphasis mt-2 mb-0">
            實心標籤是計入數量的位置（天干與地支本氣）；虛線標籤是地支裡的中氣、餘氣，只列出來，不計入數量。
        </p>
    </div>
</template>

<script lang="ts" setup>
import {
    TEN_GODS,
    TEN_GOD_GROUPS,
    TEN_GOD_GROUP_COLORS,
    TEN_GOD_GROUP_HINTS,
    TEN_GOD_GROUP_LABELS,
    TEN_GOD_GROUP_OF,
    TEN_GOD_MEANINGS,
    type TenGod,
    type TenGodGroup,
} from '../../../shared/constants/bazi';
import {
    BAZI_HIDDEN_ROLE_LABELS, BAZI_POSITION_LABELS,
} from '../../../shared/constants/baziLabels';
import type { BaziResponse } from '../../../shared/schemas/api/bazi.schema';
import { dominantGroup } from '../../../shared/utils/bazi/analysis';

/** Where a ten god stands in the chart; only a stem and a branch's main qi are counted */
type Place = {
    key: string;
    text: string;
    counted: boolean;
};

const props = defineProps<{
    groupCounts: Record<TenGodGroup, number>;
    tenGodCounts: Record<TenGod, number>;
    chart: BaziResponse['chart'];
}>();

/** Every place of a ten god, from the year to the hour pillar */
function placesOf(god: TenGod): Place[] {
    return props.chart.flatMap((pillar) => {
        const where = BAZI_POSITION_LABELS[pillar.position];
        const stem: Place[] = pillar.stemTenGod === god
            ? [{
                key: `${pillar.position}-stem`, text: `${where}天干 ${pillar.stem}`, counted: true,
            }]
            : [];
        const hidden: Place[] = pillar.hiddenStems.filter((item) => item.tenGod === god).map((item) => (item.role === 'MAIN'
            ? {
                key: `${pillar.position}-${item.role}-${item.stem}`, text: `${where}地支本氣 ${item.stem}`, counted: true,
            }
            : {
                key: `${pillar.position}-${item.role}-${item.stem}`, text: `${where}藏干 ${item.stem}（${BAZI_HIDDEN_ROLE_LABELS[item.role]}）`, counted: false,
            }));

        return [...stem, ...hidden];
    });
}

const top = computed(() => dominantGroup(props.groupCounts));
const max = computed(() => Math.max(...TEN_GOD_GROUPS.map((group) => props.groupCounts[group]), 1));

const rows = computed(() => TEN_GOD_GROUPS.map((group) => ({
    group,
    label: TEN_GOD_GROUP_LABELS[group],
    color: TEN_GOD_GROUP_COLORS[group],
    hint: TEN_GOD_GROUP_HINTS[group],
    count: props.groupCounts[group],
    percent: (props.groupCounts[group] / max.value) * 100,
    dominant: top.value === group,
    members: TEN_GODS.filter((god) => TEN_GOD_GROUP_OF[god] === group),
    gods: TEN_GODS
        .filter((god) => TEN_GOD_GROUP_OF[god] === group)
        .map((god) => ({
            name: god,
            count: props.tenGodCounts[god],
            meaning: TEN_GOD_MEANINGS[god],
            places: placesOf(god),
        })),
})));

const topRow = computed(() => rows.value.find((row) => row.dominant) ?? null);

const ready = ref(false);

onMounted(() => {
    requestAnimationFrame(() => {
        ready.value = true;
    });
});
</script>

<style scoped>
.groups__lead {
    font-size: 0.875rem;
    font-weight: 400;
    color: rgba(var(--v-theme-on-surface), 0.75);
}

/* One tile for a group: its name, its count and bar, then the two gods it holds */
.group {
    margin-bottom: 10px;
    padding: 10px 12px 10px 14px;
    border: 1px solid rgba(var(--v-theme-on-surface), 0.12);
    border-left: 5px solid var(--group-color);
    border-radius: 4px 12px 12px 4px;
}

.group--top {
    background: rgba(var(--v-theme-primary), 0.05);
    border-color: rgba(var(--v-theme-primary), 0.35);
    border-left-color: var(--group-color);
}

.group__head {
    display: flex;
    align-items: baseline;
    gap: 10px;
}

.group__name {
    font-size: 1.1rem;
    font-weight: 700;
}

.group__pair {
    flex: 1;
    min-width: 0;
    font-size: 0.8125rem;
    color: rgba(var(--v-theme-on-surface), 0.65);
}

.group__count {
    font-size: 1.25rem;
    font-weight: 700;
    font-variant-numeric: tabular-nums;
}

.group__track {
    height: 10px;
    margin: 6px 0;
    border-radius: 5px;
    background: rgba(var(--v-theme-on-surface), 0.07);
}

.group__fill {
    height: 100%;
    border-radius: 5px;
    background: var(--group-color);
    transition: width 0.6s ease-out;
}

.group__hint {
    margin: 0 0 4px;
    font-size: 0.8125rem;
    font-weight: 600;
}

/* One small card for each ten god, the same in every group: its name and count, where it stands, what it stands for */
.group__gods {
    display: grid;
    gap: 8px;
    margin-top: 8px;
}

@media (min-width: 600px) {
    .group__gods {
        grid-template-columns: repeat(2, minmax(0, 1fr));
    }
}

.god {
    padding: 8px 10px;
    border: 1px solid rgba(var(--v-theme-on-surface), 0.12);
    border-radius: 10px;
    background: rgb(var(--v-theme-surface));
}

/* A god the chart does not have is still explained, only quieter */
.god--none {
    border-style: dashed;
    opacity: 0.7;
}

.god__head {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 8px;
}

.god__name {
    font-size: 1rem;
    font-weight: 700;
}

.god__count {
    font-size: 0.8125rem;
    font-weight: 600;
    color: rgba(var(--v-theme-on-surface), 0.7);
}

.god__places {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    margin: 6px 0;
}

.god__place--hidden {
    border-style: dashed;
}

.god__meaning {
    margin: 4px 0 0;
    font-size: 0.8125rem;
    color: rgba(var(--v-theme-on-surface), 0.7);
}

@media (prefers-reduced-motion: reduce) {
    .group__fill {
        transition: none;
    }
}
</style>
