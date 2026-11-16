# Live-world QA

Scope: English interface and new dialogue and walking contracts, tested 2026-11-16. These are automated Node and minimal DOM-mock checks, not a browser visual or accessibility audit.

- `node --test adventure/tests/engine.test.js adventure/tests/polish-ui.cjs adventure/tests/live.test.cjs`: 29 passed. The original puzzle has exactly 172 reachable states, all with a route to completion. A fixed v3 save containing a Czech journal entry restores and progresses; the original journal text is retained.
- Six distinct atlas cells are selected in sequence, their crop boxes lie inside the PNGs, and all five PNG hashes and dimensions match their manifests. This does not establish the quality or distinctness of the painted poses as perceived in motion.
- Deterministic patrol tracks pause under the conversation/reduced-motion flags and reset. The mock verifies that the speaker remains in place during dialogue and a saved reduced-motion preference prevents patrol displacement.
- Dialogue advances through three beats by timer, ends, closes on Escape or scene travel, and a canceled timer does not reopen it. All five speakers have three beats in each of four progression stages. English hint text remains accessible when brief captions are hidden. Existing dialog focus restoration, completion and restart contracts still pass.
- `node adventure/tests/ui-contract.cjs`, `node adventure/tests/art-contract.cjs`, and `node adventure/tests/interface-art.cjs` passed; the DOM contract includes the full puzzle, storage failure, focus, and completion-timer race.

Limitations: the mock does not lay out or paint the page and does not reproduce browser focus trapping, touch, actual storage, page visibility, media queries, audio, speech synthesis or real-time scheduling. No claim is made about smoothness, clipping, screen-reader behavior, contrast, viewport layout or rendered walking poses. Those require a real-browser and assistive-technology pass. Historic Czech journal entries are preserved in saved data. The current interface does not display this journal; all current visible labels, reactions and dialogue are English.
