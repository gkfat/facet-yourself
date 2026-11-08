<template>
    <div>
        <v-btn
            variant="outlined"
            prepend-icon="mdi-image-outline"
            @click="open"
        >
            分享結果圖
        </v-btn>

        <v-dialog
            v-model="visible"
            max-width="460"
            @after-leave="reset"
        >
            <v-card>
                <v-card-title>分享結果圖</v-card-title>
                <v-card-text>
                    <LoadingState
                        v-if="busy"
                        label="正在製作圖片"
                    />
                    <v-alert
                        v-else-if="failed"
                        type="error"
                        variant="tonal"
                    >
                        圖片製作失敗，請稍後再試一次。
                    </v-alert>
                    <template v-else-if="imageUrl">
                        <img
                            :src="imageUrl"
                            :alt="`${content.dimension}：${content.headline} 的分享圖`"
                            class="preview"
                        >
                        <p class="text-caption text-medium-emphasis mt-3 mb-0">
                            圖片只有這份結果的標題與結論，不含你的出生資料。
                        </p>
                    </template>
                </v-card-text>
                <v-card-actions>
                    <v-spacer />
                    <v-btn
                        variant="text"
                        @click="visible = false"
                    >
                        關閉
                    </v-btn>
                    <v-btn
                        v-if="blob"
                        variant="tonal"
                        prepend-icon="mdi-download"
                        @click="save"
                    >
                        儲存圖片
                    </v-btn>
                    <v-btn
                        v-if="blob && canShareFile"
                        color="primary"
                        prepend-icon="mdi-share-variant"
                        @click="share"
                    >
                        分享
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </div>
</template>

<script lang="ts" setup>
import {
    canvasToBlob, drawShareImage, type ShareImageContent,
} from '../../utils/shareImage';

const props = defineProps<{
    content: ShareImageContent;
}>();

const visible = ref(false);
const busy = ref(false);
const failed = ref(false);
const blob = ref<Blob | null>(null);
const imageUrl = ref<string | null>(null);

const fileName = computed(() => `facet-${props.content.headline}.png`);
const file = computed(() => (blob.value ? new File([blob.value], fileName.value, { type: 'image/png' }) : null));
const canShareFile = computed(() => Boolean(file.value) && typeof navigator.canShare === 'function' && navigator.canShare({ files: [file.value as File] }));

async function open() {
    visible.value = true;
    busy.value = true;
    failed.value = false;

    try {
        blob.value = await canvasToBlob(await drawShareImage(props.content));
        imageUrl.value = URL.createObjectURL(blob.value);
    } catch (error) {
        console.error('[share-image] failed:', error);
        failed.value = true;
    } finally {
        busy.value = false;
    }
}

function reset() {
    if (imageUrl.value) URL.revokeObjectURL(imageUrl.value);

    imageUrl.value = null;
    blob.value = null;
}

function save() {
    if (!imageUrl.value) return;

    const link = document.createElement('a');

    link.href = imageUrl.value;
    link.download = fileName.value;
    link.click();
}

async function share() {
    if (!file.value) return;

    try {
        await navigator.share({
            files: [file.value],
            title: `${props.content.dimension}：${props.content.headline}`,
        });
    } catch (error) {
        // Closing the share sheet is not an error.
        if (error instanceof DOMException && error.name === 'AbortError') return;

        console.error('[share-image] share failed:', error);
        failed.value = true;
    }
}

onBeforeUnmount(reset);
</script>

<style scoped>
.preview {
    display: block;
    width: 100%;
    height: auto;
    border-radius: 8px;
}
</style>
