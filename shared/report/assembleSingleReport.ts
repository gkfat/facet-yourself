import { CONTEXT_VALUES } from '../ontology/context';
import {
    FRAGMENT_TABLE, FRAGMENT_VERSION, lookupFragment, type FragmentTable,
} from '../ontology/fragments';
import {
    isStateSystem, MAPPING_VERSION, 
} from '../ontology/mapping';
import { STABLE_MAPPINGS } from '../ontology/mappings';
import { ONTOLOGY_VERSION } from '../ontology/ontology';
import type { MappingEntry } from '../ontology/schema';
import type {
    ReportSnapshotContent, SnapshotBlock, SnapshotSegment,
} from '../schemas/firestore/reportSnapshot.schema';
import {
    findTensions, selectFacets, type Facet,
} from './facets';
import { factTerms } from './factTerms';
import { SYSTEM_NATURE } from './natureLabels';
import { selectSynthesis } from './synthesis';
import type {
    Peers, SystemReportInput,
} from './types';

/** Raise whenever the way a report is put together changes (the order of blocks, the wording of fixed lines). */
export const SINGLE_REPORT_TEMPLATE_VERSION = 'single-report-v4';

/** How many reflection questions the advice block takes from the guesses about the past. */
export const MAX_REFLECTION_QUESTIONS = 3;

type AssembleOptions = {
    fragments?: FragmentTable;
    mappings?: readonly MappingEntry[];
};

export const segment = (text: string, kind: SnapshotSegment['kind'], sources: SnapshotSegment['sources'], extra: Partial<SnapshotSegment> = {}): SnapshotSegment => ({
    text,
    kind,
    sources,
    timeSensitive: false,
    asOf: null,
    ...extra,
});

export const block = (key: string, title: string, segments: SnapshotSegment[]): SnapshotBlock[] => (segments.length > 0
    ? [
        {
            key, title, segments,
        },
    ]
    : []);

/**
 * The card of the well-known people at the end of a report. It is not in the report that is kept: who is shown is chosen
 * again each time, so a report would otherwise be a new one at every opening. What the member shares with them decides who
 * is here; it says nothing of the member's traits, and the last sentence says so.
 */
export function peersBlock(system: SystemReportInput['system'], peers: Peers): SnapshotBlock[] {
    return block('figures', peers.title, [...peers.figures.map((figure) => segment(`${figure.name}（${figure.nameEn}）：${figure.detail}`, 'FACT', [{ system }])), segment(peers.note, 'FACT', [{ system }])]);
}

/** The impact map of one facet: the time, object and domain values that have a sentence, in the order of the list. */
export function impactBlock(facet: Facet, systems: ReadonlyArray<SystemReportInput['system']>, fragments: FragmentTable): { block: SnapshotBlock[]; questions: Array<{ question: string; endId: string }> } {
    const questions: Array<{ question: string; endId: string }> = [];
    const segments = CONTEXT_VALUES.flatMap((context) => {
        const fragment = lookupFragment(fragments, facet.end.id, context.id);

        if (!fragment) return [];

        if (fragment.confirmQuestion) {
            questions.push({
                question: fragment.confirmQuestion, endId: facet.end.id,
            });
        }

        return [
            segment(
                fragment.text,
                'AI_INFERENCE',
                [
                    ...systems.map((system) => ({
                        system, axisEnd: facet.end.id,
                    })), { fragment: `${facet.end.id}|${context.id}` },
                ],
                fragment.confirmQuestion ? { confirmQuestion: fragment.confirmQuestion } : {},
            ),
        ];
    });

    return {
        block: block(`impact:${facet.end.id}`, `影響面向推測：${facet.end.name}`, segments), questions,
    };
}

/**
 * A single-dimension report, in the one order every report has: where the member stands, the system's own facts and
 * what its tradition says of them, what we conclude from those facts, the map of effects, advice, and the limits.
 * Facts come first and an inference is made only from a fact that is shown (a trait term with no fact on the page leads
 * nowhere). A state system (tarot, runes, the sign horoscope) stops after the facts and the advice: today's state is
 * not a lasting trait. Pure: the same input always gives the same report.
 */
export function assembleSingleReport(input: SystemReportInput, options: AssembleOptions = {}): ReportSnapshotContent {
    const fragments = options.fragments ?? FRAGMENT_TABLE;
    const mappings = options.mappings ?? STABLE_MAPPINGS;
    const nature = SYSTEM_NATURE[input.system];
    const systemSource = { system: input.system };
    const state = isStateSystem(input.system);

    const groundedTerms = new Set(input.facts.flatMap((fact) => factTerms(fact).map((entry) => entry.term)));
    const facets = state ? [] : selectFacets(input.traits, groundedTerms, mappings);
    const factOfTerm = new Map(input.facts.flatMap((fact) => factTerms(fact).map((entry) => [entry.term, `${fact.label}：${entry.value}`] as const)));

    const position = block('position', '位置結論', [segment(input.position, 'FACT', [systemSource])]);

    const readingSegment = (reading: SystemReportInput['interpretations'][number]) => segment(`【依${nature.tradition}】${reading.title}：${reading.text}`, 'SYSTEM_INTERPRETATION', [
        {
            system: input.system,
            ...(reading.term ? { term: reading.term } : {}),
            ...(reading.factLabel ? { fact: reading.factLabel } : {}),
        },
    ]);

    // What the tradition says of the member's result itself comes first, as an overview of its own
    const overview = block('overview', '概覽', input.interpretations.filter((reading) => reading.overview).map(readingSegment));

    // The quote at the head of the overview of a draw
    const lead = block('lead', '今日主題', input.interpretations.filter((reading) => reading.lead).map(readingSegment));

    // A state system's facts and readings are its overview; the others keep the plain name
    const factsAndReadings = block('facts', state ? '概覽' : '系統的事實與解讀', [
        ...input.facts.map((fact) => segment(`${fact.label}：${fact.value}`, 'FACT', factTerms(fact).length > 0
            ? factTerms(fact).map((entry) => ({
                system: input.system, term: entry.term,
            }))
            : [systemSource])), ...input.interpretations.filter((reading) => !reading.overview && !reading.lead && !reading.group).map(readingSegment),
    ]);

    // Readings that have a group go in a block for each group, in the order the groups first come
    const readingGroups = [...new Set(input.interpretations.flatMap((reading) => (!reading.overview && reading.group ? [reading.group] : [])))];
    const groupedReadings = readingGroups.flatMap((group, index) => block(`readings:${index + 1}`, group, input.interpretations.filter((reading) => !reading.overview && reading.group === group).map(readingSegment)));

    // The date of a draw is in the label of the card of the draw; only the other systems have times of their own
    const timeSegment = (fact: NonNullable<SystemReportInput['timeFacts']>[number]) => segment(fact.text, fact.reading ? 'SYSTEM_INTERPRETATION' : 'FACT', [
        fact.term ? {
            system: input.system, term: fact.term,
        } : systemSource,
    ], {
        timeSensitive: true, asOf: fact.asOf,
    });
    const timed = state ? [] : input.timeFacts ?? [];
    const timeFacts = block('time', '隨時間走的運勢', timed.filter((fact) => !fact.group).map(timeSegment));

    // What moves with time, by what it is about, a block for each group in the order the groups first come
    const timeGroups = [...new Set(timed.flatMap((fact) => (fact.group ? [fact.group] : [])))];
    const groupedTimeFacts = timeGroups.flatMap((group, index) => block(`time:${index + 1}`, group, timed.filter((fact) => fact.group === group).map(timeSegment)));

    const factLabels = new Set(input.facts.map((fact) => fact.label));
    const inferenceSegment = (inference: NonNullable<SystemReportInput['inferences']>[number]) => segment(
        `${inference.title}：${inference.text}（依據：${inference.basedOn.join('、')}）`,
        inference.kind ?? 'AI_INFERENCE',
        [
            systemSource, ...inference.basedOn.filter((label) => factLabels.has(label)).map((label) => ({
                system: input.system, fact: label,
            })),
        ],
    );
    const inferences = input.inferences ?? [];
    // Conclusions with a group of their own (the houses, the aspects) each get a block, in the order they first come
    const groups = [...new Map(inferences.flatMap((inference) => (inference.group ? [[inference.group.key, inference.group.title] as const] : []))).entries()];
    const inferenceBlocks = groups.flatMap(([key, title]) => block(`inference:${key}`, title, inferences.filter((inference) => inference.group?.key === key).map(inferenceSegment)));
    const inferenceSegments = inferences.filter((inference) => !inference.group).map(inferenceSegment);

    const summary = block('summary', '本系統的歸納', [
        ...inferenceSegments,
        ...facets.flatMap((facet) => {
            const sources = [
                ...facet.supports.map((term) => ({
                    system: input.system, term,
                })), { axisEnd: facet.end.id },
            ];
            // The fact the trait comes from leads the sentence, so the trait reads as what follows from it
            const from = facet.supports.flatMap((term) => factOfTerm.get(term) ?? []).map((fact) => `「${fact}」`).join('、');

            return [segment(`${from ? `從${from}來看，` : ''}你傾向「${facet.end.name}」：${facet.end.description}。`, 'AI_INFERENCE', sources), segment(`用得太過時：${facet.end.overuse}。`, 'AI_INFERENCE', sources)];
        }),
        ...findTensions(facets).map(([first, second]) => segment(
            `「${first.end.name}」與「${second.end.name}」在這個系統裡同時出現：這是系統本身的兩種特徵，不是矛盾，也不用選一個；可以觀察在什麼情境下哪一邊比較明顯。`,
            'AI_INFERENCE',
            [{ axisEnd: first.end.id }, { axisEnd: second.end.id }],
        )),
    ]);

    // What the traits say together: each interaction with the question that checks it against the member's own life
    const synthesis = selectSynthesis(facets, undefined, mappings);
    const interactions = block('synthesis', '特質之間的互動', synthesis.map(({
        rule, ends, 
    }) => segment(
        `${rule.template}\n可以問自己：${rule.hypothesis}`,
        'AI_INFERENCE',
        [
            systemSource,
            ...ends.map((axisEnd) => ({ axisEnd })),
            { rule: rule.id },
        ],
    )));

    // The report in three lines, ahead of everything else: the core traits, what to watch for, where to start
    const [coreFirst, coreSecond] = facets;
    const caution = synthesis[0];
    const keypoints = block('keypoints', '重點摘要', coreFirst
        ? [
            segment(
                `核心傾向：${[coreFirst, coreSecond].flatMap((facet) => (facet ? [`「${facet.end.name}」`] : [])).join('與')}。`,
                'AI_INFERENCE',
                [systemSource, ...[coreFirst, coreSecond].flatMap((facet) => (facet ? [{ axisEnd: facet.end.id }] : []))],
            ),
            caution
                ? segment(`最需要留意：${caution.rule.template.split('：')[0]}。可以問自己：${caution.rule.hypothesis}`, 'AI_INFERENCE', [
                    systemSource,
                    ...caution.ends.map((axisEnd) => ({ axisEnd })),
                    { rule: caution.rule.id },
                ])
                : segment(`最需要留意：「${coreFirst.end.name}」用得太過時，常見的樣子是${coreFirst.end.overuse}。`, 'AI_INFERENCE', [systemSource, { axisEnd: coreFirst.end.id }]),
            ...(input.advice[0] ? [segment(`先從這件事開始：${input.advice[0]}`, 'SYSTEM_INTERPRETATION', [systemSource])] : []),
        ]
        : []);

    const impacts = facets.map((facet) => impactBlock(facet, [input.system], fragments));

    // Advice for the member, as the reading pages call it; for a report about today's draw, what to try today
    const advice = block('advice', '給你的建議', input.advice.map((text) => segment(text, 'SYSTEM_INTERPRETATION', [systemSource])));

    const limits = block('limits', '依據與限制', [
        segment(`系統性質：${nature.label}。`, 'FACT', [systemSource]),
        ...(input.notes ?? []).map((note) => segment(note, 'FACT', [systemSource])),
        segment(`規則版本：本體 ${ONTOLOGY_VERSION}、映射 ${MAPPING_VERSION}、片段 ${FRAGMENT_VERSION}、報告模板 ${SINGLE_REPORT_TEMPLATE_VERSION}。`, 'FACT', [systemSource]),
        segment(input.disclaimer, 'FACT', [systemSource]),
    ]);

    return {
        kind: 'SINGLE',
        systems: [input.system],
        position: input.position,
        blocks: [
            ...position,
            ...keypoints,
            ...overview,
            ...lead,
            ...factsAndReadings,
            ...groupedReadings,
            ...timeFacts,
            ...groupedTimeFacts,
            ...summary,
            ...interactions,
            ...inferenceBlocks,
            ...impacts.flatMap((impact) => impact.block),
            ...advice,
            ...limits,
        ],
        versions: {
            ontology: ONTOLOGY_VERSION,
            mapping: MAPPING_VERSION,
            fragments: FRAGMENT_VERSION,
            templates: SINGLE_REPORT_TEMPLATE_VERSION,
        },
        basis: [...input.basis],
    };
}
