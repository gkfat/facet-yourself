// Link previews need an absolute image URL; set when the site's address is known (see .env.example)
const siteUrl = process.env.NUXT_PUBLIC_SITE_URL?.replace(/\/$/, '');

export default defineNuxtConfig({
    compatibilityDate: '2025-07-15',
    devtools: { enabled: false },
    modules: ['@nuxt/eslint'],

    app: {
        head: {
            charset: 'utf-8',
            viewport: 'width=device-width, initial-scale=1',
            htmlAttrs: { lang: 'zh-TW' },
            meta: [
                {
                    name: 'theme-color', content: '#171f3d',
                },
                {
                    name: 'description', content: 'Facet yourself 多維度自我分析：從星座、MBTI、人類圖、八字等不同角度認識自己，再由 AI 疊合成一份屬於你的報告。',
                },
                {
                    property: 'og:site_name', content: 'Facet yourself',
                },
                {
                    property: 'og:title', content: 'Facet yourself｜多維度自我分析',
                },
                {
                    property: 'og:description', content: '從不同的角度認識自己，再把它們疊在一起看。',
                },
                ...(siteUrl
                    ? [
                        {
                            property: 'og:image', content: `${siteUrl}/og.png`,
                        }, {
                            name: 'twitter:card', content: 'summary_large_image',
                        },
                    ]
                    : []),
            ],
            link: [
                {
                    rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg',
                },
                {
                    rel: 'preconnect', href: 'https://fonts.googleapis.com',
                },
                {
                    rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '',
                },
                {
                    rel: 'stylesheet',
                    href: 'https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@400;500;700&family=Noto+Serif+TC:wght@500;700&display=swap',
                },
            ],
        },
    },

    // SPA mode for Vercel deployment
    ssr: false,

    css: [
        'vuetify/lib/styles/main.sass',
        '@mdi/font/css/materialdesignicons.min.css',
        '~/assets/css/main.css',
    ],

    build: { transpile: ['vuetify'] },

    // Vercel deployment preset
    nitro: {
        preset: 'vercel',
        // Detailed reports keep running after the response (waitUntil); allow the 120 s AI timeout plus settling
        vercel: { functions: { maxDuration: 180 } },
    },

    /**
     * Env handling:
     * - Private runtimeConfig keys are server-only
     * - runtimeConfig.public keys are exposed to client bundle
     *
     * Nuxt automatically loads `.env`.
     */
    runtimeConfig: {
        // Server-only configuration
        firebaseProjectId: process.env.FIREBASE_PROJECT_ID,
        firestoreEmulatorHost: process.env.FIRESTORE_EMULATOR_HOST,
        // Shared secret Vercel Cron sends as `Authorization: Bearer $CRON_SECRET`
        cronSecret: process.env.CRON_SECRET,
        // HMAC key for the welcome-grant ledger (Google uid is never stored raw)
        welcomeGrantHmacKey: process.env.WELCOME_GRANT_HMAC_KEY,
        // Payment provider id; 'dev' (local only) until a real provider is chosen
        paymentProvider: process.env.PAYMENT_PROVIDER,
        paymentDevWebhookSecret: process.env.PAYMENT_DEV_WEBHOOK_SECRET,
        // OpenAI for detailed reports; the model and prices are overridable without a code change
        openaiApiKey: process.env.OPENAI_API_KEY,
        openaiModel: process.env.OPENAI_MODEL,
        openaiReasoningEffort: process.env.OPENAI_REASONING_EFFORT,
        aiPriceInputPerMtok: process.env.AI_PRICE_INPUT_PER_MTOK,
        aiPriceOutputPerMtok: process.env.AI_PRICE_OUTPUT_PER_MTOK,

        // Public configuration (exposed to client)
        public: {
            firebaseApiKey: process.env.NUXT_PUBLIC_FIREBASE_API_KEY || '',
            firebaseAuthDomain: process.env.NUXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
            firebaseProjectId:
                process.env.NUXT_PUBLIC_FIREBASE_PROJECT_ID ||
                process.env.FIREBASE_PROJECT_ID ||
                '',
            firebaseStorageBucket: process.env.NUXT_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
            firebaseMessagingSenderId: process.env.NUXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
            firebaseAppId: process.env.NUXT_PUBLIC_FIREBASE_APP_ID || '',
        },
    },
});
