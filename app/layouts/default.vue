<template>
    <div>
        <v-app-bar
            flat
            border="b"
            class="app-bar"
        >
            <v-app-bar-title>
                <NuxtLink
                    to="/"
                    class="brand"
                >
                    <span class="brand__mark font-display">Facet yourself</span>
                    <span class="brand__name">多維度自我分析</span>
                </NuxtLink>
            </v-app-bar-title>

            <nav
                v-if="mdAndUp"
                class="header-nav"
                aria-label="主要選單"
            >
                <v-btn
                    v-for="item in navItems"
                    :key="item.to"
                    :to="item.to"
                    variant="text"
                    size="small"
                >
                    {{ item.label }}
                </v-btn>
            </nav>

            <v-spacer />

            <v-btn
                v-if="isAuthenticated"
                to="/points"
                variant="tonal"
                size="small"
                prepend-icon="mdi-circle-multiple-outline"
                class="mr-2"
            >
                {{ balance ?? '—' }} 點
            </v-btn>
            <v-btn
                v-if="isAuthenticated || (initialized && !mdAndUp)"
                icon="mdi-menu"
                variant="text"
                aria-label="開啟選單"
                @click="drawer = true"
            />
            <template v-else-if="initialized">
                <span class="login-promo mr-3">現在登入即贈送 3 點！</span>
                <v-btn
                    size="small"
                    variant="outlined"
                    color="primary"
                    prepend-icon="mdi-login"
                    class="mr-2"
                    to="/login"
                >
                    登入
                </v-btn>
            </template>
        </v-app-bar>

        <v-main class="layout-main">
            <v-container class="page">
                <slot />
            </v-container>
        </v-main>

        <v-dialog
            :model-value="welcomePoints > 0"
            max-width="400"
            @update:model-value="dismissWelcome"
        >
            <v-card>
                <v-card-title>歡迎加入！</v-card-title>
                <v-card-text>
                    你收到系統贈送的 {{ welcomePoints }} 點，可用在綜合分析。贈送的點數自發放日起 {{ WELCOME_BATCH_VALID_DAYS }} 天內有效。
                </v-card-text>
                <v-card-actions>
                    <v-spacer />
                    <v-btn
                        color="primary"
                        @click="dismissWelcome"
                    >
                        知道了
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <v-navigation-drawer
            v-if="isAuthenticated || !mdAndUp"
            v-model="drawer"
            location="right"
            temporary
        >
            <v-list
                v-if="!mdAndUp"
                nav
                density="comfortable"
            >
                <v-list-item
                    v-for="item in navItems"
                    :key="item.to"
                    :to="item.to"
                    :prepend-icon="item.icon"
                    :title="item.label"
                    @click="drawer = false"
                />
            </v-list>
            <template
                v-if="isAuthenticated"
                #append
            >
                <v-divider />
                <v-list
                    nav
                    density="comfortable"
                >
                    <v-list-item
                        v-for="item in accountItems"
                        :key="item.to"
                        :to="item.to"
                        :prepend-icon="item.icon"
                        :title="item.label"
                        @click="drawer = false"
                    />
                    <v-list-item
                        prepend-icon="mdi-logout"
                        title="登出"
                        @click="logout"
                    />
                </v-list>
            </template>
        </v-navigation-drawer>
    </div>
</template>

<script lang="ts" setup>
import { useDisplay } from 'vuetify';
import { WELCOME_BATCH_VALID_DAYS } from '../../shared/constants/points';
import { KIN_ENTRY_ENABLED } from '../../shared/constants/mayaKin';
import { RUNE_ENTRY_ENABLED } from '../../shared/constants/runes';
import { TAROT_ENTRY_ENABLED } from '../../shared/constants/tarot';

type MenuItem = {
    to: string;
    label: string;
    icon: string;
    /** Left out of the list a visitor sees */
    memberOnly?: boolean;
};

/** The main routes, in the header from md up and in the drawer below it */
const allNavItems: MenuItem[] = [
    ...(TAROT_ENTRY_ENABLED || KIN_ENTRY_ENABLED || RUNE_ENTRY_ENABLED
        ? [
            {
                to: '/fortune', label: '今日運勢', icon: 'mdi-cards-playing-outline',
            },
        ]
        : []),
    {
        to: '/profile', label: '個人資料', icon: 'mdi-account-outline', memberOnly: true,
    },
    {
        to: '/self-reports', label: '自我探索', icon: 'mdi-file-document-outline',
    },
    {
        to: '/report', label: '綜合分析', icon: 'mdi-layers-outline',
    },
    {
        to: '/ai-reports', label: '分析紀錄', icon: 'mdi-creation-outline', memberOnly: true,
    },
    {
        to: '/pricing', label: '點數方案', icon: 'mdi-tag-outline',
    },
];

/** The account itself: points, payments and settings, kept at the bottom */
const accountItems: MenuItem[] = [
    {
        to: '/points', label: '點數紀錄', icon: 'mdi-circle-multiple-outline',
    },
    {
        to: '/payments', label: '付款紀錄', icon: 'mdi-receipt-text-outline',
    },
    {
        to: '/me', label: '帳號管理', icon: 'mdi-cog-outline',
    },
];

const drawer = ref(false);
const { mdAndUp } = useDisplay();
const {
    isAuthenticated, initialized, initAuthListener, signOut, welcomePoints, dismissWelcome,
} = useAuth();
const { viewer } = useViewer();
const navItems = computed(() => allNavItems.filter((item) => !item.memberOnly || isAuthenticated.value));
const {
    balance, refresh: refreshPoints, clear: clearPoints,
} = usePoints();
const { load: loadExploration } = useExploration();

async function logout() {
    drawer.value = false;
    await signOut();
    // Pages for members only have nothing left to show
    await navigateTo('/');
}

// Reload what belongs to whoever is looking, once per change of viewer.
watch(viewer, async (who) => {
    if (who === 'unknown') return;

    if (who === 'member') {
        await Promise.all([refreshPoints(), loadExploration()]);

        return;
    }

    clearPoints();
    await loadExploration();
}, { immediate: true });

onMounted(() => {
    initAuthListener();
});
</script>

<style scoped>
.brand {
    display: inline-flex;
    align-items: baseline;
    gap: 10px;
    color: rgb(var(--v-theme-night));
    text-decoration: none;
}

.brand__mark {
    font-size: 1.375rem;
    letter-spacing: 0.04em;
}

.brand__name {
    font-size: 0.8125rem;
    letter-spacing: 0.1em;
    color: rgba(var(--v-theme-on-surface), 0.6);
}

/* The wordmark alone below the xl breakpoint: the header has the buttons to fit */
@media (max-width: 1279px) {
    .brand__name {
        display: none;
    }
}

/* A hairline in the night ink instead of Vuetify's grey */
.app-bar {
    border-bottom-color: rgba(var(--v-theme-night), 0.12) !important;
}

/* A full-width backdrop on a page must not add a horizontal scrollbar. */
.layout-main {
    overflow-x: clip;
}

/* The title takes only its own width, so the links sit right next to it */
:deep(.v-toolbar-title) {
    flex: 0 0 auto;
}

.header-nav {
    display: flex;
    align-items: center;
    gap: 2px;
    margin-left: 16px;
}

.login-promo {
    font-size: 0.8125rem;
    color: rgb(var(--v-theme-primary));
    white-space: nowrap;
}

/* Very narrow phones: the button alone, so the title and the button both fit. */
@media (max-width: 420px) {
    .login-promo {
        display: none;
    }
}

.page {
    max-width: 960px;
}
</style>
