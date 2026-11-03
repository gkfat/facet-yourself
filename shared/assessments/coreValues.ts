// Plain `.ts` import specifiers: this file is also run directly by Node
// (type stripping) from scripts/, where extensionless imports do not resolve.
import { z } from 'zod';
import { keywordRule } from '../ontology/mappings/keywordRule.ts';
import type { ReportFact } from '../report/types.ts';
import { buildAssessmentBasis } from '../utils/assessmentBasis.ts';
import { CORE_VALUE_ENTRIES } from './coreValuesData.ts';
import { defineSelectionAssessment } from './types.ts';

/** Carries `ref`: the list of values is our own, not validated and not any existing instrument */
export const CORE_VALUES_VERSION = 'core-values-ref-v1';

/** How many values are picked, and how many of those are put in order */
export const CORE_VALUES_PICK = 10;
export const CORE_VALUES_RANK = 5;

export const CORE_VALUE_OPTIONS = CORE_VALUE_ENTRIES.map(({
    id, name, description,
}) => ({
    id, name, description,
}));

const contentKeyOf = (id: string) => `core-values_${id}`;

const termOf = (id: string) => `values:${id}`;

export const CORE_VALUE_TERMS: readonly string[] = CORE_VALUE_ENTRIES.map((entry) => termOf(entry.id));

const rule = keywordRule('CORE_VALUES');

const CORE_VALUE_MAPPINGS = CORE_VALUE_ENTRIES.flatMap((entry) => rule(termOf(entry.id), ...entry.ends));

const ids = CORE_VALUE_ENTRIES.map((entry) => entry.id);

const resultSchema = z.object({
    /** Everything that was picked */
    selected: z.array(z.string().refine((id) => ids.includes(id))).length(CORE_VALUES_PICK),
    /** The most important of them, in order */
    top: z.array(z.string().refine((id) => ids.includes(id))).length(CORE_VALUES_RANK),
});

const nameOf = (id: string) => CORE_VALUE_ENTRIES.find((entry) => entry.id === id)?.name ?? id;

/** The areas of life the values are sorted into: every value is in one of them */
const GROUPS = {
    autonomy: {
        label: '自主與真實', portrait: '你傾向自己決定人生的方向，重視真實與不被控制，願意為自己的選擇承擔',
        ids: [
            'freedom',
            'independence',
            'authenticity',
            'courage',
            'adventure',
        ],
    },
    stability: {
        label: '安定與秩序', portrait: '你重視生活的穩固與條理，想先把根基打好，也懂得替身心留下喘息的空間',
        ids: [
            'security',
            'stability',
            'order',
            'peace',
            'simplicity',
            'health',
            'balance',
        ],
    },
    achievement: {
        label: '成就與成長', portrait: '你想讓自己變得更好，也在意做出成果、被看見，會主動學習、挑戰與帶動事情',
        ids: [
            'achievement',
            'growth',
            'learning',
            'excellence',
            'curiosity',
            'wealth',
            'recognition',
            'influence',
            'leadership',
            'creativity',
        ],
    },
    relation: {
        label: '關係與歸屬', portrait: '你把重要的人與所屬的群體放在心上，重視承諾、尊重與一起前進',
        ids: [
            'relationships',
            'family',
            'community',
            'loyalty',
            'collaboration',
            'respect',
            'tradition',
        ],
    },
    meaning: {
        label: '意義與貢獻', portrait: '你想讓自己的言行合乎心中的準則，在意公平、善意與對別人和世界的價值',
        ids: [
            'honesty',
            'justice',
            'kindness',
            'compassion',
            'contribution',
            'responsibility',
            'spirituality',
        ],
    },
    joy: {
        label: '感受與生活', portrait: '你珍惜美、笑聲、自然與開心的時刻，知道生活不只有該做的事',
        ids: [
            'beauty',
            'humor',
            'nature',
            'fun',
        ],
    },
} as const;

/** Pairs that often pull in different directions: neither is the right one */
const PULLS: readonly (readonly [string, string])[] = [
    ['freedom', 'security'],
    ['freedom', 'stability'],
    ['freedom', 'responsibility'],
    ['adventure', 'security'],
    ['achievement', 'balance'],
    ['achievement', 'peace'],
    ['excellence', 'balance'],
    ['independence', 'relationships'],
    ['independence', 'community'],
    ['creativity', 'order'],
    ['honesty', 'kindness'],
    ['wealth', 'simplicity'],
    ['influence', 'respect'],
    ['growth', 'stability'],
    ['tradition', 'creativity'],
];

const groupOf = (id: string) => Object.values(GROUPS).find((group) => (group.ids as readonly string[]).includes(id));

/** What the ten picks and the order of the first five say together, by rule: the areas they gather in, and the pulls between them */
function synthesisOf(result: { selected: string[]; top: string[] }) {
    // A value in the first five counts double: what is put first leads
    const weight = new Map<string, number>();

    for (const id of result.selected) {
        const group = groupOf(id);

        if (group) weight.set(group.label, (weight.get(group.label) ?? 0) + (result.top.includes(id) ? 2 : 1));
    }

    const leading = [...weight.entries()].sort((first, second) => second[1] - first[1]).slice(0, 2);
    const groups = leading.map(([label]) => Object.values(GROUPS).find((group) => group.label === label)).filter((group) => group !== undefined);
    const first = result.top[0];
    const portrait = [
        `你選出的 10 項價值，最集中在「${groups.map((group) => group.label).join('」與「')}」。`,
        ...(groups.length > 0 ? [`這樣的組合，描繪出一個這樣的人：${groups.map((group) => group.portrait).join('；同時')}。`] : []),
        ...(first ? [`你把「${nameOf(first)}」排在第一位，它很可能是你在難以取捨時，最後會回頭看的那一項。`] : []),
    ];
    const tensions = PULLS
        .filter(([one, other]) => result.selected.includes(one) && result.selected.includes(other) && (result.top.includes(one) || result.top.includes(other)))
        .map(([one, other]) => `「${nameOf(one)}」與「${nameOf(other)}」：兩者常往不同的方向拉你。遇到取捨時，可以先問自己，此刻哪一個更需要被照顧，而不是哪一個比較對。`);

    return {
        portrait, tensions,
    };
}

export const CORE_VALUES_ASSESSMENT = defineSelectionAssessment({
    id: 'core-values',
    systemId: 'CORE_VALUES',
    title: '核心價值觀',
    version: CORE_VALUES_VERSION,
    allContentKeys: ids.map(contentKeyOf),
    resultSchema,
    contentKeys: (result) => [...result.top, ...result.selected.filter((id) => !result.top.includes(id))].map(contentKeyOf),
    traitMappings: CORE_VALUE_MAPPINGS,
    basePrice: 1,
    options: CORE_VALUE_OPTIONS,
    pick: CORE_VALUES_PICK,
    rank: CORE_VALUES_RANK,
    score: (answer) => ({
        selected: [...answer.selected], top: [...answer.ranked],
    }),
    synthesis: (result) => synthesisOf(result),
    reportInput: (result, contents) => {
        const others = result.selected.filter((id) => !result.top.includes(id));
        const bodies = result.top.flatMap((id) => {
            const body = contents[contentKeyOf(id)];

            return body ? [
                {
                    id, body,
                },
            ] : [];
        });
        const facts: ReportFact[] = [
            ...result.top.map((id, index) => ({
                label: `第 ${index + 1} 重要的價值`, value: nameOf(id), term: termOf(id),
            })), ...(others.length > 0 ? [
                {
                    label: '同樣選出的價值', value: others.map(nameOf).join('、'), terms: others.map((id) => ({
                        term: termOf(id), value: nameOf(id),
                    })),
                },
            ] : []),
        ];

        return {
            system: 'CORE_VALUES',
            position: result.top.map(nameOf).join('、'),
            facts,
            interpretations: bodies.map(({
                id, body,
            }) => ({
                title: body.title, text: body.summary, term: termOf(id),
            })),
            traits: result.selected.map(termOf),
            advice: bodies.map(({ body }) => body.growthAdvice).filter((text) => text.trim() !== ''),
            notes: ['核心價值觀的清單由本站自行設計，沒有經過信度與效度驗證，不是任何既有量表；價值沒有好壞高下。'],
            disclaimer: bodies[0]?.body.disclaimer ?? '本內容為自我探索參考，不是心理評估或診斷。',
            basis: [buildAssessmentBasis('CORE_VALUES', CORE_VALUES_VERSION)],
        };
    },
});
