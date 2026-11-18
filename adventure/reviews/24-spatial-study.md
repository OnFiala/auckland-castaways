# Měřítko scén, pohyb po zemi a dotyk předmětů

Čtrnáct herních míst používá osmnáct různých maleb včetně dokončených a nedokončených stavů. Pro každou scénu jsme na celé malbě vyznačili pochozí podlahu, místo nástupu, polohu bot a místa, kde se pracuje rukama. Všechny souřadnice níže jsou procenta šířky či výšky obrazu. [Scénická data](../dist/stage-direction.js) · [Původ a varianty maleb](../VOYAGE_ART.md)

| Místo ve hře | Vodítko pro velikost a pohyb | Výška stojící postavy při uvedené poloze chodidel |
|---|---|---|
| The Shore | Po písku před pobřežními kameny. Volný konec plachty visí ve větvích nad skalním výstupkem. | 34 % při y71 |
| The Wreck / The Last Useful Pieces | Bedna stojí na kameni nad pískem. Do obou scén vede pěšina vpravo. Hráč bere páku u paty nakloněné fošny. | 35 % při y75 |
| Under the Trees | Sloupky přístřešku sahají od y31–36 k y65–68. Ohniště i pravá stojka vystupují do průchozího prostoru. | 37 % při y68 |
| Inside Epigwaitt / The Two Who Waited | Hrana nízkého stolu je u y50 a jeho nohy u y69. Postavy míjejí krb, stůl, lůžko a sud zepředu. V zimě visí měch na obruči sudu. | 42 % při y69 |
| The Winter Stream / Charcoal and Salvage | Vlevo dopadá voda na kameny. Jáma leží na opačné straně. Dno průchozího pásu se u krajů zvedá nad kořeny a kameny. | 33 % při y70 |
| The Forge | Pracovní deska je u y43 a konce noh u y60. Zkouška vrtáku probíhá na horní desce. K peci se přichází vedle špalku. | 39 % při y63 |
| The Boat on the Shore | Trup stojí na kozách. Úpatí stožáru dokončené lodě leží na x62, y49. Přístup k prknům a spárám vede před podpěrami. | 35 % při y66 |
| An Open Boat | Horní hrana boku je u y59, paluba u y75. Při chůzi napříč musí člověk obejít patu stěžně. Musgrave stojí u kormidelní páky vlevo, při opravě plachty Alick obsluhuje lano u stěžně. | 41 % při y76 |
| Stewart Island Harbour | Pro měřítko na mole slouží sud u bedny. Odchod do další scény je na konci mola. K nalodění se přichází k lávce. | 29 % při y71 |
| Invercargill Chart Room | Přední lišta kreslicího stolu je u y50, jeho nohy u y70. Skutečné dveře na pravé straně slouží jako východ. | 42 % při y70 |
| Back in Carnley Harbour | Veslice leží na kamenech při y60. Musgrave stojí při nakládání na břehu. Henry a George přijdou k člunu po rozhovorech, uvázání lodi a předání zásob. | 31 % při y65 |

Pracovní stůl slouží jako odhad perspektivy. Deska vysoká asi tři čtvrtě metru představuje přibližně polovinu výšky dospělého člověka ve stejné vzdálenosti. Musgrave zaznamenal pro jednu fázi domu podlahu 24 × 16 stop a kamenný komín 8 × 5 stop. Lidské výšky, rozmístění nábytku a místa konkrétních gest jsou výtvarná rozhodnutí pro tuto inscenaci. K plavbě odjeli Musgrave, Raynal a Alick. Do návratové scény vstupuje Musgrave a setká se s Henrym a Georgem. [Materiální prameny](../../research/MATERIAL_CULTURE.md) · [Historická pravidla adaptace](../HISTORICAL_ADAPTATION.md)

## Použití scénických dat

- `profile(sceneId).walkPolygon` je obrys pochozí plochy ve směru hodinových ručiček. `entry.default` určuje první postavení v kapitole. `from[previousScene]` určuje nástup z konkrétní sousední scény. Hloubka chodidel určuje perspektivu přes `heightAt(sceneId, footY)` a pořadí překryvu postav.
- `stageTarget(sceneId, target, state)` vrací střed a rozměry oblasti pro kliknutí, velikost samotné malby a `approach` pro chodidla při práci. Volitelné `contact` udává místo skutečného dotyku. U vysoko umístěných nebo vzdálených míst se může vlastní úkon odehrát u lana nebo v pracovním detailu. Například díra v plachtě je u x76, y14 a uvazovací místo příslušného lana u x44, y56.
- `station(sceneId, actorId)` je výchozí postavení. `actorGoal(sceneId, actorId, state)` dává posun od něj a `workStation(sceneId, actorId, state)` výsledné absolutní souřadnice. Jednorázový přechod k nové práci spustí příslušná událost, například rozžhavení výhně nebo přinesení vody. Vypočtené stanoviště platí také po načtení rozehrané hry.

## Kontrola

V polygonu každé scény jsme zkontrolovali vstupy, výstupy, stanoviště postav a pozice pro práci. Ze 163 různých pozic vyšlo 953 dvojic uvnitř stejné scény. Všech 953 tras dosáhlo cíle, u 179 se cesta zalomila kolem překážky. Kontrola využila navigaci dodávanou s hrou. [Výpočet trasy](../dist/ground.js)

Při druhé kontrole jsme promítli bod na konci natažené ruky skutečně použité postavy na otočený obraz předmětu. V referenční kompozici 1672 × 941 pixelů bod zasáhl namalovanou část u všech 25 sběratelných předmětů a také u čtyř dalších pracovních rekvizit. Výpočet používá konkrétní pózu Alicka nebo Musgrava, jejich vlastní poměry těla a místní hloubku. Chování těsně před dotykem a po něm lze posoudit až při přehrávání interakce. [Měření postav a rukou](../dist/assets/work-poses/manifest.json)
