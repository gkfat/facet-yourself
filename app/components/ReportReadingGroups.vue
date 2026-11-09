<template>
    <!-- Readings that belong together, each group under a heading of its own -->
    <div
        v-for="group in groups"
        :key="group.title"
        class="mt-6"
    >
        <div class="text-subtitle-1 font-weight-medium mb-1">
            {{ group.title }}
        </div>
        <!-- What the group reads, when the report says so -->
        <p
            v-if="notes?.[group.title]"
            class="text-caption text-medium-emphasis mb-2"
        >
            {{ notes[group.title] }}
        </p>
        <!-- The keywords of a draw are chips, not cards -->
        <template v-if="group.title === KEYWORD_GROUP">
            <v-chip
                v-for="word in group.readings.flatMap((reading) => reading.text.split('、'))"
                :key="word"
                class="mr-2 mb-2"
                variant="tonal"
                color="primary"
            >
                {{ word }}
            </v-chip>
        </template>
        <v-row
            v-else
            dense
        >
            <v-col
                v-for="(reading, index) in group.readings"
                :key="`${group.title}-${index}`"
                cols="12"
                :md="threeAcross(group.readings.length) ? 4 : 6"
            >
                <v-card
                    variant="outlined"
                    height="100%"
                >
                    <v-card-text>
                        <div class="text-subtitle-1 font-weight-bold mb-1">
                            {{ reading.title }}
                        </div>
                        <template
                            v-for="(part, partIndex) in partsOf(reading.text)"
                            :key="`${group.title}-${index}-${partIndex}`"
                        >
                            <p
                                v-if="!part.label"
                                class="text-body-2 mb-0 lines"
                            >
                                {{ part.plain }}
                            </p>
                            <!-- The strengths and blind spots of a reading: a small label over a list, one item to a line -->
                            <div
                                v-else
                                class="mt-3"
                            >
                                <div class="text-caption font-weight-bold text-medium-emphasis">
                                    {{ part.label }}
                                </div>
                                <ul class="pl-5 text-body-2">
                                    <li
                                        v-for="item in part.items"
                                        :key="item"
                                    >
                                        {{ item }}
                                    </li>
                                </ul>
                            </div>
                        </template>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>
    </div>
</template>

<script lang="ts" setup>
defineProps<{
    groups: Array<{
        title: string;
        readings: Array<{ title: string; text: string }>;
    }>;
    /** A line under the heading of a group, by its title: what the group is about */
    notes?: Record<string, string>;
}>();

const LISTED = /^(可能的優勢|可能的盲點)：(.*)$/;

type Part = { label?: string; items?: string[]; plain?: string };

/**
 * A reading is lines. A line that opens "可能的優勢：" or "可能的盲點：" is listed, its items (cut at "；") one under the
 * other; any other line is a paragraph.
 */
function partsOf(text: string): Part[] {
    return text.split('\n').flatMap((line): Part[] => {
        const listed = LISTED.exec(line);

        if (listed) {
            return [
                {
                    label: listed[1], items: (listed[2] ?? '').split('；').map((item) => item.trim()).filter((item) => item !== ''),
                },
            ];
        }

        return line.trim() === '' ? [] : [{ plain: line }];
    });
}

/** Three cards fit a row, and so do a long list of them (the centers, the channels); two or four go two across */
const threeAcross = (count: number): boolean => count === 3 || count >= 5;

/** The group of keywords of a draw, shown as chips (the adapters of the draws title the group the same) */
const KEYWORD_GROUP = '關鍵字';
</script>

<style scoped>
.lines {
    white-space: pre-line;
}
</style>
