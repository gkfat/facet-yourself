import {
    describe, expect, it,
} from 'vitest';
import { classifyRoute } from './routeAccess';

describe('classifyRoute', () => {
    it('treats listed anonymous endpoints as public', () => {
        expect(classifyRoute('POST', '/api/auth/login')).toBe('public');
        expect(classifyRoute('POST', '/api/guest-sessions')).toBe('public');
        expect(classifyRoute('PUT', '/api/guest-sessions/abc/profile')).toBe('public');
        expect(classifyRoute('GET', '/api/guest-sessions/abc/profile')).toBe('public');
        expect(classifyRoute('POST', '/api/zodiac/natal-chart')).toBe('public');
        expect(classifyRoute('POST', '/api/bazi/calculations')).toBe('public');
        expect(classifyRoute('POST', '/api/ziwei/calculations')).toBe('public');
        expect(classifyRoute('GET', '/api/fixed-results/zodiac?birthDate=2000-01-01')).toBe('public');
        expect(classifyRoute('GET', '/api/fixed-results/maya-kin?birthDate=2000-01-01')).toBe('public');
        expect(classifyRoute('GET', '/api/tests')).toBe('public');
        expect(classifyRoute('GET', '/api/tests/mbti')).toBe('public');
        expect(classifyRoute('GET', '/api/home/preview?sign=aries&lifePath=7')).toBe('public');
    });

    it('allows anonymous or guest callers on optional endpoints', () => {
        expect(classifyRoute('POST', '/api/tests/mbti/submissions')).toBe('optional');
        expect(classifyRoute('POST', '/api/human-design/calculations')).toBe('optional');
        expect(classifyRoute('POST', '/api/share-cards')).toBe('optional');
        expect(classifyRoute('POST', '/api/single-reports')).toBe('optional');
        expect(classifyRoute('GET', '/api/assessments')).toBe('optional');
        expect(classifyRoute('GET', '/api/tarot/daily')).toBe('optional');
        expect(classifyRoute('POST', '/api/tarot/daily')).toBe('optional');
        expect(classifyRoute('GET', '/api/rune/daily')).toBe('optional');
        expect(classifyRoute('POST', '/api/rune/daily')).toBe('optional');
        expect(classifyRoute('GET', '/api/hexagram/daily')).toBe('optional');
        expect(classifyRoute('POST', '/api/hexagram/daily')).toBe('optional');
        expect(classifyRoute('GET', '/api/kin/today')).toBe('optional');
        expect(classifyRoute('POST', '/api/kin/today')).toBe('optional');
        expect(classifyRoute('GET', '/api/horoscope/daily')).toBe('optional');
        expect(classifyRoute('POST', '/api/assessments/enneagram/results')).toBe('optional');
    });

    it('leaves the back office to the default, which asks for a signed-in user', () => {
        expect(classifyRoute('GET', '/api/admin/users')).toBe('required');
        expect(classifyRoute('PATCH', '/api/admin/users/abc')).toBe('required');
        expect(classifyRoute('DELETE', '/api/admin/users/abc')).toBe('required');
        expect(classifyRoute('GET', '/api/admin/dashboard/summary')).toBe('required');
    });

    it('needs a signed-in member for the history of the daily draws, which a visitor does not have', () => {
        expect(classifyRoute('GET', '/api/fortune/history')).toBe('required');
        expect(classifyRoute('GET', '/api/fortune/history?before=2026-11-01&limit=14')).toBe('required');
    });

    it('keeps writing a horoscope out of reach', () => {
        expect(classifyRoute('POST', '/api/horoscope/daily')).toBe('required');
    });

    it('needs a signed-in member for the latest result of an assessment', () => {
        expect(classifyRoute('GET', '/api/assessments/enneagram/results/latest')).toBe('required');
    });

    it('lets webhook and cron verify themselves', () => {
        expect(classifyRoute('POST', '/api/payments/webhook')).toBe('self');
        expect(classifyRoute('GET', '/api/cron/data-expiry')).toBe('self');
    });

    it('requires a token for everything else, including claiming a guest session', () => {
        expect(classifyRoute('POST', '/api/guest-sessions/abc/claim')).toBe('required');
        expect(classifyRoute('POST', '/api/summaries')).toBe('required');
        expect(classifyRoute('DELETE', '/api/account')).toBe('required');
        expect(classifyRoute('GET', '/api/unknown')).toBe('required');
        expect(classifyRoute('GET', '/api/report-snapshots')).toBe('required');
        expect(classifyRoute('GET', '/api/report-snapshots/abc')).toBe('required');
    });

    it('does not make a public path public for other methods', () => {
        expect(classifyRoute('DELETE', '/api/tests/mbti')).toBe('required');
        expect(classifyRoute('GET', '/api/bazi/calculations')).toBe('required');
        expect(classifyRoute('GET', '/api/ziwei/calculations')).toBe('required');
    });
});
