// Plain `.ts` import specifiers: this file is also run directly by Node
// (type stripping) from scripts/, where extensionless imports do not resolve.

/** The 24 strengths, each with two statements and the ends of the trait axes it stands for; none is better than another */
export const VIA_ENTRIES = [
    {
        id: 'creativity', name: '創造力', short: '想出新穎又有用的做法', statements: ['我常想出和別人不一樣的點子。', '遇到問題時，我喜歡試試沒人用過的做法。'], ends: ['A3.A', 'A6.A'],
    },
    {
        id: 'curiosity', name: '好奇心', short: '對新事物保持興趣，想探索', statements: ['我對許多不同的事都感到好奇，想了解更多。', '遇到不懂的事，我會主動去問或去查。'], ends: ['A4.A'],
    },
    {
        id: 'judgment', name: '判斷力', short: '仔細思考、從各角度衡量', statements: ['做決定前，我會從不同的角度想過再下結論。', '我願意在新的證據出現時，修正自己原本的想法。'], ends: ['A1.A', 'A2.A'],
    },
    {
        id: 'love-of-learning', name: '熱愛學習', short: '喜歡學新東西、精進自己', statements: ['我很享受學習新知識或新技能的過程。', '就算沒有人要求，我也會主動去學自己有興趣的東西。'], ends: ['E4.A'],
    },
    {
        id: 'perspective', name: '洞察力', short: '看見全局，給人有智慧的建議', statements: ['別人常來找我，聽聽我對事情的看法。', '我能看到事情的大方向，不容易被細枝末節困住。'], ends: ['A5.B'],
    },
    {
        id: 'bravery', name: '勇敢', short: '面對恐懼仍然行動', statements: ['即使感到害怕，我也會為了重要的事開口或行動。', '我願意為自己相信的事站出來，即使別人不同意。'], ends: ['B2.A'],
    },
    {
        id: 'perseverance', name: '毅力', short: '有始有終，遇到困難也堅持', statements: ['我開始做的事，通常會做到完成。', '就算遇到阻礙，我也不會輕易放棄。'], ends: ['B4.A'],
    },
    {
        id: 'honesty', name: '正直', short: '真誠、言行一致', statements: ['我會說真話，即使這樣說可能不太受歡迎。', '我說的話和我做的事通常是一致的。'], ends: ['C3.A'],
    },
    {
        id: 'zest', name: '活力', short: '對生活充滿熱情與精力', statements: ['我做事時通常充滿精力與熱情。', '我常能把身邊的人也感染得有精神。'], ends: ['C4.A'],
    },
    {
        id: 'love', name: '愛', short: '重視並維持親密的關係', statements: ['我很重視與親近的人之間的情感連結。', '我能自在地付出關心，也接受別人的關愛。'], ends: ['D1.A'],
    },
    {
        id: 'kindness', name: '善良', short: '樂於幫助別人、對人體貼', statements: ['我常主動幫助別人，不需要誰要求。', '看到別人有困難，我會想為他做點什麼。'], ends: ['D2.A'],
    },
    {
        id: 'social-intelligence', name: '社交智慧', short: '理解自己與他人的感受', statements: ['我能察覺別人的情緒，也懂得怎樣讓他們覺得自在。', '我知道在不同的場合，該用什麼方式相處與說話。'], ends: ['C3.B'],
    },
    {
        id: 'teamwork', name: '團隊合作', short: '願意為團體付出，與人共事', statements: ['我願意為團隊的目標付出，即使不是自己的功勞。', '我很重視自己在團體中的責任與角色。'], ends: ['D3.A'],
    },
    {
        id: 'fairness', name: '公平', short: '對每個人一視同仁', statements: ['我會努力讓每個人都得到公平的對待。', '我做決定時，不會因為個人喜好而偏心。'], ends: ['D1.B'],
    },
    {
        id: 'leadership', name: '領導力', short: '帶領大家朝共同目標前進', statements: ['我能讓一群人朝同一個目標前進。', '我願意負責組織與帶領團體。'], ends: ['D5.A'],
    },
    {
        id: 'forgiveness', name: '寬恕', short: '原諒別人，給人再一次的機會', statements: ['別人犯了錯之後，我通常願意給他再一次機會。', '我不太會記恨，也能放下過去的不愉快。'], ends: ['D6.A'],
    },
    {
        id: 'humility', name: '謙遜', short: '不誇耀，讓成績自己說話', statements: ['我不需要別人注意，就能對自己的成就感到滿意。', '我願意承認自己的不足，也學習別人的長處。'], ends: ['D5.B'],
    },
    {
        id: 'prudence', name: '審慎', short: '謹慎選擇，三思而後行', statements: ['我做重要的決定前，會先想清楚可能的後果。', '我不太會因為一時衝動而說出或做出讓自己後悔的事。'], ends: ['B3.B'],
    },
    {
        id: 'self-regulation', name: '自我調節', short: '管理自己的情緒與行為', statements: ['我能控制自己的情緒，不讓它主導我的行動。', '我能為了長遠的目標，婉拒眼前的誘惑。'], ends: ['B1.A'],
    },
    {
        id: 'appreciation-of-beauty', name: '欣賞美好', short: '注意並讚嘆美與卓越', statements: ['我常被美麗的事物、自然或精湛的技藝所感動。', '我會特別留意生活中被忽略的美好細節。'], ends: ['A6.A'],
    },
    {
        id: 'gratitude', name: '感恩', short: '覺察並珍惜好事', statements: ['我常想到自己擁有的好事，也會表達感謝。', '別人幫了我，我會讓對方知道我很感激。'], ends: ['C4.A'],
    },
    {
        id: 'hope', name: '希望', short: '期待好的未來，並為此努力', statements: ['即使遇到挫折，我仍然相信事情會好轉。', '我會替未來設定目標，並想辦法達成。'], ends: ['C4.A'],
    },
    {
        id: 'humor', name: '幽默', short: '帶來笑聲，看到事情有趣的一面', statements: ['我喜歡逗別人笑，也能在困難中找到有趣的地方。', '我能用輕鬆的方式化解尷尬或緊張的氣氛。'], ends: ['C2.A'],
    },
    {
        id: 'spirituality', name: '信念與靈性', short: '相信比自己更大的意義', statements: ['我相信生命有更大的意義或目的。', '我的信念會指引我如何做選擇與面對困難。'], ends: ['E2.A'],
    },
] as const;
