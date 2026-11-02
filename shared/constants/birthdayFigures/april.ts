import { parseFigureTable } from './parse';

/** MM-DD|name|English name|year|role, three times */
export const APRIL_FIGURES = parseFigureTable(`
04-01|奧托·馮·俾斯麥|Otto von Bismarck|1815|德意志帝國首任宰相|謝爾蓋·拉赫曼尼諾夫|Sergei Rachmaninoff|1873|俄國作曲家與鋼琴家|亞伯拉罕·馬斯洛|Abraham Maslow|1908|美國心理學家，提出需求層次理論
04-02|漢斯·克里斯汀·安徒生|Hans Christian Andersen|1805|丹麥作家，《醜小鴨》作者|賈科莫·卡薩諾瓦|Giacomo Casanova|1725|義大利冒險家與作家|埃米爾·左拉|Émile Zola|1840|法國作家，自然主義文學的代表
04-03|華盛頓·歐文|Washington Irving|1783|美國作家，《李伯大夢》作者|珍·古德|Jane Goodall|1934|英國靈長類動物學家|馬龍·白蘭度|Marlon Brando|1924|美國演員，《教父》主角
04-04|瑪雅·安傑盧|Maya Angelou|1928|美國詩人，《我知道籠中鳥為何歌唱》作者|安德烈·塔可夫斯基|Andrei Tarkovsky|1932|蘇聯導演，《飛向太空》作者|瑪格麗特·莒哈絲|Marguerite Duras|1914|法國作家，《情人》作者
04-05|約瑟夫·李斯特|Joseph Lister|1827|英國外科醫師，倡導消毒手術|貝蒂·戴維斯|Bette Davis|1908|美國演員，兩度奪得奧斯卡獎|湯瑪斯·霍布斯|Thomas Hobbes|1588|英國哲學家，《利維坦》作者
04-06|安東尼·福克|Anthony Fokker|1890|荷蘭飛機設計師|詹姆斯·沃森|James Watson|1928|美國分子生物學家，發現 DNA 雙螺旋結構|安德烈·普列文|André Previn|1929|美國指揮家與作曲家
04-07|威廉·華茲華斯|William Wordsworth|1770|英國浪漫主義詩人|比莉·哈樂黛|Billie Holiday|1915|美國爵士歌手|法蘭西斯·福特·柯波拉|Francis Ford Coppola|1939|美國導演，《教父》系列作者
04-08|哈維·庫興|Harvey Cushing|1869|美國神經外科醫師，現代神經外科之父|梅爾文·卡爾文|Melvin Calvin|1911|美國化學家，諾貝爾化學獎得主|貝蒂·福特|Betty Ford|1918|美國第一夫人，倡導戒癮治療
04-09|夏爾·波特萊爾|Charles Baudelaire|1821|法國詩人，《惡之華》作者|伊桑巴德·金德姆·布魯內爾|Isambard Kingdom Brunel|1806|英國工程師，設計橋樑與蒸汽輪船|休·海夫納|Hugh Hefner|1926|美國出版人，《花花公子》創辦人
04-10|約瑟夫·普立茲|Joseph Pulitzer|1847|美國報人，普立茲獎的創設者|塞繆爾·哈尼曼|Samuel Hahnemann|1755|德國醫師，順勢療法的創始人|威廉·布斯|William Booth|1829|英國牧師，救世軍的創辦人
04-11|喬治·坎寧|George Canning|1770|英國首相|查爾斯·埃文斯·休斯|Charles Evans Hughes|1862|美國最高法院首席大法官|諾曼·麥克拉倫|Norman McLaren|1914|蘇格蘭裔加拿大動畫導演
04-12|亨利·克萊|Henry Clay|1777|美國政治家，「偉大的妥協者」|奧托·邁爾霍夫|Otto Meyerhof|1884|德國生物化學家，諾貝爾獎得主|賀比·漢考克|Herbie Hancock|1940|美國爵士鋼琴家
04-13|湯瑪斯·傑佛遜|Thomas Jefferson|1743|美國第 3 任總統，獨立宣言起草者|山謬·貝克特|Samuel Beckett|1906|愛爾蘭作家，《等待果陀》作者|尤多拉·韋爾蒂|Eudora Welty|1909|美國作家，普立茲獎得主
04-14|阿諾德·湯恩比|Arnold Toynbee|1889|英國歷史學家，《歷史研究》作者|安妮·蘇利文|Anne Sullivan|1866|美國教師，海倫·凱勒的老師|約翰·吉爾古德|John Gielgud|1904|英國演員，莎士比亞戲劇的名家
04-15|李奧納多·達文西|Leonardo da Vinci|1452|義大利文藝復興的博學家|萊昂哈德·歐拉|Leonhard Euler|1707|瑞士數學家，奠定圖論與分析學|貝西·史密斯|Bessie Smith|1894|美國藍調歌手，被稱為「藍調女皇」
04-16|查理·卓別林|Charlie Chaplin|1889|英國喜劇演員，默片時代的代表|漢斯·斯隆|Hans Sloane|1660|英國醫師，大英博物館的創建基礎|阿納托爾·法朗士|Anatole France|1844|法國作家，諾貝爾文學獎得主
04-17|約翰·皮爾龐特·摩根|J. P. Morgan|1837|美國金融家，創立摩根大通的前身|尼基塔·赫魯雪夫|Nikita Khrushchev|1894|蘇聯領導人|桑頓·懷爾德|Thornton Wilder|1897|美國劇作家，《我們的小鎮》作者
04-18|克拉倫斯·丹諾|Clarence Darrow|1857|美國律師，斯科普斯審判的辯護人|利奧波德·斯托科夫斯基|Leopold Stokowski|1882|英裔美籍指揮家|盧克雷齊婭·波吉亞|Lucrezia Borgia|1480|義大利文藝復興時期的貴族女子
04-19|格倫·西博格|Glenn Seaborg|1912|美國化學家，發現多種超鈾元素|艾略特·奈斯|Eliot Ness|1903|美國禁酒令時期的探員|羅傑·謝爾曼|Roger Sherman|1721|美國開國元勳，簽署了三份建國文件
04-20|胡安·米羅|Joan Miró|1893|西班牙畫家，超現實主義的代表|拿破崙三世|Napoleon III|1808|法蘭西第二帝國皇帝|潔西卡·蘭芝|Jessica Lange|1949|美國演員，兩度獲奧斯卡獎
04-21|夏綠蒂·勃朗特|Charlotte Brontë|1816|英國作家，《簡愛》作者|馬克斯·韋伯|Max Weber|1864|德國社會學家，《新教倫理與資本主義精神》作者|伊莉莎白二世|Elizabeth II|1926|英國女王，在位逾七十年
04-22|伊曼努爾·康德|Immanuel Kant|1724|德國哲學家，《純粹理性批判》作者|弗拉基米爾·納博科夫|Vladimir Nabokov|1899|俄裔美籍作家，《羅莉塔》作者|羅伯特·歐本海默|J. Robert Oppenheimer|1904|美國物理學家，曼哈頓計畫的科學領導人
04-23|威廉·莎士比亞|William Shakespeare|1564|英國劇作家與詩人（出生日期依傳統）|馬克斯·普朗克|Max Planck|1858|德國物理學家，量子論的奠基者|秀蘭·鄧波兒|Shirley Temple|1928|美國童星，後來成為外交官
04-24|安東尼·特洛勒普|Anthony Trollope|1815|英國小說家，《巴賽特郡紀事》作者|芭芭拉·史翠珊|Barbra Streisand|1942|美國歌手與演員|愛德蒙·卡特賴特|Edmund Cartwright|1743|英國發明家，發明動力織布機
04-25|古列爾莫·馬可尼|Guglielmo Marconi|1874|義大利發明家，無線電報的先驅|艾拉·費茲潔拉|Ella Fitzgerald|1917|美國爵士歌手，被稱為「爵士第一夫人」|艾爾·帕西諾|Al Pacino|1940|美國演員，《教父》主角
04-26|歐仁·德拉克洛瓦|Eugène Delacroix|1798|法國畫家，浪漫主義的代表|路德維希·維根斯坦|Ludwig Wittgenstein|1889|奧地利哲學家，《邏輯哲學論》作者|約翰·詹姆斯·奧杜邦|John James Audubon|1785|美國畫家與鳥類學家，《美洲鳥類》作者
04-27|塞繆爾·摩爾斯|Samuel Morse|1791|美國發明家，摩爾斯電碼的共同發明者|瑪麗·沃斯通克拉夫特|Mary Wollstonecraft|1759|英國作家，《女權辯護》作者|尤利西斯·格蘭特|Ulysses S. Grant|1822|美國第 18 任總統
04-28|哈波·李|Harper Lee|1926|美國作家，《梅岡城故事》作者|詹姆斯·門羅|James Monroe|1758|美國第 5 任總統|庫爾特·哥德爾|Kurt Gödel|1906|奧地利數學家，提出不完備定理
04-29|艾靈頓公爵|Duke Ellington|1899|美國爵士作曲家與樂團領袖|亨利·龐加萊|Henri Poincaré|1854|法國數學家，拓樸學的奠基者|亞歷山大二世|Alexander II|1818|俄國沙皇，解放農奴
04-30|卡爾·弗里德里希·高斯|Carl Friedrich Gauss|1777|德國數學家，「數學王子」|法蘭茲·雷哈爾|Franz Lehár|1870|奧匈帝國作曲家，《風流寡婦》作者|朱莉安娜女王|Queen Juliana|1909|荷蘭女王
`);
