# Souřadnice rukou, podkladů a rekvizit

Kontrola ze dne 18. listopadu 2026 vychází ze souborů, které načítá hra. V Pillow jsme na exportované obrazy složili pracovní pózy a předměty se stejným výřezem, otočením, poměrem stran a hloubkovým měřítkem jako v místnosti. Souřadnice níže jsou procenta rámu zleva a shora. Kontrola proběhla bez prohlížeče.

| Kapitola | Ověřený úkon a výsledek |
| --- | --- |
| 1 · Grafton | Z místa (63,9; 76,1) Alick dosáhne k přední stěně bedny. Po otevření bylo možné zkoumat spodní prkna, ale kliknutí na zvednuté víko v (73,8; 39,2) minulo předmět. Pole nyní sahá až k hornímu okraji otevřeného víka. Nohy zůstávají na stejném místě. |
| 2 · Zimní potok | V poloze (28,8; 72) má Alick koleno na břehu a přední ruku nad tůní pod dvojicí pramínků. Při práci s čutorou není nutné vstoupit do vody. V chatě stojí u lůžka před provazovou hranou matrace. |
| 3 · Výheň | Při práci na kovadlině dopadá natažená ruka na horní plochu železa. V detailu vrtání odpovídají různé aktivní body hlubokému otvoru, povrchovému škrábnutí a ostří nástroje. |
| 4 · Člun na špalkách | Alick bere kostru za horní okraj. Jeho chodidla jsou před podpěrou. Zvětšený pohled na přibíjení prkna používá aktuální obraz člunu. |
| 5 · Plavba | Při dotažení lana leží zavřená ruka Alicka na levém ze dvou šikmých lan nad bortem. Detail vedení lana rozlišuje oko plachty, dvě průchodky a volný konec. |
| 6 · Zásoby na cestu zpět | Pytel původně visel přes mezeru mezi sudem a bednou v přístavu. Nyní má střed v (80,2; 55,5), dno leží na víku a Musgrave k němu přistupuje z (73,1; 74,5). Velikost pytle zůstala stejná. Na mapovém stole leží mapa i deník v dosahu. |
| 7 · Přistání | Pod kýl člunu zasahuje mělká voda. Musgrave bere člun za horní okraj z místa na suchém pobřeží. Po úpravě přílivu jsme porovnali pixely obou exportů. Celá průchozí plocha, horní hrana člunu a kruh na kůlu zůstaly shodné. U značky dosáhne na dřevo kůlu. Poutko zavěšené lampy nyní protíná namalovaný železný kruh v (77,8; 31,5). Předchozí poloha lampy byla pod kruhem a vlevo od něj. |

**Rozsah.** Výběr obrazu ze všech jednotlivých stavových příznaků dal 22 různých obrazů ve 14 místnostech. Všech 90 ověřených kombinací cíle a pracovního stanoviště leželo v příslušném průchozím polygonu. Testy prošly 1 589 tras včetně 248 obcházek. Rekvizity používají souřadnice z celé scény 16:9. Sedm samostatných pracovních detailů má vlastní souřadnice 3:2. U detailů jsme porovnali měřené body s malbou a spustili herní testy pro pokus, omyl, návrat a načtení pozice.

**Reprodukce.** Z adresáře `adventure` spusťte `node --test tests/staging.test.cjs tests/crew.test.cjs tests/stage-life.test.cjs tests/fieldwork.test.cjs tests/fieldwork-ui.test.cjs tests/working-art.test.cjs tests/voyage-ui.cjs`. Všech 52 testů prošlo. Regresní testy zvlášť ověřují kliknutí na víko a čelo otevřené bedny, velikost pytle vzhledem k horní ploše bedny a polohu lampy u kruhu. Pracovní makrodetail bedny má výrazný železný pás a zářez. V celkovém pohledu na vrak jsou vedle diagonální dřevěné výztuhy nově vidět kování a zářez na hraně víka. Po otevření zůstane na přední stěně jeho protikus.
