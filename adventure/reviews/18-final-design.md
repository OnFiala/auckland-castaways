# 18 — Závěrečná výtvarná a UX revize

16. listopadu 2026. **Implementace odpovídá přijatému rozsahu první kapitoly; finální vzhled dosud nemá browserovou přejímku.** Tři scény, sběr, kombinace a použití věcí směřují k přístřeší, ohni a signálu. Dokumentace ani závěr neslibují hotovou devatenáctiměsíční adaptaci.

Podklad: aktuální `index.html`, `app.js`, `style.css`, `interface.css`, `interface.js`, `motion.css` a registry výřezů. Přes `view_image` byly skutečně prohlédnuty UI atlas, břeh, vrak, tábor, zastřešený tábor a Henry. Jsou to **samostatné zdrojové obrazy**, nikoli snímky složené hry. Spravovaný náhled podle [záznamu testování](../TESTING.md) selhává na browserovém relay; tato revize neinstalovala náhradní prohlížeč.

## Zásadní nález a ověřená oprava

Původní `painting()` i `painted()` vkládaly celý atlas do SVG. Samotný `viewBox` s `meet` a vnějším `overflow:hidden` neořezává obsah na zvolenou buňku: volný prostor při jiném poměru stran mohl odhalit sousední předmět. Například původní obal bidla 12 % × 12 % na scéně 16:9 zpřístupnil přibližně x336–1209 atlasu místo zamýšlených x533–1012.

Koordinátor doplnil v obou funkcích vnitřní `svg.atlas-clip`, jehož poloha, rozměry i `viewBox` odpovídají `a.box`. Následně byla odstraněna druhá příčina: obecné selektory `.target svg`, `.item svg` a `dialog svg` přepisovaly rozměry vnitřního SVG. **Finální inline šířka, výška a `overflow:hidden!important` udržují samostatný ořez.** Geometrie je nyní konzistentní; kontrola vygenerovaného markup ověřila všech šest UI výřezů. Nejde o pixelový test.

## Kontrola jednotlivých částí

1. **Scény a vrstvy — opraveno v kódu, obrazový průchod zbývá.** Hráč a NPC sdílejí prostor vrstev, jejich pořadí určují chodidla; nadřazené `.targets` a `.world-changes` už toto pořadí neuzavírají do oddělených vrstev. Bidlo má větší obal 18 % × 22 %. Ověřit průchod za Henrym a Georgem a všech pět siluet po skrytí závěrečné karty.
2. **Horní a spodní nabídka — barevný směr splněn, materiál je textura.** Finální kaskáda používá hnědou, plátno a tlumenou mosaz; zelená vegetace patří krajině. Při 1200 × 64 px ukazuje `slice` jen 26,3 z 191 výškových jednotek dřeva. Hřeby a malovaný lem proto nejsou zachovaným rámem. To je přijatelné jako záměrná textura; pokud se má zobrazovat celý okraj, potřebuje samostatné okrajové díly. Nenavyšovat plošně kontrast textury pod drobnými popisky.
3. **Mobilní čitelnost — zlepšená, stále k přejímce.** Nejmenší podtitul byl zvýšen na 8 px, „Jak hrát“ na 9 px. Zůstávají malé; na úzké scéně ověřit rozpoznání cílů, čitelnost popisků a zjevnost vodorovného posunu brašny. Nativní scrollbar nemusí být stále viditelný. Potvrzené skrytí potřebného předmětu by vyžadovalo malou směrovou značku.
4. **Pohyb a závěr — omezená animace je přiznaná.** Zklidnění rozdělené malby není plnohodnotná snímková chůze. Redukovaný pohyb má explicitní pravidla; finále umožňuje zůstat u společného výsledku. Plynulost, střih při změně pozadí a skutečný fokus nelze převzít ze statického kódu.

Před vizuálním schválením zbývá složený průchod břeh → vrak → tábor → finále, včetně inventáře, nápovědy a nastavení na desktopu, úzkém telefonu a nízkém landscape. Prohlédnuté obrazy ani testy markup nejsou důkazem této přejímky.
