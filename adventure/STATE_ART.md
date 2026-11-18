# Malované změny prostředí

## Aktuální stavové obrazy

Malby hotového přístřešku a otevřené bedny byly přepracovány společně se základními pozadími první kapitoly. Rozvržení zůstává svázané s místy pro chůzi a ovládání. Změny mezi generovanou předlohou a herním souborem jsou zaznamenány u konkrétní položky. Další kapitoly mají samostatné malby například pro vybranou vodu v člunu a rozehřátou výheň. [Manifest první kapitoly](dist/assets/manifest.json) · [Manifest stavových obrazů první kapitoly](dist/assets/states/manifest.json) · [Manifest stavů dalších kapitol](dist/assets/voyage/scenes/manifest.json) · [Výtvarná a povětrnostní kontrola](reviews/26-weather-and-art.md)

## Archiv z 16. listopadu 2026

Pět původních podkladů vytvořil `image_gen.imagegen` pro nahrazení jednoduchých SVG rekonstrukcí. Výtvarnými předlohami byly vlastní dřívější malby projektu.

| Soubor | Obsah a způsob použití |
|---|---|
| `dist/assets/states/camp-shelter.png` | Stejné tábořiště s opracovanou plachtovinou přivázanou na původní rám; celá malba 1672 × 941. |
| `dist/assets/states/wreck-open.png` | Stejný vrak a původní bedna s otevřeným víkem, celá malba 1671 × 941. Šířka se při zobrazení přizpůsobovala původní scéně. |
| `dist/assets/states/fire.png` | Průhledná samostatná malba drobného ohně, zuhelnatělého dřeva a jemného kouře. Neobsahuje druhý kamenný kruh. |
| `dist/assets/states/mast.png` | Průhledná malba celého holého dřevěného stožáru s lanem. |
| `dist/assets/states/mast-flag.png` | Tentýž stožár s uvázaným světlým pruhem plátna. |

Herní soubory této verze byly přímými kopiemi tehdejších výstupů generátoru. Python sloužil ke kopírování a čtení vlastností a kontrolních součtů PNG. U přepracovaných souborů manifest uchovává zvlášť předchozí a nové údaje. [Manifest stavových obrazů](dist/assets/states/manifest.json)

### Tehdejší integrace a měření průhlednosti

Všech pět výsledků bylo vizuálně prohlédnuto jako samostatné obrázky. U tábořiště a vraku generátor zachoval rozvržení, ale kresbu přepočítal i mimo změněný předmět. Rozdíly ve struktuře vedly k použití celých pozadí.

U ohně měla plnou průhlednost více než 86 % pixelů. `soft_alpha_bbox` (alfa alespoň 8) zahrnoval více kouře než `alpha_bbox` (alfa alespoň 128). Obě malby stožáru měly společný výřez `(216, 22, 762, 1754)`, aby se kmen při přidání vlajky neposunul.

Ve všech verzích jde o herní interpretaci přístřeší, nářadí a signalizace. Umístění, měřítko a pohyb se posuzují ve složené scéně. [Historické hranice kampaně](HISTORICAL_ADAPTATION.md)
