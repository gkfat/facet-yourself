import { parseFigureTable } from './parse';

/** MM-DD|name|English name|year|role, three times */
export const JULY_FIGURES = parseFigureTable(`
07-01|黛安娜王妃|Diana, Princess of Wales|1961|英國王妃，投入慈善與人道工作|戈特弗里德·萊布尼茲|Gottfried Wilhelm Leibniz|1646|德國數學家與哲學家，微積分的共同創立者|喬治·桑|George Sand|1804|法國作家，《魔沼》作者
07-02|赫曼·赫塞|Hermann Hesse|1877|德國作家，《徬徨少年時》作者|克里斯托夫·維利巴爾德·格魯克|Christoph Willibald Gluck|1714|德國作曲家，歌劇改革者|瑟古德·馬歇爾|Thurgood Marshall|1908|美國第一位黑人最高法院大法官
07-03|法蘭茲·卡夫卡|Franz Kafka|1883|布拉格作家，《變形記》作者|湯姆·克魯斯|Tom Cruise|1962|美國演員|約翰·辛格頓·科普利|John Singleton Copley|1738|美國畫家，殖民地時期的肖像畫家
07-04|納撒尼爾·霍桑|Nathaniel Hawthorne|1804|美國作家，《紅字》作者|吉娜·羅洛布里吉達|Gina Lollobrigida|1927|義大利演員|卡爾文·柯立芝|Calvin Coolidge|1872|美國第 30 任總統
07-05|P·T·巴納姆|P. T. Barnum|1810|美國馬戲團創辦人與表演家|尚·考克多|Jean Cocteau|1889|法國作家與導演，《美女與野獸》導演|大衛·法拉格特|David Farragut|1801|美國海軍上將，南北戰爭名將
07-06|丹增嘉措|Tenzin Gyatso, the 14th Dalai Lama|1935|第十四世達賴喇嘛，諾貝爾和平獎得主|弗里達·卡蘿|Frida Kahlo|1907|墨西哥畫家，以自畫像聞名|比爾·哈利|Bill Haley|1925|美國搖滾歌手，《Rock Around the Clock》演唱者
07-07|古斯塔夫·馬勒|Gustav Mahler|1860|奧地利作曲家與指揮家|林哥·斯塔爾|Ringo Starr|1940|英國音樂人，披頭四鼓手|馬克·夏卡爾|Marc Chagall|1887|俄裔法國畫家，詩意的色彩大師
07-08|尚·德·拉封丹|Jean de La Fontaine|1621|法國詩人，《拉封丹寓言》作者|約翰·D·洛克斐勒|John D. Rockefeller|1839|美國企業家，標準石油的創辦人|斐迪南·馮·齊柏林|Ferdinand von Zeppelin|1838|德國飛船設計師，硬式飛船的發明者
07-09|伊萊亞斯·豪|Elias Howe|1819|美國發明家，縫紉機的改良者|安·拉德克利夫|Ann Radcliffe|1764|英國作家，哥德小說的先驅|湯姆·漢克斯|Tom Hanks|1956|美國演員，兩度獲奧斯卡最佳男主角
07-10|馬塞爾·普魯斯特|Marcel Proust|1871|法國作家，《追憶似水年華》作者|約翰·加爾文|John Calvin|1509|法國神學家，宗教改革的重要人物|尼古拉·特斯拉|Nikola Tesla|1856|塞爾維亞裔發明家，交流電系統的推動者
07-11|E·B·懷特|E. B. White|1899|美國作家，《夏綠蒂的網》作者|約翰·昆西·亞當斯|John Quincy Adams|1767|美國第 6 任總統|羅伯特一世|Robert the Bruce|1274|蘇格蘭國王，蘇格蘭獨立戰爭的領袖
07-12|亨利·大衛·梭羅|Henry David Thoreau|1817|美國作家，《湖濱散記》作者|巴勃羅·聶魯達|Pablo Neruda|1904|智利詩人，諾貝爾文學獎得主|巴克敏斯特·富勒|Buckminster Fuller|1895|美國建築師與發明家，網格圓頂的設計者
07-13|約翰·迪伊|John Dee|1527|英國數學家與占星家，伊莉莎白一世的顧問|沃萊·索因卡|Wole Soyinka|1934|奈及利亞劇作家，非洲首位諾貝爾文學獎得主|哈里遜·福特|Harrison Ford|1942|美國演員，《印第安納瓊斯》主演
07-14|英格瑪·柏格曼|Ingmar Bergman|1918|瑞典導演，《第七封印》作者|伍迪·蓋瑟瑞|Woody Guthrie|1912|美國民謠歌手，《這是你的土地》作者|傑拉爾德·福特|Gerald Ford|1913|美國第 38 任總統
07-15|林布蘭|Rembrandt|1606|荷蘭畫家，巴洛克黃金時代的代表|伊尼戈·瓊斯|Inigo Jones|1573|英國建築師，把古典建築引進英國|艾瑞絲·梅鐸|Iris Murdoch|1919|愛爾蘭裔英國作家與哲學家
07-16|約書亞·雷諾茲|Joshua Reynolds|1723|英國畫家，皇家藝術學院的首任院長|特呂格韋·賴伊|Trygve Lie|1896|挪威政治家，聯合國首任祕書長|琴吉·羅傑斯|Ginger Rogers|1911|美國舞者與演員
07-17|以撒·華茲|Isaac Watts|1674|英國牧師與詩人，被稱為「英語讚美詩之父」|詹姆斯·賈克奈|James Cagney|1899|美國演員，《小凱撒》主演|施穆埃爾·約瑟夫·亞格農|S. Y. Agnon|1888|以色列作家，諾貝爾文學獎得主
07-18|納爾遜·曼德拉|Nelson Mandela|1918|南非第一位黑人總統，反種族隔離領袖|威廉·梅克皮斯·薩克萊|William Makepeace Thackeray|1811|英國作家，《浮華世界》作者|羅伯特·虎克|Robert Hooke|1635|英國科學家，提出虎克定律
07-19|塞繆爾·柯爾特|Samuel Colt|1814|美國發明家，柯爾特左輪手槍的設計者|愛德加·竇加|Edgar Degas|1834|法國畫家，以芭蕾舞者題材聞名|弗拉基米爾·馬雅可夫斯基|Vladimir Mayakovsky|1893|俄國詩人，未來主義的代表
07-20|佛朗切斯科·佩脫拉克|Petrarch|1304|義大利詩人，人文主義之父|艾德蒙·希拉里|Edmund Hillary|1919|紐西蘭登山家，首位登上聖母峰頂的人之一|格雷戈爾·孟德爾|Gregor Mendel|1822|奧地利修士，遺傳學的奠基者
07-21|厄尼斯特·海明威|Ernest Hemingway|1899|美國作家，《老人與海》作者|保羅·朱利葉斯·路透|Paul Julius Reuter|1816|德裔英國記者，路透社的創辦人|艾薩克·斯特恩|Isaac Stern|1920|美國小提琴家
07-22|弗里德里希·貝塞爾|Friedrich Bessel|1784|德國天文學家，首次測得恆星視差|愛德華·霍普|Edward Hopper|1882|美國畫家，《夜遊者》作者|古斯塔夫·赫茲|Gustav Hertz|1887|德國物理學家，諾貝爾物理學獎得主
07-23|雷蒙·錢德勒|Raymond Chandler|1888|美國作家，硬漢派偵探小說的代表|海爾·塞拉西|Haile Selassie|1892|衣索比亞皇帝|艾蒂安-路易·馬呂斯|Étienne-Louis Malus|1775|法國物理學家，發現光的偏振
07-24|大仲馬|Alexandre Dumas|1802|法國作家，《基督山恩仇記》作者|艾蜜莉亞·艾爾哈特|Amelia Earhart|1897|美國飛行員，首位單人橫越大西洋的女性|西蒙·玻利瓦|Simón Bolívar|1783|拉丁美洲獨立運動領袖
07-25|湯瑪斯·伊肯斯|Thomas Eakins|1844|美國畫家，寫實主義的代表|羅莎琳·富蘭克林|Rosalind Franklin|1920|英國化學家，拍下 DNA 的 X 光繞射照片|埃里克·阿克塞爾·卡爾費爾特|Erik Axel Karlfeldt|1864|瑞典詩人，諾貝爾文學獎得主
07-26|蕭伯納|George Bernard Shaw|1856|愛爾蘭劇作家，諾貝爾文學獎得主|卡爾·榮格|Carl Jung|1875|瑞士心理學家，分析心理學的創始人|奧爾德斯·赫胥黎|Aldous Huxley|1894|英國作家，《美麗新世界》作者
07-27|小仲馬|Alexandre Dumas fils|1824|法國作家，《茶花女》作者|希萊爾·貝洛克|Hilaire Belloc|1870|英法裔作家與歷史學家|碧娜·鮑許|Pina Bausch|1940|德國編舞家，舞蹈劇場的代表
07-28|碧雅翠絲·波特|Beatrix Potter|1866|英國作家與插畫家，《彼得兔》作者|馬塞爾·杜象|Marcel Duchamp|1887|法裔美籍藝術家，現成物藝術的先驅|傑拉德·曼利·霍普金斯|Gerard Manley Hopkins|1844|英國詩人與耶穌會神父
07-29|亞歷西斯·托克維爾|Alexis de Tocqueville|1805|法國思想家，《論美國的民主》作者|達格·哈馬舍爾德|Dag Hammarskjöld|1905|瑞典外交官，聯合國第二任祕書長|布思·塔金頓|Booth Tarkington|1869|美國作家，兩度獲普立茲獎
07-30|亨利·福特|Henry Ford|1863|美國企業家，福特汽車的創辦人|艾蜜莉·勃朗特|Emily Brontë|1818|英國作家，《咆哮山莊》作者|亨利·摩爾|Henry Moore|1898|英國雕塑家
07-31|J·K·羅琳|J. K. Rowling|1965|英國作家，《哈利波特》作者|米爾頓·傅利曼|Milton Friedman|1912|美國經濟學家，諾貝爾獎得主|約翰·艾瑞克森|John Ericsson|1803|瑞典裔美國工程師，設計螺旋槳蒸汽船
`);
