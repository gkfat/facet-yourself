import { parseFigureTable } from './parse';

/** MM-DD|name|English name|year|role, three times */
export const OCTOBER_FIGURES = parseFigureTable(`
10-01|吉米·卡特|Jimmy Carter|1924|美國第 39 任總統，諾貝爾和平獎得主|安妮·貝贊特|Annie Besant|1847|英國社會改革家與神智學者|威廉·波音|William Boeing|1881|美國企業家，波音公司的創辦人
10-02|甘地|Mahatma Gandhi|1869|印度獨立運動領袖，非暴力抵抗的倡導者|格雷安·葛林|Graham Greene|1904|英國作家，《沉靜的美國人》作者|格魯喬·馬克斯|Groucho Marx|1890|美國喜劇演員，馬克斯兄弟成員
10-03|湯瑪斯·沃爾夫|Thomas Wolfe|1900|美國作家，《天使，望故鄉》作者|戈爾·維達爾|Gore Vidal|1925|美國作家與評論家|史蒂夫·雷·沃恩|Stevie Ray Vaughan|1954|美國藍調吉他手
10-04|拉瑟福德·海斯|Rutherford B. Hayes|1822|美國第 19 任總統|巴斯特·基頓|Buster Keaton|1895|美國默片喜劇演員，「冷面笑匠」|查爾登·希斯頓|Charlton Heston|1924|美國演員，《賓漢》主演
10-05|德尼·狄德羅|Denis Diderot|1713|法國哲學家，《百科全書》的主編|羅伯特·戈達德|Robert Goddard|1882|美國物理學家，液體燃料火箭的先驅|瓦茨拉夫·哈維爾|Václav Havel|1936|捷克劇作家與總統
10-06|勒·柯比意|Le Corbusier|1887|瑞士裔法國建築師，現代建築的代表|喬治·威斯汀豪斯|George Westinghouse|1846|美國發明家，空氣煞車與交流電系統的推動者|珍妮·林德|Jenny Lind|1820|瑞典女高音，被稱為「瑞典夜鶯」
10-07|馬友友|Yo-Yo Ma|1955|美籍華裔大提琴家|尼爾斯·玻爾|Niels Bohr|1885|丹麥物理學家，量子力學的奠基者|戴斯蒙·屠圖|Desmond Tutu|1931|南非大主教，諾貝爾和平獎得主
10-08|艾迪·里肯巴克|Eddie Rickenbacker|1890|美國飛行員，一戰的王牌飛行員|胡安·裴隆|Juan Perón|1895|阿根廷總統|奧托·瓦爾堡|Otto Warburg|1883|德國生理學家，諾貝爾獎得主
10-09|約翰·藍儂|John Lennon|1940|英國音樂人，披頭四成員|卡米耶·聖桑|Camille Saint-Saëns|1835|法國作曲家，《動物狂歡節》作者|伊沃·安德里奇|Ivo Andrić|1892|南斯拉夫作家，諾貝爾文學獎得主
10-10|朱塞佩·威爾第|Giuseppe Verdi|1813|義大利作曲家，《阿依達》作者|安托萬·華鐸|Antoine Watteau|1684|法國畫家，洛可可風格的代表|海倫·海斯|Helen Hayes|1900|美國演員，被稱為「美國劇場第一夫人」
10-11|愛蓮娜·羅斯福|Eleanor Roosevelt|1884|美國第一夫人，聯合國《世界人權宣言》的起草者|亨利·海因茨|Henry J. Heinz|1844|美國企業家，海因茨食品公司的創辦人|弗朗索瓦·莫里亞克|François Mauriac|1885|法國作家，諾貝爾文學獎得主
10-12|盧奇亞諾·帕華洛帝|Luciano Pavarotti|1935|義大利男高音|亞瑟·哈登|Arthur Harden|1865|英國生物化學家，諾貝爾化學獎得主|艾迪特·施泰因|Edith Stein|1891|德國哲學家與修女
10-13|瑪格麗特·柴契爾|Margaret Thatcher|1925|英國首相，首位女首相|魯道夫·菲爾紹|Rudolf Virchow|1821|德國病理學家，細胞病理學的奠基者|連尼·布魯斯|Lenny Bruce|1925|美國喜劇演員
10-14|威廉·賓|William Penn|1644|英國貴格會教徒，賓夕法尼亞的創建者|德懷特·艾森豪|Dwight D. Eisenhower|1890|美國第 34 任總統|E·E·卡明斯|E. E. Cummings|1894|美國詩人
10-15|弗里德里希·尼采|Friedrich Nietzsche|1844|德國哲學家，《查拉圖斯特拉如是說》作者|P·G·伍德豪斯|P. G. Wodehouse|1881|英國作家，《萬能管家》系列作者|埃萬傑利斯塔·托里切利|Evangelista Torricelli|1608|義大利物理學家，發明水銀氣壓計
10-16|奧斯卡·王爾德|Oscar Wilde|1854|愛爾蘭作家，《格雷的畫像》作者|尤金·歐尼爾|Eugene O'Neill|1888|美國劇作家，諾貝爾文學獎得主|諾亞·韋伯斯特|Noah Webster|1758|美國辭典編纂者，《韋氏辭典》的編者
10-17|傑瑞·西格爾|Jerry Siegel|1914|美國漫畫家，超人的共同創造者|麗泰·海華斯|Rita Hayworth|1918|美國演員與舞者|格奧爾格·畢希納|Georg Büchner|1813|德國劇作家，《沃伊采克》作者
10-18|亨利·柏格森|Henri Bergson|1859|法國哲學家，諾貝爾文學獎得主|皮耶·楚多|Pierre Trudeau|1919|加拿大總理|喬治·C·斯科特|George C. Scott|1927|美國演員，《巴頓將軍》主演
10-19|約翰·勒卡雷|John le Carré|1931|英國作家，《冷戰諜魂》作者|奧古斯特·盧米埃|Auguste Lumière|1862|法國發明家，電影的共同發明者|馬爾西利奧·斐奇諾|Marsilio Ficino|1433|義大利哲學家，柏拉圖著作的翻譯者
10-20|亞瑟·韓波|Arthur Rimbaud|1854|法國詩人，象徵主義的代表|克里斯多福·雷恩|Christopher Wren|1632|英國建築師，聖保羅大教堂的設計者|約翰·杜威|John Dewey|1859|美國哲學家與教育家
10-21|阿佛烈·諾貝爾|Alfred Nobel|1833|瑞典發明家，設立諾貝爾獎|塞繆爾·泰勒·柯勒律治|Samuel Taylor Coleridge|1772|英國詩人，《古舟子詠》作者|格奧爾格·索爾蒂|Georg Solti|1912|匈牙利裔英國指揮家
10-22|法蘭茲·李斯特|Franz Liszt|1811|匈牙利作曲家與鋼琴家|羅伯特·勞森伯格|Robert Rauschenberg|1925|美國藝術家，普普藝術的先驅|約翰·里德|John Reed|1887|美國記者，《震撼世界的十天》作者
10-23|羅伯特·布里吉斯|Robert Bridges|1844|英國桂冠詩人|強尼·卡森|Johnny Carson|1925|美國電視主持人，《今夜秀》的主持人|貝利|Pelé|1940|巴西足球員，三度奪得世界盃冠軍
10-24|安東尼·范·雷文霍克|Antonie van Leeuwenhoek|1632|荷蘭科學家，顯微鏡學的先驅|莫斯·哈特|Moss Hart|1904|美國劇作家|莎拉·約瑟法·黑爾|Sarah Josepha Hale|1788|美國作家，感恩節的倡導者
10-25|巴勃羅·畢卡索|Pablo Picasso|1881|西班牙畫家，立體主義的創始人之一|喬治·比才|Georges Bizet|1838|法國作曲家，《卡門》作者|理查·伯德|Richard E. Byrd|1888|美國海軍軍官與極地探險家
10-26|喬治·丹敦|Georges Danton|1759|法國大革命的領袖之一|多米尼哥·史卡拉第|Domenico Scarlatti|1685|義大利作曲家，大鍵琴奏鳴曲的作者|希拉蕊·柯林頓|Hillary Clinton|1947|美國政治人物，前國務卿
10-27|狄倫·湯瑪斯|Dylan Thomas|1914|威爾斯詩人，《不要溫和地走進那個良夜》作者|西奧多·羅斯福|Theodore Roosevelt|1858|美國第 26 任總統|尼可羅·帕格尼尼|Niccolò Paganini|1782|義大利小提琴家與作曲家
10-28|比爾·蓋茲|Bill Gates|1955|美國企業家，微軟共同創辦人|喬納斯·沙克|Jonas Salk|1914|美國醫學研究者，研發出小兒麻痺疫苗|伊夫林·沃|Evelyn Waugh|1903|英國作家，《故園風雨後》作者
10-29|尚·季洛杜|Jean Giraudoux|1882|法國劇作家|詹姆斯·包斯威爾|James Boswell|1740|蘇格蘭作家，《約翰遜傳》作者|芬妮·布萊斯|Fanny Brice|1891|美國歌手與喜劇演員
10-30|約翰·亞當斯|John Adams|1735|美國第 2 任總統|艾茲拉·龐德|Ezra Pound|1885|美國詩人，意象派的領袖|理查·布林斯利·謝里丹|Richard Brinsley Sheridan|1751|愛爾蘭劇作家，《造謠學校》作者
10-31|約翰·濟慈|John Keats|1795|英國浪漫主義詩人|蔣介石|Chiang Kai-shek|1887|中華民國總統|約翰尼斯·維米爾|Johannes Vermeer|1632|荷蘭畫家，《戴珍珠耳環的少女》作者
`);
