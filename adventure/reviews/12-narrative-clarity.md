# 12 — Čitelnost příběhu a obrazových vodítek

Rozsah: `dist/engine.js`, `dist/app.js`, `dist/index.html`, původní malby břehu a tábora, malba postaveného přístřešku, místní historický přehled a posádka. Jde o kontrolu kódu a obrazových podkladů; nikoli o provedený uživatelský test v prohlížeči. V této revizi nejsou změny enginu ani aplikace.

## Co funguje

Závislosti první kapitoly mají jasný konec: lano + bidlo → plachta → střecha a zbylý pruh; železo → bedna → sekera + křesadlo; sekera → třísky → oheň; bidlo + pruh → znamení. Střecha je podmínkou ohně. Signál lze dokončit před ohněm. Předčasně vztyčené bidlo lze vzít zpět z patky, takže nespotřebuje nenávratně nástroj k získání plachty. Existující testy modelu prošly: 13/13, včetně průchodu všemi dosažitelnými stavy a návratu z předčasného vztyčení.

V závěrečném táboře kód skutečně sestavuje **pět postav**: hráče, Henryho a přidané Musgravea, Raynala a George (`app.js`, `worldChanges`). Není třeba přidávat šestého člověka. Hráč je podle README fikční ztvárnění; jeho vizuální slot nenahrazovat dalším Alickovým sprite bez současné změny obsazení. Historický seznam pěti jmen je v [CREW.md](../../research/CREW.md).

Nastavení i README výslovně rozlišují autorskou první noc od přesné rekonstrukce. Engine neobsahuje setkání s Invercauldem ani objev jeho tábora. To odpovídá místnímu [přehledu](../../research/OVERVIEW.md) a [registru fikce](../../research/FACT_INFERENCE_FICTION.md). Není důvod přidávat další historické dějství do tohoto řezu.

## Konkrétní nálezy a malé opravy

### P1 — Sebrané třísky zůstávají nakreslené jako dostupný materiál

`engine.js`, větev `axe + driftwood`, okamžitě přidá třísky do brašny. `app.js`, `worldChanges`, při každém `woodCut` zároveň kreslí na břehu stejnou ikonu `firewood`. Kresba tam zůstane i po vložení celé herní položky do ohniště. Aktivní cíl `driftwood` stále existuje. Vizuální sdělení je tedy „vezmi třísky“, ale interakce vrací jen informaci, že dřevo už je naštípané.

Malá oprava: na břehu ponechat odlišitelný rozštípnutý zbytek kmene nebo třísky po krátké akviziční animaci odstranit. Nezavádět další sběr ani novou položku. Ověřit návrat na břeh po získání i po spotřebování třísek.

### P1 — Henry dává po vložení třísek zastaralou obrazovou radu

`interact(...,'henry','talk')` po dokončení střechy kontroluje jen `fireLit`; dokud oheň nehoří, zobrazuje `firewood`, ačkoli `firewoodPlaced` může být už pravda. S vypnutými titulky dostává hráč znovu obrázek již spotřebované věci místo dalšího kroku. Podobně po hotovém signálu Henry dál ukazuje pruh plátna; Raynal i po zakrytí střechy stále plachtovinu.

Malá oprava: obrazové reakce navázat na aktuální mezistav. Henry: nezaložené palivo → třísky, založené palivo → křesadlo, nezvednutý signál → pruh nebo bidlo podle stavu, vše hotovo → společné gesto / hotovo. Raynal po stavbě → hotovo. Stačí upravit volbu ikony, bez dialogových voleb nebo odstavců.

### P1 — Obraz nápovědy neukazuje existující cíl

`app.js`, `hint`, mapuje `cairn` vždy na `signal`, tedy obrys vztyčené vlajky. Před první stavbou však hráč hledá drobnou kamennou patku. Při vracení předčasně vztyčeného bidla je navíc výsledkem „ruka → hotová vlajka“, ačkoli na místě vlajka dosud není. Pro krb se obdobně používá hořící oheň i před zapálením.

Malá oprava: nápověda má zobrazovat současný vzhled cíle: `cairn` před vztyčením, holý stožár při zpětném odběru, potom stožár s místem pro pruh. U krbu používat kruh kamenů / nehořící ohniště. Stávající rekvizita `cairn` a stav `mast` už existují; není třeba nový systém. Nápovědu následně porovnat se scénou ve všech třech stavech.

### P2 — Příčina ochrany ohně není v malbě vidět

Model vyžaduje střechu, jinak vítr plamen sfoukne. V `camp.png` i `camp-shelter.png` však zůstává ohniště daleko vlevo, plachta pokrývá rám vpravo; poloha ohniště ani jeho ochrana se po stavbě nemění. Kód ukazuje při nezdaru samotnou ikonu plachty, takže vztah těchto vzdálených míst musí hráč domyslet.

Malá oprava: pro blokovaný pokus použít dvoukrokový obraz „plamen sfouknutý větrem → plachta“ a při dokončení střechy krátce ukázat směr závětří mezi stavbou a ohništěm. Pokud se bude retušovat malba, potřebuje ohniště čitelnou závětrnou polohu; nepřesouvat oheň přímo pod nízkou plachtu jen kvůli této hádance. Toto je problém čitelnosti fiktivní kauzality, nikoli tvrzení o historické poloze ohně.

### P2 — Závěrečné shromáždění nemá čitelný příchod

Musgrave, Raynal a George se při `completed` přidají okamžitě; George předtím není v žádné scéně. Po 1,8 s je navíc překryje závěrečný panel (při omezení pohybu ihned). Pětice v implementaci existuje, ale příchod posledního člověka a společný výsledek mohou působit jako náhlá výměna kulis. Po „Zůstat u ohně“ lze odejít na břeh/vrak, kde stále čekají původní Raynal/Musgrave.

Malá oprava: před panelem krátce viditelně seskupit všech pět, George může přijít od okraje obrazu. Při omezení pohybu ukázat statickou celou pětici a umístit panel tak, aby ji nezakrýval. Při následném průzkumu buď odstranit původní cíle postav z jiných scén, nebo ponechat závěr jako zřetelný samostatný tableau. Neměnit hráčovu identitu ani počet přeživších.

## Historické rámování

Stávající upozornění je věcně správné, ale v samotné hře je ukryté v nastavení. Vhodná malá úprava je jediný nenápadný řádek u názvu nebo koncového panelu: „Fikční kapitola inspirovaná Graftonem.“ Rozsáhlé vysvětlování ponechat v nastavení a pramenech. Na obraz znamení nepřidávat odpověď z druhého tábora: takový kontakt není doložen a v tomto příběhu pro něj není místo.

Největší přínos pro nejbližší revizi mají první tři úpravy: opravují konkrétní neshodu mezi stavem hádanky a tím, co obraz radí. Další kapitoly ani textové volby nejsou potřeba.
