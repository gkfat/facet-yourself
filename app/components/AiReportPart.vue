<template>
    <div v-if="block?.segments[0]">
        <p class="part__lead">
            {{ block.segments[0].text }}
        </p>
        <ul
            v-if="points.length"
            class="part__points"
        >
            <li
                v-for="(point, index) in points"
                :key="index"
            >
                <strong v-if="point.label">{{ point.label }}</strong>{{ point.label ? '：' : '' }}{{ point.text }}
            </li>
        </ul>
    </div>
</template>

<script lang="ts" setup>
import type { AiReportItem } from '../../shared/schemas/api/aiReport.schema';

/** The longest a short title may be for the text before the colon to be shown as one */
const LABEL_MAX = 12;

const props = defineProps<{ block: AiReportItem['blocks'][number] | undefined }>();

/** One part of the mentor's answer: its lead, then its points; a point of the form "title：sentence" has its title set in bold. */
const points = computed(() => (props.block?.segments.slice(1) ?? []).map((segment) => {
    const colon = segment.text.indexOf('：');

    return colon > 0 && colon <= LABEL_MAX
        ? {
            label: segment.text.slice(0, colon), text: segment.text.slice(colon + 1),
        }
        : {
            label: '', text: segment.text,
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
    margin: 10px 0 0;
    padding-left: 1.3em;
    font-size: 0.92rem;
    line-height: 1.75;
}

.part__points li + li {
    margin-top: 6px;
}
</style>
