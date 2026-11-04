import { createVuetify } from 'vuetify';
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';
import {
    aliases, mdi,
} from 'vuetify/iconsets/mdi';

export default defineNuxtPlugin({
    name: 'vuetify',
    setup(nuxtApp) {
        const vuetify = createVuetify({
            components,
            directives,
            theme: {
                defaultTheme: 'light',
                themes: {
                    light: {
                        colors: {
                            primary: '#2f5d8a',
                            secondary: '#5b6b7c',
                            background: '#f6f7f9',
                            surface: '#ffffff',
                            info: '#4a6f93',
                            success: '#2e7d5b',
                            warning: '#b7791f',
                            error: '#c94f4f',
                        },
                    },
                },
            },
            icons: {
                defaultSet: 'mdi',
                // Alerts take their icons from here: outlined ones sit quieter than the filled defaults
                aliases: {
                    ...aliases,
                    info: 'mdi-information-outline',
                    success: 'mdi-check-circle-outline',
                    warning: 'mdi-alert-outline',
                    error: 'mdi-alert-circle-outline',
                },
                sets: { mdi },
            },
            display: {
                mobileBreakpoint: 'sm',
                thresholds: {
                    xs: 0,
                    sm: 600,
                    md: 960,
                    lg: 1280,
                    xl: 1920,
                },
            },
        });

        nuxtApp.vueApp.use(vuetify);
    },
});
