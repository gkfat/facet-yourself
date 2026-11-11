import type { Transformation } from '../../constants/ziwei';
import {
    ZIWEI_DISCLAIMER, ZIWEI_LATE_ZI_NOTE, ZIWEI_LEAP_NOTE, ziweiHourNoteText,
} from '../../constants/ziweiLabels';
import { ziweiTermsOf } from '../../ontology/mappings/ziwei';
import type { ZiweiResponse } from '../../schemas/api/ziwei.schema';
import { buildBasis } from '../../utils/analysisBasis';
import {
    composeBodyPalaceReading, composeLifePalaceReading, type PalaceReading, type ZiweiContentLookup,
} from '../../utils/ziwei/readings';
import type {
    ReportFact, ReportInterpretation, SystemReportInput,
} from '../types';

export {
    ZIWEI_LATE_ZI_NOTE, ZIWEI_LEAP_NOTE, ziweiHourNoteText,
};

/** What the first version of Zi Wei leaves out, said on every report. */
export const ZIWEI_SCOPE_NOTE = '這是簡化版的紫微斗數：只呈現十四主星、四輔星（文昌、文曲、左輔、右弼）、生年四化、五行局、命主與身主，未包含煞星與其他輔星、星曜亮度與行運；不同排盤系統可能因此呈現不同結果。';

export const ZIWEI_EMPTY_LIFE_NOTE = '命宮沒有主星，這是命盤的事實；解讀裡借用對宮主星的部分只作參考，不納入特質推論。';

const rulesNote = (version: string) => `排盤規則：三合系統、農曆正月初一換年、閏月十五日分界、晚子時日期不換日、使用出生地的標準時間（不做真太陽時）；算法版本 ${version}。`;

type Placement = {
    star: string; transformation: Transformation | null;
};

const starLabel = (placement: Placement) => `${placement.star}${placement.transformation ? `化${placement.transformation}` : ''}`;

type PalaceOf = ZiweiResponse['palaces'][number];

/** The main stars of a palace as one line; a palace without a main star says so. */
const mainText = (palace: PalaceOf) => (palace.isEmpty ? '空宮（無主星）' : palace.mainStars.map(starLabel).join('、'));

const termsOf = (placements: readonly Placement[], kind: 'star' | 'aux'): NonNullable<ReportFact['terms']> => placements.map((placement) => ({
    term: `ziwei:${kind}:${placement.star}`, value: starLabel(placement),
}));

/** The words after the colon of a star's title ("天府：重視穩定與累積的人" → "重視穩定與累積的人"): the verdict a banner can carry. */
const verdictOf = (title: string) => (title.includes('：') ? title.slice(title.indexOf('：') + 1) : title);

const keyName = (key: string) => key.slice(key.indexOf('_') + 1);

/**
 * The overview of the life palace: a verdict in one line (the part before the first colon is what the banner shows under
 * the headline), then the strengths and the things to watch of its main stars. Everything else is a card of its own, so
 * no single block has to carry a palace's whole reading.
 */
function lifeOverview(life: PalaceOf, reading: PalaceReading, content: ZiweiContentLookup): ReportInterpretation[] {
    if (life.isEmpty) {
        const borrowed = reading.borrowed?.borrowedStars.map((placement) => placement.star) ?? [];
        const rest = borrowed.length > 0
            ? `命盤上沒有主星，這是命盤的事實；下方的借星卡以對宮（${reading.borrowed?.borrowedFromPalace}）的${borrowed.join('、')}作參考，借星不是命宮自己的星曜。`
            : '命盤上沒有主星，這是命盤的事實；對宮也沒有主星，沒有可以借用的星曜。';

        return [
            {
                title: '命宮解讀', text: `命宮是空宮：${rest}`, overview: true,
            },
        ];
    }

    const bodies = life.mainStars.flatMap((placement) => {
        const body = content(`star_${placement.star}`);

        return body ? [body] : [];
    });
    const [first] = bodies;

    if (!first) return [];

    const strengths = [...new Set(bodies.flatMap((body) => body.strengths))];
    const watch = [...new Set(bodies.flatMap((body) => body.blindSpots.slice(0, 1)))];

    return [
        {
            title: '命宮解讀', text: `${verdictOf(first.title)}：${first.summary}`, overview: true,
        },
        ...(strengths.length > 0 ? [
            {
                title: '可能的優勢', text: strengths.join('；'), overview: true, 
            },
        ] : []),
        ...(watch.length > 0 ? [
            {
                title: '可以多留意的', text: watch.join('；'), overview: true, 
            },
        ] : []),
    ];
}

/**
 * The rest of a palace's reading as small cards, each with a title that says what it is: the meaning of the palace, a
 * star of it, an auxiliary star, a 四化, and what is borrowed for an empty palace. The advice is not here: it goes to the
 * advice of the report. For the life palace the first main star and the strengths and things to watch are in the overview.
 */
function palaceCards(reading: PalaceReading, label: '命宮' | '身宮'): ReportInterpretation[] {
    const group = `${label}解讀`;
    const life = label === '命宮';
    const cards: ReportInterpretation[] = [];
    const borrowed = reading.sentences.filter((sentence) => sentence.kind === 'borrowed');
    let firstStarSkipped = !life;

    for (const sentence of reading.sentences) {
        const key = sentence.contentKeys[0] ?? '';

        if (sentence.kind === 'context') {
            cards.push({
                title: `${label}的意義`, text: sentence.text, group,
            });
        } else if (sentence.kind === 'star') {
            if (!firstStarSkipped) {
                firstStarSkipped = true;
                continue;
            }

            cards.push({
                title: `${life ? '同宮主星' : '身宮的星'}・${keyName(key)}`, text: sentence.text, group,
            });
        } else if (sentence.kind === 'aux') {
            cards.push({
                title: `同宮輔星・${keyName(key)}`, text: sentence.text, group,
            });
        } else if (sentence.kind === 'transformation') {
            cards.push({
                title: `生年化${keyName(key)}`, text: sentence.text, group,
            });
        } else if (!life && (sentence.kind === 'strengths' || sentence.kind === 'watch')) {
            const previous = cards.at(-1);

            if (previous?.title === '身宮的優勢與留意') previous.text += `\n${sentence.text}`;
            else cards.push({
                title: '身宮的優勢與留意', text: sentence.text, group, 
            });
        }
    }

    if (borrowed.length > 0) {
        const empty = reading.sentences.find((sentence) => sentence.kind === 'empty');

        cards.push({
            title: '借星參考',
            text: [...(life || !empty ? [] : [empty.text]), ...borrowed.map((sentence) => sentence.text)].join('\n'),
            group,
        });
    }

    return cards;
}

/**
 * The Zi Wei report, from a chart the Zi Wei service has already worked out and the fixed readings of the stars and
 * palaces it needs. The chart is shown as facts in the system's own words; only the stars in the life palace and the body
 * palace, and the 四化 that lands on them, are facts a trait is read from (every chart has all the stars somewhere, so the
 * rest says nothing about this person). An empty palace stays empty: the stars its reading borrows are named as borrowed
 * and never become a trait.
 */
export function ziweiReportInput(params: {
    chart: ZiweiResponse;
    content: ZiweiContentLookup;
    birthDate: string;
    birthTime: string;
    birthPlace: string | null;
}): SystemReportInput {
    const { chart } = params;
    const { meta } = chart;
    const life = chart.palaces[0];
    const body = chart.palaces.find((palace) => palace.palace === chart.bodyPalace.palace);

    if (!life || life.palace !== '命宮' || !body) throw new Error('A Zi Wei chart starts at the life palace');

    const month = meta.isLeapMonth ? `閏${meta.originalLunarMonth}` : String(meta.originalLunarMonth);
    const shifted = meta.effectiveLunarMonth !== meta.originalLunarMonth ? `（排盤以 ${meta.effectiveLunarMonth} 月計）` : '';
    const where = (star: string) => chart.palaces.find((palace) => [...palace.mainStars, ...palace.auxiliaryStars].some((placement) => placement.star === star));
    const reading = (palace: PalaceOf) => palace.palace === life.palace || palace.palace === body.palace;
    const palaceName = (name: string) => (name.endsWith('宮') ? name : `${name}宮`);
    // Each 四化 is a short card of its own: the star it is on and the palace that star is in. The ones that land in the life or
    // the body palace are what a trait is read from; the others are only shown
    const transformationFacts: ReportFact[] = chart.birthYearTransformations.map((item) => {
        const palace = where(item.star);

        return {
            label: `化${item.transformation}`,
            value: `${item.star}${palace ? `・${palaceName(palace.palace)}` : ''}`,
            ...(palace && reading(palace) ? { term: `ziwei:transformation:${item.transformation}` } : {}),
        };
    });
    // The main stars and the auxiliary stars of a palace are separate cards, so no card is a long line that breaks in the middle of a star
    const palaceFacts = (label: '命宮' | '身宮', palace: PalaceOf): ReportFact[] => [
        {
            label,
            value: label === '命宮'
                ? `${palace.branch}宮・${mainText(palace)}`
                : `${palaceName(palace.palace)}（${palace.branch}宮）・${mainText(palace)}`,
            terms: termsOf(palace.mainStars, 'star'),
        }, ...(palace.auxiliaryStars.length > 0 ? [
            {
                label: `${label}輔星`, value: palace.auxiliaryStars.map(starLabel).join('、'), terms: termsOf(palace.auxiliaryStars, 'aux'),
            },
        ] : []),
    ];

    const facts: ReportFact[] = [
        {
            label: '農曆生辰', value: `${meta.lunarYearStem}${meta.lunarYearBranch}年${month}月${meta.lunarDay}日${shifted}\u3000${meta.hourBranch}時`,
        },
        {
            label: '五行局', value: chart.bureau.label,
        },
        ...palaceFacts('命宮', life),
        ...(chart.bodyPalace.sameAsLife
            ? [
                {
                    label: '身宮', value: `與命宮同宮（${life.branch}宮）`,
                },
            ]
            : palaceFacts('身宮', body)),
        {
            label: '命主', value: chart.lifeMaster,
        },
        {
            label: '身主', value: chart.bodyMaster,
        },
        ...transformationFacts,
    ];

    const lifeReading = composeLifePalaceReading(chart, params.content);
    const bodyReading = composeBodyPalaceReading(chart, params.content);
    const interpretations: ReportInterpretation[] = [
        ...lifeOverview(life, lifeReading, params.content),
        ...palaceCards(lifeReading, '命宮'),
        ...palaceCards(bodyReading, '身宮'),
    ];
    // The advice of the life palace, then what the stars in it suggest to work on; an empty palace has none of its own and borrows none here
    const lifeAdvice = lifeReading.sentences.filter((sentence) => sentence.kind === 'advice').map((sentence) => sentence.text);
    const advice = [...new Set([...lifeAdvice, ...life.mainStars.map((placement) => params.content(`star_${placement.star}`)?.growthAdvice ?? '').filter((text) => text.trim() !== '')])];
    const hourNotes = chart.hourNotes.map(ziweiHourNoteText);

    return {
        system: 'ZIWEI',
        position: `命宮${life.branch}宮・${life.isEmpty ? '空宮' : life.mainStars.map((placement) => placement.star).join('')}・${chart.bureau.label}`,
        facts,
        interpretations,
        traits: ziweiTermsOf(chart),
        advice,
        notes: [
            ZIWEI_SCOPE_NOTE,
            rulesNote(chart.algorithmVersion),
            ...(life.isEmpty ? [ZIWEI_EMPTY_LIFE_NOTE] : []),
            ...(meta.isLeapMonth ? [ZIWEI_LEAP_NOTE] : []),
            ...hourNotes,
            ...(chart.timeZoneAssumed ? [`沒有出生城市，以 ${chart.timeZone} 計算。`] : []),
        ],
        disclaimer: ZIWEI_DISCLAIMER,
        basis: [
            buildBasis('ZIWEI', {
                birthDate: params.birthDate,
                birthTime: params.birthTime,
                ...(params.birthPlace ? { birthPlace: params.birthPlace } : {}),
            }),
        ],
    };
}
