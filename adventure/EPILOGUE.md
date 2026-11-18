# Invercauldské dopisy po skončení hry

Na závěrečné obrazovce po vyzvednutí Henryho a George otevře volba *Open the Invercauld papers* archivní stůl. Hráč si vybere vyobrazený předmět, přečte si, co o něm daný člověk zaznamenal, a vloží lístek do správného dopisu. Na druhém listu přiřadí ke kalendáři ztroskotání, příjezd poškozené lodi Julian a Musgraveovo pozorování z návratu. Nakonec připojí poznámku k místu na skutečné tištěné mapě. Epilog se dá kdykoliv zavřít a v téže relaci znovu otevřít v místě, kde čtenář přestal. Po poslední stránce lze papíry znovu rozložit. Potvrzené spuštění nové hry vyprázdní i stůl epilogu. Uložení hlavní hry se prací v archivu nemění.

## Kdo co vypověděl

| Lístek | Místo v prameni | Co v něm máme |
| --- | --- | --- |
| Sirky stevarda | S002, *Letter from Captain Dalgarno*, dodatek III, první dva odstavce | V dopise majitelům lodi Dalgarno uvádí přibližně dvě libry lodních sucharů a tři libry vepřového pro devatenáct lidí. Stevard zachránil zápalky. I Smith zmiňuje malé množství jídla, proto hru rozlišuje konkrétní vzpomínka na stevarda. [Dopis](https://en.wikisource.org/wiki/Castaway_on_the_Auckland_Isles/Appendix_3) |
| Člun pro dva | S038, *The Mate’s Story*, přetisk 21. října 1865 | Andrew Smith psal manželce o oděvech a člunu z tuleních kůží, cestách za potravou ve dvou za příznivého počasí i následném dřevěném člunu pro tři. Při sběru měkkýšů myslel na ni a na jejich děti. Čten byl indexovaný text novinového přetisku s chybami OCR. Hra parafrázuje. [Papers Past](https://paperspast.natlib.govt.nz/newspapers/ODT18651021.2.18) |
| Rozpad lodi | S002 a S038, začátky dopisů | Noc 10. května 1864. Na palubě bylo 25 lidí, na břeh se dostalo 19. Je lépe ukázat, co kdo mohl odnést nebo postavit, než z rozdílných počtů vyvozovat pořadí schopností kapitánů. [Dalgarno](https://en.wikisource.org/wiki/Castaway_on_the_Auckland_Isles/Appendix_3) · [Smith](https://paperspast.natlib.govt.nz/newspapers/ODT18651021.2.18) |
| Julian připlouvá kvůli opravě | S002, konec dopisu, S038, konec *The Mate’s Story*. Viz také úvod S001 | Květen 1865 a převoz tří mužů do Callaa. Přesný den v podkladech kolísá. Smithův indexovaný přetisk má 10. května, Dalgarno dává uplynulou dobu a úvod vydání uvádí 22. května. K přiřazení stačí měsíc a rok. Označení vlajky v podáních také kolísá. [Přehled rozporů](../research/CONFLICTS.md) |
| Značka na svahu | S001, kap. X, 23. srpna 1865, tištěné s. 113–114, kap. XI, 24. srpna, s. 117. S002, až vydavatelský dovětek | Musgrave zachytil Crossovu jistotu a vlastní pochybnost. Podle jeho dalšího zápisu mu Henry s Georgem řekli, že v horách nebyli. V tomtéž zápisu zmiňuje, že málem začali žít odděleně. Pozdější tištěná spekulace o Invercauldu pochází z vydavateli převzaté zprávy. Neurčuje původ pozorování. [Zápis z paluby](https://en.wikisource.org/wiki/Castaway_on_the_Auckland_Isles/Chapter_10) · [Rozhovor po návratu](https://archive.org/details/castawayonauckla01musg/page/117/mode/1up) · [Dodatek III](https://en.wikisource.org/wiki/Castaway_on_the_Auckland_Isles/Appendix_3) |

Označení Robert Holding používá sám Dalgarno v dopise majitelům. Jde o nezávislý příběh severní posádky. Text nepřipisuje přeživším znalost druhého tábora, neurčuje jeho přesnou vzdálenost a nedoplňuje výpovědi mužů, kteří zemřeli.

## Tištěná mapa a nová vyobrazení

Skladba pracovního stolu, archivní kapsy, nápisy, obrázky předmětů a všechny herní lístky vznikly pro tuto hru. Jediným převzatým obrazem je ověřená dobová mapa A001. Hráč vidí její celé vyobrazení u dopisů a zvětšený detail skutečné značky u třetí úlohy. Pochází z nečíslované rozkládací strany v londýnském vydání z roku 1866. Při převodu do WebP byla stránka otočena o 90° doprava pro čtení. Výřez zachovává původní nápis i značku. Mapa je dostupná v plné velikosti také z poslední stránky epilogu. [Ediční a právní poznámka k A001](../sources/ILLUSTRATIONS.md) · [Zdrojový výřez PDF](../sources/illustrations/musgrave-map-extract.pdf) · [Digitalizované vydání](https://archive.org/details/castawayonauckla01musg/page/n15/mode/1up)

Šest nových digitálních ilustrací v duchu rytin bylo vytvořeno pomocí ImageGen výhradně pro epilog. Lodě, vybavení, krajina i kalamář jsou ilustrátorské představy. Není známa přesná podoba člunu z kůží a obraz lodi Julian nepředstavuje technickou rekonstrukci plavidla. Žádná moderní publikace neposkytla předlohu obrázků nebo text lístků. Rozměry, kontrolní součty a původ jednotlivých souborů uvádí [obrazový manifest](dist/assets/epilogue/provenance.json).

## Ověření průchodu

Samostatné testy v Node projdou chybné i správné volby obou svědků, všech tří událostí a poslední poznámky. Kontrolují také fokus, opakování a nové rozehrání po rozpracovaném archivu.

```bash
node --test adventure/tests/epilogue.test.cjs
```

Prohlížečový test otevře skutečný konec kampaně z uložení získaného řešením všech kapitol herním enginem. V Chromiu prošel na ploše 1280 × 800 i v dotykovém režimu 360 × 780. Na snímcích obou velikostí jsme zkontrolovali čitelnost otevřených dopisů. Test kontroluje klávesnici a dotyk, chybná přiřazení, nápravu, návrat přes Escape, zachování rozdělaného archivu, konec, prameny a opakování. Při vypnutí pohybu a bez zvuku obsahuje každý lístek i každá volba všechny potřebné informace.

```bash
node adventure/tests/epilogue-browser.cjs
```

Test vyžaduje Playwright a místní Chromium. Proměnná `CHROMIUM_PATH` může určit cestu k binárnímu souboru. Volitelná proměnná `EPILOGUE_PROOF_DIR` uloží snímek otevřených dopisů při rozlišeních 1280 × 800 a 360 × 780. Během testu prohlížeč načítá soubory z lokálního adresáře hry přes zachycené požadavky.
