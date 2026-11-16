# Výtvarný směr: první noc

Vstupní revize, 16. listopadu 2026. Rozsah: `dist/index.html`, `style.css`, `app.js`, `art.js`, `engine.js` a přímá obrazová kontrola `beach.png`, `wreck.png`, `camp.png`, `sailor.png`, `people/raynal.png`, `props/tools.png`. Tento dokument hodnotí výchozí stav před dokončením souběžných úprav. Nejde o závěrečné schválení výsledného sestavení v prohlížeči.

## Záměr

Zachovat tichou, malovanou adventuru o práci rukama. Prostředí vede pohled, předmět vysvětluje svou funkci a krátké gesto sdělí výsledek. Inspiraci obrazovým vyprávěním a úsporností Machinaria přenést do vlastního námořnického světa: žádné převzaté postavy, stavby nebo rozvržení jeho obrazovek. Výtvarná kvalita se musí týkat stejně postav, předmětů, horní lišty, inventáře i otevřeného nastavení.

Pozadí již mají dobrou materiálovou základnu: viditelnou kresbu, drsný papír, tlumené moře, zvětralé dřevo a přirozenou vegetaci. Největší rychlé zlepšení přinese sjednocení rozhraní s těmito materiály. Nový rám nemá působit jako zdobený fantasy panel ani jako naleštěná zlatá palubní deska.

## Pět zásahů v pořadí dopadu

1. **Odstranit zelený nádech celé soustavy UI.** Nahradit nejen `.game-header` a `.inventory-bar`, ale také `.interaction-line`, `.thought`, `.caption`, `.first-hint`, `.exit`, `dialog`, `.completion`, tlačítka, hranice a stíny. Použít teplý inkoust, tmavé dřevo a přírodní plátno. Zelenou ponechat rostlinám a případně oděvu ve scéně. Nepřetónovat celé obrazy do sépie.
2. **Proměnit inventář v materiální součást hry.** Mělká dřevěná nebo plátěná přihrádka, tmavší okraj a klidné světlé lůžko pod předměty. U vybrané věci viditelný světlý podklad a jednoznačný obrys; bez světelného zlatého oblaku. Prázdné přihrádky ustoupí obrazu. Malby musí zůstat čitelné při skutečných 43–64 px, zejména bidlo a páka.
3. **Sjednotit cíle a ovládací ikony.** Současná trojice cílů míchá obrys přístřešku/vlajky s plnobarevnou malbou ohně. Všechny tři cíle kreslit jedním inkoustovým rukopisem a stejnou vizuální váhou. Splnění ukázat vyplněním či drobnou značkou, ne různými efekty. Nahradit nesourodé znaky `☝`, `⌘`, `◉`, `☷` vlastními jednoduchými kresbami ruky, oka a nabídky; jejich funkce musí zůstat srozumitelná.
4. **Modaly musí patřit do stejné hry.** Nastavení, obrazová nápověda, pomoc, restart a dokončení použijí stejný papír, inkoust a konstrukci tlačítek. Méně rámečků uvnitř rámečků. Papír může mít jemně nepravidelný okraj a kreslený symbol, ale text ani ovládání nesmí být vypálené do obrázku. Obrazová nápověda má ukazovat tytéž předměty jako inventář.
5. **Dorovnat malby v herním měřítku.** `tools.png` má ostřejší detail a větší lokální kontrast než pozadí; posuzovat rekvizity vložené do scény, nikoli podle atraktivního atlasu. Sjednotit měkkost okrajů, barevnost stínu a kontakt se zemí. Hráč a Raynal mají slučitelnou kresbu, ale jejich skutečnou velikost, světlo a chodidla je nutné ověřit ve všech třech místnostech. Zachovat jediný registr malby pro scénu, inventář, kurzor a nápovědu.

## Paleta a materiálová hierarchie

Barvy jsou návrhové referenční hodnoty, nikoli povinné přebarvení existujících maleb.

| Role | Referenční barva | Použití |
|---|---|---|
| Hluboký teplý stín | `#221B17` | Okolí hry, spáry, ztmavení za modalem |
| Ořechové dřevo | `#403025` | Horní lišta a nosný rám inventáře |
| Opotřebené dřevo | `#74573D` | Úzké hrany a malé viditelné plochy |
| Režné plátno | `#D8C7A6` | Lůžka předmětů, drobná vysvětlení |
| Světlý papír | `#EADCC0` | Čitelná plocha dialogů, vybraný předmět |
| Teplý inkoust | `#372B25` | Text a kreslené značky na světlém podkladu |
| Opotřebené železo | `#736D64` | Neaktivní drobné kování; žádný chrom |
| Tlumená mosaz | `#897247` | Několik nýtů a jemných hran, malá plocha |
| Studená břidlice | `#617581` | Moře a vzdálenost; případný chladný akcent |
| Žár | `#B76537` | Skutečný oheň a velmi střídmá pozitivní odezva |

Rozdělení pozornosti: nejdříve scéna, potom aktivní předmět a reakce postavy, nakonec rám a ovládání. Dřevěná kresba v lištách má menší kontrast než samotné předměty. Papírová textura pod textem má být téměř neznatelná. Mosaz není náhradou za dřívější zelenou na všech plochách.

## Konkrétní pravidla jednotlivých částí

| Část | Cílová podoba a kontrola |
|---|---|
| Horní lišta | Úzké zvětralé dřevo; malý čitelný název; tři stejně velké skici cílů. Jeden druh zapuštěného tlačítka. Žádné velké ornamenty či dekorace soutěžící se scénou. |
| Spodní lišta | Souvislá přihrádka s opotřebeným lemem. Inventář má výraznější předměty než své prázdné buňky. Text aktuální akce se nesmí ztratit mezi dvěma podobnými hnědými plochami. |
| Výběr předmětu | Stejná malba beze změny odstínu; světlé plátěné lůžko, tmavá čitelná hrana, zachovaný stav `aria-pressed`. Hover, trvalý výběr a klávesový focus musí být vzájemně rozeznatelné. |
| Piktogramy a cíle | Kresba teplým inkoustem, mírně nepravidelný tah, společná tloušťka a optická velikost. Čitelnost při malém rozměru má přednost před dekorativními detaily. Použít obrysovou kresbu pro abstraktní povely; plnou malbu pro konkrétní předmět. |
| Myšlenková bublina | Jeden jednoduchý papírový tvar. Jeden předmět nebo krátká dvojice s vazbou; ne mřížka symbolů. Textové reakce zůstávají volitelné. |
| Nápověda | Obrazový sled věc → cíl; stejné výřezy jako ve hře. Název místa pouze jako orientační doplněk. Pro „spoj“ ukázat obě vstupní malby i výslednou věc. |
| Nastavení a restart | Obyčejný list s klidným okrajem. Čitelné živé nadpisy, stavy přepínačů a jasné zavření. Restart nadále potvrzovat; výtvarná úprava nemá měnit uložený postup. |
| Závěr kapitoly | Obraz lidí u ohně je hlavní odměna. Malý papírový dovětek dovolí vrátit se ke scéně; nepřikrýt dlouhodobě většinu společného ohně velkou slavnostní kartou. |
| Přechody a počasí | Chladné počasí zůstává vlastností okolního světa. Obecné stíny a přechod mezi scénami jsou teplé neutrální. Zapálení ohně má změnit hlavně blízké světlo, ne dát celé scéně výrazný sépiový filtr. |

## Malované prostředí, lidé a předměty

- U pozadí zachovat široký prostor pro chůzi a čitelné siluety vraku, přístřešku a ohniště. Nepřidávat dekorativní nástroje, které vypadají sbíratelně a nemají odpovídající interakci. Vrak již obsahuje namalované lano a zbytky plachty; jejich podobnost s aktivními rekvizitami je třeba prověřit při hře.
- Nové izolované objekty kreslit se stejným rozptýleným zataženým světlem. Nevkládat ostré studiové odlesky, čistou bílou konturu nebo vlastní barevné pozadí. Zobrazení průhlednosti při samostatné kontrole není důkazem halo vady; tu posoudit na světlé i tmavé části skutečné scény.
- Tloušťku kresby a detail hodnotit po zmenšení. Jeden malovaný záhyb může být čitelnější než mnoho tenkých čar. Nástroj musí být rozpoznatelný tvarem; sekera, páka a bidlo nemají splývat do stejné diagonální hnědé čárky.
- U všech pěti mužů udržet stejnou základní světelnost pleti a stejný způsob texturování oděvu, nikoli stejné oblečení. Odlišit siluetu, sklon hlavy a držení těla. Kontaktní stín má sedět těsně pod chodidly a nesmí člověka zabalit do záře.
- Obrázky stavů musí držet registraci: zavření/otevření bedny, prázdný/zakrytý rám, stožár/stožár s vlajkou. Okolní skály a stromy při změně hádanky nemají znatelně poskočit. Po sebrání věci nesmí ve scéně zůstat její namalovaná kopie.
- Výřez jediné postavy rozdělený na trup a nohy je omezená loutková animace. Výkyv držet malý, aby se obrys netrhal. Větší herecké gesto později vyžaduje skutečné nové pózy, ne větší deformaci stejné malby.

## Hranice zásahu a ověření

Výtvarný zásah zachová tři místnosti, sbírání, kombinaci lana s bidlem, páčení bedny, zakrytí přístřešku, přípravu ohně a vztyčení signálu. Zachová klíč ukládání `castaways-adventure-v3`, herní stav verze 3, preference titulků a omezených animací. Samotná proměna UI nevyžaduje restart hry ani migraci příběhu.

Před předáním zkontrolovat obrazy **v prohlížeči**: prázdný inventář; lano + bidlo; vybraný předmět a focus; všechny tři místnosti; otevřená bedna; zakrytý přístřešek; oheň a signál; dokončení; nápověda, pomoc, nastavení a potvrzení restartu. Udělat průchod s titulky i bez nich a s obnoveným rozehraným uložením. Na úzké obrazovce musí malované lišty zachovat tlačítka, horizontální inventář i čitelný výběr. Ověřit, že nové dekorace neodchytávají kliknutí.

Tato revize neposuzuje historickou přesnost oděvů ani identitu portrétů. Malby a hádanky jsou autorskou interpretací, nikoli ověřenou rekonstrukcí první noci. Nebyly v ní zkontrolovány všechny izolované postavy ani všechny obrazy změn prostředí; závěrečná vizuální kontrola celého sestavení zůstává nutná. Změna barev a rámů sama nenahradí nové herecké pózy, ozvučení ani podrobnější animaci.
