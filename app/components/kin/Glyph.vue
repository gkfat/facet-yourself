<template>
    <span
        class="glyph"
        role="img"
        :aria-label="label"
        :style="style"
    />
</template>

<script lang="ts" setup>
import {
    KIN_SPRITE, kinSpriteCell,
} from '../../../shared/constants/kinSprite';

const props = withDefaults(defineProps<{
    /** The solar seal, 1 to 20 */
    seal: number;
    /** What a screen reader says for the glyph */
    label: string;
    /** Width and height in px */
    size?: number;
}>(), { size: 96 });

const style = computed(() => {
    const cell = kinSpriteCell(props.seal);

    return {
        width: `${props.size}px`,
        height: `${props.size}px`,
        backgroundImage: `url(${KIN_SPRITE.url})`,
        backgroundSize: cell.size,
        backgroundPosition: cell.position,
    };
});
</script>

<style scoped>
.glyph {
    display: block;
    flex: none;
    background-repeat: no-repeat;
}
</style>
