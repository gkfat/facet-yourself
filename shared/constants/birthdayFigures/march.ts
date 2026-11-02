import { parseFigureTable } from './parse';

/** MM-DD|name|English name|year|role, three times */
export const MARCH_FIGURES = parseFigureTable(`
03-01|弗雷德里克·蕭邦|Frédéric Chopin|1810|波蘭作曲家與鋼琴家，鋼琴詩人|格倫·米勒|Glenn Miller|1904|美國樂團指揮，搖擺樂的代表|大衛·尼文|David Niven|1910|英國演員，奧斯卡獎得主
03-02|蘇斯博士|Dr. Seuss|1904|美國作家與插畫家，《戴帽子的貓》作者|米哈伊爾·戈巴契夫|Mikhail Gorbachev|1931|蘇聯最後一任領導人|山姆·休士頓|Sam Houston|1793|德州共和國總統
03-03|亞歷山大·格雷厄姆·貝爾|Alexander Graham Bell|1847|蘇格蘭裔發明家，電話的發明者|喬治·普爾曼|George Pullman|1831|美國工業家，發明臥舖車廂|傑基·喬伊娜-柯西|Jackie Joyner-Kersee|1962|美國田徑選手，奧運七面獎牌得主
03-04|安東尼奧·韋瓦第|Antonio Vivaldi|1678|義大利作曲家，《四季》作者|航海家亨利|Henry the Navigator|1394|葡萄牙王子，推動大航海時代|努特·羅克尼|Knute Rockne|1888|挪威裔美國橄欖球教練
03-05|傑拉杜斯·麥卡托|Gerardus Mercator|1512|法蘭德斯地圖學家，麥卡托投影的發明者|雷克斯·哈里森|Rex Harrison|1908|英國演員，《窈窕淑女》男主角|丹尼爾·康納曼|Daniel Kahneman|1934|以色列裔心理學家，諾貝爾經濟學獎得主
03-06|米開朗基羅|Michelangelo|1475|義大利文藝復興雕塑家與畫家|伊麗莎白·巴雷特·白朗寧|Elizabeth Barrett Browning|1806|英國詩人，《葡萄牙十四行詩》作者|加夫列爾·加西亞·馬奎斯|Gabriel García Márquez|1927|哥倫比亞作家，《百年孤寂》作者
03-07|莫里斯·拉威爾|Maurice Ravel|1875|法國作曲家，《波麗露》作者|彼得·蒙德里安|Piet Mondrian|1872|荷蘭畫家，風格派的代表|路德·伯班克|Luther Burbank|1849|美國植物學家，培育出上百種植物品種
03-08|小奧利弗·溫德爾·霍姆斯|Oliver Wendell Holmes Jr.|1841|美國最高法院大法官|肯尼斯·格雷厄姆|Kenneth Grahame|1859|英國作家，《柳林風聲》作者|卡爾·菲利普·埃曼努埃爾·巴赫|Carl Philipp Emanuel Bach|1714|德國作曲家，巴赫之子
03-09|阿美利哥·維斯普奇|Amerigo Vespucci|1454|義大利探險家，美洲之名的由來|尤里·加加林|Yuri Gagarin|1934|蘇聯太空人，首位進入太空的人|巴比·費雪|Bobby Fischer|1943|美國西洋棋大師，第 11 位世界冠軍
03-10|馬爾切洛·馬爾比基|Marcello Malpighi|1628|義大利醫師，顯微解剖學的奠基者|阿圖爾·奧涅格|Arthur Honegger|1892|瑞士作曲家|查克·羅禮士|Chuck Norris|1940|美國武術家與演員
03-11|托爾誇托·塔索|Torquato Tasso|1544|義大利詩人，《被解放的耶路撒冷》作者|馬呂斯·佩蒂帕|Marius Petipa|1818|法國編舞家，古典芭蕾的奠基者|奧本·勒維耶|Urbain Le Verrier|1811|法國天文學家，預測出海王星的位置
03-12|傑克·凱魯亞克|Jack Kerouac|1922|美國作家，《在路上》作者|古斯塔夫·基爾霍夫|Gustav Kirchhoff|1824|德國物理學家，提出電路的基爾霍夫定律|喬治·貝克萊|George Berkeley|1685|愛爾蘭哲學家，主觀唯心論的代表
03-13|約瑟夫·普利斯特里|Joseph Priestley|1733|英國化學家，發現氧氣|帕西瓦爾·羅威爾|Percival Lowell|1855|美國天文學家，尋找行星 X|卡爾·弗里德里希·申克爾|Karl Friedrich Schinkel|1781|德國建築師，新古典主義代表
03-14|阿爾伯特·愛因斯坦|Albert Einstein|1879|德裔物理學家，提出相對論|老約翰·史特勞斯|Johann Strauss I|1804|奧地利作曲家，《拉德茨基進行曲》作者|昆西·瓊斯|Quincy Jones|1933|美國音樂製作人與作曲家
03-15|約翰·斯諾|John Snow|1813|英國醫師，流行病學的先驅|露絲·貝德·金斯伯格|Ruth Bader Ginsburg|1933|美國最高法院大法官|安德魯·傑克遜|Andrew Jackson|1767|美國第 7 任總統
03-16|詹姆斯·麥迪遜|James Madison|1751|美國第 4 任總統，憲法之父|卡洛琳·赫歇爾|Caroline Herschel|1750|德裔英國天文學家，發現多顆彗星|格奧爾格·歐姆|Georg Ohm|1787|德國物理學家，提出歐姆定律
03-17|納京高|Nat King Cole|1919|美國爵士歌手與鋼琴家|戈特利布·戴姆勒|Gottlieb Daimler|1834|德國工程師，發明高速汽油引擎|魯道夫·紐瑞耶夫|Rudolf Nureyev|1938|蘇聯芭蕾舞者
03-18|尼古拉·林姆斯基-高沙可夫|Nikolai Rimsky-Korsakov|1844|俄國作曲家，《天方夜譚》作者|魯道夫·狄塞爾|Rudolf Diesel|1858|德國工程師，發明柴油引擎|尼維爾·張伯倫|Neville Chamberlain|1869|英國首相
03-19|大衛·李文斯頓|David Livingstone|1813|蘇格蘭傳教士與探險家|理查·弗朗西斯·伯頓|Richard Francis Burton|1821|英國探險家與翻譯家|懷特·厄普|Wyatt Earp|1848|美國西部執法者
03-20|亨里克·易卜生|Henrik Ibsen|1828|挪威劇作家，《玩偶之家》作者|B·F·史金納|B. F. Skinner|1904|美國心理學家，行為主義的代表|佛雷·羅傑斯|Fred Rogers|1928|美國電視主持人，《羅傑斯先生的鄰居》創作者
03-21|約翰·塞巴斯蒂安·巴哈|Johann Sebastian Bach|1685|德國作曲家，巴洛克音樂的集大成者|莫傑斯特·穆索斯基|Modest Mussorgsky|1839|俄國作曲家，《展覽會之畫》作者|約瑟夫·傅立葉|Joseph Fourier|1768|法國數學家，提出傅立葉分析
03-22|安東尼·范戴克|Anthony van Dyck|1599|法蘭德斯畫家，英國宮廷的肖像畫家|馬歇·馬叟|Marcel Marceau|1923|法國默劇藝術家|史蒂芬·桑坦|Stephen Sondheim|1930|美國作曲家，音樂劇《幸福結局》作者
03-23|黑澤明|Akira Kurosawa|1910|日本導演，《七武士》作者|羅傑·班尼斯特|Roger Bannister|1929|英國田徑選手，首位在四分鐘內跑完一英里|胡安·格里斯|Juan Gris|1887|西班牙畫家，立體主義的代表
03-24|哈利·胡迪尼|Harry Houdini|1874|匈牙利裔美籍魔術師，逃脫術大師|威廉·莫里斯|William Morris|1834|英國設計師，美術工藝運動的領袖|史提夫·麥昆|Steve McQueen|1930|美國演員，《大逃亡》主角
03-25|阿圖羅·托斯卡尼尼|Arturo Toscanini|1867|義大利指揮家|艾瑞莎·弗蘭克林|Aretha Franklin|1942|美國靈魂樂歌手，被稱為「靈魂女王」|貝拉·巴爾托克|Béla Bartók|1881|匈牙利作曲家與民族音樂學家
03-26|羅伯特·佛洛斯特|Robert Frost|1874|美國詩人，《未走之路》作者|田納西·威廉斯|Tennessee Williams|1911|美國劇作家，《慾望街車》作者|珊卓拉·戴·歐康納|Sandra Day O'Connor|1930|美國第一位最高法院女大法官
03-27|威廉·倫琴|Wilhelm Röntgen|1845|德國物理學家，發現 X 射線|密斯·凡德羅|Mies van der Rohe|1886|德裔美籍建築師，「少即是多」的倡導者|昆汀·塔倫提諾|Quentin Tarantino|1963|美國導演，《黑色追緝令》作者
03-28|馬克西姆·高爾基|Maxim Gorky|1868|俄國作家，《母親》作者|約翰·阿摩司·夸美紐斯|John Amos Comenius|1592|捷克教育家，現代教育學的奠基者|亞維拉的德蘭|Teresa of Ávila|1515|西班牙修女與神祕主義作家
03-29|約翰·泰勒|John Tyler|1790|美國第 10 任總統|賽·楊|Cy Young|1867|美國棒球投手，大聯盟年度最佳投手獎以他為名|艾瑞克·艾都|Eric Idle|1943|英國喜劇演員，蒙提·派森成員
03-30|文森·梵谷|Vincent van Gogh|1853|荷蘭後印象派畫家，《星夜》作者|法蘭西斯科·哥雅|Francisco Goya|1746|西班牙畫家，浪漫主義的先驅|艾瑞克·克萊普頓|Eric Clapton|1945|英國吉他手與歌手
03-31|勒內·笛卡兒|René Descartes|1596|法國哲學家，「我思故我在」提出者|約瑟夫·海頓|Joseph Haydn|1732|奧地利作曲家，被稱為交響曲之父|凱薩·查維斯|César Chávez|1927|美國農場工人運動領袖
`);
