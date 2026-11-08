<template>
    <section
        class="multi"
        aria-labelledby="multi-title"
    >
        <div class="multi__body">
            <div class="multi__copy">
                <span class="multi__eyebrow">綜合分析</span>
                <h2
                    id="multi-title"
                    class="multi__title font-display"
                >
                    把幾個角度疊在一起看
                </h2>
                <p class="multi__lead">
                    單一角度只看到一部分。選兩個以上的維度，由 AI 比對它們互相呼應、彼此拉扯的地方，寫成一份只屬於你的報告。
                </p>

                <div class="multi__actions">
                    <v-btn
                        :to="unlocked ? '/report' : undefined"
                        :disabled="!unlocked"
                        :variant="unlocked ? 'flat' : 'outlined'"
                        class="multi__cta"
                        append-icon="mdi-arrow-right"
                    >
                        {{ unlocked ? '開始綜合分析' : '先完成 2 個維度' }}
                    </v-btn>
                    <v-btn
                        to="/pricing"
                        variant="text"
                        class="multi__link"
                    >
                        點數怎麼算
                    </v-btn>
                </div>

                <p class="multi__meta">
                    2 個維度 {{ cheapest }} 點起
                    <template v-if="viewer === 'guest'">
                        ·
                        <NuxtLink
                            to="/login"
                            class="multi__login"
                        >
                            登入即贈 {{ WELCOME_POINTS }} 點
                        </NuxtLink>
                    </template>
                </p>
            </div>

            <!-- Three dimensions laid over one another: what is left in the middle is the person they all describe -->
            <svg
                class="multi__rings"
                viewBox="0 0 260 220"
                role="img"
                aria-label="星座、MBTI、人類圖三個維度互相重疊，重疊的中心是你"
            >
                <circle
                    class="ring ring--a"
                    cx="98"
                    cy="86"
                    r="66"
                />
                <circle
                    class="ring ring--b"
                    cx="162"
                    cy="86"
                    r="66"
                />
                <circle
                    class="ring ring--c"
                    cx="130"
                    cy="140"
                    r="66"
                />
                <text
                    class="ring__label"
                    x="66"
                    y="70"
                >星座</text>
                <text
                    class="ring__label"
                    x="194"
                    y="70"
                    text-anchor="middle"
                >MBTI</text>
                <text
                    class="ring__label"
                    x="130"
                    y="182"
                    text-anchor="middle"
                >人類圖</text>
                <circle
                    class="ring__core"
                    cx="130"
                    cy="104"
                    r="5"
                />
                <text
                    class="ring__you"
                    x="130"
                    y="126"
                    text-anchor="middle"
                >你</text>
            </svg>
        </div>
    </section>
</template>

<script lang="ts" setup>
import { WELCOME_POINTS } from '../../../shared/constants/points';
import { multiReportCost } from '../../../shared/utils/multiDimensionPricing';

defineProps<{
    /** Whether two dimensions are done, so a report can be started */
    unlocked: boolean;
}>();

const { viewer } = useViewer();

/** What the smallest report costs: two of the plainest dimensions */
const cheapest = multiReportCost(['ZODIAC', 'BLOOD']) ?? 0;
</script>

<style scoped>
.multi {
    --glow: #aebbe9;
    --ember: #e0a283;

    /* The content asks how wide the page's column is; only the backdrop runs edge to edge */
    container-type: inline-size;
    position: relative;
    isolation: isolate;
    color: #f4f7fb;
}

/* Full width: the band reaches both sides of the screen while the text stays in the column */
.multi::before {
    content: '';
    position: absolute;
    top: 0;
    bottom: 0;
    left: 50%;
    z-index: -1;
    width: 100vw;
    transform: translateX(-50%);
    background-color: rgb(var(--v-theme-night));
    background-image: var(--stars);
}

/* Film grain over the band */
.multi::after {
    content: '';
    position: absolute;
    top: 0;
    bottom: 0;
    left: 50%;
    z-index: -1;
    width: 100vw;
    transform: translateX(-50%);
    background-image: var(--grain-dark);
    opacity: 0.06;
    pointer-events: none;
}

.multi__body {
    display: flex;
    flex-direction: column-reverse;
    gap: 8px;
    padding: 44px 0;
}

.multi__copy {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
}

.multi__eyebrow {
    font-size: 0.75rem;
    letter-spacing: 0.16em;
    color: var(--glow);
}

.multi__title {
    margin: 6px 0 10px;
    font-size: 1.625rem;
    line-height: 1.4;
    letter-spacing: 0.02em;
    text-wrap: balance;
}

.multi__lead {
    max-width: 30em;
    margin: 0 0 20px;
    font-size: 0.9375rem;
    line-height: 1.8;
    color: rgba(244, 247, 251, 0.82);
}

.multi__actions {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px 12px;
}

.multi__cta {
    font-weight: 700;
    letter-spacing: 0.08em;
}

.multi__cta.v-btn--variant-flat {
    color: rgb(var(--v-theme-night));
    background: #e8ecfa;
}

/* Not there yet: the button waits, plainly, in the card's own white */
.multi__cta.v-btn--variant-outlined {
    color: #f4f7fb;
    border-color: rgba(244, 247, 251, 0.5);
}

.multi__link {
    color: #f4f7fb;
}

.multi__meta {
    margin: 14px 0 0;
    font-size: 0.8125rem;
    color: rgba(244, 247, 251, 0.7);
}

.multi__login {
    color: var(--glow);
    text-underline-offset: 3px;
}

.multi__rings {
    align-self: center;
    width: min(220px, 70%);
    height: auto;
}

.ring {
    fill: rgba(255, 255, 255, 0.1);
    stroke: rgba(255, 255, 255, 0.55);
    stroke-width: 1.2;
    /* They start apart and come together once, which is the whole idea of the section */
    animation: ring-in 1.1s cubic-bezier(0.2, 0.7, 0.2, 1) backwards;
}

.ring--a {
    --from: -26px, -10px;
}

.ring--b {
    --from: 26px, -10px;
}

.ring--c {
    --from: 0, 26px;
}

.ring__label {
    font-size: 13px;
    font-weight: 600;
    letter-spacing: 0.06em;
    fill: #f4f7fb;
}

.ring__core {
    fill: var(--ember);
}

.ring__you {
    font-size: 14px;
    font-weight: 700;
    fill: var(--ember);
}

@keyframes ring-in {
    from {
        opacity: 0.2;
        transform: translate(var(--from));
    }
}

@container (min-width: 560px) {
    .multi__body {
        flex-direction: row;
        align-items: center;
        gap: 24px;
    }

    .multi__copy {
        flex: 1 1 0;
    }

    .multi__rings {
        flex: 0 0 220px;
        width: 220px;
    }
}

@media (prefers-reduced-motion: reduce) {
    .ring {
        animation: none;
    }
}
</style>
