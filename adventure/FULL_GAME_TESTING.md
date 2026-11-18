# Full-campaign verification

The campaign extends the existing point-and-click chapter through winter, the forge, boatbuilding, the crossing, Stewart Island and the return for Henry and George. It retains the original first-night engine as a separately testable module.

## The crew at work and the archival epilogue, 18 November 2026

The full suite passed 129 checks. The separate first-night UI walkthrough also reached its ending. The main campaign script completed all seven chapters in 71 inventory, room and chapter actions, with the physical work and the sewing roll exercised along the way. The workbench now has eight tasks. The new tests include Henry finishing his work and standing after a save reload, both stowage choices, the roof clue with sound muted, foot placement at the boat, and recovering from wrong choices in the Invercauld archive. [Current release](reviews/27-the-crew-at-work.md) · [Deterministic archive tests](tests/epilogue.test.cjs) · [Character gesture tests](tests/crew.test.cjs)

A second run used the compact deployment files for 24 application, workbench and archive checks, including the full journey. The package holds 75 WebP files and one short stereo WAV. The encoder checked dimensions, exact alpha and colour difference on all 47 converted PNGs. Checksums and readable dimensions matched the three new art registers, covering 21 images and the sound recording. The historical repository validation covered 53 source records and 55 evidence entries. The managed browser preview timed out while opening port 4173. A complete playthrough in the hosted browser, physical phone testing and a player study of puzzle difficulty remain open. [Scene movement sample](reviews/living/LANDSCAPE.md) · [Methods for Henry’s posture study](reviews/crew/README.md)

## Weather and artwork edition, 18 November 2026

104 of 104 release checks passed, along with the separate first-night walkthrough. The game handler tests additionally restored the wet, bailed and mended crossing pictures after their actual puzzles. Eight focused weather tests covered the fourteen room models, shelter and boat responses, dry indoor masks, persistent canvas, footprints, new plate selection and reduced or paused motion. The 64-frame weather example was composited with the production renderer and current paintings. It runs for 5.12 seconds. Native device touch and a complete interactive browser playthrough remain unverified because the managed preview relay timed out while opening port 4173. [Weather evidence](reviews/weather/README.md) · [Artwork and changes](reviews/26-weather-and-art.md)

The release directory contains 84 runtime files totalling 32,331,554 bytes. Its 54 WebP images comprise the seven work surfaces and 47 encoded PNG paintings. The encoder checked each source PNG against the delivered pixels for dimensions, exact alpha and its colour-error budget. Fourteen of the UI checks, including the entire voyage, were rerun on this compact directory.

## Earlier playable revision, 18 November 2026

**95 of 95 tests passed**, together with the separate first-night walkthrough. A full campaign run exercised the production handlers across the fourteen rooms, seven work surfaces, the change of protagonist and the final rescue. The long route used 71 inventory, world and chapter actions, with the individual work-surface inputs in addition. The model search still covers 705 reachable chapter inventory states. Dedicated work-surface tests explore the separate partial puzzle states and confirm recovery after wrong moves.

| Check | Observed result |
|---|---|
| Clicks, dragging and persistence | The real handlers accepted input on the painting, accepted the equivalent named action, cancelled a drag without spending the tool, preserved an interrupted chest through a reload and granted its contents once on completion. |
| Walking and size | 1,589 room routes reached their endpoints. 248 routes bent around an obstacle. Every sampled foot position stayed on the painted floor. Pausing a moving character preserved the position. |
| Work and optional scenes | The ten optional room interactions left the voyage state intact. A dedicated test checks reach and separation from mandatory object fields. The ambient animation nodes survived unrelated inventory changes. |
| Hints and story | The first clue gives an observation. The player can request a direction or the next action. The inspection/dialogue review checked 63 scene targets and 23 contextual changes in speech. |
| Visual material | Seven native 1536 × 1024 work paintings, their seven production encodings and five transparent working-figure atlases passed hash checks. The manual art pass compared six compositions and fifteen stationary/working poses. |
| Historical continuity | The final party travels with Musgrave aboard the rescue expedition. Henry and George return from the island. Invercauld remains a separate historical account. |

[Physical staging](reviews/24-spatial-study.md) · [Static art comparison](reviews/staging/README.md) · [Historical and dialogue review](reviews/24-history-dialogue.md)

A second run exercised the generated web edition. All 13 campaign and workbench handler tests passed against the exact WebP runtime layout. Its 77 static files total 30,118,678 bytes. The packager checks every converted painting for equal dimensions and an identical alpha channel. Composited channel RMS is at most 3.5 on the eight-bit scale. The archival PNGs remain available in the source checkout. [Web packager](tools/build_web.py)

The 16 November release had 67 passing tests and the same 705-state campaign graph. The additional checks exercise the illustrated work, its input handlers, physical staging, optional interactions, art provenance and persistence.

## Automated checks

```sh
node --test adventure/tests/*.test.js adventure/tests/*.test.cjs adventure/tests/art-contract.cjs adventure/tests/interface-art.cjs adventure/tests/polish-ui.cjs adventure/tests/voyage-ui.cjs
node adventure/tests/ui-contract.cjs
```

`voyage-ui.cjs` loads the script order declared by the game's HTML and runs actual application event handlers in the existing deterministic DOM contract harness. It is independent of the campaign engine's unit-test solution: it follows the hints shown to players, navigates scene exits, selects objects, combines inventory items, uses tools on targets, and crosses the chapter passage only after work is complete.

The UI scenarios include the following checks.

- A complete route through all seven chapters and the final rescue screen.
- Save/reload at chapter boundaries and during unfinished puzzles.
- Visible chapter gates, invalid uses that preserve tools, and old version-3 completion importing as the first chapter rather than the whole ending.
- Optional conversations in chapters I–VI that do not consume puzzle items or unlock progress; speaking to Henry and George is part of the final rescue preparation.
- The protagonist changing from Alick's dramatic viewpoint to Captain Musgrave for the return, without duplicating Musgrave as a companion.
- A saved finale reopening with all five portraits, readable historical credits, and a deliberate restart.
- The seven-chapter journey map remaining read-only.
- Settings interrupting a chapter departure safely, with a successful retry afterward.
- Every inventory item resolving to a repository-local painted crop inside its source image.

The original engine tests remain useful for the 172-state first-night graph, including recovery of the reaching pole when it is planted as a mast too early. They do not by themselves establish that the later chapters work.

## What these checks do not establish

The DOM harness has a controlled clock and small element model. It does not render images or CSS, reproduce native focus and modal behavior, play speech, measure animation frame rate, or test touch coordinates. Passing it is evidence of state transitions and handler wiring, not a claim of finished animation quality.

Before describing a visual/browser pass as complete, manually verify the following in a working browser:

1. Finish every chapter through its visible objects and passage; do not use developer shortcuts.
2. Reload a partly solved later chapter and confirm the same inventory, solved scenery and active character.
3. Check the ocean scene and both return scenes for correct character identity and no duplicated crew.
4. Check all newly painted items against their hit areas and inventory crops, including full inventories on small screens.
5. Verify the final rescue screen, reload it, return to the landing and restart deliberately.
6. Verify keyboard focus, reduced motion, optional device narration, and walking in both directions.

The checks above are automated source/handler evidence. The current managed preview again failed with `relay could not open browser port 4173: timed out waiting for relay readiness`; status reported `Sites preview stopped`. The browser route remains unavailable; no full-campaign browser playback or visual acceptance pass is claimed. Later visual or runtime edits require their affected checks to be rerun.
