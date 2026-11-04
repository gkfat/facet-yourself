export type Viewer = 'unknown' | 'member' | 'guest';

/**
 * Who is looking, once that is known. Firebase restores a session in two steps (the user first, the ID token a
 * moment later), and a member's requests need the token, so until both are there nobody can be told apart
 * from a visitor: that stretch is "unknown" rather than a guess.
 */
export function useViewer() {
    const {
        isAuthenticated, initialized, user, initAuthListener,
    } = useAuth();

    const viewer = computed<Viewer>(() => {
        if (!initialized.value) return 'unknown';
        if (isAuthenticated.value) return 'member';

        return user.value ? 'unknown' : 'guest';
    });

    /** Resolves with the viewer as soon as it is known. */
    async function settled(): Promise<Exclude<Viewer, 'unknown'>> {
        initAuthListener();

        if (viewer.value !== 'unknown') return viewer.value;

        return new Promise((resolve) => {
            const stop = watch(viewer, (who) => {
                if (who === 'unknown') return;

                stop();
                resolve(who);
            });
        });
    }

    return {
        viewer, settled,
    };
}
