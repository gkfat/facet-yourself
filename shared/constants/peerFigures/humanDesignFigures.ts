/**
 * Well-known people whose birth time is from a birth certificate or birth record (rated AA in the Astro-Databank, checked
 * against it): the chart of each is worked out on the server, so the card can name those who share the member's type and
 * profile. People whose time is only from memory, or that sources disagree on, are left out.
 */
export type HumanDesignFigure = {
    name: string;
    nameEn: string;
    /** YYYY-MM-DD, as written in the place of birth */
    birthDate: string;
    /** HH:mm local time */
    birthTime: string;
    /** The city of birth, in Chinese */
    place: string;
    /** IANA time zone of the place at that time */
    timeZone: string;
    role: string;
};

/** name|English name|date|time|city|time zone|role */
const TABLE = `
瑪麗蓮·夢露|Marilyn Monroe|1926-06-01|09:30|洛杉磯|America/Los_Angeles|美國演員，好萊塢的文化象徵
艾維斯·普里斯萊|Elvis Presley|1935-01-08|04:35|蒂珀洛|America/Chicago|美國歌手，搖滾樂的代表人物
巴拉克·歐巴馬|Barack Obama|1961-08-04|19:24|檀香山|Pacific/Honolulu|美國第 44 任總統
史蒂夫·賈伯斯|Steve Jobs|1955-02-24|19:15|舊金山|America/Los_Angeles|美國企業家，蘋果公司共同創辦人
穆罕默德·阿里|Muhammad Ali|1942-01-17|18:35|路易維爾|America/Kentucky/Louisville|美國拳擊手，三度世界重量級冠軍
李小龍|Bruce Lee|1940-11-27|07:12|舊金山|America/Los_Angeles|美籍華裔武術家與電影演員
吉米·罕醉克斯|Jimi Hendrix|1942-11-27|10:15|西雅圖|America/Los_Angeles|美國電吉他手，搖滾樂的傳奇人物
王子|Prince|1958-06-07|18:17|明尼阿波利斯|America/Chicago|美國音樂人
馬龍·白蘭度|Marlon Brando|1924-04-03|23:00|奧馬哈|America/Chicago|美國演員，《教父》主角
麥可·喬丹|Michael Jordan|1963-02-17|13:40|布魯克林|America/New_York|美國籃球員，六度奪得 NBA 總冠軍
史蒂芬·史匹柏|Steven Spielberg|1946-12-18|18:16|辛辛那提|America/New_York|美國導演，《ET 外星人》作者
吉姆·莫里森|Jim Morrison|1943-12-08|11:55|墨爾本|America/New_York|美國搖滾樂團大門樂團主唱
伊莉莎白·泰勒|Elizabeth Taylor|1932-02-27|02:30|倫敦|Europe/London|英裔美籍演員
`;

export const HUMAN_DESIGN_FIGURES: readonly HumanDesignFigure[] = TABLE.trim().split('\n').map((line) => {
    const [
        name = '',
        nameEn = '',
        birthDate = '',
        birthTime = '',
        place = '',
        timeZone = '',
        role = '',
    ] = line.split('|').map((cell) => cell.trim());

    return {
        name, nameEn, birthDate, birthTime, place, timeZone, role,
    };
});
