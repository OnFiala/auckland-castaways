# Systémy: historická opora a vlastní model

Všechny stupnice, číselné hodnoty a rovnice níže jsou **návrh prototypu**, nikoli naměřené hodnoty historické posádky. Systém má ukázat vazby a náklady rozhodování. Nemá dokazovat jedinou příčinu přežití ani poskytovat zdravotní nebo námořní výpočet.

## Denní smyčka

1. **Ráno:** počasí, stav domu, zásoby, stav lidí a nesplněné sliby. Prognóza uvádí jistotu; hráč nevidí budoucnost s přesností algoritmu.
2. **Dohoda:** návrh dvou směn a zajištění jídla, ohně i návratové rezervy. Náročné výjimky lze vysvětlit a kompenzovat.
3. **Práce:** úkol má osobu, místo, potřebné vybavení, náklady, přínos a podmínku přerušení. Před potvrzením je jasné, co je jisté a co odhad.
4. **Večer:** skutečný výsledek, opravy, jídlo, odpočinek a krátká reakce na konkrétní událost. Ztráta zásob nebo zranění nesmí přijít bez čitelné příčiny.
5. **Projekt:** posun stavby a poznání, včetně užitečného neúspěchu. Dlouhé měsíční procesy mohou pokračovat přes časové skoky.

Dvě směny denně jsou C015, vlastní konstrukce. Historická rotace práce E008 motivuje model, ale neudává jeho délku.

## Stav domácnosti

| Proměnná | Prototypová reprezentace | Historická vazba a mez |
|---|---|---|
| Potraviny | Celočíselné „porce domácnosti“, datum získání a dostupnost zpracování. | E020/E023; porce nejsou skutečné denní příděly ani kalorie. |
| Palivo | Suché / mokré, čas na přípravu, zásoba pro běžný oheň a výheň. | E025; dvě kategorie jsou zjednodušení, ne chemický model. |
| Přístřeší | Suché místo, opravy, komfort práce, kapacita sušení. | E006/E020; stav odráží údržbu. |
| Materiál | Dřevo, železo, omezená ocel, plátno, lano, kůže; některé kusy jako unikátní předměty. | E004/E025/E027; počáteční počty zatím fikce. |
| Člun | Dostupný / v opravě / připravený k místní plavbě / přestavovaný / vyzkoušený. | E004/E027/E028; při přestavbě nemusí sloužit jako dopravní prostředek. |
| Projekty | Rozpracovanost, získané poznatky, spotřebované a vratné materiály. | E026; změna cíle nezahodí automaticky vše. |

## Stav člověka

Každý má **kapacitu práce** (odpočatý / unavený / vyčerpaný), **omezení** (například bolavé ruce), **zkušenosti** (činnost a úroveň zaučení) a **závazky** (konkrétní slib odpočinku, střídání nebo konzultace). Jde o herní abstrakci. Číselné „zdraví 37 %“ nepředstírá klinickou pravdu a v prvním UI jej nepoužíváme.

Dovednost zvyšuje účinnost nebo snižuje nejistotu výsledku. Nikdo není jedinou osobou schopnou základní domácí práce. Zaučení může mít dnes nižší výkon a zítra snížit závislost na specialistovi. Únava a mokro působí přes další dostupnou práci, nikoli jako okamžitý trest smrti.

Přesčasy jsou možné jen se zobrazeným nákladem a omezením. Poškozené ruce nelze přebít „morálkou“. To dává odpočinku strategický význam a brání nekonečnému vykořisťování jedné nejvýkonnější postavy.

## Důvěra a souhlas

Pro první řez stačí stav **stabilní / napjatá / porušený závazek**, doplněný seznamem konkrétních událostí. Důvěra není měna utrácená k donucení. Stav se mění kvůli srozumitelným jednáním: nedodržená slíbená stopka, opakovaně nevyrovnaná směna, včas vysvětlené riziko, skutečně poskytnutý odpočinek.

Nesouhlas neznamená automatickou vzpouru ani sníženou lidskou hodnotu. Postava může nabídnout jiný úkol nebo podmínku. Rozhodnutí o specializaci může být férové, pokud je dohodnuté a reálně kompenzované. Rovnost každého kliknutí není jediný model spravedlivé spolupráce. Opora tématu: E007–E010/E040; přesný systém C016/C032.

## Výroba a neúspěch

Výrobní úkol má tři podmínky: **materiál**, **zázemí**, **znalost nebo zkoušku**. Nestačí zaplatit cenu a otevřít technologii. Výsledek zkoušky rozliší „nevhodný materiál“, „nepřesná výroba“ a „problém konstrukce“. Dává další rozhodnutí, ne pouze procentní šanci opakovat.

U vrtáku je historický uzel změna plánu pevný. První pokus poskytne informaci, druhý může zpřesnit mez. Třetí identický pokus nepřinese náhodný zázrak. Před potvrzením už hráč uvidí, že navrhuje stejné podmínky. Jiný přístup v prototypu neodemkne nedoloženou hotovou velkou loď; vyústí v srozumitelné uznání meze modelované historické situace.

Změna na člun převádí část připraveného dřeva a práce do nového projektu. Ukazatel „získané poznání“ zůstane, i když se jeden výrobek nepovedl. Příběh tak umí odměnit učení bez falšování výsledku E026.

## Počasí a prostor

První model používá tři třídy: **proveditelné / obtížné / zavřené pro danou činnost**. Vichřice může zavřít místní plavbu, ale dovolí některé práce uvnitř. Stejný den tudíž nemá univerzální produkční postih. Návratová cesta a doprava úlovku patří do ceny výpravy; „lovec zmizí a objeví se jídlo“ je příliš hrubé.

Předpověď může být nejistá, ale rozhodnutí hráče musí mít viditelné důvody. V prvním řezu je posloupnost počasí autorsky daná a zveřejněná jako testovací scénář. Nejde o rekonstruovanou meteorologii března 1865. Pro celou hru bude potřeba sezónní pravidlo a opatrně zvolená variabilita.

## Rozdělení skupiny a návrat

M08 rozdělí zásoby a sliby do dvou větví: plavba / čekání. Hra nemusí simulovat oba proudy po každé hodině, ale musí nést následky rozdělení. M10 změní typ zdrojů: zásadní je dostupná pomoc a ochota lidí, ne vyrobené železo. Hráč nemůže přikázat komunitě, aby splnila číselný požadavek. Přijetí pomoci a návrat tvoří dokončení systému vzájemných závazků.

## Ilustrační bilance jedné směny

Následující příklad je **čistě herní** a nepopisuje doložený den:

- Z pěti lidí se dva věnují výhni, jeden palivu, jeden domácnosti a jeden odpočinku kvůli rukám.
- Výheň spotřebuje dvě jednotky suchého paliva a jeden označený kovový kus. Zkouška přidá poznatek, nikoli funkční vrták.
- Domácnost přemění dostupné zásoby na použitelné porce a připraví suché místo; její vynechání dnes zhorší večerní zotavení.
- Pokud se prodlouží práce výhně, před potvrzením se ukáže, že člověku přidělenému na večerní palivo nezbude kapacita. Vzniká konkrétní volba, nikoli skrytý součet trestů.

## Pravidla konzistence pro implementaci

Zásoby neklesají pod nulu; materiál nemůže být zároveň v hotovém člunu i ve skladu; člověk není ve dvou současných místech; čekací proces nezrychlí bez doloženého herního důvodu; porušený slib má dohledatelnou příčinu; každá historická událost má odkaz E; každý numerický model je označený jako konstrukce. To jsou smysluplné budoucí testy implementace. V této revizi se neimplementuje motor ani jeho automatizované testy.
