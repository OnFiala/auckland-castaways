# Kontrola původu a výřezů rozhraní

Atlas `assets/ui/castaway-ui-atlas.png` je podle dokumentace původní výstup generátoru; manifest a test připínají SHA-256 `1f4e0dc8fa557ae200229a35e9192812016c739fc7435aa13b6b07953367f292`. Test porovnává skutečné bajty s touto nezávisle uvedenou hodnotou, kontroluje PNG hlavičku, rozměry 1536 × 1024 a RGBA. Hash potvrzuje totožnost s dokumentovaným souborem, sám o sobě nedokazuje původ generování; ten zaznamenávají `UI_ART.md` a `generation-prompts.json`.

Šest výřezů se porovnává s konkrétními schválenými souřadnicemi v atlasu. Test ověřuje, že každý obsahuje uvedené hranice alpha ≥ 32 s čtyřpixelovým okrajem. Hranice alpha pocházejí z manifestu, nejsou testem znovu vypočítávány z pixelů. Kontrola místních souborů skriptů a stylů ověřuje jejich existenci, nikoliv funkční běh, vzhled, čitelnost nebo autorská práva. Atlas je nová ilustrace, nikoliv historický artefakt.

Spuštění: `node --test adventure/tests/interface-art.cjs`.

Test navíc načítá skutečný registr `interface.js`, porovnává všechny výřezy s manifestem a pomocí jednoduchého DOM stubu vykoná `mount`: ověřuje, že všech šest prvků je deklarováno v HTML a výsledné SVG používá správný lokální soubor a viewBox. Neověřuje rozložení ani vizuální výsledek v prohlížeči.

**Stav 16. listopadu 2026: PASS (5/5).** Test nově kontroluje pro každý výřez a oba režimy `meet` a `slice` vnitřní SVG viewport: souřadnice, rozměry a viewBox odpovídají výřezu a `overflow="hidden"` ořezává obraz na jeho hranici. Jde o kontrolu výsledného značení pro oba režimy, nikoliv měření vykreslení širokého či úzkého panelu v prohlížeči.

Kontrola vnitřního viewportu zahrnuje také třídu `atlas-clip` a inline styl s přesnými rozměry v pixelech a `overflow:hidden!important`, aby zachytila odstranění ochrany před přepsáním obecnými pravidly SVG. Kontrola je statická; skutečnou kaskádu a vizuální výsledek musí ověřit prohlížeč.
