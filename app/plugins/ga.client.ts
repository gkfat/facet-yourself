/** 內部頁面不送 GA（管理後台） */
const EXCLUDED_PATH_PREFIXES = ['/admin'];

/** 每份報告一個 id 的路徑，歸併成同一頁，避免頁面報表碎裂 */
const PATH_NORMALIZERS: readonly { pattern: RegExp; replacement: string }[] = [
    {
        pattern: /^\/ai-reports\/[^/]+$/, replacement: '/ai-reports/detail',
    },
];

function normalizePath(path: string): string {
    const rule = PATH_NORMALIZERS.find((item) => item.pattern.test(path));

    return rule ? rule.replacement : path;
}

export default defineNuxtPlugin({
    name: 'ga',
    setup() {
        const {
            gaMeasurementId, gaHostnames, 
        } = useRuntimeConfig().public;
        if (!gaMeasurementId) return;
        // 只在指定網域蒐集：localhost 與 Vercel preview 網域都不在清單內
        const allowedHostnames = gaHostnames.split(',').map((host) => host.trim()).filter(Boolean);
        if (!allowedHostnames.includes(window.location.hostname)) return;

        window.dataLayer = window.dataLayer || [];
        // gtag 必須 push arguments 物件，不能改成 rest 參數
        window.gtag = function gtag() {
            // eslint-disable-next-line prefer-rest-params
            window.dataLayer?.push(arguments);
        };
        window.gtag('js', new Date());
        // page_view 由下方手動送，才能排除 /admin、並且不把 query／hash 帶進 GA
        window.gtag('config', gaMeasurementId, { send_page_view: false });

        const script = document.createElement('script');
        script.async = true;
        script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(gaMeasurementId)}`;
        document.head.appendChild(script);

        useRouter().afterEach((to, from, failure) => {
            if (failure) return;
            if (EXCLUDED_PATH_PREFIXES.some((prefix) => to.path.startsWith(prefix))) return;
            // 同一頁只換 query／hash（例如 /report?systems=）不重複計算
            if (from.matched.length > 0 && to.path === from.path) return;

            const path = normalizePath(to.path);

            window.gtag?.('event', 'page_view', {
                page_path: path,
                page_location: `${window.location.origin}${path}`,
                page_title: document.title,
            });
        });
    },
});

declare global {
    interface Window {
        dataLayer?: unknown[];
        gtag?: (...args: unknown[]) => void;
    }
}
