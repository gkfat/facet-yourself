<template>
    <div>
        <!-- The report in three lines, ahead of everything: the core traits, what to watch for, where to start -->
        <v-card
            v-if="keypoints.length"
            variant="outlined"
            class="mb-4"
        >
            <v-card-title>{{ blockTitle('keypoints') }}</v-card-title>
            <v-card-text>
                <v-row dense>
                    <v-col
                        v-for="point in keypoints"
                        :key="point.label"
                        cols="12"
                        md="4"
                    >
                        <v-card
                            variant="outlined"
                            height="100%"
                            :class="['keypoint', `keypoint--${point.tone}`]"
                        >
                            <v-card-text>
                                <div class="text-caption text-medium-emphasis mb-1">
                                    {{ point.label }}
                                </div>
                                <p class="text-body-1 mb-0 lines">
                                    {{ point.text }}
                                </p>
                            </v-card-text>
                        </v-card>
                    </v-col>
                </v-row>
            </v-card-text>
        </v-card>

        <v-card
            v-if="overview.length"
            variant="outlined"
            class="mb-4"
        >
            <v-card-title>{{ blockTitle('overview') }}</v-card-title>
            <v-card-text>
                <!-- What the tradition says of the result as a whole: a quote on a row of its own -->
                <blockquote
                    v-if="overviewLead"
                    class="lead"
                >
                    <div class="text-subtitle-1 font-weight-medium mb-1">
                        {{ overviewLead.title }}
                    </div>
                    <p class="lead__text">
                        {{ splitLead(overviewLead.text).rest }}
                    </p>
                </blockquote>

                <!-- The traits the facts point at, ahead of the readings -->
                <SingleReportSummary
                    v-if="facetCards.length"
                    class="mb-4"
                    :facet-cards="facetCards"
                    :other-summary="[]"
                />

                <v-row dense>
                    <v-col
                        v-for="(reading, index) in overviewRest"
                        :key="`overview-${index}`"
                        cols="12"
                        md="6"
                    >
                        <v-card
                            variant="outlined"
                            height="100%"
                        >
                            <v-card-text>
                                <div class="text-subtitle-1 font-weight-bold mb-1">
                                    {{ reading.title }}
                                </div>
                                <p class="text-body-2 mb-0">
                                    {{ reading.text }}
                                </p>
                            </v-card-text>
                        </v-card>
                    </v-col>
                </v-row>
            </v-card-text>
        </v-card>

        <!-- What the traits say together, right after the traits themselves -->
        <v-card
            v-if="interactions.length"
            variant="outlined"
            class="mb-4"
        >
            <v-card-title>{{ blockTitle('synthesis') }}</v-card-title>
            <v-card-text>
                <SingleReportSummary
                    :facet-cards="[]"
                    :other-summary="[]"
                    :groups="[{ key: 'synthesis', title: '', items: interactions }]"
                />
            </v-card-text>
        </v-card>

        <!-- What the chart says, as a card of its own after the overview: the key words of each placement, then the houses and the aspects -->
        <v-card
            v-if="overview.length && (highlightBlocks.length || otherSummary.length || inferenceGroups.length)"
            variant="outlined"
            class="mb-4"
        >
            <v-card-title>星盤歸納</v-card-title>
            <v-card-text>
                <SingleReportHighlights
                    v-if="highlightBlocks.length"
                    :blocks="highlightBlocks"
                />

                <!-- What else the facts say together (the houses, the aspects) -->
                <div
                    v-if="otherSummary.length || inferenceGroups.length"
                    :class="highlightBlocks.length ? 'mt-2' : ''"
                >
                    <SingleReportSummary
                        :facet-cards="[]"
                        :other-summary="otherSummary"
                        :groups="inferenceGroups"
                    />
                </div>
            </v-card-text>
        </v-card>

        <!-- The four pairs of MBTI, as the two-pole scales of the test page; they take the place of the facts card -->
        <v-card
            v-if="mbtiDimensions"
            variant="outlined"
            class="mb-4"
        >
            <v-card-title>你在四組偏好上的傾向</v-card-title>
            <v-card-text>
                <MbtiDimensionStrength
                    :dimensions="mbtiDimensions"
                    bare
                />
            </v-card-text>
        </v-card>

        <v-card
            v-if="showFacts"
            variant="outlined"
            class="mb-4"
        >
            <v-card-title>{{ blockTitle('facts') }}</v-card-title>
            <v-card-text>
                <!-- The theme of the day, quoted, ahead of the facts of the draw -->
                <blockquote
                    v-if="leadText"
                    class="lead"
                >
                    <p class="lead__text">
                        {{ leadText }}
                    </p>
                </blockquote>

                <v-row dense>
                    <v-col
                        v-for="(fact, index) in factCards"
                        :key="`fact-${index}`"
                        cols="12"
                        sm="6"
                        md="4"
                    >
                        <v-card
                            variant="outlined"
                            height="100%"
                        >
                            <v-card-text>
                                <div class="text-caption text-medium-emphasis">
                                    {{ fact.label }}
                                </div>
                                <div class="text-body-1 font-weight-medium">
                                    {{ fact.title }}
                                </div>
                                <div
                                    v-if="fact.subtitle"
                                    class="text-body-2 text-medium-emphasis"
                                >
                                    {{ fact.subtitle }}
                                </div>
                                <p
                                    v-if="fact.reading"
                                    class="text-body-2 text-medium-emphasis mt-2 mb-0"
                                >
                                    {{ fact.reading }}
                                </p>
                            </v-card-text>
                        </v-card>
                    </v-col>
                </v-row>

                <div
                    v-if="readings.length"
                    class="mt-6"
                >
                    <v-row dense>
                        <v-col
                            v-for="(reading, index) in readings"
                            :key="`reading-${index}`"
                            cols="12"
                            md="6"
                        >
                            <v-card
                                variant="outlined"
                                height="100%"
                            >
                                <v-card-text>
                                    <div class="text-subtitle-1 font-weight-bold mb-1">
                                        {{ reading.title }}
                                    </div>
                                    <p class="text-body-2 mb-0">
                                        {{ reading.text }}
                                    </p>
                                </v-card-text>
                            </v-card>
                        </v-col>
                    </v-row>
                </div>

                <ReportReadingGroups :groups="readingGroups" />
            </v-card-text>
        </v-card>

        <NatalChartLocked v-if="natalLocked && !natalChart" />

        <NatalChartPanel
            v-if="natalChart"
            :chart="natalChart"
            :readings="readingsByFact"
        />

        <v-card
            v-if="(summary.length || inferenceGroups.length) && !overview.length"
            variant="outlined"
            class="mb-4"
        >
            <v-card-title>{{ blockTitle('summary') }}</v-card-title>
            <v-card-text>
                <SingleReportSummary
                    :facet-cards="facetCards"
                    :other-summary="otherSummary"
                    :groups="inferenceGroups"
                />
            </v-card-text>
        </v-card>

        <!-- How each trait can show in different times, toward different people and in different parts of life: all of it, one trait after another -->
        <v-card
            v-if="impactGroups.length"
            variant="outlined"
            class="mb-4"
        >
            <v-card-title>影響面向推測</v-card-title>
            <v-card-text>
                <div
                    v-for="(group, groupIndex) in impactGroups"
                    :key="group.kind"
                    :class="{ 'mt-6': groupIndex > 0 }"
                >
                    <div class="text-subtitle-1 font-weight-medium mb-2">
                        {{ group.label }}
                    </div>
                    <v-row dense>
                        <v-col
                            v-for="card in group.cards"
                            :key="card.context"
                            cols="12"
                            md="6"
                        >
                            <v-card
                                variant="outlined"
                                height="100%"
                            >
                                <v-card-text>
                                    <div class="text-subtitle-1 font-weight-bold mb-1">
                                        {{ card.name }}
                                    </div>
                                    <p class="text-body-2 mb-0">
                                        {{ card.text }}
                                    </p>
                                </v-card-text>
                            </v-card>
                        </v-col>
                    </v-row>
                </div>
            </v-card-text>
        </v-card>

        <!-- What moves with time (the luck steps, the year), in one card after the map of effects, each kind under its own heading -->
        <v-card
            v-if="timeBlocks.length || baziChart"
            variant="outlined"
            class="mb-4"
        >
            <v-card-title>大運與流年</v-card-title>
            <v-card-text>
                <!-- The luck steps with the years of each, when there is a chart to draw them from -->
                <div
                    v-if="baziChart"
                    class="mb-6"
                >
                    <BaziLuckTimeline
                        v-if="baziChart.luck && baziChart.flowYears"
                        :luck="baziChart.luck"
                        :flow-years="baziChart.flowYears"
                    />
                    <template v-else>
                        <p class="text-body-2 mb-3">
                            {{ luckHint }}
                        </p>
                        <v-btn
                            v-if="baziChart.luckStatus === 'NEEDS_GENDER'"
                            to="/profile"
                            size="small"
                            color="primary"
                            variant="tonal"
                        >
                            到「我的資料」提供性別
                        </v-btn>
                    </template>
                </div>

                <div
                    v-for="(item, blockIndex) in timeBlocks"
                    :key="item.key"
                    :class="blockIndex > 0 ? 'mt-6' : ''"
                >
                    <div
                        v-if="item.title"
                        class="text-subtitle-1 font-weight-medium mb-2"
                    >
                        {{ item.title }}
                    </div>
                    <v-row dense>
                        <v-col
                            v-for="(card, index) in item.cards"
                            :key="`${item.key}-${index}`"
                            cols="12"
                            :md="card.reading ? 12 : 6"
                        >
                            <v-card
                                variant="outlined"
                                height="100%"
                            >
                                <v-card-text>
                                    <div
                                        v-if="card.label"
                                        :class="card.reading ? 'text-subtitle-1 font-weight-bold mb-1' : 'text-caption text-medium-emphasis'"
                                    >
                                        {{ card.label }}
                                    </div>
                                    <div :class="card.reading ? 'text-body-2' : 'text-body-1 font-weight-medium'">
                                        {{ card.value }}
                                    </div>
                                </v-card-text>
                            </v-card>
                        </v-col>
                    </v-row>
                </div>
                <p
                    v-if="timeAsOf"
                    class="text-caption text-medium-emphasis mt-3 mb-0"
                >
                    以 {{ timeAsOf }} 算出，日期不同，結果也會不同。
                </p>
            </v-card-text>
        </v-card>

        <ReportAdviceCard
            :title="blockTitle('advice')"
            :advice="advice.map((segment) => segment.text)"
        />

        <!-- The people born on the same day: the last card of the report, said by the note to have nothing to do with the traits -->
        <v-card
            v-if="figureCards.length"
            variant="outlined"
            class="mb-4"
        >
            <v-card-title>{{ blockTitle('figures') }}</v-card-title>
            <v-card-text>
                <v-row dense>
                    <v-col
                        v-for="figure in figureCards"
                        :key="figure.name"
                        cols="12"
                        md="4"
                    >
                        <v-card
                            variant="outlined"
                            height="100%"
                        >
                            <v-card-text>
                                <div class="text-subtitle-1 font-weight-bold">
                                    {{ figure.name }}
                                </div>
                                <div class="text-body-2 text-medium-emphasis">
                                    {{ figure.nameEn }}
                                </div>
                                <div class="text-caption text-medium-emphasis mb-2">
                                    {{ figure.born }}
                                </div>
                                <p class="text-body-2 mb-0">
                                    {{ figure.role }}
                                </p>
                            </v-card-text>
                        </v-card>
                    </v-col>
                </v-row>
                <p
                    v-if="figureNote"
                    class="text-caption text-medium-emphasis mt-3 mb-0"
                >
                    {{ figureNote }}
                </p>
            </v-card-text>
        </v-card>
    </div>
</template>

<script lang="ts" setup>
import type { BaziResponse } from '../../shared/schemas/api/bazi.schema';
import type { DimensionScore } from '../../shared/utils/personalityScoring';
import type { NatalChartResponse } from '../../shared/schemas/api/natalChart.schema';
import { NATAL_LABELS } from '../../shared/constants/natalLabels';
import { impactCards } from '../utils/impactCards';
import { splitLead } from '../utils/overviewLead';
import { parseSummary } from '../utils/summaryFacets';
import type { SingleReportResponse } from '../../shared/schemas/api/singleReport.schema';

const props = defineProps<{
    report: SingleReportResponse;
    /** The birth chart, when there is one to draw: the houses and the aspects are then shown with it instead of as lines */
    natalChart?: NatalChartResponse | null;
    /** The chart cannot be drawn yet: it waits for a birth time and a city */
    natalLocked?: boolean;
    /** The BaZi chart, when there is one: its luck steps and years are drawn in the card of what moves with time */
    baziChart?: BaziResponse | null;
    /** The scores of the four MBTI pairs: when there are some, the pairs are drawn as the two-pole scales instead of as facts */
    mbtiDimensions?: Record<string, DimensionScore> | null;
}>();

const segmentsOf = (key: string) => props.report.blocks.find((block) => block.key === key)?.segments ?? [];
const blockTitle = (key: string) => props.report.blocks.find((block) => block.key === key)?.title ?? '';

/** "太陽星座：天蠍座" -> a label and a value; text without a colon is all value. */
function splitLabel(text: string): { label: string; value: string } {
    const at = text.indexOf('：');

    return at < 0
        ? {
            label: '', value: text,
        }
        : {
            label: text.slice(0, at), value: text.slice(at + 1),
        };
}

/** The readings that belong to a fact, by the label of that fact: "太陽在天蠍座：…" is shown in the card of the sun sign */
const readingsByFact = computed(() => {
    const byFact: Record<string, string[]> = {};

    for (const segment of segmentsOf('facts')) {
        if (segment.kind !== 'SYSTEM_INTERPRETATION') continue;

        const text = splitLabel(/^【.+?】(.*)$/s.exec(segment.text)?.[1] ?? segment.text).value;

        for (const source of segment.sources) {
            if (source.fact) (byFact[source.fact] ??= []).push(text);
        }
    }

    return Object.fromEntries(Object.entries(byFact).map(([label, lines]) => [label, lines.join('\n')]));
});

/** What the chart panel shows (the houses and the aspects) is not listed again among the facts */
const PLACEMENT_LABELS = new Set(Object.values(NATAL_LABELS).map((item) => item.name));
const isChartFact = (label: string) => props.natalChart != null && (/^第 \d+ 宮/.test(label) || label.startsWith('相位・') || PLACEMENT_LABELS.has(label));

const factCards = computed(() => segmentsOf('facts').filter((segment) => segment.kind === 'FACT').filter((segment) => !isChartFact(splitLabel(segment.text).label)).map((segment) => {
    const { label, value } = splitLabel(segment.text);

    // A second line in the value is the subtitle (the English name of a card)
    const [title = '', ...subtitle] = value.split('\n');

    return {
        label, title, subtitle: subtitle.join(' '), reading: readingsByFact.value[label] ?? '',
    };
}));

/** A reading sentence "【依傳統占星】天蠍座：…" as the tradition, the title and the text */
const readingsOf = (key: string) => segmentsOf(key).filter((segment) => segment.kind === 'SYSTEM_INTERPRETATION' && !segment.sources.some((source) => source.fact)).map((segment) => {
    const match = /^【(.+?)】(.*)$/s.exec(segment.text);
    const { label, value } = splitLabel(match?.[2] ?? segment.text);

    return {
        tradition: match?.[1] ?? '', title: label, text: value,
    };
});

const readings = computed(() => readingsOf('facts'));

/** The people of the same birthday: "姓名（English）：1879 年生・身分" as the names, the year and the role; the last sentence is the note */
const figureSegments = computed(() => segmentsOf('figures'));
const figureNote = computed(() => figureSegments.value.at(-1)?.text ?? '');
const figureCards = computed(() => figureSegments.value.slice(0, -1).map((segment) => {
    const { label, value } = splitLabel(segment.text);
    const [born = '', ...role] = value.split('・');
    const [, name = label, nameEn = ''] = /^(.*)（([^（）]*)）$/.exec(label) ?? [];

    return {
        name, nameEn, born, role: role.join('・'),
    };
}));

/** The quote at the head of the overview of a draw: the words after its title */
const leadText = computed(() => readingsOf('lead')[0]?.text ?? '');

/** The readings that come in groups, one block for each group */
const readingGroups = computed(() => props.report.blocks.filter((block) => block.key.startsWith('readings:')).map((block) => ({
    key: block.key, title: block.title, readings: readingsOf(block.key),
})));
const overview = computed(() => readingsOf('overview'));
const overviewLead = computed(() => overview.value[0] ?? null);
const overviewRest = computed(() => overview.value.slice(1));

/** The system of the report, as its position block names it */
const reportSystem = computed(() => segmentsOf('position')[0]?.sources.find((source) => source.system)?.system);

/** A blood type is its own report: the one fact is the type, which the page already says, so it is not shown as a card of its own */
const factIsTheResult = computed(() => reportSystem.value === 'BLOOD');

/**
 * The facts are listed unless they add nothing to what is shown elsewhere: with an overview and the chart (or its
 * invitation) in place, the sun sign is the only fact left and its reading is in the sun's house.
 */
const showFacts = computed(() => !props.mbtiDimensions && !(overview.value.length > 0 && factCards.value.length <= 1 && readings.value.length === 0 && readingGroups.value.length === 0 && (props.natalChart != null || props.natalLocked === true || factIsTheResult.value)));

/** What a BaZi chart without luck says: the luck needs a gender and a birth time */
const luckHint = computed(() => (props.baziChart?.luckStatus === 'NEEDS_GENDER'
    ? '提供性別後可看大運。性別只用來決定大運的排法（男命與女命的順逆不同），不會用在其他地方，也可以選擇不提供。'
    : '大運的起運要用到精確的出生時刻，所以需要出生時間。'));

/** What depends on the date, as "label：words": a block for each kind (大運, 流年), the reading of a step after the facts */
const timeBlocks = computed(() => props.report.blocks.filter((block) => block.key === 'time' || block.key.startsWith('time:')).map((block) => ({
    key: block.key,
    title: block.key === 'time' ? '' : block.title,
    cards: block.segments.map((segment) => {
        const { label, value } = splitLabel(/^【.+?】(.*)$/s.exec(segment.text)?.[1] ?? segment.text);

        return {
            label, value, reading: segment.kind === 'SYSTEM_INTERPRETATION',
        };
    }).sort((a, b) => Number(a.reading) - Number(b.reading)),
})));

/** The date the time-sensitive facts were made for */
const timeAsOf = computed(() => props.report.blocks.filter((block) => block.key === 'time' || block.key.startsWith('time:')).flatMap((block) => block.segments).find((segment) => segment.asOf)?.asOf ?? '');
const summary = computed(() => segmentsOf('summary').map((segment) => segment.text));

const parsedSummary = computed(() => parseSummary(summary.value));

const facetCards = computed(() => parsedSummary.value.facets);
const otherSummary = computed(() => parsedSummary.value.others);

/** Conclusions drawn from the facts together that have a heading of their own (the houses, the aspects) */
const allGroups = computed(() => props.report.blocks.filter((block) => block.key.startsWith('inference:')).map((block) => ({
    key: block.key, title: block.title, items: block.segments.map((segment) => segment.text),
})));

/** The key words of each group of planets come first, right under the overview; the other conclusions follow the traits */
const isHighlight = (key: string) => key.startsWith('inference:planets-');
const highlightBlocks = computed(() => props.report.blocks.filter((block) => isHighlight(block.key)));
const inferenceGroups = computed(() => allGroups.value.filter((group) => !isHighlight(group.key)));
const advice = computed(() => segmentsOf('advice'));

/** What the traits say together: each a title and what it can mean, with the question that checks it */
const interactions = computed(() => segmentsOf('synthesis').map((segment) => segment.text));

/** The three key points, each "label：words", the color of each by what it is */
const KEYPOINT_TONES = ['core', 'caution', 'start'] as const;
const keypoints = computed(() => segmentsOf('keypoints').map((segment, index) => {
    const { label, value } = splitLabel(segment.text);

    return {
        label, text: value, tone: KEYPOINT_TONES[index] ?? 'core',
    };
}));


/** The map of effects by who or what it is about: one card for each, with every trait put together */
const impactGroups = computed(() => impactCards(props.report.blocks));

</script>

<style scoped>
.lines {
    white-space: pre-line;
}

.keypoint {
    border-top-width: 4px;
    border-top-color: rgb(var(--keypoint-accent));
    background: rgba(var(--keypoint-accent), 0.07);
}

/* One color for each key point: green for what is core, amber for what to watch, blue for where to start */
.keypoint--core {
    --keypoint-accent: 46, 125, 91;
}

.keypoint--caution {
    --keypoint-accent: 183, 121, 31;
}

.keypoint--start {
    --keypoint-accent: 47, 93, 138;
}

.lead {
    margin: 0 0 16px;
    padding: 16px 20px;
    border-left: 4px solid rgb(var(--v-theme-primary));
    border-radius: 0 8px 8px 0;
    background: rgba(var(--v-theme-primary), 0.06);
}

.lead__text {
    margin: 0;
    font-size: 1rem;
    line-height: 1.8;
}
</style>
