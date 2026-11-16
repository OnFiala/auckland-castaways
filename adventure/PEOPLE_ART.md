# Malované vedlejší postavy

Datum vytvoření: 16. listopadu 2026. Čtyři původní postavy byly vytvořeny pomocí `image_gen.imagegen` s místními obrazy hlavního námořníka (`dist/assets/sailor.png`) a tábořiště (`dist/assets/camp.png`) jako výtvarnými referencemi. Cílem je shodná jemná grafitová kresba, texturovaný kvaš, tlumené barvy, modelace tváře a opotřebených oděvů.

- [Thomas Musgrave](dist/assets/people/musgrave.png): starší kapitán, tmavý kabát, šedivějící vous a námořnická čepice.
- [François Raynal](dist/assets/people/raynal.png): štíhlejší, světlé vlasy a vous, olivový kabát, lehce unavený postoj.
- [Henry Forgés](dist/assets/people/henry.png): tmavé zvlněné vlasy a krátký vous, šedoolivový kabát, okrová košile.
- [George Harris](dist/assets/people/george.png): robustnější postava, světlý vous, rezavě hnědý kabát.

Jde o **fiktivní výtvarné obsazení**, nikoli autentické portréty nebo tvrzení o doložené podobě oděvů a tváří. Postavy nevycházejí z převzatých moderních portrétů. Generované originály jsou zachovány beze změny pixelů; použité lokální kopie mají stejné hashe jako výstup generátoru.

[Manifest](dist/assets/people/manifest.json) uvádí SHA-256, velikosti, rozměry a kontrolu alfa kanálu. [Úplné prompty](dist/assets/people/prompts.json) zachycují výtvarné zadání.

## Ověření průhlednosti a vložení do hry

Všechny soubory mají rozměry **1024 × 1536 px**, režim RGBA a všechna čtyři rohová místa zcela průhledná. Plně průhledných je přibližně 64–69 % pixelů. Černá plocha ve výstupu některých prohlížečů obrázků představuje jejich podklad, není pevným obdélníkem uvnitř PNG.

| Soubor | Plně průhledné pixely | Obdélník alfa ≥128 (x0,y0,x1,y1) |
|---|---:|---|
| musgrave.png | 67,87 % | 217,13,821,1518 |
| raynal.png | 69,45 % | 245,10,749,1526 |
| henry.png | 67,37 % | 217,12,774,1525 |
| george.png | 63,60 % | 194,15,794,1524 |

Hra zachovává původní pixely PNG a v registru `dist/art.js` používá individuální výřez siluety (obdélník alfa ≥128 rozšířený o 9 px). SVG zobrazí tuto oblast se zachovaným poměrem stran. Kontejner má ve scéně šířku 8,5 % a výšku 25,5–28 % podle postavy a hloubky; nezávislé ukotvení chodidel tak kompenzuje rozdílné průhledné okraje. Nejde o deformování celé postavy do krabičky bývalé SVG figurky. Každý člověk má jemnou klidovou animaci a vlastní kontaktní stín.

Samotné postavy byly vizuálně prohlédnuté. Jejich velikost a umístění ve složené scéně musí ověřit integrace; tato kontrola souborů není browserový test hry.
