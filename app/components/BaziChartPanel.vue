<template>
    <div>
        <v-card
            variant="outlined"
            class="mb-4"
        >
            <v-card-title>四柱</v-card-title>
            <v-card-subtitle class="text-wrap">
                年、月、日、時各一柱，每柱有天干與地支。框起來的是日主。
            </v-card-subtitle>
            <v-card-text>
                <BaziPillarsTable :result="result" />
            </v-card-text>
        </v-card>

        <v-row class="mb-1">
            <v-col
                cols="12"
                md="6"
            >
                <v-card
                    variant="outlined"
                    height="100%"
                >
                    <v-card-title>五行分布</v-card-title>
                    <v-card-text>
                        <BaziElementBars :counts="result.elementCounts" />
                    </v-card-text>
                </v-card>
            </v-col>
            <v-col
                cols="12"
                md="6"
            >
                <v-card
                    variant="outlined"
                    height="100%"
                >
                    <v-card-title>十神彙整</v-card-title>
                    <v-card-text>
                        <BaziTenGodBars
                            :group-counts="result.groupCounts"
                            :ten-god-counts="result.tenGodCounts"
                        />
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>

        <v-card
            variant="outlined"
            class="mb-4"
        >
            <v-card-title>日主強弱、命格與喜用神</v-card-title>
            <v-card-text>
                <BaziStrengthMeter :strength="result.strength" />
            </v-card-text>
        </v-card>
    </div>
</template>

<script lang="ts" setup>
import type { BaziResponse } from '../../shared/schemas/api/bazi.schema';

// The luck steps and the years are in the card of what moves with time in the report, under the chart
defineProps<{ result: BaziResponse }>();
</script>
