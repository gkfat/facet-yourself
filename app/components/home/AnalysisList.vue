<template>
    <div>
        <section
            v-for="group in groups"
            :key="group.key"
            class="group"
        >
            <div class="d-flex align-center ga-2">
                <v-icon
                    :icon="group.icon"
                    color="primary"
                    size="20"
                />
                <h3 class="group__title">
                    {{ group.title }}
                </h3>
            </div>
            <p class="group__purpose">
                目的：{{ group.purpose }}
            </p>
            <v-row>
                <v-col
                    v-for="analysis in group.items"
                    :key="analysis.key"
                    cols="12"
                    sm="6"
                    md="4"
                >
                    <HomeAnalysisCard :analysis="analysis" />
                </v-col>
            </v-row>
        </section>
    </div>
</template>

<script lang="ts" setup>
import type { Analysis } from '../../utils/homeAnalyses';

export type AnalysisGroup = {
    key: string;
    title: string;
    icon: string;
    /** What this kind of analysis is for */
    purpose: string;
    items: Analysis[];
};

defineProps<{
    /** Every analysis, by kind; a kind with nothing offered is left out */
    groups: AnalysisGroup[];
}>();
</script>

<style scoped>
.group + .group {
    margin-top: 28px;
    padding-top: 24px;
    border-top: 1px solid rgba(0, 0, 0, 0.08);
}

.group__title {
    margin: 0;
    font-size: 1.0625rem;
    font-weight: 700;
}

.group__purpose {
    margin: 2px 0 12px 28px;
    font-size: 0.875rem;
    color: rgba(var(--v-theme-on-surface), 0.6);
}
</style>
