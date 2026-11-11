<template>
    <div class="guide">
        <v-btn
            size="small"
            variant="text"
            color="primary"
            prepend-icon="mdi-help-circle-outline"
            @click="open = true"
        >
            紫微怎麼看
        </v-btn>

        <v-dialog
            v-model="open"
            max-width="560"
            scrollable
        >
            <v-card>
                <v-card-title>紫微命盤怎麼看？照這四步看就好</v-card-title>
                <v-card-text>
                    <ol class="guide__steps">
                        <li
                            v-for="step in ZIWEI_READING_STEPS"
                            :key="step.title"
                        >
                            <strong>{{ step.title }}</strong>
                            <p class="text-body-2 text-medium-emphasis mb-0">
                                {{ step.text }}
                            </p>
                        </li>
                    </ol>
                    <p class="text-caption text-medium-emphasis mt-4 mb-0">
                        {{ ZIWEI_DISCLAIMER }}
                    </p>
                </v-card-text>
                <v-card-actions>
                    <v-spacer />
                    <v-btn
                        color="primary"
                        @click="open = false"
                    >
                        知道了
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </div>
</template>

<script lang="ts" setup>
import {
    ZIWEI_DISCLAIMER, ZIWEI_READING_STEPS,
} from '../../../shared/constants/ziweiLabels';

const open = ref(false);
</script>

<style scoped>
.guide__steps {
    display: grid;
    gap: 12px;
    padding-inline-start: 1.25rem;
}
</style>
