# Krátké rozhovory první noci

Anglické repliky v [dist/stories.js](dist/stories.js) jsou **nová autorská fikce**, nikoli citace, překlad dochovaného rozhovoru nebo rekonstrukce přesného večera. Slouží jako krátké osobní zastavení uvnitř vizuální adventury. Hádanky nadále řeší hráč prostřednictvím předmětů a prostředí; rozhovor nemění inventář, příznaky, uloženou pozici ani pravidla.

Každá postava má čtyři sady po třech krátkých větách. Celý rozhovor má nejvýše 60 slov; rozhraní má zobrazovat jednu, nejvýše dvě repliky v jednom kroku. Nejde o větvené dialogové volby. Současný stav určuje příslušnou sadu: příchod, hotový přístřešek, zapálený oheň, vztyčený signál. Stav signálu má přednost před ohněm a přístřeškem, protože hráč může některé úkoly provést v jiném pořadí.

## Postavy a meze doložení

| ID | Základ v místních podkladech | Autorské doplnění |
|---|---|---|
| `player` | Výtvarná hráčská postava představuje hráčův pohled uvnitř pětice. | Vnitřní hlas „You“, opakované počítání lidí a pocit úlevy jsou fikce. Nepřidává šestého trosečníka ani mu nepřisuzuje další životopis. |
| `raynal` | Raynalovy paměti zmiňují nemoc při ztroskotání a zkušenosti z dolů; viz S003/S004 a [CREW.md](../research/CREW.md). | Aktuální tělesné pocity, drobný humor, preference střechy a slovní podoba všech vzpomínek. Nemoc není diagnóza a technická zručnost neznamená autorství všech nápadů. |
| `musgrave` | Kapitán, autor deníku, navigátor; v deníku se objevují i potíže s autoritou. S001, zejména pp. 11–12; [CREW.md](../research/CREW.md). | Pochybnosti, způsob, jakým prožívá odpovědnost, a příslib naslouchání. Jde o dramatickou možnost, ne doložený psychologický profil. Rodinné vzpomínky nejsou přidány. |
| `henry` | Člen pětice, péče o jídlo a společný život; práci si ovšem muži také střídali. S001 pp. 12, 95; S004 pp. 40–43. | Pohostinné drobnosti a humor o místě u ohně. Neobsahují nedoložené vzpomínky na rodinu nebo dětství ani etnický akcent. |
| `george` | Člen pětice, práce a výpravy; jeho vlastní deník zde není k dispozici. S001, S004; [CREW.md](../research/CREW.md). | Všechny osobní pocity, zdánlivé zavolání z vraku a pozorování vlajky. Žádná replika není autobiografické svědectví skutečného George Harrise. |

Číselné odkazy S001, S003 a S004 odkazují na [registr pramenů](../sources/REGISTER.md). Charakterové směry vycházejí z [příběhové bible](../story/NARRATIVE_BIBLE.md), která rovněž rozlišuje doložené činnosti od vytvořených hlasů. Přesný průběh první noci, komprese stavby přístřešku a předmětové hádanky jsou fikce; tento soubor k nim nepřidává historické potvrzení. Rozhovory nezmiňují Invercauld, kouř druhé skupiny ani setkání obou posádek.

## Zapojení

Modul funguje jako `window.CastawayStories` v prohlížeči a jako `module.exports` v Node. `lines(id, state)` vrací `{ speaker, lines, portrait }`; pole replik je nová kopie, takže rozhraní nemění zdrojová data. `ambient(id, state)` vrací první krátkou repliku. Podporovaná ID jsou `player`, `raynal`, `musgrave`, `henry`, `george`; neznámé ID použije hráčův hlas. Obrazové cesty jsou relativní k `dist/index.html` a využívají již existující fiktivní malby, nikoli ověřené portréty.

Anglická lokalizace [dist/engine.js](dist/engine.js) zachovává verzi uložených stavů 3, všechna ID, příznaky, podmínky a výsledky akcí. Mění názvy, popisy, reakce a nápovědy. Historická jména včetně diakritiky zůstávají zachována. Starší uložený záznam akcí může obsahovat český text, protože se historie při načtení nepřepisuje; nové reakce jsou anglické.

Aktuální rozhraní starý deník akcí nevykresluje; zachované české věty jsou pouze v historických uložených datech. Všechny nové zobrazené reakce a repliky jsou anglické.
