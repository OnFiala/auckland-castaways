# Dokud se nevrátíme

Malovaný interaktivní příběh Graftonových trosečníků v češtině, od ztroskotání v lednu 1864 po návrat pro zbývající dva muže v srpnu 1865. Kompletní příběhová kampaň má 12 kapitol, 36 rozhodnutí, tři oddělené archivní mezihry Invercauldu a epilog. Jde o první implementaci celé příběhové cesty; není to dokončená komerční 3D hra ani fyzikální simulace přežití.

## Hrát

Stáhněte projekt a otevřete [dist/index.html](dist/index.html) v moderním prohlížeči. Server ani instalace nejsou potřeba; u místních souborů závisí dostupnost ukládání na prohlížeči. Hostovaná verze používá běžné úložiště svého původu. GitHub ukazuje HTML jako zdrojový kód, nespouští je.

Vstupte do kapitoly, přečtěte situaci, zvolte možnost a pokračujte šipkou. Následky vidíte předem. Nízké hodnoty mění komentář a závěrečné ohlédnutí, nikdy nezamknou postup. Každé rozhodnutí lze vrátit, deník uchovává vlastní variantu. Přehled kapitol umožňuje znovu číst dokončené části bez změny rozehraného stavu.

Krajina kombinuje pět původních maleb s vrstveným pohybem: parallax, mlha, déšť, voda, ptáci a animovaná silueta. Kliknutí do krajiny posune postavu; zářící bod vede k aktuální situaci. Není to volný pohyb po celém ostrově ani přesná mapa. Animace nezdržují volby. Omezit je lze přepínačem i nastavením systému. Volitelný syntetický zvuk větru/moře se zapíná ručně.

Původní strategická studie **Poslední vrták** zůstává dostupná v [legacy](dist/legacy/index.html) a samostatně v [prototype](../prototype/README.md). Její uložený postup se nemaže; kampaň má jiný klíč úložiště.

## Historie, malby a autorství

Každá kapitola nabízí historickou poznámku s odkazem do evidenčního registru. Všechny dialogy, herní volby, číselné ukazatele a malované rekonstrukce jsou autorská fikce. Archivní mezihry ukazují perspektivu, kterou skupina Graftonu tehdy neměla; nevytvářejí setkání posádek. Historická záchrana pěti lidí zůstává pevnou kotvou, ne odměnou přidělenou herním skóre.

[Příběhový dokument](STORY.md) · [Původ a meze výtvarných podkladů](ART.md) · [Manifest obrazů se SHA-256](dist/assets/manifest.json).

## Ověření a struktura

```sh
node --test campaign/tests/engine.test.js
node campaign/tests/ui-contract.cjs
node --check campaign/dist/app.js
python tools/validate.py
```

`story.js` obsahuje původní kampaň, `engine.js` neměnný stav a přechody, `app.js` ovládání a místní ukládání. Kampaň nepoužívá externí knihovny ani analytiku. Příběh je hotový předem, dialogy se za běhu negenerují. Herní volby se neodesílají.

Podrobné skutečně provedené kontroly, případné blokátory prohlížeče a neověřené vlastnosti jsou v [TESTING.md](TESTING.md). Lidský playtest, dramaturgické redakce a ladění obtížnosti jsou další samostatná práce; samotný automatický průchod nepotvrzuje zábavnost ani naměřenou délku.
