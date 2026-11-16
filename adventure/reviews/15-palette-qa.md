# Závěrečná kontrola palety a kontrastu

Kontrola zdrojů 16. listopadu 2026. Vzorce níže používají relativní jas sRGB a poměr `(Lsvětlejší + 0,05) / (Ltmavší + 0,05)`. Jde o kontrolu pevných barev a kaskády CSS, nikoli o vizuální browserový audit. Kontrast nad malovanou texturou nelze prohlásit za změřený z pouhých hex hodnot podkladu.

Finální kontrola zahrnuje `index.html`, `app.js`, `style.css`, `interface.css` a `interface.js` po integraci malovaného atlasu. `interface.css` se načítá za `style.css` i `motion.css`. Zjištěné chyby kontrastu druhého tlačítka a barvy drobného textu jsou ve výsledné kaskádě opravené. Nebyl nalezen další konkrétní nepřebitý zelený odstín v rozhraní.

## Opravy již přítomné v implementaci

- `app.js`, `glyph.eye`: původní zelený kruh `fill="#65704d"` nahrazen teplým `#6b4e34`. Jde o UI piktogram, ne přirozenou barvu vegetace.
- `index.html`, `meta[name="theme-color"]`: teplý ořechový `#2b211c` nahrazuje původní `#262b29`.
- `app.js`, `save()`: uložený stav používá `#c4b08a`, selhání `#d6a177`. Proti pevnému `.interaction-line` `#291f1a` dávají 7,60 : 1 a 7,07 : 1. Selhání navíc mění znak na `!` a přístupné jméno na „Ukládání není dostupné“; význam tedy není sdělen jen barvou.

## Výsledná kaskáda a pevné barevné dvojice

| Obsah / výsledný stav | Popředí | Pevné pozadí pod textem | Poměr |
| --- | --- | --- | ---: |
| `.interaction-line` běžný text | `#e2d2b0` | `#291f1a` | 10,79 : 1 |
| `.completion button`, `.setting button`, `.dialog-button` | `#f5e8cd` | `#564032` | 7,96 : 1 |
| Totéž při hoveru, kromě druhého tlačítka dokončení | `#f5e8cd` | `#76563d` | 5,46 : 1 |
| `.completion button+button:hover` | `#fff0cf` | `#76563d` | 5,88 : 1 |

Původní `.completion button+button` zdědilo při hoveru tmavé `#563e2f` na `#76563d` (1,49 : 1). Explicitní nové pravidlo `.completion button+button:hover` má dostatečnou specificitu i pozdější pořadí, takže tuto chybu řeší.

`.small,.completion small` nyní přebíjí původní `#6c5946` teplým tmavším `#5f4b38`. Proti samotnému tmavému konci starého papírového gradientu `#ddcaa5` dává 5,12 : 1; proti novému pevnému podkladu dialogu `#eadcbd` 6,07 : 1. To jsou **referenční dvojice, nikoli kontrast výsledné malované plochy**. `dialog` i `.completion` překrývá malba při krytí 0,35. Hlavička má krytí malby 0,37, inventář 0,20 a úvodní rada 0,38. Také mosaz nad hlavičkovými tlačítky má krytí 0,30; jejich pevné barvy proto nejsou samy důkazem přesného výsledného kontrastu.

Malé popisky zůstávají slabším místem čitelnosti: `.brand span` má do 700 px 6,5 px, do 359 px 6 px; `.help span` má na nízkém landscape 7 px. Nejde o nově nalezenou barevnou kolizi, ale o důvod ověřit skutečné čtení a zvětšení v browseru. Tato kontrola nepotvrzuje splnění WCAG ani vizuální kvalitu při 200% zvětšení.

Původní zelené deklarace v úvodní vrstvě `style.css` samy neprokazují viditelný problém, pokud je výsledná kaskáda přebíjí. Barvy scény, mlhy, deště a vegetace do požadavku teplého rozhraní nespadají. Omezené krytí `.goal`, `.exit` a text nad scénou je nutné ověřit vůči skutečné kompozici; tato kontrola jim nepřiřazuje nepravdivý přesný kontrast.

## Ověření a meze

`node --test adventure/tests/interface-art.cjs`: 4 testy prošly. Ověřují původní atlas, jeho souřadnice a lokální zapojení HTML, nikoli renderování či kontrast. Číselné hodnoty v této revizi byly nezávisle přepočítány malým skriptem z uvedených sRGB barev. Nebyl spuštěn server, instalován browser ani proveden náhradní úplný browserový průchod. Malované podklady, stavy nad scénou a drobné mobilní popisky nadále potřebují skutečný vizuální audit, až bude dostupný schválený preview kanál.
