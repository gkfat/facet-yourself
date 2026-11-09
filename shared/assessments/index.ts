// Plain `.ts` import specifiers: this file is also run directly by Node
// (type stripping) from scripts/, where extensionless imports do not resolve.
import {
    ASSESSMENT_SYSTEM_BY_ID,
    type AssessmentSystemId,
} from './ids.ts';
import { ATTACHMENT_ASSESSMENT } from './attachmentStyle.ts';
import { CORE_VALUES_ASSESSMENT } from './coreValues.ts';
import { EQ_ASSESSMENT } from './emotionalIntelligence.ts';
import { ENNEAGRAM_ASSESSMENT } from './enneagram.ts';
import { HEXACO_ASSESSMENT } from './hexaco.ts';
import { VIA_ASSESSMENT } from './via.ts';
import { RIASEC_ASSESSMENT } from './riasec.ts';
import { PSYCHOLOGICAL_NEEDS_ASSESSMENT } from './psychologicalNeeds.ts';
import { CAREER_ANCHORS_ASSESSMENT } from './careerAnchors.ts';
import { CONFLICT_STYLE_ASSESSMENT } from './conflictStyle.ts';
import { RESILIENCE_ASSESSMENT } from './resilience.ts';
import type { AssessmentDefinition } from './types.ts';

export * from './ids.ts';
export * from './types.ts';

/**
 * Every self-assessment there is, one definition each. A new assessment is a new definition added here: nothing else
 * needs a route, a service or a collection of its own. The definitions are added as the assessments are built.
 */
export const ASSESSMENTS: readonly AssessmentDefinition[] = [
    HEXACO_ASSESSMENT,
    ENNEAGRAM_ASSESSMENT,
    CORE_VALUES_ASSESSMENT,
    PSYCHOLOGICAL_NEEDS_ASSESSMENT,
    RIASEC_ASSESSMENT,
    VIA_ASSESSMENT,
    EQ_ASSESSMENT,
    ATTACHMENT_ASSESSMENT,
    CAREER_ANCHORS_ASSESSMENT,
    CONFLICT_STYLE_ASSESSMENT,
    RESILIENCE_ASSESSMENT,
];

export function findAssessment(id: string, definitions: readonly AssessmentDefinition[] = ASSESSMENTS): AssessmentDefinition | null {
    return definitions.find((definition) => definition.id === id) ?? null;
}

export function findAssessmentBySystem(systemId: string, definitions: readonly AssessmentDefinition[] = ASSESSMENTS): AssessmentDefinition | null {
    return definitions.find((definition) => definition.systemId === systemId) ?? null;
}

/** The ids as systems of a multi-dimension report, of the assessments that are defined */
export function assessmentSystems(definitions: readonly AssessmentDefinition[] = ASSESSMENTS): AssessmentSystemId[] {
    return definitions.map((definition) => definition.systemId);
}

/** Whether `system` is the id of a self-analysis that is defined, as a system of a multi-dimension report */
export function isAssessmentSystem(system: string, definitions: readonly AssessmentDefinition[] = ASSESSMENTS): system is AssessmentSystemId {
    return definitions.some((definition) => definition.systemId === system);
}

/** Every fixed content key of every assessment: what has to be published before they are all open */
export function assessmentContentKeys(definitions: readonly AssessmentDefinition[] = ASSESSMENTS): string[] {
    return definitions.flatMap((definition) => definition.allContentKeys);
}

/** Whether `key` is a fixed content key of one of the assessments */
export function isAssessmentContentKey(key: string, definitions: readonly AssessmentDefinition[] = ASSESSMENTS): boolean {
    return definitions.some((definition) => definition.allContentKeys.includes(key));
}

/** What is wrong with one definition, as plain sentences; empty when it is sound. */
export function findDefinitionIssues(definition: AssessmentDefinition): string[] {
    const issues: string[] = [];
    const label = definition.id;

    if (definition.systemId !== ASSESSMENT_SYSTEM_BY_ID[definition.id]) issues.push(`${label}: the system id must be ${ASSESSMENT_SYSTEM_BY_ID[definition.id]}`);
    if (definition.title.trim() === '') issues.push(`${label}: no title`);
    if (!/-ref-v\d+$/.test(definition.version)) issues.push(`${label}: the version "${definition.version}" must end with -ref-v<number>: the items are our own design, not validated`);
    if (!Number.isInteger(definition.basePrice) || definition.basePrice < 1) issues.push(`${label}: the base price must be a whole number of points, at least 1`);

    if (definition.allContentKeys.length === 0) issues.push(`${label}: no content keys`);
    if (new Set(definition.allContentKeys).size !== definition.allContentKeys.length) issues.push(`${label}: the content keys are not all different`);

    for (const key of definition.allContentKeys) {
        if (!key.startsWith(`${definition.id}_`)) issues.push(`${label}: the content key "${key}" must start with "${definition.id}_"`);
    }

    for (const entry of definition.traitMappings) {
        const system: string = entry.system;

        if (system !== definition.systemId) issues.push(`${label}: the mapping of "${entry.term}" is for ${system}, not ${definition.systemId}`);
    }

    if (definition.kind === 'scale') {
        const ids = definition.items.map((item) => item.id);

        if (definition.items.length === 0) issues.push(`${label}: no items`);
        if (new Set(ids).size !== ids.length) issues.push(`${label}: the item ids are not all different`);
        if (definition.items.some((item) => item.dimension.trim() === '' || item.text.trim() === '')) issues.push(`${label}: an item has no text or no dimension`);

        return issues;
    }

    const ids = definition.options.map((option) => option.id);

    if (definition.options.length === 0) issues.push(`${label}: no options`);
    if (new Set(ids).size !== ids.length) issues.push(`${label}: the option ids are not all different`);
    if (definition.pick < 1 || definition.pick > definition.options.length) issues.push(`${label}: the number to pick must be between 1 and the number of options`);
    if (definition.rank < 1 || definition.rank > definition.pick) issues.push(`${label}: the number to rank must be between 1 and the number to pick`);

    return issues;
}

/** What is wrong with the registry as a whole: each definition, and ids, systems and content keys that two definitions share. */
export function findRegistryIssues(definitions: readonly AssessmentDefinition[] = ASSESSMENTS): string[] {
    const issues = definitions.flatMap(findDefinitionIssues);
    const duplicates = (values: readonly string[]) => values.filter((value, index) => values.indexOf(value) !== index);

    for (const id of duplicates(definitions.map((definition) => definition.id))) issues.push(`the assessment id ${id} is defined twice`);
    for (const system of duplicates(definitions.map((definition) => definition.systemId))) issues.push(`the system id ${system} is defined twice`);
    for (const key of duplicates(assessmentContentKeys(definitions))) issues.push(`the content key ${key} belongs to two assessments`);

    return issues;
}
