# Malované předměty — sjednocení výtvarné sady

Datum vytvoření: 16. listopadu 2026.

Dva původní průhledné atlasy nahrazují jednoduché vektorové kresby předmětů. Podoba navazuje na prohlédnutou hlavní postavu a prostředí: kreslený obrys, texturovaný kvaš, tlumené dřevo, konopné provazy, zašlé železo a přirozeně opotřebené plátno. Jde o výtvarné rekonstrukce pro hru, nikoli dochované předměty nebo jejich archeologické vyobrazení.

## Soubory a původ

- [tools.png](dist/assets/props/tools.png): šest nástrojů a pomůcek, generováno `image_gen.imagegen` s průhledným pozadím.
- [materials.png](dist/assets/props/materials.png): pět materiálů / objektů a jedna prázdná buňka, stejný postup.
- [Manifest](dist/assets/props/manifest.json): úplné prompty, jména původních generovaných souborů, rozměry, režim RGBA, počty bajtů, SHA-256 a přesné oblasti jednotlivých předmětů.
- [Samostatné prompty](dist/assets/props/prompts.json): stejná zadání pro snadné dohledání.

Oba PNG soubory mají 1536 × 1024 pixelů. Původní generované pixely jsou zachované; nedošlo k přemalování ani vyřezávání náhradním editorem. Vizuálně byly prohlédnuté celé atlasy a ověřené hranice jejich položek i průhlednost.

## Rozložení

Každý atlas obsahuje přesnou mřížku tří sloupců a dvou řádků, buňky mají 512 × 512 pixelů. Mřížka není nakreslená.

| Atlas | Horní řada zleva | Dolní řada zleva |
|---|---|---|
| tools.png | rope, pole, loopPole | prybar, axe, tinderbox |
| materials.png | canvas, firewood, flagcloth | driftwood, cairn, prázdno |

`sprites[id].viewBox` v manifestu je doporučený zobrazovací obdélník `[x,y,width,height]`: měřený obsah s alfa ≥16 rozšířený o čtyři pixely a omezený hranicemi vlastní buňky. `alpha16_bbox` a `alpha128_bbox` používají `[left,top,right,bottom]`. Širší částečně průhledné stíny nejsou pevné pozadí.

Při zobrazení zachovat poměr stran, například SVG s vnořeným obrazem celého atlasu a `preserveAspectRatio="xMidYMid meet"`. Pro svitek plátna, kámen a poleno nepoužívat stejné roztažení jako pro dlouhou tyč; umístění i měřítko se přizpůsobují konkrétnímu předmětu ve scéně.

## Meze

Historická pravděpodobnost materiálů není potvrzením konkrétních dochovaných kusů. Atlas sám nepotvrzuje správné vložení do herního rozhraní, dotykové ovládání ani animace. To se ověřuje samostatně při integraci.
