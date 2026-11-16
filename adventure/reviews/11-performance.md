# 11 — Výkon assetů a vykreslování

Statická kontrola `dist` dne 16. 11. 2026. Jde o velikosti souborů a výpočty z rozměrů, nikoli měření rychlosti sítě, doby dekódování, FPS ani paměti v konkrétním prohlížeči. Prohlížeč může obrázky načítat, sdílet, odkládat a uvolňovat různě; cache a její životnost určuje také server.

## Obrázky a načítání

Nová hra začíná na pláži. Z kódu vyplývají tyto jedinečné PNG požadované pro její první vykreslení (pokud existuje uložená pozice, může být počáteční sada jiná):

| Soubor | Rozměry | Bajtů na disku | Orientačně RGBA po dekódování |
|---|---:|---:|---:|
| `assets/beach.png` | 1672 × 941 | 3 101 847 | 6 293 408 B |
| `assets/sailor.png` | 1024 × 1536 | 2 108 785 | 6 291 456 B |
| `assets/props/tools.png` | 1536 × 1024 | 2 262 890 | 6 291 456 B |
| `assets/props/materials.png` | 1536 × 1024 | 2 234 892 | 6 291 456 B |
| `assets/people/raynal.png` | 1024 × 1536 | 2 002 408 | 6 291 456 B |
| **Celkem** | | **11 710 822 B (11,17 MiB)** | **31 459 232 B (30,00 MiB)** |

To je součet jednotlivých zdrojů, nikoli naměřený přenos; teplá cache, komprese přenosu a chování prohlížeče mohou výsledek změnit. Rozpočet dekódování počítá čtyři bajty na pixel i pro RGB pozadí; nejde o zaručenou alokaci a nezahrnuje další kopie či grafické plochy. Tři elementy námořníka ukazují stejnou URL: nepředpokládat tři síťová stažení ani tři sdílené bitmapy bez měření. Stejně tak různé výřezy SVG `<image>` odkazují na stejné dva atlasy rekvizit; jejich sdílení dekódované podoby není garantováno.

Všechny zdejší PNG dohromady mají **35 383 426 B (33,74 MiB)**, 16 různých souborů. Současný kód ani CSS neodkazují na `assets/ui/castaway-ui-atlas.png` (2 316 000 B); je doložen v manifestu, proto není součástí běžného načítání. Ostatních 15 souborů má celkem **33 067 426 B (31,54 MiB)**. Horní scénář, kdy hra během celé návštěvy skutečně vyžádá všech 15 a prohlížeč je současně ponechá dekódované, představuje přibližně **90 MiB** při čtyřech bajtech na pixel; cache může být menší i větší a tento scénář není měřením špičky. Všechny PNG mají odlišný SHA-256, takže mezi soubory nejsou přesné bajtové duplicity. Alternativy pozadí a stožáru jsou rozdílné soubory; běžné prohlížení všech stavů je může postupně načíst. Nevyužitý UI atlas ponechat jako zdroj pro případ další práce, ale nezapojovat ho automaticky do startu.

## Běh aplikace

- `render()` po akci znovu vytvoří cíle, východy a inventář jen částečně: cílové prvky uchovává podle scény a změněného markup, `worldChanges()` porovnává markup, ale cíle v hlavičce, východy a inventář přepisuje pokaždé. Na tomto malém počtu prvků zatím není prokázaný výkonnostní problém; opakované nahrazování může mít také dopad na fokus.
- Chůze běží přes `requestAnimationFrame` a každým snímkem zapisuje `left` a `top` postavy; to může vyvolat layout. Pokud profilování prokáže potíže, převést pohyb na `transform` či CSS proměnné používané transformací a zachovat současnou perspektivní velikost, směr a přerušení chůze. Neoptimalizovat naslepo.
- Při každém pohybu ukazatele se nastavuje poloha kurzorového předmětu i bez výběru; jednoduchá podmínka `selected` odstraní zbytečné zápisy. Na mobilu je kurzor stejně skrytý CSS. Při měřitelném problému lze zápisy navíc sloučit do jednoho snímku.
- Na scéně je 28 nepřetržitě animovaných kapek, rozostřená pohybující se mlha, zrnitý SVG turbulence overlay, stíny a místy jasový filtr pozadí. Po zapálení přibude animovaná záře s `mix-blend-mode` a plamen. Tyto efekty mohou zvýšit nároky na kompozici a překreslování zvláště na slabých zařízeních; jejich skutečnou cenu je nutné změřit. `prefers-reduced-motion` a uživatelské omezení pohybu animace vypínají a déšť skrývají.
- `will-change:left,top` na postavě není důkaz akcelerace a může držet prostředky. Při změně pohybu nejprve ověřit v profileru a případně odstranit či omezit jen na chůzi. Dialogové rozostření se týká pouze otevřeného dialogu.

## Doporučené další kroky

1. Na čisté a teplé cache změřit Network a Performance pro první pláž, přechod do obou scén a dokončený tábor; zaznamenat zařízení, viewport, síť, počet dekódovaných obrázků a dlouhé snímky. Bez toho netvrdit dosažené FPS ani čas načtení.
2. Zavést podmínku pro zápis pozice kurzoru a ověřit výběr, zrušení i mobilní ovládání. Ostatní úpravy animace a překreslování provádět podle výsledků měření; zachovat fokus a omezení pohybu.
3. Je-li úvodní přenos problém, zvážit cíleně menší samostatné publikované varianty nebo jiný formát při zachování originálů a jejich provenance; nejprve ověřit vizuální kvalitu, průhlednost, kompatibilitu a skutečnou úsporu. Dělení atlasů může naopak zvýšit počet požadavků. Přednačítání ostatních scén by zrychlilo přechod za cenu vyšší počáteční zátěže; bez měření jej nepřidávat.
