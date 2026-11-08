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

        <!-- While the mentor is still writing, the facts are what there is to read; once it is done they close the report -->
        <AiReportFacts
            v-if="report.status !== 'COMPLETED'"
            :blocks="factBlocks"
        />

        <template v-if="report.status === 'COMPLETED'">
            <!-- The report in a sentence or two, ahead of everything -->
            <v-card
                v-if="part('summary')"
                variant="outlined"
                class="mb-4"
            >
                <v-card-title>{{ part('summary')?.title }}</v-card-title>
                <v-card-text>
                    <blockquote class="lead mb-0">
                        <AiReportPart :block="part('summary')" />
                    </blockquote>
                </v-card-text>
            </v-card>

            <!-- The answer to what was asked, next: it is what the member came for -->
            <v-card
                v-if="part('question')"
                variant="outlined"
                class="mb-4"
            >
                <v-card-title>{{ part('question')?.title }}</v-card-title>
                <v-card-text>
                    <AiReportPart
                        :block="part('question')"
                        :system-count="report.sources.length"
                    />
                </v-card-text>
            </v-card>

            <!-- What stands out -->
            <v-card
                v-if="part('highlights')"
                variant="outlined"
                class="mb-4"
            >
                <v-card-title>{{ part('highlights')?.title }}</v-card-title>
                <v-card-text>
                    <blockquote class="lead mb-0">
                        <AiReportPart
                            :block="part('highlights')"
                            :system-count="report.sources.length"
                        />
                    </blockquote>
                </v-card-text>
            </v-card>

            <!-- Each strength with what it costs -->
            <v-card
                v-if="part('tradeoffs')"
                variant="outlined"
                class="mb-4"
            >
                <v-card-title>{{ part('tradeoffs')?.title }}</v-card-title>
                <v-card-text>
                    <AiReportPart
                        :block="part('tradeoffs')"
                        :system-count="report.sources.length"
                    />
                </v-card-text>
            </v-card>

            <!-- The good and the bad, as the reports made before the strengths came with their costs have them -->
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
                                    <AiReportPart
                                        :block="part(side.key)"
                                        :system-count="report.sources.length"
                                    />
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
                            <AiReportPart
                                :block="part(time.key)"
                                :system-count="report.sources.length"
                            />
                        </v-timeline-item>
                    </v-timeline>
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
                    <AiReportPart
                        :block="part('conclusion')"
                        :system-count="report.sources.length"
                    />
                </v-card-text>
            </v-card>

            <!-- What it all rests on, last -->
            <AiReportFacts :blocks="factBlocks" />

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
