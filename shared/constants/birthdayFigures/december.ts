import { parseFigureTable } from './parse';

/** MM-DD|name|English name|year|role, three times */
export const DECEMBER_FIGURES = parseFigureTable(`
12-01|伍迪·艾倫|Woody Allen|1935|美國導演與編劇|尼古拉·羅巴切夫斯基|Nikolai Lobachevsky|1792|俄國數學家，非歐幾何的創立者之一|雷克斯·斯托特|Rex Stout|1886|美國作家，尼祿·伍爾夫探案的作者
12-02|喬治·秀拉|Georges Seurat|1859|法國畫家，點描派的創始人|瑪麗亞·卡拉斯|Maria Callas|1923|希臘裔美籍女高音，「歌劇女神」|詹尼·凡賽斯|Gianni Versace|1946|義大利時裝設計師，凡賽斯品牌的創辦人
12-03|約瑟夫·康拉德|Joseph Conrad|1857|波蘭裔英國作家，《黑暗之心》作者|尚-盧·高達|Jean-Luc Godard|1930|法國導演，新浪潮的代表|歐茲·奧斯本|Ozzy Osbourne|1948|英國搖滾歌手，黑色安息日樂團主唱
12-04|萊納·瑪利亞·里爾克|Rainer Maria Rilke|1875|奧地利詩人，《給青年詩人的信》作者|湯瑪斯·卡萊爾|Thomas Carlyle|1795|蘇格蘭歷史學家與作家|傑夫·布里吉斯|Jeff Bridges|1949|美國演員，奧斯卡獎得主
12-05|華特·迪士尼|Walt Disney|1901|美國動畫師與企業家，迪士尼的創辦人|維爾納·海森堡|Werner Heisenberg|1901|德國物理學家，提出測不準原理|馬丁·范布倫|Martin Van Buren|1782|美國第 8 任總統
12-06|約瑟夫·路易·蓋-呂薩克|Joseph Louis Gay-Lussac|1778|法國化學家與物理學家，提出氣體定律|喬伊斯·基爾默|Joyce Kilmer|1886|美國詩人，《樹》的作者|艾拉·蓋希文|Ira Gershwin|1896|美國作詞家，喬治·蓋希文的兄長
12-07|吉安·洛倫佐·貝尼尼|Gian Lorenzo Bernini|1598|義大利雕塑家與建築師，巴洛克藝術的代表|薇拉·凱瑟|Willa Cather|1873|美國作家，《啊，拓荒者！》作者|諾姆·杭士基|Noam Chomsky|1928|美國語言學家與思想家
12-08|讓·西貝流士|Jean Sibelius|1865|芬蘭作曲家，《芬蘭頌》作者|蘇格蘭的瑪麗女王|Mary, Queen of Scots|1542|蘇格蘭女王，被囚禁後處決|小山米·戴維斯|Sammy Davis Jr.|1925|美國歌手與舞者
12-09|約翰·彌爾頓|John Milton|1608|英國詩人，《失樂園》作者|葛麗絲·霍普|Grace Hopper|1906|美國電腦科學家，開發最早的編譯器|寇克·道格拉斯|Kirk Douglas|1916|美國演員，《萬夫莫敵》主演
12-10|愛達·勒芙蕾絲|Ada Lovelace|1815|英國數學家，被視為首位程式設計師|艾米莉·狄金生|Emily Dickinson|1830|美國詩人|塞薩爾·弗蘭克|César Franck|1822|比利時作曲家與管風琴家
12-11|羅伯特·科赫|Robert Koch|1843|德國細菌學家，發現結核桿菌|埃克托·柏遼茲|Hector Berlioz|1803|法國作曲家，《幻想交響曲》作者|亞歷山大·索忍尼辛|Aleksandr Solzhenitsyn|1918|俄國作家，《古拉格群島》作者
12-12|古斯塔夫·福樓拜|Gustave Flaubert|1821|法國作家，《包法利夫人》作者|愛德華·孟克|Edvard Munch|1863|挪威畫家，《吶喊》作者|法蘭克·辛納屈|Frank Sinatra|1915|美國歌手與演員
12-13|海因里希·海涅|Heinrich Heine|1797|德國詩人，浪漫主義的代表|瑪麗·陶德·林肯|Mary Todd Lincoln|1818|美國第一夫人，林肯總統的妻子|迪克·范戴克|Dick Van Dyke|1925|美國演員，《歡樂滿人間》主演
12-14|諾斯特拉達姆斯|Nostradamus|1503|法國占星家與藥劑師，《諸世紀》作者|第谷·布拉赫|Tycho Brahe|1546|丹麥天文學家，精確的天文觀測者|喬治六世|George VI|1895|英國國王，《王者之聲》的主角
12-15|古斯塔夫·艾菲爾|Gustave Eiffel|1832|法國工程師，艾菲爾鐵塔的設計者|J·保羅·蓋蒂|J. Paul Getty|1892|美國企業家，蓋蒂石油的創辦人|路德維克·柴門霍夫|L. L. Zamenhof|1859|波蘭眼科醫師，世界語的創始人
12-16|路德維希·范·貝多芬|Ludwig van Beethoven|1770|德國作曲家，樂聖|珍·奧斯汀|Jane Austen|1775|英國作家，《傲慢與偏見》作者|亞瑟·C·克拉克|Arthur C. Clarke|1917|英國科幻作家，《2001 太空漫遊》作者
12-17|漢弗里·戴維|Humphry Davy|1778|英國化學家，發現多種元素|約翰·格林里夫·惠蒂爾|John Greenleaf Whittier|1807|美國詩人與廢奴運動者|麥肯齊·金|William Lyon Mackenzie King|1874|加拿大總理，任期超過二十一年
12-18|保羅·克利|Paul Klee|1879|瑞士畫家，抽象藝術的先驅|約瑟夫·約翰·湯姆森|J. J. Thomson|1856|英國物理學家，發現電子|奧西·戴維斯|Ossie Davis|1917|美國演員與民權運動者
12-19|威廉·愛德華·帕里|William Edward Parry|1790|英國海軍軍官，北極探險家|亞伯特·邁克生|Albert Michelson|1852|美國物理學家，測量光速，諾貝爾獎得主|尚·惹內|Jean Genet|1910|法國作家，《花之聖母》作者
12-20|哈維·費爾斯通|Harvey Firestone|1868|美國企業家，費爾斯通輪胎的創辦人|雅羅斯拉夫·海洛夫斯基|Jaroslav Heyrovský|1890|捷克化學家，諾貝爾獎得主|羅伯特·孟席斯|Robert Menzies|1894|澳洲總理，任期最長
12-21|班傑明·迪斯雷利|Benjamin Disraeli|1804|英國首相與小說家|珍·方達|Jane Fonda|1937|美國演員與社運人士|利奧波德·馮·蘭克|Leopold von Ranke|1795|德國歷史學家，現代史學的奠基者
12-22|賈科莫·普契尼|Giacomo Puccini|1858|義大利作曲家，《托斯卡》作者|斯里尼瓦瑟·拉馬努金|Srinivasa Ramanujan|1887|印度數學家，自學成才的天才|尚·拉辛|Jean Racine|1639|法國劇作家，古典悲劇的代表
12-23|約瑟夫·史密斯|Joseph Smith|1805|美國宗教領袖，後期聖徒運動的創始人|沃克夫人|Madam C. J. Walker|1867|美國企業家，美國第一位白手起家的女百萬富翁|尚-弗朗索瓦·商博良|Jean-François Champollion|1790|法國學者，破譯古埃及象形文字
12-24|馬修·阿諾德|Matthew Arnold|1822|英國詩人與評論家|霍華·休斯|Howard Hughes|1905|美國企業家與飛行員|喬治·克雷布|George Crabbe|1754|英國詩人
12-25|穆罕默德·阿里·真納|Muhammad Ali Jinnah|1876|巴基斯坦的建國者|克拉拉·巴頓|Clara Barton|1821|美國護理人員，美國紅十字會的創辦人|亨弗萊·鮑嘉|Humphrey Bogart|1899|美國演員，《北非諜影》主演
12-26|毛澤東|Mao Zedong|1893|中華人民共和國的創建者|查爾斯·巴貝奇|Charles Babbage|1791|英國數學家，被稱為「電腦之父」|亨利·米勒|Henry Miller|1891|美國作家，《北回歸線》作者
12-27|約翰尼斯·克卜勒|Johannes Kepler|1571|德國天文學家，提出行星運動三大定律|路易·巴斯德|Louis Pasteur|1822|法國微生物學家，發明巴氏殺菌法|瑪琳·黛德麗|Marlene Dietrich|1901|德裔美籍演員與歌手
12-28|伍德羅·威爾遜|Woodrow Wilson|1856|美國第 28 任總統，諾貝爾和平獎得主|亞瑟·愛丁頓|Arthur Eddington|1882|英國天文學家，以日蝕觀測驗證廣義相對論|史丹·李|Stan Lee|1922|美國漫畫家，漫威漫畫的共同創造者
12-29|威廉·格萊斯頓|William Gladstone|1809|英國首相|查爾斯·固特異|Charles Goodyear|1800|美國發明家，硫化橡膠的發明者|帕布羅·卡薩爾斯|Pablo Casals|1876|西班牙大提琴家
12-30|魯德亞德·吉卜林|Rudyard Kipling|1865|英國作家，《叢林奇譚》作者|狄奧多·馮塔納|Theodor Fontane|1819|德國作家，《艾菲·布里斯特》作者|卡洛·里德|Carol Reed|1906|英國導演，《黑獄亡魂》導演
12-31|亨利·馬諦斯|Henri Matisse|1869|法國畫家，野獸派的領袖|雅克·卡蒂亞|Jacques Cartier|1491|法國探險家，探索加拿大的聖羅倫斯河|安東尼·霍普金斯|Anthony Hopkins|1937|威爾斯演員，奧斯卡獎得主
`);
