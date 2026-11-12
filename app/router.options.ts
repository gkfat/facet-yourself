import type { RouterConfig } from '@nuxt/schema';

// Nuxt's default scroll handling, except that the parts of /fortune (/fortune/tarot ...) open from the top, smoothly.
export default <RouterConfig>{
    scrollBehavior(to, from, savedPosition) {
        if (savedPosition) return savedPosition;
        if (to.path.startsWith('/fortune') && to.path !== from.path) {
            return {
                top: 0, behavior: 'smooth',
            };
        }
        if (to.hash && document.querySelector(to.hash)) {
            return {
                el: to.hash, behavior: 'smooth',
            };
        }

        return {
            top: 0, behavior: from.path === to.path ? 'smooth' : 'auto',
        };
    },
};
