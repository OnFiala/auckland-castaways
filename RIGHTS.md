# Práva a původ materiálů

Veřejný repozitář není automatické udělení licence ke všem jeho souborům.

- **Nové výzkumné poznámky, scénář, návrh, data a pomocné skripty:** vznikly pro tento projekt. Obecná open-source ani Creative Commons licence zatím nebyla zvolena. Nepřidělujeme cizímu historickému materiálu nová práva a nepředstíráme, že otevřená viditelnost znamená volné komerční užití každé položky.
- **Prototyp v `prototype/`:** kód, herní dialogy, rozhraní a SVG výjev vznikly pro tento projekt. Neobsahuje převzaté moderní ilustrace, fotografie, fonty ani knihovní závislosti. Stejně jako pro ostatní nový obsah zatím není zvolena obecná licence.
- **Dobové originály:** stav a původ jsou vedeny jednotlivě v [registru](sources/REGISTER.md) a [akvizičním manifestu](sources/acquisition-manifest.json). Musgrave 1866 a Raynal 1874 jsou historické publikace s ověřeným public-domain označením poskytovatelů. Digitální kopie může obsahovat další upozornění a podmínky; u Oxford/Google kopie Raynala je zachována úvodní stránka s požadavkem nekomerčního použití a atribuce. Neoznačujeme ji za bezpodmínečně připravený komerční herní asset.
- **Moderní knihy, studie, muzejní fotografie a filmy:** nejsou zde celé kopírovány. Registr obsahuje odkazy, bibliografii a vlastní stručné shrnutí. Zařazení odkazu neznamená souhlas autora s herní adaptací.
- **Wikisource a další transkripce:** odkazy směřují k jejich autorům a historii úprav. Úplná webová transkripce nebyla převzata; lokální texty jsou označené deriváty archivních skenů/OCR.

Podrobné rozlišení opce na moderní knihu, dobového příběhu a obrazových materiálů je v [ADAPTATIONS_AND_RIGHTS](research/ADAPTATIONS_AND_RIGHTS.md). Pokud má následovat komerční vydání, připraví se konkrétní seznam skutečně použitých assetů a jejich podmínek. Tento soubor sám není konečným právním posudkem takového vydání.

- **Příběhová kampaň v `campaign/`:** původní kód, scénář a pět AI generovaných maleb. Prompty a SHA-256 jsou v obrazovém manifestu; grafika je výtvarná interpretace, nikoli historický doklad. Nebyly převzaty moderní obrazové předlohy. Obecná licence nového projektu zůstává nezvolena.

- **Adventura v `adventure/`:** malby prostředí a postav, rekvizity, stavové obrazy a materiály rozhraní vytvořené pomocí AI pro tento projekt, původní anglické repliky a kód. Tři původní prostředí první kapitoly, stojící postavy a první atlasy popisuje archiv vydání z 16. listopadu 2026. Nebyly převzaty assety, postavy ani kód Machinaria. [Výtvarné podklady a archiv](adventure/ART.md) · [Původ replik](adventure/STORIES.md)

## Full point-and-click campaign artwork

The campaign backgrounds, state variants and prop art are generated interpretations made for this project. No artwork was copied from modern books or authenticated portraits. Current manifests record prompts, parent images, hashes and any documented transforms. The technical notes distinguish the direct PNG copies used in the 16 November 2026 version from later registered edits and web derivatives. New English campaign dialogue and puzzles are original adaptation. [Voyage scene manifest](adventure/dist/assets/voyage/scenes/manifest.json) · [Voyage prop manifest](adventure/dist/assets/voyage/props/manifest.json) · [Weather and art review](adventure/reviews/26-weather-and-art.md) · [Historical boundaries and primary sources](adventure/HISTORICAL_ADAPTATION.md)

## Work surfaces and working figures

The seven new close-up paintings and five three-pose character atlases are original image generations for this project. Source PNGs, prompts, referenced project artwork and hashes are documented in the [work surface manifest](adventure/artwork/workplates/manifest.json) and [working pose manifest](adventure/dist/assets/work-poses/manifest.json). The [runtime image manifest](adventure/dist/assets/workplates/manifest.json) records the WebP derivatives. The game’s simplified Auckland and Adams Island contours were hand traced from the 1865 sketch of the Auckland Isles published in Musgrave’s 1866 book. The surrounding voyage diagram and pencil course are an original puzzle composition. [A001 and its public-domain provenance](sources/ILLUSTRATIONS.md)

## Opravy v Epigwaittu a svědectví Invercauldu

Šicí stůl, smotek, obě podoby opraveného plátna a pohled z prázdné chaty jsou původní výtvarné interpretace. V osmé pracovní úloze postavy používají změřené výřezy existujících maleb. Krátký zvuk vody v plechové nádobě vznikl syntézou pro tuto hru. Šest nových ilustrací na archivním stole doprovázejí dvě obrazové odvozeniny dobové mapy A001. Její původ a ověření statusu public domain jsou uvedeny zvlášť. [Šicí stůl a provenience](adventure/PROMISE_ART.md) · [Herní obrazové výřezy a zvuk](adventure/dist/assets/field-scenes/manifest.json) · [Vydání mapy a ilustrace epilogu](adventure/dist/assets/epilogue/provenance.json) · [Původ historické mapy](sources/ILLUSTRATIONS.md)

Rozhovorové písmo Spectral od Production Type je součástí adventury ve dvou původních souborech WOFF2. Šíří se samostatně pod SIL Open Font License 1.1. Hra oba soubory načítá místně. [Přiložená licence](adventure/dist/assets/lettering/OFL.txt) · [Zdroj a kontrolní součty](adventure/dist/assets/lettering/manifest.json) · [Projekt Spectral](https://github.com/googlefonts/Spectral)
