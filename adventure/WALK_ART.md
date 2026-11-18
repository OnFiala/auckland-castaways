# Painted walking poses

Walking uses the six-pose atlases. In the campaign, a stopped person uses the upright drawing from the working sheet. Reaching and kneeling are brief gestures on that same sheet. The individual walk records list the source dimensions, alpha bounds, crop, ground anchor and SHA-256. [Henry walking, working and standing after a reload](reviews/crew/README.md). [Frame registration](dist/animation.js) · [Working-pose manifest](dist/assets/work-poses/manifest.json) · [Weather and art review](reviews/26-weather-and-art.md)

| Character | PNG | Provenance and measurements |
|---|---|---|
| Player | [player.png](dist/assets/walk/player.png) | [player.json](dist/assets/walk/player.json), [generation history](dist/assets/walk/player-generation.json) |
| François Raynal | [raynal.png](dist/assets/walk/raynal.png) | [raynal.json](dist/assets/walk/raynal.json) |
| Thomas Musgrave | [musgrave.png](dist/assets/walk/musgrave.png) | [musgrave.json](dist/assets/walk/musgrave.json) |
| Henry Forgés | [henry.png](dist/assets/walk/henry.png) | [henry.json](dist/assets/walk/henry.json) |
| George Harris | [george.png](dist/assets/walk/george.png) | [george.json](dist/assets/walk/george.json) |

## Archive from 16 November 2026

Five original AI-generated sprite sheets extended the standing character paintings. Each shipped atlas was an unchanged 1536 × 1024 RGBA PNG with six full-body right-facing poses in a 3 × 2 grid of 512-pixel cells. The project’s own character and environment paintings served as references. No modern game's sprite sheets were copied. Prompts and retry history, where applicable, accompany the atlas files. The resulting fictional figures are visual interpretations of the castaways.

Each six-pose cycle varied leg placement, knee bend and arm swing. One crop covered the union of visible poses plus a safety margin. Inspection found very faint alpha fringe outside some visible bounds, and the recorded bounds specify their measurement thresholds.

The motion repair kept the five PNGs as they were. One atlas image remained mounted per character and stepping updated its clipped viewport. The same sheet supplied the resting pose. A temporary pause retained the current frame, and cadence used the same body-height scale for player and crew.

The archival inspection found changes in torso orientation, body volume and costume details between some poses, especially across the two half-cycles. Those differences stemmed from the drawings. The resting frame came from the walk cycle. A browser attempt was blocked during that pass, as recorded in the review. [Motion-repair review](reviews/23-motion-repair.md)

Source attribution does not grant a new blanket licence to the repository. See [RIGHTS](../RIGHTS.md).
