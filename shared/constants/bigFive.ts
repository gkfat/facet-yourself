/**
 * The Big Five test: the 50 items of the IPIP (Goldberg's markers, public domain), in a Traditional Chinese translation of
 * our own. Five traits, 10 items each, answered on a 5-point scale of agreement. Fixed, versioned text: the questions
 * and the way they are scored are rules, never produced by AI.
 */
export const BIG_FIVE_VERSION = 'ipip50-zh-v1';

export const BIG_FIVE_TRAITS = [
    'openness',
    'conscientiousness',
    'extraversion',
    'agreeableness',
    'neuroticism',
] as const;

export type BigFiveTrait = typeof BIG_FIVE_TRAITS[number];

/** What each trait is called, and what a high score on it leans toward (never a judgement of better or worse) */
export const BIG_FIVE_TRAIT_INFO: Readonly<Record<BigFiveTrait, { name: string; high: string; low: string }>> = {
    openness: {
        name: '開放性', high: '好奇、愛想像、喜歡新點子', low: '務實、重視熟悉與具體的事物',
    },
    conscientiousness: {
        name: '盡責性', high: '有條理、做事有計畫、自律', low: '隨性、彈性、不受計畫綁住',
    },
    extraversion: {
        name: '外向性', high: '從與人互動中獲得能量、主動', low: '偏向安靜，從獨處中恢復能量',
    },
    agreeableness: {
        name: '親和性', high: '體貼、願意合作、顧及他人感受', low: '直接、重視自己的立場與界線',
    },
    neuroticism: {
        name: '情緒敏感性', high: '對壓力的反應較明顯、情緒起伏較大', low: '對壓力的反應較平穩、情緒較穩定',
    },
};

/** The answers, 1 to 5 */
export const BIG_FIVE_OPTIONS = [
    {
        value: 1, label: '非常不同意',
    },
    {
        value: 2, label: '不同意',
    },
    {
        value: 3, label: '普通',
    },
    {
        value: 4, label: '同意',
    },
    {
        value: 5, label: '非常同意',
    },
] as const;

export type BigFiveQuestion = {
    /** `bf01` to `bf50`, in the order they are asked */
    id: string;
    trait: BigFiveTrait;
    text: string;
    /** A reversed item counts for the opposite end of its trait: its answer is turned over before scoring */
    reversed: boolean;
};

/** Below this score a trait is low; from it up to HIGH_MIN_EXCLUSIVE, middle; above it, high */
export const BIG_FIVE_LOW_BELOW = 40;
export const BIG_FIVE_HIGH_ABOVE = 60;

export const BIG_FIVE_LEVELS = [
    'low',
    'mid',
    'high',
] as const;

export type BigFiveLevel = typeof BIG_FIVE_LEVELS[number];

/** The items of each trait: those that point the way of the trait first, then the reversed ones. */
const ITEMS: Readonly<Record<BigFiveTrait, { straight: readonly string[]; reversed: readonly string[] }>> = {
    extraversion: {
        straight: [
            '我是聚會中帶動氣氛的人',
            '我在人群中感到自在',
            '我會主動開啟話題',
            '我在聚會中會和很多不同的人交談',
            '我不介意成為眾人的焦點',
        ],
        reversed: [
            '我話不多',
            '我習慣待在不起眼的地方',
            '我沒什麼話想說',
            '我不喜歡引起別人的注意',
            '我在陌生人面前會很安靜',
        ],
    },
    agreeableness: {
        straight: [
            '我對別人感興趣',
            '我能體會他人的感受',
            '我心腸很軟',
            '我會花時間幫助別人',
            '我能感受到他人的情緒',
            '我會讓別人感到自在',
        ],
        reversed: [
            '我很少關心別人',
            '我說話有時會冒犯別人',
            '我對別人的煩惱不感興趣',
            '我對別人沒什麼興趣',
        ],
    },
    conscientiousness: {
        straight: [
            '我總是事先做好準備',
            '我會留意細節',
            '我會馬上把家務做好',
            '我喜歡井然有序',
            '我會照著時間表行事',
            '我對工作的要求很嚴謹',
        ],
        reversed: [
            '我會把東西隨手亂放',
            '我會把事情弄得一團亂',
            '我常忘記把東西放回原位',
            '我會逃避自己的責任',
        ],
    },
    neuroticism: {
        straight: [
            '我很容易感到壓力大',
            '我會為許多事情擔心',
            '我很容易被打擾',
            '我很容易心煩',
            '我的心情變化很大',
            '我的情緒常常起伏不定',
            '我很容易被激怒',
            '我常感到心情低落',
        ],
        reversed: ['我大部分時間都很放鬆', '我很少感到沮喪'],
    },
    openness: {
        straight: [
            '我的詞彙很豐富',
            '我有生動的想像力',
            '我有很棒的點子',
            '我很快就能理解事物',
            '我會使用艱深的詞彙',
            '我會花時間反思事情',
            '我腦中充滿各種想法',
        ],
        reversed: [
            '我不容易理解抽象的概念',
            '我對抽象的概念沒有興趣',
            '我沒有很好的想像力',
        ],
    },
};

/** The order the questions are asked in: the five traits take turns, so no page is about one trait only */
const ASKING_ORDER = [
    'extraversion',
    'agreeableness',
    'conscientiousness',
    'neuroticism',
    'openness',
] as const;

/** The items of a trait with the reversed ones spread among the others, so a page is not made of one kind only */
function mixed(trait: BigFiveTrait): Array<Omit<BigFiveQuestion, 'id'>> {
    const {
        straight, reversed, 
    } = ITEMS[trait];
    const items: Array<Omit<BigFiveQuestion, 'id'>> = [];
    const length = Math.max(straight.length, reversed.length);

    for (let index = 0; index < length; index += 1) {
        const first = straight[index];
        const second = reversed[index];

        if (first) items.push({
            trait, text: first, reversed: false,
        });

        if (second) items.push({
            trait, text: second, reversed: true,
        });
    }

    return items;
}

export const BIG_FIVE_QUESTIONS: readonly BigFiveQuestion[] = (() => {
    const perTrait = ASKING_ORDER.map(mixed);

    // Round r takes the r-th item of each trait, so the five traits take turns
    return Array.from({ length: 10 }, (_, round) => perTrait.flatMap((items) => (items[round] ? [items[round]] : []))).flat().map((item, index) => ({
        ...item, id: `bf${String(index + 1).padStart(2, '0')}`,
    }));
})();

/**
 * The pairs of traits whose combination is told in the report: those that say something together (a trait to hold the other
 * back or to push it on). Only a pair of which neither trait is in the middle has anything to say.
 */
export const BIG_FIVE_COMBINATIONS = [
    ['openness', 'conscientiousness'],
    ['openness', 'extraversion'],
    ['extraversion', 'agreeableness'],
    ['conscientiousness', 'neuroticism'],
    ['agreeableness', 'neuroticism'],
    ['extraversion', 'neuroticism'],
] as const satisfies ReadonlyArray<readonly [BigFiveTrait, BigFiveTrait]>;

/**
 * Whether the entrances to the test (the home page, the page of the reports) are shown. Off until the contents are
 * published and a whole test has been taken; the pages themselves work without it.
 */
export const BIG_FIVE_ENTRY_ENABLED = true;

/** How many questions are on a page of the test */
export const BIG_FIVE_PAGE_SIZE = 5;
