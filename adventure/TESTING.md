# Current campaign release

The seven-chapter game is documented in [FULL_GAME_TESTING](FULL_GAME_TESTING.md): **67/67 release tests passed**, with all 705 reachable chapter states able to finish. The separate first-night handler walkthrough also passed. Browser playback remains unverified because the managed preview relay is unavailable.

The movement-repair record below is retained as the preceding release snapshot.

## Previous release — movement repair

16 November 2026. Final automated run: **47/47 Node tests passed**, plus the separate complete UI-handler contract.

```sh
node --test adventure/tests/engine.test.js adventure/tests/art-contract.cjs adventure/tests/interface-art.cjs adventure/tests/polish-ui.cjs adventure/tests/live.test.cjs
node adventure/tests/ui-contract.cjs
node --check adventure/dist/app.js
node --check adventure/dist/animation.js
```

| Suite | Tests | Established |
|---|---:|---|
| `engine.test.js` | 14 | Complete solution, item order, invalid uses, restore, early mast recovery and a fixed pre-translation save. Exactly 172 reachable puzzle states, each with a route to completion. |
| `art-contract.cjs` | 4 | Original painting dimensions/hashes, registered crops and actual character/object/state markup. |
| `interface-art.cjs` | 5 | UI atlas provenance, six crops, local runtime references, material mounting and clipping protected against CSS overrides. |
| `polish-ui.cjs` | 16 | Focus, accessible hints, keyboard inspection, restart, completion/modal race, preferences, dialogue beats/timers/cancellation, stationary speaker, reduced motion, opt-in English device-speech contract, stable picture nodes through conversation, one-time canvas reaction/save restore and approaching a speaker from the nearer side, and keeping George’s node and position while fire/signal scenery changes. |
| `live.test.cjs` | 8 | Physical stride/frame bounds, finite work goals, exact pose freeze, no goal replay, equal body-normalized cadence, persistent image-node identity, twenty story-stage combinations and five PNG hashes/dimensions. |

The separate `ui-contract.cjs` executes real application handlers over a minimal DOM mock through the whole puzzle, including save/reload, blocked storage, focus and cancellation. Its clock is controlled; it does not reproduce a browser renderer. Device speech is stubbed in its test: this checks requested English language/voice, opt-in and stale callback handling, not sound or actual voice availability.

Version-3 saves and puzzle flags remain compatible. Existing Czech journal entries remain in historic saved data; the current interface does not render the journal. New visible labels, responses, accessible names and dialogue are English. No save migration deletes the old text.

## Visual and browser evidence

The reported flickering and illogical movement were traced to repeated SVG replacement, unrelated idle/walk paintings, inconsistent step cadence and automatic round trips. The repair keeps one atlas/image mounted, preserves its pose on pause and moves crew only toward work triggered by puzzle milestones. The individual generated walk sheets were inspected. Each sheet has six distinct painted poses rather than transformed copies of an idle figure. Original PNG bytes, prompts, alpha bounds and common crops are recorded in [WALK_ART](WALK_ART.md). This is not proof of smooth playback: small generated shape/volume differences remain.

The cloud computer inventory became readable, but opening the hosted game failed with `Browser Use could not read requirements`. The movement-repair managed preview attempt again failed with `relay could not open browser port 4173: timed out waiting for relay readiness`, and status was `Sites preview stopped`. No alternative preview infrastructure was installed or substituted.

**Complete game rendering and playback in a real browser remain unverified.** These tests do not establish touch behavior, native focus/modal behavior, screen-reader experience, textured-background contrast, narration quality, actual loading speed or FPS. Actual footage/screenshots of the new game are not claimed. A real browser pass must still cover walking in both directions, all crew conversations, mobile portrait/landscape, a full inventory, saved positions and both reduced-motion controls.

See [implementation](LIVING_WORLD.md), [dialogue provenance](STORIES.md), [QA notes](reviews/22-live-qa.md) and the earlier [interface review](SWARM.md). Earlier review files are snapshots and may report the smaller test count or animation limitations of their own revision.
