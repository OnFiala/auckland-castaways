# Výtvarné podklady adventury

Datum: 16. listopadu 2026. Čtyři nové původní obrazy byly vytvořeny pomocí `image_gen.imagegen` pro point-and-click adventuru. Používají kresbu tužkou a inkoustem, kvašové plochy, zvětralou papírovou texturu a tlumenou paletu moře, mechu a okru. Směr zdůrazňuje vizuální řešení situací a čitelné objekty; nejsou převzaty postavy, roboti ani konkrétní grafika jiné hry.

| Soubor | Rozměry | Zamýšlené použití |
|---|---|---|
| [beach.png](dist/assets/beach.png) | 1672 × 941 | Pobřeží s vyčištěnými místy pro dynamické předměty, cesta k vraku a do lesa. |
| [wreck.png](dist/assets/wreck.png) | 1672 × 941 | Detail vraku, dosažitelná bedna, výše zavěšené plátno. |
| [camp.png](dist/assets/camp.png) | 1672 × 941 | Nedokončená konstrukce přístřešku, studené ohniště, vyhlídková skála. |
| [sailor.png](dist/assets/sailor.png) | 1024 × 1536, RGBA | Celá stylizovaná postava otočená doprava pro herní ovládání. |

Všechny obrazy byly zkontrolované samostatně. Prostředí mají širokou spodní část pro chůzi. Postava obsahuje skutečný alfa kanál; všechny čtyři rohy jsou plně průhledné. Jde o jedinou stojící pózu, nikoli předstíranou sadu snímků chůze. Pohyb, otočení, stín a další stavové vrstvy může vytvořit rozhraní hry.

[Manifest](dist/assets/manifest.json) uchovává úplné prompty, původní názvy vytvořených souborů, velikosti, rozměry, barevné režimy a SHA-256. Výsledné PNG byly zkopírovány beze změny z výstupu generátoru; původní výstupy zůstaly zachované. Pozadí beach.png prošlo navazující úpravou přes image_gen: odstranění namalovaného lana a volného dřeva, aby sbírané předměty mohlo kreslit a odstraňovat herní rozhraní. Manifest uchovává také prompt úpravy a hash předchozího podkladu. Knihovní fotografie ani moderní ilustrace nebyly použité jako předlohy.

## Sjednocená malovaná sada

Aktuální hra používá čtyři malované vedlejší postavy, jedenáct samostatných rekvizit ze dvou průhledných atlasů a pět dalších maleb pro změny prostředí. Vektorové figurky i světové kresby předmětů byly odstraněny. Podrobný původ: [postavy](PEOPLE_ART.md), [předměty](PROPS_ART.md), [stavy prostředí](STATE_ART.md).

Registr [art.js](dist/art.js) definuje přesné výřezy z nezměněných PNG. Stejný předmět ve scéně, brašně, u kurzoru i v obrazové nápovědě používá stejnou malbu. Poměr stran zůstává zachovaný a výřezy atlasu jsou oříznuté uvnitř SVG, takže sousední rekvizity nepřetékají. Bedna v nápovědě používá výřez její původní malby ve vraku. Základní značky ovládání zůstávají jednoduchými symboly.

Postavy mají individuální výřezy siluet, kontaktní stín a jemný pohyb v klidu. Chodidla jsou umístěna do společné zemní roviny podle hloubky scény. Plachta přepíná celé tábořiště a otevření bedny celé pozadí vraku. Oheň a oba stavy stožáru používají průhledné malby; společná registrace stožáru brání posunu při uvázání vlajky. Jde stále o animaci jednotlivých maleb, nikoli plnou sadu kreslených snímků.

## Historické a implementační meze

Jde o autorskou výtvarnou interpretaci Aucklandova ostrova a lodního materiálu 19. století, nikoli přesnou rekonstrukci vraku, nářadí nebo archeologické lokality. Námořník je původní stylizovaná postava a není ověřeným portrétem konkrétního člena posádky. Připravená táborová konstrukce i rozmístění nalezených věcí slouží herním hádankám.

Podklady vraku a tábora obsahují také namalované předměty a konstrukce. Při integraci se jejich viditelný stav musí sladit s inventářem a hotspoty; samotná změna herního stavu neodstraní předmět z PNG. Z pláže byly volné sbírané předměty odstraněny a patří dynamické vrstvě. Vizuální kontrola jednotlivých assetů nezastupuje kontrolu hotové hry v prohlížeči.

Tyto podklady nemění dosavadní rozhodnutí projektu o licenci. Manifest popisuje vznik a použití; sám nepřiděluje obecnou licenci celému repozitáři.

## Rozhraní z téže výtvarné sady

[UI_ART](UI_ART.md) dokládá šest materiálových prvků v jednom původním PNG. Hra používá malované dřevo, plátno, papír a brašnu i mimo samotnou scénu. Objekty a UI mají skutečný vnitřní SVG ořez, aby se při různých poměrech stran nezobrazily sousední části atlasu. Souřadnice a vnitřní viewport se ověřují testem; výsledný render zůstává předmětem browserové kontroly.
