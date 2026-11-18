# Moře a zimní potok v pohybu

[Otevřít pětisekundovou ukázku](sea-and-stream.webp)

Vlevo lze sledovat, jak se vlna zvedne za pevným okrajem člunu, zpění se a klesne. Vpravo voda padá přes horní hranu skály do druhé, širší kaskády. Ve stejném záběru přechází mokrý sníh před vzdáleným svahem a blízkým břehem. Popisky leží vně obou maleb.

Oba výřezy vznikly ve stejném Chromiu ze scén `crossing` a `forest`. Skript načte jejich herní obrazy, připojí oba produkční vykreslovače a skládá obraz počasí a pohybující se malby přes příslušné pozadí. Na člunu už hráč uvázal lano. Hráčské postavy ani ovládací prvky ve výřezech nejsou. Hodiny při záznamu postupují po 62,5 ms. Ve hře tempo řídí plánovač počasí.

S Node.js, balíčkem `playwright`, Chromiem a FFmpegem s kodekem `libwebp_anim` lze z kořene repozitáře ukázku vytvořit znovu:

```sh
node adventure/reviews/living/render-landscape.cjs
```

Proměnná `CHROMIUM_PATH` umožňuje vybrat nainstalovaný prohlížeč. Skript dočasně otevře server na místní smyčce a vytvoří 80 snímků. Výsledný WebP má 880 × 354 pixelů, trvá 4,999 s a měří 843 702 bajtů. Kontrola dekódovaných snímků 0 a 39 potvrdila změnu obrazu v obou výřezech.
