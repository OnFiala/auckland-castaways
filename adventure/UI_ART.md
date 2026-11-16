# Malované materiály rozhraní

Původní sada šesti rekvizit rozhraní pro malovanou adventuru z roku 1864. Atlas navazuje na jemné grafitové obrysy, kvašovou kresbu a opotřebené materiály ilustrací `sailor.png` a `camp.png`. Obsahuje tmavé lodní dřevo, plátno s koženým okrajem, list papíru, zavřenou brašnu, prázdné mosazné tlačítko a papírový štítek. Bez písma, značek a zelených ornamentů. Povrchy jsou záměrně klidné; text a obsah inventáře má vykreslovat aplikace.

## Soubory a původ

- `dist/assets/ui/castaway-ui-atlas.png`: původní výstup `image_gen.imagegen`, beze změny bajtů. RGBA, **1536 × 1024 px**, tři sloupce a dva řádky po 512 px.
- `dist/assets/ui/atlas.json`: hash, souřadnice buněk, přesné alpha bounds při několika prahových hodnotách a doporučené výřezy.
- `dist/assets/ui/generation-prompts.json`: celé zadání, referenční soubory a druhý experiment s čištěním průhlednosti. Druhý výstup nebyl přijat; původní atlas má klidnější materiálové textury.

Vygenerováno 16. listopadu 2026. Reference byly před generováním prohlédnuty. Nepoužity žádné stock ikony ani stažené ilustrace. Jde o novou herní grafiku, nikoli historický doklad vzhledu konkrétního předmětu posádky. Výtvarné detaily jako nýty nebo uzávěr brašny nevyjadřují archeologickou identifikaci.

SHA-256 původního atlasu:

```text
1f4e0dc8fa557ae200229a35e9192812016c739fc7435aa13b6b07953367f292
```

## Souřadnice pro integraci

Počátek souřadnic je vlevo nahoře. `viewBox` je `x y šířka výška` v původním atlasu. Výřez zahrnuje hranice viditelného materiálu při alpha ≥ 32 a čtyřpixelový přesah. Zachovat poměr stran; dřevo či plátno lze při potřebě širokého pruhu opakovat nebo záměrně roztáhnout v aplikaci, papír má sloužit jako podklad dialogu. Zdroje se na disku neořezávaly ani nepřevzorkovávaly.

| Prvek | Buňka, sloupec/řádek od 0 | Doporučený `viewBox` | Alpha ≥ 32: atlas `[left, top, right, bottom)` |
| --- | --- | --- | --- |
| `timber-strip` | 0 / 0 | `12 182 493 191` | `[16, 186, 501, 369)` |
| `inventory-canvas` | 1 / 0 | `522 142 490 261` | `[526, 146, 1008, 399)` |
| `dialog-paper` | 2 / 0 | `1031 94 491 353` | `[1035, 98, 1518, 443)` |
| `satchel` | 0 / 1 | `66 580 382 365` | `[70, 584, 444, 941)` |
| `brass-button` | 1 / 1 | `604 596 323 329` | `[608, 600, 923, 921)` |
| `paper-tab` | 2 / 1 | `1059 675 441 183` | `[1063, 679, 1496, 854)` |

Příklad použití bez změny zdrojového PNG:

```html
<svg viewBox="12 182 493 191" aria-hidden="true">
  <image href="assets/ui/castaway-ui-atlas.png" width="1536" height="1024" />
</svg>
```

Dekorativní SVG skrýt před čtečkou obrazovky; skutečné tlačítko i jeho přístupný název řešit v HTML. Volný střed mosazného tlačítka lze překrýt funkčním textem či ikonou aplikace. Nový text nevypalovat do původního atlasu.

## Kontrola průhlednosti a limity

PNG má skutečný alpha kanál s rozsahem **0–254**; většina vnitřních pixelů materiálu má alpha 252–253. Pozadí není zapečená jednobarevná plocha. Mimo fyzické obrysy však zůstávají rozptýlené pixely s alpha 1–31, které mohou zasahovat až k hranicím buněk. Proto nepoužívat celou buňku jako těsný vizuální výřez. Přesné hranice všech nenulových pixelů i hranice při alpha 32, 128, 200 a 250 obsahuje `atlas.json`; není tvrzeno, že atlas má dokonale vyčištěné nulové okolí každé buňky.

Čtení PNG přes Pillow sloužilo pouze ke kontrole rozměrů, alpha a hashe. Žádné pixely se programově neupravovaly. Generátor byl požádán o čistší průhlednost i druhým editačním zadáním; výsledek stále obsahoval slabou okrajovou alpha a zvýraznil texturu, proto zůstal původní obraz. Případná další oprava obrázku má opět proběhnout přes imagegen; do té doby jsou uvedené výřezy připraveny k přímému použití.

Původní generovaný soubor zůstává také v cloudovém pracovním adresáři `/workspace/generated_images/exec-f5215bdf-ac25-4217-b5e7-a1dceb4aef01.png`; veřejný projekt nepotřebuje tuto pracovní cestu k běhu. Atlas v `dist/assets/ui/` je jeho přesná kopie.
