<template>
    <div class="trend-chart">
        <canvas
            ref="canvas"
            role="img"
            :aria-label="ariaLabel"
        />
    </div>
</template>

<script lang="ts" setup>
import {
    BarController, BarElement, CategoryScale, Chart, Legend, LinearScale, LineController, LineElement, PointElement, Tooltip,
} from 'chart.js';

Chart.register(
    BarController,
    BarElement,
    LineController,
    LineElement,
    PointElement,
    CategoryScale,
    LinearScale,
    Tooltip,
    Legend,
);

export type TrendDataset = {
    label: string;
    data: number[];
    color: string;
};

const props = withDefaults(defineProps<{
    labels: string[];
    datasets: TrendDataset[];
    type?: 'bar' | 'line';
    ariaLabel: string;
    /** Fractions of a unit are shown (cost in dollars) */
    decimals?: boolean;
}>(), {
    type: 'bar', decimals: false,
});

const canvas = ref<HTMLCanvasElement | null>(null);
let chart: Chart | null = null;

const reducedMotion = () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function chartData() {
    return {
        labels: props.labels,
        datasets: props.datasets.map((dataset) => ({
            label: dataset.label,
            data: dataset.data,
            backgroundColor: dataset.color,
            borderColor: dataset.color,
            borderWidth: props.type === 'line' ? 2 : 0,
            pointRadius: props.type === 'line' ? 2 : 0,
            tension: 0.25,
        })),
    };
}

function create() {
    if (!canvas.value) return;

    chart = new Chart(canvas.value, {
        type: props.type,
        data: chartData(),
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: reducedMotion() ? false : undefined,
            interaction: {
                mode: 'index', intersect: false,
            },
            plugins: { legend: { display: props.datasets.length > 1 } },
            scales: {
                x: {
                    grid: { display: false },
                    ticks: {
                        maxRotation: 0, autoSkip: true, maxTicksLimit: 8,
                    },
                },
                y: {
                    beginAtZero: true,
                    ticks: props.decimals ? {} : { precision: 0 },
                },
            },
        },
    });
}

onMounted(create);

watch(() => [
    props.labels,
    props.datasets,
] as const, () => {
    if (!chart) return;

    chart.data = chartData();
    chart.update();
}, { deep: true });

onBeforeUnmount(() => {
    chart?.destroy();
    chart = null;
});
</script>

<style scoped>
.trend-chart {
    position: relative;
    height: 240px;
}
</style>
