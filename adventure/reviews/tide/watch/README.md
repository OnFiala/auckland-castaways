# Voda pod bortem, přeháňka na obzoru

[Čtyři sekundy pobřeží a otevřeného moře](wind-and-water.webp) · [Tři okamžiky jedné hlídky](three-watches.webp) · [Obrysy přímo v malbách](registration.webp) · [Měřicí body a výsledky](metrics.json)

V lednovém obraze zůstává malý vrak na útesu. Příboj přechází v úzkou vrstvu vody na plochém písku. Při práci u samotného vraku je vidět moře také mezerou za zádí. V loděnici dobíhá vlna k okraji zátoky pod kozami. V červencovém člunu se pěna trhá na dlouhé šikmé hraně vlny mezi stěžněm a napnutým lanem vpravo. Hráč může mezi vlnami sledovat jeden konkrétní hřeben, i když přestane pršet.

## Počasí a práce

| Kde | Co přichází zvenčí | Co má posádka v rukou |
| --- | --- | --- |
| Vrak a tábor v lednu 1864 | Poryv přináší přeháňku přes mokré pobřeží. Mezi přeháňkami se v oblacích znovu otevře světlo. | Plátno zachytí vodu nad místem na spaní. Mokrá větev nebo nízký cíp mohou odkapávat ještě po dešti. |
| Epigwaitt v zimě | Průsek v rokli se střídavě vyjasní a zaplní mokrým sněhem. V domě jsou srážky vidět za čtyřmi samostatnými tabulkami. | Voda ze spáry ve střeše padá do misky. Spáru, pád a hladinu misky společně kreslí detail opravy střechy, takže kapka v místnosti dopadá tam, kde ji hráč hledal zblízka. |
| Kovárna a uhlířská mýtina | V prosvětlených mezerách koruny krátce prší. Uhlí i měch zůstávají v závětří. | Teprve zapálené uhlí osvětluje kámen. Hráčovo přiložení rozjasní místo práce. |
| Loděnice v červenci 1865 | Za trupem je vidět déšť se sněhem na vodě. V závětří jsou dlouhé světlé přestávky. | Hotový bok odvádí vodu. Napnutá plachta drží mezi ráhnem a stěžněm. |
| Cesta k Port Adventure | Loď začíná v závětří. Od šedé přeháňky na pravém obzoru se déšť, oblačný stín i tříšť pohybují doleva. Pak se zvedne vítr. Jakmile déšť zastře výhled i vlevo, přeletí blíž před hráčem několik kapek. Po přeháňce výhled povolí a vlny dál nesou pěnu. | Pevně uvázané lano pomáhá při práci. Po vybrání vody zůstanou vidět prkna a ve spáře se znovu sbírají kapky. Spravená plachta se méně chvěje. Na hlídce lze vyhlížet pevninu. |
| Port Adventure a příprava pomoci | Světlo zůstává nad vodou déle, slabý déšť přechází za kutrem. U mapového stolu jej lze vidět za oknem. | Muži mají chráněné místo k rozložení map a deníku. |
| Srpnový návrat | Poslední přeháňka odchází a na vjezdu do zátoky přetrvává vítr. Voda u člunu pomalu stoupá ke kýlu. | Vyvazovací lano přidrží člun. Uvnitř domu zbývají kapky na skle. Okno pro záchranu otevře změna počasí sama. |

Musgrave v květnu popisuje střídání světla, deště a sněhu. Pro 19. červenec zaznamenává slabý ranní vítr, odplutí s první přeháňkou a později vytrvalý jihozápadní vichr. Jednou rukou se držel lana, druhou obsluhoval pumpu a ostatní dva se střídali u kormidla. Dne 24. srpna přeháňky ustaly v poledne a vítr kolem třetí zeslábl právě natolik, aby mohli pokračovat. U domu bylo stále příliš větrno na zakotvení kutru. Čas jednotlivých animací, směr větru vůči obrazovce, voda v misce i úkony ve člunu jsou inscenací hry. [Musgrave, tištěné strany 33–34, 95–97 a 116–117](../../../../sources/originals/castawayonauckla01musg.pdf) · [Historický manuál](../../../HISTORICAL_ADAPTATION.md)

## Hlídka a přístupnost

Počasí v jedné kapitole běží podle stejných hodin při práci i při přecházení mezi místnostmi. V páté kapitole trvá odplutí ze závětří čtrnáct herních sekund, dalších jednadvacet sekund sílí vítr. Samotné přeháňky a světlé mezery v plné síle větru se potom střídají v delších intervalech. Přechod mezi dvěma stavy oblohy trvá několik sekund. Během pauzy, při skrytém okně a se zapnutým omezením pohybu hodiny stojí. Při opětovném otevření rozehrané plavby s upevněným lanovím nastoupí hráč zpět na hlídku na otevřeném moři. Anglický popis herní scény připomene počasí i práci lidí a vybavení. Přečíst lze každou fázi bez sledování animace. [Řízení počasí](../../../dist/weather.js) · [Obrysy hladin, pěny a světla](../../../dist/landscape.js)

V levém výhledu o velikosti 196 × 185 pixelů zasáhly kapky v šesté sekundě 23 pixelů. Ve 48. sekundě jich bylo 1 122, v 78. už žádný. Ve stejném výřezu poklesla průměrná jasová složka krajiny během přeháňky z 87 na 76 a potom vystoupila na 88 z 255. Z celkových 44 měřicích míst patří 26 pevnému materiálu. Na žádném z těchto míst se při příslušném měření nezměnil jediný pixel.

## Jak ověřit obraz

Z adresáře `adventure` spusťte následující příkazy s Node.js a dostupným balíčkem `@napi-rs/canvas`. Pro volitelný zápis ukázek potřebujete navíc FFmpeg s kodérem `libwebp_anim`.

```sh
node --test tests/weather.test.cjs tests/landscape.test.cjs
node reviews/tide/watch/proof.cjs
node reviews/tide/watch/proof.cjs --record
```

Zkouška načítá malbu z produkčního registru, skutečné kreslení krajiny a počasí a časuje snímky voláním stejného obslužného kódu jako hra. V každém z jedenácti zkoušených stavů porovná čtyři sekundy při 16 snímcích za sekundu. Zkouška pevného místa porovnává všechny čtyři barevné kanály s malbou. U místa vystaveného dešti se měří vrstva pod srážkami. U suchého místa se porovnává i výsledná kompozice. U živých míst je předepsán minimální počet pixelů se změnou aspoň o čtyři stupně a nejméně 51 různých snímků. Měření sněhu a deště odečítá souběžnou krajinnou vrstvu.

Tři kopie scény člunu sdílejí počasí od odplutí. V čase 43 s proběhne u druhé vybrání vody a u třetí také oprava plachty. Zkouška porovná celou vrstvu počasí ve vyznačeném výřezu nad mořem ve shodném čase ve všech třech stavech. Pohyb na vodě i srážky musí souhlasit pixel po pixelu po všech 64 snímků. Vlastní malby, rekvizity a postavy mají oddělené stavové zkoušky. Soubor JSON uvádí souřadnice výřezů, výsledky i SHA-256 vstupních obrazů a modulů. Pohybová a světelná studie zachycují malbu a vrstvu prostředí složené v nativním Canvas 2D. Čísla na tabuli měřicích bodů odpovídají pořadí v JSON u příslušné scény. [Měřicí body](probes.cjs) · [Reprodukční skript](proof.cjs) · [Starší srovnání před změnou kompozice](../README.md)
