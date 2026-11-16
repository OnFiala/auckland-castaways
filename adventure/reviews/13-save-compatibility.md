# 13 — Kompatibilita ukládání a vstupních stavů

Srovnáno s commitem `986fe974ebca9c6ff2b8d38c926828b1e0c5f048` pomocí `git show` a diffu. Kontrolovaný stav: současný pracovní strom v okamžiku auditu.

**Výsledek: v posuzovaném rozsahu nebyla doložena nová regrese ani blokující ztráta postupu.**

- `engine.js` je vůči základnímu commitu beze změny. `VERSION=3`, klíč `castaways-adventure-v3`, serializovaná struktura i validátor zůstávají stejné.
- Prošlo všech 13 testů `node --test adventure/tests/engine.test.js`, včetně průchodu dosažitelných stavů, obnovy a ochrany zásadních předmětů.
- Prošel `node adventure/tests/ui-contract.cjs`: skutečné UI handlery, dokončení, obnova rozehrané hry, nesprávná kombinace, návrat nástroje, restart a nedostupné úložiště.
- Dodatečně byl tentýž omezený DOM harness spuštěn nad původním i současným `app.js`; následující výsledky byly shodné.

| Scénář | Doložený výsledek |
| --- | --- |
| Načíst kompletní platný v3 save | Identický postup, inventář i příznaky; bez migrace. |
| Neplatný JSON v herním klíči | Spustí se nová hratelná hra, bez výjimky. |
| Strukturně neplatný save s chybějícími nástroji | `restore` jej odmítne; nová hra. |
| Uložené omezení pohybu | Preference se načte a zachová. |
| Systémové omezení pohybu + uložené `false` | Při startu převáží systémové `true`, stejně jako dříve. |
| Kliknout lano a ihned bidlo, teprve pak dokončit RAF | Provede se pouze poslední akce; v inventáři jen bidlo. |
| Rozběhnout sběr lana a otevřít nápovědu | Chůze se zruší, lano se nesebere; po zavření lze znovu sebrat. |
| Rozběhnout sběr lana a stisknout Esc | Chůze a původní akce se zruší, inventář beze změny. |
| Sebrat lano, vybrat ho, použít na vyplavený kmen | Předmět ani postup se neztratí; výběr zůstane aktivní. |

Esc v otevřeném dialogu nyní ponechává vybraný předmět; po zavření jej Esc opět odloží. Jde o konzistentní oddělení zavření dialogu od zrušení herního výběru, kryté současným UI testem. Otevření dialogu nadále ruší probíhající chůzi.

## Starší omezení, nikoli regrese tohoto patche

1. **Reload může přeskočit závěrečný panel.** Dokončit poslední úkol a obnovit stránku před zobrazením panelu (nebo po něm): postup zůstane dokončený a svět odpovídá finále, ale panel se po načtení nezobrazí. Časovač vzniká jen při přechodu `false → true` v `apply`, nikoli při inicializaci. Ověřeno stejně v obou verzích; není to ztráta save.
2. **Poškozený JSON postupu přeskočí načtení předvoleb.** Uložit například `{bad` pod herní klíč a platné `{captions:true,reduced:true}` pod `castaways-adventure-prefs`, pak reload: společný `try` přeskočí čtení předvoleb a start je přepíše výchozími hodnotami. Shodné v základním commitu. Systémové omezení pohybu zůstává výchozím základem.
3. Ruční zapnutí animací při systémovém omezení se po reloadu vrátí na omezené animace kvůli stávajícímu logickému OR. Nejde o novou změnu save ani preference.

## Meze ověření

Ověřeny skutečné handlery ve stávajícím minimálním DOM mocku a zdrojový kód. Tento audit neověřuje nativní dialogové události, skutečné CSS animace, dotykové souřadnice ani chování úložiště konkrétního prohlížeče. `motion.css` obsahuje jak `.reduced`, tak systémový media query fallback; jejich vykreslení vyžaduje prohlížečový test. Žádné implementační soubory nebyly změněny.
