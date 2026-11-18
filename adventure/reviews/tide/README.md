# Příboj, lesní tůň a otevřené moře

Nová kompozice plochého pobřeží, vraku, loděnice a paluby má [vlastní měření a ukázku počasí](watch/README.md). Následující snímky, hodnoty a reprodukční příkazy zachycují obrazy z commitu `c2eff1a5f8dd803dccd28d50db0ab66b27949d6e`. Pro zopakování této starší zkoušky otevřete repozitář v dané revizi.

[Čtyři sekundy pohybu ze hry](priboj-a-proud.webp) · [Pevné body přímo v obrazech](pevne-body.webp) · [Čtyři gesta posádky](gesta.webp)

Vlevo od vraku se zpění vlna a v popředí zůstane stát útes. V lesní tůni lze sledovat dva úzké prameny, mezi nimiž prosvítá tmavá skála. Při plavbě přechází světlo po hřebeni vzdálené vlny za stěžněm. Všechny tři výřezy běží současně, každý vlastním herním vykreslovačem. Časové údaje označují kapitolu hry. Přesné počasí i světlo jsou výtvarná rekonstrukce.

## Proč se dřív hýbaly i pevné věci

Ve starším vydání pořídila funkce `swatch` výřez z ploché malby. Dovnitř jednoho měkkého obrysu padlo například listí i větev. Funkce `flexible` výřez smýkala nebo jej, u vodopádu, posouvala svisle až o 7,4 obrazového bodu. Funkce `water` pro změnu přemisťovala pásy výřezu přes původní okraj. Starší zkouška sledovala jen to, zda se obraz změnil.

Tři bezkompresní snímky původní krajinné vrstvy z časů 0,2, 2 a 3,5 s ukazují rozsah této vady. Změnilo se všech 180 sledovaných pixelů na pobřežním útesu, všech 150 na skalní římse u vody, 195 z 200 na kmeni a 47 ze 171 na zahnutém dřevě člunu. Ve vzorku kořene zůstalo všech 240 pixelů shodných. Výchozí kód i obrazy čte skript z neměnného commitu `19235ea0f1f1e6008e1f2ea482945264c19e0212`.

## Co přesně měří současná zkouška

Základní obraz dodá stejný registr jako při vstupu do herní scény. Jedny hodiny spouštějí funkce rámce pro počasí i dotyk. Měříme na plátně o velikosti 1000 × 563 px před exportem do WebP. Přesné obdélníky jsou uvedeny jako levý a horní okraj, šířka a výška. Výstup obsahuje SHA-256 každé malby, registru scén a tří vykreslovacích modulů. [Měřicí body](probes.cjs) · [Výsledky](metrics.json)

- **Pevný povrch pod srážkami** musí ve všech 64 snímcích odpovídat původnímu obrazu ve všech čtyřech barevných kanálech. Porovnání probíhá po vykreslení krajiny a před průletem kapek. Sleduje i úzký tmavý proužek skály mezi oběma stuhami vodopádu.
- **Suchý bod** musí odpovídat původní malbě také po vykreslení počasí a dotyku. Takto se kontroluje například kořen, malá plocha kmene, spára na stěžni a horní hrana pažení.
- **Živý povrch** musí v průběhu ukázky změnit předepsaný počet obrazových bodů nejméně o čtyři stupně a musí mít více než 50 různých snímků. Ve druhé zkoušce se vykreslují zvlášť hřeben s pěnou, odlesky mezi vlnami, vodopád a listy. Dešťové částice se do žádného z těchto čtyř měření nezapočítávají.
- **Dotyk ruky** prochází skutečnými funkcemi `render` a `tryFeature`. Kontrola všech čtrnácti míst promítne nohy do pochozího polygonu a ze skutečného měřítka pracovní malby dopočítá prsty. Ruka leží v aktivní oblasti ve všech čtrnácti případech. Na tabuli čtyř gest klečí v táboře a u uhlí Alick McLaren, u vraku zkouší třísku a při návratu bere za nit Thomas Musgrave. Střed niti je přístupný vedle George. [Výpočet a obrazová tabule](contacts.cjs)

Animace obsahuje krajinu, počasí a místní reakci na dotyk. Tabule gest navíc skládá namalovanou postavu v konkrétní pracovní póze. Tyto studie vznikají přímo nad soubory hry v nativním Canvas 2D. Ovládání stránky, zaostření klávesnice a rozhraní běžícího prohlížeče mají své samostatné herní zkoušky. Uvedené počty platí pro zakreslené vzorky a dobu této ukázky.

## Zopakování

S Node.js, balíčkem `@napi-rs/canvas` (měřeno ve verzi 0.1.100) a u exportu také s FFmpegem s kodérem `libwebp_anim` spusťte z kořene repozitáře následující příkazy. Stačí místní kopie souborů a pro starší srovnání dostupný uvedený commit v historii Gitu.

```sh
node adventure/reviews/tide/baseline.cjs
node adventure/reviews/tide/proof.cjs
node adventure/reviews/tide/contacts.cjs
```

Parametr `--record` u druhého příkazu zapíše novou animaci, obraz měřicích bodů a JSON. U třetího zapíše tabuli gest. Běžný běh zkoušek ponechá uložené ukázky beze změn. Záznam má 64 snímků při 16 snímcích za sekundu.
