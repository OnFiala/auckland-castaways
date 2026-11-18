# Full-campaign verification

The campaign extends the existing point-and-click chapter through winter, the forge, boatbuilding, the crossing, Stewart Island and the return for Henry and George. It retains the original first-night engine as a separately testable module.

## Release checked on 18 November 2026

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
