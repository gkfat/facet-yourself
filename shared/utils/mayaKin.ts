import {
    GALACTIC_TONE_COUNT, GALACTIC_TONES, KIN_COUNT, SOLAR_SEAL_COLOR_LABELS, SOLAR_SEAL_COUNT, SOLAR_SEALS,
} from '../constants/mayaKin';

export type Kin = {
    /** 1 to 260 */
    kinNumber: number;
    /** 1 to 20 */
    solarSeal: number;
    /** 1 to 13 */
    galacticTone: number;
};

/**
 * A day whose Kin is known: 1987-06-23 is Kin 1 (Magnetic Red Dragon), taken from a published Dreamspell
 * table and checked against dates from other places in the table (see mayaKin.test.ts), among them
 * 2012-12-21 = Kin 207.
 */
const REFERENCE = {
    year: 1987, month: 6, day: 23, kin: 1,
};

const DAY_MS = 24 * 60 * 60 * 1000;
const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;

const utcDay = (year: number, month: number, day: number): number => Date.UTC(year, month - 1, day) / DAY_MS;

/** How many 29 Februaries fall after `from` up to and including `to` (both as day numbers, from <= to). */
function leapDaysBetween(from: number, to: number): number {
    const firstYear = new Date(from * DAY_MS).getUTCFullYear();
    const lastYear = new Date(to * DAY_MS).getUTCFullYear();
    let count = 0;

    for (let year = firstYear; year <= lastYear; year++) {
        const leapDay = utcDay(year, 2, 29);

        // Not every year has a 29 February: Date rolls it over to 1 March.
        if (new Date(leapDay * DAY_MS).getUTCMonth() !== 1) continue;

        if (leapDay > from && leapDay <= to) count++;
    }

    return count;
}

export const kinFromNumber = (kinNumber: number): Kin => ({
    kinNumber,
    solarSeal: ((kinNumber - 1) % SOLAR_SEAL_COUNT) + 1,
    galacticTone: ((kinNumber - 1) % GALACTIC_TONE_COUNT) + 1,
});

/**
 * The Dreamspell Kin of a calendar date (`YYYY-MM-DD`). Every day counts one Kin, wrapping from 260 to 1,
 * except 29 February, which is not counted: it takes the Kin of 28 February of the same year.
 * Pure date arithmetic, no time zone involved. The date must be a real one (the API validates it first).
 *
 * Changing what this calculates: raise RULE_VERSIONS.MAYA_KIN in shared/utils/analysisBasis.ts.
 */
export function kinOf(isoDate: string): Kin {
    const match = ISO_DATE.exec(isoDate);

    if (!match) throw new RangeError(`Not an ISO date: ${isoDate}`);

    const year = Number(match[1]);
    const month = Number(match[2]);
    const rawDay = Number(match[3]);
    const checked = new Date(Date.UTC(year, month - 1, rawDay));

    if (checked.getUTCFullYear() !== year || checked.getUTCMonth() !== month - 1 || checked.getUTCDate() !== rawDay) {
        throw new RangeError(`Not a real date: ${isoDate}`);
    }

    // 29 February has no Kin of its own
    const day = month === 2 && rawDay === 29 ? 28 : rawDay;
    const target = utcDay(year, month, day);
    const reference = utcDay(REFERENCE.year, REFERENCE.month, REFERENCE.day);
    const offset = target >= reference
        ? target - reference - leapDaysBetween(reference, target)
        : -(reference - target - leapDaysBetween(target, reference));
    const wrapped = ((offset % KIN_COUNT) + KIN_COUNT) % KIN_COUNT;

    return kinFromNumber(((REFERENCE.kin - 1 + wrapped) % KIN_COUNT) + 1);
}

/** The Kin with a given seal (1 to 20) and tone (1 to 13): the one of the 13 Kin of that seal that has that tone. */
export function kinFromSealAndTone(solarSeal: number, galacticTone: number): Kin {
    if (!Number.isInteger(solarSeal) || solarSeal < 1 || solarSeal > SOLAR_SEAL_COUNT) {
        throw new RangeError(`Unknown solar seal ${solarSeal}`);
    }

    if (!Number.isInteger(galacticTone) || galacticTone < 1 || galacticTone > GALACTIC_TONE_COUNT) {
        throw new RangeError(`Unknown galactic tone ${galacticTone}`);
    }

    for (let kinNumber = solarSeal; kinNumber <= KIN_COUNT; kinNumber += SOLAR_SEAL_COUNT) {
        if ((kinNumber - 1) % GALACTIC_TONE_COUNT === galacticTone - 1) return kinFromNumber(kinNumber);
    }

    throw new RangeError(`No Kin has seal ${solarSeal} and tone ${galacticTone}`);
}

/** How many seals ahead the guide is, by the tone of the main Kin (index = tone - 1): tones 1, 6 and 11 are their own guide. */
const GUIDE_SEAL_SHIFT: readonly number[] = [
    0,
    12,
    4,
    16,
    8,
    0,
    12,
    4,
    16,
    8,
    0,
    12,
    4,
];

export type KinOracle = {
    guide: Kin;
    analog: Kin;
    antipode: Kin;
    occult: Kin;
};

/**
 * The four Kin around the main Kin in the Dreamspell oracle (the main Kin is the fifth):
 * - guide: the same tone; the seal is ahead by a shift that depends on the tone (see GUIDE_SEAL_SHIFT)
 * - analog (support): the same tone; the seal pairs with the main one to 19
 * - antipode (challenge): the same tone; the seal is 10 away
 * - occult (hidden push): the seal pairs with the main one to 21, the tone to 14 (its number is 261 minus the main Kin's)
 *
 * Changing what this calculates: raise RULE_VERSIONS.MAYA_KIN in shared/utils/analysisBasis.ts.
 */
export function kinOracle(kin: Kin): KinOracle {
    const {
        solarSeal, galacticTone,
    } = kin;
    const guideShift = GUIDE_SEAL_SHIFT[galacticTone - 1];

    if (guideShift === undefined) throw new RangeError(`Unknown galactic tone ${galacticTone}`);

    const wrapSeal = (value: number): number => ((value - 1) % SOLAR_SEAL_COUNT + SOLAR_SEAL_COUNT) % SOLAR_SEAL_COUNT + 1;

    return {
        guide: kinFromSealAndTone(wrapSeal(solarSeal + guideShift), galacticTone),
        analog: kinFromSealAndTone(wrapSeal(19 - solarSeal), galacticTone),
        antipode: kinFromSealAndTone(wrapSeal(solarSeal + 10), galacticTone),
        occult: kinFromSealAndTone(wrapSeal(21 - solarSeal), GALACTIC_TONE_COUNT + 1 - galacticTone),
    };
}

/** The seal with its colour, e.g. `藍手`. */
export function sealName(solarSeal: number): string {
    const seal = SOLAR_SEALS[solarSeal - 1];

    if (!seal) throw new RangeError(`Unknown solar seal ${solarSeal}`);

    return `${SOLAR_SEAL_COLOR_LABELS[seal.color]}${seal.name}`;
}

/** The tone, e.g. `水晶`. */
export function toneName(galacticTone: number): string {
    const tone = GALACTIC_TONES[galacticTone - 1];

    if (!tone) throw new RangeError(`Unknown galactic tone ${galacticTone}`);

    return tone.name;
}

/** The full name of a Kin in the usual order, tone then seal: Kin 207 is `水晶的藍手`. */
export function kinName(kin: Kin): string {
    return `${toneName(kin.galacticTone)}的${sealName(kin.solarSeal)}`;
}
