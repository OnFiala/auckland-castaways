# Full-campaign verification

The campaign extends the existing point-and-click chapter through winter, the forge, boatbuilding, the crossing, Stewart Island and the return for Henry and George. It retains the original first-night engine as a separately testable module.

## Executed release checks

16 November 2026: **67/67 release tests passed**, plus the separate first-night UI-handler walkthrough. This comprises 47 retained regression tests, 8 full-campaign engine tests, 7 full-campaign UI tests and 5 new artwork/manifest tests. The real-handler walkthrough reached the rescue through all seven chapters, including repeated mid-puzzle and chapter-boundary reloads. The engine search covered **705 reachable chapter states**, and every state had a route to its chapter completion: 172 / 49 / 81 / 95 / 31 / 108 / 169 for chapters I–VII.

## Automated checks

```sh
node --test adventure/tests/*.test.js adventure/tests/*.test.cjs adventure/tests/art-contract.cjs adventure/tests/interface-art.cjs adventure/tests/polish-ui.cjs adventure/tests/voyage-ui.cjs
node adventure/tests/ui-contract.cjs
```

`voyage-ui.cjs` loads the script order declared by the game's HTML and runs actual application event handlers in the existing deterministic DOM contract harness. It is independent of the campaign engine's unit-test solution: it follows the hints shown to players, navigates scene exits, selects objects, combines inventory items, uses tools on targets, and crosses the chapter passage only after work is complete.

The UI scenarios cover:

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
