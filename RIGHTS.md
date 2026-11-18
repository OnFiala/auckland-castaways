# Práva a původ materiálů

Veřejný repozitář není automatické udělení licence ke všem jeho souborům.

- **Nové výzkumné poznámky, scénář, návrh, data a pomocné skripty:** vznikly pro tento projekt. Obecná open-source ani Creative Commons licence zatím nebyla zvolena. Nepřidělujeme cizímu historickému materiálu nová práva a nepředstíráme, že otevřená viditelnost znamená volné komerční užití každé položky.
- **Prototyp v `prototype/`:** kód, herní dialogy, rozhraní a SVG výjev vznikly pro tento projekt. Neobsahuje převzaté moderní ilustrace, fotografie, fonty ani knihovní závislosti. Stejně jako pro ostatní nový obsah zatím není zvolena obecná licence.
- **Dobové originály:** stav a původ jsou vedeny jednotlivě v [registru](sources/REGISTER.md) a [akvizičním manifestu](sources/acquisition-manifest.json). Musgrave 1866 a Raynal 1874 jsou historické publikace s ověřeným public-domain označením poskytovatelů. Digitální kopie může obsahovat další upozornění a podmínky; u Oxford/Google kopie Raynala je zachována úvodní stránka s požadavkem nekomerčního použití a atribuce. Neoznačujeme ji za bezpodmínečně připravený komerční herní asset.
- **Moderní knihy, studie, muzejní fotografie a filmy:** nejsou zde celé kopírovány. Registr obsahuje odkazy, bibliografii a vlastní stručné shrnutí. Zařazení odkazu neznamená souhlas autora s herní adaptací.
- **Wikisource a další transkripce:** odkazy směřují k jejich autorům a historii úprav. Úplná webová transkripce nebyla převzata; lokální texty jsou označené deriváty archivních skenů/OCR.

Podrobné rozlišení opce na moderní knihu, dobového příběhu a obrazových materiálů je v [ADAPTATIONS_AND_RIGHTS](research/ADAPTATIONS_AND_RIGHTS.md). Pokud má následovat komerční vydání, připraví se konkrétní seznam skutečně použitých assetů a jejich podmínek. Tento soubor sám není konečným právním posudkem takového vydání.

- **Příběhová kampaň v `campaign/`:** původní kód, scénář a pět AI generovaných maleb. Prompty a SHA-256 jsou v obrazovém manifestu; grafika je výtvarná interpretace, nikoli historický doklad. Nebyly převzaty moderní obrazové předlohy. Obecná licence nového projektu zůstává nezvolena.

- **Nová adventura v `adventure/`:** tři původní AI generovaná prostředí, hlavní a čtyři vedlejší postavy, malované rekvizity, stavy prostředí, šestiprvkový atlas rozhraní, pět atlasů po šesti krokových pózách, původní anglické repliky a kód. Původ, prompty, editace a hashe jsou v manifestech a dokumentech ART, PEOPLE_ART, PROPS_ART, STATE_ART, UI_ART, WALK_ART a STORIES. Nebyly převzaty assety, postavy ani kód Machinaria.

## Full point-and-click campaign artwork

The original generated campaign backgrounds and state variants are recorded in [the voyage scene manifest](adventure/dist/assets/voyage/scenes/manifest.json); the original prop atlases and kettle are recorded in [the voyage prop manifest](adventure/dist/assets/voyage/props/manifest.json). Prompts, hashes and edit-parent provenance accompany the unchanged PNGs. These generated interpretations are not copied from modern books or authenticated portraits. New English campaign dialogue and puzzles are original adaptation; factual boundaries and primary-source references are documented in [HISTORICAL_ADAPTATION](adventure/HISTORICAL_ADAPTATION.md).

## Work surfaces and working figures

The seven new close-up paintings and five three-pose character atlases are original image generations for this project. Source PNGs, prompts, referenced project artwork and hashes are documented in the [work surface manifest](adventure/artwork/workplates/manifest.json) and [working pose manifest](adventure/dist/assets/work-poses/manifest.json). The [runtime image manifest](adventure/dist/assets/workplates/manifest.json) records the WebP derivatives. The game’s simplified Auckland and Adams Island contours were hand traced from the 1865 sketch of the Auckland Isles published in Musgrave’s 1866 book. The surrounding voyage diagram and pencil course are an original puzzle composition. [A001 and its public-domain provenance](sources/ILLUSTRATIONS.md)
