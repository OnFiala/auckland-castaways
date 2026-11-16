# Rozhraní: vizuální úprava CSS

Horní lišta a inventář používají tmavé ořechové dřevo, tlumenou mosaz a plátno; dialogy připomínají světlý papír. Barevné překryvy scény, přechody mezi lokacemi a podklady dialogů jsou neutrální hnědé nebo šedé. Obraz scény zůstává dominantní v poměru 16:9. Styl nepředpokládá existenci dalšího atlasu.

Zůstávají zachované selektory a stavy aplikace, viditelný fokus, posuvný inventář, malé displeje i omezení pohybu. Pravidlo `[hidden]` výslovně skrývá prvky, jejichž vlastní `display` by jinak přednostně přebilo prohlížečové skrytí. Výškové zúžení již nevynucuje minimální šířku, která by mohla přesáhnout viewport.

Ověření: kontrola selektorů proti `index.html` a `app.js`; prohlížečové vizuální ověření a posouzení kontrastu v konkrétních scénách zůstává nutné po integraci.
