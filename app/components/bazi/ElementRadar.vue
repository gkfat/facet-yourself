<template>
    <div class="radar">
        <BaziTakeaway class="mb-4">
            <template v-if="strong">
                <v-chip
                    size="small"
                    variant="tonal"
                    prepend-icon="mdi-arrow-up-circle-outline"
                >
                    {{ strong }}偏旺
                </v-chip>
            </template>
            <v-chip
                v-for="name in missing"
                :key="name"
                size="small"
                variant="tonal"
                prepend-icon="mdi-minus-circle-outline"
            >
                缺{{ name }}
            </v-chip>
            <span
                v-if="!strong && missing.length === 0"
                class="text-body-2 text-medium-emphasis"
            >五行分布相對平均，沒有特別偏多或缺少。</span>
        </BaziTakeaway>
        <div class="radar__layout">
            <div class="radar__chart">
                <div class="d-flex justify-center mb-2">
                    <v-btn-toggle
                        v-model="mode"
                        density="compact"
                        variant="outlined"
                        divided
                        mandatory
                        color="primary"
                    >
                        <v-btn
                            value="generate"
                            size="small"
                        >
                            相生
                        </v-btn>
                        <v-btn
                            value="control"
                            size="small"
                        >
                            相剋
                        </v-btn>
                    </v-btn-toggle>
                </div>
                <svg
                    class="radar__svg"
                    viewBox="0 0 340 310"
                    role="img"
                    :aria-label="summary"
                >
                    <defs>
                        <marker
                            id="radar-arrow-generate"
                            viewBox="0 0 10 10"
                            refX="8"
                            refY="5"
                            markerWidth="7"
                            markerHeight="7"
                            orient="auto-start-reverse"
                        >
                            <path
                                d="M0 0 L10 5 L0 10 z"
                                class="radar__arrow radar__arrow--generate"
                            />
                        </marker>
                        <marker
                            id="radar-arrow-control"
                            viewBox="0 0 10 10"
                            refX="8"
                            refY="5"
                            markerWidth="7"
                            markerHeight="7"
                            orient="auto-start-reverse"
                        >
                            <path
                                d="M0 0 L10 5 L0 10 z"
                                class="radar__arrow radar__arrow--control"
                            />
                        </marker>
                    </defs>

                    <!-- The rings and the five axes -->
                    <polygon
                        v-for="ring in rings"
                        :key="ring"
                        :points="ringPoints(ring)"
                        class="radar__ring"
                    />
                    <line
                        v-for="node in nodes"
                        :key="`axis-${node.element}`"
                        :x1="CENTER_X"
                        :y1="CENTER_Y"
                        :x2="node.axis.x"
                        :y2="node.axis.y"
                        class="radar__axis"
                    />

                    <!-- 相生 runs round the pentagon in the order of the axes; 相剋 is the star inside it -->
                    <line
                        v-for="link in shownLinks"
                        :key="`link-${link.kind}-${link.from}`"
                        :x1="link.x1"
                        :y1="link.y1"
                        :x2="link.x2"
                        :y2="link.y2"
                        :class="['radar__link', `radar__link--${link.kind}`]"
                        :marker-end="`url(#radar-arrow-${link.kind})`"
                    />

                    <!-- This chart's own proportions -->
                    <polygon
                        :points="shapePoints"
                        class="radar__shape"
                    />
                    <circle
                        v-for="node in nodes"
                        :key="`dot-${node.element}`"
                        :cx="node.value.x"
                        :cy="node.value.y"
                        r="3.5"
                        class="radar__dot"
                    />

                    <!-- The element, its count and its share, at the end of each axis -->
                    <g
                        v-for="node in nodes"
                        :key="`label-${node.element}`"
                    >
                        <circle
                            :cx="node.label.x"
                            :cy="node.label.y"
                            r="15"
                            :fill="node.colors.fill"
                            :stroke="node.colors.border"
                            stroke-width="1.5"
                            :stroke-dasharray="node.count === 0 ? '3 2' : undefined"
                            :opacity="node.count === 0 ? 0.55 : 1"
                        />
                        <text
                            :x="node.label.x"
                            :y="node.label.y"
                            text-anchor="middle"
                            dominant-baseline="central"
                            class="radar__char"
                            :fill="node.colors.text"
                        >{{ node.name }}</text>
                        <text
                            :x="node.label.x"
                            :y="node.label.y + 29"
                            text-anchor="middle"
                            class="radar__sub"
                            :class="{ 'radar__sub--strong': node.dominant }"
                        >{{ node.count === 0 ? (node.hiddenOnly ? '僅藏干' : '缺') : `${node.count} 個` }}</text>
                    </g>
                </svg>
            </div>

            <!-- The same counts as bars, in the order of 相生 -->
            <div
                class="radar__bars"
                aria-label="五行比例，依相生順序"
            >
                <div
                    v-for="row in ranked"
                    :key="row.element"
                    class="bars__row"
                >
                    <span
                        class="bars__name"
                        :style="{
                            backgroundColor: row.colors.fill,
                            color: row.colors.text,
                            borderColor: row.colors.border,
                        }"
                    >{{ row.name }}</span>
                    <div
                        class="bars__track"
                        :class="{ 'bars__track--empty': row.count === 0 }"
                    >
                        <div
                            v-if="row.count > 0"
                            class="bars__fill"
                            :style="{
                                width: `${row.width}%`,
                                backgroundColor: row.colors.fill,
                                borderColor: row.colors.border,
                            }"
                        />
                    </div>
                    <span class="bars__value">{{ row.share }}%</span>
                </div>
            </div>
        </div>

        <ul class="radar__legend mt-3 mb-3">
            <li v-if="mode === 'generate'">
                <span class="radar__swatch radar__swatch--generate" />
                <span><strong>相生</strong>（實線箭頭）：{{ generateText }}。前一個是後一個的助力。</span>
            </li>
            <li v-else>
                <span class="radar__swatch radar__swatch--control" />
                <span><strong>相剋</strong>（虛線箭頭）：{{ controlText }}。前一個會約束後一個。</span>
            </li>
        </ul>

        <p class="text-caption text-medium-emphasis mt-2 mb-0">
            共 {{ total }} 個字，天干與地支（以主氣計）各算一個，沒有加權。偏旺或缺少只是傾向，不是好壞。
        </p>
    </div>
</template>

<script lang="ts" setup>
import {
    ELEMENTS,
    ELEMENT_COLORS,
    ELEMENT_CONTROLS,
    ELEMENT_GENERATES,
    ELEMENT_LABELS,
    type Element,
} from '../../../shared/constants/bazi';
import {
    dominantElement, missingElements,
} from '../../../shared/utils/bazi/analysis';

type Point = {
    x: number;
    y: number;
};

const props = defineProps<{
    counts: Record<Element, number>;
    /** The power with the hidden stems counted: an element at 0 is missing, one at 0 characters but above 0 is in a hidden stem only */
    power: Record<Element, number>;
}>();

const CENTER_X = 170;
const CENTER_Y = 150;
const RADIUS = 86;
const LABEL_RADIUS = 128;
/** The share of an edge the arrows leave clear at each end, so they do not run into the labels */
const LINK_MARGIN = 0.2;
const MIN_SCALE = 3;
const RINGS = [
    1 / 3,
    2 / 3,
    1,
];

// The axes run clockwise from the top in the order of 相生 (木火土金水)
const pointAt = (index: number, radius: number): Point => {
    const angle = ((-90 + index * 72) * Math.PI) / 180;

    return {
        x: CENTER_X + radius * Math.cos(angle),
        y: CENTER_Y + radius * Math.sin(angle),
    };
};

const rings = RINGS;
const mode = ref<'generate' | 'control'>('generate');

const total = computed(() => ELEMENTS.reduce((sum, element) => sum + props.counts[element], 0));
const scale = computed(() => Math.max(MIN_SCALE, ...ELEMENTS.map((element) => props.counts[element])));
const top = computed(() => dominantElement(props.counts));
const strong = computed(() => (top.value ? ELEMENT_LABELS[top.value] : ''));
const missing = computed(() => missingElements(props.power).map((element) => ELEMENT_LABELS[element]));

const nodes = computed(() => ELEMENTS.map((element, index) => {
    const count = props.counts[element];

    return {
        element,
        name: ELEMENT_LABELS[element],
        colors: ELEMENT_COLORS[element],
        count,
        dominant: top.value === element,
        hiddenOnly: count === 0 && props.power[element] > 0,
        axis: pointAt(index, RADIUS),
        value: pointAt(index, (count / scale.value) * RADIUS),
        label: pointAt(index, LABEL_RADIUS),
    };
}));

/** The bars keep the order of 相生 (木火土金水), as the axes of the chart do */
const ranked = computed(() => nodes.value
    .map((node) => ({
        element: node.element,
        name: node.name,
        colors: node.colors,
        count: node.count,
        share: total.value > 0 ? Number(((node.count / total.value) * 100).toFixed(1)) : 0,
        width: (node.count / scale.value) * 100,
    })));

const points = (list: Point[]) => list.map((point) => `${point.x.toFixed(1)},${point.y.toFixed(1)}`).join(' ');
const ringPoints = (ratio: number) => points(ELEMENTS.map((_element, index) => pointAt(index, RADIUS * ratio)));
const shapePoints = computed(() => points(nodes.value.map((node) => node.value)));

/** The arrows of both relations, drawn from one axis end to the other and shortened at both ends */
const links = computed(() => {
    const relations = [
        {
            kind: 'generate', target: ELEMENT_GENERATES,
        },
        {
            kind: 'control', target: ELEMENT_CONTROLS,
        },
    ] as const;

    return relations.flatMap(({
        kind, target,
    }) => ELEMENTS.map((element, index) => {
        const from = pointAt(index, RADIUS);
        const to = pointAt(ELEMENTS.indexOf(target[element]), RADIUS);

        return {
            kind,
            from: element,
            x1: from.x + (to.x - from.x) * LINK_MARGIN,
            y1: from.y + (to.y - from.y) * LINK_MARGIN,
            x2: to.x - (to.x - from.x) * LINK_MARGIN,
            y2: to.y - (to.y - from.y) * LINK_MARGIN,
        };
    }));
});

const shownLinks = computed(() => links.value.filter((link) => link.kind === mode.value));

const relationText = (relation: Record<Element, Element>, verb: string) => ELEMENTS.map((element) => `${ELEMENT_LABELS[element]}${verb}${ELEMENT_LABELS[relation[element]]}`).join('、');
const generateText = relationText(ELEMENT_GENERATES, '生');
const controlText = relationText(ELEMENT_CONTROLS, '剋');

const summary = computed(() => `五行雷達圖：${ELEMENTS.map((element) => `${ELEMENT_LABELS[element]} ${props.counts[element]} 個`).join('、')}`);
</script>

<style scoped>
.radar__layout {
    display: grid;
    align-items: center;
    gap: 16px 24px;
}

@media (min-width: 760px) {
    .radar__layout {
        grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
    }
}

.radar__bars {
    display: grid;
    gap: 10px;
}

.bars__row {
    display: flex;
    align-items: center;
    gap: 8px;
}

.bars__name {
    display: inline-flex;
    flex: none;
    align-items: center;
    justify-content: center;
    width: 2rem;
    height: 2rem;
    border: 1px solid;
    border-radius: 8px;
    font-weight: 700;
}

.bars__track {
    flex: 1;
    min-width: 0;
    height: 18px;
    border-radius: 6px;
    background: rgba(var(--v-theme-on-surface), 0.06);
}

.bars__track--empty {
    border: 2px dashed rgba(var(--v-theme-on-surface), 0.35);
    background: transparent;
}

.bars__fill {
    height: 100%;
    border: 1px solid;
    border-radius: 6px;
}

.bars__value {
    min-width: 3.4em;
    text-align: right;
    font-weight: 700;
    font-variant-numeric: tabular-nums;
}

.radar__svg {
    display: block;
    width: 100%;
    max-width: 380px;
    margin-inline: auto;
}

.radar__ring,
.radar__axis {
    fill: none;
    stroke: rgba(var(--v-theme-on-surface), 0.16);
    stroke-width: 1;
}

.radar__shape {
    fill: rgba(var(--v-theme-primary), 0.22);
    stroke: rgb(var(--v-theme-primary));
    stroke-width: 2;
    stroke-linejoin: round;
}

.radar__dot {
    fill: rgb(var(--v-theme-primary));
}

.radar__link {
    stroke-width: 1.6;
}

.radar__legend {
    display: grid;
    gap: 6px;
    padding: 0;
    list-style: none;
    font-size: 0.875rem;
}

.radar__legend li {
    display: flex;
    align-items: baseline;
    gap: 8px;
}

.radar__swatch {
    flex: none;
    width: 22px;
    height: 0;
    border-top: 2px solid;
    transform: translateY(-3px);
}

.radar__swatch--generate {
    border-color: rgb(var(--v-theme-success));
}

.radar__swatch--control {
    border-top-style: dashed;
    border-color: rgb(var(--v-theme-error));
}


.radar__link--generate {
    stroke: rgb(var(--v-theme-success));
}

.radar__link--control {
    stroke: rgb(var(--v-theme-error));
    stroke-dasharray: 5 4;
}

.radar__arrow--generate {
    fill: rgb(var(--v-theme-success));
}

.radar__arrow--control {
    fill: rgb(var(--v-theme-error));
}

.radar__char {
    font-size: 15px;
    font-weight: 700;
}

.radar__sub {
    font-size: 11.5px;
    fill: rgba(var(--v-theme-on-surface), 0.7);
}

.radar__sub--strong {
    font-weight: 700;
    fill: rgb(var(--v-theme-primary));
}
</style>
