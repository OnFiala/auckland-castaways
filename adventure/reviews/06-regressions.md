# Regresní kontrola rozhraní

16. listopadu 2026. Kontroly byly spuštěny v cloudovém Linuxu. Test UI vykonává skutečný `app.js` a `engine.js` nad zjednodušeným DOM mockem; nejedná se o prohlížeč ani kontrolu vykreslení.

- `node --test adventure/tests/engine.test.js`: 13 testů prošlo. Poslední prochází všech 172 dosažitelných stavů a ověřuje cestu k dokončení.
- `node adventure/tests/ui-contract.cjs`: prošel úplný průchod hádankami, chybná kombinace, vrácení předčasného stožáru, načtení mezistavu, finále, restart i zablokované úložiště. Kontroluje také zrušení čekajícího finále po restartu a odeznění zpětné vazby.
- Stejný test nyní ověřuje popisky při fokusu cílů, inventáře a východu, zachování fokusu při výběru, zachování nedotčeného cíle po překreslení, Esc během dialogu i mimo něj a návrat fokusu po zavření dialogu. Mock podporuje odstranění prvků, fokus a událost zavření dialogu.
- `node --test adventure/tests/art-contract.cjs`: 4 testy prošly, včetně kontrol výřezů, hashů a použití obrazových podkladů ve stavech hry.

Mock sám nesimuluje nativní zavření dialogu klávesou Escape, pořadí Tab, skutečný browserový fokus, zobrazení, rozložení, animace, dotyk nebo reálné úložiště. V testu se dialog po odeslání Esc zavírá výslovně. Tyto oblasti vyžadují browserový a lidský průchod. Výsledky se vztahují ke stavu souborů při spuštění; po dalších úpravách je nutné kontroly zopakovat.
