import {
    ELEMENT_LABELS, STRENGTH_LEVEL_LABELS, TEN_GOD_GROUP_LABELS, type Element,
} from '../../constants/bazi';
import { BAZI_DISCLAIMER } from '../../constants/baziLabels';
import { baziTermsOf } from '../../ontology/mappings/bazi';
import type { BaziResponse } from '../../schemas/api/bazi.schema';
import type { FixedResultResponse } from '../../schemas/api/fixedResult.schema';
import { buildBasis } from '../../utils/analysisBasis';
import {
    dominantElement, dominantGroup, missingElements,
} from '../../utils/bazi/analysis';
import {
    FLOW_YEAR_COUNT, currentBaziYear,
} from '../../utils/bazi/luck';
import { readingsOfBody } from './common';
import type {
    ReportFact, ReportInterpretation, ReportTimeFact, SystemReportInput,
} from '../types';

const POLARITY_LABELS = {
    YANG: '陽', YIN: '陰',
} as const;

const pillarLabel = (pillar: { stem: string; branch: string }) => `${pillar.stem}${pillar.branch}`;

/** The mapping term of a fixed reading, from its key (`element_missing_wood` -> `bazi:element:missing:wood`). */
function termOfKey(key: string): string | undefined {
    const strong = /^element_strong_(.+)$/.exec(key);
    const missing = /^element_missing_(.+)$/.exec(key);
    const group = /^group_dominant_(.+)$/.exec(key);
    const day = /^daymaster_(.+)$/.exec(key);
    const level = /^strength_(.+)$/.exec(key);
    const pattern = /^pattern_(.+)$/.exec(key);

    if (strong) return `bazi:element:strong:${strong[1]}`;
    if (missing) return `bazi:element:missing:${missing[1]}`;
    if (group) return `bazi:group:${group[1]}`;
    if (day) return `bazi:daymaster:${day[1]}`;
    if (level) return `bazi:strength:${level[1]}`;
    if (pattern) return `bazi:pattern:${pattern[1]}`;

    return undefined;
}

/**
 * The BaZi report, from a chart the BaZi service has already worked out and the readings it has fetched. The four
 * pillars, the day master, the elements, the strength, the pattern and the useful gods are facts in the system's own
 * words; the luck step in force and this year are time-sensitive facts with the date they were made for. Without a
 * birth time there is no hour pillar, and without a gender no luck: the report says so instead of guessing.
 */
export function baziReportInput(params: {
    chart: BaziResponse;
    birthDate: string;
    birthTime: string | null;
    birthPlace: string | null;
    gender: string | null;
    today: string;
}): SystemReportInput {
    const { chart } = params;
    const day = chart.dayMaster;
    const dayLabel = `${day.stem}${ELEMENT_LABELS[day.element]}`;
    const strongElement = dominantElement(chart.elementCounts);
    const group = dominantGroup(chart.groupCounts);
    const missing = missingElements(chart.elementCounts);
    const { useful } = chart.strength;
    const luckStep = chart.luck?.steps.find((step) => step.order === chart.luck?.currentOrder) ?? null;
    const nextStep = luckStep ? chart.luck?.steps.find((step) => step.order === luckStep.order + 1) ?? null : null;
    // This year (the year changes at 立春) and the next four, taken from the ten flow years of each step
    const firstYear = currentBaziYear(new Date(`${params.today}T12:00:00+08:00`));
    const flowYears = Object.values(chart.luck?.stepYears ?? {})
        .flat()
        .filter((flow) => flow.year >= firstYear)
        .sort((a, b) => a.year - b.year)
        .slice(0, FLOW_YEAR_COUNT);

    const facts: ReportFact[] = [
        {
            label: '四柱',
            value: [
                `年柱 ${pillarLabel(chart.pillars.year)}`,
                `月柱 ${pillarLabel(chart.pillars.month)}`,
                `日柱 ${pillarLabel(chart.pillars.day)}`,
                chart.pillars.hour ? `時柱 ${pillarLabel(chart.pillars.hour)}` : '時柱 未知',
            ].join('　'),
        },
        {
            label: '日主', value: `${dayLabel}（${POLARITY_LABELS[day.polarity]}${ELEMENT_LABELS[day.element]}）`, term: `bazi:daymaster:${day.stem}`,
        },
        {
            label: '五行分布', value: (Object.keys(ELEMENT_LABELS) as Element[]).map((element) => `${ELEMENT_LABELS[element]} ${chart.elementCounts[element] ?? 0}`).join('、'),
        },
        ...(strongElement ? [
            {
                label: '五行偏旺', value: `${ELEMENT_LABELS[strongElement]}氣明顯`, term: `bazi:element:strong:${strongElement}`,
            },
        ] : []),
        // The missing elements are one card, each still carrying its own term
        ...(missing.length > 0 ? [
            {
                label: '五行缺少',
                value: missing.map((element) => ELEMENT_LABELS[element]).join('、'),
                terms: missing.map((element) => ({
                    term: `bazi:element:missing:${element}`, value: ELEMENT_LABELS[element],
                })),
            },
        ] : []),
        ...(group ? [
            {
                label: '十神偏多', value: TEN_GOD_GROUP_LABELS[group], term: `bazi:group:${group}`,
            },
        ] : []),
        {
            label: '日主強弱', value: STRENGTH_LEVEL_LABELS[chart.strength.level], term: `bazi:strength:${chart.strength.level}`,
        },
        {
            label: '命格', value: `${chart.strength.pattern.key}格`, term: `bazi:pattern:${chart.strength.pattern.key}`,
        },
        ...(useful ? [
            {
                label: '喜用神',
                value: `較順手的方向：${TEN_GOD_GROUP_LABELS[useful.useful]}，其次${TEN_GOD_GROUP_LABELS[useful.favorable]}；較吃力的方向：${useful.avoid.map((item) => TEN_GOD_GROUP_LABELS[item]).join('、')}`,
            },
        ] : []),
        {
            label: '月令與節氣', value: `${chart.pillars.month.branch}月，${chart.facts.solarTerm}，${chart.facts.season}`,
        },
        ...(chart.bone ? [
            {
                label: '稱骨', value: chart.bone.label,
            },
        ] : []),
    ];

    const interpretation = chart.interpretation;

    // The day master is what the report opens with, as its overview: the verdict, then the strengths and the blind spots
    const overview: ReportInterpretation[] = interpretation.dayMaster
        ? readingsOfBody(interpretation.dayMaster, termOfKey(interpretation.dayMaster.key)).map((reading) => ({
            ...reading, overview: true,
        }))
        : [];

    // Every other reading is one small card of a group named "…歸納": its title (a colon becomes a dot, since the page
    // takes the words before the first colon as the title of a card), what it says, then the strengths and blind spots
    const card = (group: string, fixed: FixedResultResponse | null): ReportInterpretation[] => {
        if (!fixed) return [];

        const parts = [
            fixed.summary.trim(),
            fixed.strengths.length > 0 ? `可能的優勢：${fixed.strengths.join('；')}` : '',
            fixed.blindSpots.length > 0 ? `可能的盲點：${fixed.blindSpots.join('；')}` : '',
        ].filter((part) => part !== '');
        const term = termOfKey(fixed.key);

        return [
            {
                title: fixed.title.replaceAll('：', '・'), text: parts.join('\n'), group, ...(term ? { term } : {}),
            },
        ];
    };

    const timeFacts: ReportTimeFact[] = [
        ...(luckStep ? [
            {
                text: `目前大運：${pillarLabel(luckStep.pillar)} 運（十神${luckStep.tenGod}，${luckStep.startAge} 至 ${luckStep.endAge} 歲，${luckStep.startYear} 至 ${luckStep.endYear} 年）`,
                asOf: params.today,
                group: '大運',
            },
        ] : []),
        ...(nextStep ? [
            {
                text: `下一步大運：${pillarLabel(nextStep.pillar)} 運（十神${nextStep.tenGod}，${nextStep.startAge} 至 ${nextStep.endAge} 歲，${nextStep.startYear} 至 ${nextStep.endYear} 年）`,
                asOf: params.today,
                group: '大運',
            },
        ] : []),
        ...flowYears.map((flow) => ({
            text: `${flow.year} 年流年：${pillarLabel(flow.pillar)}（十神${flow.tenGod}）`, asOf: params.today, group: '流年',
        })),
        ...(interpretation.currentLuck ? [
            {
                text: `【依八字命理】${interpretation.currentLuck.title.replaceAll('：', '・')}：${interpretation.currentLuck.summary}`, asOf: params.today, reading: true, group: '大運',
            },
        ] : []),
    ];

    const notes = [
        ...(chart.hasTime ? [] : ['沒有出生時間，只有年、月、日三柱，也算不出稱骨與大運。']),
        ...(chart.luckStatus === 'NEEDS_GENDER' ? ['填寫性別（只用來決定大運的排法），就能看到大運與流年。'] : []),
        ...(chart.timeZoneAssumed ? [`沒有出生城市，以 ${chart.timeZone} 計算。`] : []),
        ...(chart.termDay ? [`出生日剛好是「${chart.termDay.term}」交節的日子，而且沒有出生時間，月柱${chart.termDay.changesYear ? '與年柱' : ''}可能不同。`] : []),
    ];

    return {
        system: 'BAZI',
        position: `日主${dayLabel}・${STRENGTH_LEVEL_LABELS[chart.strength.level]}・${chart.strength.pattern.key}格`,
        facts,
        interpretations: [
            ...overview,
            ...card('五行與十神歸納', interpretation.strongElement),
            ...interpretation.missingElements.flatMap((fixed) => card('五行與十神歸納', fixed)),
            ...card('五行與十神歸納', interpretation.dominantGroup),
            ...card('強弱與格局歸納', interpretation.strength),
            ...card('強弱與格局歸納', interpretation.pattern),
            ...card('強弱與格局歸納', interpretation.usefulGods),
            ...card('月令與稱骨歸納', interpretation.month),
            ...card('月令與稱骨歸納', interpretation.bone),
        ],
        traits: baziTermsOf(chart, chart.strength),
        timeFacts,
        advice: [],
        notes,
        disclaimer: BAZI_DISCLAIMER,
        basis: [
            // Basis inputs hold values only, so what was not given is left out
            buildBasis('BAZI', {
                birthDate: params.birthDate,
                ...(params.birthTime ? { birthTime: params.birthTime } : {}),
                ...(params.birthPlace ? { birthPlace: params.birthPlace } : {}),
                ...(params.gender ? { gender: params.gender } : {}),
            }),
        ],
    };
}
