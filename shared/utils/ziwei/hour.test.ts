import {
    describe, expect, it,
} from 'vitest';
import { BRANCHES } from '../../constants/bazi';
import {
    ZiweiTimeError,
    ziweiHourOf,
} from './hour';

/** A time well inside each branch (the middle of its two hours), 子 first. */
const MIDDLE_OF_BRANCH = [
    '00:00',
    '02:00',
    '04:00',
    '06:00',
    '08:00',
    '10:00',
    '12:00',
    '14:00',
    '16:00',
    '18:00',
    '20:00',
    '22:00',
] as const;

describe('ziweiHourOf', () => {
    it('maps the middle of each of the twelve hours to its branch', () => {
        MIDDLE_OF_BRANCH.forEach((time, index) => {
            expect(ziweiHourOf(time).hourBranch).toBe(BRANCHES[index]);
        });
    });

    it('changes the branch at each odd hour', () => {
        expect(ziweiHourOf('00:59').hourBranch).toBe('子');
        expect(ziweiHourOf('01:00').hourBranch).toBe('丑');
        expect(ziweiHourOf('12:59').hourBranch).toBe('午');
        expect(ziweiHourOf('13:00').hourBranch).toBe('未');
        expect(ziweiHourOf('22:59').hourBranch).toBe('亥');
        expect(ziweiHourOf('23:00').hourBranch).toBe('子');
    });

    it('marks the late 子 hour without changing the branch', () => {
        const hour = ziweiHourOf('23:30');

        expect(hour.hourBranch).toBe('子');
        expect(hour.notes).toContainEqual({ kind: 'LATE_ZI' });
    });

    it('does not mark 00:30 as late 子', () => {
        expect(ziweiHourOf('00:30').notes).toEqual([]);
    });

    it('warns within 15 minutes after a boundary and names the previous branch', () => {
        expect(ziweiHourOf('09:10').notes).toEqual([
            {
                kind: 'HOUR_BOUNDARY',
                minutesFromBoundary: 10,
                neighbourBranch: '辰',
            },
        ]);
    });

    it('warns within 15 minutes before a boundary and names the next branch', () => {
        expect(ziweiHourOf('10:50').notes).toEqual([
            {
                kind: 'HOUR_BOUNDARY',
                minutesFromBoundary: 10,
                neighbourBranch: '午',
            },
        ]);
    });

    it('warns at exactly 15 minutes but not at 16', () => {
        expect(ziweiHourOf('09:15').notes).toHaveLength(1);
        expect(ziweiHourOf('09:16').notes).toEqual([]);
        expect(ziweiHourOf('10:45').notes).toHaveLength(1);
        expect(ziweiHourOf('10:44').notes).toEqual([]);
    });

    it('gives both notices at 23:10', () => {
        expect(ziweiHourOf('23:10').notes.map((note) => note.kind)).toEqual(['LATE_ZI', 'HOUR_BOUNDARY']);
    });

    it('rejects a malformed time', () => {
        expect(() => ziweiHourOf('9:00')).toThrow(ZiweiTimeError);
        expect(() => ziweiHourOf('24:00')).toThrow(ZiweiTimeError);
        expect(() => ziweiHourOf('12:60')).toThrow(ZiweiTimeError);
    });
});
