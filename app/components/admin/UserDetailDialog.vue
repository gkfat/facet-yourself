<template>
    <v-dialog
        :model-value="modelValue"
        max-width="560"
        scrollable
        @update:model-value="close"
    >
        <v-card>
            <v-card-title class="pa-4 d-flex align-center">
                使用者詳細資訊
                <v-spacer />
                <v-btn
                    icon="mdi-close"
                    variant="text"
                    size="small"
                    aria-label="關閉"
                    @click="close"
                />
            </v-card-title>

            <v-card-text>
                <v-progress-linear
                    v-if="loading"
                    indeterminate
                />

                <v-alert
                    v-else-if="error"
                    type="error"
                    variant="tonal"
                    density="compact"
                >
                    {{ error }}
                    <template #append>
                        <v-btn
                            size="small"
                            @click="load"
                        >
                            重試
                        </v-btn>
                    </template>
                </v-alert>

                <template v-else-if="detail">
                    <section
                        v-for="section in sections"
                        :key="section.title"
                        class="section"
                    >
                        <h3 class="section__title">
                            {{ section.title }}
                        </h3>
                        <dl class="rows">
                            <div
                                v-for="row in section.rows"
                                :key="row.label"
                                class="row"
                            >
                                <dt>{{ row.label }}</dt>
                                <dd :class="{ 'row__mono': row.mono }">
                                    {{ row.value }}
                                </dd>
                            </div>
                        </dl>
                    </section>
                    <p class="text-caption text-medium-emphasis mb-0">
                        含個人資料，僅供管理用途；每次查看都會留下紀錄。
                    </p>
                </template>
            </v-card-text>

            <v-card-actions class="pa-4">
                <v-spacer />
                <v-btn @click="close">
                    關閉
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script lang="ts" setup>
import type {
    AdminUserDetail, AdminUserListItem,
} from '../../../shared/schemas/api/adminUsers.schema';
import {
    cityLabel, findCity,
} from '../../../shared/constants/cities';
import {
    BLOOD_TYPE_LABELS, GENDER_LABELS, ZODIAC_LABELS,
} from '../../../shared/constants/zodiacLabels';
import { formatAdminTime } from '../../utils/adminFormat';

const props = defineProps<{
    modelValue: boolean;
    user: AdminUserListItem | null;
}>();

const emit = defineEmits<{ 'update:modelValue': [value: boolean] }>();

const api = useApi();

const detail = ref<AdminUserDetail | null>(null);
const loading = ref(false);
const error = ref<string | null>(null);

type Row = {
    label: string;
    value: string;
    mono?: boolean;
};

/** A number that could not be read shows as unknown, never as zero. */
const count = (value: number | null) => (value === null ? '—' : String(value));

const sections = computed<{ title: string; rows: Row[] }[]>(() => {
    const item = detail.value;

    if (!item) return [];

    const { profile, usage } = item;
    const city = profile.birthPlace ? findCity(profile.birthPlace) : undefined;

    return [
        {
            title: '帳號',
            rows: [
                {
                    label: 'UID', value: item.uid, mono: true,
                },
                {
                    label: 'Email', value: item.email,
                },
                {
                    label: '狀態', value: item.disabled ? '已停用' : '啟用中',
                },
                {
                    label: '註冊時間', value: formatAdminTime(item.createdAt),
                },
                {
                    label: '最後登入', value: formatAdminTime(item.lastSignInAt),
                },
                {
                    label: '最後進站', value: formatAdminTime(item.lastActiveAt),
                },
            ],
        },
        {
            title: '個人資料',
            rows: [
                {
                    label: '生日', value: profile.birthDate ?? '未填寫',
                },
                {
                    label: '星座', value: profile.zodiac ? ZODIAC_LABELS[profile.zodiac] : '—',
                },
                {
                    label: '出生時間', value: profile.birthTime ?? '—',
                },
                {
                    label: '出生地點', value: city ? cityLabel(city) : (profile.birthPlace ?? '—'),
                },
                {
                    label: '性別', value: profile.gender ? GENDER_LABELS[profile.gender] : '—',
                },
                {
                    label: '血型', value: profile.bloodType ? BLOOD_TYPE_LABELS[profile.bloodType] : '—',
                },
                {
                    label: 'MBTI', value: profile.mbti ?? '—',
                },
                {
                    label: 'MBTI 到期', value: formatAdminTime(profile.mbtiExpiresAt),
                },
                {
                    label: '資料更新', value: formatAdminTime(profile.profileUpdatedAt),
                },
            ],
        },
        {
            title: '使用狀況',
            rows: [
                {
                    label: '可用點數', value: count(item.pointBalance),
                },
                {
                    label: '多維度報告', value: count(item.multiReportCount),
                },
                {
                    label: '單維度報告快照', value: count(usage.reportSnapshots),
                },
                {
                    label: '塔羅紀錄', value: count(usage.tarotDraws),
                },
                {
                    label: '盧恩紀錄', value: count(usage.runeDraws),
                },
                {
                    label: '卦象紀錄', value: count(usage.hexagramDraws),
                },
            ],
        },
    ];
});

async function load() {
    if (!props.user) return;

    loading.value = true;
    error.value = null;
    detail.value = null;

    try {
        detail.value = await api.get<AdminUserDetail>(`/api/admin/users/${encodeURIComponent(props.user.uid)}`);
    } catch (caught) {
        console.error('[UserDetailDialog] load failed:', caught);
        error.value = adminErrorMessage(caught);
    } finally {
        loading.value = false;
    }
}

watch(() => props.modelValue, (open) => {
    if (open) void load();
});

function close() {
    emit('update:modelValue', false);
}
</script>

<style scoped>
.section {
    margin-bottom: 20px;
}

.section__title {
    margin-bottom: 8px;
    font-size: 0.875rem;
    font-weight: 600;
    letter-spacing: 0.04em;
    color: rgba(var(--v-theme-on-surface), var(--v-medium-emphasis-opacity));
}

.rows {
    margin: 0;
}

.row {
    display: flex;
    gap: 16px;
    padding: 6px 0;
    border-bottom: 1px solid rgba(var(--v-theme-on-surface), 0.08);
    font-size: 0.9375rem;
}

.row dt {
    flex: none;
    width: 7.5em;
    color: rgba(var(--v-theme-on-surface), var(--v-medium-emphasis-opacity));
}

.row dd {
    margin: 0;
    overflow-wrap: anywhere;
}

.row__mono {
    font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
    font-size: 0.8125rem;
}
</style>
