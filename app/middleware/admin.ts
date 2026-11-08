/**
 * Pages of the back office. Guidance only: it keeps the interface from showing to anyone but the administrator,
 * while every /api/admin/* call is authorised again by the server (requireAdmin).
 * A visitor goes to the sign-in page and comes back here; a member without the `admin` claim goes home.
 */
export default defineNuxtRouteMiddleware(async (to) => {
    const {
        isAuthenticated, initialized, user, idToken, initAuthListener,
    } = useAuth();

    initAuthListener();

    // Same wait as the member pages: Firebase restores the session asynchronously.
    const settled = () => initialized.value && (!user.value || Boolean(idToken.value));

    if (!settled()) {
        await new Promise<void>((resolve) => {
            const stop = watch([
                initialized,
                user,
                idToken,
            ], () => {
                if (!settled()) return;

                stop();
                resolve();
            }, { immediate: true });
        });
    }

    if (!isAuthenticated.value || !user.value) return navigateTo({
        path: '/login', query: { redirect: to.fullPath },
    });

    try {
        // Force a refresh: a claim granted after the last sign-in is only in a fresh token.
        const { claims } = await user.value.getIdTokenResult(true);

        if (claims.admin !== true) return navigateTo('/');
    } catch (error) {
        console.error('[admin middleware] Could not read the token claims:', error);

        return navigateTo('/');
    }
});
