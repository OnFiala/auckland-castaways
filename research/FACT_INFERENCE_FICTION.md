# Registr faktu, úsudku a fikce

Každý nový scénářový prvek musí být označen. `fact_attributed` je doložené tvrzení určitého svědka, nikoli nezávisle prokázaná událost. `unsupported` a `unverified` nejsou povolení mezeru libovolně vyplnit. [Strojový registr](../data/claims.csv).

| ID | Typ | Tvrzení / návrh | Opora | Omezení |
|---|---|---|---|---|
| C001 | `fact` | Grafton ztroskotal 3.1.1864 a všech pět lidí přežilo. | E003;E039; S001;S003 | Základ historického režimu. |
| C002 | `fact` | Invercauld: 25 na palubě, 19 na břehu, 3 zachránění. | E011;E036; S002;S007 | Jednotlivá jména stále provizorní. |
| C003 | `fact` | Skupiny o sobě za pobytu nevěděly; doložené setkání chybí. | E048; S001;S002;S003 | Neplánovat historickou společnou misi. |
| C004 | `fact` | Grafton poskytoval materiál z vraku a použitelný člun. | E004; S001;S003 | Konkrétní startovní počty jsou fikce balancování. |
| C005 | `fact` | U Graftonu existovalo napětí v otázce autority. | E007;E008;E040; S001 | Nekarikovat ostatní podle kapitánova soudu. |
| C006 | `fact_attributed` | Raynal popisuje písemná pravidla a odvolatelného vůdce. | E010; S003;S004 | Jediná zde prohlédnutá svědecká větev k přesné proceduře. |
| C007 | `fact_disputed_date` | Stěhování do Epigwaittu má dvě datování. | E005;E009; S001;S003;S004 | Žádné jedno přesné datum bez poznámky. |
| C008 | `fact` | Neúspěšná výroba vrtáků podnítila změnu projektu lodi. | E026; S001 | Historická kotva vertikálního řezu. |
| C009 | `fact` | Tři odpluli 19.7.1865 a dosáhli Port Adventure 24.7. | E032;E033; S001;S003 | Kdo odplul je pevná historická kotva. |
| C010 | `fact` | George a Henry byli vyzvednuti 24.8.1865. | E039; S001 | Záchrana trojice není konec. |
| C011 | `fact_attributed` | Musgrave zaznamenal nejisté pozorování kouře. | E038;E041; S001 | Neidentifikovat zdroj kouře. |
| C012 | `inference` | Srpnový kouř nemůže sám dokazovat přítomnost tří v květnu zachráněných mužů. | E036;E038;E044; S001;S002 | Chronologická námitka, nikoli pozitivní vysvětlení jevu. |
| C013 | `fact_identity_open` | V Port Ross bylo při návratu nalezeno tělo; identita není vyřešena. | E042; S001;S004 | Nepřiřazovat automaticky konkrétního člena posádky. |
| C014 | `inference` | Materiál, místo, roční doba, počet lidí a zdraví přispěly k rozdílným výsledkům. | E004;E012;E017;E020; S001;S002;S038 | Není kvantifikovaný kauzální model. |
| C015 | `fiction` | Hráč rozděluje práci na dvě směny a přiřazuje číselné úsilí. | E008;E025; S001 | Rozhraní a stupnice jsou autorská konstrukce. |
| C016 | `fiction` | Důvěra má tři stavové úrovně a explicitní sliby. | E007;E010;E040; S001;S003 | Žádné tvrzení o psychometrickém měření skutečných lidí. |
| C017 | `fiction` | Všechny nově napsané dialogy a vnitřní monology. | ;  | Nejde o přeložené citace ani ztracené deníky. |
| C018 | `fiction` | Zkrácení výroby a některých časových skoků v prototypu. | E021;E026;E027; S001;S003 | Viditelně uvést časovou kompresi. |
| C019 | `fiction_alternative` | Objev tábora Invercauldu hráčem během pobytu Graftonu. | ;  | Pouze oddělená alternativní historie; v doporučené kampani vyřazeno. |
| C020 | `fiction_alternative` | Všech pět odpluje v jednom únikovém člunu. | E031;E032; S001 | Není historický výsledek; v základním návrhu nepoužít. |
| C021 | `unsupported` | Přesná vzdálenost obou táborů nebo trasa pěšího spojení. | ;  | Bez mapového ověření neuvádět ani v marketingu. |
| C022 | `unverified_allegation` | Tvrzení o kanibalismu z pozdější tradice a moderních anotací. | ; S014;S015 | Původní Holdingův rukopis nečten. Žádná konkrétní scéna, akce ani automatická faktická hláška. |
| C023 | `fact` | Dochovaná muzejní krabička je z roku 1905, nikoli výrobek táborové dílny. | ; S020 | Nezařazovat do inventáře roku 1864. |
| C024 | `fact` | ZDF má přímé dokončené audiovizuální zpracování z roku 2022. | E050; S016;S017 | Neříkat že příběh nikdy nebyl zfilmován. |
| C025 | `fact_attributed` | Druett v květnu 2020 zmiňuje filmovou opci. | E049; S012 | Současná platnost a realizace neznámé. |
| C026 | `unverified` | Konkrétní osobní setkání Verna a Raynala v Paříži 1872. | ; S016 | Zjištěno jako rámec televizní synopse, nikoli historicky ověřeno. |
| C027 | `inference` | Herní domácnost má mít stejnou důležitost jako technické objevy. | E008;E020;E021; S001;S003 | Návrhové rozhodnutí z historických závislostí. |
| C028 | `fiction` | Scénář vystavuje jednoho dne výhně bouři, mokré palivo a spornou směnu současně. | E023;E025;E026; S001 | Složená dramatická situace, nikoli konkrétní doložený den. |
| C029 | `fact_attributed` | Smith popisuje lov a konstrukci plavidel Invercauldu. | E017; S038 | Doplnění proti obrazu naprosté pasivity; detaily potřebují sken. |
| C030 | `inference` | Zdroje a nejistota mohou být součástí epilogu a herního kodexu. | E044;E047; S001;S002;S004 | Způsob prezentace je vlastní návrh. |
| C031 | `fact` | Počáteční fáze záchranných depotů je pozdější než ztroskotání. | E045; S007;S006 | Nedávat do roku 1864 známou moderní síť zásob. |
| C032 | `fiction` | Tři doporučené varianty hlasování o rozdělení práce. | E010; S003 | Pravidla a následky voleb nejsou přepis historického hlasování. |
| C033 | `inference` | Návrat a pomoc komunity mají tvořit závěrečnou třetinu příběhu. | E033;E035;E039; S001;S003 | Původní struktura projektu, nikoli převzetí členění moderní knihy. |

| C034 | `fact_attributed_conflict` | Pokus s kvašeným nápojem a jeho konec mají rozdílná svědectví. | E051–E053; S001/S004 | Není ověřený úspěšný recept, palírna ani jistá motivace; [rozbor](FERMENTED_DRINK.md). |
