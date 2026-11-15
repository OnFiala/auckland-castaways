# Deník hledání a meze pokrytí

Rešeršní relace 15.11.2026. Jde o audit oblastí a klíčových dotazů, nikoli úplný export všech odpovědí vyhledávače. Zdroje mají stabilní ID v registru. Výsledky z indexu a skutečně otevřený text jsou rozlišeny.

| Okruh / dotazy | Nalezeno a prohlédnuto | Mez / další krok |
|---|---|---|
| Musgrave, `Castaway on the Auckland Isles 1866`, Wikisource, IA | S001/S002/S032; úplný sken, cílené pasáže, původní mapa. | Rukopis a ediční zásahy nejsou zkolacionovány. |
| Raynal, `Les naufragés des Auckland`, `Wrecked on a Reef 1874` | S003/S004/S023/S024/S033/S034/S037/S041; francouzský seriál, anglický sken, katalogy francouzských vydání. | Gallica stahování 403; francouzská knižní vydání zatím katalogové stopy. |
| Invercauld, `Dalgarno Smith Holding 1865`, Papers Past | S008–S011/S030/S038/S045; dopisy, souhrny, seznam posádky. | Přímý prohlížeč často jen iframe, text čten indexovaným OCR. Nutná obrazová kontrola jmen a květnových dat. |
| Grafton, `Musgrave remarkable escape 1865` | S044, časná srpnová zpráva. | Zpráva přebírá Southland News; hledat původní článek z 29.7.1865. |
| Archeologie, DOC, Te Papa, Auckland Islands | S005/S006/S020/S021/S026/S029/S035 | S026 jen metadata; S035 nedostupný detail. Ověřit sbírky a prostorová data. |
| Názvosloví / souřadnice, LINZ Carnley Harbour Port Ross | S027/S028/S029/S042 | LINZ dynamický detail nevrátil použitelný souřadnicový záznam; sekundární bod jasně označen. |
| Kritická moderní literatura, Hince, Allen, Druett | S012–S015/S025/S046/S047 | Celé moderní knihy nezískány; bibliografie a Holdingův rukopis prioritou. |
| `Grafton Invercauld film documentary adaptation`, `Die Schiffbrüchigen ZDF` | S016/S017; dokončený dokument 2022. | Nezhlédnut celý film; nemaže potřebu samostatného historického ověření. |
| `Island of the Lost South Pacific Pictures film`, `Joan Druett Island of the Lost film option 2025 2026` | S012/S039; opce zmiňována 2008 a retrospektivně 2020. | Nenalezen dokument o aktuálním smluvním stavu ani spolehlivě identifikovaný hotový celovečerní film podle knihy. |
| `Auckland castaways game Musgrave`, `Grafton Invercauld game film adaptation` | S018 je nesouvisející hra; S019 nesouvisející film. | Není důkaz neexistence jiných her. Doplnit katalogy, festivaly, francouzštinu, němčinu a archivní produkční záznamy. |
| Audio a online recepce | S040 podcastová metadata; S048 neověřená zrcadlená stránka videa. | Audio/video nezkoumáno; není faktografický podklad. |

## Kontrola dostupnosti

[link-check.json](../reports/link-check.json) zaznamenává samostatný automatický HTTP pokus pro všechny hlavní URL registru, včetně přesměrování a chyb. **HTTP200 neznamená přečtený obsah** a HTTP403 při stahování neznamená, že zdroj neexistuje. Údaj `inspection_status` se automaticky nepovyšuje podle výsledku síťové kontroly. Některé texty byly dostupné webovým nástrojem nebo indexem, i když přímý download nefungoval.

Překážky se neobcházejí falešným tvrzením o akvizici. Nedostupné položky jsou v manifestu nebo backlogu, ne mezi staženými soubory. Otevření nového zdroje nečiní jeho tvrzení nezávislým, pokud pouze přepisuje stejného svědka.

## Doplnění primárních stop

S049/S050 Smith1866: katalog ověřen, obě digitální cesty blokované; přesný IA dotaz `title:(castaways) AND creator:(smith)` nenašel odpovídající dílo. S051: DOI cesta chybovala, oficiální Cambridge stránka a odkazované PDF dostupné, tabulka2 přečtena soukromě. Obrázek tabulky sám vracel403. S052: vybrané bibliografické záznamy čteny indexem, nikoli celá kniha. S053: objevena další podcastová epizoda, jen metadata.
