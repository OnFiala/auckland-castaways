# Poslední vrták

První hratelná studie projektu **Dokud se nevrátíme / Auckland Castaways**. Česká strategie v prohlížeči: pět historických postav, deset směn, rozdělení práce, předpověď následků, únava, zásoby, čtyři večerní rozhodnutí a konkrétní sliby. Závěr hodnotí přípravu nové etapy, nikoli skutečnou plavbu.

## Spuštění

Otevřete `dist/index.html` v běžném prohlížeči se zapnutým JavaScriptem. Není potřeba instalace, účet ve hře ani server. Prohlížeče se mohou lišit v dostupnosti úložiště při otevření místního souboru; hra v takovém případě oznámí běh bez ukládání. Hostovaná soukromá verze používá standardní úložiště svého webového původu.

Rozdělte práci mezi všech pět lidí a potvrďte dopolední nebo odpolední směnu. Vpravo se předem ukazuje následek aktuálního plánu. Po odpolední směně uzavřete večerní dohodu. Poslední směnu lze vrátit, postup se průběžně ukládá v prohlížeči. Tlačítko Prameny vysvětluje rozdíl mezi historií a herním modelem.

## Co je implementované

- 10 směn a 5 rolí práce pro každého z pěti lidí; dostupnost pobřeží podle pevného scénáře počasí.
- Společné zásoby, stav přístřeší, únava jednotlivců, domácí práce a zotavení.
- Výroba vrtáku s omezením poznání; přesun práce a materiálu k přípravě člunu.
- Konkrétní závazek ohledně počtu pokusů nebo volna jmenovanému člověku; vyhodnocení ve správný den.
- Úspěšný i neúspěšný závěr, deník, automatické ukládání, návrat jedné směny, potvrzený restart.
- Původní SVG výjev tábora, klávesnicové popisky, dialogy a CSS pro úzkou obrazovku.

Nejde o hotovou hru ani celou zamýšlenou kampaň. Model je deterministický a dosud nemá lidský playtest. Hratelnost, obtížnost, skutečná délka a mobilní použitelnost čekají na ověření. Původní cíl 30–45 minut nebyl měřen a pro tuto kratší studii není slibem.

## Historie a původ obsahu

Výchozí kotva: Thomas Musgrave, *Castaway on the Auckland Isles* (1866), zápis 12. března 1865, s. 79–82; registr S001, evidence E025–E026 v [výzkumném repozitáři](https://github.com/OnFiala/auckland-castaways). Obě trosečnické skupiny se během pobytu nesetkaly. V tomto prototypu není Invercauld hratelný.

Dialogy, stavové hodnoty, počasí, dovednostní bonusy a komprese do pěti dnů jsou původní fikce. Není to simulátor skutečných přídělů, zdraví nebo lodní konstrukce. Nové kódy, texty a grafika vznikly pro tento projekt. Moderní knihy, fotografie ani ilustrace nejsou přebírány. Licence celého výzkumného projektu zatím nebyla zvolena; veřejná viditelnost není automatické licenční udělení.

## Ověření

```sh
node --test tests/engine.test.js
node --check dist/engine.js
node --check dist/app.js
```

Testy používají pouze standardní Node.js. Podrobnosti a meze jsou v [TESTING.md](TESTING.md). Nejsou zde externí knihovny, analytika, formuláře, vzdálené herní API ani generování dialogů za běhu. Herní volby neopouštějí prohlížeč.
