import { parseFigureTable } from './parse';

/** MM-DD|name|English name|year|role, three times */
export const JANUARY_FIGURES = parseFigureTable(`
01-01|J·D·塞林格|J. D. Salinger|1919|美國作家，《麥田捕手》作者|E·M·福斯特|E. M. Forster|1879|英國小說家，《印度之旅》作者|保羅·里維爾|Paul Revere|1735|美國獨立戰爭時期的愛國者與銀匠
01-02|艾薩克·阿西莫夫|Isaac Asimov|1920|美國科幻作家，《基地》系列作者|詹姆斯·沃爾夫|James Wolfe|1727|英國將軍，魁北克戰役的統帥|麥可·蒂佩特|Michael Tippett|1905|英國作曲家
01-03|J·R·R·托爾金|J. R. R. Tolkien|1892|英國作家，《魔戒》作者|克萊門特·艾德禮|Clement Attlee|1883|英國首相，推動戰後福利國家|盧克麗霞·莫特|Lucretia Mott|1793|美國廢奴與女權運動者
01-04|路易·布萊葉|Louis Braille|1809|法國教育家，盲人點字系統的發明者|雅各布·格林|Jacob Grimm|1785|德國語言學家，格林童話的編者之一|艾薩克·牛頓|Isaac Newton|1643|英國物理學家與數學家，提出萬有引力定律（新曆）
01-05|沙賈汗|Shah Jahan|1592|蒙兀兒帝國皇帝，下令興建泰姬瑪哈陵|金·吉列|King C. Gillette|1855|美國發明家，推廣可替換刀片的安全刮鬍刀|安伯托·艾可|Umberto Eco|1932|義大利作家與符號學家，《玫瑰的名字》作者
01-06|海因里希·施里曼|Heinrich Schliemann|1822|德國考古學家，挖掘特洛伊遺址|卡爾·桑德堡|Carl Sandburg|1878|美國詩人，普立茲獎得主|紀伯倫|Kahlil Gibran|1883|黎巴嫩詩人與畫家，《先知》作者
01-07|米勒德·菲爾莫爾|Millard Fillmore|1800|美國第 13 任總統|柴拉·尼爾·赫斯頓|Zora Neale Hurston|1891|美國作家，《他們眼望上蒼》作者|傑拉德·杜瑞爾|Gerald Durrell|1925|英國動物學家與作家
01-08|艾維斯·普里斯萊|Elvis Presley|1935|美國歌手，搖滾樂的代表人物|史蒂芬·霍金|Stephen Hawking|1942|英國理論物理學家，《時間簡史》作者|大衛·鮑伊|David Bowie|1947|英國音樂人與演員
01-09|西蒙·波娃|Simone de Beauvoir|1908|法國哲學家與作家，《第二性》作者|卡雷爾·恰佩克|Karel Čapek|1890|捷克作家，創造「機器人」一詞|理查·尼克森|Richard Nixon|1913|美國第 37 任總統
01-10|芭芭拉·赫普沃斯|Barbara Hepworth|1903|英國雕塑家，抽象雕塑的代表人物|吉姆·克羅齊|Jim Croce|1943|美國民謠搖滾歌手|洛·史都華|Rod Stewart|1945|英國搖滾歌手
01-11|約翰·麥克唐納|John A. Macdonald|1815|加拿大首任總理|愛麗絲·保羅|Alice Paul|1885|美國婦女參政運動者|阿爾多·利奧波德|Aldo Leopold|1887|美國生態學家，《沙郡年記》作者
01-12|傑克·倫敦|Jack London|1876|美國作家，《野性的呼喚》作者|夏爾·佩羅|Charles Perrault|1628|法國作家，整理《鵝媽媽故事》|村上春樹|Haruki Murakami|1949|日本小說家，《挪威的森林》作者
01-13|威廉·維恩|Wilhelm Wien|1864|德國物理學家，諾貝爾物理學獎得主|霍雷肖·阿爾傑|Horatio Alger|1832|美國作家，寫下無數白手起家的故事|茱莉亞·路易絲-德瑞佛斯|Julia Louis-Dreyfus|1961|美國喜劇演員
01-14|阿爾伯特·史懷哲|Albert Schweitzer|1875|德法籍醫師與神學家，諾貝爾和平獎得主|三島由紀夫|Yukio Mishima|1925|日本小說家，《金閣寺》作者|休·洛夫廷|Hugh Lofting|1886|英國作家，《杜立德醫生》作者
01-15|馬丁·路德·金恩|Martin Luther King Jr.|1929|美國民權運動領袖|莫里哀|Molière|1622|法國劇作家，喜劇大師|賈邁勒·阿卜杜-納賽爾|Gamal Abdel Nasser|1918|埃及總統，阿拉伯民族主義領袖
01-16|蘇珊·桑塔格|Susan Sontag|1933|美國作家與評論家，《論攝影》作者|維托里奧·阿爾菲耶里|Vittorio Alfieri|1749|義大利悲劇劇作家|約翰·卡本特|John Carpenter|1948|美國導演，恐怖片大師
01-17|班傑明·富蘭克林|Benjamin Franklin|1706|美國開國元勳，科學家與發明家|穆罕默德·阿里|Muhammad Ali|1942|美國拳擊手，三度世界重量級冠軍|康斯坦丁·史坦尼斯拉夫斯基|Konstantin Stanislavski|1863|俄國戲劇家，創立表演體系
01-18|孟德斯鳩|Montesquieu|1689|法國啟蒙思想家，提出三權分立|A·A·米恩|A. A. Milne|1882|英國作家，《小熊維尼》作者|賈利·葛倫|Cary Grant|1904|英國出生的好萊塢演員
01-19|埃德加·愛倫·坡|Edgar Allan Poe|1809|美國作家，推理與恐怖小說的先驅|詹姆斯·瓦特|James Watt|1736|蘇格蘭發明家，改良蒸汽機|保羅·塞尚|Paul Cézanne|1839|法國畫家，後印象派代表
01-20|費德里科·費里尼|Federico Fellini|1920|義大利導演，《八部半》作者|安德烈-馬里·安培|André-Marie Ampère|1775|法國物理學家，電磁學先驅|巴茲·艾德林|Buzz Aldrin|1930|美國太空人，第二位登月者
01-21|克里斯汀·迪奧|Christian Dior|1905|法國時裝設計師，創立迪奧品牌|傑克·尼克勞斯|Jack Nicklaus|1940|美國高爾夫球員，贏得 18 座大滿貫|普拉西多·多明哥|Plácido Domingo|1941|西班牙男高音
01-22|喬治·戈登·拜倫|Lord Byron|1788|英國浪漫主義詩人|法蘭西斯·培根|Francis Bacon|1561|英國哲學家，提倡經驗主義|喬治·巴蘭欽|George Balanchine|1904|俄裔美籍編舞家，現代芭蕾奠基者
01-23|愛德華·馬奈|Édouard Manet|1832|法國畫家，印象派的先驅|史湯達爾|Stendhal|1783|法國作家，《紅與黑》作者|約翰·漢考克|John Hancock|1737|美國獨立宣言的第一位簽署者
01-24|腓特烈二世|Frederick the Great|1712|普魯士國王，史稱腓特烈大帝|伊迪絲·華頓|Edith Wharton|1862|美國作家，普立茲獎首位女性得主|尼爾·戴蒙|Neil Diamond|1941|美國創作歌手
01-25|羅伯特·伯恩斯|Robert Burns|1759|蘇格蘭國民詩人，《友誼萬歲》作詞者|維吉尼亞·吳爾芙|Virginia Woolf|1882|英國作家，意識流小說的代表|威廉·薩默塞特·毛姆|W. Somerset Maugham|1874|英國小說家，《月亮與六便士》作者
01-26|道格拉斯·麥克阿瑟|Douglas MacArthur|1880|美國五星上將|保羅·紐曼|Paul Newman|1925|美國演員與賽車手，也投入慈善|安潔拉·戴維斯|Angela Davis|1944|美國政治運動者與學者
01-27|沃夫岡·阿瑪迪斯·莫札特|Wolfgang Amadeus Mozart|1756|奧地利作曲家，古典主義代表|路易斯·卡羅|Lewis Carroll|1832|英國作家與數學家，《愛麗絲夢遊仙境》作者|傑羅姆·克恩|Jerome Kern|1885|美國作曲家，音樂劇先驅
01-28|傑克遜·波洛克|Jackson Pollock|1912|美國畫家，抽象表現主義代表|亞瑟·魯賓斯坦|Arthur Rubinstein|1887|波蘭裔美籍鋼琴家|亨利七世|Henry VII|1457|英格蘭國王，都鐸王朝的創立者
01-29|安東·契訶夫|Anton Chekhov|1860|俄國劇作家與短篇小說家|湯瑪斯·潘恩|Thomas Paine|1737|英裔美國思想家，《常識》作者|羅曼·羅蘭|Romain Rolland|1866|法國作家，諾貝爾文學獎得主
01-30|富蘭克林·D·羅斯福|Franklin D. Roosevelt|1882|美國第 32 任總統|芭芭拉·塔克曼|Barbara Tuchman|1912|美國歷史學家，《八月炮火》作者|金·哈克曼|Gene Hackman|1930|美國演員，奧斯卡獎得主
01-31|法蘭茲·舒伯特|Franz Schubert|1797|奧地利作曲家，藝術歌曲大師|諾曼·梅勒|Norman Mailer|1923|美國作家，普立茲獎得主|傑基·羅賓森|Jackie Robinson|1919|美國棒球員，打破大聯盟的種族隔離
`);
