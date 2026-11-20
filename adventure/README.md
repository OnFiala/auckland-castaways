# Until We Return

A complete, compact seven-chapter painted point-and-click adventure inspired by the Grafton castaways. Walk through fourteen locations, salvage and combine objects, repair a home, forge tools, rebuild a boat, cross the ocean and return for the two men left behind.

[Play in your browser](https://posledni-vrtak-auckland.andrewxix.chatgpt.site/) · [Download the offline game](https://github.com/OnFiala/auckland-castaways/releases/tag/game-v19) · [Watch the complete story film](https://github.com/OnFiala/auckland-castaways/releases/download/game-v18/until-we-return-story-film.mp4) · [Film and historical sources](artwork/story-film/HISTORY.md) · [Light and materials in edition 16](reviews/release-16/README.md) · [New paintings and dialogue](reviews/29-na-doslech.md) · [Complete story](FULL_STORY.md) · [Historical adaptation](HISTORICAL_ADAPTATION.md)

## Play

Extract the downloadable ZIP and open its root `index.html`. Keep the `editions` folder beside it. Returning to the same folder and browser gives the game access to the same save where local-file storage is available. The hosted edition saves on its own origin. A source checkout also runs directly from [dist/index.html](dist/index.html).

- Click the ground to walk. Select an object to pick it up, work with it or examine its material. Click a person to speak. The portrait and name follow the speaker below the scene. You can pause, step through each reply or return to the work with Escape.
- Select an item in the satchel, then another item to combine them, or use the selected tool on something in the scene.
- At the eight work surfaces, use the painted parts directly. You can drag a line or chart leg, or make the same move with individual clicks. Tab and Enter work on the picture. **Working controls** opens an optional list of the same actions. **Stand back** keeps unfinished work.
- Use the magnifying glass for touch inspection. A right-click or Shift+F10 also examines a place. The eye or Space briefly reveals interactive areas. The question mark offers an observation, then a direction, then the next move if requested.
- The compass shows the journey. Finish the work and follow the chapter passage. Settings include reduced motion, reaction captions and optional English narration using the device voice.

The three painted objects in the header show the work of the current chapter. Each finished task receives a check mark. A quiet instrumental theme follows you through each chapter. The first fire, the failed drill and the return course each have their own musical answer. Music softens when someone speaks, and the films have their own soundtrack. Adjust **Settings → Music volume**, down to **Off**. [Listen to the chapter themes](artwork/ISLAND_SCORE.md)

The prologue starts as the game opens. Follow the men from Sydney to the wreck. At daylight the picture gives way to the shore, where Alick and Raynal speak and you can move or pick up the first length of rope. Six films bridge the work between chapters. After Musgrave brings Henry and George aboard, the epilogue opens the separate Invercauld record and returns to Carnley Harbour today.

The campaign, unfinished work at the bench and your place in a chapter film are saved in the current browser. Earlier saves keep their progress. The compass opens **Our journey** to revisit any film you have reached. After the ending the whole film can play in sequence.

Move the pointer, tap the picture or use Tab to bring up playback controls. If your browser needs a gesture to play sound, the film opens with English captions and **Enable sound**. If native playback stalls, the game can carry on with frames and audio from the same edit. Reduced motion holds each shot as a painting while the soundtrack and captions continue.

## Chapters

| Chapter | Places | Play |
|---|---|---|
| I · The First Night | Shore, wreck, camp | Recover sailcloth; build shelter, fire and a signal. |
| II · A House Against the Winter | Epigwaitt, stream | Follow a drip to its seam, patch the roof and bring fresh water to the hearth. |
| III · What Iron Can Become | Forge, charcoal ground | Make the bellows, heat the furnace, test a failed drill and forge fastenings. |
| IV · Room for Three | Slipway, salvage | Raise a plank with Musgrave, seal and rig the boat, and put aside the sewing roll for Henry and George. |
| V · Five Days of Ocean | Open boat | Secure the rig, bail, repair canvas and hold a bearing. |
| VI · The Promise | Invercargill wharf and chart room | Mark the return route and supply the rescue cutter. |
| VII · Until We Return | Landing, Epigwaitt | Meet Henry and George, find their repair, prepare the landing and take both aboard. |

Alick is the playable character in chapters I–V. Musgrave makes the return journey in chapters VI–VII. After the rescue, an empty hut and a small sail precede the five painted portraits. **Open the Invercauld papers** lays out illustrated evidence from the other wreck. Match the witnesses, place their dates and consider the mark on Musgrave’s map. To revisit this desk after returning to the shore, open **Our journey** and **Revisit the ending**. [Notes on the archive and sources](EPILOGUE.md)

## Art and movement

Walking and the fifteen new standing, reaching and kneeling poses share a ground anchor for each person. Painted floor boundaries keep movement on shore, beside workbenches or inside the boat. A background or actor image stays mounted while its replacement decodes. Fourteen optional scenery interactions include floating a shaving in the pool below the spring and testing the fitted bellows. [Spatial study](reviews/24-spatial-study.md) · [Illustrated review](reviews/25-playable-revision.md)

The fourteen locations now have twenty-two original painted views. Water runs in two narrow ribbons against a fixed ledge. Whitecaps travel through open water, duck behind rocks and break into foam. Gusts lift grass tips and catch the loose parts of canvas. Worked rope, a shaving, a length of cloth and the crew’s hands have their own contact points. At the helm and by the spring, stone, bark and wood stay in their original pixels. [The new shore, wreck and boatyard](reviews/company/README.md) · [The earlier island study](reviews/tide/ostrov.webp) · [Four seconds of sea and stream](reviews/tide/priboj-a-proud.webp) · [Four gestures at playing scale](reviews/tide/gesta.webp) · [Measurement and release notes](reviews/28-priboj-a-pevna-zem.md)

The scene paintings, people, props and English dialogue were created for this project. The Auckland Island outline on the return chart draws on the historical sketch published in Musgrave’s book. The voyage, the people who sailed and the rescue date follow the research ledger. [Chapter sources and dramatization](reviews/24-history-dialogue.md) · [Original work surfaces](artwork/workplates/README.md) · [Working pose provenance](dist/assets/work-poses/manifest.json)

## Web delivery

A repository checkout runs from `adventure/dist/index.html`. The playable ZIP opens from its root `index.html`. The hosted edition uses the same scripts and paintings with WebP image addresses. To reproduce the compact static edition with Python, Pillow and an empty destination directory, run `python adventure/tools/build_web.py /tmp/until-we-return-web` from the repository root. The packager checks dimensions, transparency and colour difference when converting a PNG. Paintings already supplied as WebP are copied byte for byte. The root entry points to a content-specific edition directory. Each painting, walking atlas, sound, font, script and stylesheet keeps its release identity. No network connection is needed by the playable archive. `verify_web.py` checks the entry, resource paths and SHA-256 manifest. `package_download.py` makes the ZIP and includes the player guide. For a public update, build the portable game first. Pass `--previous /path/to/exact/published/dist` to `build_public_site.py` to reuse published media and keep open games working.

For public hosting, run `python adventure/tools/build_public_site.py /tmp/until-we-return-web /tmp/until-we-return-public --url https://posledni-vrtak-auckland.andrewxix.chatgpt.site/` and serve the output directory. The public game opens without an account. Its HTML includes the English title, description and a 1200 × 600 image for X and Open Graph link previews. The cover is an original AI-assisted illustration of the open-boat voyage. [Sharing artwork](site/share/until-we-return-cover.jpg)

## Validation

```sh
node --test adventure/tests/*.test.js adventure/tests/*.test.cjs adventure/tests/art-contract.cjs adventure/tests/interface-art.cjs adventure/tests/polish-ui.cjs adventure/tests/voyage-ui.cjs
node adventure/tests/ui-contract.cjs
```

The release tests exercise the complete journey, all eight work surfaces, interruptions, an unfinished close-up through reload, optional field observations, and old saves. Every one of the 705 reachable campaign inventory states has a path to chapter completion. The release includes targeted failures of a scene image, unfinished screen transitions and walking atlases. Native Canvas checks fixed rock, rope and wood against the water. [Current release and verification](reviews/release-15/README.md) · [Past test runs](FULL_GAME_TESTING.md) · [Artwork comparison](reviews/staging/scene-scale-proof.webp)
