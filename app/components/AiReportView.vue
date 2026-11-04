<template>
    <div>
        <!-- What it was made from, and what was asked -->
        <v-card
            variant="outlined"
            class="mb-4"
        >
            <v-card-title>分析概要</v-card-title>
            <v-card-text>
                <blockquote
                    v-if="report.question"
                    class="lead"
                >
                    <div class="text-caption text-medium-emphasis mb-1">
                        你的提問
                    </div>
                    <p class="lead__text">
                        {{ report.question }}
                    </p>
                </blockquote>

                <div class="d-flex flex-wrap ga-2">
                    <v-chip
                        v-for="source in report.sources"
                        :key="source.snapshotId"
                        size="small"
                        variant="tonal"
                        :prepend-icon="metaOf(source.system)?.icon"
                        :style="{ color: metaOf(source.system)?.tone }"
                    >
                        <span class="chip__text">{{ source.position }}</span>
                    </v-chip>
                </div>

                <div class="text-caption text-medium-emphasis mt-3">
                    {{ new Date(report.createdAt).toLocaleString('zh-TW') }}・{{ report.cost }} 點
                </div>
            </v-card-text>
        </v-card>

        <!-- The facts, laid out as the reports gave them -->
        <v-card
            v-if="factBlocks.length"
            variant="outlined"
            class="mb-4"
        >
            <v-card-title>事實攤開</v-card-title>
            <v-card-subtitle class="text-wrap">
                你帶來的每一份報告，列出標題與摘要，還沒有任何推論。
            </v-card-subtitle>
            <v-card-text>
                <v-row dense>
                    <v-col
                        v-for="block in factBlocks"
                        :key="block.key"
                        cols="12"
                        md="6"
                    >
                        <v-card
                            variant="outlined"
                            height="100%"
                        >
                            <v-card-text>
                                <div class="d-flex align-center ga-2 mb-2">
                                    <v-icon
                                        :icon="metaOf(systemOf(block))?.icon ?? 'mdi-circle-small'"
                                        :style="{ color: metaOf(systemOf(block))?.tone }"
                                        size="20"
                                    />
                                    <span class="text-subtitle-1 font-weight-bold">{{ block.title }}</span>
                                </div>
                                <p class="text-body-2 mb-0">
                                    {{ block.segments[0]?.text }}
                                </p>
                            </v-card-text>
                        </v-card>
                    </v-col>
                </v-row>
            </v-card-text>
        </v-card>

        <template v-if="report.status === 'COMPLETED'">
            <!-- What stands out -->
            <v-card
                v-if="part('highlights')"
                variant="outlined"
                class="mb-4"
            >
                <v-card-title>{{ part('highlights')?.title }}</v-card-title>
                <v-card-text>
                    <blockquote class="lead mb-0">
                        <AiReportPart :block="part('highlights')" />
                    </blockquote>
                </v-card-text>
            </v-card>

            <!-- The good and the bad -->
            <v-card
                v-if="part('positives') || part('negatives')"
                variant="outlined"
                class="mb-4"
            >
                <v-card-title>共同的優勢與劣勢</v-card-title>
                <v-card-text>
                    <v-row dense>
                        <v-col
                            v-for="side in sides.filter((item) => part(item.key))"
                            :key="side.key"
                            cols="12"
                            md="6"
                        >
                            <v-card
                                variant="outlined"
                                height="100%"
                                :class="`side--${side.tone}`"
                            >
                                <v-card-text>
                                    <div class="d-flex align-center ga-2 mb-1">
                                        <v-icon
                                            :icon="side.icon"
                                            :color="side.tone"
                                            size="20"
                                        />
                                        <span class="text-subtitle-1 font-weight-bold">{{ part(side.key)?.title }}</span>
                                    </div>
                                    <AiReportPart :block="part(side.key)" />
                                </v-card-text>
                            </v-card>
                        </v-col>
                    </v-row>
                </v-card-text>
            </v-card>

            <!-- The mentor looks across past, present and future -->
            <v-card
                v-if="times.some((time) => part(time.key))"
                variant="outlined"
                class="mb-4"
            >
                <v-card-title>導師縱觀：過去、現在、未來</v-card-title>
                <v-card-text>
                    <v-timeline
                        side="end"
                        density="compact"
                        align="start"
                        line-thickness="2"
                    >
                        <v-timeline-item
                            v-for="time in times.filter((item) => part(item.key))"
                            :key="time.key"
                            :dot-color="time.tone"
                            :icon="time.icon"
                            size="small"
                        >
                            <div class="text-subtitle-1 font-weight-bold mb-1">
                                {{ part(time.key)?.title }}
                            </div>
                            <AiReportPart :block="part(time.key)" />
                        </v-timeline-item>
                    </v-timeline>
                </v-card-text>
            </v-card>

            <!-- The answer to the question -->
            <v-card
                v-if="part('question')"
                variant="outlined"
                class="mb-4"
            >
                <v-card-title>{{ part('question')?.title }}</v-card-title>
                <v-card-text>
                    <AiReportPart :block="part('question')" />
                </v-card-text>
            </v-card>

            <!-- The conclusion -->
            <v-card
                v-if="part('conclusion')"
                variant="outlined"
                class="conclusion mb-4"
            >
                <v-card-title>{{ part('conclusion')?.title }}</v-card-title>
                <v-card-text>
                    <AiReportPart :block="part('conclusion')" />
                </v-card-text>
            </v-card>

            <p class="text-caption text-medium-emphasis">
                AI 綜合推論，由一位融合心理學、命相學與神秘學視角的導師寫成，談的是可能與傾向，不是預言，也不代表心理評估或專業建議。
            </p>
        </template>
    </div>
</template>

<script lang="ts" setup>
import type { AiReportItem } from '../../shared/schemas/api/aiReport.schema';
import {
    DIMENSION_META, assessmentDimensions,
} from '../utils/reportDimensions';

const props = defineProps<{ report: AiReportItem }>();

const dimensions = [...DIMENSION_META, ...assessmentDimensions()];
const metaOf = (system: string) => dimensions.find((meta) => meta.value === system);

const sides = [
    {
        key: 'positives', tone: 'success', icon: 'mdi-thumb-up-outline',
    },
    {
        key: 'negatives', tone: 'warning', icon: 'mdi-alert-circle-outline',
    },
] as const;

const times = [
    {
        key: 'past', tone: 'grey', icon: 'mdi-history',
    },
    {
        key: 'present', tone: 'primary', icon: 'mdi-circle-slice-8',
    },
    {
        key: 'future', tone: 'info', icon: 'mdi-arrow-right-circle-outline',
    },
] as const;

const factBlocks = computed(() => props.report.blocks.filter((block) => block.key.startsWith('facts:')));

/** The system a block of facts came from, from its key */
const systemOf = (block: { key: string }) => block.key.slice('facts:'.length);

/** One part of the mentor's answer, by its section key */
const part = (key: string) => props.report.blocks.find((block) => block.key === `ai:${key}`);
</script>

<style scoped>
.chip__text {
    color: rgb(var(--v-theme-on-surface));
}

.lead {
    margin: 0 0 16px;
    padding: 16px 20px;
    border-left: 4px solid rgb(var(--v-theme-primary));
    border-radius: 0 8px 8px 0;
    background: rgba(var(--v-theme-primary), 0.06);
}

.lead__text {
    margin: 0;
    font-size: 1rem;
    line-height: 1.8;
}

.side--success {
    border-color: rgba(var(--v-theme-success), 0.5);
}

.side--warning {
    border-color: rgba(var(--v-theme-warning), 0.5);
}

.conclusion {
    border-color: rgb(var(--v-theme-primary));
}
</style>
