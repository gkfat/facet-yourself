/** One dashboard figure: loaded on its own, so a slow or failing one does not hold back the rest. */
export const useAdminResource = <T>(url: string, query?: Record<string, string | number>) => {
    const api = useApi();

    const data = ref<T | null>(null) as Ref<T | null>;
    const loading = ref(false);
    const error = ref<string | null>(null);

    async function load() {
        loading.value = true;
        error.value = null;

        try {
            data.value = await api.get<T>(url, query ? { query } : {});
        } catch (caught) {
            console.error(`[useAdminResource] ${url} failed:`, caught);
            error.value = adminErrorMessage(caught);
        } finally {
            loading.value = false;
        }
    }

    return {
        data, loading, error, load,
    };
};
