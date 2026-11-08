<template>
    <v-card
        variant="outlined"
        height="100%"
        class="analysis"
        :class="{ 'analysis--off': !analysis.ready }"
        :style="{ '--tone': analysis.tone }"
    >
        <v-card-text class="d-flex flex-column ga-2 h-100">
            <div class="d-flex align-center ga-2">
                <span class="analysis__icon">
                    <v-icon :icon="analysis.ready ? analysis.icon : 'mdi-lock-outline'" />
                </span>
                <span class="text-subtitle-1 font-weight-medium">{{ analysis.title }}</span>
            </div>
            <p class="text-body-2 mb-0">
                {{ analysis.description }}
            </p>
            <p class="analysis__need">
                <v-icon
                    icon="mdi-pencil-outline"
                    size="16"
                />
                {{ analysis.need }}
            </p>
            <v-spacer />
            <v-btn
                :color="analysis.ready ? 'primary' : undefined"
                :variant="analysis.ready ? 'flat' : 'tonal'"
                :disabled="!analysis.ready"
                :prepend-icon="analysis.icon"
                :to="analysis.ready ? analysis.to : undefined"
                class="align-self-start"
            >
                {{ analysis.ready ? analysis.action : analysis.lockedHint }}
            </v-btn>
        </v-card-text>
    </v-card>
</template>

<script lang="ts" setup>
import type { Analysis } from '../../utils/homeAnalyses';

defineProps<{ analysis: Analysis }>();
</script>

<style scoped>
/* An analysis card: lit in its own color when its data is there, quiet when it is not. */
.analysis {
    border-color: rgba(var(--v-theme-night), 0.12);
    border-left: 4px solid var(--tone);
}

.analysis--off {
    border-left-color: rgba(var(--v-theme-on-surface), 0.15);
    opacity: 0.75;
}

.analysis__icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    border-radius: 10px;
    color: var(--tone);
    background: color-mix(in srgb, var(--tone) 12%, white);
}

.analysis--off .analysis__icon {
    color: rgba(var(--v-theme-on-surface), 0.5);
    background: rgba(var(--v-theme-on-surface), 0.06);
}

.analysis__need {
    display: flex;
    align-items: center;
    gap: 4px;
    margin: 0;
    font-size: 0.875rem;
    color: rgba(var(--v-theme-night), 0.6);
}
</style>
