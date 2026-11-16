# Vizuální směr a provedená revize

16. listopadu 2026. Hra zachovává první kapitolu se třemi propojenými místnostmi a vizuální práci s předměty. Tato revize sjednocuje malovaný svět, horní lištu, inventář a dialogy. [Tým a modely](SWARM.md), [rozsah hry](README.md), [ověření](TESTING.md).

## Vzhled

Rozhraní používá teplé tmavé dřevo, režné plátno, kůži, papír, železo a malé plochy tlumené mosazi. Zeleň patří vegetaci; UI již nestojí na zelených plochách. Ořechový tón je výtvarná metafora, nikoli doložená dřevina lodi. Nejde o steampunk ani archeologickou rekonstrukci.

Nový [atlas rozhraní](UI_ART.md) obsahuje šest původních maleb. Dřevo a plátno fungují jako jemné materiálové textury; jejich krajní malovaný lem se při širokém ořezu záměrně neukazuje celý. Papír tvoří podklad dialogů, skutečný text zůstává v HTML. Brašna je malovaná, povely mají sjednocené inkoustové značky. Horní trojice cílů používá jeden kreslený jazyk. Výběr v inventáři se liší hranou i rohovým označením.

[interface.js](dist/interface.js) registruje výřezy a doplňuje inertní dekorace; [interface.css](dist/interface.css) je výsledná vrstva nad původním CSS. [motion.css](dist/motion.css) zklidňuje pohyb maleb, počasí a lokální oheň. Materiálové podklady nejsou nové herní předměty.

## Integrované opravy

| Oblast | Provedená změna |
|---|---|
| Výřezy atlasů | Každá malba má skutečný vnitřní SVG viewport s přesnými rozměry a ořezem; inline rozměry chrání před obecným CSS. Vnější zarovnání `meet` či `slice` už neodhaluje sousední objekty. |
| Hloubka | Pořadí hráče a lidí se řídí výškou chodidel. NPC nepřeskakují přes hráče jen kvůli pevnému pořadí vrstev. |
| Rekvizity | Bidlo na břehu má větší měřítko. Po naštípání nezůstává druhý obrázek třísek na místě. |
| Vizuální rady | Lidé reagují na vložené dřevo, hotovou střechu a signál. Kamenná patka se v nápovědě před postavením stožáru ukazuje v současném stavu. |
| Ovládání | Popisky reagují na klávesový fokus; Shift+F10 a klávesa místní nabídky prohlížejí bez spotřebování věci. Nezměněné objekty se při každé reakci nevytvářejí znovu. |
| Dialogy | Nastavení zachovává fokus přepínače, zavření vrací fokus. Text nápovědy je dostupný čtečce i při vypnutých viditelných titulcích. |
| Finále | Nízký landscape má omezenou výšku a vlastní scroll. Závěr čeká na zavření případného modalu; restart zruší odložené finále. |
| Kontrast | Drobný text je tmavší; sekundární tlačítko má čitelné hover popředí. Mobilní doplňkové popisky byly zvětšeny. |
| Uložení | Verze a klíč v3 zůstávají; poškozený JSON hry už nebrání načíst nezávislé preference. Selhání uložení je označeno znakem i přístupným popisem. |
| Pohyb | Menší výkyv rozdělené postavy, jemný klid NPC, lokální oheň, pomalejší mlha. Nehýbe se celý stožár kvůli vlajce. Respektováno omezení pohybu. |

## Co zůstává otevřené

Neproběhl ověřený průchod celé složené hry skutečným prohlížečem: spravovaný náhled selhal na relay portu 4173. Statická kontrola a testy tak nedokládají výsledné pixely, nativní chování dialogů, dotyk, 200% zoom nebo reálnou plynulost. Není doložena úplná přístupnost ani FPS. [Podrobnosti testů](TESTING.md).

Hlavní postava nadále používá jednu rozdělenou malbu; nejde o plnou snímkovou chůzi. Další výtvarnou prací jsou vlastní pohybové pózy a samostatné vrstvy vlajky, kouře a plamenů. Výrazné dekorativní předměty ve vraku mohou ještě mást svou podobností s interaktivními rekvizitami; zaslouží skutečný playtest a případné drobné reakce. Ne všechny malé dotykové cíle dosahují 44 px.

Další kapitoly (zima, kovárna, člun, plavba a návrat) nejsou tímto krokem dokončeny. První noc je herní fikce; nové obrazy nejsou autentické portréty, dobové ilustrace ani důkaz konkrétního rozmístění věcí. Hra netvrdí doložené setkání s Invercauldem.

## Podklady

[Materiálová kultura](reviews/05-material-culture.md), [výtvarná oponentura](reviews/18-final-design.md), [kompozice](reviews/10-scene-composition.md), [kontrast](reviews/15-palette-qa.md), [provenience](reviews/16-provenance.md), [nezávislé QA](reviews/17-input-qa.md), [audit vydání](reviews/19-release-audit.md). Starší dílčí zprávy mohou uvádět stav před navazující opravou; tento dokument popisuje integrovaný výsledek.
