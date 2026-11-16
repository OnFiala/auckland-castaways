# Malované změny prostředí

16. listopadu 2026. Pět původních podkladů vytvořených nástrojem `image_gen.imagegen` pro nahrazení jednoduchých SVG rekonstrukcí ve scénách. Vycházejí výtvarně z již vytvořených pozadí; žádný obrázek z cizí hry nebyl použit.

| Soubor | Obsah a způsob použití |
|---|---|
| `dist/assets/states/camp-shelter.png` | Stejné tábořiště s opracovanou plachtovinou přivázanou na původní rám; celá malba 1672 × 941. |
| `dist/assets/states/wreck-open.png` | Stejný vrak a původní bedna s otevřeným víkem; celá malba 1671 × 941. Jeden pixel rozdílu šířky oproti původní scéně je při zobrazení nutné přizpůsobit původnímu poměru. |
| `dist/assets/states/fire.png` | Průhledná samostatná malba drobného ohně, zuhelnatělého dřeva a jemného kouře. Neobsahuje druhý kamenný kruh. |
| `dist/assets/states/mast.png` | Průhledná malba celého holého dřevěného stožáru s lanem. |
| `dist/assets/states/mast-flag.png` | Tentýž stožár s uvázaným světlým pruhem plátna. |

Prompty, odkazy na vstupní soubory, rozměry, velikosti, SHA-256 a měření průhlednosti jsou v [manifestu](dist/assets/states/manifest.json). Původní výstupy generátoru byly ponechány; herní soubory jsou jejich přímé kopie. Při přípravě nedošlo k obrazovým úpravám Pythonem ani dodatečnému překreslování. Python byl použit pouze ke kopírování a čtení vlastností/hashů PNG.

## Integrace a meze

Všech pět výsledků bylo vizuálně prohlédnuto jako samostatné obrázky. Tábořiště a vrak zachovávají rozvržení původních scén, nejsou však pixelově identické mimo upravenou oblast; jde o generátorem znovu vykreslené verze. Přepnutí celého pozadí je vhodnější než ostrý obdélníkový výřez, který by mohl odhalit rozdíl struktury.

Oheň má přes 86 % plně průhledných pixelů. Pro výřez zachovávající kouř lze použít `soft_alpha_bbox` (alfa alespoň 8); přísnější `alpha_bbox` (alfa alespoň 128) kouř nepokrývá celý. U obou stožárů je vhodné použít stejný logický výřez `(216, 22, 762, 1754)`, aby se kmen při přidání vlajky neposunul. Vlastní plný PNG se tím nemění.

Jsou to výtvarné herní konstrukce, nikoli dobové ilustrace nebo doložený přesný stav přístřeší, nářadí či signalizace. Samotná prohlídka obrázků nepotvrzuje konečné umístění, měřítko, animace ani zobrazení celé hry v prohlížeči.
