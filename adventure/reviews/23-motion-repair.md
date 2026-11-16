# Motion repair review

16 November 2026. Scope: investigate reported flicker, uneven walking and purposeless crew movement. This records source inspection and changes, not a successful visual playback review.

## Findings

- Each step replaced the SVG/image subtree. Standing and temporary pauses switched from a profile walk sheet to a separate three-quarter painting, creating a silhouette change.
- Cadence used the same percentage-of-scene frame threshold despite different movement speeds. The player's old timing advanced a pose roughly every 68 ms; slow crew routes held poses for roughly half a second or longer.
- Crew walked fixed loops without a corresponding change in their task.
- Atlas inspection found generally consistent common bounds, but visible differences in torso orientation, volume and clothing across frames. Independent recropping would not repair those differences.

## Implemented repair

- Camp companions retain their own DOM layer when fire, fuel or the mast changes. George’s mounted image and position survive these world updates.
- A persistent atlas image serves both movement and rest. Only clipping coordinates change between steps; temporary pauses retain position and frame.
- Player and crew share a nominal speed of 0.55 body heights per second and a six-frame cycle over 0.40 body heights. Travel accelerates and decelerates, and the player approaches people from the nearer side.
- Milestone destinations replace looping patrols. Offsets below are horizontal scene percentage points relative to each character's station.

| Character | Trigger | Destination offset |
|---|---|---:|
| Raynal | Canvas recovered | −6 |
| Musgrave | Crate opened | −7 |
| Henry | Shelter built | −6 |
| Henry | Fire lit | −10 |
| George | Shelter built | −6 |

On scene entry, characters are placed at the destination implied by the current save. A completed event is not replayed as another walk. At the final camp, Raynal and Musgrave use their assembled camp stations.

The English dialogue, inventory puzzles and source PNGs remain unchanged. Current regression evidence is maintained in [TESTING](../TESTING.md).

## Remaining limits

The renewed browser attempt returned `Browser Use could not read requirements`; managed preview again failed to establish its relay on port 4173. Actual rendered smoothness, clipping and walking transitions remain unverified. No claim is made that this runtime repair removes the drawing differences or supplies finished animation. Dedicated rest, turn and registered in-between poses still need an art and playback pass.
