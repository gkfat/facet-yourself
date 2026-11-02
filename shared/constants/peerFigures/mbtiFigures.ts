import { MBTI_TYPES } from '../../schemas/common';
import { parseGroupTable } from './parse';

/**
 * Well-known people for each MBTI type. None of them took our test: the types are what popular profiles of them
 * suggest, so the card says they are guesses from public information.
 */
export const MBTI_FIGURES = parseGroupTable(`
INTJ|弗里德里希·尼采|Friedrich Nietzsche|1844|德國哲學家
INTJ|艾薩克·牛頓|Isaac Newton|1643|英國物理學家與數學家
INTJ|伊隆·馬斯克|Elon Musk|1971|美國企業家，特斯拉與 SpaceX 的領導者
INTJ|史蒂芬·霍金|Stephen Hawking|1942|英國理論物理學家
INTJ|艾茵·蘭德|Ayn Rand|1905|俄裔美國作家，《源泉》作者
INTJ|馬克·祖克柏|Mark Zuckerberg|1984|美國企業家，臉書的共同創辦人
INTJ|克里斯多福·諾蘭|Christopher Nolan|1970|英國導演，《全面啟動》作者
INTJ|尼古拉·特斯拉|Nikola Tesla|1856|塞爾維亞裔發明家
INTP|阿爾伯特·愛因斯坦|Albert Einstein|1879|德裔物理學家，提出相對論
INTP|查爾斯·達爾文|Charles Darwin|1809|英國博物學家，提出演化論
INTP|伊曼努爾·康德|Immanuel Kant|1724|德國哲學家
INTP|比爾·蓋茲|Bill Gates|1955|美國企業家，微軟共同創辦人
INTP|勒內·笛卡兒|René Descartes|1596|法國哲學家與數學家
INTP|瑪麗·居禮|Marie Curie|1867|波蘭裔法國物理學家與化學家
INTP|賴瑞·佩吉|Larry Page|1973|美國企業家，Google 的共同創辦人
INTP|林納斯·托瓦茲|Linus Torvalds|1969|芬蘭裔美國工程師，Linux 的創造者
ENTJ|史蒂夫·賈伯斯|Steve Jobs|1955|美國企業家，蘋果公司共同創辦人
ENTJ|拿破崙·波拿巴|Napoleon Bonaparte|1769|法蘭西第一帝國皇帝
ENTJ|瑪格麗特·柴契爾|Margaret Thatcher|1925|英國首相，首位女首相
ENTJ|溫斯頓·邱吉爾|Winston Churchill|1874|英國首相，諾貝爾文學獎得主
ENTJ|富蘭克林·D·羅斯福|Franklin D. Roosevelt|1882|美國第 32 任總統
ENTJ|戈登·拉姆齊|Gordon Ramsay|1966|英國廚師與電視名人
ENTJ|傑夫·貝佐斯|Jeff Bezos|1964|美國企業家，亞馬遜的創辦人
ENTJ|夏爾·戴高樂|Charles de Gaulle|1890|法國將軍與總統
ENTP|湯瑪斯·愛迪生|Thomas Edison|1847|美國發明家
ENTP|馬克·吐溫|Mark Twain|1835|美國作家，《湯姆歷險記》作者
ENTP|班傑明·富蘭克林|Benjamin Franklin|1706|美國開國元勳，科學家與發明家
ENTP|小勞勃·道尼|Robert Downey Jr.|1965|美國演員，《鋼鐵人》主演
ENTP|伏爾泰|Voltaire|1694|法國啟蒙思想家
ENTP|理查·費曼|Richard Feynman|1918|美國物理學家，諾貝爾獎得主
ENTP|蕭伯納|George Bernard Shaw|1856|愛爾蘭劇作家，諾貝爾文學獎得主
ENTP|柯南·歐布萊恩|Conan O'Brien|1963|美國脫口秀主持人
INFJ|馬丁·路德·金恩|Martin Luther King Jr.|1929|美國民權運動領袖
INFJ|甘地|Mahatma Gandhi|1869|印度獨立運動領袖
INFJ|納爾遜·曼德拉|Nelson Mandela|1918|南非第一位黑人總統
INFJ|卡爾·榮格|Carl Jung|1875|瑞士心理學家，分析心理學的創始人
INFJ|費奧多爾·杜斯妥也夫斯基|Fyodor Dostoevsky|1821|俄國作家，《罪與罰》作者
INFJ|女神卡卡|Lady Gaga|1986|美國流行歌手
INFJ|妮可·基嫚|Nicole Kidman|1967|澳洲演員，奧斯卡最佳女主角得主
INFJ|愛蓮娜·羅斯福|Eleanor Roosevelt|1884|美國第一夫人，《世界人權宣言》的起草者
INFP|威廉·莎士比亞|William Shakespeare|1564|英國劇作家與詩人
INFP|J·R·R·托爾金|J. R. R. Tolkien|1892|英國作家，《魔戒》作者
INFP|文森·梵谷|Vincent van Gogh|1853|荷蘭後印象派畫家
INFP|黛安娜王妃|Diana, Princess of Wales|1961|英國王妃，投入慈善與人道工作
INFP|寇特·柯本|Kurt Cobain|1967|美國搖滾樂團超脫樂團主唱
INFP|奧黛麗·赫本|Audrey Hepburn|1929|英國演員，也是聯合國親善大使
INFP|維吉尼亞·吳爾芙|Virginia Woolf|1882|英國作家，意識流小說的代表
INFP|約翰·藍儂|John Lennon|1940|英國音樂人，披頭四成員
ENFJ|巴拉克·歐巴馬|Barack Obama|1961|美國第 44 任總統
ENFJ|歐普拉·溫芙蕾|Oprah Winfrey|1954|美國脫口秀主持人與媒體人
ENFJ|瑪雅·安傑盧|Maya Angelou|1928|美國詩人，《我知道籠中鳥為何歌唱》作者
ENFJ|摩根·費里曼|Morgan Freeman|1937|美國演員，奧斯卡獎得主
ENFJ|比爾·柯林頓|Bill Clinton|1946|美國第 42 任總統
ENFJ|約翰·甘迺迪|John F. Kennedy|1917|美國第 35 任總統
ENFJ|班·艾佛列克|Ben Affleck|1972|美國演員與導演
ENFJ|賈斯汀·川道|Justin Trudeau|1971|加拿大前總理
ENFP|羅賓·威廉斯|Robin Williams|1951|美國喜劇演員，奧斯卡獎得主
ENFP|華特·迪士尼|Walt Disney|1901|美國動畫師與企業家
ENFP|奧斯卡·王爾德|Oscar Wilde|1854|愛爾蘭作家，《格雷的畫像》作者
ENFP|威爾·史密斯|Will Smith|1968|美國演員與歌手
ENFP|艾倫·狄珍妮|Ellen DeGeneres|1958|美國脫口秀主持人
ENFP|昆汀·塔倫提諾|Quentin Tarantino|1963|美國導演，《黑色追緝令》作者
ENFP|安妮·法蘭克|Anne Frank|1929|德裔猶太少女，《安妮日記》作者
ENFP|蘇斯博士|Dr. Seuss|1904|美國作家與插畫家
ISTJ|喬治·華盛頓|George Washington|1732|美國開國元勳，第一任總統
ISTJ|華倫·巴菲特|Warren Buffett|1930|美國投資人，波克夏·海瑟威的領導者
ISTJ|伊莉莎白二世|Elizabeth II|1926|英國女王，在位逾七十年
ISTJ|安格拉·梅克爾|Angela Merkel|1954|德國前總理
ISTJ|安東尼·霍普金斯|Anthony Hopkins|1937|威爾斯演員，奧斯卡獎得主
ISTJ|娜塔莉·波曼|Natalie Portman|1981|以色列裔美國演員
ISTJ|亨利·福特|Henry Ford|1863|美國企業家，福特汽車的創辦人
ISTJ|吉米·卡特|Jimmy Carter|1924|美國第 39 任總統，諾貝爾和平獎得主
ISFJ|德蕾莎修女|Mother Teresa|1910|阿爾巴尼亞裔天主教修女，諾貝爾和平獎得主
ISFJ|羅莎·帕克斯|Rosa Parks|1913|美國民權運動者
ISFJ|凱特·米道頓|Kate Middleton|1982|英國威爾斯王妃
ISFJ|碧昂絲|Beyoncé|1981|美國歌手
ISFJ|安海瑟薇|Anne Hathaway|1982|美國演員，奧斯卡獎得主
ISFJ|威廉王子|Prince William|1982|英國王儲
ISFJ|席琳娜·戈梅茲|Selena Gomez|1992|美國歌手與演員
ISFJ|芭芭拉·布希|Barbara Bush|1925|美國第一夫人
ESTJ|林登·B·詹森|Lyndon B. Johnson|1908|美國第 36 任總統
ESTJ|約翰·D·洛克斐勒|John D. Rockefeller|1839|美國企業家，標準石油的創辦人
ESTJ|希拉蕊·柯林頓|Hillary Clinton|1947|美國政治人物，前國務卿
ESTJ|瑪莎·史都華|Martha Stewart|1941|美國企業家與生活風格名人
ESTJ|索尼婭·索托馬約爾|Sonia Sotomayor|1954|美國最高法院大法官
ESTJ|法蘭克·辛納屈|Frank Sinatra|1915|美國歌手與演員
ESTJ|茱蒂法官|Judge Judy|1942|美國電視法官
ESTJ|柯林·鮑威爾|Colin Powell|1937|美國國務卿與四星上將
ESFJ|泰勒絲|Taylor Swift|1989|美國創作歌手
ESFJ|休·傑克曼|Hugh Jackman|1968|澳洲演員
ESFJ|莎莉·菲爾德|Sally Field|1946|美國演員，兩度獲奧斯卡獎
ESFJ|珍妮佛·嘉納|Jennifer Garner|1972|美國演員
ESFJ|丹尼·葛洛佛|Danny Glover|1946|美國演員
ESFJ|惠妮·休斯頓|Whitney Houston|1963|美國歌手
ESFJ|史提夫·哈維|Steve Harvey|1957|美國主持人與喜劇演員
ESFJ|艾德·希蘭|Ed Sheeran|1991|英國創作歌手
ISTP|克林·伊斯威特|Clint Eastwood|1930|美國演員與導演
ISTP|麥可·喬丹|Michael Jordan|1963|美國籃球員
ISTP|李小龍|Bruce Lee|1940|美籍華裔武術家與電影演員
ISTP|史提夫·麥昆|Steve McQueen|1930|美國演員，《大逃亡》主角
ISTP|厄尼斯特·海明威|Ernest Hemingway|1899|美國作家，《老人與海》作者
ISTP|克莉絲汀·史都華|Kristen Stewart|1990|美國演員
ISTP|史嘉蕾·喬韓森|Scarlett Johansson|1984|美國演員
ISTP|丹尼爾·克雷格|Daniel Craig|1968|英國演員，飾演詹姆斯·龐德
ISFP|麥可·傑克森|Michael Jackson|1958|美國歌手，「流行音樂之王」
ISFP|王子|Prince|1958|美國音樂人
ISFP|瑪麗蓮·夢露|Marilyn Monroe|1926|美國演員
ISFP|弗里達·卡蘿|Frida Kahlo|1907|墨西哥畫家
ISFP|保羅·麥卡尼|Paul McCartney|1942|英國音樂人，披頭四成員
ISFP|布萊德·彼特|Brad Pitt|1963|美國演員與製片
ISFP|蕾哈娜|Rihanna|1988|巴貝多歌手
ISFP|巴布·馬利|Bob Marley|1945|牙買加雷鬼樂歌手
ESTP|瑪丹娜|Madonna|1958|美國歌手，流行音樂天后
ESTP|傑克·尼克遜|Jack Nicholson|1937|美國演員，三度獲奧斯卡獎
ESTP|布魯斯·威利|Bruce Willis|1955|美國演員
ESTP|艾迪·墨菲|Eddie Murphy|1961|美國喜劇演員
ESTP|理查·布蘭森|Richard Branson|1950|英國企業家，維珍集團的創辦人
ESTP|成龍|Jackie Chan|1954|香港動作演員
ESTP|西奧多·羅斯福|Theodore Roosevelt|1858|美國第 26 任總統
ESTP|貝爾·吉羅斯|Bear Grylls|1974|英國探險家與電視名人
ESFP|艾維斯·普里斯萊|Elvis Presley|1935|美國歌手，搖滾樂的代表人物
ESFP|愛黛兒|Adele|1988|英國歌手
ESFP|伊莉莎白·泰勒|Elizabeth Taylor|1932|英裔美籍演員
ESFP|菲董|Pharrell Williams|1973|美國音樂人
ESFP|凱蒂·佩芮|Katy Perry|1984|美國歌手
ESFP|小賈斯汀|Justin Bieber|1994|加拿大歌手
ESFP|傑米·奧利佛|Jamie Oliver|1975|英國廚師
ESFP|麥莉·希拉|Miley Cyrus|1992|美國歌手與演員
`, MBTI_TYPES);
