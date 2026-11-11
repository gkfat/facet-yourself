import type {
    Branch, Stem,
} from '../../constants/bazi';
import type {
    AuxiliaryStar, MainStar, Palace, Transformation, ZiweiStar,
} from '../../constants/ziwei';
import type { HourNote } from './hour';

/** A star in a palace; the 四化 is a property of the star, not an extra star. */
export type StarPlacement<TStar extends ZiweiStar = ZiweiStar> = {
    star: TStar;
    transformation: Transformation | null;
};

export type PalaceChart = {
    palace: Palace;
    branch: Branch;
    mainStars: StarPlacement<MainStar>[];
    auxiliaryStars: StarPlacement<AuxiliaryStar>[];
    /** True when the palace has no main star; auxiliary stars do not count, and borrowed stars are never written here. */
    isEmpty: boolean;
};

/** The lunar date the chart was built from, with the leap-month handling that was applied. */
export type ChartMeta = {
    lunarYearStem: Stem;
    lunarYearBranch: Branch;
    lunarDay: number;
    isLeapMonth: boolean;
    /** The month number the birth falls in on the calendar. */
    originalLunarMonth: number;
    /** The month used to place the chart: a leap month's 16th day onward counts as the next month. */
    effectiveLunarMonth: number;
    hourBranch: Branch;
};

export type FiveElementBureau = {
    label: string;
    number: 2 | 3 | 4 | 5 | 6;
};

/** The body palace is one of the twelve palaces, never a thirteenth one. */
export type BodyPalace = {
    palace: Palace;
    branch: Branch;
    sameAsLife: boolean;
};

export type BirthYearTransformation = {
    transformation: Transformation;
    star: ZiweiStar;
};

export type ZiweiChart = {
    algorithmVersion: string;
    meta: ChartMeta;
    bureau: FiveElementBureau;
    lifeMaster: string;
    bodyMaster: string;
    /** Branch where 紫微 sits; the other main stars are placed from it. */
    ziweiBranch: Branch;
    /** The twelve palaces in the order of `PALACES`, starting at 命宮. */
    palaces: PalaceChart[];
    bodyPalace: BodyPalace;
    birthYearTransformations: BirthYearTransformation[];
    /** Notices about the hour: late 子, or a birth near an hour boundary. */
    hourNotes: HourNote[];
};

/** Interpretation-layer data only; it is derived from the chart and never written back into it. */
export type BorrowedStars = {
    borrowedFromPalace: Palace;
    borrowedStars: StarPlacement<MainStar>[];
};
