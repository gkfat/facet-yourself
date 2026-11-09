import type {
    ElementPhase, Polarity, StrengthLevel,
} from './bazi';

/** Traditional Chinese labels the BaZi screens print; the calculation modules never use them. */
export const BAZI_POSITION_LABELS = {
    year: '年柱',
    month: '月柱',
    day: '日柱',
    hour: '時柱',
} as const;

/**
 * What each pillar is traditionally read for, in a few words for the column head. A symbolic reading, not a prediction:
 * the year for the elders and the early years, the month for the parents and the years of growing up (the setting of
 * work too), the day for oneself and the closest people, the hour for the younger ones and the later years.
 */
export const BAZI_POSITION_ASPECTS = {
    year: '祖輩・早年',
    month: '父母・成長',
    day: '自己・親近的人',
    hour: '晚輩・晚年',
} as const;

export const BAZI_POSITION_ASPECTS_NOTE = '四柱傳統上各看一個面向：年柱看祖輩與早年、月柱看父母與成長的環境（也是工作的環境）、日柱看自己與最親近的人、時柱看晚輩與晚年。這是象徵性的說法，不是預測。';

export const BAZI_POLARITY_LABELS: Record<Polarity, string> = {
    YANG: '陽',
    YIN: '陰',
};

export const BAZI_HIDDEN_ROLE_LABELS = {
    MAIN: '本氣',
    MIDDLE: '中氣',
    RESIDUAL: '餘氣',
} as const;

export const BAZI_RELATION_LABELS = {
    STEM_COMBINE: '天干五合',
    BRANCH_COMBINE: '地支六合',
    BRANCH_CLASH: '地支六沖',
    BRANCH_TRIAD: '地支三合',
    BRANCH_HALF_TRIAD: '地支半合',
    BRANCH_MEETING: '地支三會',
    BRANCH_PUNISH: '地支相刑',
    BRANCH_SELF_PUNISH: '地支自刑',
    BRANCH_BREAK: '地支相破',
    BRANCH_HARM: '地支相害',
} as const;

/** What each relation between two pillars says, in a neutral tone: how the tradition reads it, not a verdict. */
export const BAZI_RELATION_NOTES = {
    STEM_COMBINE: '兩個天干彼此吸引、合在一起，傳統認為會讓兩邊的性質互相牽動。',
    BRANCH_COMBINE: '兩個地支互相配合，傳統視為彼此靠攏、容易結盟的關係。',
    BRANCH_CLASH: '兩個地支方向相對，傳統視為拉扯與變動，常用來看哪個領域比較容易起伏。',
    BRANCH_TRIAD: '三個地支聚在一起，傳統視為合成一個五行的力量，讓那種五行特別突出。',
    BRANCH_HALF_TRIAD: '只有三合中的兩個地支（含中間那個），是半合，力量比完整三合局弱，不等於完整三合。',
    BRANCH_MEETING: '同一個季節的三個地支齊聚，傳統視為那個季節的五行力量特別集中。',
    BRANCH_PUNISH: '兩個地支彼此摩擦，傳統視為彼此較容易有牽制、磨合的感受。',
    BRANCH_SELF_PUNISH: '同一個地支出現兩次，傳統稱自刑，視為較容易自己跟自己較勁。',
    BRANCH_BREAK: '兩個地支彼此削弱，傳統視為原本的結合或穩定較容易出現小裂縫。',
    BRANCH_HARM: '兩個地支彼此妨礙，傳統視為暗中有些消耗或不順手的地方。',
} as const;

export const BAZI_LUCK_DIRECTION_LABELS = {
    FORWARD: '順行',
    BACKWARD: '逆行',
} as const;

export const BAZI_STRENGTH_SIDE_LABELS = {
    STRONG: '偏強',
    WEAK: '偏弱',
    BALANCED: '平衡',
} as const;

/** What the five strength levels read as, in the "easier / harder direction" tone (no good or bad). */
export const BAZI_STRENGTH_NOTES: Record<StrengthLevel, string> = {
    taiwang: '日主得到的幫扶很多，自我的力量很明顯',
    strong: '日主得到的幫扶偏多，自己的主見與力量較突出',
    balanced: '幫扶與消耗大致平衡，各方向相對均衡',
    weak: '日主得到的幫扶偏少，較需要外在的支持與配合',
    taiwei: '日主得到的幫扶很少，外在的影響力相對明顯',
};

export const BAZI_PHASE_NOTES: Record<ElementPhase, string> = {
    旺: '當令',
    相: '月令所生',
    休: '生月令者',
    囚: '剋月令者',
    死: '月令所剋',
};

/** How to read a BaZi chart, in order, for a reader who has never seen one: each step is a part of the page below. */
export const BAZI_READING_STEPS = [
    {
        title: '第 1 步　四柱排盤：先找出「你自己」',
        text: '八字就是把出生的年、月、日、時，各翻成兩個字（上面的天干、下面的地支），四組共八個字，所以叫「八字」。它是曆法的記錄，不是抽籤。日柱上面的天干（框起來的那個）叫日主，代表「你自己」；其他的字，都是拿來看它們跟「你」是什麼關係。',
    },
    {
        title: '第 2 步　五行：甲乙是木、丙丁是火、戊己是土、庚辛是金、壬癸是水',
        text: '五行是八個字裡各種性質的比例，不是好壞。哪一種偏多、哪一種沒有，描述的是你的性格傾向與習慣的用力方式。',
    },
    {
        title: '第 3 步　十神：其他字跟你的關係',
        text: '十神把其他字分成五類：比劫（同伴與自我）、食傷（表達與創造）、財（資源與現實）、官殺（規範與責任）、印（學習與支持）。哪一類偏多，就代表你比較常用那一類的方式面對事情。',
    },
    {
        title: '第 4 步　強弱與喜用神：怎麼用力比較順手',
        text: '強弱是日主得到多少幫助，不是運氣好壞。喜用神是「相對順手」的方向，忌神是「相對吃力」的方向，用來參考怎麼安排生活與選擇，不是判定吉凶。',
    },
] as const;

/** What each group of readings of the report reads, under its heading: which card of the chart it is about. */
export const BAZI_READING_GROUP_NOTES: Record<string, string> = {
    五行與十神歸納: '解讀上面「第 2 步 五行」與「第 3 步 十神」兩張圖卡。',
    強弱與格局歸納: '解讀「第 4 步 強弱與喜用神」圖卡，以及出生月份決定的格局。',
    月令與稱骨歸納: '月令是出生月份的季節；稱骨是另一套民間算法，與八字的分析無關。',
    季節氣候歸納: '解讀「季節氣候」圖卡，屬於簡化調候模型。',
    人生面向歸納: '依你十神偏多的類別，傳統對各個生活面向的說法。',
};

/** One plain sentence for each fact the BaZi report lists, by the label of the fact. */
export const BAZI_FACT_GUIDE: Record<string, string> = {
    四柱: '年、月、日、時四組，每組上面是天干、下面是地支，合起來就是你的八字。',
    生肖: '由出生的「年」決定，十二年一輪。八字的年以立春換年，所以立春前出生的人，生肖會是前一年的那個。',
    日主: '日柱的天干，代表「你自己」。後面所有說明，都是以它為中心來看。',
    五行分布: '八個字裡木、火、土、金、水各有幾個，數字大代表那種特質出現得多。',
    五行偏旺: '某一種五行明顯比其他多，代表那種特質在你身上特別明顯。',
    五行缺少: '八個字裡沒有出現的五行，不代表你沒有那種能力，只是它比較不會自然地出現，需要多留意。',
    十神偏多: '其他字跟日主的關係中，最常出現的那一類，是你習慣用的處事方式。',
    日主強弱: '日主在命盤中得到多少幫助（同類與生助它的字），偏強偏弱都不是好壞，只是用力的方式不同。',
    命格: '由出生月份的主氣決定，是你命盤的基本格局，影響後面喜用神怎麼查。',
    喜用神: '「較順手的方向」與「較吃力的方向」，用十神的類別表示，可以當成安排生活的參考。',
    月令與節氣: '出生的月份與節氣，是八字中影響力最大的位置，代表你出生時的季節氣候。',
    稱骨: '另一套民間算法，用生年、月、日、時的重量加起來，只是趣味參考，與八字的分析無關。',
};

/** The labels of the seasonal-climate card (季節氣候分析, a simplified model of 調候). */
export const BAZI_CLIMATE_LABELS = {
    temperature: {
        cold: '寒', cool: '涼', mild: '溫', hot: '熱',
    },
    humidity: {
        moist: '濕', neutral: '平', dry: '燥',
    },
    bias: {
        cold: '偏寒', hot: '偏熱', dry: '偏燥', none: '無偏向',
    },
    status: {
        cold: '偏寒', hot: '偏熱', dry: '偏燥', balanced: '相對平衡',
    },
    level: {
        none: '沒有', weak: '弱', moderate: '中', strong: '強', excessive: '過旺',
    },
    regulation: {
        insufficient: '不足', moderate: '適中', excessive: '過旺',
    },
    need: {
        warming: '暖局', cooling: '降溫', moistening: '潤燥',
    },
    influence: {
        COMBINED: '受合', CLASHED: '受沖',
    },
} as const;

export const BAZI_CLIMATE_NOTE = '這是簡化調候模型：思想來源是《窮通寶鑑》的調候，但不是它逐月逐日主的完整取用結果；火、水的力量指標與分級是本站自訂的量化標準，不是傳統的判定門檻，也不是火、水各佔八字的百分比。不同流派可能得到不同結果。';

/** The rules the page prints so a reader can compare with other charts. */
export const BAZI_RULE_NOTES = [
    '年柱以立春換年，不是農曆正月初一，也不是 1 月 1 日。',
    '月柱以十二個「節」（立春、驚蟄、清明、立夏、芒種、小暑、立秋、白露、寒露、立冬、大雪、小寒）換月，節氣時刻由太陽黃經計算。',
    '日柱以出生地當地時間 00:00 換日；23:00 到 24:00 的晚子時，日柱不換，時柱的天干依隔天的日干推算。',
    '採用出生地的標準時間（含當年的夏令時間調整），不換算真太陽時；沒有填出生城市時以台北（UTC+8）計算。',
    '日主強弱依各位置的權重計算幫扶分（月令佔最多）；喜用神看五行力量（天干每個 5、地支每個 8 依藏干分配、月令加倍，共 60）：身強取消耗的一邊、身弱取幫扶的一邊，其中力量低於平均的是用神與喜神，另一邊高於平均的是忌神，以十神類別表示。命宮用月將加時（月將在中氣換），與以節氣換月的算法不同。',
    '稱骨使用農曆生年（正月初一換年）、農曆月日與時辰；與八字年柱換年的依據不同，所以立春後、春節前出生者兩者的「年」可能不同。',
] as const;

export const BAZI_DISCLAIMER = '八字命盤的計算是依固定規則得出的文化與曆法資訊，解讀僅供娛樂與自我探索，不預測吉凶、婚姻、健康、壽命或財運，也不能取代醫療、法律或財務的專業建議。不同流派的算法與判定標準可能不同，結果也可能因此不同。';
