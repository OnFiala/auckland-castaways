# Aktivní místa v malovaných scénách

[Obrysová studie pláže, vraku a člunů](obrysy.webp) ukazuje původní herní malby a jejich aktivní místa. Zelená čára sleduje obrys pro ukazatel. Kolem drobných předmětů je navíc prostor pro prst. Jde o měřicí diagram sestavený z produkčních souborů.

| Místo | Pozorování a oprava |
| --- | --- |
| Pláž | Lano, šikmá tyč a plachta se vejdou do svých polí. Poleno mělo neaktivní proužek u okraje. Pole má nyní výšku 9,2 % scény a po rozštípání se odebere také z pořadí klávesy Tab. |
| Raynal | Rozhovor lze začít přes boty i ruku opřenou o kládu. Mezera u hlavy propouští kliknutí na pozadí. Plachta nahoře má vlastní ovládání. |
| Vrak | Spodní kladka, volný konec i lano stoupající ke kování spouštějí jediný úchop. U otevřené truhly reaguje víko a zámek. Svah nalevo od víka zůstává přístupný. |
| Plavba | Na šířkách 320, 360 a 384 px sahalo minimální dotykové pole vody až doprostřed kompasu. Kompas má přednost do jeho sebrání. Při 1280 px se střed s vodou nepřekrývá. |
| Přístav a návrat | U obou člunů je možné pracovat i na koncích namalovaného trupu. Na Flying Scud funguje také nástupní lávka. Přistávací lano u druhého člunu má přednost a po sebrání místo uvolní. |

Měření pokrývá 30 umístění předmětů z atlasů ve 14 místnostech. Pro každý řádek obrazu počítá krajní viditelné pixely po zachování poměru stran a natočení. Použitý práh krytí je 64/255. U Raynala a všech devíti fází kladky byl kontrolován také jemnější okraj od 12/255. Samostatný test akcí prochází sběr, rozštípání polena, návrat do místnosti a načtení uložené pozice. Kontroluje navíc všech 22 sbíratelných předmětů kapitol 2–7 po nastavení jejich příslušných příznaků.

Z adresáře `adventure/` lze spustit měření a test ovládání. Měřicí skript používá Pillow a písmo DejaVu Sans k vytvoření popisků.

```sh
python reviews/release-14/predmety/measure.py
node --test tests/hotspots.test.cjs
```

Test ovládání používá skutečné obslužné funkce hry nad lokálním modelem DOM. Hit-test a vstup v produkčním prohlížeči se ověřují zvlášť.
