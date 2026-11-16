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

## Historické a implementační meze

Jde o autorskou výtvarnou interpretaci Aucklandova ostrova a lodního materiálu 19. století, nikoli přesnou rekonstrukci vraku, nářadí nebo archeologické lokality. Námořník je původní stylizovaná postava a není ověřeným portrétem konkrétního člena posádky. Připravená táborová konstrukce i rozmístění nalezených věcí slouží herním hádankám.

Podklady vraku a tábora obsahují také namalované předměty a konstrukce. Při integraci se jejich viditelný stav musí sladit s inventářem a hotspoty; samotná změna herního stavu neodstraní předmět z PNG. Z pláže byly volné sbírané předměty odstraněny a patří dynamické vrstvě. Vizuální kontrola jednotlivých assetů nezastupuje kontrolu hotové hry v prohlížeči.

Tyto podklady nemění dosavadní rozhodnutí projektu o licenci. Manifest popisuje vznik a použití; sám nepřiděluje obecnou licenci celému repozitáři.
