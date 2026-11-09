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
                    <img
                        src="/logo-mark.png"
                        alt="Facet yourself"
                        class="brand__logo"
                    >
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
                to="/pricing?tab=points"
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
                :aria-label="drawer ? '收合選單' : '開啟選單'"
                :aria-expanded="drawer"
                @click="drawer = !drawer"
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

        <v-footer class="site-footer">
            <span>© 2026 gk</span>
            <a
                href="https://portfolio-cbf.pages.dev"
                target="_blank"
                rel="noopener noreferrer"
            >作品集</a>
            <span v-if="buildCommit">build {{ buildCommit }}</span>
        </v-footer>

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
            <!-- Who is signed in: the Google avatar and the e-mail the account was opened with -->
            <template
                v-if="isAuthenticated"
                #prepend
            >
                <div class="drawer-account">
                    <v-avatar
                        size="40"
                        color="primary"
                        variant="tonal"
                    >
                        <img
                            v-if="avatarUrl"
                            :src="avatarUrl"
                            alt=""
                            referrerpolicy="no-referrer"
                            class="drawer-account__photo"
                            @error="avatarFailed = true"
                        >
                        <span v-else>{{ accountInitial }}</span>
                    </v-avatar>
                    <span class="drawer-account__email">{{ user?.email }}</span>
                </div>
                <v-divider />
            </template>
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
};

/** The main routes, in the header from md up and in the drawer below it */
const navItems: MenuItem[] = [
    ...(TAROT_ENTRY_ENABLED || KIN_ENTRY_ENABLED || RUNE_ENTRY_ENABLED
        ? [
            {
                to: '/fortune', label: '今日運勢', icon: 'mdi-cards-playing-outline',
            },
        ]
        : []),
    {
        to: '/self-reports', label: '自我探索', icon: 'mdi-file-document-outline',
    },
    {
        to: '/report', label: '綜合分析', icon: 'mdi-layers-outline',
    },
    {
        to: '/pricing', label: '點數方案', icon: 'mdi-tag-outline',
    },
];

/** The account itself, kept at the bottom */
const accountItems: MenuItem[] = [
    {
        to: '/profile', label: '個人資料', icon: 'mdi-account-outline',
    },
    {
        to: '/me', label: '帳號管理', icon: 'mdi-cog-outline',
    },
];

const { buildCommit } = useRuntimeConfig().public;

const drawer = ref(false);
const { mdAndUp } = useDisplay();
const {
    user, isAuthenticated, initialized, initAuthListener, signOut, welcomePoints, dismissWelcome,
} = useAuth();

/** The Google photo, until it fails to load; then the first letter of the e-mail stands in for it */
const avatarFailed = ref(false);
const avatarUrl = computed(() => (avatarFailed.value ? '' : user.value?.photoURL ?? ''));
const accountInitial = computed(() => (user.value?.email ?? '?').charAt(0).toUpperCase());
const { viewer } = useViewer();
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
.drawer-account {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 16px;
}

.drawer-account__photo {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.drawer-account__email {
    min-width: 0;
    overflow: hidden;
    font-size: 0.875rem;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.brand {
    display: inline-flex;
    flex-direction: column;
    gap: 2px;
    line-height: 1.2;
    color: rgb(var(--v-theme-night));
    text-decoration: none;
}

.brand__logo {
    display: block;
    height: 28px;
    width: auto;
}

.brand__name {
    font-size: 0.8125rem;
    letter-spacing: 0.1em;
    color: rgba(var(--v-theme-on-surface), 0.6);
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

.site-footer {
    justify-content: center;
    flex: 0 0 auto;
    gap: 16px;
    /* The bottom is left clear for the floating back button */
    padding: 24px 16px 96px;
    font-size: 0.75rem;
    color: rgba(var(--v-theme-on-surface), 0.6);
    background: transparent;
}

.site-footer a {
    color: inherit;
    text-decoration: underline;
}
</style>
