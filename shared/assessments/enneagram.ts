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

/** Carries `ref`: the 54 items are our own design after the motives of the nine types, not validated and not any existing instrument */
export const ENNEAGRAM_VERSION = 'enneagram-ref-v1';

/** Two types whose scores are closer than this are shown side by side: neither is named the one */
export const ENNEAGRAM_TIE_BELOW = 10;

export const ENNEAGRAM_TYPES = [
    'type-1',
    'type-2',
    'type-3',
    'type-4',
    'type-5',
    'type-6',
    'type-7',
    'type-8',
    'type-9',
] as const;

export type EnneagramType = typeof ENNEAGRAM_TYPES[number];

export const ENNEAGRAM_TYPE_INFO: readonly (ScaleDimensionInfo & { id: EnneagramType })[] = [
    {
        id: 'type-1', name: '第 1 型・原則者', high: '追求正確與改進，對自己和事情要求高', low: '這方面的傾向不明顯',
    },
    {
        id: 'type-2', name: '第 2 型・助人者', high: '希望被需要，習慣先照顧別人', low: '這方面的傾向不明顯',
    },
    {
        id: 'type-3', name: '第 3 型・成就者', high: '重視成果與被肯定，行動有效率', low: '這方面的傾向不明顯',
    },
    {
        id: 'type-4', name: '第 4 型・個人主義者', high: '在意獨特與真實，情感深刻', low: '這方面的傾向不明顯',
    },
    {
        id: 'type-5', name: '第 5 型・探究者', high: '需要獨處與理解，謹慎分配精力', low: '這方面的傾向不明顯',
    },
    {
        id: 'type-6', name: '第 6 型・忠誠者', high: '預想風險、重視可靠與忠誠', low: '這方面的傾向不明顯',
    },
    {
        id: 'type-7', name: '第 7 型・熱情者', high: '嚮往多樣與自由，避開受困與匱乏', low: '這方面的傾向不明顯',
    },
    {
        id: 'type-8', name: '第 8 型・挑戰者', high: '想自己作主、直接、願意保護所在乎的人', low: '這方面的傾向不明顯',
    },
    {
        id: 'type-9', name: '第 9 型・和平者', high: '重視和諧，淡化自己的需要', low: '這方面的傾向不明顯',
    },
];

/** Six statements for each type, each about what it wants or fears; asked mixed across the types */
const STATEMENTS: Readonly<Record<EnneagramType, readonly string[]>> = {
    'type-1': [
        '我很在意把事情做得正確，小小的錯誤也會讓我不安。',
        '我心裡常有一個聲音在評判「這樣夠不夠好」。',
        '我覺得自己有責任把事情改善到更好。',
        '看到別人隨便敷衍，我會忍不住覺得不舒服。',
        '我常壓抑自己的怒氣，因為覺得生氣不夠得體。',
        '我很害怕自己犯錯，或被認為品行有瑕疵。',
    ],
    'type-2': [
        '當我感到被需要的時候，我最覺得自己有價值。',
        '我常先注意到別人需要什麼，才想到自己要什麼。',
        '我有時會暗暗期待自己的付出被看見、被回報。',
        '我很難開口向別人求助。',
        '我害怕自己不被愛，或沒有人需要我。',
        '我常讓自己成為別人眼中貼心、好相處的人。',
    ],
    'type-3': [
        '我的價值感有很大一部分來自成果與別人的肯定。',
        '我會依場合調整自己呈現的樣子，讓自己看起來有成就。',
        '面對目標，我很快就能想出最有效率的做法。',
        '失敗，或被當成沒用的人，是我很不想面對的事。',
        '沒事做的時候我會不安，總想著要有更多進展。',
        '我常分不清哪些是我真正的感受，哪些是我該有的表現。',
    ],
    'type-4': [
        '我常覺得自己和別人有些根本上的不同。',
        '我很在意自己的獨特與真實，不想只是普通。',
        '我的情緒很深，常沉浸在憂鬱或渴望裡。',
        '我常覺得別人擁有我所缺少的東西。',
        '我害怕自己沒有真正的身分或意義。',
        '我容易被美、藝術與有深度的事物打動。',
    ],
    'type-5': [
        '我需要大量獨處的時間，來整理想法與恢復能量。',
        '我覺得自己的精力與時間有限，必須謹慎分配。',
        '我喜歡把事情研究透徹，才覺得有資格表達意見。',
        '我害怕被別人的要求或情緒淹沒。',
        '我常以旁觀者的角度觀察，不太投入其中。',
        '我很重視隱私，不輕易讓人了解我。',
    ],
    'type-6': [
        '我常預想事情可能出錯，先做好準備。',
        '我很難完全信任一個人或權威，總想再確認。',
        '我很重視忠誠，也希望有可以依靠的人或團體。',
        '做決定前，我會反覆懷疑自己是不是漏看了什麼。',
        '我害怕失去支持，或被逼到沒有保障的處境。',
        '壓力下我容易焦慮，腦中浮現各種最壞的情況。',
    ],
    'type-7': [
        '我喜歡同時有許多有趣的選擇與計畫。',
        '我常把注意力轉向正面的事，避開痛苦的感受。',
        '我很怕被困住，或被迫忍受無聊與匱乏。',
        '我對新點子很快就熱血起來。',
        '我常覺得，如果在難受的感覺裡待太久，會出不來。',
        '我很難把一件事做到最後，因為又有新的事吸引我。',
    ],
    'type-8': [
        '我不喜歡被控制，也不喜歡顯得軟弱。',
        '我會直接表達強烈的想法與感受，不太拐彎。',
        '我常自然地站出來，保護自己在乎的人。',
        '我很怕被掌控或被傷害，所以習慣先握有主導權。',
        '遇到不公平的事，我會憤怒，想立刻處理。',
        '對我來說，示弱需要很大的信任才做得到。',
    ],
    'type-9': [
        '我很在意身邊保持和諧，不喜歡衝突。',
        '我常順著別人的意思，卻不確定自己真正想要什麼。',
        '我容易分心做瑣事，而拖延重要的事。',
        '我害怕與人分離，或關係出現裂痕。',
        '我習慣淡化自己的需要，覺得「都可以」。',
        '我能理解各方的立場，也因此常難以做決定。',
    ],
};

/** The items in the order they are asked: one of each type in turn, so that no page is about one type only */
export const ENNEAGRAM_ITEMS: readonly ScaleItem[] = Array.from({ length: 6 }, (_, round) => ENNEAGRAM_TYPES.map((type) => ({
    type, text: STATEMENTS[type][round] ?? '',
}))).flat().map((entry, index): ScaleItem => ({
    id: `en${String(index + 1).padStart(2, '0')}`,
    text: entry.text,
    dimension: entry.type,
}));

const contentKeyOf = (type: string) => `enneagram_${type}`;

export const ENNEAGRAM_TIE_KEY = 'enneagram_tie';

const ENNEAGRAM_CONTENT_KEYS = [...ENNEAGRAM_TYPES.map(contentKeyOf), ENNEAGRAM_TIE_KEY];

const termOf = (type: string) => `enneagram:${type}`;

export const ENNEAGRAM_TERMS: readonly string[] = ENNEAGRAM_TYPES.map(termOf);

const rule = keywordRule('ENNEAGRAM');

/** Kept to the plain motives of each type; no type is better than another */
const ENNEAGRAM_MAPPINGS = [
    ...rule(termOf('type-1'), 'B5.A', 'A5.A', 'E6.A', 'D6.B'),
    ...rule(termOf('type-2'), 'D2.A', 'D1.A', 'D3.A', 'E3.B'),
    ...rule(termOf('type-3'), 'B6.A', 'E4.A', 'D5.A', 'B3.A'),
    ...rule(termOf('type-4'), 'C1.A', 'A6.A', 'E2.A', 'E3.A'),
    ...rule(termOf('type-5'), 'A1.A', 'A4.B', 'D4.B', 'C2.B'),
    ...rule(termOf('type-6'), 'C4.B', 'B2.B', 'A2.B', 'E5.A'),
    ...rule(termOf('type-7'), 'A4.A', 'C4.A', 'E1.B', 'B1.B'),
    ...rule(termOf('type-8'), 'D5.A', 'C3.A', 'B2.A', 'E3.A'),
    ...rule(termOf('type-9'), 'D3.A', 'D6.A', 'E4.B', 'D5.B'),
];

const resultSchema = z.object({
    scores: z.array(z.object({
        dimension: z.enum(ENNEAGRAM_TYPES),
        score: z.number().int().min(0).max(100),
        level: z.null(),
    })).length(ENNEAGRAM_TYPES.length),
    /** The type that stands out most */
    primary: z.enum(ENNEAGRAM_TYPES),
    /** The next type, when it is too close to the first to say which is the one */
    tied: z.enum(ENNEAGRAM_TYPES).nullable(),
    /** The neighbour of the primary type, on either side, that scores higher */
    wing: z.enum(ENNEAGRAM_TYPES),
});

type EnneagramResult = z.infer<typeof resultSchema>;

const numberOf = (type: EnneagramType) => Number(type.slice('type-'.length));

const nameOf = (type: string) => ENNEAGRAM_TYPE_INFO.find((info) => info.id === type)?.name ?? type;

/** The two neighbours of a type on the circle of nine */
function neighbours(type: EnneagramType): [EnneagramType, EnneagramType] {
    const number = numberOf(type);
    const before = ENNEAGRAM_TYPES[(number + 7) % 9];
    const after = ENNEAGRAM_TYPES[number % 9];

    if (!before || !after) throw new Error(`No neighbours for ${type}`);

    return [before, after];
}

export const ENNEAGRAM_ASSESSMENT = defineScaleAssessment({
    id: 'enneagram',
    systemId: 'ENNEAGRAM',
    title: '九型人格',
    version: ENNEAGRAM_VERSION,
    allContentKeys: ENNEAGRAM_CONTENT_KEYS,
    resultSchema,
    contentKeys: (result) => [
        ...(result.tied ? [ENNEAGRAM_TIE_KEY] : []),
        contentKeyOf(result.primary),
        ...(result.tied ? [contentKeyOf(result.tied)] : []),
    ],
    traitMappings: ENNEAGRAM_MAPPINGS,
    basePrice: 1,
    items: ENNEAGRAM_ITEMS,
    dimensions: ENNEAGRAM_TYPE_INFO,
    score: (answers): EnneagramResult => {
        const scored = scoreDimensions(answers, ENNEAGRAM_ITEMS, false);
        const scores = ENNEAGRAM_TYPES.map((type) => {
            const entry = scored.find((candidate) => candidate.dimension === type);

            if (!entry) throw new Error(`No score for ${type}`);

            return {
                dimension: type, score: entry.score, level: null,
            };
        });
        const [first, second] = rankDimensions(scores);

        if (!first || !second) throw new Error('Not enough scores to rank');

        const primary = ENNEAGRAM_TYPES.find((type) => type === first.dimension);
        const next = ENNEAGRAM_TYPES.find((type) => type === second.dimension);

        if (!primary || !next) throw new Error('Unknown type ranked');

        const [before, after] = neighbours(primary);
        const scoreOf = (type: EnneagramType) => scores.find((entry) => entry.dimension === type)?.score ?? 0;

        return {
            scores,
            primary,
            tied: first.score - second.score < ENNEAGRAM_TIE_BELOW ? next : null,
            wing: scoreOf(after) > scoreOf(before) ? after : before,
        };
    },
    notes: (result) => [
        result.tied
            ? `最突出的是${nameOf(result.primary)}，但和${nameOf(result.tied)}的分數很接近，兩個都值得讀。`
            : `最突出的傾向是${nameOf(result.primary)}。`, `相鄰的兩型中，${nameOf(result.wing)}的分數較高，可以當作這個傾向的「側翼」一起參考。`,
    ],
    reportInput: (result, contents) => {
        const primaryBody = contents[contentKeyOf(result.primary)];
        const tiedBody = result.tied ? contents[contentKeyOf(result.tied)] : undefined;
        const lean = [result.primary, ...(result.tied ? [result.tied] : [])];
        const facts: ReportFact[] = [
            {
                label: '最突出的傾向', value: nameOf(result.primary), term: termOf(result.primary),
            },
            ...(result.tied ? [
                {
                    label: '分數接近的傾向', value: nameOf(result.tied), term: termOf(result.tied),
                },
            ] : []),
            {
                label: '側翼', value: nameOf(result.wing),
            },
        ];

        return {
            system: 'ENNEAGRAM',
            position: result.tied ? `${nameOf(result.primary)}與${nameOf(result.tied)}接近` : nameOf(result.primary),
            facts,
            interpretations: [primaryBody, tiedBody].flatMap((body, index) => (body
                ? [
                    {
                        title: body.title, text: body.summary, term: termOf(lean[index] ?? result.primary),
                    },
                ]
                : [])),
            traits: lean.map(termOf),
            advice: [primaryBody, tiedBody].flatMap((body) => (body && body.growthAdvice.trim() !== '' ? [body.growthAdvice] : [])),
            notes: ['九型人格的題目由本站自行設計，沒有經過信度與效度驗證，不是任何既有量表；結果只是傾向，不是把你歸成某一型。'],
            disclaimer: primaryBody?.disclaimer ?? '本內容為自我探索參考，不是心理評估或診斷。',
            basis: [buildAssessmentBasis('ENNEAGRAM', ENNEAGRAM_VERSION)],
        };
    },
});
