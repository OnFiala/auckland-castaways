# Dokud se nevrátíme — První noc

Nový základ klasické point-and-click adventury, vytvořený po odmítnutí předchozího větveného čtení. Přednost má vizuální řešení situací a minimum slov. **Tato verze je první hratelná kapitola se třemi propojenými obrazovkami, ne hotová adaptace celé devatenáctiměsíční historie.** Starší [příběhová kampaň](../campaign/README.md) zůstává samostatným předchozím návrhem.

## Co se skutečně hraje

Na břehu, u vraku a pod stromy ovládáte postavu, sbíráte předměty, kombinujete je a používáte na prostředí. Cílem první noci je přístřeší, oheň a viditelný signál. Nejsou zde odstavcové volby, přepínání kapitol ani zdrojové ukazatele.

- Kliknutí do krajiny: chůze. Kliknutí na předmět: dojít, vzít nebo prohlédnout. Kliknutí na člověka: obrazová rada.
- Vybraný předmět v brašně + jiný předmět: pokus o kombinaci. Vybraný předmět + objekt ve scéně: použití.
- Pravé tlačítko: prohlédnout. Esc: odložit vybranou věc. Mezerník nebo oko: krátce zvýraznit aktivní místa.
- Otazník poskytuje obrazovou nápovědu. Krátké titulky reakcí jsou standardně vypnuté; lze je zapnout v nastavení.
- Průběh se ukládá v prohlížeči. Žádný předmět se nezničí chybným použitím. Animace lze omezit.

Po stažení repozitáře otevřete [dist/index.html](dist/index.html). Nejsou potřeba knihovny, instalace ani server. Ukládání při otevření místního souboru závisí na prohlížeči. GitHub HTML jen zobrazuje jako zdrojový kód.

## Vizuální revize rozhraní

Horní lišta, brašna a dialogy používají vlastní malované dřevo, plátno a papír v teplé paletě. Revize opravuje výřezy atlasů, hloubku lidí, obrazové rady, klávesový fokus i závěrečné okno. [Vizuální směr a výsledek](VISUAL_DESIGN.md) · [20 agentních rolí, modely a výstupy](SWARM.md) · [provenience UI](UI_ART.md).

## Výtvarná a historická povaha

Tři kreslená/kvašová prostředí, hlavní postava, čtyři další postavy, jedenáct rekvizit a pět maleb změněného prostředí tvoří společnou původní AI generovanou výtvarnou sadu. [Provenience](ART.md), [obrazový manifest](dist/assets/manifest.json). Aktivní předměty, plachta, plamen, signál a reakce jsou samostatné vrstvy; chůze využívá jednoduchou animaci rozdělené postavy, nikoli plnou sadu ručně kreslených snímků.

Inspirací je způsob vizuálního vyprávění klasických adventur. Nejsou použity postavy, obrázky, zvuky ani kód Machinaria či jiné hry.

Přístřeší, záchrana materiálu a řemeslo mají oporu v historii Graftonu. Přesné hádanky, pořadí akcí, plánek lokací i shrnutí do první noci jsou vlastní fikce. Postava není autentický portrét konkrétního námořníka. Pětice přežila; herní řešení netvrdí, že se věci staly právě takto. [Historické podklady](../research/OVERVIEW.md).

## Ověření a další rozsah

```sh
node --test adventure/tests/engine.test.js adventure/tests/art-contract.cjs adventure/tests/interface-art.cjs adventure/tests/polish-ui.cjs
node adventure/tests/ui-contract.cjs
node --check adventure/dist/app.js
```

Testy zahrnují úplný průchod, všech 172 dosažitelných stavů a jejich návaznost na dokončení i zapojení malovaných předmětů a postav, hranice výřezů a shodu původních obrázků s evidovanými hashi. Podrobné meze ověření rozhraní uvádí [TESTING.md](TESTING.md).

Další kapitoly celé adventury (zima, výroba nástrojů, přestavba člunu, plavba a návrat) zatím nejsou převedeny do tohoto herního systému. Historický scénář v repozitáři pro ně zůstává podkladem. Před rozšiřováním je potřeba ověřit nové vizuální ovládání skutečným hraním.
