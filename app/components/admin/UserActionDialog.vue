<template>
    <v-dialog
        :model-value="modelValue"
        max-width="420"
        persistent
        @update:model-value="close"
    >
        <v-card>
            <v-card-title class="pa-4">
                {{ copy.title }}
            </v-card-title>
            <v-card-text>
                <p>{{ copy.message }}</p>
                <p class="text-medium-emphasis mt-2 account">
                    {{ user?.email }}
                </p>
                <v-alert
                    v-if="error"
                    type="error"
                    variant="tonal"
                    density="compact"
                    class="mt-4"
                >
                    {{ error }}
                </v-alert>
            </v-card-text>
            <v-card-actions class="pa-4">
                <v-spacer />
                <v-btn
                    :disabled="saving"
                    @click="close"
                >
                    取消
                </v-btn>
                <v-btn
                    :color="copy.color"
                    :loading="saving"
                    variant="flat"
                    @click="confirm"
                >
                    {{ copy.confirm }}
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script lang="ts" setup>
import type { AdminUserListItem } from '../../../shared/schemas/api/adminUsers.schema';

export type UserAction = 'disable' | 'enable' | 'delete';

const props = defineProps<{
    modelValue: boolean;
    action: UserAction;
    user: AdminUserListItem | null;
}>();

const emit = defineEmits<{
    'update:modelValue': [value: boolean];
    done: [];
}>();

const api = useApi();

const saving = ref(false);
const error = ref<string | null>(null);

const COPY: Record<UserAction, {
    title: string;
    message: string;
    confirm: string;
    color: string;
}> = {
    disable: {
        title: '停用會員',
        message: '停用後這個帳號無法再登入，已登入的裝置會在 token 到期後失效。',
        confirm: '停用',
        color: 'error',
    },
    enable: {
        title: '啟用會員',
        message: '啟用後這個帳號可以再次登入。',
        confirm: '啟用',
        color: 'success',
    },
    delete: {
        title: '刪除會員',
        message: '會永久刪除這個帳號與其全部紀錄，無法復原。AI 用量紀錄會保留但不再連到該帳號。',
        confirm: '永久刪除',
        color: 'error',
    },
};

const copy = computed(() => COPY[props.action]);

watch(() => props.modelValue, (open) => {
    if (open) error.value = null;
});

function close() {
    if (saving.value) return;

    emit('update:modelValue', false);
}

async function confirm() {
    if (!props.user) return;

    saving.value = true;
    error.value = null;

    const url = `/api/admin/users/${encodeURIComponent(props.user.uid)}`;

    try {
        if (props.action === 'delete') await api.del(url);
        else await api.request(url, {
            method: 'PATCH', body: { disabled: props.action === 'disable' },
        });

        emit('update:modelValue', false);
        emit('done');
    } catch (caught) {
        console.error('[UserActionDialog] failed:', caught);
        error.value = adminErrorMessage(caught);
    } finally {
        saving.value = false;
    }
}
</script>

<style scoped>
.account {
    overflow-wrap: anywhere;
}
</style>
