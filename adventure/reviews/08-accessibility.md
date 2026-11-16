# Přístupnost a ovládání adventury

Kontrola 16. listopadu 2026: zdrojový kód `dist/index.html`, `dist/app.js` a výsledná teplá paleta na konci `dist/style.css`. Jde o audit implementace a výpočet kontrastu barevných dvojic, nikoli o browserový audit nebo prohlášení shody s WCAG. Čtečka obrazovky, skutečné pořadí Tab, dotyk, zvětšení textu a kompozice malovaných scén nebyly v této kontrole ověřeny.

## Opravy provedené v app.js

- Text výsledné rady `h.text` zůstává v `#modal-body` vždy. Při vypnutých titulcích má třídu `.sr-only`, při zapnutých `.small`; obrazové SVG jsou správně dekorativní. Přístupné znění rady už není podmíněné vizuálními titulky. CSS musí zachovat `.sr-only` v přístupnostním stromu: nepoužívat `display:none`, `visibility:hidden` ani `hidden`.
- Tlačítka `#toggle-captions` a `#toggle-motion` po obnovení obsahu nastavení znovu dostanou fokus. Mají stabilní jméno přes `aria-labelledby` a stav přes `aria-pressed`. Jméno omezení animací výslovně odpovídá stavu: stisknuto znamená omezené animace.
- `inspectKey()` obsluhuje Shift+F10 a klávesu místní nabídky na `.target` a `.item`. Zabrání výchozí místní nabídce, spustí stejnou prohlídku jako pravé tlačítko a nekliká na předmět ani nemění jeho výběr. Nativní browser mohl místní nabídku obsloužit již před úpravou; nyní je tato akce explicitní a uvedená v nápovědě ovládání.

Ověření po úpravách: `node --check adventure/dist/app.js` a `node adventure/tests/ui-contract.cjs` prošly. Stávající test používá DOM mock; neověřuje nové zkratky ve skutečném prohlížeči ani správné vyslovení jmen čtečkou.

## Klávesnice, fokus a dialogy

Dobré základy: cíle, východy i inventář jsou skutečná tlačítka; každý má textové přístupné jméno. Fokus zobrazuje název v `#action-label` stejně jako hover. Výběr inventáře má `aria-pressed` a při prostém vybrání zůstává fokus zachován. SVG maleb mají `aria-hidden="true"`, takže neznečišťují jména tlačítek. `#modal` používá nativní `dialog.showModal()`, nadpis přes `aria-labelledby` a po zavření vrací fokus k existujícímu původci. Globální Esc se při otevřeném dialogu neprovede. Skryté prvky respektují `[hidden]{display:none!important}`.

Zbývající konkrétní doporučení:

1. **Fokus po změně scény a spotřebování předmětu.** `exitScene()` odstraní aktivní východ a `render()` obnovuje celý `#inventory`. Po cestě nebo úspěšné kombinaci tedy může aktivní tlačítko zmizet. Po cestě zaměřit pojmenovanou scénu; po kombinaci nový výsledný předmět nebo nejbližší zachovaný předmět. Po sebrání věci lze zaměřit novou inventární položku. Současné zachování v `setSelected()` řeší pouze prostý výběr. `.scene` má `outline:0`, takže při jejím programovém zaměření zajistit zřetelný indikátor nebo zaměřit pojmenovaný nadpis.
2. **Finále.** Původní `#completion` je běžný překryv bez automatického přesunu fokusu. Koordinátor řeší jeho sémantiku, fokus a návrat ke hře samostatně. Pokud zůstane nemodální oblastí, nepřidávat zavádějící `aria-modal`; pokud se stane modalem, zamezit práci s podkladovou scénou a vracet fokus po zavření.
3. **Stav uložení.** `#saved` má konstantní jméno „Stav ukládání“, ale `save()` výsledek mění pouze barvou a `title`. Do přístupného textu zahrnout skutečné „Uloženo v tomto prohlížeči“ / „Ukládání není dostupné“. Selhání zobrazit také textově, bez závislosti na hoveru. Pro oznámení použít samostatný stav a nezahlcovat čtečku každým úspěšným uložením.
4. **Pořadí Tab.** `targetMarkup` zachovává nedotčené cíle, ale změněný cíl připojí na konec. Tabulátor tak nemusí sledovat stále stejnou logickou cestu. Při browserové kontrole projít začátek i rozehranou scénu, nikoli jen první načtení.

## Kontrast výsledné teplé palety

Výpočet používá lineární relativní jas sRGB a poměr `(Lsvětlejší + 0,05)/(Ltmavší + 0,05)`. U neprůhledných gradientů je uveden méně příznivý koncový odstín. Nejde o vzorkování screenshotu. Překryvy s alfa kanálem, obrázky, stíny a celková opacity potřebují skutečnou výslednou barvu v konkrétním pixelu.

| Obsah / selektor | Popředí | Posuzované pozadí | Poměr |
| --- | --- | --- | ---: |
| `.brand` | `#e9d8b4` | `#49362a` | 8,10 : 1 |
| `.brand span` | `#baa47e` | `#49362a` | 4,72 : 1 |
| `.interaction-line` | `#e2d2b0` | `#291f1a` | 10,79 : 1 |
| `.help` | `#dfc9a2` | `#574333` | 5,77 : 1 |
| `dialog`, `.completion` běžný text | `#423025` | `#ddcaa5` | 7,77 : 1 |
| `.setting button`, `.dialog-button` | `#f5e8cd` | `#564032` | 7,96 : 1 |
| `dialog a` | `#60401f` | `#ddcaa5` | 5,81 : 1 |
| Původní `.small`, `.completion small` | `#6c5946` | `#ddcaa5` | **4,14 : 1** |
| Fokus hlavičkového tlačítka | `#f4d78d` | `#5a4738` | 6,25 : 1 |
| Fokus v dialogu | `#764a20` | `#ddcaa5` | 4,72 : 1 |

Původní drobný text dosahuje na světlém konci `#f0e3c6` poměru 5,23 : 1, na tmavém konci však jen 4,14 : 1. Doporučeno ztmavit na `#5f4b38` nebo podobně tmavý odstín. Koordinátor opravu kontrastu řeší v CSS. Velikost `.small` je 11 px, `.completion small` 8–9 px a `.help span` na malém mobilu 7 px; dobrý poměr jasu nenahrazuje čitelnost. Pomocné instrukce by měly mít alespoň přibližně 12–14 px a snést zvětšení.

`.scene-label`, `.exit` a obrys hotspotů jsou nad proměnlivou malbou. Stín textu a tmavé podložení východů pomáhají, ale samotné hex hodnoty jejich kontrast nedokazují. `.exit` navíc dědí `opacity:.7`; `.goal` pro nesplněné cíle `opacity:.42`. Ověřit na všech scénách včetně zahřátého tábora. Římské číslo `.chapter-seal` má 3,44 : 1 vůči tmavému konci panelu; je přijatelné považovat je za dekoraci, nesmí být jedinou nosnou informací.

## Výběr, pohyb a informace mimo barvu

- Výběr má přístupný stav `aria-pressed` a text `Název → …` v interakčním řádku. Samotná inventární dlaždice `.item.selected` se však liší převážně barvou, jasem a stínem. Přidat trvalý tvarový znak, například drobnou fajfku nebo rohové označení. Splněné cíle již fajfku mají; nejde jen o barevný přechod.
- Systémové `prefers-reduced-motion` se při načtení promítne do `prefs.reduced`, CSS navíc vypíná animace a přechody i bez nastavení hry. `walkTo()` zkrátí pohyb na nulu a `flyItem()` při omezení animací skončí před spuštěním WAAPI. Ruční nastavení je dostupné. Pozdější změna systémové preference při otevřené hře však nemění JS proměnnou: doplnit posluchač `matchMedia(...).change`, pokud se má okamžitě omezit i chůze/let předmětu.
- `#caption` je trvale `role="status" aria-live="polite"` a text se aktualizuje i při vypnutých vizuálních titulcích. Opacity nula jej neodstraňuje ze stromu, což je zde užitečné. Ověřit opakovaná stejná hlášení a oznamování se čtečkou. Vizuální reakce mizí za 3,5 sekundy; pro pomalejší čtenáře by pomohl trvalý poslední text nebo stručná historie.
- Uživatelské rozhraní používá malé ovladače: hlavička 25–29 px, na nízkém landscape až 22 px, mobilní východy 29 px. Zvětšení aktivní plochy s ponecháním malé kresby usnadní práci s třesem rukou a dotykem. Bez měření skutečných mezer nejde o závěr k normovým výjimkám cílových ploch.

## Doporučený browserový průchod

Pro úzký mobil, běžný desktop a 200% zvětšení: bez myši projít celou hádanku; vybrat předmět a prohlédnout jiný přes Shift+F10; otevřít nápovědu s vypnutými titulky ve čtečce; opakovaně přepnout obě nastavení; zavřít Esc a ověřit návrat; přejít mezi scénami; spotřebovat kombinaci; dokončit kapitolu a vrátit se k ohni. Ověřit pohyb při systémovém omezení před načtením i při změně za běhu. Po každé akci zjistit, kde leží fokus a zda není překrytý. Teprve tento průchod může podložit tvrzení o skutečné ovladatelnosti prohlížeče.
