import { z } from 'zod';
import {
    BRANCHES,
    STEMS,
} from '../../constants/bazi';
import { findCity } from '../../constants/cities';
import {
    AUXILIARY_STARS,
    MAIN_STARS,
    PALACES,
    TRANSFORMATIONS,
} from '../../constants/ziwei';
import { ZIWEI_SUPPORTED_YEARS } from '../../utils/ziwei/rules';
import {
    isRealDate, isoDateSchema, timeOfDaySchema,
} from '../common';

/**
 * The birth data a chart is calculated from. Unlike BaZi the birth time is required: without it there is no hour,
 * so no 命宮, and the time is never guessed. Without a place Asia/Taipei is used.
 */
export const ziweiRequestSchema = z.object({
    birthDate: isoDateSchema,
    birthTime: timeOfDaySchema,
    /** City code from the preset city list */
    birthPlace: z.string().min(1).nullable().optional(),
}).superRefine((value, ctx) => {
    if (!isRealDate(value.birthDate)) {
        ctx.addIssue({
            code: 'custom', path: ['birthDate'], message: 'birthDate is not a real calendar date',
        });
    } else if (value.birthDate > new Date().toISOString().slice(0, 10)) {
        ctx.addIssue({
            code: 'custom', path: ['birthDate'], message: 'birthDate must not be in the future',
        });
    } else {
        const year = Number(value.birthDate.slice(0, 4));

        if (year < ZIWEI_SUPPORTED_YEARS.first || year > ZIWEI_SUPPORTED_YEARS.last) {
            ctx.addIssue({
                code: 'custom',
                path: ['birthDate'],
                message: `birthDate must be in ${ZIWEI_SUPPORTED_YEARS.first}–${ZIWEI_SUPPORTED_YEARS.last}`,
            });
        }
    }

    if (value.birthPlace && !findCity(value.birthPlace)) {
        ctx.addIssue({
            code: 'custom', path: ['birthPlace'], message: 'birthPlace is not in the preset city list',
        });
    }
});

const stemSchema = z.enum(STEMS);
const branchSchema = z.enum(BRANCHES);
const transformationSchema = z.enum(TRANSFORMATIONS);

const mainStarSchema = z.enum(MAIN_STARS);
const auxiliaryStarSchema = z.enum(AUXILIARY_STARS);

const mainPlacementSchema = z.object({
    star: mainStarSchema,
    transformation: transformationSchema.nullable(),
});

const auxiliaryPlacementSchema = z.object({
    star: auxiliaryStarSchema,
    transformation: transformationSchema.nullable(),
});

const palaceSchema = z.object({
    palace: z.enum(PALACES),
    branch: branchSchema,
    mainStars: z.array(mainPlacementSchema),
    auxiliaryStars: z.array(auxiliaryPlacementSchema),
    /** True when the palace has no main star; borrowed stars are an interpretation and never appear here */
    isEmpty: z.boolean(),
});

const hourNoteSchema = z.discriminatedUnion('kind', [
    z.object({ kind: z.literal('LATE_ZI') }), z.object({
        kind: z.literal('HOUR_BOUNDARY'),
        minutesFromBoundary: z.number().int().nonnegative(),
        neighbourBranch: branchSchema,
    }),
]);

export const ziweiResponseSchema = z.object({
    timeZone: z.string(),
    /** True when no birth place was given and Asia/Taipei was assumed */
    timeZoneAssumed: z.boolean(),
    /** The algorithm version, so the page can state which rules produced the chart */
    algorithmVersion: z.string(),
    meta: z.object({
        lunarYearStem: stemSchema,
        lunarYearBranch: branchSchema,
        lunarDay: z.number().int().min(1).max(30),
        isLeapMonth: z.boolean(),
        originalLunarMonth: z.number().int().min(1).max(12),
        effectiveLunarMonth: z.number().int().min(1).max(12),
        hourBranch: branchSchema,
    }),
    bureau: z.object({
        label: z.string(),
        number: z.union([
            z.literal(2),
            z.literal(3),
            z.literal(4),
            z.literal(5),
            z.literal(6),
        ]),
    }),
    lifeMaster: z.string(),
    bodyMaster: z.string(),
    ziweiBranch: branchSchema,
    /** The twelve palaces in order, starting at 命宮 */
    palaces: z.array(palaceSchema).length(PALACES.length),
    bodyPalace: z.object({
        palace: z.enum(PALACES),
        branch: branchSchema,
        sameAsLife: z.boolean(),
    }),
    birthYearTransformations: z.array(z.object({
        transformation: transformationSchema,
        star: z.union([mainStarSchema, auxiliaryStarSchema]),
    })).length(TRANSFORMATIONS.length),
    hourNotes: z.array(hourNoteSchema),
});

export type ZiweiRequest = z.infer<typeof ziweiRequestSchema>;
export type ZiweiResponse = z.infer<typeof ziweiResponseSchema>;
