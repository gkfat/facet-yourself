import { parseGroupTable } from './parse';

/**
 * People for each blood type, only those whose blood type is stated in a source that can be named: the person's own
 * book or official site, their agency, or a news report. Popular lists with no source are not used. The source of
 * each is the last cell, shown on the card. The lists are short: few blood types are on record.
 */
export const BLOOD_FIGURES = parseGroupTable(`
A|有吉弘行|Hiroiki Ariyoshi|1974|日本搞笑藝人與主持人|太田プロ官方網站
A|細川たかし|Takashi Hosokawa|1950|日本演歌歌手|本人官方網站
B|長嶋茂雄|Shigeo Nagashima|1936|日本職棒傳奇球員與教練|サンケイスポーツ報導（2023）
B|手塚治虫|Osamu Tezuka|1928|日本漫畫家，被稱為「漫畫之神」|《漫畫家・動畫作家人名辭典》
B|井上雄彦|Takehiko Inoue|1967|日本漫畫家，《灌籃高手》作者|日本媒體藝術祭訪談
B|矢澤永吉|Eikichi Yazawa|1949|日本搖滾歌手|本人官方網站
B|羽生結弦|Yuzuru Hanyu|1994|日本花式滑冰選手，奧運二連霸|ANA 集團官方介紹
B|明石家秋刀魚|Sanma Akashiya|1955|日本搞笑藝人與主持人|excite 人物辭典
AB|星野源|Gen Hoshino|1981|日本音樂人與演員|Walkerplus 報導
AB|井上陽水|Yosui Inoue|1948|日本創作歌手|本人著作《ラインダンス》（1982）
O|北野武|Takeshi Kitano|1947|日本導演、演員與搞笑藝人|產經新聞報導（2021）
O|小室哲哉|Tetsuya Komuro|1958|日本音樂製作人|本人著作《ETERNAL NETWORK》
O|吉田沙保里|Saori Yoshida|1982|日本女子摔角選手，奧運三連霸|本人官方網站
O|岡本太郎|Taro Okamoto|1911|日本藝術家，《太陽之塔》作者|新潮社《岡本太郎が、いる》
O|森田一義|Kazuyoshi Morita|1945|日本主持人，藝名 Tamori|ORICON 個人檔案
`, [
    'A',
    'B',
    'AB',
    'O',
] as const);
