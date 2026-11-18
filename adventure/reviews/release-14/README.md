# Until We Return, vydání 14

Hra začíná setkáním Alicka s Raynalem na pobřeží a končí návratem pro Henryho a George. Anglické dialogy doprovázejí sedm kapitol, čtrnáct míst a osm pracovních detailů. Po záchraně lze otevřít archivní stůl se svědectvími posádky Invercauldu. Ve staženém vydání rozbalte celý ZIP a otevřete soubor `index.html`. [Vydání ke stažení](https://github.com/OnFiala/auckland-castaways/releases/tag/game-v14) · [Ovládání a návod v angličtině](../../PLAY.txt) · [Časová osa a dramatizace](../../HISTORICAL_ADAPTATION.md)

## Co se změnilo při hraní

- **Cesta k vraku.** Alick zůstane na pláži se správnými předměty i počasím, dokud prohlížeč nerozbalí malbu vraku. Po výpadku umožní **Retry** pokračovat a **Stay here** zůstat. Stejnou ochranu má přechod kapitoly i práce, která mění malbu místnosti. Dokončenou práci lze po přerušení obnovit.
- **Chůze a podoba postav.** Při čekání na kresbu kroku zůstávají boty opřené na stejném místě. Další kliknutí může chůzi obnovit. Opožděná Alickova kresba nepřepíše kapitána po převzetí role v šesté kapitole. Při vědomě zvoleném omezení pohybu se dlouhá chůze vynechá.
- **Předměty v obraze.** Na pláži lze kliknout na postavu sedícího Raynala. Po rozštípání polena zmizí i jeho klikací plocha. U vraku lze vzít za zavěšené lano v místě, kde je opravdu vidět. Na úzké obrazovce lze zvednout kompas v člunu, i když se jeho dotyková plocha částečně překrývá s vodou na dně. Ovládání záchranného kutru a návratového člunu zahrnuje také obrys přídě. [Srovnání klikacích ploch a malby](predmety/README.md)
- **Miska v Epigwaittu.** Kliknutí na malovanou misku, dotyk i Enter otevřou prohlídku střechy. Hráč může sledovat hladinu a odkud přichází kapka. Po opravě si může ověřit suchý okraj. Ohledáním se nespotřebuje předmět vybraný v brašně.
- **Moře a pevné věci.** Pěna nyní obtéká horní hranu balvanu u vraku, skalní výběžek u loděnice a lano v člunu. V kontrolních výřezech je při průchodu vlny vidět pohyb sousední hladiny, zatímco skála či lano drží kresbu. [Porovnání před opravou a po ní](voda/README.md)
- **Místo, rozhovory a návrat.** Název místa je v obraze jednou. Řádek pod malbou označuje předmět pod ukazatelem nebo vybraný nástroj. V šesté kapitole se výprava nakládá na **Invercargill Wharf**. Při záchraně vydá Musgrave pokyn k nalodění až po zavěšení lucerny.

## Uložené hry a vydání

Hostovaná hra zachovává stejnou adresu a stejné klíče pro uložení. Po otevření nového vydání stačí obnovit herní stránku v původním prohlížeči. V **Settings** se zobrazí **Game release 14**. Stav kampaně i rozehraných pracovních detailů zůstává uložený odděleně od grafiky. Stažená hra a hostovaná hra mají vlastní uložení.

Jedno vydání používá vlastní adresář s otiskem obsahu. Ze stejného adresáře pocházejí malby, herní souřadnice, zvuk kapky, písma i seznamy předmětů. Stávající hostovaný balík také ponechává předchozí soubory pod jejich původními adresami pro hráče s dříve otevřenou kartou. [Sestavení a kontrola distribuce](../../tools/build_web.py) · [Kontrolní součty a odkazy](../../tools/verify_web.py)

## Ověření

Zkoušky načítání přerušují načtení a dekódování obrazu při prvním otevření, při cestě, při změně kapitoly i po dokončení práce v detailu. Zkoušky chůze sledují polohu po výpadku, novou volbu cíle a přechod mezi Alickem a Musgravem. Samostatný test zahraje celou logickou cestu přes skutečné obsluhy tlačítek v testovacím DOM. [Načítání](../../tests/scene-loading.test.cjs) · [Chůze a návrat](../../tests/walk-recovery.test.cjs) · [Aktivní plochy](../../tests/hotspots.test.cjs) · [Kampaň](../../tests/voyage-ui.cjs)

Nezávislá výstupní zkouška pro Chromium začíná v rozbaleném ZIPu s čistým profilem. Používá běžné ovládací prvky a ukládá záběry spolu s výsledky. Spravovaný interaktivní náhled vypršel při otevírání spojení na port 4173. [Scénáře prohlížeče](../../tests/browser/README.md)
