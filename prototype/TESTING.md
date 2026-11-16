# Ověření prototypu

Datum: 16. listopadu 2026. Prostředí: cloudový Linux, Node.js 24.22.1.

## Ověřeno

`node --test tests/engine.test.js`: **12 testů úspěšných**. Obsahují:

- celý úspěšný průchod deseti směnami a čtyřmi dohodami;
- neúspěšnou variantu bez potravy a změny projektu;
- shodu předpovědi s výsledkem při zachování vstupního stavu;
- blokování směny před večerní dohodou a odmítnutí nepřípustné volby;
- uzavřené pobřeží, omezení těžké práce únavou a obnovení po odpočinku;
- následky hladové směny i pro odpočívající lidi;
- chybějící materiál, dodržený i porušený limit zkoušek;
- slib odpočinku konkrétnímu člověku v určený den;
- serializaci a obnovu stavu, odmítnutí poškozených uložených dat;
- 50 dalších deterministicky vybraných smíšených průchodů: zdroje zůstávají nezáporné, únava v mezích, stavy obnovitelné, konec dosažitelný.

Oba JavaScriptové soubory prošly kontrolou syntaxe. Toto ověřuje model a jeho data; automatické testy nejsou lidský playtest.

## Neověřeno v prohlížeči

Spravovaný náhled Sites se nepodařilo spustit: `relay could not open browser port 4173: timed out waiting for relay readiness`. Následný `sites-preview status` potvrdil zastavený náhled. Nebyl instalován jiný prohlížeč ani nahrazována infrastruktura.

Skutečné vykreslení, klávesnicový průchod dialogy, mobilní zobrazení a ukládání přes rozhraní prohlížeče proto **nejsou potvrzeny vizuálním testem**. V kódu jsou implementované, ale ověření herního modelu za jejich ověření nevydáváme.

## První lidský playtest

Sledovat prvních deset minut bez rad. Zaznamenat, zda hráč najde předpověď směny, chápe únavu a večerní tábor a dokáže vysvětlit výsledek slibu. Po dohrání se zeptat, proč změnil plán lodi a co pokládá za doloženou historii. Změřit skutečnou délku a poznamenat místa, kde jen opakuje zjevnou volbu. Před rozšiřováním kampaně opravit tato místa a doplnit browserovou kontrolu.
