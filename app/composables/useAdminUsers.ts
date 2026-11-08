import type {
    AdminUserList, AdminUserListItem,
} from '../../shared/schemas/api/adminUsers.schema';

const PAGE_SIZE = 20;

/** The member list of the back office: a page at a time, newest first, or one member found by email. */
export const useAdminUsers = () => {
    const api = useApi();

    const items = ref<AdminUserListItem[]>([]);
    const nextCursor = ref<string | null>(null);
    const loading = ref(false);
    const error = ref<string | null>(null);
    const email = ref('');

    async function fetchPage(cursor: string | null): Promise<AdminUserList> {
        const query: Record<string, string | number> = { limit: PAGE_SIZE };

        if (cursor) query.cursor = cursor;
        else if (email.value) query.email = email.value;

        return api.get<AdminUserList>('/api/admin/users', { query });
    }

    /** Load the first page again (with the current email search, if any). */
    async function load() {
        loading.value = true;
        error.value = null;

        try {
            const page = await fetchPage(null);

            items.value = page.items;
            nextCursor.value = page.nextCursor;
        } catch (caught) {
            console.error('[useAdminUsers] load failed:', caught);
            error.value = adminErrorMessage(caught);
        } finally {
            loading.value = false;
        }
    }

    async function loadMore() {
        if (!nextCursor.value || loading.value) return;

        loading.value = true;
        error.value = null;

        try {
            const page = await fetchPage(nextCursor.value);

            items.value = [...items.value, ...page.items];
            nextCursor.value = page.nextCursor;
        } catch (caught) {
            console.error('[useAdminUsers] load more failed:', caught);
            error.value = adminErrorMessage(caught);
        } finally {
            loading.value = false;
        }
    }

    async function search(value: string) {
        email.value = value.trim().toLowerCase();
        await load();
    }

    return {
        items,
        nextCursor,
        loading,
        error,
        email,
        load,
        loadMore,
        search,
    };
};
