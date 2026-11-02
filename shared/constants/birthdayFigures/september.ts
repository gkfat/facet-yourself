import { parseFigureTable } from './parse';

/** MM-DD|name|English name|year|role, three times */
export const SEPTEMBER_FIGURES = parseFigureTable(`
09-01|艾德加·萊斯·巴勒斯|Edgar Rice Burroughs|1875|美國作家，《泰山》系列作者|恩格爾貝特·漢伯丁克|Engelbert Humperdinck|1854|德國作曲家，歌劇《糖果屋》作者|法蘭西斯·威廉·阿斯頓|Francis William Aston|1877|英國化學家，諾貝爾化學獎得主
09-02|威廉·奧斯特瓦爾德|Wilhelm Ostwald|1853|德國化學家，諾貝爾化學獎得主|莉莉烏卡拉尼|Liliʻuokalani|1838|夏威夷王國末代女王|克莉絲塔·麥考利芙|Christa McAuliffe|1948|美國教師，挑戰者號太空梭任務專家
09-03|弗里茨·普雷格爾|Fritz Pregl|1869|奧地利化學家，諾貝爾化學獎得主|路易斯·蘇利文|Louis Sullivan|1856|美國建築師，「形隨機能」的倡導者|愛德華多·加萊亞諾|Eduardo Galeano|1940|烏拉圭作家，《拉丁美洲被切開的血管》作者
09-04|安東·布魯克納|Anton Bruckner|1824|奧地利作曲家，交響曲大師|馬克斯·德爾布呂克|Max Delbrück|1906|德裔美籍生物學家，諾貝爾獎得主|弗朗索瓦-勒內·德·夏多布里昂|François-René de Chateaubriand|1768|法國作家，浪漫主義的先驅
09-05|約翰·凱吉|John Cage|1912|美國作曲家，《4 分 33 秒》作者|路易十四|Louis XIV|1638|法國國王，「太陽王」|托馬索·康帕內拉|Tommaso Campanella|1568|義大利哲學家，《太陽城》作者
09-06|約翰·道爾頓|John Dalton|1766|英國化學家，提出原子學說|珍·亞當斯|Jane Addams|1860|美國社會改革家，諾貝爾和平獎得主|拉斐特侯爵|Marquis de Lafayette|1757|法國軍官，美國獨立戰爭的盟友
09-07|伊莉莎白一世|Elizabeth I|1533|英國女王，黃金時代的君主|布豐|Comte de Buffon|1707|法國博物學家，《自然史》作者|巴迪·哈利|Buddy Holly|1936|美國搖滾歌手，搖滾樂的先驅
09-08|安東寧·德沃札克|Antonín Dvořák|1841|捷克作曲家，《新世界交響曲》作者|理查一世|Richard I|1157|英格蘭國王，「獅心王」|彼得·賽勒斯|Peter Sellers|1925|英國喜劇演員，《粉紅豹》主演
09-09|黎胥留|Cardinal Richelieu|1585|法國樞機主教與首席大臣|威廉·布萊|William Bligh|1754|英國海軍軍官，邦蒂號事件的船長|哈蘭·桑德斯|Harland Sanders|1890|美國企業家，肯德基的創辦人
09-10|查爾斯·桑德斯·皮爾斯|Charles Sanders Peirce|1839|美國哲學家，實用主義的創始人|亞瑟·康普頓|Arthur Compton|1892|美國物理學家，諾貝爾獎得主|阿諾·帕爾默|Arnold Palmer|1929|美國高爾夫球員
09-11|歐·亨利|O. Henry|1862|美國作家，《最後一片葉子》作者|D·H·勞倫斯|D. H. Lawrence|1885|英國作家，《查泰萊夫人的情人》作者|詹姆斯·金斯|James Jeans|1877|英國物理學家與天文學家
09-12|理查·加特林|Richard Gatling|1818|美國發明家，加特林機槍的設計者|H·L·孟肯|H. L. Mencken|1880|美國記者與評論家|傑西·歐文斯|Jesse Owens|1913|美國田徑選手，1936 年奧運四面金牌
09-13|羅爾德·達爾|Roald Dahl|1916|英國作家，《查理與巧克力工廠》作者|克拉拉·舒曼|Clara Schumann|1819|德國鋼琴家與作曲家|約翰·潘興|John J. Pershing|1860|美國將軍，美國遠征軍的統帥
09-14|伊凡·巴夫洛夫|Ivan Pavlov|1849|俄國生理學家，發現條件反射|亞歷山大·馮·洪堡|Alexander von Humboldt|1769|德國博物學家與探險家|亨里克斯·科爾內利烏斯·阿格里帕|Heinrich Cornelius Agrippa|1486|德國神學家與神祕主義作家
09-15|阿嘉莎·克莉絲蒂|Agatha Christie|1890|英國作家，推理小說女王|弗朗索瓦·德·拉羅什富科|François de La Rochefoucauld|1613|法國作家，《箴言錄》作者|詹姆斯·費尼莫爾·庫柏|James Fenimore Cooper|1789|美國作家，《最後的摩根戰士》作者
09-16|蘿倫·白考兒|Lauren Bacall|1924|美國演員，《逃亡》女主角|B·B·金|B. B. King|1925|美國藍調吉他手|法蘭西斯·帕克曼|Francis Parkman|1823|美國歷史學家，《奧勒岡小徑》作者
09-17|弗里德里希·馮·施托伊本|Friedrich Wilhelm von Steuben|1730|普魯士軍官，訓練美國大陸軍|威廉·卡洛斯·威廉斯|William Carlos Williams|1883|美國詩人與醫師|孔多塞侯爵|Marquis de Condorcet|1743|法國數學家與思想家
09-18|塞繆爾·詹森|Samuel Johnson|1709|英國作家，《英語大辭典》編者|葛麗泰·嘉寶|Greta Garbo|1905|瑞典裔美籍演員|萊昂·傅科|Léon Foucault|1819|法國物理學家，傅科擺的發明者
09-19|威廉·高汀|William Golding|1911|英國作家，《蒼蠅王》作者|亨利三世|Henry III of France|1551|法國國王|亞瑟·拉克姆|Arthur Rackham|1867|英國插畫家，《愛麗絲夢遊仙境》插圖作者
09-20|蘇菲亞·羅蘭|Sophia Loren|1934|義大利演員，奧斯卡最佳女主角得主|厄普頓·辛克萊|Upton Sinclair|1878|美國作家，《屠場》作者|喬治·R·R·馬丁|George R. R. Martin|1948|美國作家，《冰與火之歌》作者
09-21|赫伯特·喬治·威爾斯|H. G. Wells|1866|英國作家，《時間機器》作者|史蒂芬·金|Stephen King|1947|美國作家，恐怖小說大師|李歐納·柯恩|Leonard Cohen|1934|加拿大詩人與歌手
09-22|麥可·法拉第|Michael Faraday|1791|英國物理學家與化學家，電磁學的奠基者|克利夫斯的安妮|Anne of Cleves|1515|英格蘭國王亨利八世的第四任王后|尼克·凱夫|Nick Cave|1957|澳洲音樂人與作家
09-23|沃爾特·李普曼|Walter Lippmann|1889|美國作家與評論家，普立茲獎得主|約翰·柯川|John Coltrane|1926|美國爵士薩克斯風手|胡立歐·伊格萊西亞斯|Julio Iglesias|1943|西班牙歌手
09-24|F·史考特·費茲傑羅|F. Scott Fitzgerald|1896|美國作家，《大亨小傳》作者|吉姆·韓森|Jim Henson|1936|美國木偶師，大青蛙科米特的創造者|吉羅拉莫·卡爾達諾|Gerolamo Cardano|1501|義大利數學家與醫師
09-25|威廉·福克納|William Faulkner|1897|美國作家，諾貝爾文學獎得主|顧爾德|Glenn Gould|1932|加拿大鋼琴家，詮釋巴哈名作|德米特里·蕭士塔高維契|Dmitri Shostakovich|1906|蘇聯作曲家
09-26|喬治·蓋希文|George Gershwin|1898|美國作曲家，《藍色狂想曲》作者|T·S·艾略特|T. S. Eliot|1888|英裔美籍詩人，《荒原》作者|約翰尼·蘋果籽|Johnny Appleseed|1774|美國拓荒者，以種植蘋果樹聞名
09-27|山謬·亞當斯|Samuel Adams|1722|美國開國元勳，波士頓茶黨的領導者之一|艾爾弗雷德·塞耶·馬漢|Alfred Thayer Mahan|1840|美國海軍軍官，《海權論》作者|路易十三|Louis XIII|1601|法國國王，與黎胥留共同治理
09-28|普羅斯佩·梅里美|Prosper Mérimée|1803|法國作家，《卡門》作者|喬治·克里孟梭|Georges Clemenceau|1841|法國總理，第一次世界大戰的領導者|碧姬·芭杜|Brigitte Bardot|1934|法國演員與動物保護運動者
09-29|米格爾·德·塞萬提斯|Miguel de Cervantes|1547|西班牙作家，《唐吉訶德》作者|霍雷肖·納爾遜|Horatio Nelson|1758|英國海軍上將，特拉法加海戰的統帥|恩里科·費米|Enrico Fermi|1901|義大利物理學家，建造首座核反應爐
09-30|魯米|Rumi|1207|波斯詩人與蘇非神祕主義者|楚門·卡波提|Truman Capote|1924|美國作家，《蒂芙尼的早餐》作者|尚·佩蘭|Jean Perrin|1870|法國物理學家，諾貝爾獎得主
`);
