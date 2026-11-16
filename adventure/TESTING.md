# Ověření aktuální adventury

16. listopadu 2026, cloudový Linux. Konečný běh po integraci malovaného rozhraní: **30/30 testů `node:test` a samostatný průchod obsluhami UI úspěšné**.

```sh
node --test adventure/tests/engine.test.js adventure/tests/art-contract.cjs adventure/tests/interface-art.cjs adventure/tests/polish-ui.cjs
node adventure/tests/ui-contract.cjs
node --check adventure/dist/app.js
node --check adventure/dist/interface.js
```

## Co prošlo

| Sada | Počet | Pokrytí |
|---|---:|---|
| Pravidla `engine.test.js` | 13 | Úplné řešení, pořadí kombinací, nesprávné použití, obnova, předčasný stožár a dosažitelnost dokončení ze všech stavů. |
| Malby `art-contract.cjs` | 4 | Rozměry, výřezy, soubory, původní SHA-256, konkrétní malby předmětů, lidí a změněných stavů. |
| UI atlas `interface-art.cjs` | 5 | Původní hash a alfa formát, šest výřezů, všechny místní skripty/styly, skutečné zapojení materiálů a vnitřní SVG viewport chráněný před CSS přepisem. |
| Integrační `polish-ui.cjs` | 8 | Fokus nastavení, přístupný text rady, klávesová inspekce, finále, inertní dekorace, kolize finále s modalem, poškozené uložení vs preference a aktuální Henryho rada. |

Průzkum herního modelu pokrývá **172 dosažitelných stavů a 410 změnových přechodů**. Každý stav má cestu k dokončení. Chybné použití nespotřebuje nezbytný předmět. Samostatný `ui-contract.cjs` vykonal skutečné obsluhy aplikace přes úplný průchod, předčasně použitý a vrácený stožár, načtení mezistavu, restart, nedostupné úložiště a zachování nezměněných cílů.

Model pravidel a save formát v3 zůstávají zachované. `engine.js` v této revizi mění pouze texty a obrazové rady postav podle stavu; starší revize kompatibility vznikla ještě před touto drobnou změnou. Nový integrační test ověřuje radu po vložení suchého dřeva.

## Opravy nalezené kontrolory

Nezávislá výtvarná oponentura odhalila, že samotný vnější SVG `viewBox` a `overflow:hidden` nebrání zobrazení sousední části atlasu v mezerách při zarovnání `meet`. Vnitřní viewport nyní obraz opravdu ořezává; inline rozměry navíc zabraňují přepsání obecným CSS. Test kontroluje tuto ochranu pro oba režimy zarovnání. Geometrie byla revidována, výsledné pixely však nebyly zachyceny v celé hře.

Samostatná integrační kontrola reprodukovala pokus přesunout fokus do finále pod otevřeným nastavením. Finále nyní čeká na uzavření modalu a při restartu se čekání zruší. Také tato posloupnost má regresní test.

Dílčí kontrola animací ve vestavěném headless Chromiu přes CSSOM ověřila definice animací a jejich vypnutí ruční i systémovou preferencí. Nešlo o vizuální přehrání celé hry. [Podrobnosti](reviews/09-motion.md).

## Nepotvrzené vlastnosti

Spravovaný náhled se znovu nepodařilo spustit: `sites-preview start` vrátil `relay could not open browser port 4173: timed out waiting for relay readiness`; následný stav byl `Sites preview stopped`. Nedocházelo k náhradě náhledové infrastruktury ani změně síťových oprávnění.

**Celý složený obraz a skutečný průchod v prohlížeči zůstávají neověřené.** Testy UI používají minimální napodobeninu DOM, takže nedokládají nativní fokus/modality, pořadí Tab, dotyk, výsledek CSS, kontrast nad malbou ani výkon. Samostatné obrázky byly prohlédnuty. Kontrast pevných barev a mobilní geometrie byly spočteny; nejde o úplný audit přístupnosti.

Zbývá lidský playtest ve třech místnostech, inventář s výběrem, všechny dialogy, telefon na výšku i naležato, 200% zvětšení a omezený pohyb. Obtížnost, délka a zábavnost nejsou změřené. Kvalita snímkové animace se netvrdí: postava stále používá rozdělenou statickou malbu. [Výsledný návrh](VISUAL_DESIGN.md), [19 specialistů a koordinátor](SWARM.md).
