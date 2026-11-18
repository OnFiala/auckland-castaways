# Malované předměty — sjednocení výtvarné sady

Aktuální hra používá samostatně malované rekvizity, které lze sbírat a skrývat podle stavu inventáře. Souborové vlastnosti a výřezy základních rekvizit uvádí jejich manifest. Předměty dalších kapitol mají samostatnou evidenci včetně atlasů, odvozených výřezů a konvice. Pracovní detaily mají vlastní evidenci PNG a herních WebP. [Základní rekvizity](dist/assets/props/manifest.json) · [Rekvizity dalších kapitol](dist/assets/voyage/props/manifest.json) · [Pracovní detaily PNG](artwork/workplates/manifest.json) · [Pracovní detaily WebP](dist/assets/workplates/manifest.json) · [Výtvarná a povětrnostní kontrola](reviews/26-weather-and-art.md)

## Archiv z 16. listopadu 2026

Dva původní průhledné atlasy nahradily jednoduché vektorové kresby předmětů. Podobu určovaly tehdejší malby hlavní postavy a prostředí. Výtvarné zadání pracovalo s kresleným obrysem, texturovaným kvašem, tlumeným dřevem, konopnými provazy, zašlým železem a přirozeně opotřebeným plátnem.

### Soubory a původ

- [tools.png](dist/assets/props/tools.png): šest nástrojů a pomůcek, generováno `image_gen.imagegen` s průhledným pozadím.
- [materials.png](dist/assets/props/materials.png): pět materiálů / objektů a jedna prázdná buňka, stejný postup.
- [Manifest](dist/assets/props/manifest.json): úplné prompty, jména původních generovaných souborů, rozměry, režim RGBA, počty bajtů, SHA-256 a přesné oblasti jednotlivých předmětů.
- [Samostatné prompty](dist/assets/props/prompts.json): stejná zadání pro snadné dohledání.

Oba PNG soubory měly 1536 × 1024 pixelů. Vznikly jako přímé kopie tehdejších výstupů generátoru. Vizuálně byly prohlédnuté celé atlasy a ověřené hranice jejich položek i průhlednost.

### Rozložení

Každý atlas obsahuje přesnou mřížku tří sloupců a dvou řádků, buňky mají 512 × 512 pixelů. Mřížka není nakreslená.

| Atlas | Horní řada zleva | Dolní řada zleva |
|---|---|---|
| tools.png | rope, pole, loopPole | prybar, axe, tinderbox |
| materials.png | canvas, firewood, flagcloth | driftwood, cairn, prázdno |

`sprites[id].viewBox` v manifestu je doporučený zobrazovací obdélník `[x,y,width,height]`: měřený obsah s alfa ≥16 rozšířený o čtyři pixely a omezený hranicemi vlastní buňky. `alpha16_bbox` a `alpha128_bbox` používají `[left,top,right,bottom]`. Širší částečně průhledné stíny nejsou pevné pozadí.

Při zobrazení zachovat poměr stran, například SVG s vnořeným obrazem celého atlasu a `preserveAspectRatio="xMidYMid meet"`. Pro svitek plátna, kámen a poleno nepoužívat stejné roztažení jako pro dlouhou tyč; umístění i měřítko se přizpůsobují konkrétnímu předmětu ve scéně.

## Meze

Předměty jsou výtvarné interpretace dobových materiálů vytvořené pro hru. Jejich umístění, dotykové ovládání a animace se ověřují samostatně ve hře.
