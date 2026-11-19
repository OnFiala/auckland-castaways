# Until We Return · Světlo v malovaných scénách

Na pobřeží může Alick přejít z tmavé suché hlíny na stříbrný mokrý písek. Pod botami se objeví krátký odraz, který kopíruje jeho krok. Po návratu na suchou zem zmizí. V Epigwaittu přichází chladné světlo z okenní tabulky. Po zatopení se k němu přidá teplo u krbu. V kovárně dál dopadá denní světlo otevřenými dveřmi, i když se výheň rozehřeje. Na přeplavbě vybírání vody mění malbu podlážek i jejich schopnost odrážet postavu.

V nabídce **Settings → Scene lighting** je výchozí **Automatic**. Na menší obrazovce nebo zařízení s omezenou pamětí volí úspornější výpočet. **Cinematic** zapne plný světelný průchod, **Balanced** prostorové vyhlazení a **Original painting** vrátí dosavadní malbu. Přepnout lze i v rozehrané hře. Při omezení pohybu se ustálí počasí, světlo i jeho vzorkování. [Anglický návod](../../PLAY.txt)

## Co vzniklo pro tuto hru

| Technika | Jak se projevuje ve hře |
|---|---|
| Normály, reliéf a materiály | Každé místo má mapu normál, výšky a drsnosti. Kov, voda, mokré dřevo a suché plátno mají různé odlesky. Šikmý světelný paprsek používá výškovou mapu k drobnému posunu vzorku reliéfu. Souřadnice postavy, tahy malby a místa pro kliknutí zůstávají společné. |
| Pečené nepřímé světlo | Při sestavení se světlo dvakrát rozptýlí mezi okolními plochami. Výpočet používá barvu originálu a překážky zakreslené v obraze. Barva odražená v kabině se liší od světla pod širým nebem. |
| Expozice, rozptyl a optika | Přímé světlo, odrazy a žár se počítají v lineárním prostoru s jasem i nad úrovní zobrazitelné bílé. Převod na běžný displej zachová kresbu ve světlých místech. K drobnému rozkvětu světla dochází v okolí skutečného zdroje, například výhně. Přísvit ve vzduchu je vázaný na průhledy a okna. Mírný pokles jasu k okraji patří jednotlivé scéně. |
| Živé rovinné odrazy | Písek, mokrá prkna mola a voda uvnitř člunu mají vlastní obrys. Podle polohy chodidla se na povrch promítá aktuální krok nebo pracovní póza. Na molu se navíc odráží namalovaný vyvazovací sloup. |
| Vyhlazování | Na plně animované světelné vrstvě režim Cinematic skládá čtyři postupně posunuté vzorky a dopočítává cílové rozlišení (TAAU). Vyšší jas v nové scéně ani předchozí postava se nepřenášejí do nové malby. Režim Balanced a ustálený obraz používají FXAA. U obrysu mokré plochy se na podporovaném zařízení samostatně použije až čtyřnásobné MSAA. |
| Předměty a pracovní detaily | Světlo na člověku a předmětu vychází ze stejného směru jako v okolní malbě. Osm pracovních detailů má vlastní jemná zvýraznění, například na železu vrtáku, mokrém švu či mosazi kružidla. Ovládání a písmo mají vlastní vrstvu. |

Malby zůstávají dvourozměrné. Výsledkem je osvětlení malovaného reliéfu, s pevnou kamerou a výstupem pro displeje SDR. Na přístroji bez WebGL 2 hra použije statickou světelnou mapu a stále dovoluje odehrát všechny kapitoly. [Registrace materiálů](../../artwork/materials/registrace.webp) · [Výpočet odrazů a světla](../../dist/material-renderer.js) · [Referenční model materiálů Filament](https://google.github.io/filament/Filament.html) · [Přednáška o časovém vyhlazování](https://www.advances.realtimerendering.com/s2014/index.html)

## Prohlédnout a hrát

[Stáhnout vydání 16](https://github.com/OnFiala/auckland-castaways/releases/tag/game-v16) · [Porovnání obrazů z hraní](https://github.com/OnFiala/auckland-castaways/releases/download/game-v16/lighting-study.webp) · [Ověření celé hry](../../FULL_GAME_TESTING.md)
