<template>
    <v-card
        variant="outlined"
        class="mb-4"
    >
        <v-card-title>深入分析</v-card-title>
        <v-card-subtitle class="text-wrap">
            依這份報告的事實與歸納的面向，由 AI 深入解讀；也可以加選其他維度做綜合分析，並附上想問的事。
        </v-card-subtitle>
        <v-card-actions class="px-4 pb-4">
            <v-btn
                v-if="isAuthenticated"
                :to="`/report?systems=${system}`"
                color="primary"
                variant="flat"
                prepend-icon="mdi-creation-outline"
            >
                深入分析（{{ SINGLE_ANALYSIS_COST }} 點起）
            </v-btn>
            <v-btn
                v-else
                to="/login"
                variant="tonal"
                prepend-icon="mdi-login"
            >
                登入後深入分析
            </v-btn>
        </v-card-actions>
    </v-card>
</template>

<script lang="ts" setup>
import { SINGLE_ANALYSIS_COST } from '../../shared/constants/ai';

defineProps<{ system: string }>();

const { isAuthenticated } = useAuth();
</script>
