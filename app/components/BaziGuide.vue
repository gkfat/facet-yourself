<template>
    <div class="guide">
        <v-btn
            size="small"
            variant="text"
            color="primary"
            prepend-icon="mdi-help-circle-outline"
            @click="open = true"
        >
            八字怎麼看
        </v-btn>

        <v-dialog
            v-model="open"
            max-width="560"
            scrollable
        >
            <v-card>
                <v-card-title>八字怎麼看？照這四步看就好</v-card-title>
                <v-card-text>
                    <p class="text-body-2 mb-3">
                        報告分兩區：「命盤資料」是算出來的結果，「命理解讀」是傳統對這些結果的說法。先看資料，再看解讀。命盤資料的圖卡上標了「第 1 到 4 步」，照順序看就好，標「補充」的是之後再看。
                    </p>
                    <ol class="guide__steps">
                        <li
                            v-for="step in BAZI_READING_STEPS"
                            :key="step.title"
                        >
                            <strong>{{ step.title }}</strong>
                            <p class="text-body-2 text-medium-emphasis mb-0">
                                {{ step.text }}
                            </p>
                        </li>
                    </ol>
                    <p class="text-caption text-medium-emphasis mt-4 mb-0">
                        八字是依曆法與固定規則排出的文化資訊，解讀僅供娛樂與自我探索，不預測吉凶。
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
import { BAZI_READING_STEPS } from '../../shared/constants/baziLabels';

const open = ref(false);
</script>

<style scoped>
.guide__steps {
    display: grid;
    gap: 12px;
    padding-inline-start: 1.25rem;
}
</style>
