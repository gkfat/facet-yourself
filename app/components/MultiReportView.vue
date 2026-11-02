<template>
    <div>
        <v-card
            v-for="item in plainBlocks"
            :key="item.key"
            variant="outlined"
            class="mb-4"
        >
            <v-card-title>{{ item.title }}</v-card-title>
            <v-card-subtitle
                v-if="SUBTITLES[item.key]"
                class="text-wrap"
            >
                {{ SUBTITLES[item.key] }}
            </v-card-subtitle>
            <v-card-text>
                <div
                    v-for="(segment, index) in item.segments"
                    :key="`${item.key}-${index}`"
                    class="mb-3"
                >
                    <p :class="['text-body-2 mb-1', { 'text-medium-emphasis': item.key === 'limits' }]">
                        {{ segment.text }}
                        <span
                            v-if="segment.timeSensitive && segment.asOf"
                            class="text-caption text-medium-emphasis"
                        >（{{ segment.asOf }} 產生）</span>
                    </p>
                    <p
                        v-if="segment.confirmQuestion"
                        class="text-caption text-medium-emphasis mb-0"
                    >
                        對照看看：{{ segment.confirmQuestion }}
                    </p>
                </div>
            </v-card-text>
        </v-card>

        <!-- How each trait can show in different times, toward different people and in different parts of life: all of it -->
        <v-card
            v-if="impactGroups.length"
            variant="outlined"
            class="mb-4"
        >
            <v-card-title>影響面向推測</v-card-title>
            <v-card-text>
                <div
                    v-for="(group, groupIndex) in impactGroups"
                    :key="group.kind"
                    :class="{ 'mt-6': groupIndex > 0 }"
                >
                    <div class="text-subtitle-1 font-weight-medium mb-2">
                        {{ group.label }}
                    </div>
                    <v-row dense>
                        <v-col
                            v-for="card in group.cards"
                            :key="card.context"
                            cols="12"
                            md="6"
                        >
                            <v-card
                                variant="outlined"
                                height="100%"
                            >
                                <v-card-text>
                                    <div class="text-subtitle-1 font-weight-bold mb-1">
                                        {{ card.name }}
                                    </div>
                                    <p class="text-body-2 mb-0">
                                        {{ card.text }}
                                    </p>
                                </v-card-text>
                            </v-card>
                        </v-col>
                    </v-row>
                </div>
            </v-card-text>
        </v-card>

        <v-card
            v-if="report.ai"
            variant="outlined"
            class="mb-4"
        >
            <v-card-title>AI 針對你改寫的解讀</v-card-title>
            <v-card-subtitle class="text-wrap">
                依上面規則找出的洞見改寫；每一段都對應到一條洞見，是 AI 的推測，不是任何一個系統的說法。
            </v-card-subtitle>
            <v-card-text>
                <div
                    v-for="item in report.ai.blocks"
                    :key="item.key"
                    class="mb-4"
                >
                    <div class="text-subtitle-1 font-weight-medium mb-1">
                        {{ item.title }}
                    </div>
                    <template
                        v-for="(segment, index) in item.segments"
                        :key="`${item.key}-${index}`"
                    >
                        <p :class="index % 2 === 0 ? 'text-body-2 mb-1' : 'text-caption text-medium-emphasis mb-3'">
                            {{ segment.text }}
                        </p>
                    </template>
                </div>
                <p class="text-caption text-medium-emphasis mb-0">
                    AI 綜合推論・{{ new Date(report.ai.generatedAt).toLocaleDateString('zh-TW') }} 產生。AI 的分析只是參考，不代表心理評估或專業建議。
                </p>
            </v-card-text>
        </v-card>
    </div>
</template>

<script lang="ts" setup>
import { impactCards } from '../utils/impactCards';
import type { ReportSnapshotDetail } from '../../shared/schemas/api/reportSnapshot.schema';

const props = defineProps<{ report: ReportSnapshotDetail }>();

const SUBTITLES: Readonly<Record<string, string>> = {
    'coordinates': '各系統給你的位置結論，只放事實。',
    'highlights': '各系統自己算出的重點，保留各系統的原語彙；完整內容可到各系統的單維度報告看。',
    'axis-map': '各傳統偏向特質軸的哪一端，以及來源是否彼此獨立；同屬一個傳統的來源只算同源。不顯示任何強度或信心數字。',
    'insights': '由規則庫找出的跨系統洞見，附來源與可以對照自己的問題，是推測，不是定論。',
    'now': '今天的牌、符文或運勢，只拿來對照，不影響上面的判斷。',
};

const plainBlocks = computed(() => props.report.blocks.filter((item) => !item.key.startsWith('impact:')));

/** The map of effects by who or what it is about: one card for each, with every trait put together */
const impactGroups = computed(() => impactCards(props.report.blocks));

</script>
