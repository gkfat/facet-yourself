import { parseFigureTable } from './parse';

/** MM-DD|name|English name|year|role, three times */
export const JUNE_FIGURES = parseFigureTable(`
06-01|瑪麗蓮·夢露|Marilyn Monroe|1926|美國演員，好萊塢的文化象徵|摩根·費里曼|Morgan Freeman|1937|美國演員，奧斯卡獎得主|約翰·梅斯菲爾德|John Masefield|1878|英國桂冠詩人
06-02|薩德侯爵|Marquis de Sade|1740|法國作家與貴族|愛德華·艾爾加|Edward Elgar|1857|英國作曲家，《謎語變奏曲》作者|湯瑪斯·哈代|Thomas Hardy|1840|英國作家，《黛絲姑娘》作者
06-03|艾倫·金斯堡|Allen Ginsberg|1926|美國詩人，《嚎叫》作者|約瑟芬·貝克|Josephine Baker|1906|美裔法國歌舞表演者與抵抗運動者|喬治五世|George V|1865|英國國王，溫莎王朝的創立者
06-04|喬治三世|George III|1738|英國國王，在位期間美國獨立|露絲·魏斯海默|Ruth Westheimer|1928|德裔美國性治療師與電視名人|安潔莉娜·裘莉|Angelina Jolie|1975|美國演員與人道主義者
06-05|亞當·斯密|Adam Smith|1723|蘇格蘭經濟學家，《國富論》作者|約翰·梅納德·凱因斯|John Maynard Keynes|1883|英國經濟學家，宏觀經濟學的奠基者|費德里科·加西亞·洛爾卡|Federico García Lorca|1898|西班牙詩人與劇作家
06-06|湯瑪斯·曼|Thomas Mann|1875|德國作家，《魔山》作者|亞歷山大·普希金|Alexander Pushkin|1799|俄國詩人，俄國近代文學之父|迭戈·委拉斯開茲|Diego Velázquez|1599|西班牙畫家，《宮娥》作者
06-07|保羅·高更|Paul Gauguin|1848|法國畫家，後印象派代表|迪恩·馬丁|Dean Martin|1917|美國歌手與演員|潔西卡·坦迪|Jessica Tandy|1909|英國演員，奧斯卡最佳女主角得主
06-08|法蘭克·洛伊·萊特|Frank Lloyd Wright|1867|美國建築師，有機建築的倡導者|羅伯特·舒曼|Robert Schumann|1810|德國作曲家，《兒時情景》作者|喬凡尼·卡西尼|Giovanni Cassini|1625|義大利裔法國天文學家，發現土星環縫
06-09|喬治·史蒂芬生|George Stephenson|1781|英國工程師，「鐵路之父」|柯爾·波特|Cole Porter|1891|美國作曲家，《夜與日》作者|彼得大帝|Peter the Great|1672|俄國沙皇，推動俄國西化
06-10|古斯塔夫·庫爾貝|Gustave Courbet|1819|法國畫家，寫實主義的領袖|茱蒂·嘉蘭|Judy Garland|1922|美國演員與歌手，《綠野仙蹤》主演|嚎狼|Howlin' Wolf|1910|美國藍調歌手與吉他手
06-11|雅克·庫斯托|Jacques Cousteau|1910|法國海洋探險家，水肺的共同發明者|理查·史特勞斯|Richard Strauss|1864|德國作曲家，《查拉圖斯特拉如是說》作者|約翰·康斯特勃|John Constable|1776|英國畫家，風景畫大師
06-12|安妮·法蘭克|Anne Frank|1929|德裔猶太少女，《安妮日記》作者|喬治·赫伯特·沃克·布希|George H. W. Bush|1924|美國第 41 任總統|查爾斯·金斯利|Charles Kingsley|1819|英國作家，《水孩兒》作者
06-13|威廉·巴特勒·葉慈|W. B. Yeats|1865|愛爾蘭詩人，諾貝爾文學獎得主|詹姆斯·克拉克·馬克士威|James Clerk Maxwell|1831|蘇格蘭物理學家，建立電磁理論|桃樂絲·L·塞耶斯|Dorothy L. Sayers|1893|英國推理作家，彼得·溫西爵爺的創造者
06-14|切·格瓦拉|Che Guevara|1928|阿根廷出生的革命家|哈莉特·比徹·斯托|Harriet Beecher Stowe|1811|美國作家，《湯姆叔叔的小屋》作者|夏爾-奧古斯丹·庫侖|Charles-Augustin de Coulomb|1736|法國物理學家，提出庫侖定律
06-15|愛德華·葛利格|Edvard Grieg|1843|挪威作曲家，《皮爾·金特》配樂作者|雅克·馬凱特|Jacques Marquette|1637|法國傳教士與探險家，探索密西西比河|威利·尼爾森|Willie Nelson|1933|美國鄉村歌手
06-16|史丹·勞萊|Stan Laurel|1890|英國喜劇演員，勞萊與哈台組合成員|凱瑟琳·葛蘭姆|Katharine Graham|1917|美國出版人，《華盛頓郵報》的掌舵者|喬伊斯·卡洛爾·歐茲|Joyce Carol Oates|1938|美國作家
06-17|伊戈爾·史特拉汶斯基|Igor Stravinsky|1882|俄裔作曲家，《春之祭》作者|愛德華一世|Edward I|1239|英格蘭國王，征服威爾斯|M·C·埃舍爾|M. C. Escher|1898|荷蘭版畫家，以錯視與無限圖形聞名
06-18|保羅·麥卡尼|Paul McCartney|1942|英國音樂人，披頭四成員|安娜塔西亞·尼古拉耶芙娜|Anastasia Nikolaevna|1901|俄國末代沙皇的么女|羅傑·伊伯特|Roger Ebert|1942|美國影評人，普立茲獎得主
06-19|布萊茲·帕斯卡|Blaise Pascal|1623|法國數學家與哲學家，《思想錄》作者|盧·賈里格|Lou Gehrig|1903|美國棒球員，以連續出賽紀錄聞名|薩爾曼·魯西迪|Salman Rushdie|1947|英裔印度作家，《午夜之子》作者
06-20|雅克·奧芬巴赫|Jacques Offenbach|1819|德裔法國作曲家，輕歌劇的代表|埃羅爾·弗林|Errol Flynn|1909|澳洲出生的好萊塢演員|奧迪·墨菲|Audie Murphy|1925|美國軍人與演員，二戰獲勳最多的士兵之一
06-21|尚-保羅·沙特|Jean-Paul Sartre|1905|法國哲學家，存在主義的代表|班娜齊爾·布托|Benazir Bhutto|1953|巴基斯坦首位女總理|珍·拉素|Jane Russell|1921|美國演員
06-22|喬治·溫哥華|George Vancouver|1757|英國航海家，探勘北美太平洋沿岸|比利·懷德|Billy Wilder|1906|奧地利裔美籍導演，《熱情如火》作者|亨利·萊德·哈葛德|H. Rider Haggard|1856|英國作家，《所羅門王的寶藏》作者
06-23|艾倫·圖靈|Alan Turing|1912|英國數學家，電腦科學的奠基者|讓·阿努伊|Jean Anouilh|1910|法國劇作家，《安蒂岡妮》作者|威爾瑪·魯道夫|Wilma Rudolph|1940|美國田徑選手，一屆奧運三面金牌
06-24|安布羅斯·比爾斯|Ambrose Bierce|1842|美國作家，《魔鬼辭典》作者|傑克·鄧普西|Jack Dempsey|1895|美國拳擊手，世界重量級冠軍|里奧內爾·梅西|Lionel Messi|1987|阿根廷足球員
06-25|安東尼·高第|Antoni Gaudí|1852|西班牙建築師，聖家堂的設計者|喬治·歐威爾|George Orwell|1903|英國作家，《一九八四》作者|路易·蒙巴頓|Louis Mountbatten|1900|英國海軍上將，末任印度總督
06-26|威廉·湯姆森（開爾文勛爵）|William Thomson (Lord Kelvin)|1824|英國物理學家，絕對溫標以他命名|賽珍珠|Pearl S. Buck|1892|美國作家，《大地》作者，諾貝爾文學獎得主|夏爾·梅西耶|Charles Messier|1730|法國天文學家，編製梅西耶星表
06-27|海倫·凱勒|Helen Keller|1880|美國作家與教育家，盲聾人權倡議者|班吉姆·錢德拉·查特吉|Bankim Chandra Chattopadhyay|1838|印度作家，《阿難陀寺》作者|查爾斯·帕奈爾|Charles Stewart Parnell|1846|愛爾蘭政治領袖
06-28|尚-雅克·盧梭|Jean-Jacques Rousseau|1712|法國啟蒙思想家，《社會契約論》作者|亨利八世|Henry VIII|1491|英格蘭國王，推動英國宗教改革|理查·羅傑斯|Richard Rodgers|1902|美國作曲家，《真善美》配樂作者
06-29|安東尼·聖修伯里|Antoine de Saint-Exupéry|1900|法國作家，《小王子》作者|威廉·詹姆斯·梅奧|William James Mayo|1861|美國外科醫師，梅奧診所的創辦人之一|喬治·埃勒里·海爾|George Ellery Hale|1868|美國天文學家，建立威爾遜山天文台
06-30|莉娜·霍恩|Lena Horne|1917|美國歌手與民權運動者|查理八世|Charles VIII|1470|法國國王，發動義大利戰爭|麥可·菲爾普斯|Michael Phelps|1985|美國游泳選手，奧運金牌最多的選手
`);
