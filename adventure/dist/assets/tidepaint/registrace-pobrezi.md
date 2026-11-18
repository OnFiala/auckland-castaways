# Pláž, vrak a loděnice

Šest herních obrazů má rozměry 1672 × 941 px. Počátek je vlevo nahoře. Souřadnice v tabulce jsou procenta z celé šířky a výšky malby. Souřadnice výřezů níže jsou pixely původního obrazu.

| Místo | Co hledat v malbě | Kam hráč dojde |
|---|---|---|
| Pláž | Vlevo je mezi srázy drobná silueta Graftonu. Směrem doprava přechází mokrý písek v pěšinu stoupající za skálu. Na nízké větvi visí plátno se středem v (70,1 %, 37,6 %). | Na písku pod větví jsou chodidla při práci v (64,8 %, 71,6 %). Raynal sedí na kusu naplaveného dřeva v (77,8 %, 72,1 %) a dívá se doleva. Zůstane tam i po sejmutí plátna. |
| Lednový vrak | Vysunutá příď zakrývá část levého zálivu. Hráč přichází zprava přímo k boku bedny na nízké skalní lavici. Petlice leží v (71,2 %, 56,5 %). | Ze stanoviště (63,3 %, 75,72 %) se pravá ruka dostane k petlici. Bedna se otevírá vzhůru od zadní hrany. Z podstavce i po otevření vede stejná cesta. |
| Zimní vrak | Shodný úhel pohledu zachovává příď, palubní nástavbu, lavici a šikmou fošnu. Odstrojování odhalilo široký pás žeber. | Henry začíná u odkrytého boku v (60,6 %, 78,2 %). Hráč vstupuje po cestě zprava a na fošnu si sáhne zespodu. |
| Loděnice | Přední bok tvoří dva stavební stavy. V prvním je skrz mezeru pod otěrovou lištou vidět přepážky mezi žebry. Vsazená obšívka je zakryje. Objímka stěžně leží v (66 %, 51,3 %). | Prsty jsou při práci s obšívkou v (53,5 %, 55 %), při tmelení v (73,2 %, 59 %). Cesta vede před dvěma nízkými stavebními kozami. Vlevo mezi stolem a odloženými prkny sestupuje pěšina k pobřeží. |

Pro výřez zavřené bedny použijte `x=1088, y=462, šířka=268, výška=166`. Otevřenou bednu včetně horního kování pojme `1088, 311, 268, 317`. Spodní hrana a levá souřadnice obou výřezů se shodují. V pracovním detailu 3:2 kříží jazyk petlice spáru v (37,2 %, 60,5 %). Hrot páčidla zapadne do vyštípnutého zářezu dál vpravo v (73,4 %, 59,4 %). Po zvednutí víka je ve stejném místě vidět pevná skoba, uvnitř leží sekera a křesadlo. [Zavřená truhla](../workplates/chest.webp) · [Otevřená truhla](../workplates/details/chest-open.webp)

Průhledný díl obšívky položte přes základní loděnici v `750, 455, 355, 130`. Plně kryje 12 493 pixelů v původním rozlišení. Na těchto pixelech složený výsledek přesně obnoví barvy celistvého nativního obrazu. Hotová oplachtěná malba už obsahuje celý bok. Popis generování, barevné masky a kontrolní součty jsou u skutečných herních souborů. [Pobřeží](coastal.json) · [Loděnice](voyage.json) · [Vsazená část obšívky](details/fitted-strake.webp)

Z adresáře `adventure` spusťte `node --test tests/staging.test.cjs tests/tide-states.test.cjs`. První sada měří dosah prstů nového atlasu na petlici, trám i stěžeň a prochází trasy kolem překážek. Druhá načte všech 22 herních stavů, porovná dodané soubory s jejich rozměry a kontrolními součty. Statické kontrolní složeniny v šířce 1280 a 384 px pomohly odhalit kolizi vstupu se stanovištěm Henryho na zimním vraku. Po přemístění zůstávají obě siluety rozeznatelné již při vstupu.
