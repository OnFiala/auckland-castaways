# Jak doplňovat projekt

1. Novému prameni přidělte další stabilní ID v `data/sources.json`. Uveďte autora, vydání/datum, URL, skutečně prohlédnutý rozsah, status, závislost a práva. Existující ID nepřečíslovávejte.
2. Přidejte tvrzení do `data/evidence.csv` s přesností data, lokátorem a kvalifikací. Rozlišujte datum události, zápisu, dopisu a vydání. Novinový přetisk není další nezávislý svědek.
3. Aktualizujte čitelný evidenční deník a související rozpory. U oprav OCR uveďte obraz stránky; surové originály nepřepisujte.
4. Tvůrčí prvek označte v `data/claims.csv` jako fakt / připsané svědectví / úsudek / fikci. Vymyšlený dialog nesmí být vydáván za přeložený původní výrok.
5. Stažený veřejně sdílený soubor potřebuje ověřená práva, URL, datum, velikost a SHA-256 v manifestu. Moderní texty zůstanou odkazy a vlastními krátkými shrnutími, pokud není výslovně jinak rozhodnuto. Nezahrnujte přihlašovací údaje, osobní kontext ani pracovní cache.
6. Spusťte `python tools/render_register.py`, `python tools/render_evidence.py` a `python tools/validate.py`. Síťovou kontrolu spouštějte při změně odkazů nebo datované revizi, ne při každé úpravě věty.

Před publikací zkontrolujte nový stav vzdálené větve a zachovejte práci ostatních. Změna názoru vyvolaná pramenem patří do textu a evidence; historie commitu uchová starší formulaci. Závažnou nejistotu nezakrývejte hladkým scénářem. Kontaktování žijících osob či institucí není automatickým důsledkem položky v backlogu.
