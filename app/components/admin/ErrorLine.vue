<template>
    <v-alert
        v-if="message"
        type="error"
        variant="tonal"
        density="compact"
        class="mt-2"
    >
        {{ message }}
    </v-alert>
</template>

<script lang="ts" setup>
defineProps<{ message: string | null }>();
</script>
