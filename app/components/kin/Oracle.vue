<template>
    <v-card variant="outlined">
        <v-card-title>五大神諭</v-card-title>
        <v-card-text>
            <!-- The five Kin as a cross: guide above, antipode left, the main Kin in the middle, analog right, occult below -->
            <div class="oracle">
                <div
                    v-for="cell in cells"
                    :key="cell.label"
                    class="oracle__cell"
                    :class="[`oracle__cell--${cell.place}`, { 'oracle__cell--main': cell.place === 'main' }]"
                >
                    <div class="oracle__label">
                        {{ cell.label }}
                    </div>
                    <KinGlyph
                        :seal="cell.kin.solarSeal"
                        :label="`${cell.label}：${cell.name}`"
                        :size="64"
                        class="oracle__glyph"
                    />
                    <div class="oracle__name">
                        {{ cell.name }}
                    </div>
                    <div class="oracle__number">
                        KIN.{{ cell.kin.kinNumber }}
                    </div>
                    <div
                        v-if="cell.meaning"
                        class="oracle__meaning"
                    >
                        {{ cell.meaning }}
                    </div>
                </div>
            </div>
        </v-card-text>
    </v-card>
</template>

<script lang="ts" setup>
import {
    KIN_ORACLE_LABELS, KIN_ORACLE_MEANINGS,
} from '../../../shared/constants/mayaKin';
import type { Kin } from '../../../shared/schemas/api/mayaKin.schema';
import {
    kinName, kinOracle,
} from '../../../shared/utils/mayaKin';

const props = defineProps<{ kin: Kin }>();

const cells = computed(() => {
    const oracle = kinOracle(props.kin);

    return [
        {
            place: 'guide', label: KIN_ORACLE_LABELS.guide, kin: oracle.guide, meaning: KIN_ORACLE_MEANINGS.guide,
        },
        {
            place: 'antipode', label: KIN_ORACLE_LABELS.antipode, kin: oracle.antipode, meaning: KIN_ORACLE_MEANINGS.antipode,
        },
        {
            place: 'main', label: '主印記', kin: props.kin, meaning: '',
        },
        {
            place: 'analog', label: KIN_ORACLE_LABELS.analog, kin: oracle.analog, meaning: KIN_ORACLE_MEANINGS.analog,
        },
        {
            place: 'occult', label: KIN_ORACLE_LABELS.occult, kin: oracle.occult, meaning: KIN_ORACLE_MEANINGS.occult,
        },
    ].map((cell) => ({
        ...cell, name: kinName(cell.kin),
    }));
});
</script>

<style scoped>
.oracle {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    grid-template-areas:
        '. guide .'
        'antipode main analog'
        '. occult .';
    gap: 8px;
    max-width: 520px;
    margin: 0 auto;
}

.oracle__cell {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    padding: 10px 4px;
    border: 1px solid rgba(var(--v-theme-on-surface), 0.12);
    border-radius: 12px;
    text-align: center;
}

.oracle__cell--guide { grid-area: guide; }
.oracle__cell--antipode { grid-area: antipode; }
.oracle__cell--main { grid-area: main; }
.oracle__cell--analog { grid-area: analog; }
.oracle__cell--occult { grid-area: occult; }

.oracle__cell--main {
    border-color: rgb(var(--v-theme-primary));
    background: rgba(var(--v-theme-primary), 0.06);
}

.oracle__label {
    font-size: 0.75rem;
    font-weight: 600;
    color: rgb(var(--v-theme-primary));
}

.oracle__name {
    font-size: 0.8125rem;
    font-weight: 600;
    line-height: 1.3;
}

.oracle__number {
    font-size: 0.75rem;
    opacity: 0.6;
}

.oracle__meaning {
    padding: 0 4px;
    font-size: 0.75rem;
    line-height: 1.4;
    opacity: 0.75;
}
</style>
