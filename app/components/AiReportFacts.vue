<template>
    <v-card
        v-if="blocks.length"
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
                    v-for="block in blocks"
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
</template>

<script lang="ts" setup>
import type { AiReportItem } from '../../shared/schemas/api/aiReport.schema';
import {
    DIMENSION_META, assessmentDimensions,
} from '../utils/reportDimensions';

defineProps<{
    /** The blocks of facts of the report, one for each report it was made from */
    blocks: AiReportItem['blocks'];
}>();

const dimensions = [...DIMENSION_META, ...assessmentDimensions()];
const metaOf = (system: string) => dimensions.find((meta) => meta.value === system);

/** The system a block of facts came from, from its key */
const systemOf = (block: { key: string }) => block.key.slice('facts:'.length);
</script>
