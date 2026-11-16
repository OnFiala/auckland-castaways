# Painted walking poses

Five original AI-generated sprite sheets extend the existing fictional character paintings. Each is a 1536 × 1024 RGBA PNG with six full-body right-facing poses in a 3 × 2 grid of 512-pixel cells. All source pixels are preserved; runtime cropping and mirroring do not modify the original files.

| Character | PNG | Provenance and measurements |
|---|---|---|
| Player | [player.png](dist/assets/walk/player.png) | [player.json](dist/assets/walk/player.json), [generation history](dist/assets/walk/player-generation.json) |
| François Raynal | [raynal.png](dist/assets/walk/raynal.png) | [raynal.json](dist/assets/walk/raynal.json) |
| Thomas Musgrave | [musgrave.png](dist/assets/walk/musgrave.png) | [musgrave.json](dist/assets/walk/musgrave.json) |
| Henry Forgés | [henry.png](dist/assets/walk/henry.png) | [henry.json](dist/assets/walk/henry.json) |
| George Harris | [george.png](dist/assets/walk/george.png) | [george.json](dist/assets/walk/george.json) |

The generation references are this project's own standing characters and environment paintings. No modern game's sprite sheets were copied. Prompts, retry history where applicable, actual image dimensions, alpha bounds, common crop, ground anchor and SHA-256 are recorded alongside each PNG. These are fictional game designs, not historical portraits or surviving illustrations.

Each six-pose cycle varies leg placement, bent knees and arm swing. The shared crop is the union of visible poses plus a safety margin, rather than an independently resized crop for each frame. Very faint alpha fringe exists outside some visible bounds; the documents state their measurement thresholds.

The motion repair leaves all five PNGs unchanged. One atlas image remains mounted per character; stepping updates its clipped viewport. The same sheet supplies the resting pose, so stopping no longer substitutes a separately drawn three-quarter portrait. A temporary pause retains the current frame, and cadence uses the same body-height scale for player and crew.

Inspection found visible changes in torso orientation, body volume and costume details between some poses, especially across the two half-cycles. A common crop cannot correct these drawing differences. The resting frame is an existing walk pose, not a dedicated idle drawing. The renewed browser attempt was blocked, so rendered loop quality remains unverified. A future art pass needs registered in-between and rest poses, with actual playback review; more independent generated poses alone would not establish continuity.

[animation.js](dist/animation.js) supplies the registered frame boxes; tests verify them against source dimensions and original hashes. Source attribution does not grant a new blanket licence to the repository. See [RIGHTS](../RIGHTS.md).
