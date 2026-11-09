import {
    ELEMENTS,
    ELEMENT_POWER_WEIGHTS,
    HIDDEN_STEMS,
    type Branch,
    type Element,
} from '../../constants/bazi';
import { stemElement } from './ganzhi';
import type { FourPillars } from './pillars';

/**
 * The power of each element in a chart, hidden stems included: a heavenly stem counts 5; a branch counts 8, shared out
 * among its hidden stems by main, middle and residual qi; the month branch counts double. With the hour the five add
 * up to 60. The day stem is counted (it is a character of the chart), unlike in the day-master strength.
 */
export function elementPowerOf(pillars: Pick<FourPillars, 'year' | 'month' | 'day' | 'hour'>): Record<Element, number> {
    const power = Object.fromEntries(ELEMENTS.map((element) => [element, 0])) as Record<Element, number>;
    const present = [
        pillars.year,
        pillars.month,
        pillars.day,
        pillars.hour,
    ].flatMap((pillar) => (pillar ? [pillar] : []));

    for (const pillar of present) {
        power[stemElement(pillar.stem)] += ELEMENT_POWER_WEIGHTS.stem;

        const hidden = HIDDEN_STEMS[pillar.branch as Branch];
        const split = ELEMENT_POWER_WEIGHTS.branchSplit[hidden.length as 1 | 2 | 3];
        const multiplier = pillar === pillars.month ? ELEMENT_POWER_WEIGHTS.monthBranchMultiplier : 1;

        hidden.forEach((stem, index) => {
            power[stemElement(stem)] += (split[index] as number) * multiplier;
        });
    }

    return power;
}
