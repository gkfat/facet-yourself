import {
    AUXILIARY_STARS, MAIN_STARS, TRANSFORMATIONS,
    type Transformation,
} from '../../constants/ziwei';
import { keywordRule } from './keywordRule';
import type { MappingEntry } from '../schema';

/**
 * The terms of Zi Wei: the fourteen main stars (`ziwei:star:紫微`), the four auxiliary stars (`ziwei:aux:文昌`) and the four
 * 四化 (`ziwei:transformation:忌`).
 */
export const ZIWEI_TERMS: readonly string[] = [
    ...MAIN_STARS.map((star) => `ziwei:star:${star}`),
    ...AUXILIARY_STARS.map((star) => `ziwei:aux:${star}`),
    ...TRANSFORMATIONS.map((transformation) => `ziwei:transformation:${transformation}`),
];

/** The part of a chart the traits are read from: where each star is, which palace is the body's, and the 四化 of the year. */
type ChartForTerms = {
    palaces: ReadonlyArray<{
        palace: string;
        mainStars: ReadonlyArray<{ star: string; transformation: Transformation | null }>;
        auxiliaryStars: ReadonlyArray<{ star: string; transformation: Transformation | null }>;
    }>;
    bodyPalace: { palace: string };
};

/**
 * The terms this chart's traits are read from. Every chart has all fourteen main stars, all four auxiliary stars and all
 * four 四化 somewhere, so they say nothing about a person by themselves; what is about this person is what sits in the life
 * palace and in the body palace, and the 四化 that lands on those stars. Nothing is read from a borrowed star, and a life
 * palace with no main star gives no star term (the chart says so instead of guessing).
 */
export function ziweiTermsOf(chart: ChartForTerms): string[] {
    const palaces = new Set<string>(['命宮', chart.bodyPalace.palace]);
    const terms: string[] = [];

    for (const palace of chart.palaces.filter((item) => palaces.has(item.palace))) {
        for (const placement of palace.mainStars) {
            terms.push(`ziwei:star:${placement.star}`);
            if (placement.transformation) terms.push(`ziwei:transformation:${placement.transformation}`);
        }

        for (const placement of palace.auxiliaryStars) {
            terms.push(`ziwei:aux:${placement.star}`);
            if (placement.transformation) terms.push(`ziwei:transformation:${placement.transformation}`);
        }
    }

    return [...new Set(terms)];
}

const rule = keywordRule('ZIWEI');

/**
 * The rule is by keyword: a star points at an axis end where the keywords of the star, as the project's own readings list
 * them (the readings in content/fixed/ziwei.json, which keep to the common lines of the tradition: 紫微 oversees the
 * whole, 天機 thinks and adapts, 太陽 gives and warms, 武曲 carries out, 天同 is easy-going, 廉貞 holds to principle, 天府
 * is steady, 太陰 is fine and reserved, 貪狼 is curious and sociable, 巨門 questions, 天相 coordinates, 天梁 looks after,
 * 七殺 acts alone and decisively, 破軍 breaks the old frame), say what the end describes. The four auxiliary stars and the
 * four 四化 are mapped lightly, by what each stands for. These are drafts for review; it is traditional Chinese
 * astrology, with no scientific evidence behind it, and a term with no honest match is left out.
 */
export const ZIWEI_MAPPINGS: readonly MappingEntry[] = [
    ...rule('ziwei:star:紫微', 'A5.B', 'D5.A', 'E6.A', 'B1.A'), // sees the whole, takes the lead, takes responsibility, plans long
    ...rule('ziwei:star:天機', 'A1.A', 'B4.B', 'A4.A'), // analyses, adapts, curious
    ...rule('ziwei:star:太陽', 'C2.A', 'D2.A', 'C4.A'), // outgoing, gives, optimistic
    ...rule('ziwei:star:武曲', 'B6.A', 'B3.A', 'B5.A', 'C3.A'), // result-driven, decisive, orderly, frank
    ...rule('ziwei:star:天同', 'D3.A', 'E4.B', 'D6.A'), // harmonious, content, accepting
    ...rule('ziwei:star:廉貞', 'B4.A', 'D6.B', 'C1.A'), // keeps at it, holds to principle, feels deeply
    ...rule('ziwei:star:天府', 'E1.A', 'B2.B', 'A3.B', 'D6.A'), // stable, steady, tried methods, accepting
    ...rule('ziwei:star:太陰', 'C1.A', 'C2.B', 'A5.A', 'D4.B'), // fine feeling, reserved, detail, alone
    ...rule('ziwei:star:貪狼', 'A4.A', 'D4.A', 'E1.B'), // curious, sociable, likes change
    ...rule('ziwei:star:巨門', 'A1.A', 'A5.A', 'C3.A'), // analyses, detail, frank
    ...rule('ziwei:star:天相', 'D3.A', 'D5.B', 'D1.B'), // coordinates, supports, fair
    ...rule('ziwei:star:天梁', 'D2.A', 'E6.A', 'D6.B'), // looks after, takes responsibility, holds a standard
    ...rule('ziwei:star:七殺', 'B3.A', 'B2.A', 'E3.A'), // decisive, ventures, independent
    ...rule('ziwei:star:破軍', 'A3.A', 'B2.A', 'E1.B'), // breaks the frame, ventures, likes change
    ...rule('ziwei:aux:文昌', 'B5.A', 'A5.A'), // order, detail
    ...rule('ziwei:aux:文曲', 'A6.A', 'C2.A'), // taste, expression
    ...rule('ziwei:aux:左輔', 'D3.A', 'D5.B'), // cooperates, supports
    ...rule('ziwei:aux:右弼', 'D5.B', 'C3.B'), // supports, tactful
    ...rule('ziwei:transformation:祿', 'D3.A', 'C4.A'), // smooth with people, positive
    ...rule('ziwei:transformation:權', 'D5.A', 'B3.A'), // takes charge, decides
    ...rule('ziwei:transformation:科', 'B5.A', 'A5.A'), // order, care for detail
    ...rule('ziwei:transformation:忌', 'B4.A', 'C1.A'), // does not let go, feels deeply
];
