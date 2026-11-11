<template>
    <div
        v-if="notices.length > 0"
        class="d-grid ga-2 mb-4"
    >
        <v-alert
            v-for="notice in notices"
            :key="notice"
            type="info"
            variant="tonal"
            density="compact"
        >
            {{ notice }}
        </v-alert>
    </div>
</template>

<script lang="ts" setup>
import {
    ZIWEI_LEAP_NOTE, ziweiHourNoteText,
} from '../../../shared/constants/ziweiLabels';
import type { ZiweiResponse } from '../../../shared/schemas/api/ziwei.schema';

const props = defineProps<{ chart: ZiweiResponse }>();

/** What the chart's reader should know about how this chart was laid out: a leap month, the late 子 hour, a birth near the edge of an hour, an assumed time zone */
const notices = computed(() => [
    ...(props.chart.meta.isLeapMonth ? [ZIWEI_LEAP_NOTE] : []),
    ...props.chart.hourNotes.map(ziweiHourNoteText),
    ...(props.chart.timeZoneAssumed ? [`沒有出生城市，以 ${props.chart.timeZone} 計算。`] : []),
]);
</script>
