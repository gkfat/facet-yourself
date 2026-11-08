import { evaluateInsightRules } from '../ontology/insightRules/evaluate';
import { SINGLE_SYNTHESIS_RULES } from '../ontology/insightRules';
import type { InsightRule } from '../ontology/insightRules/schema';
import { STABLE_MAPPINGS } from '../ontology/mappings';
import type { MappingEntry } from '../ontology/schema';
import type { Facet } from './facets';

/** The most interactions one report goes into; the rest are left out, never mentioned as less likely. */
export const MAX_SYNTHESIS = 3;

/** An interaction of two shown traits, with the rule that found it. */
export type Synthesis = {
    rule: InsightRule;
    /** The traits it joins, as they come in the report */
    ends: string[];
};

/**
 * What the traits of the report say together. A rule counts only when every end it joins is a trait the report shows,
 * so that nothing is said of a trait the member cannot see. Those that join the most-supported traits come first;
 * a tie keeps the order of the rules, so the same member always gets the same interactions.
 */
export function selectSynthesis(
    facets: readonly Facet[],
    rules: readonly InsightRule[] = SINGLE_SYNTHESIS_RULES,
    mappings: readonly MappingEntry[] = STABLE_MAPPINGS,
    max: number = MAX_SYNTHESIS,
): Synthesis[] {
    const rank = new Map(facets.map((facet, index) => [facet.end.id, index] as const));
    const fired = new Set(evaluateInsightRules(rules, facets.flatMap((facet) => facet.supports), mappings).map((candidate) => candidate.ruleId));

    return rules
        .filter((rule) => fired.has(rule.id) && rule.when.all.every((condition) => rank.has(condition.end)))
        .map((rule) => ({
            rule, ends: rule.when.all.map((condition) => condition.end),
        }))
        .sort((a, b) => sumOfRanks(a.ends, rank) - sumOfRanks(b.ends, rank))
        .slice(0, max);
}

const sumOfRanks = (ends: readonly string[], rank: ReadonlyMap<string, number>) => ends.reduce((sum, end) => sum + (rank.get(end) ?? 0), 0);
