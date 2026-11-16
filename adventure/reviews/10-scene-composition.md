# 10 — Kompozice a návaznost scén

Revize 16. 11. 2026. Bez změn aplikace nebo obrazů. Přečteny revize 01–06, `dist/app.js`, `art.js`, `engine.js`, výsledná pravidla CSS a HTML. Přes `view_image` prohlédnuty pláž, vrak, tábor, zastřešený tábor, otevřený vrak, oheň, stožár s vlajkou, protagonista, Henry, Raynal a oba atlasy předmětů. Musgrave a George zahrnuti do geometrického výpočtu z PNG, nikoli do samostatné portrétní obrazové revize.

**Metoda:** statická geometrie podle kódu a obrazových podkladů; žádný browserový průchod ani screenshot výsledné kompozice. Referenční scéna 1672 × 940,5 px odpovídá CSS 16:9. U PNG je měřen obdélník pixelů s alfa >128, nikoli neviditelná plocha celého obrázku. SVG `xMidYMid meet` zachovává poměr stran; uvedené hodnoty zahrnují vložené prázdné okraje. Bez animace a myšlenkových bublin.

## Spočtené hranice

Souřadnice jsou `(levá, horní)–(pravá, dolní)` v pixelech referenční scény, zaokrouhlené na desetinu. Pro jinou šířku scény násobit šířkou /1672.

| Prvek / stav | CSS obal | Viditelná malba, alfa >128 |
|---|---|---|
| Oheň | (367,8; 371,5)–(535,0; 644,2) | (369,6; 456,0)–(533,2; 644,0) |
| Stožár s vlajkou | (691,4; 141,1)–(793,4; 460,8) | (692,5; 141,6)–(792,4; 460,3) |
| Henry, tábor | (865,3; 475,0)–(1007,4; 714,8) | (892,7; 476,4)–(979,9; 713,4) |
| Raynal, pláž | (1283,3; 451,4)–(1425,4; 705,4) | (1312,6; 452,9)–(1396,0; 703,9) |
| Musgrave, finále | (647,9; 456,1)–(790,0; 696,0) | (671,4; 457,6)–(766,5; 694,6) |
| Raynal, finále | (1149,5; 460,8)–(1291,6; 714,8) | (1178,8; 462,3)–(1262,3; 713,3) |
| George, finále | (1333,4; 479,7)–(1475,5; 743,0) | (1352,7; 481,2)–(1456,2; 741,4) |
| Hráč, výchozí x45/y84 | (649,2; 480,5)–(855,6; 790,0) | (684,7; 483,5)–(803,6; 787,6) |

Výpočet: `s = min(šířka obalu / šířka viewBox, výška obalu / výška viewBox)`. Alfa hranice se přenášejí relativně k levému hornímu rohu viewBoxu. Hráč používá celý 1024 ×1536 obrázek a další faktor `0,8 + (y−68)/70`; při y84 je 1,02857. Alfa >128 nezachytí jemný kouř a měkké lemy: oheň má kouř již od horní části obalu, nikoli až od y456.

## Priority k opravě / ověření

1. **Hloubka pohybujícího se hráče je pevná.** `.player` má z12, `.targets` z10 a `.world-changes` z5. Hráč může jít na y74, zatímco Henry má chodidla y76 a George ve finále y79; při překryvu se přesto kreslí vpředu. Převést postavy do společného prostoru vrstev a řadit podle chodidel, nebo u stávající malé scény zakázat překryvové průchody za NPC. Pouhé `z-index` dítěte uvnitř oddělených stacking contexts problém neřeší. Browserem projet x56/y74 a x84/y74 ve finále.
2. **Bidlo mění zdánlivou délku.** Na pláži obal 12 % ×12 % při čtvercovém výřezu atlasu vykreslí bidlo přibližně do 110 ×113 px; úhlopříčka je ~158 px. Vztyčený stožár má výšku ~320 px, přesto stojí dál ve scéně. Jde o výtvarnou diskontinuitu téhož předmětu, ne historický závěr. Zvětšit ležící bidlo a přizpůsobit jeho polohu; jako výchozí zkoušku použít obal 18 % ×22 % (malba přibližně 202 ×207 px), potom ověřit překryvy a dosah cíle. Inventář zůstává symbolickým měřítkem.
3. **Dekorace vraku slibuje stejné akce jako questové rekvizity.** Velké svinuté lano vlevo dole a plachta na trupu jsou součástí pozadí; `engine.js` zde nabízí jen páku, bednu a Musgrava. Přidat úspornou prohlídku s vysvětlením stavu, bez dalšího sběru, nebo zjevně odlišit nepoužitelnost. Stejnou kontrolu zaslouží děrovaná železná deska u pravého stromu v táboře. Nepřidávat trvalé značky nad každou dekoraci.

## Co v současných podkladech drží

- **Oheň:** střed x27 % souhlasí s ohništěm; dolní okraj malby y68,47 % leží uvnitř vizuální oblasti kamenného kruhu (přibližně y61–71 %). Není podklad pro přesouvání ohně jen podle vysokého obalu s kouřem. Dřevo před zapálením je u stejného středu y67 %. Ve výsledku ověřit, zda polena nezakrývají celý přední kámen; statické hranice samotné to nerozhodnou.
- **Stožár:** patka malby je vlevo od středu výřezu, což kód správně kompenzuje x44,4 %. Spodní konec se promítá přibližně k x42 %, k aktivní kamenné patce. Malba patky končí kolem y48,2 %, stožár y48,94 %; rozdíl ~7 px není důkaz levitace. Při kontrole se zaměřit na kontakt dolního konce, ne na střed vlajky.
- **Střecha:** `camp-shelter.png` zachovává hlavní kůly, ohniště a cestu, přidává čitelnou plachtu. Zůstává stejný nízký provizorní přístřešek. Plná výměna pozadí může drobně měnit texturu i mimo střechu; před vydáním rychle přepnout oba stavy při stejném postavení hráče a zkontrolovat případné probliknutí.
- **Bedna:** otevřená varianta ponechává základnu bedny na stejném kameni a zřetelně zvedá víko. Zdroj má šířku 1671 místo 1672 px; roztažení pozadí to vyrovná a samo nevyžaduje opravu. Podobně ověřit přepnutí bez skoku okolní kresby.
- **Postavy a měřítko:** protagonista při y84 má viditelnou výšku ~304 px, Henry ~237 px při y76. Větší postava v popředí je konzistentní s perspektivou. Prázdná šířka NPC tlačítka není skutečná tloušťka postavy. Bez browseru nedoporučuji plošné zmenšování lidí.
- **Celá skupina:** finále přidává Musgrava, Raynala a George, zachovává Henryho a hráče: pět postav v táboře. Čtyři NPC mají vzájemně oddělené viditelné obdélníky. Hráč může po dokončení některou postavu překrýt; závěrečné záběry kontrolovat i po skrytí dokončovací karty a při různém pořadí poslední hádanky.

## Přejímka v prohlížeči

Zkontrolovat tři scény před/po sebrání předmětů; střechu, polena, oheň, holý stožár, vlajku a otevřenou bednu. Ve finále zavřít kartu a vidět všech pět siluet současně. Projít před a za každou postavou, porovnat chodidla se stínem a otestovat malé mobilní zobrazení. Mobilní minimální 27px cíle mohou změnit geometrii obalů proti této tabulce. Nová UI paleta již v závěrečném CSS používá hnědou/plátno; tuto revizi neřešit zelenými obrysy, filtry ani trvalými zelenými značkami. Přírodní vegetace není UI.
