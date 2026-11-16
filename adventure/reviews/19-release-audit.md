# 19 — Kontrola dokumentace a vydání

Kontrola 16. listopadu 2026 proti veřejnému základu `986fe974ebca9c6ff2b8d38c926828b1e0c5f048`. Jde o audit průběžně integrovaného pracovního stromu; pozdější úpravy potřebují závěrečný běh koordinátora. Tato revize nic necommitovala, nenasadila ani nepotvrzuje zveřejnění nové verze.

## Ověřený rozsah a soubory

- Hra zůstává první kapitolou se třemi propojenými lokacemi a cíli přístřeší, oheň, signál. README správně oddělují starší kampaň od nové adventury. Nové rozhraní nepředstavuje dokončenou adaptaci celého historického pobytu.
- Kontrolovaný `dist/` obsahoval **32 souborů, z toho 16 PNG**. Nový atlas UI přidává jednu malbu se šesti výřezy; nenahrazuje postavy ani prostředí. Celá složka `assets/ui/` měla 2 330 134 bajtů včetně JSON. Jde o velikost souborů, nikoli naměřený přenos nebo výkon.
- Všech **sedm lokálních odkazů na skripty a styly** z HTML existuje: `style.css`, `motion.css`, `interface.css`, `interface.js`, `art.js`, `engine.js`, `app.js`. Atlas je skutečně registrován a montován do HTML; test kontroluje všech šest výřezů.
- Kontrola kořenového README a všech tehdy dostupných Markdown dokumentů v `adventure/`: **24 dokumentů, 127 lokálních odkazů, žádný chybějící cíl**. Počty zachycují okamžik kontroly před přidáním této revize a dalších závěrečných záznamů; neověřují webové URL ani Markdown kotvy.

## Zjištění před závěrečnou aktualizací dokumentace

| Stav | Zjištění a konkrétní oprava |
| --- | --- |
| Předáno koordinátorovi | `SWARM.md` a `VISUAL_DESIGN.md` ještě popisovaly atlas, styly pohybu a role 15–19 jako čekající. Soubory už byly zapojené a dílčí revize vznikaly. Aktualizovat podle skutečně dostupných výsledků; ponechat výslovné meze browserového ověření. |
| Předáno koordinátorovi | Příkazy v `adventure/README.md` neuváděly nové `interface-art.cjs` a `polish-ui.cjs`; kořenový blok údržby neuváděl adventuru vůbec. Doplnit přesné závěrečné příkazy a výsledky do `TESTING.md`. |
| Předáno koordinátorovi | Záznam role 13 pravdivě popisuje svůj dřívější snapshot, v němž byl `engine.js` totožný se základem. Při integraci se změnily větve textových a obrazových rad NPC. Finální shrnutí proto nemá tvrdit, že celý engine zůstal beze změny. Diff těchto změn nemění formát uložení ani pravidla manipulace s předměty. |
| Drobná úplnost | Odstavec adventury v `RIGHTS.md` nepodává úplný výčet sady: vedle tří scén, hlavní postavy a předmětů existují čtyři vedlejší postavy, pět změn prostředí a nový atlas UI. Doplnit odkazy na dílčí manifesty; neudělovat tím novou obecnou licenci. |

Tyto řádky jsou nálezy v době auditu, nikoli tvrzení, že opravy v pozdějším commitu chybějí.

## Původ, licence a veřejný obsah

`RIGHTS.md` správně říká, že obecná licence nového obsahu není zvolená; samotná veřejnost repozitáře ji neuděluje. `UI_ART.md`, atlas a prompty označují novou AI ilustraci, nikoli historický artefakt nebo převzatou moderní ilustraci. SHA-256 atlasu byl ověřen proti jeho skutečným bajtům. Hash dokládá totožnost souboru s evidencí, sám nepotvrzuje autorská práva ani běh generátoru.

Cílená kontrola 29 tehdy změněných či nových textových souborů nenalezla vzory privátních klíčů, běžných přístupových tokenů, soukromých kontaktů ani cest k osobnímu zařízení. Jediný zásah kontroly jména účtu byl zamýšlený odkaz na veřejné projektové repo v nastavení hry. Pracovní cesty `/workspace/generated_images/…` v provenienci neobsahují uživatelovy osobní adresáře ani přístupové údaje. Tato omezená kontrola není úplným bezpečnostním auditem ani zárukou, že libovolný pozdější soubor je bezpečný k publikaci.

## Kontroly spuštěné touto rolí

```sh
node --test adventure/tests/engine.test.js adventure/tests/art-contract.cjs adventure/tests/interface-art.cjs adventure/tests/polish-ui.cjs
node adventure/tests/ui-contract.cjs
node --check adventure/dist/app.js
node --check adventure/dist/interface.js
node --check adventure/dist/art.js
node --check adventure/dist/engine.js
```

**26/26 Node testů prošlo**: 13 engine, 4 art, 4 interface a 5 polish. Samostatný UI kontrakt prošel a všechny čtyři syntaxové kontroly prošly. Test enginu stále prověřuje dosažitelné stavy a úplné dokončení. UI kontrakty používají minimální DOM mock: nepotvrzují layout, skutečné dotyky, nativní pořadí Tab, čtečku obrazovky nebo vzhled na mobilu. Chybí doložený úplný vizuální průchod výslednou složenou hrou a lidský playtest; bez nich nelze tvrdit plně ověřenou přístupnost či výslednou výtvarnou kvalitu.

## Evidence dvaceti rolí

Tabulka `SWARM.md` rozděluje **19 odborných rolí a koordinátora**, tedy 20 rolí; není důkazem 20 souběžných agentů. Živý nástrojový roster v době této kontroly ukázal koordinátora a specialisty 14–19, celkem sedm identit včetně dokončených běhů. Pro starší role byly dostupné dílčí soubory revizí; samotné soubory neprokazují počet nezávislých běhů ani použitý model. Koordinátor má doložit dřívější roster z historie spuštění a odlišit předepsané modely od ověřených údajů. Tento audit nemá podklad k nezávislému potvrzení všech 19 dřívějších a nynějších specialistů jen z aktuálního živého seznamu.

Závěrečný commit, nasazení Site a veřejný readback musí potvrdit koordinátor podle skutečného výsledku publikačních nástrojů.
