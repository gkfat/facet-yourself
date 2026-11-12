const LOCAL_HOSTNAMES = new Set([
    'localhost',
    '127.0.0.1',
    '[::1]',
]);

export default defineNuxtPlugin({
    name: 'ga',
    setup() {
        const { gaMeasurementId } = useRuntimeConfig().public;
        if (!gaMeasurementId) return;
        // 本機開發不蒐集流量
        if (LOCAL_HOSTNAMES.has(window.location.hostname)) return;

        window.dataLayer = window.dataLayer || [];
        // gtag 必須 push arguments 物件，不能改成 rest 參數
        window.gtag = function gtag() {
            // eslint-disable-next-line prefer-rest-params
            window.dataLayer?.push(arguments);
        };
        window.gtag('js', new Date());
        // 預設的 Enhanced measurement 會監聽 History 變更，SPA 切頁會自動記 page_view
        window.gtag('config', gaMeasurementId);

        const script = document.createElement('script');
        script.async = true;
        script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(gaMeasurementId)}`;
        document.head.appendChild(script);
    },
});

declare global {
    interface Window {
        dataLayer?: unknown[];
        gtag?: (...args: unknown[]) => void;
    }
}
