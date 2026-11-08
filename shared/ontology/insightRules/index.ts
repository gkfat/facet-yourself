import { BLINDSPOT_RULES } from './rules/blindspot';
import { CONTEXT_DIFFERENCE_RULES } from './rules/contextDifference';
import { CONVERGENCE_RULES } from './rules/convergence';
import { INTERACTION_RULES } from './rules/interaction';
import { OBJECT_GAP_RULES } from './rules/objectGap';
import { SYNTHESIS_RULES } from './rules/synthesis';
import { SYNTHESIS_WIDE_RULES } from './rules/synthesisWide';
import { TENSION_RULES } from './rules/tension';
import { TIME_EXTENSION_RULES } from './rules/timeExtension';
import {
    insightRuleSchema, type InsightRule,
} from './schema';

/** Raise whenever a rule is added, removed or changed; it is stored with every multi-dimension report. */
export const INSIGHT_RULES_VERSION = 'insight-rules-v1';

/** The rules, written type by type in their own files and parsed here so the defaults are filled in. */
export const INSIGHT_RULES: readonly InsightRule[] = [
    ...CONVERGENCE_RULES,
    ...TENSION_RULES,
    ...INTERACTION_RULES,
    ...BLINDSPOT_RULES,
    ...CONTEXT_DIFFERENCE_RULES,
    ...OBJECT_GAP_RULES,
    ...TIME_EXTENSION_RULES,
].map((rule) => insightRuleSchema.parse(rule));

/** What one system's own ends say together, for the single-dimension report: the interactions across sources, asked of a single source, and those written for it. */
export const SINGLE_SYNTHESIS_RULES: readonly InsightRule[] = [
    ...INTERACTION_RULES.map((rule) => ({
        ...rule, requiresIndependentSources: false,
    })),
    ...SYNTHESIS_RULES,
    ...SYNTHESIS_WIDE_RULES,
].map((rule) => insightRuleSchema.parse(rule));
