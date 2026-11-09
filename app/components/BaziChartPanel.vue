<template>
    <div>
        <ReportSectionHeading
            id="report-chart"
            title="命盤資料"
            note="由出生日期與時間依曆法與固定規則算出來的結果，同樣的出生資料永遠得到同一張盤，這一區不含解讀。"
        />

        <!-- The cards of this part, in the order to look in: four steps, then three that are added to them -->
        <div class="chart-index">
            <p class="chart-index__lead">
                依「第 1 到 4 步」的順序看；後三張是補充。
            </p>
            <ReportSectionNav
                :items="chartIndex"
                :sticky="false"
            />
        </div>

        <v-card
            id="chart-pillars"
            variant="outlined"
            class="mb-4 chart-card"
        >
            <v-card-title><BaziStepTag :step="1" />四柱排盤</v-card-title>
            <v-card-subtitle class="text-wrap">
                年、月、日、時各一柱，每柱上面是天干、下面是地支。框起來的是日主，也就是「你自己」。
            </v-card-subtitle>
            <v-card-text>
                <BaziTakeaway class="mb-4">
                    <v-chip
                        size="small"
                        variant="tonal"
                    >
                        生肖：屬{{ result.facts.zodiac }}
                    </v-chip>
                    <v-chip
                        size="small"
                        variant="tonal"
                    >
                        {{ result.dayMaster.stem }}{{ ELEMENT_LABELS[result.dayMaster.element] }}日主
                    </v-chip>
                    <v-chip
                        size="small"
                        variant="tonal"
                    >
                        出生在{{ result.facts.season }}季・{{ result.facts.solarTerm }}
                    </v-chip>
                </BaziTakeaway>
                <BaziPillarsTable :result="result" />
                <p class="text-caption text-medium-emphasis mt-3 mb-0">
                    生肖看的是年柱的地支（{{ result.pillars.year.branch }}），八字以立春換年，立春前出生者的生肖會是前一年。
                </p>
            </v-card-text>
        </v-card>

        <v-row class="mb-1">
            <v-col cols="12">
                <v-card
                    id="chart-elements"
                    variant="outlined"
                    height="100%"
                    class="chart-card"
                >
                    <v-card-title><BaziStepTag :step="2" />五行分布</v-card-title>
                    <v-card-subtitle class="text-wrap">
                        八個字裡木、火、土、金、水各有幾個，以及五行之間的相生相剋。偏多代表那種特質明顯，缺少只是比較不自然出現，不是不好。
                    </v-card-subtitle>
                    <v-card-text>
                        <BaziElementRadar
                            :counts="result.elementCounts"
                            :power="result.elementPower"
                        />
                    </v-card-text>
                </v-card>
            </v-col>
            <v-col cols="12">
                <v-card
                    id="chart-tengods"
                    variant="outlined"
                    height="100%"
                    class="chart-card"
                >
                    <v-card-title><BaziStepTag :step="3" />十神彙整</v-card-title>
                    <v-card-subtitle class="text-wrap">
                        其他字跟「你自己」的關係，分成五類。哪一類多，就是你比較常用的處事方式。
                    </v-card-subtitle>
                    <v-card-text>
                        <BaziTenGodBars
                            :group-counts="result.groupCounts"
                            :ten-god-counts="result.tenGodCounts"
                            :chart="result.chart"
                        />
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>

        <v-card
            id="chart-strength"
            variant="outlined"
            class="mb-4 chart-card"
        >
            <v-card-title><BaziStepTag :step="4" />日主強弱、命格與喜用神</v-card-title>
            <v-card-subtitle class="text-wrap">
                強弱是「你自己」得到多少幫助；喜用神是相對順手的方向，忌神是相對吃力的方向，都只是安排生活的參考，不是吉凶。
            </v-card-subtitle>
            <v-card-text>
                <BaziStrengthMeter :strength="result.strength" />
            </v-card-text>
        </v-card>

        <v-card
            id="chart-climate"
            variant="outlined"
            class="mb-4 chart-card"
        >
            <v-card-title><BaziStepTag />季節氣候</v-card-title>
            <v-card-subtitle class="text-wrap">
                出生月份的冷暖乾濕，以及命盤裡的火（暖）與水（潤）夠不夠。這裡只列事實與需求高低，不是處方。
            </v-card-subtitle>
            <v-card-text>
                <BaziTakeaway class="mb-4">
                    <v-chip
                        size="small"
                        variant="tonal"
                        prepend-icon="mdi-thermometer"
                    >
                        {{ BAZI_CLIMATE_LABELS.status[result.climate.status] }}
                    </v-chip>
                    <span class="climate__summary">{{ result.climate.summary }}</span>
                </BaziTakeaway>

                <div class="d-flex flex-wrap ga-2 mb-4">
                    <v-chip
                        size="small"
                        variant="outlined"
                    >
                        {{ result.climate.month }}月
                    </v-chip>
                    <v-chip
                        size="small"
                        variant="outlined"
                    >
                        溫度：{{ BAZI_CLIMATE_LABELS.temperature[result.climate.temperature] }}
                    </v-chip>
                    <v-chip
                        size="small"
                        variant="outlined"
                    >
                        濕度：{{ BAZI_CLIMATE_LABELS.humidity[result.climate.humidity] }}
                    </v-chip>
                    <v-chip
                        size="small"
                        variant="outlined"
                    >
                        月令：{{ BAZI_CLIMATE_LABELS.bias[result.climate.monthBias] }}
                    </v-chip>
                </div>

                <div class="climate__tiles">
                    <div
                        v-for="tile in climateTiles"
                        :key="tile.element"
                        class="climate__tile"
                    >
                        <span
                            class="climate__element"
                            :style="{
                                backgroundColor: tile.colors.fill,
                                color: tile.colors.text,
                                borderColor: tile.colors.border,
                            }"
                        >{{ tile.name }}</span>
                        <div class="climate__body">
                            <div class="climate__role">
                                {{ tile.role }}：{{ tile.regulation }}
                            </div>
                            <div class="text-body-2 text-medium-emphasis">
                                力量指標 {{ tile.power }}（{{ tile.level }}）
                            </div>
                            <div
                                v-if="tile.influences.length"
                                class="text-caption text-medium-emphasis"
                            >
                                {{ tile.influences.join('、') }}，實際作用需結合整體命局判斷
                            </div>
                        </div>
                    </div>
                </div>

                <p class="text-body-2 mt-4 mb-0">
                    <template v-if="result.climate.needs.length">
                        需求較高的方向：{{ result.climate.needs.map((need) => BAZI_CLIMATE_LABELS.need[need]).join('、') }}。
                    </template>
                    <template v-if="result.climate.excess.length">
                        {{ result.climate.excess.map((item) => item === 'warming' ? '火的力量偏多，暖局可能過度' : '水的力量偏多，潤濕可能過度').join('；') }}。
                    </template>
                </p>
                <p class="text-caption text-medium-emphasis mt-3 mb-0">
                    {{ BAZI_CLIMATE_NOTE }}
                </p>
            </v-card-text>
        </v-card>

        <v-card
            id="chart-relations"
            variant="outlined"
            class="mb-4 chart-card"
        >
            <v-card-title><BaziStepTag />命局關係</v-card-title>
            <v-card-subtitle class="text-wrap">
                四柱之間的天干、地支有沒有互相合與沖。這裡只列出有的，解讀在下方「命理解讀」。
            </v-card-subtitle>
            <v-card-text>
                <ul
                    v-if="result.facts.relations.length"
                    class="relations"
                >
                    <li
                        v-for="(relation, index) in result.facts.relations"
                        :key="index"
                        class="relations__item"
                    >
                        <div class="relations__title">
                            <v-chip
                                size="small"
                                variant="tonal"
                            >
                                {{ BAZI_RELATION_LABELS[relation.kind] }}
                            </v-chip>
                            <span class="relations__pair">{{ relation.pair }}</span>
                            <span
                                v-if="relation.element"
                                class="text-body-2"
                            >{{ ELEMENT_LABELS[relation.element] }}</span>
                            <span class="text-body-2 text-medium-emphasis">
                                {{ relation.positions.map((position) => BAZI_POSITION_LABELS[position]).join('、') }}
                            </span>
                        </div>
                        <p class="text-body-2 text-medium-emphasis mb-0">
                            {{ BAZI_RELATION_NOTES[relation.kind] }}
                        </p>
                    </li>
                </ul>
                <p
                    v-else
                    class="text-body-2 mb-0"
                >
                    四柱之間沒有天干五合、地支六合或六沖。
                </p>
                <p class="text-caption text-medium-emphasis mt-3 mb-0">
                    計算範圍：天干五合，以及地支的六合、六沖、三合（含半合）、三會、刑（含自刑）、破、害。採用通行的子平規則，不同流派的標準可能不同。
                </p>
            </v-card-text>
        </v-card>

        <v-card
            id="chart-luck"
            variant="outlined"
            class="mb-4 chart-card"
        >
            <v-card-title><BaziStepTag />大運與流年干支</v-card-title>
            <v-card-subtitle class="text-wrap">
                每十年換一步大運，每年有一個流年。這裡只列干支與十神，解讀在下方「命理解讀」。
            </v-card-subtitle>
            <v-card-text>
                <BaziLuckTimeline
                    v-if="result.luck && result.flowYears"
                    :luck="result.luck"
                    :flow-years="result.flowYears"
                />
                <template v-else>
                    <p class="text-body-2 mb-3">
                        {{ luckHint }}
                    </p>
                    <v-btn
                        v-if="result.luckStatus === 'NEEDS_GENDER'"
                        to="/profile"
                        size="small"
                        color="primary"
                        variant="tonal"
                    >
                        到「我的資料」提供性別
                    </v-btn>
                </template>
            </v-card-text>
        </v-card>
    </div>
</template>

<script lang="ts" setup>
import {
    ELEMENT_COLORS, ELEMENT_LABELS,
} from '../../shared/constants/bazi';
import {
    BAZI_CLIMATE_LABELS, BAZI_CLIMATE_NOTE, BAZI_POSITION_LABELS, BAZI_RELATION_LABELS, BAZI_RELATION_NOTES,
} from '../../shared/constants/baziLabels';
import type { BaziResponse } from '../../shared/schemas/api/bazi.schema';

const props = defineProps<{ result: BaziResponse }>();

/** The cards of the chart, by name, for the index under the heading */
const chartIndex = [
    {
        id: 'chart-pillars', label: '1 四柱排盤',
    },
    {
        id: 'chart-elements', label: '2 五行',
    },
    {
        id: 'chart-tengods', label: '3 十神',
    },
    {
        id: 'chart-strength', label: '4 強弱與喜用神',
    },
    {
        id: 'chart-climate', label: '季節氣候',
    },
    {
        id: 'chart-relations', label: '命局關係',
    },
    {
        id: 'chart-luck', label: '大運與流年',
    },
];

/** Fire warms and water moistens: one tile for each, with its power, its level and what stands against it */
const climateTiles = computed(() => (['fire', 'water'] as const).map((element) => {
    const { climate } = props.result;
    const state = climate.elements[element];

    return {
        element,
        name: ELEMENT_LABELS[element],
        colors: ELEMENT_COLORS[element],
        role: element === 'fire' ? '暖局（火）' : '潤燥（水）',
        regulation: BAZI_CLIMATE_LABELS.regulation[element === 'fire' ? climate.regulation.warming : climate.regulation.moistening],
        power: state.power,
        level: BAZI_CLIMATE_LABELS.level[state.level],
        influences: climate.influences.filter((item) => item.element === element).map((item) => `${ELEMENT_LABELS[element]}${BAZI_CLIMATE_LABELS.influence[item.kind]}`),
    };
}));

/** What a chart without luck says: the luck needs a gender and a birth time */
const luckHint = computed(() => (props.result.luckStatus === 'NEEDS_GENDER'
    ? '提供性別後可看大運。性別只用來決定大運的排法（男命與女命的順逆不同），不會用在其他地方，也可以選擇不提供。'
    : '大運的起運要用到精確的出生時刻，所以需要出生時間。'));
</script>

<style scoped>
/* A card the index jumps to lands below the app bar and the section nav */
.chart-card {
    scroll-margin-top: calc(var(--v-layout-top, 64px) + 56px);
}

.chart-index {
    margin-bottom: 16px;
}

.chart-index__lead {
    margin: 0 0 4px;
    font-size: 0.8125rem;
    color: rgba(var(--v-theme-on-surface), 0.7);
}

.climate__summary {
    font-size: 0.95rem;
    font-weight: 600;
}

.climate__tiles {
    display: grid;
    gap: 10px;
}

@media (min-width: 720px) {
    .climate__tiles {
        grid-template-columns: repeat(2, minmax(0, 1fr));
    }
}

.climate__tile {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px 14px;
    border: 1px solid rgba(var(--v-theme-on-surface), 0.12);
    border-radius: 12px;
}

.climate__element {
    display: inline-flex;
    flex: none;
    align-items: center;
    justify-content: center;
    width: 2.6rem;
    height: 2.6rem;
    border: 1px solid;
    border-radius: 10px;
    font-size: 1.4rem;
    font-weight: 700;
}

.climate__role {
    font-weight: 700;
}

.relations {
    display: grid;
    gap: 12px;
    margin: 0;
    padding: 0;
    list-style: none;
}

.relations__item {
    padding: 10px 14px;
    border-left: 4px solid rgba(var(--v-theme-primary), 0.5);
    border-radius: 4px 12px 12px 4px;
    background: rgba(var(--v-theme-on-surface), 0.04);
}

.relations__title {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px;
    margin-bottom: 4px;
}

.relations__pair {
    font-size: 1.15rem;
    font-weight: 700;
    letter-spacing: 0.1em;
}

</style>
