import type { InsightRuleInput } from '../schema';

/**
 * Pairs of ends that a Zi Wei report meets in and that the pairs of `synthesis.ts` and `synthesisWide.ts` do not reach.
 * Found by laying out the charts of every month, hour, three days and the ten year stems and keeping the fewest pairs
 * that give every report with traits of two axes something to say; the pairs follow from what the stars in the life and
 * body palaces stand for (see `mappings/ziwei.ts`). Each says what comes of the pairing, tentatively. They are drafts for review.
 */
export const SYNTHESIS_ZIWEI_RULES: readonly InsightRuleInput[] = [
    {
        id: 'synthesis-b4a-c1a',
        type: 'interaction',
        when: { all: [{ end: 'B4.A' }, { end: 'C1.A' }] },
        requiresIndependentSources: false,
        template: '堅持不懈加上情緒細膩易感：你可能傾向對在乎的事長時間不放手，感受也特別深；事情卡住時，容易把情緒悶在心裡反覆咀嚼，比外表看起來更辛苦。',
        hypothesis: '最近一件你放不下的事，是事情本身讓你放不下，還是它牽動的感受？',
    },
    {
        id: 'synthesis-a1a-a5a',
        type: 'interaction',
        when: { all: [{ end: 'A1.A' }, { end: 'A5.A' }] },
        requiresIndependentSources: false,
        template: '分析邏輯加上重細節：你可能傾向把事情拆開來逐項檢查，依據與品質都不輕易放過；也容易在細節裡停留太久，遲遲沒有往下走。',
        hypothesis: '上一次你為了再確認一個細節，多花了多少時間？那段時間值得嗎？',
    },
    {
        id: 'synthesis-a3a-b2a',
        type: 'interaction',
        when: { all: [{ end: 'A3.A' }, { end: 'B2.A' }] },
        requiresIndependentSources: false,
        template: '創新突破加上開創冒險：你可能傾向敢嘗試別人沒做過的做法，也願意承擔風險先起步；點子與行動都快的時候，容易還沒收尾就轉向下一個。',
        hypothesis: '你手上有幾件已經開始、還沒收尾的事？',
    },
    {
        id: 'synthesis-c2a-d2a',
        type: 'interaction',
        when: { all: [{ end: 'C2.A' }, { end: 'D2.A' }] },
        requiresIndependentSources: false,
        template: '外放表達加上付出照顧：你可能傾向用熱情與言語照顧身邊的人，氣氛常因你而溫暖；也容易把自己的需要藏在熱鬧後面，累了也不一定說出口。',
        hypothesis: '上次你很累的時候，身邊的人知道嗎？',
    },
    {
        id: 'synthesis-a3b-b2b',
        type: 'interaction',
        when: { all: [{ end: 'A3.B' }, { end: 'B2.B' }] },
        requiresIndependentSources: false,
        template: '沿用經驗加上穩紮穩打：你可能傾向依靠驗證過的方法、確認安全再前進，成果穩定可靠；也容易錯過需要冒一點險才能得到的機會。',
        hypothesis: '最近有沒有一個你想嘗試、卻因為不確定而擱著的做法？',
    },
    {
        id: 'synthesis-a6a-c2a',
        type: 'interaction',
        when: { all: [{ end: 'A6.A' }, { end: 'C2.A' }] },
        requiresIndependentSources: false,
        template: '重美感形式加上外放表達：你可能傾向把想法用有風格、有氛圍的方式呈現給別人，容易帶動感染力；也可能因為在意呈現，把很多心力花在包裝上。',
        hypothesis: '你最近一次表達想法時，花在呈現方式的心力和花在內容的心力相比如何？',
    },
    {
        id: 'synthesis-b3a-d5b',
        type: 'interaction',
        when: { all: [{ end: 'B3.A' }, { end: 'D5.B' }] },
        requiresIndependentSources: false,
        template: '快速決斷加上配合支持：你可能傾向需要時很快做出決定，平常卻習慣配合他人的步調；有人帶頭時你輔助得俐落，沒人帶頭時才發現自己也能做主。',
        hypothesis: '最近有沒有一個場合，你其實已經有決定，卻等別人先開口？',
    },
    {
        id: 'synthesis-c3b-d5b',
        type: 'interaction',
        when: { all: [{ end: 'C3.B' }, { end: 'D5.B' }] },
        requiresIndependentSources: false,
        template: '委婉圓融加上配合支持：你可能傾向顧及對方的感受，用溫和的方式配合與支持；也容易把真正的想法放到最後，讓人不容易看見你的立場。',
        hypothesis: '上次你配合了別人，但心裡其實不太同意，是什麼讓你沒有說出口？',
    },
    {
        id: 'synthesis-a4a-d4a',
        type: 'interaction',
        when: { all: [{ end: 'A4.A' }, { end: 'D4.A' }] },
        requiresIndependentSources: false,
        template: '廣泛探索加上社交外向：你可能傾向在人群與不同領域之間穿梭，從交流中得到能量與點子；也容易接觸很多卻較少深入，關係與興趣都可能停在表面。',
        hypothesis: '最近新認識的人或新接觸的領域中，有幾個是你願意持續經營的？',
    },
];
