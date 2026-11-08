import { createVuetify } from 'vuetify';
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';
import {
    aliases, mdi,
} from 'vuetify/iconsets/mdi';
import { PALETTE } from '../../shared/constants/palette';

export default defineNuxtPlugin({
    name: 'vuetify',
    setup(nuxtApp) {
        const vuetify = createVuetify({
            components,
            directives,
            theme: {
                defaultTheme: 'light',
                themes: { light: { colors: { ...PALETTE } } },
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
            // One shape for every card and field: soft corners, outlined inputs
            defaults: {
                VCard: { rounded: 'lg' },
                VTextField: { variant: 'outlined' },
                VSelect: { variant: 'outlined' },
                VAutocomplete: { variant: 'outlined' },
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
