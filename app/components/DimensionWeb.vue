<template>
    <div class="web">
        <svg
            :viewBox="`0 0 ${SIZE} ${SIZE}`"
            class="web__svg"
            role="img"
            :aria-label="label"
        >
            <defs>
                <radialGradient id="web-nebula">
                    <stop
                        offset="0%"
                        class="web__glow-core"
                    />
                    <stop
                        offset="100%"
                        class="web__glow-edge"
                    />
                </radialGradient>
            </defs>

            <!-- A faint nebula behind the web: it drifts whether or not anything is chosen -->
            <circle
                :cx="CENTER"
                :cy="CENTER"
                :r="RADIUS"
                fill="url(#web-nebula)"
            />
            <g class="web__orbit web__orbit--slow">
                <circle
                    :cx="CENTER"
                    :cy="CENTER"
                    :r="RADIUS * 0.78"
                    class="web__orbit-ring"
                />
                <circle
                    v-for="dust in INNER_DUST"
                    :key="dust.angle"
                    :cx="CENTER + RADIUS * 0.78 * Math.cos(dust.angle)"
                    :cy="CENTER + RADIUS * 0.78 * Math.sin(dust.angle)"
                    :r="dust.size"
                    class="web__dust"
                />
            </g>
            <g class="web__orbit web__orbit--reverse">
                <circle
                    :cx="CENTER"
                    :cy="CENTER"
                    :r="RADIUS * 1.12"
                    class="web__orbit-ring web__orbit-ring--dashed"
                />
                <circle
                    v-for="dust in OUTER_DUST"
                    :key="dust.angle"
                    :cx="CENTER + RADIUS * 1.12 * Math.cos(dust.angle)"
                    :cy="CENTER + RADIUS * 1.12 * Math.sin(dust.angle)"
                    :r="dust.size"
                    class="web__dust"
                />
            </g>

            <circle
                :cx="CENTER"
                :cy="CENTER"
                :r="RADIUS"
                class="web__ring"
            />

            <!-- Every chosen dimension is joined to every other one: the more there are, the denser the web -->
            <line
                v-for="pair in pairs"
                :key="pair.key"
                :x1="pair.a.x"
                :y1="pair.a.y"
                :x2="pair.b.x"
                :y2="pair.b.y"
                class="web__line"
            />

            <g
                v-for="node in nodes"
                :key="node.value"
            >
                <circle
                    :cx="node.x"
                    :cy="node.y"
                    :r="7 * node.scale"
                    :style="{ fill: node.tone }"
                    class="web__dot"
                />
                <text
                    :x="node.lx"
                    :y="node.ly"
                    :opacity="node.scale"
                    dominant-baseline="middle"
                    class="web__label"
                >
                    {{ node.label }}
                </text>
            </g>
        </svg>
    </div>
</template>

<script lang="ts" setup>
type WebOption = {
    value: string;
    label: string;
    tone: string;
};

/** A point of the web while it moves: where it is, where it is going, and how much of it has appeared */
type Point = {
    value: string;
    label: string;
    tone: string;
    angle: number;
    radius: number;
    scale: number;
    angleTo: number;
    radiusTo: number;
};

const props = defineProps<{
    /** What can be chosen: gives each chosen dimension its name and color */
    options: readonly WebOption[];
    /** The chosen dimensions, in the order they were chosen */
    selected: readonly string[];
}>();

const SIZE = 420;
/** One turn of the whole web takes this long, so slow it is felt rather than watched */
const DRIFT_MS_PER_TURN = 180_000;
/** Specks on the two orbits; fixed so the picture is the same on every visit */
const INNER_DUST = [
    {
        angle: 0.6, size: 1.6,
    },
    {
        angle: 2.5, size: 1.1,
    },
    {
        angle: 4.1, size: 1.4,
    },
] as const;
const OUTER_DUST = [
    {
        angle: 1.3, size: 1.2,
    },
    {
        angle: 3.4, size: 1.7,
    },
    {
        angle: 5.2, size: 1.1,
    },
] as const;
const CENTER = SIZE / 2;
const RADIUS = 130;
const LABEL_RADIUS = 152;
/** Each frame covers this share of what is left of the way */
const EASE = 0.18;
const SETTLED = 0.01;

const points = ref<Point[]>([]);
let frame: number | null = null;
let driftFrame: number | null = null;
/** How far the whole web has turned, added to every point's angle */
const drift = ref(0);

/** Where the chosen dimensions sit so that the web is balanced: evenly around the circle, a lone one in the middle */
function slotOf(index: number, count: number) {
    return {
        angleTo: -Math.PI / 2 + (2 * Math.PI * index) / count,
        radiusTo: count === 1 ? 0 : RADIUS,
    };
}

const reducedMotion = () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function step() {
    let moving = false;

    points.value = points.value.map((point) => {
        const next = {
            ...point,
            angle: point.angle + (point.angleTo - point.angle) * EASE,
            radius: point.radius + (point.radiusTo - point.radius) * EASE,
            scale: point.scale + (1 - point.scale) * EASE,
        };

        if (Math.abs(next.angleTo - next.angle) > SETTLED || Math.abs(next.radiusTo - next.radius) > SETTLED || 1 - next.scale > SETTLED) {
            moving = true;

            return next;
        }

        return {
            ...next, angle: next.angleTo, radius: next.radiusTo, scale: 1,
        };
    });

    frame = moving ? requestAnimationFrame(step) : null;
}

/** A dimension that is added appears in its own place while the others make room; one that is dropped leaves at once */
function sync() {
    const chosen = props.selected
        .map((value) => props.options.find((option) => option.value === value))
        .filter((option): option is WebOption => option !== undefined);

    points.value = chosen.map((option, index) => {
        const slot = slotOf(index, chosen.length);
        const before = points.value.find((point) => point.value === option.value);

        return {
            value: option.value,
            label: option.label,
            tone: option.tone,
            angle: before?.angle ?? slot.angleTo,
            radius: before?.radius ?? slot.radiusTo,
            scale: before?.scale ?? 0,
            ...slot,
        };
    });

    if (reducedMotion()) {
        points.value = points.value.map((point) => ({
            ...point, angle: point.angleTo, radius: point.radiusTo, scale: 1,
        }));

        return;
    }

    if (frame === null) frame = requestAnimationFrame(step);
}

watch(() => [...props.selected], sync, { immediate: true });

function turn(previous: number | null) {
    driftFrame = requestAnimationFrame((now) => {
        if (previous !== null) drift.value += ((now - previous) / DRIFT_MS_PER_TURN) * 2 * Math.PI;

        turn(now);
    });
}

onMounted(() => {
    if (!reducedMotion()) turn(null);
});

onBeforeUnmount(() => {
    if (frame !== null) cancelAnimationFrame(frame);

    if (driftFrame !== null) cancelAnimationFrame(driftFrame);
});

/** Rough width of a label, to slide it smoothly from "starts at the point" to "ends at the point" as it goes round */
const widthOf = (text: string) => [...text].reduce((sum, char) => sum + ((char.codePointAt(0) ?? 0) > 255 ? 12 : 7), 0);

const nodes = computed(() => points.value.map((point) => {
    const angle = point.angle + drift.value;
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    // The name sits outside the circle, on the line from the middle through the point
    const reach = Math.max(point.radius, RADIUS) + (LABEL_RADIUS - RADIUS);

    return {
        ...point,
        x: CENTER + point.radius * cos,
        y: CENTER + point.radius * sin,
        lx: point.radius === 0 ? CENTER - widthOf(point.label) / 2 : CENTER + reach * cos - (widthOf(point.label) * (1 - cos)) / 2,
        ly: CENTER + (point.radius === 0 ? 20 : reach * sin),
    };
}));

const pairs = computed(() => nodes.value.flatMap((a, index) => nodes.value.slice(index + 1).map((b) => ({
    key: `${a.value}-${b.value}`, a, b,
}))));

const label = computed(() => (nodes.value.length === 0
    ? '尚未選擇維度'
    : `已選維度：${nodes.value.map((node) => node.label).join('、')}`));
</script>

<style scoped>
.web {
    display: flex;
    justify-content: center;
}

.web__svg {
    width: 100%;
    max-width: 420px;
    height: auto;
    overflow: visible;
}

.web__ring {
    fill: none;
    stroke: rgba(var(--v-theme-on-surface), 0.08);
    stroke-width: 1;
}

.web__glow-core {
    stop-color: rgb(var(--v-theme-primary));
    stop-opacity: 0.1;
}

.web__glow-edge {
    stop-color: rgb(var(--v-theme-primary));
    stop-opacity: 0;
}

.web__orbit {
    transform-box: view-box;
    transform-origin: center;
    animation: web-turn 120s linear infinite;
}

.web__orbit--slow {
    animation-duration: 140s;
}

.web__orbit--reverse {
    animation-direction: reverse;
    animation-duration: 200s;
}

.web__orbit-ring {
    fill: none;
    stroke: rgba(var(--v-theme-primary), 0.14);
    stroke-width: 1;
}

.web__orbit-ring--dashed {
    stroke-dasharray: 2 7;
}

.web__dust {
    fill: rgba(var(--v-theme-primary), 0.5);
}

@keyframes web-turn {
    to {
        transform: rotate(360deg);
    }
}

@media (prefers-reduced-motion: reduce) {
    .web__orbit {
        animation: none;
    }
}

.web__line {
    stroke: rgba(var(--v-theme-primary), 0.45);
    stroke-width: 1;
}

.web__dot {
    stroke: rgb(var(--v-theme-surface));
    stroke-width: 2;
}

.web__label {
    font-size: 12px;
    font-weight: 600;
    fill: rgb(var(--v-theme-on-surface));
}
</style>
