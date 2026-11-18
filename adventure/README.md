# Until We Return

A complete, compact seven-chapter painted point-and-click adventure inspired by the Grafton castaways. Walk through fourteen locations, salvage and combine objects, repair a home, forge tools, rebuild a boat, cross the ocean and return for the two men left behind.

[Play the hosted game](https://posledni-vrtak-auckland.andrewxix.chatgpt.site/) · [Complete story](FULL_STORY.md) · [Historical adaptation](HISTORICAL_ADAPTATION.md)

## Play

Open [dist/index.html](dist/index.html) from a downloaded copy of this repository. No installation or build is required. Browser support for local-file storage varies. GitHub shows source files rather than running the game.

- Click the ground to walk. Select an object to pick it up, work with it or examine its material. Click a person for a short English conversation.
- Select an item in the satchel, then another item to combine them, or use the selected tool on something in the scene.
- At the seven work surfaces, use the painted parts directly. You can drag a line or chart leg, or make the same move with individual clicks. Tab and Enter work on the picture. **Working controls** opens an optional list of the same actions. **Stand back** keeps unfinished work.
- Use the magnifying glass for touch inspection. A right-click or Shift+F10 also examines a place. The eye or Space briefly reveals interactive areas. The question mark offers an observation, then a direction, then the next move if requested.
- The compass shows the journey. Finish the work and follow the chapter passage. Settings include reduced motion, reaction captions and optional English narration using the device voice.

The campaign and partial workbench solutions save in the current browser. A version-3 first-night save can continue into winter, and earlier version-4 campaign saves retain their progress.

## Chapters

| Chapter | Places | Play |
|---|---|---|
| I · The First Night | Shore, wreck, camp | Recover sailcloth; build shelter, fire and a signal. |
| II · A House Against the Winter | Epigwaitt, stream | Stitch a roof patch and bring fresh water to the hearth. |
| III · What Iron Can Become | Forge, charcoal ground | Make the bellows, heat the furnace, test a failed drill and forge fastenings. |
| IV · Room for Three | Slipway, salvage | Plank, fasten, caulk and rig the boat. |
| V · Five Days of Ocean | Open boat | Secure the rig, bail, repair canvas and hold a bearing. |
| VI · The Promise | Harbour, Invercargill chart room | Mark the return route and supply the rescue cutter. |
| VII · Until We Return | Landing, Epigwaitt | Find Henry and George, prepare the landing and take both aboard. |

The playable viewpoint changes from Alick McLaren to Musgrave for chapters VI–VII. The ending presents the five survivors as a portrait montage, not a claim that all five sailed on the rescue voyage. The Invercauld party is not invented into a meeting with the Grafton crew.

## Art and movement

Walking and the fifteen new standing, reaching and kneeling poses share a ground anchor for each person. Painted floor boundaries keep movement on shore, beside workbenches or inside the boat. A background or actor image stays mounted while its replacement decodes. The ten optional scenery interactions include floating a shaving in a stream and testing fitted bellows. [Spatial study](reviews/24-spatial-study.md) · [Illustrated review](reviews/25-playable-revision.md)

The scene paintings, people, props and English dialogue were created for this project. The Auckland Island outline on the return chart draws on the historical sketch published in Musgrave’s book. The voyage, the people who sailed and the rescue date follow the research ledger. [Chapter sources and dramatization](reviews/24-history-dialogue.md) · [Original work surfaces](artwork/workplates/README.md) · [Working pose provenance](dist/assets/work-poses/manifest.json)

## Web delivery

The downloadable source runs by opening `dist/index.html`. The hosted edition uses the same scripts and paintings with WebP image addresses. To reproduce the compact static edition with Python, Pillow and an empty destination directory, run `python adventure/tools/build_web.py /tmp/until-we-return-web` from the repository root. The packager checks the dimensions, transparency and colour difference of every image before accepting it.

## Validation

```sh
node --test adventure/tests/*.test.js adventure/tests/*.test.cjs adventure/tests/art-contract.cjs adventure/tests/interface-art.cjs adventure/tests/polish-ui.cjs adventure/tests/voyage-ui.cjs
node adventure/tests/ui-contract.cjs
```

The release tests exercise the complete journey, all seven work surfaces, interruptions, an unfinished close-up through reload, optional field observations, and old saves. Every one of the 705 reachable campaign inventory states has a path to chapter completion. The managed browser relay timed out. Full animated playback, native touch and human difficulty testing remain open. [Test results](FULL_GAME_TESTING.md) · [Static comparison of six scenes](reviews/staging/scene-scale-proof.webp)
