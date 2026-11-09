import {
    MONTH_CLIMATE,
    POWER_BOUNDS,
    STRENGTH_WEIGHTS,
    type Element,
    type Humidity,
    type MonthBias,
    type PowerLevel,
    type Temperature,
} from '../../constants/bazi';
import type { PillarPosition } from './analysis';
import type { Relation } from './facts';
import {
    branchElement, stemElement,
} from './ganzhi';
import type { FourPillars } from './pillars';
import {
    FULL_SHARE, branchShare, stemShare,
} from './strength';

/** The two elements that regulate the season: fire warms, water moistens. */
export type RegulatorElement = Extract<Element, 'fire' | 'water'>;

export type Regulation = 'insufficient' | 'moderate' | 'excessive';
export type ClimateStatus = 'cold' | 'hot' | 'dry' | 'balanced';
export type ClimateNeed = 'warming' | 'cooling' | 'moistening';
export type ClimateInfluence = {
    element: RegulatorElement;
    /** 受合 or 受沖: marked only, the power is not changed */
    kind: 'COMBINED' | 'CLASHED';
};

export type RegulatorState = {
    /** The relative power index (0 to 100) under the day-master strength weights, hidden stems included */
    power: number;
    level: PowerLevel;
    present: boolean;
};

export type SeasonalClimate = {
    month: string;
    temperature: Temperature;
    humidity: Humidity;
    monthBias: MonthBias;
    elements: Record<RegulatorElement, RegulatorState>;
    regulation: {
        warming: Regulation;
        moistening: Regulation;
    };
    status: ClimateStatus;
    needs: ClimateNeed[];
    /** A regulator that is too strong: 暖局過度 or 潤濕過度 */
    excess: Array<'warming' | 'moistening'>;
    influences: ClimateInfluence[];
    summary: string;
};

const REGULATORS: readonly RegulatorElement[] = ['fire', 'water'];

export function powerLevelOf(power: number): PowerLevel {
    return POWER_BOUNDS.find(([bound]) => power >= bound)?.[1] ?? 'none';
}

function regulationOf(level: PowerLevel): Regulation {
    if (level === 'none' || level === 'weak') return 'insufficient';

    return level === 'excessive' ? 'excessive' : 'moderate';
}

/**
 * How much of the chart an element holds, on the scale of the day-master strength score: the same position weights,
 * the hidden stems in the same shares. The day stem is the day master itself and is not counted, as in the strength.
 */
export function elementPower(pillars: FourPillars, element: Element): number {
    const only = [element];
    const sources: Array<[keyof typeof STRENGTH_WEIGHTS, number]> = [
        ['yearStem', stemShare(pillars.year.stem, only)],
        ['monthStem', stemShare(pillars.month.stem, only)],
        ['yearBranch', branchShare(pillars.year.branch, only)],
        ['monthBranch', branchShare(pillars.month.branch, only)],
        ['dayBranch', branchShare(pillars.day.branch, only)],
    ];

    if (pillars.hour) {
        sources.push(['hourStem', stemShare(pillars.hour.stem, only)], ['hourBranch', branchShare(pillars.hour.branch, only)]);
    }

    const present = sources.reduce((total, [source]) => total + STRENGTH_WEIGHTS[source], 0);
    const weighted = sources.reduce((total, [source, tenths]) => total + STRENGTH_WEIGHTS[source] * tenths, 0);

    return (weighted * FULL_SHARE) / present;
}

/** Fire or water standing in a 合 or a 沖 of the chart: marked, never counted. */
function influencesOf(pillars: FourPillars, relations: readonly Relation[]): ClimateInfluence[] {
    const found = new Map<string, ClimateInfluence>();
    const characterAt = (position: PillarPosition, kind: Relation['kind']): Element | null => {
        const pillar = pillars[position];

        if (!pillar) return null;

        return kind === 'STEM_COMBINE' ? stemElement(pillar.stem) : branchElement(pillar.branch);
    };

    for (const relation of relations) {
        const kind = relation.kind === 'BRANCH_CLASH' ? 'CLASHED' : relation.kind === 'STEM_COMBINE' || relation.kind === 'BRANCH_COMBINE' ? 'COMBINED' : null;

        if (!kind) continue;

        for (const position of relation.positions) {
            const element = characterAt(position, relation.kind);

            if (element !== 'fire' && element !== 'water') continue;

            found.set(`${element}:${kind}`, {
                element, kind,
            });
        }
    }

    return [...found.values()];
}

const SUMMARIES = {
    coldLacking: '命局偏寒，暖局需求較高',
    hotLacking: '命局偏熱，潤燥需求較高',
    dryLacking: '命局偏燥，潤燥需求較高',
    fireOverCold: '暖局過度，可能偏熱',
    waterOverHot: '潤濕過度，需結合寒暖判斷',
    waterOverDry: '潤濕過度',
    fireOverWaterLacking: '火力過旺而水不足，偏熱，降溫需求較高',
    waterOverFireLacking: '水力過旺而火不足，偏寒，暖局需求較高',
    balanced: '相對平衡，沒有明顯調候偏向',
} as const;

/**
 * The seasonal-climate model: the month's lean, how much fire (to warm) and water (to moisten) the chart holds, and
 * what that leaves needed. A simplified model; the powers are a scale of this product, not a traditional threshold.
 */
export function analyzeClimate(pillars: FourPillars, relations: readonly Relation[]): SeasonalClimate {
    const month = MONTH_CLIMATE[pillars.month.branch];
    const elements = Object.fromEntries(REGULATORS.map((element) => {
        const power = elementPower(pillars, element);

        return [
            element, {
                power: Math.round(power * 10) / 10, level: powerLevelOf(power), present: power > 0,
            },
        ];
    })) as Record<RegulatorElement, RegulatorState>;
    const warming = regulationOf(elements.fire.level);
    const moistening = regulationOf(elements.water.level);
    const fireOver = elements.fire.level === 'excessive';
    const waterOver = elements.water.level === 'excessive';

    let status: ClimateStatus = 'balanced';
    let need: ClimateNeed | null = null;
    let summary: string = SUMMARIES.balanced;

    if (month.bias === 'cold') {
        if (warming === 'insufficient') {
            status = 'cold';
            need = 'warming';
            summary = SUMMARIES.coldLacking;
        } else if (fireOver) {
            summary = SUMMARIES.fireOverCold;
        }
    } else if (month.bias === 'hot') {
        if (moistening === 'insufficient') {
            status = 'hot';
            need = 'moistening';
            summary = SUMMARIES.hotLacking;
        } else if (waterOver) {
            summary = SUMMARIES.waterOverHot;
        }
    } else if (month.bias === 'dry') {
        if (moistening === 'insufficient') {
            status = 'dry';
            need = 'moistening';
            summary = SUMMARIES.dryLacking;
        } else if (waterOver) {
            summary = SUMMARIES.waterOverDry;
        }
    }

    // Whatever the month, a regulator far too strong against a lacking one tips a balanced chart
    if (status === 'balanced') {
        if (fireOver && moistening === 'insufficient') {
            status = 'hot';
            need = 'cooling';
            summary = SUMMARIES.fireOverWaterLacking;
        } else if (waterOver && warming === 'insufficient') {
            status = 'cold';
            need = 'warming';
            summary = SUMMARIES.waterOverFireLacking;
        }
    }

    return {
        month: pillars.month.branch,
        temperature: month.temperature,
        humidity: month.humidity,
        monthBias: month.bias,
        elements,
        regulation: {
            warming, moistening,
        },
        status,
        needs: need ? [need] : [],
        excess: [...(fireOver ? ['warming' as const] : []), ...(waterOver ? ['moistening' as const] : [])],
        influences: influencesOf(pillars, relations),
        summary,
    };
}
