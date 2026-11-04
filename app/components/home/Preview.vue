<template>
    <section
        v-if="key"
        class="preview mb-6"
        aria-label="你的星座與生命靈數"
    >
        <v-row>
            <v-col
                cols="12"
                sm="6"
            >
                <v-card
                    variant="outlined"
                    height="100%"
                    class="preview__card"
                    :style="{ '--tone': '#b7791f' }"
                >
                    <v-card-text class="d-flex flex-column ga-1 h-100">
                        <span class="preview__label">太陽星座</span>
                        <span class="preview__name">你是{{ ZODIAC_LABELS[key.sign] }}</span>
                        <p
                            v-if="summaries?.zodiac"
                            class="preview__summary"
                        >
                            {{ summaries.zodiac.summary }}
                        </p>
                        <v-spacer />
                        <v-btn
                            to="/full-report/zodiac"
                            variant="text"
                            color="primary"
                            append-icon="mdi-arrow-right"
                            class="align-self-start px-0"
                        >
                            看完整的星座分析
                        </v-btn>
                    </v-card-text>
                </v-card>
            </v-col>
            <v-col
                cols="12"
                sm="6"
            >
                <v-card
                    variant="outlined"
                    height="100%"
                    class="preview__card"
                    :style="{ '--tone': '#7a5aa6' }"
                >
                    <v-card-text class="d-flex flex-column ga-1 h-100">
                        <span class="preview__label">生命靈數</span>
                        <span class="preview__name">數字 {{ key.lifePath }}</span>
                        <p
                            v-if="summaries?.numerology"
                            class="preview__summary"
                        >
                            {{ summaries.numerology.summary }}
                        </p>
                        <v-spacer />
                        <v-btn
                            to="/full-report/numerology"
                            variant="text"
                            color="primary"
                            append-icon="mdi-arrow-right"
                            class="align-self-start px-0"
                        >
                            看完整的生命靈數
                        </v-btn>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>
    </section>
</template>

<script lang="ts" setup>
import { ZODIAC_LABELS } from '../../../shared/constants/zodiacLabels';

const props = defineProps<{
    /** The birth date as typed: empty, half filled in or complete */
    birthDate: string;
}>();

const { key, summaries } = useHomePreview(toRef(props, 'birthDate'));
</script>

<style scoped>
.preview__card {
    border-top: 3px solid var(--tone);
    animation: preview-in 0.35s ease backwards;
}

.preview__label {
    font-size: 0.8125rem;
    letter-spacing: 0.08em;
    color: rgba(var(--v-theme-on-surface), 0.6);
}

.preview__name {
    font-size: 1.375rem;
    font-weight: 700;
    color: var(--tone);
}

.preview__summary {
    margin: 4px 0 0;
    font-size: 0.9375rem;
    line-height: 1.7;
}

@keyframes preview-in {
    from {
        opacity: 0;
        transform: translateY(6px);
    }
}

@media (prefers-reduced-motion: reduce) {
    .preview__card {
        animation: none;
    }
}
</style>
