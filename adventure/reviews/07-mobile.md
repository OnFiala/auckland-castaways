# Mobilní a responzivní kontrola

Statická kontrola `dist/index.html`, poslední kaskády `dist/style.css`, `dist/app.js` a souřadnic `dist/engine.js`. **Nejde o výsledek vykreslení v prohlížeči:** infrastruktura pro vizuální ověření nebyla v tomto běhu dostupná; nic se neinstalovalo. Geometrie níže vychází z CSS `border-box`, vnitřního poměru scény 16:9 a plné zadané velikosti viewportu. Fontové rozměry, scrollbar a dynamické lišty skutečného telefonu mohou hodnoty mírně změnit.

## Rozměry podle aktuální kaskády

| Viewport | Vnější šířka hry | Vnitřní scéna | Hlavička / reakce / inventář | Celková výška hry | Umístění |
| --- | ---: | ---: | ---: | ---: | --- |
| 390 × 844 | 390 px | 388 × 218,25 px | 52 / 31 / 76 px | 379,25 px | Nahoře 32 px; zůstává velká volná plocha pod hrou. |
| 768 × 1024 | 768 px | 766 × 430,88 px | 61 / 34 / 94 px | 621,88 px | Svisle vystředěno přibližně na y = 201,06 px. |
| 1366 × 768 | 1059,56 px | 1057,56 × 594,88 px | 52 / 34 / 86 px | 768,88 px | Téměř vyplní výšku; výpočet ponechává necelý pixel přetečení. |
| 844 × 390 | 488,89 px | 486,89 × 273,88 px | 35 / 23 / 57 px | 390,88 px | Úzká hra uprostřed širokého viewportu; necelý pixel přetečení. |

Do celkové výšky jsou zahrnuty oba 1px okraje `.game-shell`. Výškové vzorce používají `100dvh`; nezaručují konkrétní rozměr při přiblížení nebo proměnlivé systémové liště. Při 390px šířce scéna zabírá jen 26 % výšky telefonu: není uříznutá, ale drobné malované předměty jsou velmi malé.

## Nálezy a doporučení

1. **P1 — dokončovací karta může být v nízkém landscape oříznuta.** Při 844 × 390 má `.scene` výšku 273,88 px a `overflow:hidden`. `.completion` má minimální šířku 270 px, vnitřní šířku pouze 216 px po 26px paddingu a okrajích, `top:10%`, pečeť a velký titulek. Pravidlo `max-height:92%;overflow:auto` existuje pouze uvnitř `@media(max-width:700px)`, takže zde neplatí. Již pevné mezery, pečeť, dva řádky titulku, odstavec a tlačítka dávají odhad přes 350 px, zatímco od horní hrany karty do konce scény zbývá jen 246,5 px. Dolní ovládání proto hrozí nedostupností. **Kořen:** `.completion`, `.scene`, `@media(max-height:500px) and (orientation:landscape)`. Praktická oprava: do landscape větve zahrnout `.completion{top:4%;max-height:92%;overflow:auto;padding:15px}` a kompaktní titulek/pečeť stejně jako na mobilu. Po úpravě ověřit stav dokončení, nikoli jen úvodní scénu.

2. **P2 — malé dotykové terče.** Na telefonu mají `.game-header button` pouze 25 × 25 px, `.exit` 29 × 29 px a `.target` minimum 27 × 27 px. Například lano a kamenná patka jsou při 390px viewportu právě 27 × 27 px; páka přibližně 27 × 28 px, bidlo 46,6 × 27 px. V landscape 844 × 390 jsou horní tlačítka 22 × 22 px a drobné předměty typicky 30–36 px v jedné ose. Inventář 390px telefonu je s 52px tlačítky pohodlnější; landscape položky mají 43 × 43 px. Doporučení: přidat větší skutečné dotykové plochy pro navigaci a horní nabídku; u předmětů oddělit malbu od většího hitboxu a případné přesahy posoudit podle souřadnic níže. Pouhé globální zvětšení všech `.target` na 44px může vytvářet nové překryvy.

3. **P3 — necelý pixel vertikálního přetečení.** Výškové vzorce `.game-shell` odčítají 172 px, respektive 115 px, ale po přepočtu šířky na vnitřní scénu a přičtení okrajů je hra o 0,875 px vyšší než viewport. Nejde o blokování ovládání; může vzniknout nepatrný svislý scroll. Přesnější šířka pro desktop by odpovídala `calc((100dvh - 174px)*16/9 + 2px)`, pro landscape `calc((100dvh - 117px)*16/9 + 2px)`; vhodnější je ověřit po integraci ve skutečném layoutu, než přidávat další kaskádové výjimky.

## Inventář

`.inventory{min-width:0;overflow-x:auto}` správně dovoluje zmenšení flex položky; tlačítka mají `flex-shrink:0`. Osm pozic se v úzkých variantách přesouvá vodorovně, místo aby tlačily celé rozhraní mimo viewport. Odhady počítají s šířkou textu „Jak hrát“ a skutečnými mezerami poslední kaskády:

| Viewport | Obsah osmi slotů včetně mezer/paddingu | Dostupná oblast inventáře, odhad | Důsledek |
| --- | ---: | ---: | --- |
| 390 × 844 | 471 px | přibližně 295 px | Přibližně pět slotů; vodorovný posun kolem 176 px. |
| 768 × 1024 | 567 px | přibližně 607 px | Osm slotů se vejde. |
| 1366 × 768 | 519 px | přibližně 898 px | Osm slotů se vejde. |
| 844 × 390 | 399 px | přibližně 364 px | Posun kolem 35 px; poslední slot nemusí být celý vidět. |

Pozor při následné úpravě: závěrečné `.inventory-bar{gap:12px}` přepisuje původní mobilní `gap:5px`. Posouvání dotykem je podle CSS dostupné, ale bez prohlížeče nebylo potvrzeno, zda je jeho možnost dostatečně zřejmá. Prázdné sloty také zvětšují obsah na nejméně osm pozic.

## Hlavička, překryvy a dialog

- **Hlavička:** ze statické geometrie nevychází kolize cílových ikon s navigací u žádného ze čtyř zadaných viewportů. Při 390px viewportu zabírají tři cíle interval přibližně x = 166–231 px a navigace x = 298–379 px. Titul je v levé části s menším fontem. Jeho přesnou délku je nutné potvrdit s reálnou Georgií/fallbackem; nejde o důkaz ze screenshotu.
- **Hotspoty:** již existuje překryv postavy Henryho s rámem přístřešku: `.target[data-target="henry"]` překrývá `.target[data-target="shelter"]` v rozsahu x = 54,5–60,25 % a y = 50,5–69,5 % scény. Henry se vkládá později, a v tomto obdélníku proto získá kliknutí on. Na 390px viewportu jde asi o 22,3 × 41,5 px. Rám zůstává dosažitelný na velké zbývající ploše, takže nejde o úplný blocker. Podobně Musgrave překrývá kraj bedny v x = 78,75–81 %, y = 48–67,5 % (na telefonu asi 8,7 × 42,6 px). Východy se podle daných souřadnic s interaktivními předměty nepřekrývají. Tyto vztahy jsou důležité při zvětšování dotykových ploch.
- **Úvodní nápověda:** poslední mobilní pravidlo ruší `white-space:nowrap` a omezuje šířku, takže text nemusí vytlačovat viewport. Zabírá část horní scény; první aktivace ji skrývá.
- **Dialog:** `dialog{overflow:auto}` z poslední kaskády dává obsahu možnost svislého posunu. Maximum je při 390 × 844 358 × 759,6 px, při 768 × 1024 580 × 870,4 px, při 1366 × 768 580 × 652,8 px a při 844 × 390 580 × 331,5 px. V nízkém landscape zbývá přibližně 269,5 px pro obsah po paddingu a rámečku, dlouhé Nastavení proto musí rolovat. Samotný dialog nepřesahuje viewport podle CSS; skutečný scroll, fokus a dostupnost zavíracího tlačítka po rolování vyžadují runtime kontrolu.
- **Barvy:** konečná kaskáda hlavičky, interakčního řádku, inventáře a dialogů je hnědá/mosazná/plátěná. Starší zelené deklarace zůstaly ve zdroji, ale pro tyto plochy jsou přepsané. Barevnost samotných obrazů scény nebyla tímto statickým auditem hodnocena.

## Runtime ověření po integraci

Na všech čtyřech viewports otevřít nápovědu i nastavení, doplnit inventář, rolovat k poslední položce, vyzkoušet všechny tři scény a dokončit kapitolu. Zvlášť ověřit dolní tlačítka `.completion` při 844 × 390, zásah malých předmětů prstem, návrat fokusu z dialogu a zda žádná systémová lišta skutečného telefonu nezakrývá spodní inventář.
