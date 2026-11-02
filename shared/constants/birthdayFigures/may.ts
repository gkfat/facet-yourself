import { parseFigureTable } from './parse';

/** MM-DD|name|English name|year|role, three times */
export const MAY_FIGURES = parseFigureTable(`
05-01|約瑟夫·艾迪生|Joseph Addison|1672|英國散文家，創辦《旁觀者》雜誌|聖地牙哥·拉蒙-卡哈爾|Santiago Ramón y Cajal|1852|西班牙神經科學家，諾貝爾獎得主|威靈頓公爵|Duke of Wellington|1769|英國將軍，在滑鐵盧擊敗拿破崙
05-02|凱薩琳大帝|Catherine the Great|1729|俄羅斯女皇|傑羅姆·K·傑羅姆|Jerome K. Jerome|1859|英國作家，《三人同舟》作者|班傑明·斯波克|Benjamin Spock|1903|美國兒科醫師，《斯波克育兒經》作者
05-03|尼可洛·馬基維利|Niccolò Machiavelli|1469|義大利思想家，《君王論》作者|果爾達·梅爾|Golda Meir|1898|以色列第四任總理|皮特·西格|Pete Seeger|1919|美國民謠歌手與社運人士
05-04|奧黛麗·赫本|Audrey Hepburn|1929|英國演員，《羅馬假期》主角，也是聯合國親善大使|湯瑪斯·赫胥黎|Thomas Huxley|1825|英國生物學家，達爾文的捍衛者|賀拉斯·曼|Horace Mann|1796|美國教育改革家
05-05|卡爾·馬克思|Karl Marx|1818|德國哲學家與經濟學家，《資本論》作者|索倫·齊克果|Søren Kierkegaard|1813|丹麥哲學家，存在主義的先驅|妮麗·布萊|Nellie Bly|1864|美國記者，以調查報導與環遊世界聞名
05-06|西格蒙德·佛洛伊德|Sigmund Freud|1856|奧地利精神分析學家|羅伯特·皮里|Robert Peary|1856|美國探險家，聲稱首先抵達北極點|奧森·威爾斯|Orson Welles|1915|美國導演與演員，《大國民》作者
05-07|彼得·伊里奇·柴可夫斯基|Pyotr Ilyich Tchaikovsky|1840|俄國作曲家，《天鵝湖》作者|羅伯特·白朗寧|Robert Browning|1812|英國詩人|羅賓德拉納特·泰戈爾|Rabindranath Tagore|1861|印度詩人，亞洲首位諾貝爾文學獎得主
05-08|亨利·杜南|Henry Dunant|1828|瑞士商人，紅十字會的創辦人|哈瑞·杜魯門|Harry S. Truman|1884|美國第 33 任總統|大衛·艾登堡|David Attenborough|1926|英國博物學家與自然紀錄片主持人
05-09|約翰·布朗|John Brown|1800|美國廢奴運動者|詹姆斯·馬修·巴利|J. M. Barrie|1860|蘇格蘭作家，《彼得潘》作者|海蒂·拉瑪|Hedy Lamarr|1914|奧地利裔美籍演員與發明家
05-10|佛雷·亞斯坦|Fred Astaire|1899|美國舞者與演員|克勞德·約瑟夫·魯日·德·利爾|Claude Joseph Rouget de Lisle|1760|法國軍官，《馬賽曲》的作者|馬克斯·斯坦納|Max Steiner|1888|奧地利裔美籍電影配樂作曲家
05-11|薩爾瓦多·達利|Salvador Dalí|1904|西班牙畫家，超現實主義的代表|理查·費曼|Richard Feynman|1918|美國物理學家，諾貝爾獎得主|瑪莎·葛蘭姆|Martha Graham|1894|美國舞者與編舞家，現代舞的先驅
05-12|佛羅倫斯·南丁格爾|Florence Nightingale|1820|英國護理學家，現代護理的創始人|愛德華·李爾|Edward Lear|1812|英國詩人與畫家，以打油詩聞名|凱薩琳·赫本|Katharine Hepburn|1907|美國演員，四度獲奧斯卡最佳女主角
05-13|羅奈爾德·羅斯|Ronald Ross|1857|英國醫師，發現瘧疾傳播途徑|喬治·布拉克|Georges Braque|1882|法國畫家，立體主義的創始人之一|史提夫·汪達|Stevie Wonder|1950|美國靈魂樂歌手與音樂人
05-14|湯瑪斯·庚斯博羅|Thomas Gainsborough|1727|英國畫家，肖像與風景畫大師|丹尼爾·法蘭海特|Daniel Fahrenheit|1686|德國物理學家，發明水銀溫度計與華氏溫標|喬治·盧卡斯|George Lucas|1944|美國導演，《星際大戰》作者
05-15|皮耶·居禮|Pierre Curie|1859|法國物理學家，諾貝爾獎得主|L·法蘭克·鮑姆|L. Frank Baum|1856|美國作家，《綠野仙蹤》作者|米哈伊爾·布爾加科夫|Mikhail Bulgakov|1891|俄國作家，《大師與瑪格麗特》作者
05-16|亨利·方達|Henry Fonda|1905|美國演員，《十二怒漢》主角|威廉·H·西華德|William H. Seward|1801|美國國務卿，主導購買阿拉斯加|艾德麗安·里奇|Adrienne Rich|1929|美國詩人與評論家
05-17|愛德華·詹納|Edward Jenner|1749|英國醫師，發明天花疫苗|艾瑞克·薩替|Erik Satie|1866|法國作曲家，《三首裸體舞曲》作者|丹尼斯·霍普|Dennis Hopper|1936|美國演員與導演
05-18|伯特蘭·羅素|Bertrand Russell|1872|英國哲學家，諾貝爾文學獎得主|若望保祿二世|John Paul II|1920|波蘭籍教宗，任期逾二十六年|奧馬爾·海亞姆|Omar Khayyam|1048|波斯詩人與數學家，《魯拜集》作者
05-19|馬爾科姆·X|Malcolm X|1925|美國民權運動領袖|胡志明|Ho Chi Minh|1890|越南政治領袖|穆斯塔法·凱末爾|Mustafa Kemal Atatürk|1881|土耳其共和國的創建者
05-20|約翰·斯圖亞特·密爾|John Stuart Mill|1806|英國哲學家，《論自由》作者|奧諾雷·德·巴爾札克|Honoré de Balzac|1799|法國作家，《人間喜劇》作者|詹姆斯·史都華|James Stewart|1908|美國演員，《生活多美好》主角
05-21|阿爾布雷希特·杜勒|Albrecht Dürer|1471|德國畫家與版畫家，北方文藝復興的代表|伊莉莎白·弗萊|Elizabeth Fry|1780|英國監獄改革家|胖子華勒|Fats Waller|1904|美國爵士鋼琴家與作曲家
05-22|亞瑟·柯南·道爾|Arthur Conan Doyle|1859|英國作家，福爾摩斯的創造者|理查·華格納|Richard Wagner|1813|德國作曲家，《尼伯龍根的指環》作者|勞倫斯·奧立佛|Laurence Olivier|1907|英國演員，莎士比亞戲劇的名家
05-23|卡爾·林奈|Carl Linnaeus|1707|瑞典博物學家，建立生物分類命名法|道格拉斯·費爾班克斯|Douglas Fairbanks|1883|美國默片演員|弗朗茲·梅斯梅爾|Franz Mesmer|1734|德國醫師，提出動物磁性說
05-24|維多利亞女王|Queen Victoria|1819|英國女王，維多利亞時代的象徵|鮑勃·狄倫|Bob Dylan|1941|美國創作歌手，諾貝爾文學獎得主|威廉·吉爾伯特|William Gilbert|1544|英國物理學家，研究磁學的先驅
05-25|拉爾夫·沃爾多·愛默生|Ralph Waldo Emerson|1803|美國思想家，超驗主義的代表|伊戈爾·西科斯基|Igor Sikorsky|1889|俄裔美籍航空工程師，開發實用直升機|邁爾士·戴維斯|Miles Davis|1926|美國爵士小號手
05-26|約翰·韋恩|John Wayne|1907|美國演員，西部片的代表|莎莉·萊德|Sally Ride|1951|美國太空人，首位進入太空的美國女性|艾爾·喬爾森|Al Jolson|1886|美國歌手與演員，《爵士歌手》主演
05-27|伊莎朵拉·鄧肯|Isadora Duncan|1877|美國舞者，現代舞的先驅|瑞秋·卡森|Rachel Carson|1907|美國海洋生物學家，《寂靜的春天》作者|休伯特·韓福瑞|Hubert Humphrey|1911|美國副總統
05-28|伊恩·弗萊明|Ian Fleming|1908|英國作家，詹姆斯·龐德的創造者|派屈克·懷特|Patrick White|1912|澳洲作家，諾貝爾文學獎得主|威廉·皮特|William Pitt the Younger|1759|英國首相，史上最年輕的首相
05-29|約翰·甘迺迪|John F. Kennedy|1917|美國第 35 任總統|G·K·卻斯特頓|G. K. Chesterton|1874|英國作家，《布朗神父》系列作者|派屈克·亨利|Patrick Henry|1736|美國開國元勳，「不自由，毋寧死」的演說者
05-30|米哈伊爾·巴枯寧|Mikhail Bakunin|1814|俄國思想家，無政府主義的代表|梅爾·布蘭克|Mel Blanc|1908|美國配音員，為兔寶寶配音|貝尼·古德曼|Benny Goodman|1909|美國單簧管演奏家，「搖擺樂之王」
05-31|華特·惠特曼|Walt Whitman|1819|美國詩人，《草葉集》作者|克林·伊斯威特|Clint Eastwood|1930|美國演員與導演，多次獲奧斯卡獎|蘭尼埃三世|Rainier III|1923|摩納哥親王，與葛麗絲·凱莉結婚
`);
