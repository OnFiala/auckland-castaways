# Malované vedlejší postavy

Čtyři stojící malby vedlejších postav jsou fiktivní portréty. Podobu obličejů a jednotlivosti oděvů vytvořil generátor pro tuto hru. Současné stavy chůze a práce vycházejí ze samostatných atlasů. [Manifest stojících postav](dist/assets/people/manifest.json) · [Krokové atlasy](WALK_ART.md) · [Manifest pracovních atlasů](dist/assets/work-poses/manifest.json) · [Výtvarná a povětrnostní kontrola](reviews/26-weather-and-art.md)

## Archiv z 16. listopadu 2026

Čtyři původní postavy vytvořil `image_gen.imagegen`. Výtvarnými referencemi byly tehdejší obrazy hlavního námořníka (`dist/assets/sailor.png`) a tábořiště (`dist/assets/camp.png`). Cílem byla shodná jemná grafitová kresba, texturovaný kvaš, tlumené barvy, modelace tváře a opotřebených oděvů.

- [Thomas Musgrave](dist/assets/people/musgrave.png): starší kapitán, tmavý kabát, šedivějící vous a námořnická čepice.
- [François Raynal](dist/assets/people/raynal.png): štíhlejší, světlé vlasy a vous, olivový kabát, lehce unavený postoj.
- [Henry Forgés](dist/assets/people/henry.png): tmavé zvlněné vlasy a krátký vous, šedoolivový kabát, okrová košile.
- [George Harris](dist/assets/people/george.png): robustnější postava, světlý vous, rezavě hnědý kabát.

Předlohami byly dřívější malby projektu. Moderní portréty nebyly převzaty. U vydání z 16. listopadu kontrola potvrdila shodu kontrolních součtů použitých PNG s generovanými výstupy.

[Manifest](dist/assets/people/manifest.json) uvádí SHA-256, velikosti, rozměry a kontrolu alfa kanálu. [Úplné prompty](dist/assets/people/prompts.json) zachycují výtvarné zadání.

### Tehdejší ověření průhlednosti a vložení do hry

U všech čtyř souborů byly naměřeny rozměry **1024 × 1536 px**, režim RGBA a všechna čtyři rohová místa zcela průhledná. Plně průhledných bylo přibližně 64–69 % pixelů. Černou plochu ve zobrazení doplňovaly některé prohlížeče obrázků jako pozadí.

| Soubor | Plně průhledné pixely | Obdélník alfa ≥128 (x0,y0,x1,y1) |
|---|---:|---|
| musgrave.png | 67,87 % | 217,13,821,1518 |
| raynal.png | 69,45 % | 245,10,749,1526 |
| henry.png | 67,37 % | 217,12,774,1525 |
| george.png | 63,60 % | 194,15,794,1524 |

Tehdejší hra používala individuální výřez siluety z původního PNG (obdélník alfa ≥128 rozšířený o 9 px). SVG zobrazovalo oblast se zachovaným poměrem stran. Kontejner měl ve scéně šířku 8,5 % a výšku 25,5–28 % podle postavy a hloubky. Nezávislé ukotvení chodidel kompenzovalo rozdílné průhledné okraje. Každá postava měla jemnou klidovou animaci a vlastní kontaktní stín.

Tehdejší vizuální kontrola pokrývala jednotlivé obrazy. Umístění ve složené scéně se řeší při herní integraci.
