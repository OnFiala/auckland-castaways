# Kontrola ovládání a návazností rozhraní

16. listopadu 2026. `node --test adventure/tests/polish-ui.cjs` provádí skutečné obsluhy aplikace a engine nad existující minimální napodobeninou DOM v `ui-contract.cjs`; nepřepisuje graf hádanek. K dokončení používá samostatný uložený stav, který před spuštěním ověřuje `engine.restore`.

- Přepínače nastavení mají přiřazené popisky a `aria-pressed`, po překreslení vracejí fokus na aktivovaný přepínač a přetrvávají po novém načtení. Ověřeno i přepnutí zpět.
- Text první rady je při vypnutých titulcích přítomen v `sr-only`, po jejich zapnutí je viditelný jako `small`. Test kontroluje i existenci skrývacího CSS pravidla, nikoli výstup konkrétní čtečky obrazovky.
- Shift+F10 nad inventářem a klávesa místní nabídky nad předmětem spustí prohlížení, zachovají vybraný předmět i stav a neruší fokus; test sleduje zamezení výchozí akce a propagace. Test nevyvolává skutečné klávesové události operačního systému.
- Poškozený JSON uložené hry nemaže nezávisle uložené platné preference titulků a omezení animací. Henry po vložení dřeva nabídne křesadlo jako další krok; test ověřuje text i namapovanou kresbu.
- Závěrečná obrazovka po časovači za běžného průběhu zaměří tlačítko pokračování; pokračování a potvrzený restart vrací fokus scéně. Potvrzení vytvoří nový stav hry.
- Malované vrstvy rozhraní používají skryté, neostřitelné SVG; statická kontrola ověřuje prázdné dekorativní kontejnery a opakované připojení materiálu nepřidává další vrstvu. Jednoduchý mock dále ověřuje, že připojení dekorace nepřepisuje připojenou obsluhu ovládání; nenahrazuje skutečný hit-testing.

## Opravená kolize závěru a dialogu

Při dokončení posledního kroku, otevření nastavení před uplynutím prodlevy a doběhnutí časovače aplikace otevře závěr a volá `focus()` na jeho tlačítko i při otevřeném modálním dialogu. V DOM mocku je výsledek `dialogOpen: true`, `completionVisible: true`, `focused: keep-exploring`. To dokládá konflikt v pořadí obsluh, nikoli faktické chování browserového dialogu: nativní modalita může přesun fokusu mimo dialog zablokovat. Integrátor upravil časovač tak, aby závěr při otevřeném dialogu počkal na jeho zavření; potvrzený restart čekající závěr zruší. Nový regresní test ověřuje obě větve a následný fokus.

## Meze ověření

Toto není prohlížečový ani vizuální test. Mock nemodeluje nativní modalitu/focus trap, přístupový strom, CSS rozložení, dotyk, překryvy ani skutečnou čtečku. Cloudový náhled používající browserový relay 4173 nebyl dostupný; závěry o renderování, čitelnosti a chování nativního dialogu proto zůstávají neověřené.
