<template>
    <div v-if="block?.segments[0]">
        <p class="part__lead">
            {{ block.segments[0].text }}
        </p>
        <div
            v-if="points.length"
            class="part__points"
        >
            <div
                v-for="(point, index) in points"
                :key="index"
                class="part__point"
            >
                <div
                    v-if="point.label"
                    class="part__point-title"
                >
                    {{ point.label }}
                </div>
                <p class="part__point-text">
                    {{ point.text }}
                </p>
                <!-- Which of the reports the point rests on, when it is not all of them -->
                <div
                    v-if="point.systems.length"
                    class="part__basis"
                >
                    <v-chip
                        v-for="system in point.systems"
                        :key="system"
                        size="x-small"
                        variant="tonal"
                        :prepend-icon="metaOf(system)?.icon"
                        :style="{ color: metaOf(system)?.tone }"
                    >
                        <span class="part__basis-text">{{ metaOf(system)?.label ?? system }}</span>
                    </v-chip>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import type { AiReportItem } from '../../shared/schemas/api/aiReport.schema';
import {
    DIMENSION_META, assessmentDimensions,
} from '../utils/reportDimensions';

/** The longest a short title may be for the text before the colon to be shown as one */
const LABEL_MAX = 12;

const props = defineProps<{
    block: AiReportItem['blocks'][number] | undefined;
    /** How many reports the AI report was made from: a point is marked with the systems it rests on only when they are fewer than that */
    systemCount?: number;
}>();

const dimensions = [...DIMENSION_META, ...assessmentDimensions()];
const metaOf = (system: string) => dimensions.find((meta) => meta.value === system);

/** The systems a point rests on, in the order it names them; none when it names all of them (that says nothing) or only insights */
const systemsOf = (segment: { sources: ReadonlyArray<{ system?: string | undefined }> }): string[] => {
    const systems = [...new Set(segment.sources.flatMap((source) => (source.system ? [source.system] : [])))];

    return systems.length < (props.systemCount ?? 0) ? systems : [];
};

/** One part of the mentor's answer: its lead, then its points; a point of the form "title：sentence" is a small card with its title above the sentence. */
const points = computed(() => (props.block?.segments.slice(1) ?? []).map((segment) => {
    const colon = segment.text.indexOf('：');
    const systems = systemsOf(segment);

    return colon > 0 && colon <= LABEL_MAX
        ? {
            label: segment.text.slice(0, colon), text: segment.text.slice(colon + 1), systems,
        }
        : {
            label: '', text: segment.text, systems,
        };
}));
</script>

<style scoped>
.part__lead {
    margin: 0;
    font-size: 0.95rem;
    line-height: 1.8;
}

.part__points {
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin-top: 14px;
}

.part__point {
    padding: 12px 16px;
    border: 1px solid rgba(var(--v-theme-on-surface), 0.1);
    border-radius: 10px;
    background: rgba(var(--v-theme-primary), 0.03);
}

.part__point-title {
    margin-bottom: 4px;
    font-size: 0.95rem;
    font-weight: 700;
}

.part__point-text {
    margin: 0;
    font-size: 0.92rem;
    line-height: 1.75;
}

.part__basis {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    margin-top: 8px;
}

.part__basis-text {
    color: rgb(var(--v-theme-on-surface));
}
</style>
