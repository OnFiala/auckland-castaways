# Auckland Castaways

**Rešerše a návrh historické hry o trosečnících lodí Grafton a Invercauld na Aucklandových ostrovech v letech 1864–1865.** Hlavní texty jsou česky; bibliografická metadata zachovávají původní názvy a anglické pracovní popisy.

Tento repozitář obsahuje historickou rešerši a **anglickou malovanou point-and-click adventuru Until We Return: sedm hratelných kapitol od ztroskotání po návrat pro oba čekající muže**. Rešeršní část obsahuje 53 záznamů pramenů a stop, 55 evidenčních položek, pracovní seznam 30 členů obou posádek a dobové materiály. Není tvrzením, že byly nalezeny všechny prameny. U zdrojů se rozlišuje čtený text, vybrané pasáže, OCR, metadata a neověřené stopy.

Stav rešerše: **15. listopadu 2026**. Veřejný projekt: [OnFiala/auckland-castaways](https://github.com/OnFiala/auckland-castaways).

## Aktuální hra: Until We Return

**[Spustit hostovanou hru](https://posledni-vrtak-auckland.andrewxix.chatgpt.site/)** · [Návod](adventure/README.md) · [Zdrojové soubory pro místní spuštění](adventure/dist/index.html)

Sedm kapitol propojuje 14 lokací: první noc, zimní dům, kovárnu, přestavbu člunu, oceánskou plavbu, opatření pomoci a záchranný návrat. Hráč chodí po scénách, sbírá a kombinuje předměty, používá je na prostředí a vede krátké anglické rozhovory. Inventář obsahuje 38 různých herních předmětů. Opravený dům, kovárna, člun a bezpečná plavba mají viditelnou změnu obrazu. Hra ukládá postup a převede starší uloženou první kapitolu.

V kapitolách I–V je dramatickou perspektivou Alick McLaren; v VI–VII kapitán Musgrave, který se historicky účastnil návratu. Závěr neumisťuje všech pět lidí na záchrannou palubu. Invercauld zůstává součástí rešerše, jeho trosečníci nejsou smyšleně propojeni s hráčovou skupinou.

[Příběh celé hry](adventure/FULL_STORY.md) · [Hranice adaptace](adventure/HISTORICAL_ADAPTATION.md) · [Nové malby](adventure/VOYAGE_ART.md) · [Ověření celé hry](adventure/FULL_GAME_TESTING.md) · [Oprava pohybu](adventure/reviews/23-motion-repair.md).

Automatický průchod dokončí všech sedm kapitol. Všech 705 dosažitelných stavů kapitol má cestu k dokončení. Cloudový náhled je stále blokován infrastrukturou; vizuální průchod, dotykové ovládání a plynulost v reálném prohlížeči proto nejsou potvrzené. Jde o implementovanou kompaktní kampaň se začátkem i koncem, která stále potřebuje vizuální a hráčské doladění.

Starší rozhodovací a strategické prototypy níže jsou archivem vývoje.

## Předchozí příběhová kampaň


Archivovaná rozhodovací verze **Dokud se nevrátíme** obsahuje 12 kapitol, 36 rozhodovacích scén, 72 voleb, tři archivní mezihry Invercauldu a epilog. Pět původních maleb doplňují animované vrstvy mlhy, vody, deště a pohybu postavy. Příběh vede od ztroskotání až po návrat pro George a Henryho.

[Návod ke kampani](campaign/README.md) · [úplný scénář](campaign/STORY.md) · [původ maleb](campaign/ART.md) · [ověření a jeho meze](campaign/TESTING.md).

Po stažení repozitáře otevřete [campaign/dist/index.html](campaign/dist/index.html). Instalace ani server nejsou potřeba. Hra má automatické ukládání, deník, návrat rozhodnutí, přehled kapitol, volitelný zvuk a omezení animací. Každá větev je průchozí; ukazatele mění komentář a závěrečné ohlédnutí. Jde o implementovanou celou příběhovou cestu, jejíž vizuální průchod a lidský playtest zůstávají otevřené.

## Původní strategická studie

**Dokud se nevrátíme — Poslední vrták** (16. listopadu 2026) je česká hra pro prohlížeč s pěti lidmi a deseti směnami. Rozdělujete práci, hlídáte únavu a zásoby, uzavíráte konkrétní dohody a měníte plán lodi. Před potvrzením směny vidíte její následky. Hra obsahuje ukládání v prohlížeči, deník, návrat jedné směny a úspěšný i neúspěšný závěr.

Stáhněte nebo naklonujte repozitář a otevřete [prototype/dist/index.html](prototype/dist/index.html) v prohlížeči. GitHub tento soubor zobrazuje jako zdrojový kód; samotnou hru spouštějte z místní kopie. Instalace závislostí ani server nejsou nutné. [Návod a rozsah](prototype/README.md), [výsledky testů a jejich meze](prototype/TESTING.md).

Herní model prošel 12 automatickými testy včetně úplného dohrání. Cloudový náhled blokovala infrastruktura, proto dosud není potvrzen vizuální průchod prohlížečem. Obtížnost, srozumitelnost a délka čekají na lidský playtest.

## Začněte zde

| Potřebuji… | Dokument |
|---|---|
| Hrát aktuální celou adventuru | [Until We Return](adventure/README.md) |
| Vyzkoušet první hratelnou studii | [Prototyp Poslední vrták](prototype/README.md) |
| Pochopit skutečný příběh | [Historický přehled](research/OVERVIEW.md) |
| Najít původ a přesnou oporu tvrzení | [Registr pramenů](sources/REGISTER.md) a [evidenční deník](research/CHRONOLOGY.md) |
| Zjistit, co si odporuje | [Rozpory a kouř](research/CONFLICTS.md), [nápoj z místních rostlin](research/FERMENTED_DRINK.md) |
| Poznat posádky a prostředí | [Životopisné karty](research/CREW.md), [geografie](research/GEOGRAPHY.md), [materiální kultura](research/MATERIAL_CULTURE.md) |
| Rozlišit historii a tvůrčí zásahy | [Fakt, úsudek a fikce](research/FACT_INFERENCE_FICTION.md) |
| Posoudit navrhovanou hru | [Příběhová bible](story/NARRATIVE_BIBLE.md), [kapitoly a mise](story/CHAPTERS.md), [ukázková scéna](story/SCENE_SAMPLE.md) |
| Vybrat první realizovatelný krok | [Formáty](design/FORMATS.md), [systémy](design/SYSTEMS.md), [vertikální řez](design/VERTICAL_SLICE.md) |
| Prověřit další zpracování a užití materiálů | [Adaptace a práva](research/ADAPTATIONS_AND_RIGHTS.md), [RIGHTS](RIGHTS.md) |
| Navázat další rešerší | [Backlog](research/BACKLOG.md), [deník hledání](research/SEARCH_LOG.md), [metoda a vydání](research/EDITIONS_AND_METHOD.md) |

## Pevné historické body

Grafton ztroskotal **3.1.1864**. Všech pět mužů přežilo, postavilo společné obydlí Epigwaitt, pracovalo s nástroji a výhní a přestavělo člun. **19.7.1865** odpluli Musgrave, Raynal a Alick; **24.7.** dosáhli Port Adventure na Stewartově ostrově. Musgrave se vrátil a **24.8.1865** vyzvedl George Harrise a Henryho. Opora: S001/S003; E003, E025–E033, E039.

Invercauld ztroskotal **10.5.1864** u severního konce ostrova. Z **25** lidí se **19** dostalo na břeh; pouze **Dalgarno, Smith a Holding** se dočkali záchrany v květnu 1865. Přesný den záchrany se v podáních rozchází. Skupiny se během pobytu nesetkaly a nevěděly o sobě. Měly rozdílný materiál, zdravotní stav, velikost i místo pobytu; výsledek nelze vysvětlit pouze vedením. S002/S038; E011–E019, E036, E048.

Srpen 1865 přináší Musgraveovo **nejisté pozorování kouře**. Vydavatelský dodatek jej spojuje s Invercauldem, jehož tři známí přeživší však byli zachráněni už v květnu. Původ kouře není vyřešen. Herní setkání nebo objevení cizího tábora během pobytu na ostrově by bylo alternativní historií. [Rozbor](research/CONFLICTS.md).

## Tvůrčí návrh

Doporučena je narativní strategie o udržení pěti lidí, práce a společných závazků. Finále tvoří **návrat pro ty, kteří zůstali**, ne jen první únik z ostrova. Invercauld dostává připsaná svědectví a archivní mezihry, které zachovávají rozdílné podmínky a nejistotu.

První řez **Poslední vrták** má na malé scéně ověřit práci, odpočinek, zásoby, dohody a změnu nefunkčního plánu. První kratší implementace už obsahuje pět zhuštěných dnů; původních 30–45 minut zůstává návrhovým cílem většího řezu, nikoli změřenou délkou prototypu. Dialogy, číselné hodnoty, událostní karty a část pořadí scén jsou vlastní fikce, nikoli rekonstruované zápisy skutečných lidí.

## Získané originály a data

- [Musgrave 1866 — úplný PDF sken](sources/originals/castawayonauckla01musg.pdf) a [strojový text](sources/originals/musgrave-1866-pdftotext.txt).
- [Raynal 1874 — úplný anglický PDF sken](sources/originals/wreckedonareef00rayngoog.pdf) a [surové OCR](sources/originals/wreckedonareef00rayngoog_djvu.txt).
- [Dobová mapa a frontispis](sources/ILLUSTRATIONS.md), [manifest akvizic s SHA-256](sources/acquisition-manifest.json) a [návod ke čtení souborů](sources/ACQUISITION.md).
- [Prameny JSON](data/sources.json), [evidence CSV](data/evidence.csv), [posádky CSV](data/crew.csv), [tvrzení CSV](data/claims.csv), [místa GeoJSON](data/places.geojson), [návrhové události JSON](data/events.json).

Moderní knihy ani muzejní fotografie nejsou celé přebírány. Smithova samostatná kniha *The Castaways* (1866) je bibliograficky potvrzená, ale její nalezené skeny se nepodařilo zpřístupnit. Srovnání jeho hlasu s Dalgarnem zde stojí na novinovém dopise. Francouzský Raynalův seriál byl čten na webu; celá francouzská knižní vydání zatím nebyla získána.

## Důležitý nález o adaptacích

Tvrzení „příběh nebyl zfilmován“ neplatí: **ZDF Terra X: Die Schiffbrüchigen (2022)** je ověřené přímé dokumentární zpracování. Filmová opce na Druettinu knihu je doložena jako zpráva, její současný stav a dokončený hraný film nikoli. Přímá vydaná hra nebyla v cíleném hledání spolehlivě identifikována; absence není prokázána. [Soupis a meze hledání](research/ADAPTATIONS_AND_RIGHTS.md).

## Údržba a ověření

```sh
python tools/validate.py
python tools/render_register.py
python tools/render_evidence.py
node --test adventure/tests/engine.test.js adventure/tests/art-contract.cjs adventure/tests/interface-art.cjs adventure/tests/polish-ui.cjs adventure/tests/live.test.cjs
node adventure/tests/ui-contract.cjs
node --test prototype/tests/engine.test.js
node --test campaign/tests/engine.test.js
# Volitelně nová síťová kontrola; přepisuje datovaný report:
python tools/check_links.py
```

Kontrola prověřuje odkazy mezi místními soubory, ID, datové vazby, počty posádek a hashe získaných souborů. Neautomatizuje historický úsudek. [Výsledek kontroly](reports/VALIDATION.md) rozlišuje dostupné URL od blokovaných odpovědí; HTTP200 neznamená přečtený pramen. Pravidla dalších příspěvků: [CONTRIBUTING](CONTRIBUTING.md).
