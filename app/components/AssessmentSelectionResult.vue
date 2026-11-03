<template>
    <div>
        <!-- The overview: what was picked, and in which order -->
        <v-card
            variant="outlined"
            class="mb-4"
        >
            <v-card-title>你選出的 {{ selected.length }} 個價值</v-card-title>
            <v-card-text>
                <div class="text-subtitle-2 mb-2">
                    最重要的 {{ top.length }} 項，由左至右是第 1 到第 {{ top.length }} 名
                </div>
                <div class="d-flex flex-wrap ga-2 mb-4">
                    <v-chip
                        v-for="(id, index) in top"
                        :key="id"
                        size="large"
                        color="success"
                        variant="flat"
                        :prepend-icon="`mdi-numeric-${index + 1}-circle`"
                    >
                        {{ nameOf(id) }}
                    </v-chip>
                </div>
                <div class="text-subtitle-2 mb-2">
                    同樣被你選出的
                </div>
                <div class="d-flex flex-wrap ga-2">
                    <v-chip
                        v-for="id in others"
                        :key="id"
                        size="large"
                        variant="outlined"
                    >
                        {{ nameOf(id) }}
                    </v-chip>
                </div>
            </v-card-text>
        </v-card>

        <!-- What they add up to -->
        <v-card
            v-if="synthesis.portrait.length"
            variant="outlined"
            class="mb-4"
        >
            <v-card-title>綜合來看</v-card-title>
            <v-card-text>
                <blockquote class="quote">
                    <p
                        v-for="line in synthesis.portrait"
                        :key="line"
                        class="quote__text"
                    >
                        {{ line }}
                    </p>
                </blockquote>
                <template v-if="synthesis.tensions.length">
                    <div class="text-subtitle-1 font-weight-medium mt-4 mb-2">
                        你的價值之間可能的拉扯
                    </div>
                    <ul class="pl-5">
                        <li
                            v-for="line in synthesis.tensions"
                            :key="line"
                            class="mb-1"
                        >
                            {{ line }}
                        </li>
                    </ul>
                </template>
                <p class="text-body-2 text-medium-emphasis mt-4 mb-0">
                    價值沒有好壞高下；這份歸納只是幫你看見，是什麼讓你做出某些選擇。
                </p>
            </v-card-text>
        </v-card>

        <!-- Each value in one card: the picks of the first five, then the others -->
        <h2 class="text-h6 mb-2">
            每一項價值
        </h2>
        <v-card
            v-for="entry in entries"
            :key="entry.id"
            variant="outlined"
            class="mb-3"
        >
            <v-card-text>
                <div class="d-flex align-center ga-2 mb-2">
                    <v-chip
                        size="small"
                        :color="entry.rank > 0 ? 'success' : undefined"
                        :variant="entry.rank > 0 ? 'flat' : 'outlined'"
                    >
                        {{ entry.rank > 0 ? `第 ${entry.rank} 名` : '同樣選出' }}
                    </v-chip>
                    <span class="text-subtitle-1 font-weight-bold">{{ entry.body.title }}</span>
                </div>
                <p class="mb-2">
                    {{ entry.body.summary }}
                </p>
                <p
                    v-if="entry.body.dailyBehavior"
                    class="mb-2"
                >
                    <span class="text-medium-emphasis">在選擇中的樣子：</span>{{ entry.body.dailyBehavior }}
                </p>
                <p
                    v-if="entry.body.growthAdvice"
                    class="mb-2"
                >
                    <span class="text-medium-emphasis">與其他價值拉扯時：</span>{{ entry.body.growthAdvice }}
                </p>
                <p
                    v-if="entry.body.growthReflection"
                    class="mb-0"
                >
                    <span class="text-medium-emphasis">想一想：</span>{{ entry.body.growthReflection.reflectionQuestion }}
                </p>
            </v-card-text>
        </v-card>

        <p
            v-if="disclaimer"
            class="text-caption text-medium-emphasis mb-4"
        >
            {{ disclaimer }}
        </p>
    </div>
</template>

<script lang="ts" setup>
import type { AssessmentSynthesis } from '../../shared/assessments';
import type { AssessmentResult } from '../../shared/schemas/api/assessment.schema';

const props = defineProps<{
    /** What each option is called, by id */
    names: Readonly<Record<string, string>>;
    result: AssessmentResult;
    synthesis: AssessmentSynthesis;
}>();

const idsOf = (key: string): string[] => {
    const raw = props.result.result[key];

    return Array.isArray(raw) ? raw.filter((id): id is string => typeof id === 'string') : [];
};

const selected = computed(() => idsOf('selected'));
const top = computed(() => idsOf('top'));
const others = computed(() => selected.value.filter((id) => !top.value.includes(id)));
const nameOf = (id: string) => props.names[id] ?? id;

const PREFIX_LENGTH = props.result.assessmentId.length + 1;

/** The content of each value, the first five in their order, then the rest */
const entries = computed(() => [...top.value, ...others.value].flatMap((id) => {
    const body = props.result.content.find((item) => item.key.slice(PREFIX_LENGTH) === id);

    return body ? [{
        id, body, rank: top.value.indexOf(id) + 1,
    }] : [];
}));

const disclaimer = computed(() => props.result.content[0]?.disclaimer ?? '');
</script>

<style scoped>
.quote {
    margin: 0;
    padding: 16px 20px;
    border-left: 4px solid rgb(var(--v-theme-primary));
    border-radius: 0 8px 8px 0;
    background: rgba(var(--v-theme-primary), 0.06);
}

.quote__text {
    margin: 0 0 8px;
    line-height: 1.8;
}

.quote__text:last-child {
    margin-bottom: 0;
}
</style>
