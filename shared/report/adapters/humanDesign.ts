import {
    CENTERS, HUMAN_DESIGN_DISCLAIMER,  
} from '../../constants/humanDesign';
import { CHANNEL_NAMES } from '../../constants/humanDesignChannels';
import { CHANNEL_MEANINGS } from '../../constants/humanDesignChannelMeanings';
import { CENTER_MEANINGS } from '../../constants/humanDesignCenterMeanings';
import {
    HUMAN_DESIGN_AUTHORITY_LABELS, HUMAN_DESIGN_CENTER_LABELS, HUMAN_DESIGN_CROSS_ANGLE_LABELS, HUMAN_DESIGN_DEFINITION_LABELS,
    HUMAN_DESIGN_STRATEGY_LABELS, HUMAN_DESIGN_TYPE_LABELS,
} from '../../constants/humanDesignLabels';
import {
    HUMAN_DESIGN_AUTHORITY_INTERPRETATIONS, HUMAN_DESIGN_CROSS_ANGLE_INTERPRETATIONS, HUMAN_DESIGN_DEFINITION_INTERPRETATIONS,
    HUMAN_DESIGN_PROFILE_INTERPRETATIONS, HUMAN_DESIGN_TYPE_INTERPRETATIONS, type HumanDesignInterpretation, type HumanDesignProfile,
} from '../../constants/humanDesignInterpretations';
import { humanDesignTermsOf } from '../../ontology/mappings/humanDesign';
import type { HumanDesignResult } from '../../schemas/firestore/humanDesign.schema';
import { buildBasis } from '../../utils/analysisBasis';
import type {
    ReportFact, ReportInterpretation, SystemReportInput,
} from '../types';

/**
 * A part's reviewed reading as the cards of a group of its own: what it says, then the strengths and the blind spots.
 * The titles carry no colon, since the page takes the words before the first colon as the title of a card.
 */
const groupOf = (group: string, title: string, entry: HumanDesignInterpretation, term?: string): ReportInterpretation[] => [
    {
        title, text: entry.summary, group, ...(term ? { term } : {}),
    },
    {
        title: '可能的優勢', text: entry.strengths, group, ...(term ? { term } : {}),
    },
    {
        title: '可能的盲點', text: entry.blindSpots, group, ...(term ? { term } : {}),
    },
];

/**
 * The Human Design report, from a chart that is worked out from the birth date, time and place. The type, the inner
 * authority, the defined centers and the complete channels are facts that can ground an inference; the profile, the
 * definition and the angle of the cross are facts and readings only (they say how a life role plays out, not a trait).
 * The readings are the reviewed fixed texts, never reworded.
 */
export function humanDesignReportInput(params: {
    chart: HumanDesignResult;
    birthDate: string;
    birthTime: string;
    birthPlace: string;
}): SystemReportInput {
    const { chart } = params;
    const profile = HUMAN_DESIGN_PROFILE_INTERPRETATIONS[chart.profile as HumanDesignProfile];
    const typeEntry = HUMAN_DESIGN_TYPE_INTERPRETATIONS[chart.type];
    const [
        personalitySun,
        personalityEarth,
        designSun,
        designEarth,
    ] = chart.incarnationCross.gates;
    const channelKeys = chart.channels.map(([a, b]) => `${Math.min(a, b)}-${Math.max(a, b)}`);
    const openCenters = CENTERS.filter((center) => !chart.definedCenters.includes(center));
    const typeLabel = HUMAN_DESIGN_TYPE_LABELS[chart.type];

    const facts: ReportFact[] = [
        {
            label: '類型', value: typeLabel, term: `hd:type:${chart.type}`,
        },
        {
            label: '策略', value: HUMAN_DESIGN_STRATEGY_LABELS[chart.strategy],
        },
        {
            label: '內在權威', value: HUMAN_DESIGN_AUTHORITY_LABELS[chart.authority], term: `hd:authority:${chart.authority}`,
        },
        {
            label: '人生角色', value: profile ? `${chart.profile} ${profile.name}` : chart.profile,
        },
        {
            label: '定義', value: HUMAN_DESIGN_DEFINITION_LABELS[chart.definition],
        },
        {
            label: '人生十字', value: `${HUMAN_DESIGN_CROSS_ANGLE_LABELS[chart.incarnationCross.angle]}（${personalitySun}/${personalityEarth} | ${designSun}/${designEarth}）`,
        },
        // The defined centers are one card and the channels one card; each still carries its own terms
        ...(chart.definedCenters.length > 0 ? [
            {
                label: '有定義的能量中心',
                value: chart.definedCenters.map((center) => HUMAN_DESIGN_CENTER_LABELS[center]).join('、'),
                terms: chart.definedCenters.map((center) => ({
                    term: `hd:center:${center}:defined`, value: HUMAN_DESIGN_CENTER_LABELS[center],
                })),
            },
        ] : []),
        ...(openCenters.length > 0 ? [
            {
                label: '未定義的能量中心', value: openCenters.map((center) => HUMAN_DESIGN_CENTER_LABELS[center]).join('、'),
            },
        ] : []),
        ...(channelKeys.length > 0 ? [
            {
                label: '完整的通道',
                value: channelKeys.map((key) => `${CHANNEL_NAMES[key]?.zh ?? key}（${key}）`).join('、'),
                terms: channelKeys.map((key) => ({
                    term: `hd:channel:${key}`, value: `${CHANNEL_NAMES[key]?.zh ?? key}（${key}）`,
                })),
            },
        ] : []),
    ];

    // The type is what the report opens with, as its overview: the verdict and what it says (the quote), then the strengths
    // and the blind spots as cards, the way the sun sign opens the zodiac report
    const typeTerm = `hd:type:${chart.type}`;
    const overview: ReportInterpretation[] = [
        {
            title: `類型：${typeLabel}`, text: typeEntry.summary, term: typeTerm, overview: true,
        },
        {
            title: '可能的優勢', text: typeEntry.strengths, term: typeTerm, overview: true,
        },
        {
            title: '可能的盲點', text: typeEntry.blindSpots, term: typeTerm, overview: true,
        },
    ];

    // The strategy goes with the type, as the third card of the overview; every other part is a group of its own,
    // named "…歸納", each with a small card for what it says and the strengths and blind spots it has
    const strategy: ReportInterpretation = {
        title: '策略', text: typeEntry.strategy, overview: true,
    };

    const interpretations: ReportInterpretation[] = [
        ...overview,
        strategy,
        ...groupOf('內在權威歸納', HUMAN_DESIGN_AUTHORITY_LABELS[chart.authority], HUMAN_DESIGN_AUTHORITY_INTERPRETATIONS[chart.authority], `hd:authority:${chart.authority}`),
        ...(profile ? groupOf('人生角色歸納', `${chart.profile} ${profile.name}`, profile) : []),
        ...groupOf('定義歸納', HUMAN_DESIGN_DEFINITION_LABELS[chart.definition], HUMAN_DESIGN_DEFINITION_INTERPRETATIONS[chart.definition]),
        ...groupOf('人生十字歸納', HUMAN_DESIGN_CROSS_ANGLE_LABELS[chart.incarnationCross.angle], HUMAN_DESIGN_CROSS_ANGLE_INTERPRETATIONS[chart.incarnationCross.angle]),
        ...chart.definedCenters.map((center) => ({
            title: `${HUMAN_DESIGN_CENTER_LABELS[center]}有定義`, text: CENTER_MEANINGS[center].defined, term: `hd:center:${center}:defined`, group: '能量中心歸納',
        })),
        ...openCenters.map((center) => ({
            title: `${HUMAN_DESIGN_CENTER_LABELS[center]}未定義`, text: CENTER_MEANINGS[center].open, group: '能量中心歸納',
        })),
        ...channelKeys.flatMap((key) => (CHANNEL_MEANINGS[key] ? [
            {
                title: CHANNEL_NAMES[key]?.zh ?? key, text: CHANNEL_MEANINGS[key], term: `hd:channel:${key}`, group: '通道歸納',
            },
        ] : [])),
    ];

    return {
        system: 'HUMAN_DESIGN',
        position: `${typeLabel}・${chart.profile}・${HUMAN_DESIGN_AUTHORITY_LABELS[chart.authority]}`,
        facts,
        interpretations,
        traits: humanDesignTermsOf(chart),
        advice: [typeEntry.strategy, typeEntry.reflection].filter((text) => text.trim()),
        notes: ['人類圖依出生時間與出生地計算，時間或城市有誤，類型與通道都可能不同。'],
        disclaimer: HUMAN_DESIGN_DISCLAIMER,
        basis: [
            buildBasis('HUMAN_DESIGN', {
                birthDate: params.birthDate, birthTime: params.birthTime, birthPlace: params.birthPlace,
            }),
        ],
    };
}
