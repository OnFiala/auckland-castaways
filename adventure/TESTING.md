# Ověření nové adventury

16. listopadu 2026. Cloudový Linux; žádné úpravy uživatelova Macu.

## Model hádanek

`node --test adventure/tests/engine.test.js`: **13 testů úspěšných**. Kontrolují úplné řešení, kombinace v obou pořadích, opakované i nesprávné použití, přechody mezi místnostmi, krátké rady, obnovu uložené hry a předčasné použití nástroje jako stožáru.

Nezávislá kontrola všech dosažitelných stavů nalezla **172 stavů a 410 změnových přechodů**. Z každého existuje cesta k dokončení. Hra neumožňuje omylem spotřebovat nezbytný předmět tak, aby nebylo možné pokračovat.

V kódu rozhraní byla opravena kolize stylů světových předmětů s inventářem a odložené zobrazení starého finále po restartu. Pozice cílů odpovídají kompozicím maleb. Z plážového podkladu byly generátorem odstraněny statické sbírané předměty; ve hře je tvoří samostatné vrstvy, které při sebrání zmizí.

## Obsluhy rozhraní

`node adventure/tests/ui-contract.cjs` spouští skutečné app.js a engine.js nad minimální napodobeninou DOM s řízeným časem animací. Prošel celým řešením, kombinováním, chybným použitím, vrácením předčasného stožáru, přechody lokací, načtením rozehrané hry, závěrečným obrazem, restartem i nedostupným úložištěm. Test pokrývá také závěrečný časovač po rychlém restartu. Nejde o skutečný prohlížeč ani renderer.

## Malované objekty a postavy

`node --test adventure/tests/art-contract.cjs` kontroluje přítomnost a rozměry obrázků, hranice jejich zobrazovacích výřezů, průhlednost podporující formát postav a SHA-256 všech jedenácti nových PNG. Nad skutečným rozhraním dále ověřuje, že každý předmět v inventáři i aktivní objekt ve scéně používá svůj malovaný podklad, každá lokace svou postavu a závěrečná skupina tři další odlišné malby. Testy se spouštějí i nad uloženými mezistavy řešení.

Save formát a pravidla hádanek zůstávají shodná s předchozí verzí. Test obsluh rozhraní prošel znovu i po výměně grafiky.

## Co tyto kontroly nepotvrzují

Automatická kontrola pravidel není vizuální kontrola hry. Spravovaný cloudový náhled v tomto prostředí opakovaně selhává na připojení browserového relay. Vzhled ve skutečném prohlížeči, čitelnost na mobilu a pocit z chůze tak zůstávají bez potvrzeného lidského/browserového průchodu. Výtvarný agent a koordinátor prohlédli samotné obrazové soubory; to nenahrazuje zkoušku složené scény.

Délka, obtížnost a zábavnost zatím nejsou změřené lidským playtestem. Tato kapitola je novým základem adventury, nikoli hotovou celou kampaní.
