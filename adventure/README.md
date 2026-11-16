# Until We Return

A complete, compact seven-chapter painted point-and-click adventure inspired by the Grafton castaways. Walk through fourteen locations, salvage and combine objects, repair a home, forge tools, rebuild a boat, cross the ocean and return for the two men left behind.

[Play the hosted game](https://posledni-vrtak-auckland.andrewxix.chatgpt.site/) · [Complete story](FULL_STORY.md) · [Historical adaptation](HISTORICAL_ADAPTATION.md)

## Play

Open [dist/index.html](dist/index.html) from a downloaded copy of this repository. No installation or build is required. Browser support for local-file storage varies. GitHub shows source files rather than running the game.

- Click the ground to walk, an object to collect or approach it, or a person for a short conversation.
- Select an item in the satchel, then another item to combine them or a world object to use it.
- Complete the three pictured goals to open the chapter passage. It appears at the right of the scene.
- The compass button shows the journey. The question mark gives a visual clue and one short instruction. Space reveals hotspots.
- Right-click or Shift+F10 examines the focused object. Escape clears an item or conversation. Tab and Enter operate controls.
- Settings include reduced motion, reaction captions and opt-in English device narration. There is no recorded voice acting.

Progress saves automatically. Existing version-3 first-night saves migrate into chapter I, including completed saves; use the passage to continue into winter. The old save remains untouched. The whole campaign uses a separate version-4 save.

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

All people and physical items use this project's original painted artwork. New scenes have clear foreground walking lanes and state variants for the hearth, forge, boat and crossing. Crew keep persistent sprite images, freeze their pose during interruptions, and move only toward specific work. Player and crew share a body-height step scale. Shapes still vary between the generated walking poses; further animation polish remains necessary.

[Scene artwork](VOYAGE_ART.md) · [walking art](WALK_ART.md) · [motion architecture](LIVING_WORLD.md) · [interface design](VISUAL_DESIGN.md).

The game is an original dramatic adaptation. Puzzles, dialogue, likenesses and convenient staging are fiction, not a measured historical reconstruction. No assets, characters, audio or code from Machinarium were used.

## Validation

```sh
node --test adventure/tests/*.test.js adventure/tests/*.test.cjs adventure/tests/art-contract.cjs adventure/tests/interface-art.cjs adventure/tests/polish-ui.cjs adventure/tests/voyage-ui.cjs
node adventure/tests/ui-contract.cjs
```

Every one of the campaign's 705 reachable chapter states can reach completion. Real application handlers have completed the full game with repeated save/reload and old-save migration. [Current release evidence](FULL_GAME_TESTING.md).

The managed preview route remains unavailable. Actual browser playback, final visual alignment, touch behavior, native focus, narration quality and frame rate are unverified. Individual generated paintings have been inspected, and their source metadata and hashes are recorded. This is an implemented full campaign, with visual acceptance and player testing still outstanding.
