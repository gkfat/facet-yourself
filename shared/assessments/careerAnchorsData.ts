// Plain `.ts` import specifiers: this file is also run directly by Node
// (type stripping) from scripts/, where extensionless imports do not resolve.

export type CareerAnchorEntry = {
    id: string;
    name: string;
    /** What a high score leans toward, in a few words */
    short: string;
    /** The trait axis ends a high score points at */
    ends: readonly string[];
    /** Six statements, asked mixed across the anchors */
    statements: readonly string[];
};

/** The eight work motives, in the fixed order that also settles a tie */
export const CAREER_ANCHOR_ENTRIES: readonly CareerAnchorEntry[] = [
    {
        id: 'expertise',
        name: '專業深耕',
        short: '想把一項專業做到很深、被認可為行家',
        ends: ['A4.B', 'A5.A'],
        statements: [
            '我寧可把一件事鑽研到很精通，也不想什麼都懂一點。',
            '被同行認可為某個領域的行家，會讓我很有成就感。',
            '就算升遷機會出現，我也不想離開自己熟悉的專業。',
            '持續精進自己的專業技能，對我來說比換職稱更重要。',
            '我喜歡別人遇到專業問題時，第一個想到來問我。',
            '一份工作若讓我的專業越做越深，我會想留下來。',
        ],
    },
    {
        id: 'leadership',
        name: '帶領整合',
        short: '想帶領團隊、整合資源、為整體成果負責',
        ends: ['D5.A', 'B6.A'],
        statements: [
            '我希望有一天能帶領一個團隊或一個部門。',
            '把不同的人與資源整合起來達成目標，讓我很有成就感。',
            '我願意為整體的成果負起責任，即使這代表壓力更大。',
            '比起自己做出成品，我更喜歡讓大家一起把事情完成。',
            '我覺得有決定權與影響力，是工作中重要的一部分。',
            '我會期待自己的職涯逐步走向更大範圍的管理工作。',
        ],
    },
    {
        id: 'autonomy',
        name: '自主空間',
        short: '想照自己的方式與步調工作，少受拘束',
        ends: ['E3.A', 'A2.A'],
        statements: [
            '我希望能自己決定工作的方式與時間安排。',
            '太多規定或被盯著做事，會讓我失去動力。',
            '我寧可收入少一點，也想擁有工作的自主權。',
            '我習慣用自己的方法做事，不太喜歡照固定流程走。',
            '能自己掌握進度，比有人幫我安排好一切更讓我自在。',
            '在需要不斷請示與等待核准的環境裡，我會覺得很悶。',
        ],
    },
    {
        id: 'security',
        name: '穩定保障',
        short: '重視收入、職位與未來的可預期與安心',
        ends: ['E1.A', 'B2.B'],
        statements: [
            '工作穩定、收入可以預期，對我來說非常重要。',
            '我比較喜歡有明確制度與長期保障的組織。',
            '我會為了安心而選擇穩妥的選項，而不是高風險的機會。',
            '知道未來幾年大概會怎麼走，會讓我比較安心。',
            '良好的退休、保險與福利，會明顯影響我是否留下來。',
            '我不太願意為了一個不確定的機會放棄目前穩定的位置。',
        ],
    },
    {
        id: 'creativity',
        name: '創造開創',
        short: '想打造屬於自己的東西、開創新事物',
        ends: ['A3.A', 'B2.A'],
        statements: [
            '我很想從零開始，做出一個屬於自己的作品、產品或事業。',
            '看到自己的想法變成實際存在的東西，讓我很興奮。',
            '我願意承擔不確定，去嘗試一個還沒有人做過的方向。',
            '比起維護現成的東西，我更喜歡開創新的東西。',
            '我常想著：如果由我來做，會怎麼不一樣。',
            '能留下一件有自己印記的成果，對我很重要。',
        ],
    },
    {
        id: 'service',
        name: '服務貢獻',
        short: '想讓工作對別人或社會產生有意義的幫助',
        ends: ['D2.A', 'E2.A'],
        statements: [
            '我希望自己的工作能實際幫助到別人。',
            '工作背後的意義與價值，對我比頭銜或薪水更重要。',
            '看到因為我的付出而讓某個人變好，是我最大的回報。',
            '我願意選擇一份對社會有貢獻的工作，即使收入沒有那麼高。',
            '如果工作與我在乎的價值不一致，我會很難待得安心。',
            '我會想用自己的專長，去改善身邊的問題。',
        ],
    },
    {
        id: 'challenge',
        name: '挑戰突破',
        short: '喜歡解決困難的問題、不斷超越自己',
        ends: [
            'E4.A',
            'D3.B',
            'B4.A',
        ],
        statements: [
            '越困難的問題，越能讓我提起勁。',
            '如果工作太容易，我很快就會覺得無聊。',
            '我喜歡和強的對手或標準比較，從中把自己逼得更好。',
            '克服一個別人覺得不可能的挑戰，會讓我特別有成就感。',
            '我常主動替自己設定更高的目標。',
            '我會想換到一個能讓我更被考驗的位置。',
        ],
    },
    {
        id: 'balance',
        name: '生活平衡',
        short: '想讓工作、家庭與個人生活能夠兼顧',
        ends: ['D1.A', 'E4.B'],
        statements: [
            '工作不能佔掉我所有的生活，我需要足夠的個人時間。',
            '我會因為家人或重要的人，而調整自己的職涯選擇。',
            '我寧可少升遷一次，也想守住陪伴家人與休息的時間。',
            '好的工作應該讓我有餘力過自己的生活。',
            '如果工作讓我長期犧牲生活，我會想換一種方式。',
            '我希望工作節奏可以配合人生不同階段的需要。',
        ],
    },
];
