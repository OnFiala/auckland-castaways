# Painted scenes for the full voyage

## Current scenery and playable states

The seven-chapter route uses painted backgrounds with grounded walking lanes and separate inventory props. Newer scenery uses local light and weather for each place while retaining the existing gameplay landmarks. The charcoal clearing, later salvage shore and August return to Epigwaitt now have their own paintings. The reunion retains the cabin’s recognisable layout. [Weather and art review](reviews/26-weather-and-art.md) · [Scene manifest](dist/assets/voyage/scenes/manifest.json)

| Scene | Visible progression |
|---|---|
| Epigwaitt | [Cold cabin](dist/assets/voyage/scenes/cabin-cold.png) to [warmed cabin](dist/assets/voyage/scenes/cabin.png), with a local change at the hearth. The [return interior](dist/assets/voyage/scenes/return-camp.png) is a later visit. |
| Forge | [Cold furnace](dist/assets/voyage/scenes/forge-cold.png), [bellows fitted](dist/assets/voyage/scenes/forge.png), then [forge lit](dist/assets/voyage/scenes/forge-lit.png). |
| Slipway | [The working boat](dist/assets/voyage/scenes/slipway.png) and [ready boat](dist/assets/voyage/scenes/slipway-ready.png), with local feedback as the sides and seams are worked. |
| Ocean passage | [Torn sail and water in the boat](dist/assets/voyage/scenes/crossing-wet.png), [torn sail with water bailed](dist/assets/voyage/scenes/crossing-bailed.png), then [stitched sail and clear bilge](dist/assets/voyage/scenes/crossing-safe.png). The [neutral crossing image](dist/assets/voyage/scenes/crossing.png) records the base repaint, with an intact sail. |
| Stewart Island, Invercargill and return landing | [Harbour](dist/assets/voyage/scenes/harbour.png), [chart room](dist/assets/voyage/scenes/chartroom.png) and [landing](dist/assets/voyage/scenes/landing.png) distinguish the stages of arranging and making the return voyage. |

Current file dimensions, byte counts, SHA-256 hashes and documented transforms are tracked per file. The manifests distinguish generated material from game-ready versions, including registered local changes and width normalisation where used. Interactive coordinates and walks are defined by the current stage. [Scene manifest](dist/assets/voyage/scenes/manifest.json) · [Chronology variant receipt](dist/assets/voyage/scenes/chronology-variants-receipt.json) · [Current stage geometry](dist/stage-direction.js)

## Archive from 16 November 2026

Eight original backgrounds and five edited state variants extended the earlier graphite, ink and gouache direction. At that checkpoint these scene PNGs were copied from the generated outputs. They were recorded as 1672 × 941 and had a continuous foreground walking lane. The table preserves the earlier staging and image roles. Links point to the corresponding file paths, which now hold the current images.

| Painting | Intended locations | Composition |
|---|---|---|
| [Cabin](dist/assets/voyage/scenes/cabin.png) | Winter cabin; optionally the reunion interior | Rain at the window, patched roof, hearth on the left, rear table, bunk and barrel; clear plank floor. |
| [Forest](dist/assets/voyage/scenes/forest.png) | Freshwater clearing and charcoal ground | Freshwater seep on the left, empty earth pit on the right, fog beyond the path; continuous earthen lane. |
| [Forge](dist/assets/voyage/scenes/forge.png) | Workshop | Bellows and stone hearth left of centre, striking block to the right, bare rear workbench; clear earth floor. |
| [Slipway](dist/assets/voyage/scenes/slipway.png) | Boat construction | Boat on timber supports in the middle ground, timber stack and workbench behind the lane, cove beyond. |
| [Crossing](dist/assets/voyage/scenes/crossing.png) | Open-boat passage | A deliberately theatrical side view of the boat interior, mast and sail, steering tiller, visible bilge recess and sea beyond. |
| [Harbour](dist/assets/voyage/scenes/harbour.png) | Stewart Island preparations | Rescue vessel behind a wide horizontal wharf; chartroom doorway on the right. Water never occupies the foreground walking lane. |

At this checkpoint the reunion reused the winter cabin, charcoal work reused the forest, and salvage reused the first wreck painting. The chart room and landing each had their own image. The original wreck, shore and first-night canvas shelter were checked against their manifests. The first-night shelter and the later timber cabin represented different stages of the castaways’ accommodation. [First-chapter manifest](dist/assets/manifest.json) · [State manifest](dist/assets/states/manifest.json)

### Visible puzzle states in the archive

The following edits used the named original image as a reference and retained its camera, framing and walking floor. The editing prompts and parent-image hashes belong to those revisions.

| Variant | Visible change |
|---|---|
| [Cold cabin](dist/assets/voyage/scenes/cabin-cold.png) | Extinguished charcoal and ash in the fireplace; the original cabin has the warming fire. |
| [Cold forge](dist/assets/voyage/scenes/forge-cold.png) | Bellows and support removed, empty inlet visible, charcoal dark. The original forge provides the fitted-bellows state. |
| [Ready boat](dist/assets/voyage/scenes/slipway-ready.png) | Completed upper planking and gunwales, caulked seams, mast and modest rigged sail. |
| [Wet crossing](dist/assets/voyage/scenes/crossing-wet.png) | Sound closed hull, small interior puddle and minor sail tear. This corrects the original crossing painting’s apparent missing hull panel. |
| [Safe crossing](dist/assets/voyage/scenes/crossing-safe.png) | Sound closed hull, dry floor and a visible stitched sail patch. |

The first `crossing.png` included an apparent hull opening. Its wet and safe descendants closed the hull silhouette for gameplay.

### Approximate staging coordinates recorded at the time

Coordinates are percentages of the complete painting. The early notes suggested walking bounds of x6–94 and y74–90, with x20–80 for the crossing.

| Painting | Useful middle-ground anchors (x, y) |
|---|---|
| Cabin | Roof (50,28); stove (10,60); table (38,55) |
| Forest | Freshwater seep (22,58); charcoal pit (78,60) |
| Forge | Hearth (40,50); anvil (65,52); bellows (20,48) |
| Slipway | Boat (62,52); planking/seams (60,55) |
| Crossing | Rigging (45,34); bilge (66,70); sail (74,21); horizon (12,38) |
| Harbour | Rescue cutter (34,58); building door (85,48) |
| Chartroom | Chart table (50,47); door (93,47) |
| Landing | Rowing boat (40,55); marker post (77,48) |

Fixed scenery and independent pickup sprites let the game remove collected objects while keeping the surroundings visible. The runtime also uses local feedback for intermediate puzzle steps.

## Provenance and limits

The thirteen scene outputs recorded on 16 November were generated with `image_gen.imagegen` and each was viewed as a still. The project used its own generated scene references. No outside photographs, museum artwork or copyrighted modern illustrations were copied. The current manifest records the later changes and any new derivatives.

In the earlier `campaign/` backgrounds, the forge table and harbour water occupied part of the walking lane. The November 16 redesign put them beyond the walking lane.

The pictures are **dramatic interpretations**. Furniture, proportions, foliage, window details and the side-cutaway boat perspective are artistic decisions. In-game movement and alignment are assessed separately from inspection of the still images. [Historical boundaries](HISTORICAL_ADAPTATION.md) · [Weather and art review](reviews/26-weather-and-art.md)
