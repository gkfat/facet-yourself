<template>
    <v-alert
        v-if="viewer === 'guest'"
        type="info"
        variant="tonal"
        class="mb-4"
    >
        <slot />
        訪客的資料只會暫存一天，登入後才會長期保存。
        <template #append>
            <v-btn
                to="/login"
                size="small"
                color="primary"
            >
                登入
            </v-btn>
        </template>
    </v-alert>
</template>

<script lang="ts" setup>
/** The note a visitor sees at the top of a page: what is different for them, and a way to sign in. */
const { viewer } = useViewer();
</script>
