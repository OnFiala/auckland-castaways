# Ověření celé kampaně

16. listopadu 2026, cloudový Linux, Node.js 24.22.1.

## Herní model a příběhový průchod

`node --test campaign/tests/engine.test.js`: **12 testů úspěšných, žádný přeskočený**. Skutečný datový příběh je zahrnutý. Testy procházejí kapitoly, rozhodnutí, výsledky, archivní mezihry a epilog; zahrnují strategie volící nízké i vysoké skóre a smíšené průchody. Kontrolují meze ukazatelů, shodu náhledu s výsledkem, neměnnost vstupního stavu, obnovu každé fáze po uložení, návrat rozhodnutí přes hranice kapitol a odmítnutí poškozených či neplatných uložených her.

Kampaň obsahuje 12 kapitol, 36 rozhodovacích scén, 72 voleb a tři archivní mezihry. Žádná volba není zamčená kvůli nízké hodnotě ukazatele. Historická záchrana zůstává pevnou kotvou; proměňuje se způsob vyprávění a závěrečné ohlédnutí.

Všechny tři JavaScriptové soubory prošly kontrolou syntaxe. Pět původních obrazů vizuálně zkontroloval výtvarný agent; obrazové soubory mají manifest s rozměry, prompty a SHA-256. Samotná kontrola obrazů nepotvrzuje rozložení rozhraní v prohlížeči.

## Rozhraní bez rendereru

`node campaign/tests/ui-contract.cjs` spouští skutečné app.js, story.js a engine.js v minimální napodobenině DOM. Prošel všemi 12 úvody, 36 volbami a výsledky, 12 závěry, třemi archivy a epilogem. Ověřeny obsluhy deníku, přehledu kapitol, pramenů, návratu z konce a restartu se zaměřením; také náhradní chování při blokovaném úložišti. Není to prohlížeč a neověřuje CSS, vykreslení ani skutečnou implementaci localStorage.

## Kontrola týmem

Oddělení agenti připravili scénář, engine a jeho testy, malby a nezávislou revizi. Integrace upravila zaměření po restartu, zapojila samostatné obrazy výhně a přístaviště a odstranila nedoloženou implikaci současného opětovného shromáždění všech pěti mužů na návratové lodi. Ověřená je záchrana George a Henryho Musgravem a přežití celé pětice.

## Meze ověření

Spravovaný náhled se nepodařilo spustit: `relay could not open browser port 4173: timed out waiting for relay readiness`; `sites-preview status` potvrdil zastavení. Nebyla nahrazována infrastruktura ani instalován jiný ovladač prohlížeče.

**Celé rozhraní, mobilní rozložení, animace, zvuk a skutečné místní ukládání ovládané přes UI nejsou potvrzeny browserovým testem.** Implementovaný datový průchod a validace uloženého stavu tuto zkoušku nenahrazují. Lidský playtest ani měření délky neproběhly.

## Následující lidský test

Projít první tři kapitoly bez pokynů, potom dokončit celou kampaň. Ověřit čitelnost malované scény, jasnost pokračovacího tlačítka, návrat volby, obnovení po zavření stránky a rozlišení fikce od pramenů. Vyzkoušet úzký telefon, klávesnici, omezený pohyb a zvuk. Zapsat úseky s opakováním nebo příliš dlouhým textem a upravit rytmus před dalším rozšiřováním.
