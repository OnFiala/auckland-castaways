# Until We Return, vydání 15

Celá anglická adventura se hraje myší nebo dotykem. Při práci s brašnou lze přecházet mezi předměty také klávesami Tab a Enter. Stažený archiv celý rozbalte a otevřete kořenový `index.html`. V již otevřené hostované hře stačí obnovit původní stránku. V nastavení se objeví **Game release 15**. [Stáhnout hru](https://github.com/OnFiala/auckland-castaways/releases/tag/game-v15) · [Anglický návod](../../PLAY.txt)

## Záchrana v různém pořadí

Musgrave může nejprve zajít do domu za Henrym a Georgem a až potom vyložit zásoby. Na cestě zpět odpovídá jeho replika tomu, koho už viděl a co zbývá udělat. Šicí potřeby propojují Alickovo červencové loučení s Musgraveovou srpnovou návštěvou. V archivním epilogu hra jmenuje noviny, z nichž vydavatelé převzali domněnku o kouři. [Historické prameny a dramatizace](../../HISTORICAL_ADAPTATION.md)

Pokud jsou oba muži v bezpečí a ještě chybí zásoby, kliknutí na uvázaný člun vyvolá Musgraveovu poznámku o nákladu. Až hráč dokončí práci, kapitán může v rozhovoru s Georgem pozvat oba muže na palubu. Hráč je může také přímo nalodit. Po záchraně se repliky mění na vzpomínku. [Anglické dialogy](../../dist/voyage-stories.js) · [Ověření pořadí setkání a příprav](../../tests/story.test.cjs)

Při druhém průchodu hráč rozsvítil lucernu, našel oba muže a vrátil se ke člunu. Kapitán po kliknutí řekl „I’ll take the provisions up to the house. Those two have carried enough.“ Jakmile byly zásoby v domě, George kapitánovi řekl, že drží Henryho za paži. Musgrave oba pozval k večeři. Jde o autorské herní dialogy. [Snímek před vyložením zásob](zasoby.webp) · [Snímek před naloděním](nalodeni.webp)

## Obrazy a ovládání

Na první pláži se Alick vydá ke skutečně namalovanému lanu. Na moři přijde k záplatě z té strany, kterou má volnou, zatímco Musgrave pracuje u vody. Déšť a pohyb hladiny respektují okraj paluby. Po rozštípání polena zmizí i jeho aktivní místo. Vydání 15 navazuje na obrazovou revizi všech sedmi kapitol. [Snímky kapitol](../release-14/prubeh.webp) · [Paluba před opravou a po ní](../release-14/preplavba.webp) · [Měření překryvů vody](../release-14/voda/README.md)

Po sebrání lana nebo tyče klávesou Enter se rámeček pro další volbu přesune na nový předmět v brašně. Po spojení obou zůstane na hotové tyči se smyčkou. Další Tab pokračuje k následujícímu ovladači. [Snímek při spojení předmětů](klavesnice.webp) · [Zkouška klávesnicí](../../tests/browser/keyboard_route.py)

## Ověření sestavení

V rozbaleném ZIPu prošlo Chromium od první pláže k závěrečnému nalodění a archivu přes sedm kapitol a osm pracovních detailů. Čistý profil zvlášť vyzkoušel první pláž a kladku u vraku myší i emulovaným dotykem. Klávesnicová zkouška prošla sběrem, kombinací i obnovením ze stejné uložené pozice. Při záměrném výpadku malby mohl hráč zůstat na pláži a znovu otevřít vrak, jakmile byl soubor dostupný. [Průchod, dotyk a klávesnice](https://github.com/OnFiala/auckland-castaways/actions/runs/44374680869/job/135050532709)

Druhý úplný průchod proběhl se zapnutými animacemi. V prvních pěti kapitolách chodil Alick, v posledních dvou Musgrave. Prohlížeč v každé kapitole zachytil šest odlišných fází kroku. Oba průchody používaly rozbalené vydání. K původní přihlášené kartě soukromého webu nemělo testovací prostředí přístup. [Průchod s animacemi](https://github.com/OnFiala/auckland-castaways/actions/runs/44374680869/job/135051556826) · [Devět záběrů z vydání 15](https://github.com/OnFiala/auckland-castaways/releases/download/game-v15/review-game.webp)

Prošlo 192 místních testů aktuální hry a samostatná kontrola její první noci. V balíku pro hosting jsme ověřili shodu obsahu na 287 starších cestách. ZIP obsahuje 147 souborů včetně návodu a manifestu. Má 31 366 253 bajtů a SHA-256 `b71c048616114cb3a4582b6894d0917daa9ab133617aa487df5a3afa7ee2e07c`. [Testovaný zdroj](https://github.com/OnFiala/auckland-castaways/commit/096da1556e70d9302bc2988161d79e8b2371304d)
