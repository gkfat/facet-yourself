/** A time shown in the back office: Taipei time, minutes precision. */
export function formatAdminTime(epochMs: number | null): string {
    if (epochMs === null) return '—';

    return new Date(epochMs).toLocaleString('zh-TW', {
        timeZone: 'Asia/Taipei',
        hour12: false,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
    });
}

/** The reason an admin API call failed, as the server gave it when it did. */
export function adminErrorMessage(error: unknown): string {
    if (typeof error === 'object' && error !== null) {
        const data = (error as { data?: { message?: string } }).data;

        if (data?.message) return data.message;
    }

    return error instanceof Error ? error.message : '載入失敗，請稍後再試';
}

/** `2026-11-09` as `11/09`. */
export function shortDate(dateKey: string): string {
    return dateKey.slice(5).replace('-', '/');
}
