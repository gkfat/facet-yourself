<template>
    <v-card
        variant="outlined"
        class="plan"
        :class="{ 'plan--featured': featured }"
        height="100%"
    >
        <div class="plan__inner">
            <header class="plan__head">
                <span class="plan__name">{{ name }}</span>
                <v-chip
                    v-if="badge"
                    size="x-small"
                    :color="featured ? 'primary' : undefined"
                    variant="tonal"
                >
                    {{ badge }}
                </v-chip>
            </header>

            <p class="plan__tagline">
                {{ tagline }}
            </p>

            <div class="plan__points">
                <span class="plan__points-number">{{ points }}</span>
                <span class="plan__points-unit">點</span>
            </div>
            <div class="plan__price">
                {{ price }}
                <span
                    v-if="perPoint"
                    class="plan__per"
                >· 每點 {{ perPoint }}</span>
            </div>

            <ul class="plan__facts">
                <li v-for="fact in facts" :key="fact">
                    <v-icon
                        icon="mdi-check"
                        size="16"
                        color="primary"
                    />
                    {{ fact }}
                </li>
            </ul>

            <p
                v-if="audience"
                class="plan__audience"
            >
                {{ audience }}
            </p>

            <v-spacer />

            <v-btn
                :to="to"
                :color="featured ? 'primary' : undefined"
                :variant="featured ? 'flat' : 'tonal'"
                block
                class="mt-4"
            >
                {{ action }}
            </v-btn>
        </div>
    </v-card>
</template>

<script lang="ts" setup>
defineProps<{
    name: string;
    tagline: string;
    points: number;
    price: string;
    /** Price of one point, when it can be worked out */
    perPoint?: string;
    /** What the points amount to, one line each */
    facts: string[];
    /** Who it suits */
    audience?: string;
    badge?: string;
    /** The plan the page points to: the one most readers will want */
    featured?: boolean;
    to: string;
    action: string;
}>();
</script>

<style scoped>
.plan {
    transition: border-color 0.15s ease, box-shadow 0.15s ease;
}

.plan--featured {
    border-color: rgb(var(--v-theme-primary)) !important;
    box-shadow: 0 6px 20px rgba(var(--v-theme-primary), 0.12);
}

.plan__inner {
    display: flex;
    flex-direction: column;
    height: 100%;
    padding: 20px 20px 18px;
}

.plan__head {
    display: flex;
    align-items: center;
    gap: 8px;
    min-height: 24px;
}

.plan__name {
    font-size: 1.0625rem;
    font-weight: 700;
    letter-spacing: 0.04em;
}

.plan__tagline {
    margin: 6px 0 16px;
    min-height: 3em;
    font-size: 0.875rem;
    line-height: 1.5;
    color: rgba(var(--v-theme-on-surface), var(--v-medium-emphasis-opacity));
}

.plan__points {
    display: flex;
    align-items: baseline;
    gap: 4px;
}

.plan__points-number {
    font-size: 2.5rem;
    font-weight: 700;
    line-height: 1;
    letter-spacing: -0.01em;
}

.plan__points-unit {
    font-size: 1rem;
    color: rgba(var(--v-theme-on-surface), var(--v-medium-emphasis-opacity));
}

.plan__price {
    margin: 6px 0 16px;
    font-size: 1rem;
    font-weight: 600;
}

.plan__per {
    font-size: 0.8125rem;
    font-weight: 400;
    color: rgba(var(--v-theme-on-surface), var(--v-medium-emphasis-opacity));
}

.plan__facts {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 14px 0 0;
    margin: 0;
    list-style: none;
    border-top: 1px solid rgba(var(--v-theme-on-surface), 0.08);
    font-size: 0.875rem;
    line-height: 1.5;
}

.plan__audience {
    margin: 14px 0 0;
    font-size: 0.8125rem;
    line-height: 1.5;
    color: rgba(var(--v-theme-on-surface), var(--v-medium-emphasis-opacity));
}
</style>
