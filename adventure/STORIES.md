# Rozhovory na cestě z Epigwaittu

Na první pláži Raynal potřebuje pomoc, aby mohl zůstat sedět v závětří. Sám však odtud vidí cíp plachty, na který Alick nedosáhne. U vraku se kapitán nejdřív zeptá po nemocném druhovi. Až mu Alick řekne, kde nechal ostatní, může se Musgrave opřít do mokré bedny a společně se podívají, co uvnitř zůstalo suché. Hráč může jít k vraku i do tábora dřív, než získá plachtu. Žádný z těch rozhovorů nepodmiňuje další práci.

Každou postavu lze oslovit u její práce. Na jednu repliku odpovídá druhý člověk. Proměna práce mění i odpověď. Když Alick přijde ke stejné bedně po otevření, kapitán už ví, že troud je suchý. Teď je zvědavý, kde Alick vezme dřevo. Rozhovor lze ihned opustit. Znalost konkrétní věty se v inventáři ani v řešení hádanky nevyžaduje. Při srpnovém návratu je potřeba osobně oslovit oba čekající muže. [Scénář první noci](dist/stories.js) · [Scénář dalších kapitol](dist/voyage-stories.js)

## Kde člověka najdeme a co od něj ostatní potřebují

| Kapitola a místo | Práce a důvod k hovoru | Co se po práci změní |
|---|---|---|
| I. Pláž | Nemocný Raynal v závětří pozoruje utrženou plachtu. Alick má volné ruce a vidí, kam dosáhne příboj. | Po uvolnění plachty Raynal posoudí obrubu. Jakmile je střecha hotová, přesune se z pláže na suché místo u Henryho. Může Alickovi rozprostřít mokrý kabát. |
| I. Vrak | Musgrave sleduje přicházející vlny a přidržuje bednu. Alick najde oporu pro páčení. | Kapitán zkontroluje troud a předá sekeru. Vrak opustí, až má tábor střechu, oheň i signál. U otevřené strany přístřešku si znovu spočítá celou posádku. |
| I. Tábor | Henry hledá suché místo na spaní. George sem nosí zachráněné věci a zjišťuje, co je vidět od vody. | Henry chrání třísky před větrem. George a Alick porovnávají viditelnost bílé látky a zdvižené ruky. Nakonec je v táboře všech pět. |
| II. Dům a potok | Henry odsouvá lůžkoviny zpod kapající střechy. George zkouší, odkud se dá bezpečně dosáhnout na tekoucí vodu. | Henry může naplnit místo u ohně hrnky. George podá Alickovi při výstupu ruku. Na suchý stůl se vracejí šachy. |
| III. Kovárna a uhlí | Raynal potřebuje vést vzduch až pod uhlí a prověřit vrták proti tvrdému dřevu. George vybírá palivo a použitelný kov. | Ohnutá špička ukončí plán s velkým kýlem. Alick odnese k malé lodi hřeby, George už ví, které další odřezky mají cenu. |
| IV. Člun a zásoby | Musgrave může u žebra zatlouct hřeb. Alick přitom přidržuje pružící prkno. Henry samostatně rozhodne, které dřevo zůstane domu. | Těsnost zkusí z opačných stran. Henry s Georgem budou potřebovat i jehlu a nit. Volba úkrytu se jim v srpnu vrátí. |
| V. Otevřené moře | Raynal a Alick se střídají u kormidla. Musgrave se drží lana, aby zůstal u čerpadla. Při rozhovoru přes člun se nemohou všichni otočit. | Alick získá volné ruce pro naběračku. Jakmile voda klesne, může na chvíli přejít od kapitána k plachtě. |
| VI. Přístav a mapa | V roli kapitána hráč jedná o cestě zpátky. Na molu v Invercargillu s ním Raynal probírá potraviny pro první chvíle po setkání. Nad mapou v Invercargillu je Musgrave sám. | Přispěvatelé v Invercargillu obstarali mj. přikrývky a oblečení. Cross na cestu jižně potřebuje vědět, kde oba muži jsou. O dřívějším přijetí v Port Adventure na Stewartově ostrově tu oba mluví zpaměti. Raynalova práce u balíků je vymyšlená. |
| VII. Dům a přístaviště | Henry se musí přidržet sloupu. George bere Musgravea za ruku a chce slyšet, jak dopadli ostatní. Hráč může oslovit kteréhokoli jako prvního. | Při dalším rozhovoru muži mluví o tom, co během čekání sami vykonali, včetně voru ze čtyř sudů. U člunu George pomáhá Henrymu nastoupit. |

## Co lze připsat svědkům

Nemoc při ztroskotání a dlouhé práce popsal Raynal. Musgrave vylíčil střídání u kormidla, svoji práci u čerpadla, přijetí v Port Adventure a Macphersonovu sbírku v Invercargillu. Pro konec hry jsou podstatné strany 116–118 jeho deníku. Kapitán osobně pozoroval George, jak mu svírá ruku oběma rukama. O sporech, hrozícím rozchodu a stavbě voru se naopak dozvěděl od obou mužů po návratu. Kapitán neurčuje, kdo první spatřil loď. Herní rozhovory nepřidělují tento objev ani jednomu. [Pramenné poznámky ke hře](HISTORICAL_ADAPTATION.md) · [Registr S001, S003 a S004](../sources/REGISTER.md)

Všechny promluvy vznikly pro hru. Konkrétní úkony, doteky, humor i způsob, jakým se pětice oslovuje, jsou součástí dramatizace. Na stejném ostrově pobývali rovněž lidé z Invercauldu. Žádná hratelná postava je při těchto pracích nepotká. [Obě posádky](../research/CREW.md) · [Rozpory svědectví](../research/CONFLICTS.md)

## Rozhraní scénáře

`conversation(id, state)` vrací jednotlivé repliky s identitou mluvčího a anglickým textem. V samotné replice znamená `player` vždy Alicka. Promluvy kapitána mají i po změně pohledu v VI. kapitole ID `musgrave`. `speakerInfo(id, state)` podle této identity zvolí jméno a portrét. Starší volání `lines(id, state)` vrací jméno prvního mluvčího, portrét a nové pole textových řetězců. Vstupní zkratka `lines('player', state)` dál označuje současnou hráčskou postavu.

`arrival(state)` nabízí tři úvodní repliky na první pláži. Krátké reakce při práci vrací `workBeat(previousFlags, state)` jen při přechodu příslušného příznaku. Testy procházejí skutečnost, která se může hráči zobrazit při postupu hrou: ke každému dosažitelnému setkání zjišťují, kdo stojí v dané místnosti a zda všechny repliky opravdu patří někomu z přítomných. [Testy příběhu](tests/story.test.cjs)
