// Plain `.ts` import specifiers: this file is also run directly by Node
// (type stripping) from scripts/, where extensionless imports do not resolve.
import { z } from 'zod';
import { keywordRule } from '../ontology/mappings/keywordRule.ts';
import type { ReportFact } from '../report/types.ts';
import { buildAssessmentBasis } from '../utils/assessmentBasis.ts';
import {
    rankDimensions, scoreDimensions,
} from './scoring.ts';
import {
    defineScaleAssessment, type ScaleDimensionInfo, type ScaleItem,
} from './types.ts';

/** Carries `ref`: the 60 items are our own design after the six-factor idea, not validated and not the HEXACO-PI-R */
export const HEXACO_VERSION = 'hexaco-ref-v1';

export const HEXACO_DIMENSIONS = [
    'honesty_humility',
    'emotionality',
    'extraversion',
    'agreeableness',
    'conscientiousness',
    'openness',
] as const;

export type HexacoDimension = typeof HEXACO_DIMENSIONS[number];

const LEVELS = [
    'low',
    'mid',
    'high',
] as const;

export const HEXACO_DIMENSION_INFO: readonly (ScaleDimensionInfo & { id: HexacoDimension })[] = [
    {
        id: 'honesty_humility', name: '誠實謙遜', high: '真誠、公平、不貪圖、不自誇', low: '看重自身利益與地位、懂得為自己爭取',
    },
    {
        id: 'emotionality', name: '情緒性', high: '容易擔心、情感細膩、需要情感支持', low: '遇事鎮定、情緒獨立、與人保持距離',
    },
    {
        id: 'extraversion', name: '外向性', high: '自在、主動、愛熱鬧、精力充沛', low: '安靜、獨處也自在、社交後需要恢復',
    },
    {
        id: 'agreeableness', name: '宜人性', high: '寬容、溫和、願意讓步、有耐性', low: '直接、堅守立場、對不合理的事不輕易退讓',
    },
    {
        id: 'conscientiousness', name: '盡責性', high: '有條理、勤奮、仔細、行動前先想', low: '隨性、彈性、不愛被計畫綁住',
    },
    {
        id: 'openness', name: '開放性', high: '欣賞美、好奇、有創意、愛嘗試不同的做法', low: '務實、偏好熟悉的做法與具體的事物',
    },
];

/** Ten statements for each dimension, the second of each pair turned against it; asked mixed across the dimensions */
const STATEMENTS: Readonly<Record<HexacoDimension, readonly (readonly [string, boolean])[]>> = {
    honesty_humility: [
        ['我不會為了討好別人而說出違心的稱讚。', false],
        ['我覺得適度奉承一下，能讓事情順利許多。', true],
        ['即使不會被發現，我也不會多拿不屬於我的東西。', false],
        ['如果規則有漏洞可以鑽，我多半會拿來用。', true],
        ['我對名牌或身分地位並不特別在意。', false],
        ['我很希望別人把我看成特別重要的人。', true],
        ['談判時，我認為公平比拿到最多更重要。', false],
        ['我不太介意用一點小手段，換取對自己有利的結果。', true],
        ['談到自己的成就時，我通常很低調。', false],
        ['我認為自己比大多數人更值得擁有好東西。', true],
    ],
    emotionality: [
        ['遇到有風險的事，我會比別人更容易緊張。', false],
        ['面對危險或意外，我通常能保持鎮定。', true],
        ['一些小事也會讓我反覆擔心。', false],
        ['我很少為未來的事感到焦慮。', true],
        ['心情不好時，我很想找人傾訴、尋求安慰。', false],
        ['遇到困難，我習慣自己扛，不太需要別人的情感支持。', true],
        ['看到別人難過，我也會跟著難受。', false],
        ['再感人的電影或故事，我也很少被觸動。', true],
        ['和重要的人分開，會讓我很捨不得。', false],
        ['對別人的煩惱，我通常能保持距離，不太受影響。', true],
    ],
    extraversion: [
        ['我在人群中通常覺得自在。', false],
        ['我常覺得自己沒有什麼值得別人注意的地方。', true],
        ['我習慣主動和不熟的人打招呼、聊天。', false],
        ['比起參加聚會，我比較喜歡一個人待著。', true],
        ['在團體裡，我常是帶動氣氛的人。', false],
        ['要在許多人面前發言時，我會想盡量避開。', true],
        ['我平常精力充沛、愛熱鬧。', false],
        ['整天都在社交之後，我只覺得很累。', true],
        ['我很容易和新認識的人變得熟絡。', false],
        ['對各種活動，我通常沒有特別興奮，心情很平靜。', true],
    ],
    agreeableness: [
        ['別人傷害我之後，我通常願意再給對方機會。', false],
        ['別人對我做過的錯事，我會記很久。', true],
        ['評論別人時，我習慣說得溫和。', false],
        ['我覺得有時必須嚴厲批評別人，而且我不會太客氣。', true],
        ['意見不同時，我通常願意讓步。', false],
        ['我認為堅持自己的立場比維持和氣更重要。', true],
        ['即使被激怒，我也很少發脾氣。', false],
        ['別人重複犯同樣的錯，我就會很不耐煩。', true],
        ['我能接受做法和我很不一樣的人。', false],
        ['遇到爭執，我常忍不住反駁到底。', true],
    ],
    conscientiousness: [
        ['我的東西通常整理得井井有條。', false],
        ['我常找不到東西，因為隨手亂放。', true],
        ['一旦開始做事，我會堅持做到完成。', false],
        ['要做的事，我常拖到最後一刻才動手。', true],
        ['我會反覆檢查成果，確保沒有小錯誤。', false],
        ['差不多就好，細節不必太計較。', true],
        ['做決定前，我會先仔細想過後果。', false],
        ['我常憑一時衝動買東西或做決定。', true],
        ['我會替自己訂目標，並照計畫前進。', false],
        ['面對困難的工作，我容易半途放棄。', true],
    ],
    openness: [
        ['美麗的風景、音樂或藝術常讓我停下來欣賞。', false],
        ['藝術與美感的東西，對我沒有特別的吸引力。', true],
        ['對各種領域的新知識，我都感到好奇。', false],
        ['與自己生活無關的事，我不太想去了解。', true],
        ['我常想出與眾不同的點子。', false],
        ['我不覺得自己有什麼創意。', true],
        ['我喜歡接觸想法和我很不同的人。', false],
        ['我偏好熟悉的做法，不喜歡打破慣例。', true],
        ['我喜歡想像一些不存在的情境與可能。', false],
        ['抽象的理論和哲學討論，讓我覺得很無聊。', true],
    ],
};

/** The items in the order they are asked: one of each dimension in turn, so that no page is about one thing only */
export const HEXACO_ITEMS: readonly ScaleItem[] = Array.from({ length: 10 }, (_, round) => HEXACO_DIMENSIONS.map((dimension) => ({
    dimension,
    statement: STATEMENTS[dimension][round],
}))).flat().map((entry, index): ScaleItem => ({
    id: `hx${String(index + 1).padStart(2, '0')}`,
    text: entry.statement?.[0] ?? '',
    dimension: entry.dimension,
    ...(entry.statement?.[1] ? { reversed: true } : {}),
}));

const contentKeyOf = (dimension: string, level: string) => `hexaco_${dimension}_${level}`;

const HEXACO_CONTENT_KEYS = HEXACO_DIMENSIONS.flatMap((dimension) => LEVELS.map((level) => contentKeyOf(dimension, level)));

/** The terms a level that leans somewhere has; the middle says nothing */
const termOf = (dimension: string, level: 'low' | 'high') => `hexaco:${dimension}:${level}`;

export const HEXACO_TERMS: readonly string[] = HEXACO_DIMENSIONS.flatMap((dimension) => [termOf(dimension, 'low'), termOf(dimension, 'high')]);

const rule = keywordRule('HEXACO');

/** Kept to the plain meaning of each end; no end of a dimension is better than the other */
const HEXACO_MAPPINGS = [
    ...rule(termOf('honesty_humility', 'high'), 'D3.A', 'C3.A'),
    ...rule(termOf('honesty_humility', 'low'), 'D3.B', 'E4.A'),
    ...rule(termOf('emotionality', 'high'), 'C1.A', 'C4.B', 'D2.A', 'E3.B'),
    ...rule(termOf('emotionality', 'low'), 'C1.B', 'C4.A', 'E3.A'),
    ...rule(termOf('extraversion', 'high'), 'C2.A', 'D4.A', 'D5.A'),
    ...rule(termOf('extraversion', 'low'), 'C2.B', 'D4.B'),
    ...rule(termOf('agreeableness', 'high'), 'D6.A', 'D3.A', 'C3.B'),
    ...rule(termOf('agreeableness', 'low'), 'D6.B', 'C3.A', 'D3.B'),
    ...rule(termOf('conscientiousness', 'high'), 'B5.A', 'B1.A', 'A5.A', 'B4.A', 'E6.A'),
    ...rule(termOf('conscientiousness', 'low'), 'B5.B', 'B1.B', 'E6.B', 'B4.B'),
    ...rule(termOf('openness', 'high'), 'A3.A', 'A4.A', 'A6.A', 'E1.B', 'E2.A'),
    ...rule(termOf('openness', 'low'), 'A3.B', 'A4.B', 'A6.B', 'E1.A'),
];

const resultSchema = z.object({
    scores: z.array(z.object({
        dimension: z.enum(HEXACO_DIMENSIONS),
        score: z.number().int().min(0).max(100),
        level: z.enum(LEVELS),
    })).length(HEXACO_DIMENSIONS.length),
});

const LEVEL_WORDS = {
    low: '偏低', mid: '居中', high: '偏高',
} as const;

const nameOf = (dimension: string) => HEXACO_DIMENSION_INFO.find((info) => info.id === dimension)?.name ?? dimension;

export const HEXACO_ASSESSMENT = defineScaleAssessment({
    id: 'hexaco',
    systemId: 'HEXACO',
    title: 'HEXACO 人格',
    version: HEXACO_VERSION,
    allContentKeys: HEXACO_CONTENT_KEYS,
    resultSchema,
    contentKeys: (result) => result.scores.map((entry) => contentKeyOf(entry.dimension, entry.level)),
    traitMappings: HEXACO_MAPPINGS,
    basePrice: 1,
    items: HEXACO_ITEMS,
    dimensions: HEXACO_DIMENSION_INFO,
    score: (answers) => {
        const scored = scoreDimensions(answers, HEXACO_ITEMS);

        return {
            scores: HEXACO_DIMENSIONS.map((dimension) => {
                const entry = scored.find((candidate) => candidate.dimension === dimension);

                if (!entry) throw new Error(`No score for ${dimension}`);

                return {
                    dimension, score: entry.score, level: entry.level ?? 'mid',
                };
            }),
        };
    },
    reportInput: (result, contents) => {
        const ranked = rankDimensions(result.scores);
        const highest = ranked[0];
        const lowest = ranked[ranked.length - 1];
        const leaning = result.scores.filter((entry) => entry.level !== 'mid');
        const bodies = result.scores.flatMap((entry) => {
            const body = contents[contentKeyOf(entry.dimension, entry.level)];

            return body ? [
                {
                    entry, body,
                },
            ] : [];
        });
        const facts: ReportFact[] = result.scores.map((entry) => ({
            label: nameOf(entry.dimension),
            value: `${LEVEL_WORDS[entry.level]}（${entry.score}）`,
            ...(entry.level === 'mid' ? {} : { term: termOf(entry.dimension, entry.level) }),
        }));

        return {
            system: 'HEXACO',
            position: highest && lowest ? `${nameOf(highest.dimension)}最高、${nameOf(lowest.dimension)}最低` : '',
            facts,
            interpretations: bodies.map(({
                entry, body, 
            }) => ({
                title: body.title,
                text: body.summary,
                ...(entry.level === 'mid' ? {} : { term: termOf(entry.dimension, entry.level) }),
            })),
            traits: leaning.map((entry) => termOf(entry.dimension, entry.level === 'high' ? 'high' : 'low')),
            advice: bodies.map(({ body }) => body.growthAdvice).filter((text) => text.trim() !== ''),
            notes: ['HEXACO 的題目由本站自行設計，沒有經過信度與效度驗證，不是任何既有量表。'],
            disclaimer: bodies[0]?.body.disclaimer ?? '本內容為自我探索參考，不是心理評估或診斷。',
            basis: [buildAssessmentBasis('HEXACO', HEXACO_VERSION)],
        };
    },
});
