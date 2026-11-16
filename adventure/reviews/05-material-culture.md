# 05 — Materiálová kultura a výtvarná věrohodnost

Revize 16. listopadu 2026. Posouzeny `camp.png`, `wreck.png`, oba atlasy předmětů, `style.css`, `index.html`, výtvarná dokumentace a místní historické podklady. Jde o revizi assetů a kódu, nikoli kontrolu vykresleného rozhraní v prohlížeči. Bez implementačních změn.

## Tři priority

1. Držet horní i spodní lištu v teplém ořechovém tónu, matném železe a plátně. Ořech je **název barevného směru**, nikoli doložená dřevina lodi. Aktuální závěrečné CSS tento směr již převážně plní; zelený `theme-color="#262b29"` v HTML ještě sjednotit.
2. Ukázat záchranu a opakované využití konkrétního materiálu: různá prkna, staré otvory po spojích, švy, záplaty a omezené kovové části. Vynechat souměrnou sadu luxusního nábytku či mosazný steampunk. S001, pp.79–82; [materiální podklad](../../research/MATERIAL_CULTURE.md).
3. První noc musí zůstat provizoriem. Současný kůlový přístřešek je herní scénografie; není přesným Epigwaittem. Hotový dům, domácí kožené boty a kovárna patří do odlišných pozdějších fází. S001, pp.11, 73, 80–81.

## Materiálová pravidla pro další malby

| Prvek | Doporučeno | Vynechat / hranice důkazu |
|---|---|---|
| Dřevo | Rozlišit mokré tmavé plochy, světlejší čerstvý lom, staré otvory a druhotně použité díly. Vrak poskytuje materiál s minulostí. | Jednotná oranžová kresba dřeva; lesklý lak na každém předmětu; konkrétní dřevina bez podkladu. Staré bolt-holes výslovně zmiňuje S001 p.80. |
| Železo a ocel | Matná šedočerná hmota, lokální rez, drobný světlejší otěr na pracovní hraně. U budoucí výhně improvizovaná kovadlina ze železné zátěže. | Chromový lesk, ozubená kola jako výzdoba, dokonalá tovární kovárna. S001 p.80 popisuje blok zátěže i přetváření starého pilníku; přesné tvary atlasu nejsou doložené. |
| Plátno | Režné až šedobéžové plochy, čitelné švy, napětí u vazeb, vlhký spodní okraj. Jeden předmět v inventáři i scéně musí mít stejnou malbu. | Sněhobílá syntetická plachta či uniformní dekorativní trhání. S001 p.73 uvádí staré plátno a pytlovinu jako záplaty i vytažená vlákna jako nit. |
| Lana | Splétaná vlákna, různá míra opotřebení, viditelná cesta lana přes uchycení. | Nylonový vzhled, pružné gumové chování, ozdobný uzel vydávaný za ověřený námořní postup. Přesný uzel a vlákno zde nejsou doloženy. |
| Kůže a obuv | Matný, ohýbaný povrch a ruční opravy; v pozdější fázi odlišit provizorium od výsledku činění. | Automaticky převést veškeré oblečení na kožešiny či všem dát stejné nové boty od první noci. S001 p.81 uvádí asi čtyři měsíce činění; S003 §XIV rozvíjí výrobu obuvi. |
| Oheň | Malé teplé jádro, tmavé dřevo a lokální odraz na blízkých rukou či plátně; vzdálená voda zůstává chladná. | Celoplošný oranžový filtr, magická záře nebo okamžité vysušení tábora. Světlo je výtvarná inference, nikoli doložené fotografické měření. |
| Kámen | Nepravidelný povrch a váha; u pozdějšího domu odlišit krb/komín od venkovního ohniště. | Vydávat malovaný kruh ohniště za archeologicky doložený půdorys. S001 p.11 uvádí kamenný komín 8 × 5 stop, ne tento kruh. |

## Horní a spodní rozhraní

- **Horní pás:** úzká tmavá dřevěná plocha; světlé plátěné či ryté značky. Žádné masivní šrouby v každém rohu, lesklé mosazné ciferníky ani několik vrstev ornamentu. Rozhraní je současná herní metafora.
- **Spodní pás:** tmavší mělká zásuvka pro předměty, stejné malby jako ve světě, jemné oddělení slotů. Výběr vyjádřit teplým světlým lemem a polohou, ne zelenou září či přebarvením předmětu.
- **Paleta jako návrh:** ořech `#3D2D24`, hluboký stín `#211B18`, plátno `#E5D6B5`, železo `#414344`, moře/břidlice `#46545A`, střídmý teplý akcent `#D6B27B`. Nejde o odebrané historické pigmenty; kontrast ověřit v konečném zobrazení.
- **Text:** ponechat krátký název kapitoly a kontext akce. Historické odůvodnění přesunout do volitelného deníku/poznámek; nepřekrývat krajinu vysvětlovacími kartami. Ikony mohou být moderní, mají však sdílet střídmý kreslený jazyk.
- **Zeleň:** přírodní zeleň v malbě je v pořádku; zákaz zeleného UI není důvod přemalovat skutečnou vegetaci. Nepřidávat zelené barevné filtry na scénu.

## Konkrétní pozorování stávajících obrazů

- `wreck.png`: popraskané dřevo, lana a lokální barevné nátěry fungují. Modrozelený nátěr trupu není zelené UI. Vrak však působí silně zvětralý; při označení „první noc“ zvážit více čerstvých lomů a méně dojmu dlouhodobě opuštěné památky. Tvar trupu, barvy nátěru a přesné umístění bedny zůstávají fikcí.
- `camp.png`: otevřená konstrukce dobře ukazuje nedokončenost. Neoznačovat ji hotovým domem Epigwaitt. Čistá plocha a připravené ohniště jsou herní usnadnění čitelnosti, nikoli geodetická nebo archeologická rekonstrukce.
- `tools.png`: matná sekera a páčidlo drží materiálový směr. Silně zdobenou či lesklou mosaz nepřidávat. Krabičku na rozdělávání ohně lze ponechat jako herní rekvizitu; pro tvrzení, že právě taková patřila posádce, chybí doklad.
- `materials.png`: rozdíl plátno/dřevo/kámen je srozumitelný. Drobné střapaté hrany nesmějí při zmenšení ztratit siluetu. Nové štěpiny jsou barevně vhodně odlišné od staršího polena.

## Důkaz a meze

Přímo při této revizi byly přečteny místní OCR pasáže S001 k domu (p.11), záplatám (p.73), výhni a kovadlině (p.80) a obuvi (p.81). OCR není kontrola každého čísla proti faksimile. S003 §XIV je zde převzat jako lokátor z již existující místní rešerše, nikoli nově kolacionovaný originál. Viz [registr S001/S003/S004/S006](../../sources/REGISTER.md) a [materiální kultura](../../research/MATERIAL_CULTURE.md).

Pro produkční rekonstrukci by bylo nutné samostatně porovnat měřítko vraku, půdorys fází domu a tvary nástrojů s dobovými obrazy a S006. Tato revize nepotvrzuje soulad s archeologickým plánem. S020 je krabička z roku 1905, nikoli rekvizita vyrobená trosečníky; muzejní fotografie a moderní kresby nemají automatické právo převzetí. Výtvarná přesvědčivost je možná i při jasně přiznané fikci.
