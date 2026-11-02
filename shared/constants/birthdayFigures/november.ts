import { parseFigureTable } from './parse';

/** MM-DD|name|English name|year|role, three times */
export const NOVEMBER_FIGURES = parseFigureTable(`
11-01|史蒂芬·克萊恩|Stephen Crane|1871|美國作家，《紅色英勇勳章》作者|安東尼奧·卡諾瓦|Antonio Canova|1757|義大利雕塑家，新古典主義的代表|阿爾弗雷德·魏格納|Alfred Wegener|1880|德國地球科學家，提出大陸漂移說
11-02|瑪麗·安東妮|Marie Antoinette|1755|法國王后，法國大革命時期被處決|詹姆斯·K·波克|James K. Polk|1795|美國第 11 任總統|華倫·哈定|Warren G. Harding|1865|美國第 29 任總統
11-03|威廉·卡倫·布萊恩特|William Cullen Bryant|1794|美國詩人與報人|查爾斯·布朗遜|Charles Bronson|1921|美國演員，《豪勇七蛟龍》主演|奧朗則布|Aurangzeb|1618|蒙兀兒帝國皇帝
11-04|威爾·羅傑斯|Will Rogers|1879|美國演員與幽默作家|華特·克朗凱特|Walter Cronkite|1916|美國電視新聞主播，被稱為「美國最受信賴的人」|威廉三世|William III|1650|英國國王，光榮革命的主角
11-05|漢斯·薩克斯|Hans Sachs|1494|德國詩人與工匠歌手|費雯·麗|Vivien Leigh|1913|英國演員，《亂世佳人》女主角|威爾·杜蘭特|Will Durant|1885|美國歷史學家，《世界文明史》作者
11-06|約翰·菲利普·蘇沙|John Philip Sousa|1854|美國作曲家，「進行曲之王」|阿道夫·薩克斯|Adolphe Sax|1814|比利時樂器製造者，薩克斯風的發明者|詹姆斯·奈史密斯|James Naismith|1861|加拿大裔美國體育教師，籃球的發明者
11-07|瑪麗·居禮|Marie Curie|1867|波蘭裔法國物理學家與化學家，兩度獲諾貝爾獎|阿爾貝·卡繆|Albert Camus|1913|法國作家，《異鄉人》作者|錢德拉塞卡拉·拉曼|C. V. Raman|1888|印度物理學家，發現拉曼散射
11-08|愛德蒙·哈雷|Edmond Halley|1656|英國天文學家，預測哈雷彗星的回歸|布拉姆·斯托克|Bram Stoker|1847|愛爾蘭作家，《德古拉》作者|瑪格麗特·米契爾|Margaret Mitchell|1900|美國作家，《飄》作者
11-09|卡爾·薩根|Carl Sagan|1934|美國天文學家與科普作家|伊凡·屠格涅夫|Ivan Turgenev|1818|俄國作家，《父與子》作者|愛德華七世|Edward VII|1841|英國國王
11-10|馬丁·路德|Martin Luther|1483|德國神學家，宗教改革的發起者|奧利弗·哥德史密斯|Oliver Goldsmith|1728|愛爾蘭作家，《威克菲爾德牧師傳》作者|威廉·霍加斯|William Hogarth|1697|英國畫家，諷刺版畫的先驅
11-11|費奧多爾·杜斯妥也夫斯基|Fyodor Dostoevsky|1821|俄國作家，《罪與罰》作者|喬治·巴頓|George S. Patton|1885|美國將軍|寇特·馮內果|Kurt Vonnegut|1922|美國作家，《第五號屠宰場》作者
11-12|奧古斯特·羅丹|Auguste Rodin|1840|法國雕塑家，《沉思者》作者|孫中山|Sun Yat-sen|1866|中華民國的創建者|巴哈歐拉|Bahá'u'lláh|1817|巴哈伊信仰的創立者
11-13|羅伯特·路易斯·史蒂文森|Robert Louis Stevenson|1850|蘇格蘭作家，《金銀島》作者|愛德華三世|Edward III|1312|英格蘭國王，開啟百年戰爭|琥碧·戈柏|Whoopi Goldberg|1955|美國演員，奧斯卡獎得主
11-14|克勞德·莫內|Claude Monet|1840|法國畫家，印象派的代表|賈瓦哈拉爾·尼赫魯|Jawaharlal Nehru|1889|印度首任總理|阿思緹·林格倫|Astrid Lindgren|1907|瑞典作家，《長襪皮皮》作者
11-15|喬治亞·歐姬芙|Georgia O'Keeffe|1887|美國畫家，現代主義的代表|威廉·赫歇爾|William Herschel|1738|德裔英國天文學家，發現天王星|威廉·皮特（老皮特）|William Pitt the Elder|1708|英國首相，七年戰爭的領導者
11-16|讓·勒朗·達朗貝爾|Jean le Rond d'Alembert|1717|法國數學家與哲學家，《百科全書》的共同編者|保羅·欣德米特|Paul Hindemith|1895|德國作曲家|W·C·漢迪|W. C. Handy|1873|美國作曲家，被稱為「藍調之父」
11-17|奧古斯特·莫比烏斯|August Ferdinand Möbius|1790|德國數學家，莫比烏斯帶的發現者|洛克·赫遜|Rock Hudson|1925|美國演員|伯納德·蒙哥馬利|Bernard Montgomery|1887|英國陸軍元帥
11-18|路易·達蓋爾|Louis Daguerre|1787|法國發明家，銀版攝影術的發明者|W·S·吉爾伯特|W. S. Gilbert|1836|英國劇作家，輕歌劇《日本天皇》的作詞者|艾倫·雪帕德|Alan Shepard|1923|美國太空人，首位進入太空的美國人
11-19|英迪拉·甘地|Indira Gandhi|1917|印度首位女總理|詹姆斯·加菲爾德|James A. Garfield|1831|美國第 20 任總統|查理一世|Charles I|1600|英國國王，英國內戰中被處決
11-20|愛德溫·哈伯|Edwin Hubble|1889|美國天文學家，發現宇宙正在膨脹|羅伯特·F·甘迺迪|Robert F. Kennedy|1925|美國司法部長與參議員|湯瑪斯·查特頓|Thomas Chatterton|1752|英國詩人，早逝的天才少年
11-21|伏爾泰|Voltaire|1694|法國啟蒙思想家，《憨第德》作者|雷內·馬格利特|René Magritte|1898|比利時畫家，超現實主義的代表|歌蒂·韓|Goldie Hawn|1945|美國演員，奧斯卡獎得主
11-22|喬治·艾略特|George Eliot|1819|英國作家，《米德爾馬契》作者|夏爾·戴高樂|Charles de Gaulle|1890|法國將軍與總統|安德烈·紀德|André Gide|1869|法國作家，諾貝爾文學獎得主
11-23|富蘭克林·皮爾斯|Franklin Pierce|1804|美國第 14 任總統|鮑里斯·卡洛夫|Boris Karloff|1887|英國演員，《科學怪人》中怪物的演出者|曼努埃爾·德·法雅|Manuel de Falla|1876|西班牙作曲家
11-24|巴魯赫·斯賓諾莎|Baruch Spinoza|1632|荷蘭哲學家，《倫理學》作者|亨利·德·土魯斯-羅特列克|Henri de Toulouse-Lautrec|1864|法國畫家，《紅磨坊》系列的作者|扎卡里·泰勒|Zachary Taylor|1784|美國第 12 任總統
11-25|安德魯·卡內基|Andrew Carnegie|1835|美國企業家與慈善家|喬·迪馬喬|Joe DiMaggio|1914|美國棒球員，創下連續 56 場安打紀錄|卡爾·賓士|Karl Benz|1844|德國工程師，發明第一輛實用汽車
11-26|查爾斯·舒茲|Charles M. Schulz|1922|美國漫畫家，《花生漫畫》作者|威廉·柯珀|William Cowper|1731|英國詩人，《約翰·吉爾平》作者|諾伯特·維納|Norbert Wiener|1894|美國數學家，控制論的創始人
11-27|李小龍|Bruce Lee|1940|美籍華裔武術家與電影演員|吉米·罕醉克斯|Jimi Hendrix|1942|美國電吉他手，搖滾樂的傳奇人物|安德斯·攝爾修斯|Anders Celsius|1701|瑞典天文學家，攝氏溫標的提出者
11-28|威廉·布萊克|William Blake|1757|英國詩人與畫家，《天真與經驗之歌》作者|弗里德里希·恩格斯|Friedrich Engels|1820|德國思想家，與馬克思共同撰寫《共產黨宣言》|克勞德·李維史陀|Claude Lévi-Strauss|1908|法國人類學家，結構主義的代表
11-29|路易莎·梅·奧爾柯特|Louisa May Alcott|1832|美國作家，《小婦人》作者|C·S·路易斯|C. S. Lewis|1898|英國作家，《納尼亞傳奇》作者|克里斯蒂安·都卜勒|Christian Doppler|1803|奧地利物理學家，提出都卜勒效應
11-30|馬克·吐溫|Mark Twain|1835|美國作家，《湯姆歷險記》作者|溫斯頓·邱吉爾|Winston Churchill|1874|英國首相，諾貝爾文學獎得主|強納森·斯威夫特|Jonathan Swift|1667|愛爾蘭作家，《格列佛遊記》作者
`);
