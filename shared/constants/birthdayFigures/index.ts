import { isRealDate } from '../../schemas/common';
import type { DayFigures } from './parse';
import { JANUARY_FIGURES } from './january';
import { FEBRUARY_FIGURES } from './february';
import { MARCH_FIGURES } from './march';
import { APRIL_FIGURES } from './april';
import { MAY_FIGURES } from './may';
import { JUNE_FIGURES } from './june';
import { JULY_FIGURES } from './july';
import { AUGUST_FIGURES } from './august';
import { SEPTEMBER_FIGURES } from './september';
import { OCTOBER_FIGURES } from './october';
import { NOVEMBER_FIGURES } from './november';
import { DECEMBER_FIGURES } from './december';

export type {
    BirthdayFigure, DayFigures,
} from './parse';

export const FIGURES_BY_DAY: Readonly<Record<string, DayFigures>> = {
    ...JANUARY_FIGURES,
    ...FEBRUARY_FIGURES,
    ...MARCH_FIGURES,
    ...APRIL_FIGURES,
    ...MAY_FIGURES,
    ...JUNE_FIGURES,
    ...JULY_FIGURES,
    ...AUGUST_FIGURES,
    ...SEPTEMBER_FIGURES,
    ...OCTOBER_FIGURES,
    ...NOVEMBER_FIGURES,
    ...DECEMBER_FIGURES,
};

/** The people born on the month and day of a YYYY-MM-DD date, whatever the year; null when it is not a real date or has none */
export function figuresOn(birthDate: string): DayFigures | null {
    if (!isRealDate(birthDate)) return null;

    return FIGURES_BY_DAY[birthDate.slice(5)] ?? null;
}
