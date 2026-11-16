# Režie pohybu

Soubor `dist/motion.css` je samostatná vrstva určená za `style.css`. Nemění umístění herních objektů, měřítko postavy ani poměr scény 16:9. Napojení do HTML provádí koordinátor.

## Provedené změny

- Výkyv vystřižených nohou se zmenšuje z ±8° na ±1,8°; půlkrok trvá 560 ms místo 420 ms. Torzo při chůzi pouze nepatrně přenáší váhu, bez rotace. V klidu se neodděluje od nohou.
- Vedlejší postavy mají samostatně posunuté fáze velmi jemného klidu: 0,35 px za 7,8 s, bez natahování či naklánění celého těla.
- Obrazová reakce a titulky se objevují jedním krátkým dozněním, bez pružného poskakování. Úvodní gesto skončí po třech pomalých cyklech.
- Oheň používá lokální teplou záři a mírnou změnu opacity. Malba ohně, polen a kouře se nenatahuje jako celek. Současná malba vlajky obsahuje i tyč; její rotace je vypnuta, dokud nebude vlajka samostatnou vrstvou.
- Mlha má pomalejší, menší vodorovný posun. Přechod mezi scénami dostává klidnější průběh opacity; načasování výměny scény zůstává odpovědností aplikace.
- Dekorace neodchytávají ukazatel. `.reduced` i systémové `prefers-reduced-motion` vypínají CSS animace a přechody včetně dekorací a zvedání inventáře při hoveru.

## Meze tohoto kroku

Hlavní postava stále používá jednu malbu rozdělenou pomocí `clip-path`. Toto **není snímková animace chůze**. Menší úhly omezují trhání okrajů a klouzání chodidel, ale skutečný kontakt chodidla se zemí neumějí vyřešit. Rychlost přesunu po scéně řídí `walkTo` v aplikaci; tento soubor ji nemění. Také sám neopravuje pořadí zakrytí, výměny pozadí a odkrytí scény.

Další kvalitativní krok: připravit oddělené siluety ve shodném světle, 6–8 snímků kroku pro dva směry, pevný bod chodidla a konstantní výšku trupu. Změřit vzdálenost jednoho cyklu ve světových souřadnicích a fázi kroku odvozovat od skutečně uražené vzdálenosti. Přidat samostatné 3–4 snímky krátkého dosahu ruky a statický klidový snímek. Vlajku oddělit od tyče, plamen od polen a kouř od ohně. Před exportem ověřit návaznost alfa okrajů a kontakt se stínem v měřítku hry.

## Ověření

Statická kontrola prošla v headless Chromium (`/usr/bin/chromium`) přes CSSOM: načteno 32 pravidel a všech osm použitých `castaway-*` animací má definici. Kontrola nezjistila přepis světových souřadnic ani rozměrů scény. Výpočet stylu NPC v běžném režimu vrátil `castaway-idle`; po přidání `.reduced` i při emulaci systémového `prefers-reduced-motion: reduce` vrátil `none`. Vizuální přehrání celé hry není součástí tohoto dílčího kroku.
