# Kam až dosáhne příboj

Ve vydání 13 zasahovala pěna do dvou balvanů u přídě vraku, do kamenů a trávy u loděnice a do zákrutů lana na levoboku otevřeného člunu. Vydání 14 obtahuje obě skaliska a stébla podle malby. Na palubě sleduje okraj silnějšího ze dvou šikmých lan. Na první pláži leží příboj pod vrakem, před útesem. Písek v popředí i větev stromu zůstávají vně jeho dosahu.

Růžová na obrázku ukazuje místa, kterých se během 13 sekund dotkla voda. Barva je pro čitelnost zesílená. Vlevo je skutečná malba, uprostřed jsou tahy vydání 13, vpravo tahy vydání 14. Lednová i zimní malba zobrazují příď Graftonu ze stejného místa, proto sdílejí obrys vody. [Srovnání šesti míst](srovnani.webp)

| Místo | Zasažené pixely v kontrolních polích pevné krajiny, v13 → v14 | Živé pixely v sousedním poli vody, v14 |
| --- | ---: | ---: |
| Pláž | 0 → 0 | 8 892 |
| Lednový vrak | 36 → 0 | 1 278 |
| Zimní vrak | 28 → 0 | 1 278 |
| Loděnice | 29 → 0 | 865 |
| Červencová plavba | 20 → 0 | 1 168 |
| Srpnové přistání | 0 → 0 | 956 |

## Co měří test

Nativní Canvas 2D vykreslí lodní a pobřežní vlny skutečným kódem hry 209krát po 1/16 sekundy. Vítr má během zkoušky plnou sílu. Třináct sekund pokryje celý cyklus každého zkoumaného hřebene. Do měření vody nevstupují kapky padající vzduchem, postavy ani stíny mraků. Druhá zkouška vyplní celý povolený prostor vody pomocí stejného ořezu jako vlastní vlna. Ve všech 22 kontrolních polích pevné krajiny je výplň zcela průhledná (alfa 0), a to i kdyby se tam vlna pokusila proniknout mezi dvěma měřenými snímky. Počty v tabulce se vztahují k měřeným vzorkům v souřadnicích 1000 × 563. Přesné obdélníky, počty a SHA-256 všech deseti maleb zachycuje strojový výstup. [Měření](mereni.json) · [Zdroj testu](proof.cjs)

Další srovnání zkouší stejnou část malby po otevření truhly, po vztyčení stěžně, po vybrání vody ze dna a po opravě plachty. U tří stavů červencové plavby je porovnaný pás moře a lan pixelově totožný. Barvy výřezů kolem přídě a loděnice mají po dekódování různých verzí WebP průměrnou odchylku 1,36 a 0,725 na kanál v rozsahu 0–255.

## Stará pláž a změna velikosti

Pět procent od levého okraje začíná povolený prostor příboje ve vydání 12 na 42,76 % výšky, v současné malbě na 60,10 %. Při výšce 765 px by použití starého obrysu nad novou pláží posunulo horní hranu o 133 px výš. Verze 13 a 14 mají na pláži shodný obrys. Ke konkrétní hráčově pláži chybí snímek, na kterém by bylo možné smíšení verzí přímo určit. [Starší a novější malba se zakreslenými maskami](../../browser-13/plaz.webp)

Test předává skutečnému kódu pro změnu velikosti různé šířky jeviště a čte transformační matici jeho nativního plátna. Pro šířku 1360 při DPR 1 má plátno 1152 × 648 vzorků. Při DPR 3 se pro šířky 390 → 844 → 390 vystřídá 527 × 296, 1139 × 641 a znovu 527 × 296. Ve všech pěti měřeních se horní hrana vody promítne zpět na požadovaný bod CSS s odchylkou pod 0,001 px. Obě souřadnice se škálují zvlášť, takže zaokrouhlení rozlišení plátna neposune výšku hladiny. V deklaracích CSS vyplňují malba i průhledné plátno celý obdélník scény. Rozměry ve zkoušce zadává test. Skutečný rozvrh uživatelova zařízení a chování jeho mezipaměti vyžadují samostatné ověření ve vydaném náhledu. [CSS počasí](../../../dist/weather.css) · [Umístění zobrazené malby](../../../dist/scene-loading.css)

## Zopakování

Z kořene repozitáře spusťte následující příkazy. Skript potřebuje Node.js, modul `@napi-rs/canvas` a historii Git obsahující vydání 12 a 13. Obvyklý běh znovu spočítá hodnoty a ověří shodu s uloženým výsledkem. Přepínač `--record` obnoví tabulku i ilustraci.

```sh
node adventure/reviews/release-14/voda/proof.cjs
node --test adventure/tests/weather.test.cjs adventure/tests/landscape.test.cjs
```
