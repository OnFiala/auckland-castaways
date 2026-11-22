# Full-campaign verification

The campaign extends the existing point-and-click chapter through winter, the forge, boatbuilding, the crossing, Stewart Island and the return for Henry and George. It retains the original first-night engine as a separately testable module.

## Edition 20 · The castaways on film

Chromium played the eight H.264 reels with sound from the extracted offline game. The 66-second opening reached the landing by daylight, then returned control on the shore. The rescue led to the 59-second epilogue and the witness table. A second pass opened all eight WebM files. With reduced motion selected, Chromium and WebKit held the wharf painting until the first cut, then showed the next shot while the narration continued. [In-game landing at daybreak](reviews/release-20/landfall-in-game.png) · [Browser playback test](tests/browser/hosted_film_pass.py)

Across the 248-second cut we compared 1,984 picture samples from the game’s MP4s, the standalone film, the WebM edition and the painted-frame player. The MP4 samples matched the standalone film pixel for pixel. Local motion checks covered the sounding lead, hanging lantern, forge hammer and boat fastening, with a stationary part of the painting as a reference in each shot. The English soundtrack fits all 75 subtitles. [Moving excerpt and picture notes](reviews/release-20/README.md) · [Sound and speech measurements](artwork/story-film/AUDIO.md)

The published tag `game-v20` points to `712eabeef80f0e03044a0eb8ab93394e7891afc8`. All six release assets were downloaded anonymously. The MP4 (31,922,330 bytes) and game ZIP (125,775,202 bytes) matched the tested originals and the published SHA-256 checksums. A separate signed-out browser opened the public release and its moving excerpt. At the time of this check, the separate hosted game’s manifest still identified edition 19. [Verified downloads](https://github.com/OnFiala/auckland-castaways/releases/tag/game-v20) · [Release checks](https://github.com/OnFiala/auckland-castaways/actions/runs/45058047483) · [Frame from the public excerpt](reviews/release-20/forge-in-browser.jpg)

## Edition 19 · Music and the painted journal

Chromium and WebKit played the hosted distribution from its exact release files. In a saved camp with dry kindling ready, using the tinderbox lit the hearth and produced a separate audible musical phrase. A passive Web Audio analyser measured both the chapter music and the new phrase after the game applied its volume. During the following line of dialogue, the music settled at 38% of its exploring level. Ending the conversation restored the level. Moving **Music volume** to **Off** produced zero output in both engines. The regression suite also covers film replay, blocked autoplay, delayed downloads, old saves and changes of chapter. [Score tests](tests/island-score.test.cjs) · [Recordings and mastering](artwork/ISLAND_SCORE.md)

The extracted ZIP was played through all seven chapters in Chromium. The desktop, touch and keyboard paths, a saved inventory combination and recovery from a missing painting were also exercised. In the public game, the first shore displayed all three labelled objectives and the volume setting opened at 65%. Header checks ran from 320 to 1280 pixels, including a saved game with one completed objective. [Header screenshots at playing size](UI_ART.md)

An anonymous download of the public ZIP matched the tested archive. Both contained 144,701,761 bytes and had SHA-256 `e1feab4e07973b65b2b38f50a20f20d9b7d466c490b1065d8ded2a36ddf34400`. The release checks passed for the complete voyage, the standalone film and hosted film playback in Chromium and WebKit. [Edition 19 downloads](https://github.com/OnFiala/auckland-castaways/releases/tag/game-v19) · [Completed release checks](https://github.com/OnFiala/auckland-castaways/actions/runs/44794989147)

## Edition 18 · The journey from the first frame

The opening starts before the shore painting finishes loading. Each chapter film hands control back to someone present in the room. The ending follows boarding the rescue boat. A separate film bookmark records the reel and time. An older save with a tool already picked up resumes in its room. An untouched first shore can receive the opening. The optional journal plays an unlocked reel with one click. [Campaign integration](dist/app.js) · [Story and save regressions](tests/story-film.test.cjs)

On the previous edition, selecting a journal film opened a second cover. A stalled video request could leave an unchanged painting on screen indefinitely. The hosted site returned full HTTP 200 files even for two different byte ranges. Chrome could decode those same full files in a control run. Playback checks now sample pixels inside the artwork and measure the soundtrack while exercising full responses, interrupted transport, sound permissions and a restored bookmark in Chromium and WebKit. [Browser regression](tests/browser/hosted_film_pass.py)

When native video is unavailable, the alternative uses 1,984 frames from the original edit and a mono copy of its soundtrack. Reduced motion holds one representative frame per shot and keeps the original timing. The build verifies all 134 supporting files. Controls were exercised at desktop, portrait and landscape sizes, including a 320-pixel-wide phone layout. [Reproducible image and sound conversion](tools/make_film_compat.py) · [Release verification](tools/verify_web.py)

Two clean builds produced the same 140,819,577-byte ZIP with SHA-256 `56392289ff25cc74e7f5d8f92bbcbbe0090129f7b07981f46af5f852aaeec5e4`. The opening moved before the first input in desktop Chrome 158 and WebKit 26.0. Reloading during the prologue resumed near the saved time in each engine. The complete offline route reached the eight work surfaces, rescue and archive. Separate real-time checks followed all 66 seconds of the opening and all 59 seconds of the epilogue through their natural handoffs. The source suite passed 224 tests. [Opening screenshots and chapter handoffs](reviews/release-18/README.md)

The production service returned the same manifest and all 332 game files as the tested ZIP. Playback controls and decoding were exercised in browser profiles using those exact packaged bytes and the hosting service’s full-response delivery behavior. The owner’s signed-in browser session was unavailable for direct observation. The deployment retains all 195 versioned file paths used by edition 17. Tabs still running editions 13–16 can reload at the same address and the game will read the existing browser save.

GitHub release `game-v18` points to `0e98496bf017ef70149267d87f42e0e765da6c9d`. After publication an anonymous client downloaded and verified all six assets. The standalone MP4 decoded all 5,952 frames, eight chapters and 69 English subtitle cues. [Release and downloads](https://github.com/OnFiala/auckland-castaways/releases/tag/game-v18) · [Checksums](https://github.com/OnFiala/auckland-castaways/releases/download/game-v18/SHA256SUMS.txt) · [Completed release checks](https://github.com/OnFiala/auckland-castaways/actions/runs/44608134683)

## Playable edition 17, 19 November 2026

The seven playable chapters now share a 66-second prologue, six short interludes and a 59-second epilogue. The film brings Alick to the playable shore, then returns to the characters when the player has finished the work of each chapter. An existing save enters its current room. The compass opens the films the player has reached. [Illustrated edition notes](reviews/release-17/README.md) · [Shot-by-shot historical notes](artwork/story-film/HISTORY.md)

Two independent builds from commit `13bf293aea3ea2a6f13898d0dd01a4e41f3e6ec8` produced the same 109,223,414-byte ZIP. The archive contains both H.264/AAC and VP9/Opus versions of the eight reels. All sixteen files decoded, all eight H.264 video streams matched the final painted cut before sound was added, and all 69 English captions fell within their shots. The source suite passed 219 tests. [Audio and caption measurements](artwork/story-film/AUDIO.md) · [Film player tests](tests/story-film.test.cjs)

In Chrome, the prologue started from a player click and ran for 66 seconds to its native end. Its last frame dissolved into an interactive shore. The offline campaign reached the return and the 59-second final reel. A second browser that used WebM played every reel with sound. The touch-sized session played moving pictures and turned the six opening stills by hand. Reopening saves from versions 3 and 4 preserved the player's progress. Test sessions also removed the preferred video, then both video formats, and continued into play. The animated campaign sampled six walking phases per chapter. [Film and controls](https://github.com/OnFiala/auckland-castaways/actions/runs/44583330196/job/135770718359) · [Animated route](https://github.com/OnFiala/auckland-castaways/actions/runs/44583330196/job/135770718293) · [Lighting and materials](https://github.com/OnFiala/auckland-castaways/actions/runs/44583330196/job/135770718298) · [Offline campaign](https://github.com/OnFiala/auckland-castaways/actions/runs/44583330196/job/135769512429)

After publication, an anonymous download reproduced all six release assets. The standalone MP4 decoded all 5,952 frames at 1152 × 648 and 24 fps. It contains English stereo audio, eight named chapters and 69 switchable English captions. The public ZIP matched the two independent builds and the corresponding 197 files of the hosted edition. [Published files](https://github.com/OnFiala/auckland-castaways/releases/tag/game-v17) · [Release checksums](https://github.com/OnFiala/auckland-castaways/releases/download/game-v17/SHA256SUMS.txt)

## Playable edition 16, 19 November 2026

Two fresh offline Chromium profiles played the extracted release through all seven chapters, the eight work surfaces, the rescue and the witness table. One used reduced motion. The other sampled walking phases in every chapter with animation running. The release also passed the keyboard, mouse, touch-emulation, saved-game and missing-painting recovery checks. All 212 source tests passed, together with the standalone first-night walkthrough, three light-bake checks and two archive tests. [Offline campaign and input checks](https://github.com/OnFiala/auckland-castaways/actions/runs/44516067022/job/135532263916) · [Full animated voyage](https://github.com/OnFiala/auckland-castaways/actions/runs/44516067022/job/135533158757)

The browser switched between Original painting and Cinematic at five matching game states. Screen positions matched exactly. With reduced motion enabled, repeated captures in all five scenes were pixel-identical. A real ground click brought the player onto the wet sand. Four-sample MSAA resolved the wet edge, and the area under the boots changed by an average of 19.8 RGB levels on the eight-bit scale. Inspecting the tin pan revealed the wet seam, the emulated 390 × 844 phone picked up the rope and a separate session picked it up during WebGL context loss and recovered live lighting. Rendering was checked on SwiftShader. The isolated shader test also checked native TAA, TAAU, FXAA and the cleared frame during a room change. [Shader and scene checks](https://github.com/OnFiala/auckland-castaways/actions/runs/44516067022/job/135533158753) · [Paired game captures](reviews/release-16/svetlo-a-odraz.webp) · [Czech edition notes and checksum](reviews/release-16/README.md)

A separate hands-on pass opened the extracted release in shared Chrome. Its Settings panel reported the still-light fallback. On the shore, a click on the painted coil took Alick to the rope. The pole and rope combined, the loop freed the sail and the inventory carried the canvas into the wreck. Alick crossed the wreck scene to the pulley and stood up after working. The owner-only hosted address showed its sign-in screen in this browser. [Wreck during the hands-on pass](reviews/release-16/vrak-rucni-pruchod.jpg)

A separate same-origin upgrade began with the verified edition 15 ZIP. The player enabled Reduce motion, collected the rope and pole and tied them together. After the host switched to edition 16, reloading the same URL restored the looped pole and the motion preference. Both loose items stayed collected. The old tool then freed the sail and put the canvas in the satchel. This migration used HTTP on the local test host.

## Playable edition 15, 18 November 2026

Two fresh offline Chromium sessions finished the seven chapters, eight work surfaces, rescue and archival epilogue using the release ZIP. The ordinary-motion route lit the landing lantern and met Henry and George before recovering the provisions. At the moored boat the captain acknowledged their work. Once the supplies arrived, George and Musgrave had their boarding exchange. The browser sampled six visible walking phases in each chapter, with Alick in I–V and Musgrave in VI–VII. [Full animated route](https://github.com/OnFiala/auckland-castaways/actions/runs/44374680869/job/135051556826) · [Before the provisions](reviews/release-15/zasoby.webp) · [Boarding conversation](reviews/release-15/nalodeni.webp)

The first-shore keyboard run collected the rope and the pole, combined them and confirmed focus after reloading. Additional mouse and emulated-touch sessions tested the shore and wreck. The failed-artwork test restored the wreck plate and retried entry. These browser tests exercised the downloadable files. The signed-in private tab and a physical phone were unavailable. All 192 source tests, the standalone first-night walkthrough and the packaging regression passed. [Input and recovery run](https://github.com/OnFiala/auckland-castaways/actions/runs/44374680869/job/135050532709) · [Keyboard screenshot](reviews/release-15/klavesnice.webp) · [Release notes and checksum](reviews/release-15/README.md)

## Playable edition 14, 18 November 2026

All 183 source tests passed, together with the separate first-night walkthrough and the packaging regression. The release ZIP contains 145 hashed game files, its manifest and the player guide. The hosted package also preserves 143 prior resource URLs for previously opened sessions.

A fresh offline Chromium profile completed all seven chapters, the eight work surfaces, the rescue and the witness table using the public ZIP. The browser confirmed save restoration on reload. Separate mouse and touch-emulation sessions checked four painted shore targets, Alick's walk and the wreck's pulley. Another session removed the wreck painting from a disposable copy, stayed ashore, restored the file and entered the wreck on retry. [Browser QA](https://github.com/OnFiala/auckland-castaways/actions/runs/44371517887/job/135039255644) · [Screenshots from the chapters](reviews/release-14/prubeh.webp) · [Crossing deck before and after](reviews/release-14/preplavba.webp)

A second full voyage used ordinary motion. Visible gait phases and foot positions were sampled from the painted actor at runtime. The browser recorded Alick in chapters I–V and Musgrave in VI–VII, including the captain's conversation at the return camp. The two walking screenshots bracket actual movement at the slipway and the landing. [Animated voyage](https://github.com/OnFiala/auckland-castaways/actions/runs/44371517887/job/135040118782)

## The five castaways, 18 November 2026

All 153 source checks passed. The compact web edition passed 55 checks with no skips. Both copies also reached the separate first-night ending. The campaign walkthrough used the production event handlers for all seven chapters, 71 inventory, travel and passage actions, eight work surfaces and the rescue. Restoring a save during a puzzle, the change of protagonist and closing a conversation during optional spoken narration were exercised. The nature and timing of human choices still call for a player session. [Dialogue and entrances](tests/conversation-ui.test.cjs) · [Boatbuilder handoffs](tests/plank-company.test.cjs) · [Campaign handlers](tests/voyage-ui.cjs)

The web edition holds 144 files totalling 31,758,501 bytes before transfer compression. Its 103 WebP images include 79 files copied byte for byte and 24 converted PNGs whose colour, dimensions and alpha were checked. The two local webfonts, their licence and the single roof-drip recording matched their source bytes. The open boat keeps the same sea and sky while the bilge dries and the sail is mended.

Thirty walk drawings, fifteen working poses and the separate seated Raynal were verified against their source sheets. The 390 px and 1,152 px opening compositions distinguish both faces and leave a 9 px and 25 px gap respectively between Alick’s head and the sail. Native Canvas playback sampled 44 regions in 11 states for 64 frames each, including three states of the open boat. All 26 solid samples stayed fixed. The managed preview timed out opening port 4173 and reported that it was stopped. The image comparisons use the game layers and text metrics. This release still needs a visual playthrough on a real browser and phone. [Staging comparisons](reviews/company/README.md) · [Weather measurements](reviews/tide/watch/README.md) · [Material contact](reviews/tactile/README.md)

## Fixed scenery and the incoming tide, 18 November 2026

All 133 source tests passed, with zero skips. The stand-alone first-night walkthrough reached its ending. The compiled WebP edition passed 44 further checks against the same handlers for the seven chapters, work surfaces, archive, weather and foreground. Its 116 runtime files occupied 29,154,201 bytes before transfer compression. All 55 source WebPs and the recorded water-drop sound matched the delivery bytes. The other 24 images were converted from PNG with the packager’s geometry, alpha and colour checks.

At 1,000 pixels of stage width the native Canvas check measured 2,031 stationary pixels in ten samples over 64 frames. It also isolated visible moving water, foam and foliage. A separate set of 32 phases verified the new tidal edge beside the rescue skiff and the steady profile of the wood, shingle and rocks. The fourteen optional gestures were checked against the walkable ground, hand positions and crew button areas. [Motion measurements](reviews/tide/README.md) · [Stage and reach](reviews/tide/registration.md) · [Release notes](reviews/28-priboj-a-pevna-zem.md)

The managed Sites preview timed out opening port 4173. The frame evidence above comes from the production renderers running on native Canvas. Desktop and touch playback in a live browser remain unverified for this release.

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
