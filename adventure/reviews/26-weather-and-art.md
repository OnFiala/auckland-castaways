# Ostrov po dešti · Until We Return

18. listopadu 2026. Vítr, voda a světlo jsou součástí všech čtrnácti míst. V přístřešku hráč vidí, na které straně ještě zmokne. Ze stejného místa po natažení plachty odkapává voda z okraje střechy. Člun po vybrání vody ukáže dno i stále roztrženou plachtu. Obě opravy se v obraze projeví zvlášť. [Hra](https://posledni-vrtak-auckland.andrewxix.chatgpt.site/) · [Animovaná ukázka](weather/weather-in-motion.gif) · [Šest srovnávacích výřezů](weather/README.md)

## Co se děje v obraze

| Místo | Jak se počasí projevuje | Co se změní po hráčově zásahu |
|---|---|---|
| První tábor | Mezi nezakrytými kůly prší. Pod větvemi padají jednotlivé kapky. | Přes napnuté plátno stéká voda do jednoho místa na zemi. Oheň přidá do závětří odlesk. |
| Zimní rokle a Epigwaitt | V otevřeném průseku nese vítr mokrý sníh. Uvnitř domu je déšť se sněhem za čtyřmi okenními tabulkami. | Po opravě spáry přestanou kapky vytvářet na podlaze nová kola. Vlhké místo je ještě patrné. |
| Kovárna | Za dveřmi prší. Studená výheň, nasazený měch a rozpálené uhlí mají vlastní malované stavy. | Po zapálení se rozžhaví uhlí a světlo dopadne na okolní kámen. |
| Přeplavba | Vítr napíná lanoví a plachtu, tříšť přechází přes vzdálený bok člunu. | Upevněné lanoví má menší rozkmit. Po vybrání vody zmizí její pohyb na dně, po opravě plachty zůstane viditelná záplata. |
| Návrat | V chráněné zátoce doznívá déšť, v chatě zůstaly stopy života dvou mužů. | Vyvázané lano se ustálí a lucerna se odrazí v mokrém štěrku. |

Kroky zanechají krátkou stopu jen v příslušném materiálu. Na mokrém štěrku, ve sněhové břečce a ve vodě v člunu mají rozdílnou kresbu. Při přechodu mezi místy se stopy vyčistí. Volba omezeného pohybu nabízí klidný obraz a změnu dokončené práce stále ukazuje barva i stav předmětu. Oblasti počasí propouštějí kliknutí a čtečka obrazovky má k dispozici krátký anglický popis podmínek. [Počasí a reakce na dotyk se zemí](../dist/weather.js) · [Zapojení do hry](../dist/app.js)

## Malby

Celkem je v herní grafice 54 obrazových souborů. Všech 49 obrazů předchozího vydání má novou kresbu. Přibyly samostatné varianty pro uhlířskou mýtinu, pozdější vrak a návrat do Epigwaittu, dále vybraný člun a zapálená kovárna. Světlo na chladném kovu, saze, třepící se konopí i švy na plátně jsou vidět v široké scéně, inventáři a při práci zblízka.

| Rodina obrazů | Soubory | Co zahrnují |
|---|---:|---|
| Místa a stavová pozadí | 23 | Čtrnáct hratelných míst a jejich varianty |
| Posádka | 15 | Pět celopostavových portrétů, pět sad chůze a pět sad pracovních postojů |
| Předměty | 5 | Čtyři atlasy s 29 rekvizitami a samostatná konvice |
| Rozhraní | 1 | Lodní dřevo, voskované plátno, papír, brašna, mosazný terč a štítek |
| Oheň a signální tyč | 3 | Táborový oheň a dvě podoby tyče se stejnou patou |
| Pracovní detaily | 7 | Od bedny z vraku po vyvázání člunu u břehu |

Každý člen posádky má vlastní základní malbu, šest poloh chůze a tři pracovní postoje. Sady jsou vůči sobě zarovnané v chodidlech a při práci také v konečcích prstů. U obou podob signální tyče leží pata na stejném místě. Obrazové registry zaznamenávají použité reference, původ nových výstupů a případné technické úpravy. [Šest scén s postavami](staging/scene-scale-proof.webp) · [Pozadí jednotlivých kapitol](../dist/assets/voyage/scenes/manifest.json) · [Pracovní pózy](../dist/assets/work-poses/manifest.json) · [Sedm pracovních detailů](../artwork/workplates/manifest.json)

Musgrave popisuje střídání deště, mokrého sněhu a přechodného sněhového pokryvu. Délka a načasování jednotlivých herních přeháněk jsou autorské. U zimního lesa a červencového skluzu jsme při revizi odstranili zářivě červený letní květ rātā. Přesná podoba lidí, dispozice chaty a rozmístění nástrojů jsou výtvarné rekonstrukce. [Musgrave, kapitola IV, květnové a červnové zápisy](https://en.wikisource.org/wiki/Castaway_on_the_Auckland_Isles/Chapter_4) · [Department of Conservation o kvetení rātā](https://www.doc.govt.nz/nature/native-plants/rata/) · [Historický manuál hry](../HISTORICAL_ADAPTATION.md)

## Ověření a další návrh

Prošlo všech 104 automatických kontrol. Kompletní průchod sedmi kapitolami jsme zopakovali i nad soubory webového vydání. Další kontroly pokrývají návrat do každé fáze opravy člunu, vlivy kryté střechy a osazeného lanoví, omezený pohyb a pozastavení vykreslování při skrytí stránky. Přiložená animace používá herní vykreslovač nad skutečnými malbami. Spravovaný náhled se v tomto vydání nepřipojil. Celý pohyb hry v prohlížeči a dotykové ovládání na fyzickém telefonu zůstávají neověřené. [Výsledky kontrol](../FULL_GAME_TESTING.md)

Jako první další rozšíření navrhujeme upevnění pružícího prkna ve dvojici. Hráč vybere místo, kde se Alick zapře. Musgrave může přichycený bok upevnit a hráč potom znovu vyzkouší, jestli spoj drží. Rozsah prvního prototypu tvoří jedna obrazovka, dvě polohy prkna a dvě postavy. [Čtyři návrhy a jejich hráčské ověření](../design-next.md)
