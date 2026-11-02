import { parseFigureTable } from './parse';

/** MM-DD|name|English name|year|role, three times */
export const AUGUST_FIGURES = parseFigureTable(`
08-01|赫爾曼·梅爾維爾|Herman Melville|1819|美國作家，《白鯨記》作者|法蘭西斯·斯科特·基|Francis Scott Key|1779|美國作家，美國國歌歌詞的作者|讓-巴蒂斯特·拉馬克|Jean-Baptiste Lamarck|1744|法國生物學家，早期的演化論者
08-02|彼得·奧圖|Peter O'Toole|1932|愛爾蘭演員，《阿拉伯的勞倫斯》主角|詹姆斯·鮑德溫|James Baldwin|1924|美國作家，《山上宣道》作者|約翰·丁達爾|John Tyndall|1820|愛爾蘭物理學家，解釋天空為何是藍色
08-03|托尼·班奈特|Tony Bennett|1926|美國歌手|伊萊沙·奧的斯|Elisha Otis|1811|美國發明家，安全升降梯的發明者|魯珀特·布魯克|Rupert Brooke|1887|英國詩人
08-04|珀西·比希·雪萊|Percy Bysshe Shelley|1792|英國浪漫主義詩人|路易斯·阿姆斯壯|Louis Armstrong|1901|美國爵士小號手與歌手|巴拉克·歐巴馬|Barack Obama|1961|美國第 44 任總統
08-05|居伊·德·莫泊桑|Guy de Maupassant|1850|法國作家，短篇小說大師|尼爾·阿姆斯壯|Neil Armstrong|1930|美國太空人，首位登上月球的人|約翰·休斯頓|John Huston|1906|美國導演，《北非諜影》作者之一
08-06|亞歷山大·弗萊明|Alexander Fleming|1881|蘇格蘭細菌學家，發現盤尼西林|阿佛烈·丁尼生|Alfred Tennyson|1809|英國桂冠詩人|安迪·沃荷|Andy Warhol|1928|美國藝術家，普普藝術的代表
08-07|瑪塔·哈里|Mata Hari|1876|荷蘭舞者，被指控為間諜|拉爾夫·邦奇|Ralph Bunche|1904|美國外交官，首位獲諾貝爾和平獎的黑人|卡爾·李特爾|Carl Ritter|1779|德國地理學家，現代地理學的奠基者
08-08|保羅·狄拉克|Paul Dirac|1902|英國物理學家，量子力學的奠基者|瑪喬麗·金南·勞林斯|Marjorie Kinnan Rawlings|1896|美國作家，《鹿苑長春》作者|達斯汀·霍夫曼|Dustin Hoffman|1937|美國演員，兩度獲奧斯卡獎
08-09|讓·皮亞傑|Jean Piaget|1896|瑞士心理學家，認知發展理論的創始人|約翰·德萊頓|John Dryden|1631|英國桂冠詩人|威廉·莫頓|William T. G. Morton|1819|美國牙醫，首次公開示範乙醚麻醉
08-10|赫伯特·胡佛|Herbert Hoover|1874|美國第 31 任總統|阿恩·蒂塞留斯|Arne Tiselius|1902|瑞典生物化學家，諾貝爾化學獎得主|若熱·亞馬多|Jorge Amado|1912|巴西作家，《加布里埃拉》作者
08-11|伊妮德·布萊敦|Enid Blyton|1897|英國兒童文學作家，《五小冒險家》作者|亞歷克斯·哈利|Alex Haley|1921|美國作家，《根》作者|羅伯特·英格索爾|Robert G. Ingersoll|1833|美國演說家，自由思想的倡導者
08-12|塞西爾·B·狄密爾|Cecil B. DeMille|1881|美國導演，《十誡》作者|埃爾溫·薛丁格|Erwin Schrödinger|1887|奧地利物理學家，量子力學的奠基者|喬治四世|George IV|1762|英國國王，攝政時期的君主
08-13|阿爾弗雷德·希區考克|Alfred Hitchcock|1899|英國導演，懸疑片大師|菲德爾·卡斯楚|Fidel Castro|1926|古巴革命領袖|安妮·歐克利|Annie Oakley|1860|美國神射手，西部表演者
08-14|約翰·高爾斯華綏|John Galsworthy|1867|英國作家，《福爾賽世家》作者，諾貝爾文學獎得主|漢斯·克里斯蒂安·奧斯特|Hans Christian Ørsted|1777|丹麥物理學家，發現電流的磁效應|歐內斯特·湯普森·西頓|Ernest Thompson Seton|1860|英裔加拿大作家與博物學家，美國童子軍的創辦人之一
08-15|拿破崙·波拿巴|Napoleon Bonaparte|1769|法蘭西第一帝國皇帝|華特·司各特|Walter Scott|1771|蘇格蘭作家，歷史小說的開創者|茱莉亞·柴爾德|Julia Child|1912|美國廚師，把法式料理介紹給美國家庭
08-16|瑪丹娜|Madonna|1958|美國歌手，流行音樂天后|T·E·勞倫斯|T. E. Lawrence|1888|英國軍官與作家，「阿拉伯的勞倫斯」|朱爾·拉弗格|Jules Laforgue|1860|法國詩人，象徵主義的代表
08-17|皮耶·德·費瑪|Pierre de Fermat|1601|法國數學家，提出費馬最後定理|戴維·克羅克特|Davy Crockett|1786|美國邊疆開拓者與政治人物|勞勃·狄尼洛|Robert De Niro|1943|美國演員，兩度獲奧斯卡獎
08-18|梅里韋瑟·路易斯|Meriwether Lewis|1774|美國探險家，路易斯與克拉克遠征的領隊|安東尼奧·薩列里|Antonio Salieri|1750|義大利作曲家，維也納宮廷樂長|羅伯托·克萊門特|Roberto Clemente|1934|波多黎各棒球員與人道主義者
08-19|可可·香奈兒|Coco Chanel|1883|法國時裝設計師，創立香奈兒品牌|奧格登·納什|Ogden Nash|1902|美國詩人，以幽默詩聞名|比爾·柯林頓|Bill Clinton|1946|美國第 42 任總統
08-20|本傑明·哈里森|Benjamin Harrison|1833|美國第 23 任總統|H·P·洛夫克拉夫特|H. P. Lovecraft|1890|美國作家，克蘇魯神話的創造者|永斯·貝采利烏斯|Jöns Jacob Berzelius|1779|瑞典化學家，現代化學符號的創立者
08-21|貝西伯爵|Count Basie|1904|美國爵士鋼琴家與樂團領袖|奧古斯丁-路易·柯西|Augustin-Louis Cauchy|1789|法國數學家，嚴謹分析學的奠基者|奧伯利·比亞茲萊|Aubrey Beardsley|1872|英國插畫家，新藝術風格的代表
08-22|克勞德·德布西|Claude Debussy|1862|法國作曲家，印象主義音樂的代表|雷·布萊伯利|Ray Bradbury|1920|美國作家，《華氏 451 度》作者|德尼·帕潘|Denis Papin|1647|法國物理學家，壓力鍋的發明者
08-23|金·凱利|Gene Kelly|1912|美國舞者與演員，《萬花嬉春》主演|喬治·居維葉|Georges Cuvier|1769|法國博物學家，比較解剖學的奠基者|艾德加·李·馬斯特斯|Edgar Lee Masters|1868|美國詩人，《匙河集》作者
08-24|豪爾赫·路易斯·波赫士|Jorge Luis Borges|1899|阿根廷作家，《虛構集》作者|馬克斯·比爾伯姆|Max Beerbohm|1872|英國漫畫家與散文家|羅伯特·赫里克|Robert Herrick|1591|英國詩人，《及時行樂》作者
08-25|李奧納德·伯恩斯坦|Leonard Bernstein|1918|美國指揮家與作曲家，《西城故事》配樂作者|史恩·康納萊|Sean Connery|1930|蘇格蘭演員，首位詹姆斯·龐德|約翰·哥特弗里德·赫爾德|Johann Gottfried Herder|1744|德國哲學家，狂飆突進運動的推動者
08-26|德蕾莎修女|Mother Teresa|1910|阿爾巴尼亞裔天主教修女，諾貝爾和平獎得主|安托萬·拉瓦節|Antoine Lavoisier|1743|法國化學家，現代化學之父|約瑟夫-米歇爾·蒙戈爾菲耶|Joseph-Michel Montgolfier|1740|法國發明家，熱氣球的發明者之一
08-27|格奧爾格·黑格爾|Georg Wilhelm Friedrich Hegel|1770|德國哲學家，德國觀念論的代表|林登·B·詹森|Lyndon B. Johnson|1908|美國第 36 任總統|卡爾·博施|Carl Bosch|1874|德國化學家，哈伯-博施法的完成者
08-28|約翰·沃夫岡·馮·歌德|Johann Wolfgang von Goethe|1749|德國作家，《浮士德》作者|列夫·托爾斯泰|Leo Tolstoy|1828|俄國作家，《戰爭與和平》作者|傑克·柯比|Jack Kirby|1917|美國漫畫家，漫威漫畫的共同創造者
08-29|約翰·洛克|John Locke|1632|英國哲學家，自由主義之父|麥可·傑克森|Michael Jackson|1958|美國歌手，「流行音樂之王」|英格麗·褒曼|Ingrid Bergman|1915|瑞典演員，《北非諜影》女主角
08-30|瑪麗·雪萊|Mary Shelley|1797|英國作家，《科學怪人》作者|歐內斯特·拉塞福|Ernest Rutherford|1871|紐西蘭物理學家，原子核物理之父|華倫·巴菲特|Warren Buffett|1930|美國投資人，波克夏·海瑟威的領導者
08-31|瑪麗亞·蒙特梭利|Maria Montessori|1870|義大利教育家，蒙特梭利教育法的創始人|泰奧菲爾·戈蒂耶|Théophile Gautier|1811|法國作家，唯美主義的倡導者|范·莫里森|Van Morrison|1945|北愛爾蘭創作歌手
`);
