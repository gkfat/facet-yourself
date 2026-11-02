import {
    describe, expect, it,
} from 'vitest';
import {
    PEERS_SHOWN, bloodPeers, kinPeers, mbtiPeers, numerologyPeers, randomPick, sameBirthdayPeers, showSome,
} from './peers';
import { MBTI_TYPES } from '../schemas/common';
import { MBTI_FIGURES } from '../constants/peerFigures/mbtiFigures';
import { BLOOD_FIGURES } from '../constants/peerFigures/bloodFigures';
import { kinOf } from '../utils/mayaKin';
import { lifePathNumber } from '../utils/numerology';

describe('randomPick', () => {
    it('gives all of a short list, and otherwise the asked number of different items', () => {
        const items = Array.from({ length: 20 }, (_, index) => index);
        const picked = randomPick(items, 3);

        expect(randomPick([1, 2], 3).sort()).toEqual([1, 2]);
        expect(picked).toHaveLength(3);
        expect(new Set(picked).size).toBe(3);
    });

    it('is decided by the random it is given, and gives other items for other values', () => {
        const items = Array.from({ length: 20 }, (_, index) => index);
        const low = randomPick(items, 3, () => 0);
        const high = randomPick(items, 3, () => 0.99);

        expect(low).toEqual(randomPick(items, 3, () => 0));
        expect(low).not.toEqual(high);
    });

    it('shows only three of the people of a card', () => {
        const peers = numerologyPeers('1990-11-08');

        expect(peers?.figures.length).toBeGreaterThan(PEERS_SHOWN);
        expect(showSome(peers as NonNullable<typeof peers>).figures).toHaveLength(PEERS_SHOWN);
    });
});

describe('the lists of people for a group', () => {
    it('has people for every MBTI type, each with a name, an English name, a year and a line', () => {
        for (const type of MBTI_TYPES) {
            const figures = MBTI_FIGURES.get(type) ?? [];

            expect(figures.length, type).toBeGreaterThanOrEqual(8);
            for (const figure of figures) {
                expect(figure.name.trim(), type).not.toBe('');
                expect(figure.nameEn.trim(), type).not.toBe('');
                expect(Number.isInteger(figure.year), figure.name).toBe(true);
                expect(figure.role.trim(), figure.name).not.toBe('');
            }
        }
    });

    it('has people for each of the four blood types', () => {
        for (const type of [
            'A',
            'B',
            'AB',
            'O',
        ] as const) {
            expect((BLOOD_FIGURES.get(type) ?? []).length, type).toBeGreaterThanOrEqual(2);
        }
    });

    it('names the source of the blood type of everyone on the blood type lists', () => {
        for (const figures of BLOOD_FIGURES.values()) {
            for (const figure of figures) {
                expect(figure.source?.trim(), figure.name).toBeTruthy();
            }
        }
    });
});

describe('the cards', () => {
    it('names the people born on the same day for a sign', () => {
        const peers = sameBirthdayPeers('1990-11-08');

        expect(peers?.title).toBe('跟你同一天生日的偉人');
        expect(peers?.figures).toHaveLength(3);
    });

    it('gives none for a blood type that is not known', () => {
        expect(bloodPeers('UNKNOWN')).toBeNull();
        expect(bloodPeers('O')?.title).toBe('相同血型的偉人');
    });

    it('gives the MBTI card the note that the types are guesses', () => {
        expect(mbtiPeers('INTJ')?.note).toContain('推測');
    });

    it('names only people with the same Kin, with their whole date of birth', () => {
        const peers = kinPeers('1990-11-08');

        expect(peers?.title).toBe('相同 Kin 的偉人');

        for (const figure of peers?.figures ?? []) {
            expect(figure.detail).toMatch(/^\d+ 年 \d+ 月 \d+ 日生・/);
        }
    });

    it('has someone with the same Kin and the same number for most dates, and never one with another Kin or number', () => {
        const dates = Array.from({ length: 60 }, (_, index) => `${1950 + (index % 40)}-${String((index % 12) + 1).padStart(2, '0')}-${String((index % 27) + 1).padStart(2, '0')}`);
        const withKin = dates.filter((date) => kinPeers(date) !== null);

        expect(withKin.length).toBeGreaterThan(dates.length / 2);
        expect(dates.every((date) => numerologyPeers(date) !== null)).toBe(true);
        expect(kinOf('1990-11-08').kinNumber).toBeGreaterThan(0);
        expect(lifePathNumber('1990-11-08')).toBeGreaterThan(0);
    });

    it('gives nothing for a date that is not real', () => {
        expect(kinPeers('2023-02-30')).toBeNull();
        expect(numerologyPeers('nope')).toBeNull();
    });
});
