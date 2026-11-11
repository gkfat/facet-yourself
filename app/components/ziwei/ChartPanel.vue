<template>
    <div>
        <ReportSectionHeading
            id="report-chart"
            title="命盤資料"
            note="由出生日期與時間依固定規則排出來的結果，同樣的出生資料永遠得到同一張盤，這一區不含解讀。"
        />

        <ZiweiNotices :chart="chart" />

        <v-card
            variant="outlined"
            class="mb-4"
        >
            <v-card-title class="d-flex align-center">
                紫微斗數命盤
                <v-spacer />
                <ZiweiGuide />
            </v-card-title>
            <v-card-text>
                <!-- The twelve palaces in the traditional layout on a wide screen, and in the order from 命宮 on a phone -->
                <div class="chart">
                    <div
                        v-for="cell in cells"
                        :key="cell.palace.palace"
                        class="chart__cell"
                        :style="{ '--row': cell.row, '--column': cell.column, '--order': cell.order }"
                    >
                        <ZiweiPalaceCard
                            :palace="cell.palace"
                            :is-life="cell.palace.palace === '命宮'"
                            :is-body="cell.palace.palace === chart.bodyPalace.palace"
                            :borrowed="cell.borrowed"
                        />
                    </div>

                    <div class="hub">
                        <p class="hub__eyebrow">
                            命盤中樞
                        </p>
                        <p class="hub__bureau">
                            {{ chart.bureau.label }}
                        </p>
                        <p class="hub__date">
                            農曆 {{ chart.meta.lunarYearStem }}{{ chart.meta.lunarYearBranch }}年{{ chart.meta.isLeapMonth ? '閏' : '' }}{{ chart.meta.originalLunarMonth }}月{{ chart.meta.lunarDay }}日・{{ chart.meta.hourBranch }}時
                        </p>
                        <dl class="hub__facts">
                            <div>
                                <dt>命主</dt>
                                <dd>{{ chart.lifeMaster }}</dd>
                            </div>
                            <div>
                                <dt>身主</dt>
                                <dd>{{ chart.bodyMaster }}</dd>
                            </div>
                            <div>
                                <dt>身宮</dt>
                                <dd>{{ chart.bodyPalace.sameAsLife ? '同命宮' : chart.bodyPalace.palace }}</dd>
                            </div>
                        </dl>
                    </div>
                </div>

                <!-- The four 四化 of the birth year, each with the palace it landed in -->
                <ul class="marks">
                    <li
                        v-for="mark in marks"
                        :key="mark.transformation"
                        class="marks__item"
                    >
                        <ZiweiStarTag
                            :placement="{ star: mark.star, transformation: mark.transformation }"
                            seal-only
                        />
                        <span class="marks__text">{{ mark.star }}<small v-if="mark.palace">・{{ mark.palace }}</small></span>
                    </li>
                </ul>
                <p class="text-caption text-medium-emphasis mb-1">
                    這是簡化版的紫微斗數：只呈現十四主星、四輔星（文昌、文曲、左輔、右弼）、生年四化、五行局、命主與身主，未包含煞星與其他輔星、星曜亮度與行運；不同排盤系統可能因此呈現不同結果。
                </p>
                <p class="text-caption text-medium-emphasis mb-1">
                    排盤規則：三合系統、農曆正月初一換年、閏月十五日分界、晚子時日期不換日、使用出生地的標準時間；算法版本 {{ chart.algorithmVersion }}。
                </p>
                <p class="text-caption text-medium-emphasis mb-0">
                    {{ ZIWEI_DISCLAIMER }}
                </p>
            </v-card-text>
        </v-card>
    </div>
</template>

<script lang="ts" setup>
import {
    ZIWEI_DISCLAIMER, ZIWEI_GRID_BRANCHES,
} from '../../../shared/constants/ziweiLabels';
import type { ZiweiResponse } from '../../../shared/schemas/api/ziwei.schema';
import { borrowedStarsOf } from '../../../shared/utils/ziwei/borrowed';

const props = defineProps<{ chart: ZiweiResponse }>();

/** The four 四化 of the birth year, in the order 祿 權 科 忌, with the palace each star is in */
const marks = computed(() => props.chart.birthYearTransformations.map((item) => ({
    transformation: item.transformation,
    star: item.star,
    palace: props.chart.palaces.find((palace) => [...palace.mainStars, ...palace.auxiliaryStars].some((placement) => placement.star === item.star))?.palace ?? null,
})));

const cells = computed(() => props.chart.palaces.map((palace, order) => {
    const position = ZIWEI_GRID_BRANCHES.find((item) => item.branch === palace.branch);

    return {
        palace,
        row: position?.row ?? 1,
        column: position?.column ?? 1,
        order,
        borrowed: borrowedStarsOf(props.chart, palace.palace),
    };
}));
</script>

<style scoped>
.chart {
    display: grid;
    gap: 8px;
    grid-template-columns: 1fr;
}

.chart__cell {
    display: flex;
    order: var(--order);
}

/* The card fills its cell, so the cards of a row are one height */
.chart__cell > * {
    flex: 1;
}

/* The hub: the bureau in large display type, then what the chart rests on */
.hub {
    order: -1;
    padding: 16px;
    border-radius: 10px;
    background: rgb(var(--v-theme-paper));
    text-align: center;
}

.hub__eyebrow {
    margin: 0 0 4px;
    font-size: 0.7rem;
    letter-spacing: 0.3em;
    color: rgb(var(--v-theme-secondary));
}

.hub__bureau {
    margin: 0;
    font-family: var(--font-display);
    font-size: 2rem;
    font-weight: 900;
    letter-spacing: 0.1em;
    color: rgb(var(--v-theme-night));
}

.hub__date {
    margin: 4px 0 12px;
    font-size: 0.82rem;
    color: rgb(var(--v-theme-secondary));
}

.hub__facts {
    display: flex;
    justify-content: center;
    gap: 20px;
    margin: 0;
}

.hub__facts dt {
    font-size: 0.68rem;
    letter-spacing: 0.2em;
    color: rgb(var(--v-theme-secondary));
}

.hub__facts dd {
    margin: 0;
    font-family: var(--font-display);
    font-size: 1.05rem;
    font-weight: 700;
    color: rgb(var(--v-theme-ink));
}

.marks {
    display: flex;
    flex-wrap: wrap;
    gap: 8px 10px;
    margin: 16px 0 12px;
    padding: 0;
    list-style: none;
}

.marks__item {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 4px 10px 4px 6px;
    border: 1px solid rgba(var(--v-theme-primary), 0.16);
    border-radius: 999px;
    font-size: 0.85rem;
}

.marks__text {
    font-family: var(--font-display);
    font-weight: 700;
}

.marks__text small {
    font-family: var(--font-body);
    font-weight: 400;
    color: rgb(var(--v-theme-secondary));
}

@media (min-width: 720px) {
    .chart {
        grid-template-columns: repeat(4, minmax(0, 1fr));
        /* Four rows of one height: the tallest card (an empty palace with its borrowed stars) sets it */
        grid-auto-rows: 1fr;
    }

    .chart__cell {
        order: 0;
        grid-row: var(--row);
        grid-column: var(--column);
    }

    .hub {
        order: 0;
        grid-row: 2 / span 2;
        grid-column: 2 / span 2;
        align-self: stretch;
        display: grid;
        align-content: center;
    }
}
</style>
