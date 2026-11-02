import { parseFigureTable } from './parse';

/** MM-DD|name|English name|year|role, three times */
export const FEBRUARY_FIGURES = parseFigureTable(`
02-01|克拉克·蓋博|Clark Gable|1901|美國演員，《亂世佳人》男主角|蘭斯頓·休斯|Langston Hughes|1902|美國詩人，哈林文藝復興的代表|約翰·福特|John Ford|1894|美國導演，擅長西部片
02-02|詹姆斯·喬伊斯|James Joyce|1882|愛爾蘭作家，《尤利西斯》作者|艾茵·蘭德|Ayn Rand|1905|俄裔美國作家，《源泉》作者|夏奇拉|Shakira|1977|哥倫比亞歌手
02-03|諾曼·洛克威爾|Norman Rockwell|1894|美國插畫家，描繪日常生活的雜誌封面|費利克斯·孟德爾頌|Felix Mendelssohn|1809|德國作曲家，《仲夏夜之夢》配樂作者|格楚德·史坦|Gertrude Stein|1874|美國作家與藝術收藏家
02-04|羅莎·帕克斯|Rosa Parks|1913|美國民權運動者，抵制公車種族隔離|查爾斯·林白|Charles Lindbergh|1902|美國飛行員，首次單人不著陸橫越大西洋|迪特里希·潘霍華|Dietrich Bonhoeffer|1906|德國神學家與反納粹者
02-05|羅伯特·皮爾|Robert Peel|1788|英國首相，創立現代警察制度|威廉·S·巴勒斯|William S. Burroughs|1914|美國作家，垮掉的一代代表|克里斯蒂亞諾·羅納度|Cristiano Ronaldo|1985|葡萄牙足球員
02-06|貝比·魯斯|Babe Ruth|1895|美國棒球傳奇球員|隆納·雷根|Ronald Reagan|1911|美國第 40 任總統|巴布·馬利|Bob Marley|1945|牙買加雷鬼樂歌手
02-07|查爾斯·狄更斯|Charles Dickens|1812|英國作家，《孤雛淚》作者|蘿拉·英格斯·懷德|Laura Ingalls Wilder|1867|美國作家，《大草原上的小木屋》作者|湯瑪斯·摩爾|Thomas More|1478|英國人文學家，《烏托邦》作者
02-08|儒勒·凡爾納|Jules Verne|1828|法國作家，科幻小說的先驅|德米特里·門得列夫|Dmitri Mendeleev|1834|俄國化學家，創制元素週期表|傑克·萊蒙|Jack Lemmon|1925|美國演員，奧斯卡獎得主
02-09|愛麗絲·沃克|Alice Walker|1944|美國作家，《紫色姊妹花》作者|威廉·亨利·哈里森|William Henry Harrison|1773|美國第 9 任總統|艾咪·洛威爾|Amy Lowell|1874|美國詩人，意象派代表
02-10|貝爾托·布萊希特|Bertolt Brecht|1898|德國劇作家，提出「疏離效果」|鮑里斯·帕斯捷爾納克|Boris Pasternak|1890|俄國作家，《齊瓦哥醫生》作者|查爾斯·蘭姆|Charles Lamb|1775|英國散文家，《伊利亞隨筆》作者
02-11|湯瑪斯·愛迪生|Thomas Edison|1847|美國發明家，改良電燈與留聲機|伯納德·豐特內爾|Bernard de Fontenelle|1657|法國思想家，普及科學的先驅|伯特·雷諾斯|Burt Reynolds|1936|美國演員
02-12|亞伯拉罕·林肯|Abraham Lincoln|1809|美國第 16 任總統，廢除奴隸制|查爾斯·達爾文|Charles Darwin|1809|英國博物學家，提出演化論|安娜·帕芙洛娃|Anna Pavlova|1881|俄國芭蕾舞者，《垂死的天鵝》演出者
02-13|湯瑪斯·馬爾薩斯|Thomas Malthus|1766|英國經濟學家，《人口論》作者|查克·葉格|Chuck Yeager|1923|美國空軍飛行員，首位突破音障者|彼得·蓋布瑞爾|Peter Gabriel|1950|英國音樂人，創世樂團成員
02-14|弗雷德里克·道格拉斯|Frederick Douglass|1818|美國廢奴運動領袖與作家|喬治·費里斯|George Ferris|1859|美國工程師，設計第一座摩天輪|傑克·班尼|Jack Benny|1894|美國喜劇演員
02-15|伽利略·伽利萊|Galileo Galilei|1564|義大利天文學家，近代科學的奠基者|傑瑞米·邊沁|Jeremy Bentham|1748|英國哲學家，功利主義的創始人|蘇珊·B·安東尼|Susan B. Anthony|1820|美國婦女參政運動領袖
02-16|法蘭西斯·高爾頓|Francis Galton|1822|英國博學家，開創指紋與統計相關研究|亨利·亞當斯|Henry Adams|1838|美國歷史學家，《亨利·亞當斯的教育》作者|約翰·麥肯羅|John McEnroe|1959|美國網球選手
02-17|麥可·喬丹|Michael Jordan|1963|美國籃球員，六度奪得 NBA 總冠軍|勒內·雷奈克|René Laennec|1781|法國醫師，發明聽診器|奧托·施特恩|Otto Stern|1888|德國物理學家，諾貝爾物理學獎得主
02-18|恩佐·法拉利|Enzo Ferrari|1898|義大利賽車手，創立法拉利車廠|亞歷山德羅·伏打|Alessandro Volta|1745|義大利物理學家，發明伏打電池|童妮·摩里森|Toni Morrison|1931|美國作家，諾貝爾文學獎得主
02-19|尼古拉·哥白尼|Nicolaus Copernicus|1473|波蘭天文學家，提出日心說|路易吉·博凱里尼|Luigi Boccherini|1743|義大利作曲家與大提琴家|史摩基·羅賓遜|Smokey Robinson|1940|美國靈魂樂歌手
02-20|安瑟·亞當斯|Ansel Adams|1902|美國攝影師，風景攝影大師|薛尼·鮑迪|Sidney Poitier|1927|巴哈馬裔美國演員，首位奪得奧斯卡最佳男主角的黑人|寇特·柯本|Kurt Cobain|1967|美國搖滾樂團超脫樂團主唱
02-21|W·H·奧登|W. H. Auden|1907|英裔美籍詩人|妮娜·西蒙|Nina Simone|1933|美國爵士與靈魂樂歌手|阿內絲·尼恩|Anaïs Nin|1903|法裔美國作家，以日記聞名
02-22|喬治·華盛頓|George Washington|1732|美國開國元勳，第一任總統|亞瑟·叔本華|Arthur Schopenhauer|1788|德國哲學家，《作為意志和表象的世界》作者|艾德娜·聖文森·米萊|Edna St. Vincent Millay|1892|美國詩人，普立茲詩歌獎得主
02-23|喬治·弗里德里克·韓德爾|George Frideric Handel|1685|德裔英國作曲家，《彌賽亞》作者|W·E·B·杜波依斯|W. E. B. Du Bois|1868|美國社會學家與民權運動者|塞謬爾·皮普斯|Samuel Pepys|1633|英國官員，留下著名的日記
02-24|史蒂夫·賈伯斯|Steve Jobs|1955|美國企業家，蘋果公司共同創辦人|威廉·格林|Wilhelm Grimm|1786|德國語言學家，格林童話的編者之一|溫斯洛·霍默|Winslow Homer|1836|美國畫家，海景水彩的大師
02-25|皮耶-奧古斯特·雷諾瓦|Pierre-Auguste Renoir|1841|法國畫家，印象派代表|喬治·哈里森|George Harrison|1943|英國音樂人，披頭四成員|恩里科·卡魯索|Enrico Caruso|1873|義大利男高音
02-26|維克多·雨果|Victor Hugo|1802|法國作家，《悲慘世界》作者|強尼·凱許|Johnny Cash|1932|美國鄉村音樂歌手|水牛比爾|Buffalo Bill|1846|美國西部拓荒者與表演家
02-27|約翰·史坦貝克|John Steinbeck|1902|美國作家，《憤怒的葡萄》作者|伊麗莎白·泰勒|Elizabeth Taylor|1932|英裔美籍演員|亨利·朗費羅|Henry Wadsworth Longfellow|1807|美國詩人，《保羅·里維爾夜奔》作者
02-28|米歇爾·德·蒙田|Michel de Montaigne|1533|法國哲學家，隨筆體的創始人|萊納斯·鮑林|Linus Pauling|1901|美國化學家，兩度獲諾貝爾獎|法蘭克·蓋瑞|Frank Gehry|1929|加拿大裔美籍建築師，畢爾包古根漢美術館設計者
02-29|焦阿基諾·羅西尼|Gioachino Rossini|1792|義大利作曲家，《塞維亞的理髮師》作者|約翰·菲利普·霍蘭|John Philip Holland|1840|愛爾蘭發明家，現代潛水艇的先驅|莫拉吉·德賽|Morarji Desai|1896|印度第四任總理
`);
