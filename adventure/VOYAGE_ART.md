# Painted scenes for the full voyage

16 November 2026. Eight original backgrounds and five edited state variants extend the established graphite, ink and gouache direction. Each is an unchanged 1672 × 941 PNG output generated for this project, with a continuous foreground walking lane. Full prompts, original generated filenames, dimensions, byte counts and SHA-256 hashes are in the [scene manifest](dist/assets/voyage/scenes/manifest.json).

| Painting | Intended locations | Composition |
|---|---|---|
| [Cabin](dist/assets/voyage/scenes/cabin.png) | Winter cabin; optionally the reunion interior | Rain at the window, patched roof, hearth on the left, rear table, bunk and barrel; clear plank floor. |
| [Forest](dist/assets/voyage/scenes/forest.png) | Freshwater clearing and charcoal ground | Freshwater seep on the left, empty earth pit on the right, fog beyond the path; continuous earthen lane. |
| [Forge](dist/assets/voyage/scenes/forge.png) | Workshop | Bellows and stone hearth left of centre, striking block to the right, bare rear workbench; clear earth floor. |
| [Slipway](dist/assets/voyage/scenes/slipway.png) | Boat construction | Boat on timber supports in the middle ground, timber stack and workbench behind the lane, cove beyond. |
| [Crossing](dist/assets/voyage/scenes/crossing.png) | Open-boat passage | A deliberately theatrical side view of the boat interior, mast and sail, steering tiller, visible bilge recess and sea beyond. |
| [Harbour](dist/assets/voyage/scenes/harbour.png) | Stewart Island preparations | Rescue vessel behind a wide horizontal wharf; chartroom doorway on the right. Water never occupies the foreground walking lane. |

The reunion uses the same cabin interior as the winter chapter, preserving the continuity of Epigwaitt. The chartroom and return landing have their own paintings. The existing [wreck](dist/assets/wreck.png) remains suitable for salvage. Its original hash and the [shore](dist/assets/beach.png) hash were checked against the [earlier manifest](dist/assets/manifest.json). The [first-night shelter](dist/assets/states/camp-shelter.png) also matches its [state manifest](dist/assets/states/manifest.json), but it depicts a canvas lean-to and does not replace the later timber cabin during the reunion.

## Visible puzzle states

The following edits use the named original image as a reference and retain its camera, framing and walking floor. Their complete edit prompts and parent-image hashes are recorded in the same manifest.

| Variant | Visible change |
|---|---|
| [Cold cabin](dist/assets/voyage/scenes/cabin-cold.png) | Extinguished charcoal and ash in the fireplace; the original cabin has the warming fire. |
| [Cold forge](dist/assets/voyage/scenes/forge-cold.png) | Bellows and support removed, empty inlet visible, charcoal dark. The original forge provides the fitted-bellows state. |
| [Ready boat](dist/assets/voyage/scenes/slipway-ready.png) | Completed upper planking and gunwales, caulked seams, mast and modest rigged sail. |
| [Wet crossing](dist/assets/voyage/scenes/crossing-wet.png) | Sound closed hull, small interior puddle and minor sail tear. This corrects the original crossing painting’s apparent missing hull panel. |
| [Safe crossing](dist/assets/voyage/scenes/crossing-safe.png) | Sound closed hull, dry floor and a visible stitched sail patch. |

The original `crossing.png` is retained as generation provenance, not the recommended unsolved runtime state: its large apparent gap in the hull was visually misleading. The wet/safe variants keep the sea outside the boat.

## Integration anchors

Coordinates are percentages of the complete painting and are visual placement guidance, not geographical measurements. Suggested walking bounds are x6–94, y74–90; the crossing can conservatively restrict x to20–80.

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

These paintings contain fixed scenery. Pickups should be separate painted sprites so that collecting an item removes it. The runtime selects the edited state paintings and adds localized feedback for intermediate puzzle steps. The scenery itself is not an inventory of historical artefacts.

## Provenance and limits

All thirteen scene outputs were generated with `image_gen.imagegen`, saved at their original byte content and individually viewed. No outside photographs, museum artwork or copyrighted modern illustrations were copied. Original generated files remain in the workspace; the repository contains the scene copies and complete generation metadata.

The older campaign forge and harbour were inspected but not reused: their foreground table/water obstructed the intended walking lane. The new paintings were generated with that composition problem explicitly corrected.

The pictures are **dramatic interpretations**, not measured reconstructions of Epigwaitt, the boat, the improvised forge or Stewart Island. Furniture, proportions, foliage, window details and the convenient side-cutaway boat perspective are art decisions. All thirteen scene outputs were inspected as still images; that does not verify their final animation, collision zones or object alignment in a running browser.
