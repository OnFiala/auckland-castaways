# Výtvarné podklady adventury

## Aktuální herní sada

Sedm kapitol používá malované prostředí, různé stavy rozpracovaných úloh, samostatné rekvizity a atlasy postav. Přepracování drží místa pro chůzi, sběr předmětů a práci. Hra odlišuje studené, mokré a pozdější stavy a má vlastní malby pro opakované návštěvy vybraných míst. Prohlídku novější podoby popisuje [výtvarná a povětrnostní kontrola](reviews/26-weather-and-art.md).

Rozměry, kontrolní součty a případné úpravy každého herního souboru uvádí jeho manifest. Pro pracovní detaily jsou samostatně evidované malované PNG a méně objemné herní WebP v plném rozlišení. [První kapitola](dist/assets/manifest.json) · [Stavové obrazy](dist/assets/states/manifest.json) · [Pozadí dalších kapitol](dist/assets/voyage/scenes/manifest.json) · [Pracovní detaily PNG](artwork/workplates/manifest.json) · [Pracovní detaily WebP](dist/assets/workplates/manifest.json)

## Archiv první výtvarné sady z 16. listopadu 2026

Čtyři původní obrazy byly vytvořeny pomocí `image_gen.imagegen`. Používaly kresbu tužkou a inkoustem, kvašové plochy, zvětralou papírovou texturu a tlumenou paletu moře, mechu a okru. Směr zdůrazňoval vizuální řešení situací a čitelné objekty. Grafika vznikla pro tuto hru. Tabulka popisuje tehdejší výstupy a odkazy vedou na odpovídající cesty v aktuální hře.

| Soubor | Rozměry | Zamýšlené použití |
|---|---|---|
| [beach.png](dist/assets/beach.png) | 1672 × 941 | Pobřeží s vyčištěnými místy pro dynamické předměty, cesta k vraku a do lesa. |
| [wreck.png](dist/assets/wreck.png) | 1672 × 941 | Detail vraku, dosažitelná bedna, výše zavěšené plátno. |
| [camp.png](dist/assets/camp.png) | 1672 × 941 | Nedokončená konstrukce přístřešku, studené ohniště, vyhlídková skála. |
| [sailor.png](dist/assets/sailor.png) | 1024 × 1536, RGBA | Celá stylizovaná postava otočená doprava pro herní ovládání. |

Všechny čtyři obrazy byly zkontrolované samostatně. Prostředí měla širokou spodní část pro chůzi. U stojící postavy kontrola tehdy potvrdila alfa kanál a všechny čtyři plně průhledné rohy. Otočení, stín a další vrstvy v této fázi doplňovalo rozhraní hry.

Pro tuto verzi byla výsledná PNG zkopírována beze změny z výstupu generátoru. Navazující editace pláže v ImageGenu odstranila namalované lano a volné dřevo, aby hra mohla předměty samostatně zobrazit a po sebrání skrýt. Vstupem byly místní malby projektu. Původ a kontrolní součty předchozích souborů zůstávají u příslušných položek. [Manifest první kapitoly](dist/assets/manifest.json)

### Sjednocení malované sady v první verzi

Tato verze přidala čtyři malované vedlejší postavy, rekvizity ze dvou průhledných atlasů a pět maleb pro změny prostředí. Nahradila vektorové figurky i vektorové kresby předmětů ve scéně. [Postavy](PEOPLE_ART.md) · [Předměty](PROPS_ART.md) · [Stavy prostředí](STATE_ART.md)

Stejný předmět ve scéně, brašně, u kurzoru i v obrazové nápovědě používal stejnou malbu. Výřezy byly oříznuté uvnitř SVG se zachovaným poměrem stran. Bedna v nápovědě používala výřez její tehdejší malby ve vraku. Základní značky ovládání měly podobu jednoduchých symbolů. [Registr výřezů ve hře](dist/art.js)

Postavy měly individuální výřezy siluet, kontaktní stín a jemný pohyb v klidu. Chodidla se zasazovala do zemní roviny podle hloubky scény. Plachta přepínala celé tábořiště a otevření bedny celé pozadí vraku. Oheň a oba stavy stožáru používaly průhledné malby. Společné umístění stožáru bránilo posunu při uvázání vlajky.

## Historické a implementační meze

Jde o autorskou výtvarnou interpretaci Aucklandova ostrova a lodního materiálu 19. století, nikoli přesnou rekonstrukci vraku, nářadí nebo archeologické lokality. Námořník je původní stylizovaná postava a není ověřeným portrétem konkrétního člena posádky. Připravená táborová konstrukce i rozmístění nalezených věcí slouží herním hádankám.

Podklady vraku a tábora obsahují také namalované předměty a konstrukce. Při integraci se jejich viditelný stav musí sladit s inventářem a hotspoty; samotná změna herního stavu neodstraní předmět z PNG. Z pláže byly volné sbírané předměty odstraněny a patří dynamické vrstvě. Vizuální kontrola jednotlivých assetů nezastupuje kontrolu hotové hry v prohlížeči.

Tyto podklady nemění dosavadní rozhodnutí projektu o licenci. Manifest popisuje vznik a použití; sám nepřiděluje obecnou licenci celému repozitáři.

## Rozhraní z téže výtvarné sady

[UI_ART](UI_ART.md) dokládá šest materiálových prvků v jednom původním PNG. Hra používá malované dřevo, plátno, papír a brašnu i mimo samotnou scénu. Objekty a UI mají skutečný vnitřní SVG ořez, aby se při různých poměrech stran nezobrazily sousední části atlasu. Souřadnice a vnitřní viewport se ověřují testem; výsledný render zůstává předmětem browserové kontroly.

## Chůze, pracovní pózy a rozhovory

Pět samostatných atlasů obsahuje celkem 30 krokových póz. Samostatné pracovní atlasy přidávají pózy pro úkony na místě. Vzhled postav navazuje na stojící malby. Hru doprovázejí krátké anglické rozhovory a pohyb prostředí. [Krokové atlasy](WALK_ART.md) · [Pracovní pózy](dist/assets/work-poses/manifest.json) · [Živé prostředí](LIVING_WORLD.md)
