import {
    describe, expect, it,
} from 'vitest';
import {
    ASSESSMENTS,
    ASSESSMENT_IDS,
    ASSESSMENT_SYSTEM_BY_ID,
    assessmentContentKeys,
    assessmentSystems,
    findAssessment,
    findAssessmentBySystem,
    findDefinitionIssues,
    findRegistryIssues,
    isAssessmentContentKey,
    type AssessmentDefinition,
} from './index';
import {
    fakeScaleAssessment, fakeSelectionAssessment,
} from './testing';
import { fixedContentBodySchema } from '../schemas/firestore/fixedContent.schema';
import { isMultiReportSystem } from '../report/systems';
import attachmentStyle from '../../content/fixed/attachment-style.json';
import coreValues from '../../content/fixed/core-values.json';
import emotionalIntelligence from '../../content/fixed/emotional-intelligence.json';
import enneagram from '../../content/fixed/enneagram.json';
import hexaco from '../../content/fixed/hexaco.json';
import psychologicalNeeds from '../../content/fixed/psychological-needs.json';
import riasec from '../../content/fixed/riasec.json';
import viaStrengths from '../../content/fixed/via-strengths.json';

describe('the registry', () => {
    it('is sound: each definition is complete, and ids, systems and content keys are each used once', () => {
        expect(findRegistryIssues()).toEqual([]);
    });

    it('only holds assessments there are ids for, each once', () => {
        const ids = ASSESSMENTS.map((definition) => definition.id);

        expect(ids.every((id) => (ASSESSMENT_IDS as readonly string[]).includes(id))).toBe(true);
        expect(new Set(ids).size).toBe(ids.length);
    });

    it('gives each assessment id a system id', () => {
        expect(Object.keys(ASSESSMENT_SYSTEM_BY_ID).sort()).toEqual([...ASSESSMENT_IDS].sort());
        expect(new Set(Object.values(ASSESSMENT_SYSTEM_BY_ID)).size).toBe(ASSESSMENT_IDS.length);
    });

    it('finds an assessment by id or by system, and nothing for an unknown one', () => {
        const defined: readonly AssessmentDefinition[] = [fakeScaleAssessment(), fakeSelectionAssessment()];

        expect(findAssessment('hexaco', defined)?.title).toBe('測試用量表');
        expect(findAssessmentBySystem('CORE_VALUES', defined)?.id).toBe('core-values');
        expect(findAssessment('nope', defined)).toBeNull();
        expect(assessmentSystems(defined)).toEqual(['HEXACO', 'CORE_VALUES']);
        expect(assessmentContentKeys(defined)).toHaveLength(6 + 5);
    });
});

describe('isAssessmentContentKey', () => {
    it('knows the keys of the definitions it is given, and no other', () => {
        const defined: readonly AssessmentDefinition[] = [fakeScaleAssessment(), fakeSelectionAssessment()];

        expect(isAssessmentContentKey('hexaco_novelty_high', defined)).toBe(true);
        expect(isAssessmentContentKey('core-values_a', defined)).toBe(true);
        expect(isAssessmentContentKey('hexaco_novelty_extreme', defined)).toBe(false);
        expect(isAssessmentContentKey('anything')).toBe(ASSESSMENTS.some((definition) => definition.allContentKeys.includes('anything')));
    });
});

describe('findDefinitionIssues', () => {
    it('finds nothing in a sound definition of either kind', () => {
        expect(findDefinitionIssues(fakeScaleAssessment())).toEqual([]);
        expect(findDefinitionIssues(fakeSelectionAssessment())).toEqual([]);
    });

    it('turns away a version that does not say it is our own design', () => {
        expect(findDefinitionIssues({
            ...fakeScaleAssessment(), version: 'v1',
        }).join()).toContain('-ref-v');
    });

    it('turns away a system id that does not belong to the assessment id', () => {
        expect(findDefinitionIssues({
            ...fakeScaleAssessment(), systemId: 'RIASEC',
        }).join()).toContain('system id must be HEXACO');
    });

    it('turns away content keys that do not start with the id, or are not all different', () => {
        expect(findDefinitionIssues({
            ...fakeScaleAssessment(), allContentKeys: ['other_key'],
        }).join()).toContain('must start with "hexaco_"');
        expect(findDefinitionIssues({
            ...fakeScaleAssessment(), allContentKeys: ['hexaco_a', 'hexaco_a'],
        }).join()).toContain('not all different');
    });

    it('turns away a base price that is not a whole number of at least 1', () => {
        expect(findDefinitionIssues({
            ...fakeScaleAssessment(), basePrice: 0,
        }).join()).toContain('base price');
        expect(findDefinitionIssues({
            ...fakeScaleAssessment(), basePrice: 1.5,
        }).join()).toContain('base price');
    });

    it('turns away a selection that picks more than it offers or ranks more than it picks', () => {
        expect(findDefinitionIssues({
            ...fakeSelectionAssessment(), pick: 9,
        }).join()).toContain('number to pick');
        expect(findDefinitionIssues({
            ...fakeSelectionAssessment(), rank: 4,
        }).join()).toContain('number to rank');
    });
});

describe('findRegistryIssues', () => {
    it('names an assessment, a system or a content key that two definitions share', () => {
        const first = fakeScaleAssessment();
        const issues = findRegistryIssues([first, first]);

        expect(issues.join()).toContain('hexaco is defined twice');
        expect(issues.join()).toContain('HEXACO is defined twice');
        expect(issues.join()).toContain('belongs to two assessments');
    });
});

describe('the definitions made by the factories', () => {
    it('keep a result to its schema: a result that is not well formed is an error', () => {
        const definition = fakeScaleAssessment();

        expect(() => definition.parseResult({ scores: 'no' })).toThrow();
        expect(() => definition.contentKeysOf({})).toThrow();
    });

    it('score the answers and name the contents the result needs', () => {
        const definition = fakeScaleAssessment();
        const result = definition.evaluate([
            {
                questionId: 'fs01', value: 5,
            },
            {
                questionId: 'fs02', value: 1,
            },
            {
                questionId: 'fs03', value: 3,
            },
            {
                questionId: 'fs04', value: 3,
            },
        ]);

        expect(definition.contentKeysOf(result)).toEqual(['hexaco_novelty_high', 'hexaco_order_mid']);
    });
});

describe('no clinical wording', () => {
    const CLINICAL = /疾病|症|治療|障礙|病態|憂鬱|患者/;

    it('is in none of the items, options and titles of the assessments', () => {
        const texts = ASSESSMENTS.flatMap((definition) => [
            definition.title, ...(definition.kind === 'scale'
                ? [
                    ...definition.items.map((item) => item.text), ...(definition.dimensions ?? []).flatMap((info) => [
                        info.name,
                        info.low,
                        info.high,
                    ]),
                ]
                : definition.options.flatMap((option) => [option.name, option.description])),
        ]);

        expect(texts.filter((text) => CLINICAL.test(text))).toEqual([]);
    });

    it('is in none of the fixed contents of the assessments', () => {
        const rows = [
            ...hexaco,
            ...enneagram,
            ...coreValues,
            ...psychologicalNeeds,
            ...viaStrengths,
            ...riasec,
            ...emotionalIntelligence,
            ...attachmentStyle,
        ];

        expect(rows.length).toBe(assessmentContentKeys().length);
        expect(rows.filter((row) => CLINICAL.test(JSON.stringify(row.body))).map((row) => row.key)).toEqual([]);
    });
});

describe('each assessment in a multi-dimension report', () => {
    const rows = [
        ...hexaco,
        ...enneagram,
        ...coreValues,
        ...psychologicalNeeds,
        ...viaStrengths,
        ...riasec,
        ...emotionalIntelligence,
        ...attachmentStyle,
    ];
    const contents = Object.fromEntries(rows.map((row) => [
        row.key, {
            ...fixedContentBodySchema.parse(row.body), contentType: 'ASSESSMENT' as const, key: row.key, contentVersion: 'v1',
        },
    ]));

    it.each(ASSESSMENTS.map((definition) => [definition.id, definition] as const))('%s can be chosen, and gives a report input of its own', (_id, definition) => {
        const result = definition.kind === 'scale'
            ? definition.evaluate(definition.items.map((item) => ({
                questionId: item.id, value: 4,
            })))
            : definition.evaluate({
                selected: definition.options.slice(0, definition.pick).map((option) => option.id),
                ranked: definition.options.slice(0, definition.rank).map((option) => option.id),
            });

        expect(isMultiReportSystem(definition.systemId)).toBe(true);
        expect(definition.contentKeysOf(result).every((key) => contents[key] !== undefined)).toBe(true);

        const input = definition.reportInput(result, contents);

        expect(input.system).toBe(definition.systemId);
        expect(input.facts.length + input.interpretations.length).toBeGreaterThan(0);
        expect(input.basis.length).toBeGreaterThan(0);
        expect((input.notes ?? []).join('')).toContain('信度與效度');
    });
});
