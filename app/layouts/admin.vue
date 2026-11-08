<template>
    <div>
        <v-app-bar
            flat
            border="b"
        >
            <v-app-bar-nav-icon
                :aria-label="drawer ? '收合選單' : '展開選單'"
                :aria-expanded="drawer"
                @click="drawer = !drawer"
            />
            <v-app-bar-title>
                <NuxtLink
                    to="/admin"
                    class="admin-brand"
                >
                    <img
                        src="/logo-mark.png"
                        alt="Facet yourself"
                        class="admin-brand__logo"
                    >
                    <span class="admin-brand__name">後台</span>
                </NuxtLink>
            </v-app-bar-title>
        </v-app-bar>

        <v-navigation-drawer
            v-model="drawer"
            :temporary="!mdAndUp"
        >
            <v-list
                nav
                density="comfortable"
            >
                <v-list-item
                    v-for="item in navItems"
                    :key="item.to"
                    :to="item.to"
                    :prepend-icon="item.icon"
                    :title="item.label"
                    exact
                    @click="closeOnMobile"
                />
            </v-list>
        </v-navigation-drawer>

        <v-main>
            <v-container class="admin-page">
                <slot />
            </v-container>
        </v-main>
    </div>
</template>

<script lang="ts" setup>
import { useDisplay } from 'vuetify';

type MenuItem = {
    to: string;
    label: string;
    icon: string;
};

const navItems: MenuItem[] = [
    {
        to: '/admin', label: 'Dashboard', icon: 'mdi-view-dashboard-outline',
    },
    {
        to: '/admin/users', label: '使用者', icon: 'mdi-account-multiple-outline',
    },
];

const { mdAndUp } = useDisplay();

// Open beside the page on a wide screen, closed (and over the page when opened) on a narrow one.
const drawer = ref(mdAndUp.value);

function closeOnMobile() {
    if (!mdAndUp.value) drawer.value = false;
}

// The back office is not for search engines, even though nothing links to it.
useHead({ meta: [{
    name: 'robots', content: 'noindex, nofollow',
}] });
</script>

<style scoped>
.admin-brand {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    color: inherit;
    text-decoration: none;
}

.admin-brand__logo {
    height: 28px;
    width: auto;
}

.admin-brand__name {
    font-size: 1rem;
    font-weight: 600;
}

.admin-page {
    max-width: 1200px;
}
</style>
