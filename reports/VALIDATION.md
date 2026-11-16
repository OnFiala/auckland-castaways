# Výsledek ověření

Datum: 2026-11-15T15:17:18.666514+00:00.

Offline integrita: **PASS**. [Strojový výsledek](validation.json). Kontrolováno 53 zdrojových ID, 55 evidenčních položek, 30 řádků posádek (5 + 25), 34 tvrzení, 8 návrhových událostí a SHA-256 u 8 získaných/odvozených souborů. Místní odkazy existují, vztahy mezi ID jsou platné. Kontrola vzorů přihlašovacích údajů v publikovaných textových souborech nic nezachytila; není to záruka úplného bezpečnostního auditu.

## Síťové odkazy

Samostatně otestováno 53 hlavních URL z registru: **49 odpovědí HTTP200, 3 odpovědi HTTP403, 1 odpověď HTTP503**. [Datovaný report](link-check.json) obsahuje přesné cíle a přesměrování. Knihovní prohlížeč S050 vrací bot challenge i při HTTP200. Papers Past, LINZ a některé katalogy mohou vrátit dynamický rámec. Čtenářský status proto nebyl automaticky zvýšen.

- S026 (Wiley DOI): HTTP403; dříve ověřena pouze metadata.
- S035 (Aberdeen museum): HTTP503; nedostupný detail.
- S037 a S041 (Gallica): HTTP403; nezískané skeny.
- S049: katalog dostupný, samostatný nabídnutý PDF download blokován403.
- S050: NLA Access Denied / bot challenge; kniha nečtena.

Žádné tvrzení, že všechny odkazy poskytly čitelný plný obsah. Výše uvedené HTTP počty jsou transportní výsledek pro hlavní URL; jiné neúspěšné akviziční adresy jsou v manifestu. Moderní úplné texty nejsou ve veřejném balíku.

## Věcná kontrola napříč dokumenty

Základní data a počty jsou konzistentní: Grafton 3.1.1864, pět přeživších, odjezd trojice19.7.1865, Port Adventure24.7., vyzvednutí dvou24.8.; Invercauld10.5.1864,25→19→3, záchrana v květnu1865 s přiznaným sporem o den. Chronologický problém kouře zůstává otevřený. Neexistuje přidané setkání skupin ani smyšlená přesná táborová vzdálenost. Názvy období odpovídají jižní polokouli.

Vizuálně ověřena Musgraveova dobová mapa (digitální p.16), Raynalův frontispis (p.13), titul (p.16), Google notice (p.1) a několik textových/obsahových stran. Celé skeny nejsou kompletně korigované. Samostatné výřezy zachovávají původní obraz stránek a připojenou provenienci. Surové OCR zachovává i původní mezery a konce řádků; Git je podle `.gitattributes` nenormalizuje. Vlastní CSV používají LF.

Nové příběhové scény a číselný model jsou označené jako fikce. ZDF dokument2022 opravuje původní domněnku o absenci obrazového zpracování; současný stav filmové opce a přímá vydaná hra zůstávají neuzavřeným hledáním.

## Meze výsledku

Historická správnost nebyla nahrazena testem: datové kontroly neumějí vyřešit sporná svědectví. Původní Holdingův rukopis, Smithova samostatná kniha1866, úplná francouzská knižní kolace, muster roll, přesné body táborů a produkční oprávnění ke konkrétním moderním obrázkům zůstávají v backlogu. Herní smyčka nebyla k datu původního reportu implementována; následující aktualizace zachycuje první prototyp.

## Prototyp · aktualizace 16. listopadu 2026

Přidána česká hratelná studie [Poslední vrták](../prototype/README.md). Herní model prošel **12 testy**, které zahrnují úspěšné i neúspěšné dohrání, předpověď výsledku, počasí, únavu, dohody, obnovu stavu a 50 dalších smíšených průchodů. Byla znovu ověřena integrita výzkumných dat, místní odkazy a hashe originálů. Ověřeny také místní assety HTML a shoda sedmi souborů prototypu se zdrojem hostované verze.

Cloudová infrastruktura neumožnila náhled ani otevření hostované stránky v ovládaném prohlížeči. Vizuální kontrola, mobilní použitelnost a ukládání ovládané přes UI tedy zůstávají **neověřené**. Lidský playtest neproběhl; délka ani zábavnost nebyly automatickými testy potvrzeny. [Podrobný rozsah kontrol](../prototype/TESTING.md).
