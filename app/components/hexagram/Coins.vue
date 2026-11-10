<template>
    <div
        class="coins"
        aria-hidden="true"
    >
        <div
            v-for="coin in 3"
            :key="coin"
            class="coin"
            :class="{ 'coin--rolling': rolling }"
            :style="{ '--delay': `${(coin - 1) * 90}ms` }"
        >
            <svg viewBox="0 0 64 64">
                <circle
                    cx="32"
                    cy="32"
                    r="29"
                    class="coin__body"
                />
                <circle
                    cx="32"
                    cy="32"
                    r="25"
                    class="coin__rim"
                />
                <rect
                    x="24"
                    y="24"
                    width="16"
                    height="16"
                    class="coin__hole"
                />
                <!-- The face with the characters is heads, the plain one is tails -->
                <g
                    v-if="faceUp(coin) === 'heads'"
                    class="coin__text"
                >
                    <text
                        x="32"
                        y="19"
                    >開</text>
                    <text
                        x="32"
                        y="52"
                    >通</text>
                    <text
                        x="14"
                        y="37"
                    >寶</text>
                    <text
                        x="50"
                        y="37"
                    >元</text>
                </g>
            </svg>
        </div>
    </div>
</template>

<script lang="ts" setup>
/**
 * Three coins. `heads` is how many of them show their characters; it is null before the first toss, when they all
 * show the plain side. The coins spin while `rolling`, and the page changes `heads` in the middle of the spin so the
 * faces change while they are in the air.
 */
const props = defineProps<{
    heads: number | null;
    rolling: boolean;
}>();

/** The first `heads` coins show heads, the others tails: which coin is which does not matter, only how many. */
function faceUp(coin: number): 'heads' | 'tails' {
    return props.heads !== null && coin <= props.heads ? 'heads' : 'tails';
}
</script>

<style scoped>
.coins {
    display: flex;
    justify-content: center;
    gap: 18px;
    padding: 20px 0 8px;
}

.coin {
    width: 64px;
    height: 64px;
}

.coin svg {
    width: 100%;
    height: 100%;
    overflow: visible;
}

.coin__body {
    fill: #c9a24a;
    stroke: #8a6a1f;
    stroke-width: 2;
}

.coin__rim {
    fill: none;
    stroke: #8a6a1f;
    stroke-width: 1.2;
}

.coin__hole {
    fill: rgb(var(--v-theme-surface));
    stroke: #8a6a1f;
    stroke-width: 1.6;
}

.coin__text text {
    font-size: 12px;
    font-weight: 700;
    text-anchor: middle;
    fill: #5a430f;
}

.coin--rolling {
    animation: toss 0.95s ease-in-out both;
    animation-delay: var(--delay);
}

/* Up, spinning over three times, and back down on the same spot */
@keyframes toss {
    0% {
        transform: translateY(0) rotateX(0deg);
    }

    45% {
        transform: translateY(-42px) rotateX(540deg);
    }

    100% {
        transform: translateY(0) rotateX(1080deg);
    }
}

@media (prefers-reduced-motion: reduce) {
    .coin--rolling {
        animation: none;
    }
}
</style>
