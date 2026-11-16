/* Original Czech adaptation; historical evidence is attributed per chapter. */
(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory();else root.CastawayStory=factory();})(typeof globalThis!=='undefined'?globalThis:this,function(){return {
  "title": "Dokud se nevrátíme",
  "subtitle": "Pět lidí. Jeden ostrov. Slib návratu.",
  "version": 1,
  "disclaimer": "Historické uzly vycházejí z pramenů. Všechny dialogy, malé scény, číselné hodnoty a důsledky voleb jsou původní fikce. Volby mění připravenost a tón vyprávění; nezmění doloženou záchranu pěti lidí Graftonu.",
  "chapters": [
    {
      "id": "c01",
      "title": "Břeh pro pět lidí",
      "date": "3. ledna 1864",
      "location": "Carnley Harbour · Aucklandův ostrov",
      "scene": "wreck",
      "weather": "storm",
      "intro": [
        "Vlny zvedají Grafton a zase jej pokládají na mělčinu. Pokaždé o něco tvrději. V podpalubí se pohybují předměty, které ještě včera měly své místo. Raynal je zesláblý nemocí. Musgrave už nehledá cestu pro loď. Hledá cestu pro pět lidí.",
        "Na břehu se rýsují mokré stromy. Mezi nimi není přístav ani připravený dům. Je tam však pevná zem. Člun může převézt lidi a později i část vybavení. První společný plán bude kratší než věta: dostat všechny z vody."
      ],
      "objective": "Dostaňte pětici na břeh a určete, co zachráníte jako první.",
      "source": {
        "label": "Doloženo · S001/S003 · E003–E004",
        "detail": "Grafton ztroskotal 3. ledna. Všech pět mužů přežilo a z vraku získali zásoby i vybavení. Pořadí jednotlivých herních voleb je fikce.",
        "url": "https://github.com/OnFiala/auckland-castaways/blob/main/research/CHRONOLOGY.md"
      },
      "steps": [
        {
          "id": "c01s1",
          "title": "Přes okraj paluby",
          "narration": "Člun se odráží od trupu. Raynal musí přes okraj s pomocí ostatních; další náklad počká na návrat. Na jeho dně je místo pro několik věcí. Rozhodujete o prvním základu společného života, nikoli o tom, koho zachránit.",
          "speaker": "Thomas Musgrave",
          "dialogue": "Nejdřív každý z nás. Potom to, co nám dovolí vydržet další cestu.",
          "choices": [
            {
              "id": "c01s1a",
              "label": "Přibrat suché zásoby",
              "detail": "První náklad pomůže s jídlem. Těžší nástroje vyzvednete později.",
              "effects": {
                "food": 2,
                "hope": 0,
                "craft": -1,
                "trust": 0
              },
              "log": "Na první cestě dostaly přednost suché zásoby."
            },
            {
              "id": "c01s1b",
              "label": "Přibrat bednu nářadí",
              "detail": "Získáte základ oprav; první jídlo bude skromnější.",
              "effects": {
                "food": -1,
                "hope": 0,
                "craft": 2,
                "trust": 0
              },
              "log": "První náklad zahrnoval nářadí pro další práci."
            }
          ]
        },
        {
          "id": "c01s2",
          "title": "Lano k souši",
          "narration": "Všech pět stojí na břehu. Zatím mu nelze říkat tábor. Každý návrat k vraku bude potřebovat zajištěný člun a ruce, které ještě udrží lano. Soumrak zkracuje dobu, kdy je na vodě dobře vidět.",
          "speaker": "Alick Maclaren",
          "dialogue": "Teď jej vytáhneme pořádně. Ten člun nás možná bude živit dlouho.",
          "choices": [
            {
              "id": "c01s2a",
              "label": "Nejprve zajistit člun",
              "detail": "Odložíte další náklad, ale chráníte prostředek dalších výprav.",
              "effects": {
                "food": -1,
                "hope": 0,
                "craft": 1,
                "trust": 1
              },
              "log": "Člun dostal bezpečné místo a jasnou službu."
            },
            {
              "id": "c01s2b",
              "label": "Využít poslední světlo",
              "detail": "Vrátíte se pro zásoby; zajištění člunu dokončíte společně za šera.",
              "effects": {
                "food": 2,
                "hope": -1,
                "craft": 0,
                "trust": 0
              },
              "log": "Poslední světlo patřilo další cestě pro zásoby."
            }
          ]
        },
        {
          "id": "c01s3",
          "title": "První noc",
          "narration": "Pod mokrým plátnem je slyšet všech pět hlasů. Vrak ve tmě mizí, ale práce na něm neskončila. George hledí k místu, kde ještě před několika hodinami bývala jejich paluba. Henry rozděluje to, co lze sníst bez další přípravy.",
          "speaker": "Henry Forgés",
          "dialogue": "Každý potřebuje něco do žaludku. A vědět, kdo ho vystřídá.",
          "choices": [
            {
              "id": "c01s3a",
              "label": "Rozdělit jídlo a služby",
              "detail": "Větší společné jídlo dodá jistotu, zásoba se ztenčí.",
              "effects": {
                "food": -1,
                "hope": 1,
                "craft": 0,
                "trust": 2
              },
              "log": "První noc dostala společné jídlo a střídání služeb."
            },
            {
              "id": "c01s3b",
              "label": "Nechat rezervu na ráno",
              "detail": "Skromnější večeře zachová zásobu pro další práci.",
              "effects": {
                "food": 1,
                "hope": -1,
                "craft": 0,
                "trust": 1
              },
              "log": "Část první večeře zůstala jako ranní rezerva."
            }
          ]
        }
      ],
      "closing": "První noc končí. Je jich pět. Vrak stále vydává materiál a člun je na břehu. Záchrana dneška se mění v otázku, jak zařídit zítřek."
    },
    {
      "id": "c02",
      "title": "Dům jménem Epigwaitt",
      "date": "První měsíce roku 1864",
      "location": "Břeh Carnley Harbour",
      "scene": "camp",
      "weather": "rain",
      "intro": [
        "Zachráněné věci přestávají být lodním nákladem. Plachta se mění ve střechu, prkno v pracovní plochu a truhla v místo, které musí zůstat suché. Déšť nerozlišuje mezi dobrou myšlenkou a hotovou stěnou.",
        "Dům dostane jméno Epigwaitt. Přesný den nastěhování si prameny pamatují různě: Musgraveův zápis ukazuje na únor, Raynal uvádí březen. Pro jejich těla je rozdíl mezi venkem a vnitřkem mnohem určitější."
      ],
      "objective": "Vybudujte přístřeší, které dovolí lidem odpočívat i pracovat.",
      "source": {
        "label": "Svědectví a rozpor · E005–E006/E009",
        "detail": "Musgrave uvádí rozměry 24 × 16 stop. Datum nastěhování se s Raynalem rozchází; hra používá širší období.",
        "url": "https://github.com/OnFiala/auckland-castaways/blob/main/research/CHRONOLOGY.md"
      },
      "steps": [
        {
          "id": "c02s1",
          "title": "Co má být suché první",
          "narration": "Krov drží, několik míst však propouští vodu. Práce na střeše zaměstná stejné ruce, které potřebujete venku. Není možné dokončit celý dům v jediném dni. Každé pořadí něco zachrání a něco nechá čekat.",
          "speaker": "François Raynal",
          "dialogue": "Když zachráníme jednu suchou plochu, zítra na ní opravíme druhou.",
          "choices": [
            {
              "id": "c02s1a",
              "label": "Dokončit střechu",
              "detail": "Dílna získá chráněné místo; na potravu zbude méně sil.",
              "effects": {
                "food": -1,
                "hope": 0,
                "craft": 2,
                "trust": 0
              },
              "log": "Nejdřív jsme uzavřeli střechu nad pracovním místem."
            },
            {
              "id": "c02s1b",
              "label": "Udělat místo pro spánek",
              "detail": "Společný odpočinek pomůže náladě, dílna zatím zůstane provizorní.",
              "effects": {
                "food": 0,
                "hope": 1,
                "craft": -1,
                "trust": 2
              },
              "log": "Nejprve vzniklo suché místo pro všech pět."
            }
          ]
        },
        {
          "id": "c02s2",
          "title": "Krb a komín",
          "narration": "Kouř z ohně potřebuje cestu ven, teplo má zůstat uvnitř. Henry přesouvá nádobu, aby se do ní nesypala hlína. Alick porovnává zachráněná prkna. Dům má být místem práce; jídlo už nelze znovu a znovu odsouvat na později.",
          "speaker": "Henry Forgés",
          "dialogue": "Dnes se zase najíme mezi nářadím. Zítra už bych rád věděl kde.",
          "choices": [
            {
              "id": "c02s2a",
              "label": "Vyhradit místo ohništi",
              "detail": "Vaření bude snazší; vybavení dílny zatím počká.",
              "effects": {
                "food": 1,
                "hope": 0,
                "craft": -1,
                "trust": 1
              },
              "log": "Ohniště dostalo trvalé místo a vaření vlastní čas."
            },
            {
              "id": "c02s2b",
              "label": "Spojit práci na ohni a dílně",
              "detail": "Zkušenější ruce pomohou oběma úkolům za cenu delšího dne.",
              "effects": {
                "food": 0,
                "hope": -1,
                "craft": 2,
                "trust": 0
              },
              "log": "Ohniště i pracovní prostor vznikaly společnou směnou."
            }
          ]
        },
        {
          "id": "c02s3",
          "title": "Práh",
          "narration": "Ve dveřích ještě nejsou všechny spáry utěsněné. Přesto lze poprvé vstoupit dovnitř a odložit mokrý oděv. Musgrave se dívá na pět míst kolem ohně. Dům nikdo nezvládne udržovat sám a nikomu nemůže patřit jen podle hodnosti.",
          "speaker": "George Harris",
          "dialogue": "Tak tedy tady. Aspoň teď víme, kam se vracíme.",
          "choices": [
            {
              "id": "c02s3a",
              "label": "Označit společné místo",
              "detail": "Na chvíli přerušíte práci a připomenete, komu dům slouží.",
              "effects": {
                "food": 0,
                "hope": 2,
                "craft": -1,
                "trust": 1
              },
              "log": "Jméno Epigwaitt jsme spojili se společným závazkem."
            },
            {
              "id": "c02s3b",
              "label": "Sepsat další opravy",
              "detail": "Naději vyjádříte konkrétním plánem dokončení.",
              "effects": {
                "food": 0,
                "hope": 1,
                "craft": 1,
                "trust": 0
              },
              "log": "První večer uvnitř vznikl seznam oprav a služeb."
            }
          ]
        }
      ],
      "closing": "Epigwaitt není bezpečí navždy. Je to suchý začátek, který budou muset každý den znovu udržet."
    },
    {
      "id": "c03",
      "title": "Kdo dnes vaří",
      "date": "Rané soužití · rok 1864",
      "location": "Epigwaitt",
      "scene": "camp",
      "weather": "clear",
      "intro": [
        "Loď měla kapitána. V domě stojí pět misek a u každé sedí člověk, jehož práce je potřeba. Musgrave si do deníku zapisuje nespokojenost a oslabenou autoritu. Raynal později vypráví o dohodě, volbě vůdce a právu jej odvolat.",
        "Žádný z těchto textů neznamená, že se všichni každý den shodli. Dřevo je třeba přinést i po hádce. Někdo musí uvařit, i když jeho práce vypadá méně nápadně než nový nástroj."
      ],
      "objective": "Dohodněte rozdělení práce, které každý dokáže vysvětlit.",
      "source": {
        "label": "Dva pohledy · S001/S004 · E007–E010/E054",
        "detail": "Musgrave píše o střídání vaření včetně sebe. Raynal líčí volbu vůdce a jinou podobu služeb. Přesná herní dohoda je autorská scéna.",
        "url": "https://github.com/OnFiala/auckland-castaways/blob/main/research/CHRONOLOGY.md"
      },
      "steps": [
        {
          "id": "c03s1",
          "title": "Pátá miska",
          "narration": "Jeden člověk se vrátil s jídlem, druhý opravil nástroj, třetí celý den udržoval oheň. Večer není vidět, kdo kterou práci zachránil. Henry nechává před sebou prázdnou nádobu. Potřebuje, aby někdo převzal zítřejší službu.",
          "speaker": "Henry Forgés",
          "dialogue": "Jídlo se neudělá samo jen proto, že je každý den na stejném místě.",
          "choices": [
            {
              "id": "c03s1a",
              "label": "Zavést střídání služeb",
              "detail": "Každý pozná domácí práci, část specializované práce se zpomalí.",
              "effects": {
                "food": 0,
                "hope": 0,
                "craft": -1,
                "trust": 2
              },
              "log": "Vaření a údržba přešly do společného střídání."
            },
            {
              "id": "c03s1b",
              "label": "Domluvit služby a náhradu",
              "detail": "Zkušení zůstanou u práce, ale služba získá konkrétní den volna.",
              "effects": {
                "food": -1,
                "hope": 0,
                "craft": 1,
                "trust": 1
              },
              "log": "Rozdělení služeb zahrnulo pojmenovanou náhradu."
            }
          ]
        },
        {
          "id": "c03s2",
          "title": "Kdo rozhodne zítra",
          "narration": "Musgrave navrhuje pořadí prací. Raynal se ptá, co se stane, když se někdo nebude moci účastnit. Nejde o hlasování o přílivu nebo dešti. Jde o možnost říct včas, že plán přesahuje síly člověka, který jej má vykonat.",
          "speaker": "Thomas Musgrave",
          "dialogue": "Potřebuji vědět, co dokážeme udělat. A slyšet to dřív, než někdo padne únavou.",
          "choices": [
            {
              "id": "c03s2a",
              "label": "Plán probrat společně",
              "detail": "Rozhodování zabere čas, ale námitky zazní před prací.",
              "effects": {
                "food": 0,
                "hope": 0,
                "craft": -1,
                "trust": 2
              },
              "log": "Každý dostal příležitost upravit společný plán."
            },
            {
              "id": "c03s2b",
              "label": "Určit vedoucího směny",
              "detail": "Jasná odpovědnost urychlí práci; každá směna má možnost změny.",
              "effects": {
                "food": 0,
                "hope": 0,
                "craft": 1,
                "trust": 1
              },
              "log": "Dohoda určila vedoucího směny a možnost plán přehodnotit."
            }
          ]
        },
        {
          "id": "c03s3",
          "title": "Večer bez vítěze",
          "narration": "Napětí nezmizí podpisem ani potřesením ruky. Alick po večeři obrací v prstech kus dřeva. George ještě drží v hlavě odpověď, kterou během dne nestihl říct. Potřebují zakončit spor tak, aby mohli ráno znovu pracovat vedle sebe.",
          "speaker": "Alick Maclaren",
          "dialogue": "Nemusíme dnes vyhrát jeden nad druhým. Zítra to prkno stejně uneseme ve dvou.",
          "choices": [
            {
              "id": "c03s3a",
              "label": "Dopřát si společný večer",
              "detail": "Odložíte jednu opravu a obnovíte chuť být spolu.",
              "effects": {
                "food": 0,
                "hope": 2,
                "craft": -1,
                "trust": 1
              },
              "log": "Po sporu jsme nechali práci na ráno a zůstali u stolu."
            },
            {
              "id": "c03s3b",
              "label": "Dokončit drobnou opravu spolu",
              "detail": "Společný úkol nabídne klidnější způsob, jak uzavřít den.",
              "effects": {
                "food": 0,
                "hope": 0,
                "craft": 1,
                "trust": 1
              },
              "log": "Spor uzavřela malá oprava, na které se podílelo víc rukou."
            }
          ]
        }
      ],
      "closing": "Dohoda nemění pět lidí v jeden hlas. Dává jejich rozdílným hlasům místo u stejného stolu.",
      "archive": {
        "title": "Z jiného břehu · 10. května 1864",
        "text": "O této události pětice v Epigwaittu neví. Invercauld ztroskotal na severu Aucklandova ostrova. Z 25 mužů se 19 dostalo na břeh. Kapitán George Dalgarno popisuje rychlý rozpad lodi, zranění a jen nepatrné zachráněné zásoby. Jeho časový odhad není přesná stopáž katastrofy.\n\nGrafton měl dostupný vrak, člun a materiál. Severní skupina začínala v jiných podmínkách. Toto je pozdější archivní pohled hráče, nikoli zpráva, kterou by postavy slyšely.",
        "source": {
          "label": "Dalgarno a Smith · S002/S038 · E011–E013/E048",
          "detail": "Počty 25 → 19 jsou doložené. Rozdílný výsledek přežití nelze vysvětlit pouze vedením.",
          "url": "https://github.com/OnFiala/auckland-castaways/blob/main/research/CHRONOLOGY.md"
        }
      }
    },
    {
      "id": "c04",
      "title": "Než se vrátí světlo",
      "date": "První zima · červen až září 1864",
      "location": "Epigwaitt a pobřeží",
      "scene": "winter",
      "weather": "rain",
      "intro": [
        "Dny se krátí a mokré věci se suší pomaleji, než přibývají nové. Dům stojí, ale na jeho stěnách nelze stavět jistotu, že se každá výprava vrátí s dostatkem potravy. Před dveřmi se opotřebovává cesta. Uvnitř se opotřebovávají boty.",
        "Raynal zkouší pracovat s kůžemi. Později popíše dlouhé činění a opravy nepovedených bot. Na ostrově neexistuje krámek, kde by neúspěšný výrobek vyměnil. Zbývá jej pochopit, rozebrat a spravit."
      ],
      "objective": "Udržte potravu i možnost vrátit se z výpravy včas.",
      "source": {
        "label": "Doložený proces · E020–E021",
        "detail": "Zimní obtíže a dlouhé zpracování kůží mají oporu v pamětech. Konkrétní denní počasí a herní zásoby jsou fikce.",
        "url": "https://github.com/OnFiala/auckland-castaways/blob/main/research/CHRONOLOGY.md"
      },
      "steps": [
        {
          "id": "c04s1",
          "title": "Kdo půjde ven",
          "narration": "Od rána prší šikmo přes zátoku. Dál na pobřeží může být potrava, ale cesta zpátky bude stejně dlouhá jako cesta tam. George si kontroluje obutí. Henry počítá, co může připravit lidem po návratu.",
          "speaker": "George Harris",
          "dialogue": "Vyrazím. Jen si řekněme, kdy se mám otočit, i kdybych nic nenašel.",
          "choices": [
            {
              "id": "c04s1a",
              "label": "Krátká výprava s rezervou",
              "detail": "Menší přínos jídla chrání síly pro další den.",
              "effects": {
                "food": 1,
                "hope": 1,
                "craft": 0,
                "trust": 0
              },
              "log": "Výprava dostala čas návratu a rezervu pro špatné počasí."
            },
            {
              "id": "c04s1b",
              "label": "Delší výprava ve dvojici",
              "detail": "Více potravy stojí část času na opravy a domácnost.",
              "effects": {
                "food": 2,
                "hope": -1,
                "craft": -1,
                "trust": 0
              },
              "log": "Delší výprava šla ve dvojici a spotřebovala další pracovní čas."
            }
          ]
        },
        {
          "id": "c04s2",
          "title": "Boty, které vydrží cestu",
          "narration": "Kůže je na jednom místě příliš tvrdá a jinde ustupuje. Alick podrží šev, Raynal zkouší jiný způsob spojení. Není to jediný opravovaný pár. Dlouhá práce nezaručuje výsledek, ale i nepovedený kus ukazuje, kde příště začít.",
          "speaker": "François Raynal",
          "dialogue": "Udělali jsme botu. Teď se musíme naučit udělat takovou, která se vrátí domů.",
          "choices": [
            {
              "id": "c04s2a",
              "label": "Opravit dostupné páry",
              "detail": "Použitelnost má přednost před novým postupem.",
              "effects": {
                "food": 0,
                "hope": 1,
                "craft": 1,
                "trust": 0
              },
              "log": "Dostupné boty dostaly opravy před další výpravou."
            },
            {
              "id": "c04s2b",
              "label": "Věnovat den zkoušce švu",
              "detail": "Další zkušenost stojí část dne, který mohl přinést potravu.",
              "effects": {
                "food": -1,
                "hope": 0,
                "craft": 2,
                "trust": 0
              },
              "log": "Zkouška nového švu rozšířila společnou zkušenost."
            }
          ]
        },
        {
          "id": "c04s3",
          "title": "Oheň po návratu",
          "narration": "Za dveřmi se objeví mokré postavy. O výsledku výpravy se bude mluvit za chvíli. Nejdřív musí dolů promáčené věci a někdo musí přiložit. Plán další práce lze napsat i ráno; člověka nelze odložit do rohu jako nářadí.",
          "speaker": "Henry Forgés",
          "dialogue": "Posaď se. Řekneš nám to, až přestaneš svírat tu misku oběma rukama.",
          "choices": [
            {
              "id": "c04s3a",
              "label": "Dát přednost zotavení",
              "detail": "Večer patří jídlu a teplu, nářadí počká.",
              "effects": {
                "food": -1,
                "hope": 2,
                "craft": 0,
                "trust": 1
              },
              "log": "Po návratu dostali lidé přednost před další opravou."
            },
            {
              "id": "c04s3b",
              "label": "Rozdělit večer na dvě služby",
              "detail": "Odpočívající vystřídá druhá dvojice při drobných opravách.",
              "effects": {
                "food": 0,
                "hope": 0,
                "craft": 1,
                "trust": 1
              },
              "log": "Večerní práci převzali ti, kteří nebyli na výpravě."
            }
          ]
        }
      ],
      "closing": "Zimu nepřekoná jediná velká událost. Překonávají ji návraty: člověk ke dveřím, miska na stůl a ruce k práci, až znovu mohou."
    },
    {
      "id": "c05",
      "title": "Loď, která nepřiplouvá",
      "date": "Jaro 1864 až únor 1865",
      "location": "Vyhlídka nad zátokou",
      "scene": "shore",
      "weather": "fog",
      "intro": [
        "Když se mraky rozestoupí, obzor zůstává prázdný. Někdy to znamená klidnější den, jindy další zklamání. Pětice už zná mnoho místních cest. O tom, kdo je ve světě hledá, neví skoro nic.",
        "Rok se mění, ostrov zůstává. Raynal později popisuje slábnoucí očekávání pomoci. Musgrave zaznamená dlouhou lednovou vichřici a potíže se získáváním potravy. Čekání je také práce — a také něco stojí."
      ],
      "objective": "Proměňte čekání v první společný plán odchodu.",
      "source": {
        "label": "Svědectví · E022–E024",
        "detail": "Paměti popisují posun od očekávání pomoci k vlastnímu úniku. Lednovou vichřici Musgrave zapsal zpětně 5. února.",
        "url": "https://github.com/OnFiala/auckland-castaways/blob/main/research/CHRONOLOGY.md"
      },
      "steps": [
        {
          "id": "c05s1",
          "title": "Místo na obzoru",
          "narration": "Každá hlídka přinese zprávu, i když je stále stejná. Dům přitom potřebuje údržbu a stůl jídlo. George neprosí o zákaz hlídek. Ptá se, jestli jejich den musí vždycky začínat stejným nevyplněným očekáváním.",
          "speaker": "George Harris",
          "dialogue": "Díváme se tam každý den. Mohli bychom každý den udělat i něco, co záleží na nás.",
          "choices": [
            {
              "id": "c05s1a",
              "label": "Střídat krátké hlídky",
              "detail": "Zachováte pozornost k moři a část naděje.",
              "effects": {
                "food": 0,
                "hope": 1,
                "craft": 0,
                "trust": 1
              },
              "log": "Hlídky dostaly kratší střídání a jasný konec."
            },
            {
              "id": "c05s1b",
              "label": "Přesunout síly do dílny",
              "detail": "Vlastní projekt pokročí, úleva z pozorování obzoru ustoupí.",
              "effects": {
                "food": 0,
                "hope": -1,
                "craft": 2,
                "trust": 0
              },
              "log": "Část času hlídek přešla do přípravy úniku."
            }
          ]
        },
        {
          "id": "c05s2",
          "title": "Čára na prkně",
          "narration": "Musgrave kreslí budoucí kýl. Zbytek stěžně Graftonu může být počátkem většího plavidla. O rozměrech se dá mluvit dlouho; o nástrojích a spojích teprve začínají. Raynal vedle čáry pokládá dostupné železo.",
          "speaker": "Thomas Musgrave",
          "dialogue": "Když známe směr, potřebujeme ještě vědět, na čem po něm poplujeme.",
          "choices": [
            {
              "id": "c05s2a",
              "label": "Nejprve prověřit nástroje",
              "detail": "Pomalejší začátek dá projektu pevnější technický základ.",
              "effects": {
                "food": 0,
                "hope": -1,
                "craft": 2,
                "trust": 0
              },
              "log": "Plán lodi začal soupisem potřebných nástrojů."
            },
            {
              "id": "c05s2b",
              "label": "Ukázat plán všem",
              "detail": "Společná představa zvedne odhodlání a otevře další otázky.",
              "effects": {
                "food": 0,
                "hope": 2,
                "craft": -1,
                "trust": 1
              },
              "log": "Návrh větší lodi dostali k posouzení všichni."
            }
          ]
        },
        {
          "id": "c05s3",
          "title": "Další ráno na ostrově",
          "narration": "Vichřice drží pětici uvnitř déle, než chtěli. Nový projekt nezmění počasí. Alick předělává seznam práce tak, aby po něm něco zůstalo i během dní, kdy nelze dál po pobřeží. Henry k seznamu přidává jídlo.",
          "speaker": "Alick Maclaren",
          "dialogue": "Loď nezačne sama od sebe. Ale začít můžeme po částech.",
          "choices": [
            {
              "id": "c05s3a",
              "label": "Začít malým společným úkolem",
              "detail": "Dílna získá první výsledek, zásoby budou potřebovat další výpravu.",
              "effects": {
                "food": -1,
                "hope": 1,
                "craft": 1,
                "trust": 0
              },
              "log": "Dlouhé čekání přerušil malý splnitelný úkol."
            },
            {
              "id": "c05s3b",
              "label": "Nejprve obnovit zásoby",
              "detail": "Práce počká na bezpečnější zásobu jídla.",
              "effects": {
                "food": 2,
                "hope": -1,
                "craft": 0,
                "trust": 0
              },
              "log": "Před větší prací dostalo přednost doplnění potravy."
            }
          ]
        }
      ],
      "closing": "Pomoc nepřiplula. Přesto už se nedívají jen ven ze zátoky. Začínají se dívat na věci, které mají před sebou.",
      "archive": {
        "title": "Práce na severu · svědectví Andrewa Smitha",
        "text": "První důstojník Invercauldu Andrew Smith popisuje lov, přístřeší, zbytky někdejšího osídlení a pokusy o plavbu v koženém i dřevěném člunu. Jeho dopis nedovoluje tvrdit, že severní skupina jen nečinně čekala.\n\nNěkteré její pohyby a úmrtí se ve svědectvích rozcházejí. Smith například klade smrt tesaře do září nebo října, zatímco Dalgarno tvrdí, že již koncem srpna zbývali tři. Nevolíme si snadnější datum. Grafton o těchto lidech stále neví.",
        "source": {
          "label": "Připsaná svědectví · S002/S038 · E017–E019",
          "detail": "Smithův novinový dopis byl prohlédnut; jeho samostatná kniha z roku 1866 zůstává nezískaným pramenem.",
          "url": "https://github.com/OnFiala/auckland-castaways/blob/main/research/CHRONOLOGY.md"
        }
      }
    },
    {
      "id": "c06",
      "title": "Poslední vrták",
      "date": "Únor a březen 1865",
      "location": "Výheň u Epigwaittu",
      "scene": "forge",
      "weather": "rain",
      "intro": [
        "Oheň ve výhni dává kovu jinou barvu. Železo ze zátěže vraku získává nový účel, ale oceli je málo. Nástroj, který vypadá hotově na stole, se musí teprve osvědčit ve dřevě.",
        "K větší lodi vede mnoho spojů. Bez použitelného vrtáku zůstává část plánu nedosažitelná. Musgrave 12. března zapíše tři dny neúspěšných pokusů a změnu záměru. Z toho, co se nepovedlo, začne jiná cesta."
      ],
      "objective": "Vyzkoušejte mez nástroje a přijměte nový plán člunu.",
      "source": {
        "label": "Doložený obrat · S001 · E025–E026",
        "detail": "Výheň, omezená ocel a neúspěšné vrtáky jsou doloženy; přesný rozhovor a rozhodovací pořadí jsou fikce. Musgrave, 12. 3. 1865, s. 82.",
        "url": "https://github.com/OnFiala/auckland-castaways/blob/main/research/CHRONOLOGY.md"
      },
      "steps": [
        {
          "id": "c06s1",
          "title": "První otvor",
          "narration": "Dřevo drží. Ostří, které mělo odebírat materiál, nepracuje tak, jak potřebují. Alick zastaví pohyb dřív, než únava přejde v další škodu. Raynal bere nástroj do ruky a dívá se na něj jinak než před zkouškou.",
          "speaker": "François Raynal",
          "dialogue": "Kov nám nic neslíbil. Musíme poznat, co po něm můžeme chtít.",
          "choices": [
            {
              "id": "c06s1a",
              "label": "Rozebrat příčinu neúspěchu",
              "detail": "Zkouška přinese poznání, další práce na lodi se odloží.",
              "effects": {
                "food": 0,
                "hope": -1,
                "craft": 2,
                "trust": 0
              },
              "log": "Neúspěšný vrták jsme nejprve prohlédli a porovnali s potřebou."
            },
            {
              "id": "c06s1b",
              "label": "Vystřídat lidi u výhně",
              "detail": "Zachováte síly i ochotu pokračovat, výsledek přijde pomaleji.",
              "effects": {
                "food": 0,
                "hope": 0,
                "craft": -1,
                "trust": 2
              },
              "log": "U výhně se vystřídaly ruce dřív, než došly síly."
            }
          ]
        },
        {
          "id": "c06s2",
          "title": "Cena dalšího pokusu",
          "narration": "Druhý pokus potřebuje materiál, palivo a stejnou pozornost jako první. Zásoba se však nezvětšila. Henry připomene práci, která během zkoušek čeká. Na stole leží nástroj i miska; obě věci patří do stejného plánu.",
          "speaker": "Henry Forgés",
          "dialogue": "Řekněme si předem, kdy přestaneme. Ať to za nás nerozhodne prázdný hrnec.",
          "choices": [
            {
              "id": "c06s2a",
              "label": "Vymezit poslední zkoušku",
              "detail": "Jasná hranice ochrání dohodu za cenu dalšího materiálu.",
              "effects": {
                "food": -1,
                "hope": 0,
                "craft": 1,
                "trust": 1
              },
              "log": "Další pokus dostal společně dohodnutou hranici."
            },
            {
              "id": "c06s2b",
              "label": "Přerušit výrobu a porovnat možnosti",
              "detail": "Ušetříte síly pro nový postup, další zkoušku vynecháte.",
              "effects": {
                "food": 1,
                "hope": -1,
                "craft": 0,
                "trust": 1
              },
              "log": "Výroba se zastavila, aby bylo možné porovnat jiné řešení."
            }
          ]
        },
        {
          "id": "c06s3",
          "title": "Člun už máme",
          "narration": "Na břehu leží člun, který používají od ztroskotání. Není připravený na otevřené moře. Je však skutečný: lze na něj sáhnout, změřit jeho bok a vidět, co potřebuje. Velká loď může přestat být závazkem, který musejí za každou cenu splnit.",
          "speaker": "Thomas Musgrave",
          "dialogue": "Nezahazujeme to, co jsme se naučili. Jen to potřebujeme použít jinde.",
          "choices": [
            {
              "id": "c06s3a",
              "label": "Přenést práci k člunu",
              "detail": "Získané zkušenosti využijete při konkrétních úpravách.",
              "effects": {
                "food": -1,
                "hope": 1,
                "craft": 2,
                "trust": 0
              },
              "log": "Dílna přešla od větší lodi k přestavbě dostupného člunu."
            },
            {
              "id": "c06s3b",
              "label": "Nejprve společně uzavřít starý plán",
              "detail": "Nový směr dostane souhlas a uznání dosavadní práce.",
              "effects": {
                "food": 0,
                "hope": 1,
                "craft": -1,
                "trust": 2
              },
              "log": "Změnu projektu doprovázelo uznání práce, která nepřinesla původní loď."
            }
          ]
        }
      ],
      "closing": "Vrták nevznikl. Přesto už vědí víc než před několika dny. Neúspěch přestal být opakováním a stal se rozhodnutím."
    },
    {
      "id": "c07",
      "title": "Co unese voda",
      "date": "Březen až červenec 1865",
      "location": "Břeh a zátoka",
      "scene": "boat",
      "weather": "clear",
      "intro": [
        "Člun má vyšší boky. Přibývá paluba, práce s plachtou a způsob, jak dostat vodu ven. Každá změna řeší jeden problém a může otevřít další. Na souši vypadá každá loď klidně.",
        "Zkouška na vodě ukáže nestabilitu. Musgrave ji datuje k 27. červnu; Raynalova časová osa uvádí spuštění 12. července. Hra tyto rozpory nespojuje do jediného údajně přesného dne. Ukazuje práci, která se musí vrátit od vody zpět na břeh."
      ],
      "objective": "Připravte člun postupnými úpravami a zkouškou.",
      "source": {
        "label": "Technologie a datový rozpor · E027–E029",
        "detail": "Přestavba a potíže se stabilitou jsou doložené. Model není návodem na skutečnou námořní konstrukci.",
        "url": "https://github.com/OnFiala/auckland-castaways/blob/main/research/CHRONOLOGY.md"
      },
      "steps": [
        {
          "id": "c07s1",
          "title": "Místo pro vodu",
          "narration": "S vyšším bokem přichází naděje, že člun vezme méně vody. Ale voda, která se dovnitř přece jen dostane, musí také ven. Raynal sleduje prostor pod palubou a Alick zkouší, co lze obsluhovat rukama v nepohodlné poloze.",
          "speaker": "Alick Maclaren",
          "dialogue": "U břehu si můžeme stoupnout a rozmyslet se. Venku budeme potřebovat vědět, kam sáhnout.",
          "choices": [
            {
              "id": "c07s1a",
              "label": "Prověřit odčerpávání vody",
              "detail": "Praktická zkouška ukáže další úpravy, oddálí jiné práce.",
              "effects": {
                "food": -1,
                "hope": 0,
                "craft": 2,
                "trust": 0
              },
              "log": "Čerpání vody dostalo vlastní zkoušku a opravy."
            },
            {
              "id": "c07s1b",
              "label": "Nejprve zpřístupnit pracovní místa",
              "detail": "Posádka si vyzkouší přesuny a společnou obsluhu.",
              "effects": {
                "food": 0,
                "hope": 0,
                "craft": 1,
                "trust": 1
              },
              "log": "Každý si vyzkoušel, kde bude při práci potřebovat místo."
            }
          ]
        },
        {
          "id": "c07s2",
          "title": "Nakloněná hladina",
          "narration": "Člun se na vodě chová jinak, než sliboval pohled z břehu. Pohyb jednoho člověka cítí i ostatní. Musgrave žádá návrat k úpravám. Po tolika týdnech práce zní cesta zpět těžce — ale břeh je právě tím místem, kde lze chybu ještě opravit.",
          "speaker": "Thomas Musgrave",
          "dialogue": "Tohle potřebujeme vědět tady. Ne až tam, kde za námi zmizí ostrov.",
          "choices": [
            {
              "id": "c07s2a",
              "label": "Vrátit člun k opravě",
              "detail": "Přijmete zdržení a získáte další technickou jistotu.",
              "effects": {
                "food": 0,
                "hope": -1,
                "craft": 2,
                "trust": 0
              },
              "log": "Zkouška skončila návratem na břeh a úpravami stability."
            },
            {
              "id": "c07s2b",
              "label": "Nejdřív projít zkoušku společně",
              "detail": "Každý popíše, co cítil; oprava získá společný důvod.",
              "effects": {
                "food": -1,
                "hope": 0,
                "craft": 1,
                "trust": 2
              },
              "log": "Před opravou každý popsal chování člunu na vodě."
            }
          ]
        },
        {
          "id": "c07s3",
          "title": "Když loď znovu drží",
          "narration": "Nářadí se znovu vrací na své místo. Člun už nevypadá jako na začátku a ani jeho stavitelé se na něj nedívají stejně. Přiblížili se odplutí. Teprve teď je zřejmé, že do něj nevezmou celý svůj život na ostrově.",
          "speaker": "François Raynal",
          "dialogue": "Můžeme připravit plavidlo. Ještě se musíme připravit na to, co tu necháme.",
          "choices": [
            {
              "id": "c07s3a",
              "label": "Připravit zásoby k rozdělení",
              "detail": "Praktická příprava uleví posledním dnům před odplutím.",
              "effects": {
                "food": 2,
                "hope": -1,
                "craft": 0,
                "trust": 0
              },
              "log": "Zásoby se začaly připravovat odděleně pro moře a pro dům."
            },
            {
              "id": "c07s3b",
              "label": "Přejít k dohodě o odjezdu",
              "detail": "Včas otevřete těžkou otázku, která se už nedá odkládat.",
              "effects": {
                "food": 0,
                "hope": 1,
                "craft": -1,
                "trust": 2
              },
              "log": "Pětice začala společně mluvit o rozdělení při odjezdu."
            }
          ]
        }
      ],
      "closing": "Člun znamená možnost odchodu. Stejně viditelně však ukazuje, že odchod nebude společný.",
      "archive": {
        "title": "Tři zachránění · květen 1865",
        "text": "V květnu 1865 zachránila loď Julian kapitána Dalgarna, prvního důstojníka Smitha a námořníka Roberta Holdinga. Ze všech 25 mužů Invercauldu přežili právě tito tři. Přesný květnový den není v prohlédnutých pramenech jednotný.\n\nTato záchrana předchází odjezdu trojice Graftonu i Musgraveovu srpnovému návratu. Je to důležité také pro pozdější neurčité pozorování kouře: nelze je proměnit v důkaz, že na severu ještě čekali tito zachránění muži.",
        "source": {
          "label": "Záchrana doložena, den sporný · E036–E037/E044",
          "detail": "Dopis kapitána, Smithovo líčení a Musgraveův úvod se v přesném datování rozcházejí.",
          "url": "https://github.com/OnFiala/auckland-castaways/blob/main/research/CHRONOLOGY.md"
        }
      }
    },
    {
      "id": "c08",
      "title": "Tři místa, pět jmen",
      "date": "Červenec 1865 · odplutí 19. července",
      "location": "Camp Cove a Epigwaitt",
      "scene": "boat",
      "weather": "fog",
      "intro": [
        "Musgrave, Raynal a Alick se připravují na plavbu. George a Henry zůstanou na ostrově. Tato jména nejsou výsledkem herního losování. Patří k doloženému průběhu záchrany.",
        "Člun musí nést trojici a zásoby pro moře; dům potřebuje zásobu pro dva, kteří nevědí, kolik dní budou čekat. Počasí už jeden pokus zmařilo. Teď je nutné mluvit i o části příběhu, u které odplouvající nebudou."
      ],
      "objective": "Rozdělte přípravy mezi trojici na moři a dva čekající.",
      "source": {
        "label": "Pevný historický uzel · E030–E032",
        "detail": "Odplouvají Musgrave, Raynal a Alick; George a Henry zůstávají. Přesná slova loučení ani tato rozhodovací procedura nejsou doloženy.",
        "url": "https://github.com/OnFiala/auckland-castaways/blob/main/research/CHRONOLOGY.md"
      },
      "steps": [
        {
          "id": "c08s1",
          "title": "Dvě zásoby",
          "narration": "Na jedné straně leží věci připravené do člunu. Na druhé to, co zůstane u domu. George nevidí budoucí přístav. Vidí svůj příští týden, další výpravu a Henryho naproti sobě. Jeho část plánu musí být stejně konkrétní.",
          "speaker": "George Harris",
          "dialogue": "Nechte nám plán, který můžeme dělat každý den. Ne jen den, kdy se máte vrátit.",
          "choices": [
            {
              "id": "c08s1a",
              "label": "Posílit zásobu u domu",
              "detail": "Čekající dostanou větší rezervu; plavba bude mít skromnější příděl.",
              "effects": {
                "food": -1,
                "hope": 0,
                "craft": 0,
                "trust": 2
              },
              "log": "Při rozdělení zásob dostal dům větší rezervu."
            },
            {
              "id": "c08s1b",
              "label": "Posílit zásobu pro plavbu",
              "detail": "Trojice získá rezervu, dům musí dříve obnovit výpravy.",
              "effects": {
                "food": 1,
                "hope": 1,
                "craft": 0,
                "trust": -1
              },
              "log": "Větší rezerva připadla člunu a plán domu počítal s dřívější prací."
            }
          ]
        },
        {
          "id": "c08s2",
          "title": "Práce pro dva",
          "narration": "Pět lidí se mohlo střídat více způsoby. Dvěma zůstane stejná střecha, stejné mokro a menší prostor pro dlouhou nemoc nebo vyčerpání. Henry zkouší každou zítřejší práci vyslovit nahlas, aby v plánu nezůstala schovaná za slovem nějak.",
          "speaker": "Henry Forgés",
          "dialogue": "Oheň, jídlo, opravy. Dohodněme se, co počká, až tu budeme jen dva.",
          "choices": [
            {
              "id": "c08s2a",
              "label": "Zjednodušit chod domu",
              "detail": "Menší rozsah práce chrání odpočinek a společnou dohodu.",
              "effects": {
                "food": 0,
                "hope": 0,
                "craft": -1,
                "trust": 2
              },
              "log": "Pro dva čekající vznikl jednodušší denní režim."
            },
            {
              "id": "c08s2b",
              "label": "Dokončit opravy před rozdělením",
              "detail": "Poslední společné síly odstraní část budoucí práce.",
              "effects": {
                "food": -1,
                "hope": 0,
                "craft": 2,
                "trust": 0
              },
              "log": "Před odchodem pětice dokončila drobné opravy u domu."
            }
          ]
        },
        {
          "id": "c08s3",
          "title": "Slib bez přesného dne",
          "narration": "Moře nedovolí slíbit datum. Musgrave může slíbit vlastní další čin: pokud dosáhne obydleného břehu, začne shánět návratovou loď. Alick naposledy rovná věci v člunu. Raynal nechává pohled u domu o chvíli déle, než je potřeba.",
          "speaker": "Thomas Musgrave",
          "dialogue": "Až budeme na druhé straně, naše práce neskončí.",
          "choices": [
            {
              "id": "c08s3a",
              "label": "Vyslovit závazek před všemi",
              "detail": "Slib se stane společnou pamětí celé pětice.",
              "effects": {
                "food": -1,
                "hope": 1,
                "craft": 0,
                "trust": 2
              },
              "log": "Odplutí provázel výslovný závazek vrátit se pro George a Henryho."
            },
            {
              "id": "c08s3b",
              "label": "Projít konkrétní kroky návratu",
              "detail": "Naději spojíte s tím, co bude trojice po přistání potřebovat.",
              "effects": {
                "food": 0,
                "hope": 2,
                "craft": 1,
                "trust": -1
              },
              "log": "Pětice před odjezdem prošla první kroky získání pomoci."
            }
          ]
        }
      ],
      "closing": "19. července 1865 člun opustí Camp Cove. Tři muži se dívají dopředu. Dva zůstávají za nimi. Příběh teď nese jeden závazek přes moře."
    },
    {
      "id": "c09",
      "title": "Pět nocí",
      "date": "19.–24. července 1865",
      "location": "Otevřené moře ke Stewartovu ostrovu",
      "scene": "ocean",
      "weather": "storm",
      "intro": [
        "Ostrov se zmenšuje a pak zmizí. Člun už není projekt, o kterém lze večer mluvit u krbu. Je to celý prostor, ve kterém musí tři lidé jíst, bdít, pracovat a alespoň na chvíli zavřít oči.",
        "Voda a únava mění měřítko času. Pět dní a nocí není dlouhý čas v kalendáři, ale na malém člunu se rozpadá na úkony, které musejí pokračovat. Žádný z nich neví, jak blízko je příští obydlený břeh."
      ],
      "objective": "Střídejte práci a pozornost, dokud nedosáhnete pobřeží.",
      "source": {
        "label": "Doložená plavba · E032–E033",
        "detail": "Trojice vyplula 19. a dorazila do Port Adventure 24. července. Herní volby jsou dramatizace, nikoli návod pro reálnou plavbu.",
        "url": "https://github.com/OnFiala/auckland-castaways/blob/main/research/CHRONOLOGY.md"
      },
      "steps": [
        {
          "id": "c09s1",
          "title": "Místo pro spánek",
          "narration": "Člun se houpe i tehdy, když člověk zavře oči. Někdo musí sledovat plavbu, někdo se věnovat vodě v člunu. Největší výprava jejich života má stejně malý základ jako domácnost: člověk potřebuje vystřídat dřív, než přestane vnímat.",
          "speaker": "Alick Maclaren",
          "dialogue": "Vzbuď mě dřív. Je lepší vystřídat unaveného než čekat, až přestane odpovídat.",
          "choices": [
            {
              "id": "c09s1a",
              "label": "Krátké pravidelné střídání",
              "detail": "Častější výměny udrží společnou pozornost.",
              "effects": {
                "food": 0,
                "hope": 1,
                "craft": -1,
                "trust": 2
              },
              "log": "Na moři jsme dali přednost krátkému pravidelnému střídání."
            },
            {
              "id": "c09s1b",
              "label": "Delší odpočinek po náročné službě",
              "detail": "Jeden získá více spánku, ostatní na chvíli převezmou více práce.",
              "effects": {
                "food": 0,
                "hope": 2,
                "craft": 1,
                "trust": -1
              },
              "log": "Po náročnější službě dostal člověk delší čas k zotavení."
            }
          ]
        },
        {
          "id": "c09s2",
          "title": "Stejné ruce, další voda",
          "narration": "Voda se vrací. Žádná předchozí práce ji neodstraní navždy. Raynal už své pohyby nevnímá jako řadu nových úkonů; přesto musí každý znovu vykonat. Musgrave připomíná přestávku, kterou je snadné stále posouvat.",
          "speaker": "François Raynal",
          "dialogue": "Ještě jednou. A potom si to vezmeš ty. Tentokrát opravdu.",
          "choices": [
            {
              "id": "c09s2a",
              "label": "Vyměnit práci dřív",
              "detail": "Zachováte dohodu o odpočinku i při opakujícím se úkolu.",
              "effects": {
                "food": 0,
                "hope": 0,
                "craft": -1,
                "trust": 2
              },
              "log": "Opakovaná práce s vodou dostala včasné vystřídání."
            },
            {
              "id": "c09s2b",
              "label": "Spojit krátce síly",
              "detail": "Společný zásah uleví člunu, část zásoby podpoří následné zotavení.",
              "effects": {
                "food": -1,
                "hope": 1,
                "craft": 2,
                "trust": 0
              },
              "log": "Krátká společná práce přinesla úlevu a následovala přestávka."
            }
          ]
        },
        {
          "id": "c09s3",
          "title": "Obrys země",
          "narration": "Pobřeží se nerodí jako vítězná obrazovka. Nejdřív je to tvar, kterému člověk skoro nevěří. Pak známky lidí. Dne 24. července dosáhnou Port Adventure. Trojice potřebuje pomoc a zároveň nese zprávu o dvou dalších.",
          "speaker": "Thomas Musgrave",
          "dialogue": "Jsme tady. A dva z nás jsou pořád tam.",
          "choices": [
            {
              "id": "c09s3a",
              "label": "Nejprve přijmout pomoc",
              "detail": "Zotavení umožní srozumitelně vyprávět celý příběh.",
              "effects": {
                "food": 2,
                "hope": 1,
                "craft": 0,
                "trust": 0
              },
              "log": "Po přistání trojice nejprve přijala jídlo, teplo a péči."
            },
            {
              "id": "c09s3b",
              "label": "Hned vysvětlit, kdo zůstal",
              "detail": "Naléhavost návratu zazní spolu s první žádostí o pomoc.",
              "effects": {
                "food": -1,
                "hope": 1,
                "craft": 0,
                "trust": 2
              },
              "log": "První zpráva na břehu zahrnula George a Henryho."
            }
          ]
        }
      ],
      "closing": "V Port Adventure je přijmou lidé, kteří jim nic nedlužili. Pomoc kapitána Crosse, jeho ženy a místní komunity mění možnosti celého příběhu. Moře mají za sebou. Slib ještě ne."
    },
    {
      "id": "c10",
      "title": "V cizí suché místnosti",
      "date": "Konec července a srpen 1865",
      "location": "Port Adventure a Invercargill",
      "scene": "harbour",
      "weather": "clear",
      "intro": [
        "Střecha tu existovala před jejich příchodem. Někdo jiný připravuje jídlo a ví, kde získat další. Tato samozřejmost je po měsících na ostrově téměř neuvěřitelná. Musgrave však musí udělat něco, co u Epigwaittu dělal jinak: požádat lidi, kterým nemůže přidělit práci.",
        "27. července dorazí do Invercargillu. Potřebuje prostředky a loď pro návrat. Do záchrany vstupuje Macphersonova sbírka, pohostinnost a další místní pomoc. Únik trojice nebyl poslední výkon soběstačnosti. Otevřel cestu ke spolupráci s ostatními."
      ],
      "objective": "Získejte pomoc pro návratovou výpravu.",
      "source": {
        "label": "Společná záchrana · S001 · E033/E035",
        "detail": "Musgrave líčí pomoc kapitána Crosse a jeho ženy, příjezd do Invercargillu a sbírku. Dialogy místních jsou autorské; nejde o autentické citace.",
        "url": "https://github.com/OnFiala/auckland-castaways/blob/main/research/CHRONOLOGY.md"
      },
      "steps": [
        {
          "id": "c10s1",
          "title": "Jak to říct",
          "narration": "Celý ostrov se do první věty nevejde. Posluchači potřebují vědět, kde dva lidé čekají a proč nelze věc uzavřít přijetím trojice. Musgrave má deník, zkušenost a unavený hlas. Každá z těchto věcí dokáže vysvětlit jinou část.",
          "speaker": "Thomas Musgrave",
          "dialogue": "Potřebuji, aby slyšeli jejich jména. Potom jim ukážu cestu.",
          "choices": [
            {
              "id": "c10s1a",
              "label": "Začít Georgem a Henrym",
              "detail": "Lidé nejprve pochopí, pro koho je pomoc určena.",
              "effects": {
                "food": 0,
                "hope": 1,
                "craft": 0,
                "trust": 2
              },
              "log": "Žádost o pomoc začala jmény dvou čekajících mužů."
            },
            {
              "id": "c10s1b",
              "label": "Začít cestou a potřebami výpravy",
              "detail": "Konkrétní plán usnadní domluvu o prostředcích.",
              "effects": {
                "food": 0,
                "hope": -1,
                "craft": 2,
                "trust": 1
              },
              "log": "Žádost o pomoc dostala mapu cesty a konkrétní potřeby."
            }
          ]
        },
        {
          "id": "c10s2",
          "title": "Ruce, které jste neznali",
          "narration": "Pomoc nemá jednu podobu. Někdo poskytne jídlo, někdo spojení, jiný přispěje do sbírky. Musgrave se učí, že rychlost návratu nezajistí větší hlasitostí. Musí spojit nabídky, poděkovat a říct, co ještě chybí.",
          "speaker": "Thomas Musgrave",
          "dialogue": "Každá nabídka je kus cesty zpátky. Musíme je dát dohromady.",
          "choices": [
            {
              "id": "c10s2a",
              "label": "Propojit konkrétní nabídky",
              "detail": "Praktická koordinace promění ochotu v připravenou výpravu.",
              "effects": {
                "food": 0,
                "hope": 0,
                "craft": 2,
                "trust": 1
              },
              "log": "Místní nabídky pomoci se spojily do konkrétního plánu."
            },
            {
              "id": "c10s2b",
              "label": "Věnovat čas lidem, kteří pomáhají",
              "detail": "Získáte pevnější společné odhodlání a prostor pro další pomoc.",
              "effects": {
                "food": 0,
                "hope": 1,
                "craft": -1,
                "trust": 2
              },
              "log": "Musgrave vysvětlil příběh lidem, kteří se podíleli na návratu."
            }
          ]
        },
        {
          "id": "c10s3",
          "title": "Loď pro cestu zpět",
          "narration": "Flying Scud znamená jiný prostor než jejich malý člun. Návrat ale stále potřebuje počasí, posádku a zásoby. Musgrave se nebude vracet pro prázdný dům nebo vlastní věci. Vrací se pro lidi, jejichž poslední týdny neviděl.",
          "speaker": "Thomas Musgrave",
          "dialogue": "Až přistaneme, nejdřív je musíme vyslechnout. Ne vyprávět všechno, co jsme dokázali my.",
          "choices": [
            {
              "id": "c10s3a",
              "label": "Připravit péči pro čekající",
              "detail": "Návratový plán zahrne jídlo a zotavení obou mužů.",
              "effects": {
                "food": 2,
                "hope": 0,
                "craft": -1,
                "trust": 1
              },
              "log": "Výprava připravila také potřeby George a Henryho po setkání."
            },
            {
              "id": "c10s3b",
              "label": "Prověřit průběh vyzvednutí",
              "detail": "Každý na lodi zná svůj úkol při návratu k břehu.",
              "effects": {
                "food": 0,
                "hope": 1,
                "craft": 2,
                "trust": 0
              },
              "log": "Před vyplutím byly rozděleny úkoly pro vyzvednutí čekajících."
            }
          ]
        }
      ],
      "closing": "Návrat umožní i lidé, kteří nikdy nestáli v Epigwaittu. Slib přestává být věcí jednoho muže a dostává skutečnou loď."
    },
    {
      "id": "c11",
      "title": "Vrátit se do stejného deště",
      "date": "Srpen 1865 · před vyzvednutím",
      "location": "Flying Scud u Aucklandova ostrova",
      "scene": "return",
      "weather": "rain",
      "intro": [
        "Obrys ostrova je známý, ale tentokrát na něj Musgrave hledí z jiné paluby. V hlavě má poslední společný den, hlas George a Henryho a všechny dny mezi tím, o kterých neví. Konec čekání se zatím dá poznat pouze z jedné strany.",
        "23. srpna si poznamená neurčitý jev, který pokládá nebo mohl pokládat za kouř. Hra z něj nevytváří zprávu ani stopu druhé posádky. Jistější je úkol před nimi: dostat se k místu, kde nechali dva své lidi."
      ],
      "objective": "Doveďte návratovou výpravu k čekajícím mužům.",
      "source": {
        "label": "Návrat a nejisté pozorování · E038–E041",
        "detail": "Musgraveův srpnový kouř nemá prokázaného původce. Známí přeživší Invercauldu byli zachráněni již v květnu.",
        "url": "https://github.com/OnFiala/auckland-castaways/blob/main/research/CONFLICTS.md"
      },
      "steps": [
        {
          "id": "c11s1",
          "title": "Známý obrys",
          "narration": "Přiblížení k ostrovu neodstraní počasí ani vzdálenost mezi lodí a břehem. Musgrave znovu poznává tvary, které v odplouvajícím člunu ztratil. Tentokrát potřebuje, aby znalost místa přešla i k lidem návratové výpravy.",
          "speaker": "Thomas Musgrave",
          "dialogue": "Tohle znám. Vysvětlím vám to po částech, ať nespěcháme na špatném místě.",
          "choices": [
            {
              "id": "c11s1a",
              "label": "Popsat přístup k břehu",
              "detail": "Místní zkušenost pomůže připravit společný postup.",
              "effects": {
                "food": 0,
                "hope": 0,
                "craft": 2,
                "trust": 1
              },
              "log": "Musgrave předal návratové výpravě svou zkušenost s pobřežím."
            },
            {
              "id": "c11s1b",
              "label": "Nejdřív sladit úkoly posádky",
              "detail": "Společné porozumění dostane přednost před dalšími přípravami.",
              "effects": {
                "food": 0,
                "hope": 1,
                "craft": -1,
                "trust": 2
              },
              "log": "Před přiblížením si posádka znovu rozdělila úkoly."
            }
          ]
        },
        {
          "id": "c11s2",
          "title": "Něco nad pobřežím",
          "narration": "V dálce je světlý pruh. Pozorování je krátké a není jisté, co znamená. Musgrave jej může zapsat, ale nemůže z něj vyčíst jména ani úmysl neviděného člověka. Jeho závazek vůči Georgeovi a Henrymu zůstává konkrétní.",
          "speaker": "Thomas Musgrave",
          "dialogue": "Zapíšu, co jsem viděl. Ne to, co bych si přál, aby to znamenalo.",
          "choices": [
            {
              "id": "c11s2a",
              "label": "Zapsat pozorování s nejistotou",
              "detail": "Uchováte stopu bez smyšleného vysvětlení a pokračujete k vyzvednutí.",
              "effects": {
                "food": 0,
                "hope": 0,
                "craft": 1,
                "trust": 1
              },
              "log": "Neurčitý jev zůstal v zápisu nejistým pozorováním."
            },
            {
              "id": "c11s2b",
              "label": "Oddělit pozorování od úkolu",
              "detail": "Připomenete posádce známé místo čekajících; otázka původu zůstane otevřená.",
              "effects": {
                "food": 0,
                "hope": 1,
                "craft": 0,
                "trust": 1
              },
              "log": "Výprava oddělila nejasné pozorování od doloženého cíle návratu."
            }
          ]
        },
        {
          "id": "c11s3",
          "title": "Dva hlasy z domu",
          "narration": "Změna perspektivy je autorská: na chvíli zůstáváme s Georgem a Henrym, jejichž vlastní deníky zde nemáme. Čekání nebylo klidným mezidobím. Podle Musgraveova pozdějšího zápisu trpěli nedostatkem a uvažovali i o oddělení. Teď jsou stále oba na ostrově.",
          "speaker": "Henry Forgés",
          "dialogue": "Dnes ještě uděláme to, co víme. Oheň. Jídlo. A pak se půjdeme podívat.",
          "choices": [
            {
              "id": "c11s3a",
              "label": "Dokončit společnou denní práci",
              "detail": "Poslední čekání naplní známý rytmus domácnosti.",
              "effects": {
                "food": 1,
                "hope": -1,
                "craft": 0,
                "trust": 2
              },
              "log": "George a Henry v herní scéně udrželi poslední den společný rytmus."
            },
            {
              "id": "c11s3b",
              "label": "Vystřídat se při vyhlížení",
              "detail": "Naděje dostane prostor, aniž by jeden musel čekat sám.",
              "effects": {
                "food": -1,
                "hope": 2,
                "craft": 0,
                "trust": 1
              },
              "log": "V autorské scéně se čekající vystřídali při vyhlížení návratu."
            }
          ]
        }
      ],
      "closing": "Loď je zpátky u ostrova. Slib už může být vidět z břehu. Dokončený bude teprve tehdy, až oba čekající bezpečně odjedou."
    },
    {
      "id": "c12",
      "title": "Dokud se nevrátíme",
      "date": "24. srpna 1865 · závěr",
      "location": "Epigwaitt a návratová loď",
      "scene": "return",
      "weather": "clear",
      "intro": [
        "Musgrave vyzvedává George Harrise a Henryho. Číslo, které se v červenci rozdělilo na tři a dva, je znovu pět: všech pět lidí Graftonu přežilo. Neznamená to, že všichni stojí v této chvíli na jedné palubě; znamená to, že nikdo z původní pětice nezůstal bez záchrany.",
        "Dům zůstane na ostrově. Nářadí, opravy a dlouhé čekání se stanou vyprávěním. Některé vzpomínky budou v deníku a pamětech znít odlišně. Ještě před tím je třeba nechat promluvit ty, kteří poslední část příběhu prožili sami."
      ],
      "objective": "Dokončete záchranu George a Henryho a uzavřete společný příběh.",
      "source": {
        "label": "Závěr doložen · S001 · E039–E040/E048",
        "detail": "George a Henry byli vyzvednuti 24. srpna 1865. Všech pět Graftonu přežilo. Sjednocení celé pětice do společného okamžiku na jedné palubě by nebylo doloženým obrazem.",
        "url": "https://github.com/OnFiala/auckland-castaways/blob/main/research/CHRONOLOGY.md"
      },
      "steps": [
        {
          "id": "c12s1",
          "title": "Nejdřív jejich vyprávění",
          "narration": "Musgrave má za sebou plavbu, přijetí na druhém břehu a shánění pomoci. George s Henrym mají za sebou dům, který náhle potřeboval jen dvě sady rukou. Jejich zkušenost nelze doplnit z pohledu odplouvajících. Potřebuje vlastní místo.",
          "speaker": "Thomas Musgrave",
          "dialogue": "Vyprávějte mi to od chvíle, kdy jste nás přestali vidět.",
          "choices": [
            {
              "id": "c12s1a",
              "label": "Vyslechnout poslední týdny",
              "detail": "Čekající dostanou čas pojmenovat, co prožili.",
              "effects": {
                "food": 0,
                "hope": 1,
                "craft": 0,
                "trust": 2
              },
              "log": "Návrat začal vyslechnutím George a Henryho."
            },
            {
              "id": "c12s1b",
              "label": "Nejdřív připravit jídlo a odjezd",
              "detail": "Péče vytvoří prostor pro vyprávění až budou oba v bezpečí.",
              "effects": {
                "food": 2,
                "hope": 0,
                "craft": 0,
                "trust": 1
              },
              "log": "Nejprve přišlo jídlo a příprava odjezdu, vyprávění dostalo další čas."
            }
          ]
        },
        {
          "id": "c12s2",
          "title": "Co si vzít z domu",
          "narration": "Do odjezdu se nevejde každý předmět. Některé věci mají cenu prací, kterou stály, jiné tím, co připomenou. Dům patřil jejich dnům, ale nemusí jim patřit navždy. Přípravy se mohou uzavřít i bez toho, aby byl každý kout prázdný.",
          "speaker": "George Harris",
          "dialogue": "Nechci tady nechat to, co jsme si slíbili. Věci už nejsou tak těžké.",
          "choices": [
            {
              "id": "c12s2a",
              "label": "Odnést pracovní památku",
              "detail": "Předmět uchová část společné dovednosti a dlouhé práce.",
              "effects": {
                "food": 0,
                "hope": 1,
                "craft": 2,
                "trust": 0
              },
              "log": "Z Epigwaittu odchází i připomínka společné práce."
            },
            {
              "id": "c12s2b",
              "label": "Dát čas rozloučení",
              "detail": "Přednost dostane uzavření místa a vlastní zkušenosti.",
              "effects": {
                "food": 0,
                "hope": 2,
                "craft": 0,
                "trust": 1
              },
              "log": "Poslední chvíle u domu patřila rozloučení s místem čekání."
            }
          ]
        },
        {
          "id": "c12s3",
          "title": "Pět jmen v závěru",
          "narration": "Tento příběh nekončí zásobou ani hotovou lodí. Končí splněným návratem. Musgrave, Raynal, Alick, George a Henry přežili. Jejich záchrana zahrnuje práci doma, na moři i pomoc lidí, kteří je přijali. Zbývá rozhodnout, čím uzavřete svůj vlastní zápis.",
          "speaker": "Thomas Musgrave",
          "dialogue": "Nemohu zapsat všechno, co každý z nás nesl. Mohu napsat, že jsme pro ně přijeli.",
          "choices": [
            {
              "id": "c12s3a",
              "label": "Uzavřít zápis společnou prací",
              "detail": "Závěr připomene, jak se lidé učili udržet jeden druhého.",
              "effects": {
                "food": 0,
                "hope": 0,
                "craft": 1,
                "trust": 2
              },
              "log": "Závěrečný zápis připomíná společnou práci všech pěti."
            },
            {
              "id": "c12s3b",
              "label": "Uzavřít zápis splněným slibem",
              "detail": "Závěr zdůrazní návrat a pomoc, která jej umožnila.",
              "effects": {
                "food": 0,
                "hope": 2,
                "craft": 0,
                "trust": 1
              },
              "log": "Závěrečný zápis připomíná splněný návrat a přijatou pomoc."
            }
          ]
        }
      ],
      "closing": "George a Henry odjíždějí z ostrova. Záchrana všech pěti je dokončena. Invercauld měl jiný příběh: z jeho 25 mužů přežili tři, zachránění už v květnu. Obě skupiny o sobě během pobytu nevěděly. Pozdější pátrání a nejasný kouř zůstávají samostatnými pramennými otázkami, nikoli tajným setkáním. Dokud se nevrátíme: slib je splněn."
    }
  ]
};});
