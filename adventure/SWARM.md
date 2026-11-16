# Tým vizuální revize

16. listopadu 2026. Na tomto kroku pracovalo **19 samostatně spuštěných specialistů a koordinátor jako dvacátý agent**. Nástroj při pokusu o sedmého aktivního pomocníka vrátil `agent thread limit reached`, i když uživatel oznámil zvýšení limitu. Úkoly proto proběhly ve vlnách s nejvýše šesti pomocníky současně. Netvrdíme dvacet souběžných běhů.

Tabulka je záznam koordinátora o úspěšných voláních `spawn_agent`, požadovaných modelech a úrovních uvažování. Každá role měla oddělené vlastnictví souborů. Není to nezávislá telemetrie skutečného poskytovatele modelu; živý seznam po dokončení starší role postupně přestal zobrazovat.

| # | Agent / odpovědnost | Zadaný model | Uvažování | Výstup |
|---|---|---|---|---|
| 1 | `s01_art_direction` — Výtvarné vedení | `gpt-6-astra` | `xhigh` | [Provedeno](reviews/01-art-direction.md) |
| 2 | `s02_interface_css` — CSS rozhraní | `gpt-6.1-terra` | `high` | [Provedeno](reviews/02-interface-css.md) |
| 3 | `s03_interface_painter` — Malované UI | `gpt-6.1-sol` | `high` | [Provedeno](UI_ART.md) |
| 4 | `s04_interaction_engineer` — Interakce | `gpt-6.1-terra` | `xhigh` | [Provedeno](reviews/04-interaction.md) |
| 5 | `s05_historical_materials` — Materiálová kultura | `gpt-6-astra` | `high` | [Provedeno](reviews/05-material-culture.md) |
| 6 | `s06_regression_engineer` — Regresní testy | `gpt-6.1-terra` | `high` | [Provedeno](reviews/06-regressions.md) |
| 7 | `s07_mobile_audit` — Mobilní geometrie | `gpt-6.1-sol` | `high` | [Provedeno](reviews/07-mobile.md) |
| 8 | `s08_accessibility` — Přístupnost | `gpt-6.1-sol` | `high` | [Provedeno](reviews/08-accessibility.md) |
| 9 | `s09_motion_director` — Režie pohybu | `gpt-6.1-sol` | `high` | [Provedeno](reviews/09-motion.md) |
| 10 | `s10_scene_composition` — Kompozice a hloubka | `gpt-6-astra` | `high` | [Provedeno](reviews/10-scene-composition.md) |
| 11 | `s11_asset_performance` — Výkon a objem assetů | `gpt-6.1-terra` | `high` | [Provedeno](reviews/11-performance.md) |
| 12 | `s12_narrative_clarity` — Příběhová čitelnost | `gpt-6-astra` | `high` | [Provedeno](reviews/12-narrative-clarity.md) |
| 13 | `s13_save_compatibility` — Kompatibilita uložení | `gpt-6.1-sol` | `high` | [Provedeno](reviews/13-save-compatibility.md) |
| 14 | `s14_documentation` — Dokumentace | `gpt-6.1-sol` | `high` | [Provedeno](VISUAL_DESIGN.md) |
| 15 | `s15_contrast_qa` — Kontrast a paleta | `gpt-6.1-sol` | `high` | [Provedeno](reviews/15-palette-qa.md) |
| 16 | `s16_art_provenance` — Provenience a výřezy | `gpt-6.1-terra` | `high` | [Provedeno](reviews/16-provenance.md) |
| 17 | `s17_input_qa` — Nezávislé QA vstupů | `gpt-6.1-terra` | `xhigh` | [Provedeno](reviews/17-input-qa.md) |
| 18 | `s18_independent_critic` — Nezávislá výtvarná oponentura | `gpt-6-astra` | `xhigh` | [Provedeno](reviews/18-final-design.md) |
| 19 | `s19_release_auditor` — Audit vydání | `gpt-6.1-sol` | `high` | [Provedeno](reviews/19-release-audit.md) |
| 20 | Koordinátor — integrace, opravy, finální testy a publikace | Zděděný model relace, bez odhadu názvu | Zděděná úroveň | [Výsledný stav](VISUAL_DESIGN.md), [ověření](TESTING.md) |

## Výsledky a odpovědnost

Výtvarné a technické revize našly skutečné problémy: přetékání atlasových obrázků v mezerách při rozdílném poměru stran, CSS přepisující vnitřní SVG ořez, pořadí hloubky postav, oříznuté finále na nízké obrazovce, kolizi časovače finále s otevřeným dialogem, ztrátu fokusu, zastaralé obrazové rady a duplikované dřevo. Koordinátor opravy integroval; samostatní kontroloři přidali regresní testy.

Jednotlivé [revize](reviews/) zachycují stav v čase kontroly. Původní nález nebo starší počet testů se nemaže; konečné vyhodnocení je v [TESTING](TESTING.md) a [VISUAL_DESIGN](VISUAL_DESIGN.md). Výsledek zůstává první kapitolou se třemi místnostmi. Plná snímková animace a celý historický příběh dosud nejsou implementovány.

Cloudový náhled selhal na browserovém relay. Testy modelu, skutečných obsluh nad napodobeninou DOM, atlasů a dílčí CSSOM kontrola nenahrazují vizuální průchod celou hrou ani lidský playtest.
