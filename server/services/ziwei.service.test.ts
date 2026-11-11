import {
    describe, expect, it,
} from 'vitest';
import { ziweiResponseSchema } from '../../shared/schemas/api/ziwei.schema';
import { ValidationError } from '../../shared/types/errors';
import { ZiweiService } from './ziwei.service';

const reference = {
    birthDate: '1990-05-17',
    birthTime: '10:00',
    birthPlace: 'tw-taipei',
} as const;

describe('ZiweiService', () => {
    it('gives a chart that satisfies the response schema', () => {
        const result = new ZiweiService().calculate(reference);

        expect(() => ziweiResponseSchema.parse(result)).not.toThrow();
        expect(result.palaces).toHaveLength(12);
        expect(result.algorithmVersion).toBe('sanhe-v2');
        expect(result.timeZone).toBe('Asia/Taipei');
        expect(result.timeZoneAssumed).toBe(false);
    });

    it('assumes Asia/Taipei when no place is given and says so', () => {
        const result = new ZiweiService().calculate({
            birthDate: reference.birthDate,
            birthTime: reference.birthTime,
        });

        expect(result.timeZone).toBe('Asia/Taipei');
        expect(result.timeZoneAssumed).toBe(true);
    });

    it('gives the same chart for the same input', () => {
        expect(new ZiweiService().calculate(reference)).toEqual(new ZiweiService().calculate(reference));
    });

    it('keeps the lunar year before the lunar new year, not at 立春', () => {
        // 1990-01-26 is the last day of the 己巳 lunar year, although 立春 of 1990 is still ahead
        const result = new ZiweiService().calculate({
            birthDate: '1990-01-26',
            birthTime: '10:00',
        });

        expect(result.meta).toMatchObject({
            lunarYearStem: '己',
            lunarYearBranch: '巳',
        });
    });

    it('marks the late 子 hour without moving the date', () => {
        const late = new ZiweiService().calculate({
            birthDate: '2001-09-09',
            birthTime: '23:30',
        });
        const early = new ZiweiService().calculate({
            birthDate: '2001-09-09',
            birthTime: '00:30',
        });

        expect(late.hourNotes).toContainEqual({ kind: 'LATE_ZI' });
        expect(late.meta).toEqual(early.meta);
    });

    it('rejects a place that is not in the preset list as a validation error', () => {
        expect(() => new ZiweiService().calculate({
            ...reference,
            birthPlace: 'nowhere',
        })).toThrow(ValidationError);
    });

    it('rejects a year outside the supported range as a validation error', () => {
        expect(() => new ZiweiService().calculate({
            birthDate: '1900-06-15',
            birthTime: '10:00',
        })).toThrow(ValidationError);
        expect(() => new ZiweiService().calculate({
            birthDate: '1900-06-15',
            birthTime: '10:00',
        })).toThrow(/1901–2099/);
    });
});
