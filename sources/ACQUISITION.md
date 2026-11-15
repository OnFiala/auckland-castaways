# Akvizice a používání souborů

[Manifest JSON](acquisition-manifest.json) eviduje úspěšná stažení, deriváty, vybraná metadata i některé konkrétní neúspěšné pokusy. Hash SHA-256 kontroluje totožnost souboru, nikoli pravdivost obsahu. Stažený úplný sken může obsahovat neprohlédnuté stránky, reklamy, titulní listy a historické chyby.

## Skutečně získáno

| Soubor | Původ | Zpracování |
|---|---|---|
| `castawayonauckla01musg.pdf` | Duke / Internet Archive; Musgrave, London1866. | Původní stažený PDF, 212 digitálních stran. |
| `musgrave-1866-pdftotext.txt` | Odvozeno z předchozího PDF. | `pdftotext -layout`, bez ručních oprav. |
| `wreckedonareef00rayngoog.pdf` | Oxford / Google / Internet Archive; Raynal, London1874. | Původní PDF, 363 digitálních stran, úvodní Google notice zachován. |
| `wreckedonareef00rayngoog_djvu.txt` | OCR dodané stejnou IA položkou. | Surový text; chyby v písmenech, číslech i diakritice. |
| Dva soubory v `illustrations/` | Stránky výše uvedených PDF. | Přesný výběr stránek, viz [katalog ilustrací](ILLUSTRATIONS.md); ne retuš. |
| Dva bibliografické JSON v `metadata/` | IA metadata endpoint. | Jen vybraná relevantní pole; nesouvisející technická a osobní metadata vynechána. |

Při citaci uvádějte **tištěnou stránku** a vydání; při hledání obrázku i digitální stránku. U Musgraveovy mapy je digitální strana16, u Raynalova frontispisu13 a titulní strany16. Dobové rytiny nejsou dokumentární fotografie.

## Co tu není

Francouzské knižní vydání Raynala, obraz Smithovy knihy1866, Holdingův rukopis, úplné novodobé knihy Druett/Allen, celý DOC report, moderní muzejní fotografie a samostatný stažený snímek Graftonu1909. Část položek je dostupná pouze jako webový text, katalog nebo indexované OCR. Viz status u příslušného pramene, zvláště S003/S014/S015/S022/S037/S049/S050.

Google notice u Raynala obsahuje požadavek nekomerčního použití souboru a zachování atribuce. Výzkumný sken tu není udělením nové univerzální licence pro komerční grafiku. Pro produkční assety je třeba konkrétní vhodná kopie a vyjasněné podmínky. Žádný vodotisk ani předlist nebyl odstraněn.

Reprodukce kontroly hashů: `python tools/validate.py`. Nové stažení nemá přepsat originál bez porovnání hashů a zaznamenání nové verze. Serverové přesměrování je v manifestu, takže lze rozlišit požadovanou stabilní URL a skutečnou distribuční adresu.
