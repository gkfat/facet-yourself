<template>
    <div>
        <h1 class="admin-title">
            使用者
        </h1>

        <v-form
            class="search"
            @submit.prevent="runSearch"
        >
            <v-text-field
                v-model="query"
                label="以完整 email 搜尋"
                type="email"
                prepend-inner-icon="mdi-magnify"
                density="comfortable"
                hide-details
                clearable
                @click:clear="clearSearch"
            />
            <v-btn
                type="submit"
                color="primary"
                :disabled="!query.trim()"
            >
                搜尋
            </v-btn>
        </v-form>

        <v-alert
            v-if="error"
            type="error"
            variant="tonal"
            density="compact"
            class="mb-4"
        >
            {{ error }}
        </v-alert>

        <v-card variant="outlined">
            <v-table>
                <thead>
                    <tr>
                        <th>UID</th>
                        <th>Email</th>
                        <th>狀態</th>
                        <th class="text-no-wrap text-right">
                            可用點數
                        </th>
                        <th class="text-no-wrap text-right">
                            多維度報告
                        </th>
                        <th class="text-no-wrap">
                            註冊時間
                        </th>
                        <th class="text-no-wrap">
                            最後登入
                        </th>
                        <th />
                    </tr>
                </thead>
                <tbody>
                    <tr
                        v-for="item in items"
                        :key="item.uid"
                    >
                        <td class="uid">
                            {{ item.uid }}
                        </td>
                        <td class="email">
                            {{ item.email }}
                        </td>
                        <td>
                            <v-chip
                                :color="item.disabled ? 'error' : 'success'"
                                size="small"
                                variant="tonal"
                            >
                                {{ item.disabled ? '已停用' : '啟用中' }}
                            </v-chip>
                        </td>
                        <td class="text-no-wrap text-right">
                            {{ item.pointBalance ?? '—' }}
                        </td>
                        <td class="text-no-wrap text-right">
                            {{ item.multiReportCount ?? '—' }}
                        </td>
                        <td class="text-no-wrap">
                            {{ formatAdminTime(item.createdAt) }}
                        </td>
                        <td class="text-no-wrap">
                            {{ formatAdminTime(item.lastSignInAt) }}
                        </td>
                        <td class="text-no-wrap text-right">
                            <v-btn
                                icon="mdi-information-outline"
                                variant="text"
                                size="small"
                                aria-label="詳細資訊"
                                @click="openDetail(item)"
                            />
                            <v-btn
                                v-if="!item.disabled"
                                icon="mdi-account-off-outline"
                                variant="text"
                                size="small"
                                aria-label="停用"
                                :disabled="isSelf(item)"
                                @click="openAction('disable', item)"
                            />
                            <v-btn
                                v-else
                                icon="mdi-account-check-outline"
                                variant="text"
                                size="small"
                                aria-label="啟用"
                                @click="openAction('enable', item)"
                            />
                            <v-btn
                                v-if="item.disabled"
                                icon="mdi-delete-outline"
                                variant="text"
                                size="small"
                                color="error"
                                aria-label="刪除"
                                :disabled="isSelf(item)"
                                @click="openAction('delete', item)"
                            />
                        </td>
                    </tr>
                    <tr v-if="!loading && items.length === 0">
                        <td
                            colspan="8"
                            class="text-center text-medium-emphasis pa-6"
                        >
                            {{ email ? '找不到這個 email 的會員' : '還沒有會員' }}
                        </td>
                    </tr>
                </tbody>
            </v-table>
            <v-progress-linear
                v-if="loading"
                indeterminate
            />
        </v-card>

        <div
            v-if="nextCursor"
            class="more"
        >
            <v-btn
                variant="outlined"
                :loading="loading"
                @click="loadMore"
            >
                載入更多
            </v-btn>
        </div>

        <AdminUserDetailDialog
            v-model="detailOpen"
            :user="detailUser"
        />

        <AdminUserActionDialog
            v-model="actionOpen"
            :action="action"
            :user="actionUser"
            @done="load"
        />
    </div>
</template>

<script lang="ts" setup>
import type { AdminUserListItem } from '../../../../shared/schemas/api/adminUsers.schema';
import type { UserAction } from '../../../components/admin/UserActionDialog.vue';

definePageMeta({
    layout: 'admin',
    middleware: 'admin',
});

useHead({ title: '後台使用者' });

const {
    items, nextCursor, loading, error, email, load, loadMore, search,
} = useAdminUsers();
const { user } = useAuth();

const query = ref('');
const actionOpen = ref(false);
const action = ref<UserAction>('disable');
const actionUser = ref<AdminUserListItem | null>(null);
const detailOpen = ref(false);
const detailUser = ref<AdminUserListItem | null>(null);

const isSelf = (item: AdminUserListItem) => item.uid === user.value?.uid;

function runSearch() {
    return search(query.value);
}

function clearSearch() {
    query.value = '';

    return search('');
}

function openDetail(item: AdminUserListItem) {
    detailUser.value = item;
    detailOpen.value = true;
}

function openAction(next: UserAction, item: AdminUserListItem) {
    action.value = next;
    actionUser.value = item;
    actionOpen.value = true;
}

onMounted(load);
</script>

<style scoped>
.admin-title {
    font-size: 1.5rem;
    font-weight: 600;
    margin-bottom: 16px;
}

.search {
    display: flex;
    gap: 12px;
    align-items: center;
    margin-bottom: 16px;
    max-width: 560px;
}

.email {
    overflow-wrap: anywhere;
}

.uid {
    font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
    font-size: 0.75rem;
    color: rgba(var(--v-theme-on-surface), var(--v-medium-emphasis-opacity));
    white-space: nowrap;
}

.more {
    display: flex;
    justify-content: center;
    margin-top: 16px;
}
</style>
