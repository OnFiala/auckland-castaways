# Until We Return — First Night

A painted point-and-click adventure inspired by the Grafton castaways. Explore the shore, wreck and camp; combine salvaged objects; prepare shelter, fire and a signal. **This is one playable chapter, not the complete nineteen-month story.**

## Play

Download this repository and open [dist/index.html](dist/index.html). No installation or server is required. Save availability for local files depends on the browser. GitHub displays the HTML source rather than running it.

- Click the ground to walk. Click an object to approach and interact.
- Select an inventory item, then another item to combine them or a place in the scene to use it.
- Click a person to hear a short story. Conversations advance automatically; use the arrow to continue or ×/Escape to end. Walking away also ends a conversation.
- Right-click, Shift+F10 or the context-menu key inspects an object. Escape deselects an item. Space briefly reveals interactive objects.
- The hint button offers a picture clue. Brief reaction captions are optional; conversations remain readable independently.
- Settings offer reduced motion and, where supported, optional English narration using a device voice. Narration is off by default and is not a recorded actor performance.

All current interface text, object descriptions, hints and dialogue are English. Existing version-3 saves remain compatible. Any historic Czech journal entries are retained in save data; this interface does not display that journal.

## A living painted scene

The player and all four companions have six painted walking poses each. Characters keep the same sprite image mounted between steps and while resting; temporary pauses hold the current pose. Walking speed and step cadence share a body-height scale, with gradual starts and stops. Companions change stations after relevant puzzle milestones instead of pacing in repeated loops, and change their stories as shelter, fire and the signal are completed. George is present at camp from the beginning. Subtle sea highlights, distant birds, mist and drifting leaves add movement without changing puzzle targets.

[Living-world implementation](LIVING_WORLD.md) · [walking artwork and provenance](WALK_ART.md) · [fictional dialogue and historical basis](STORIES.md) · [painted interface](VISUAL_DESIGN.md).

The artwork was generated with AI from this project's original character references. It is not an archaeological reconstruction or an authenticated portrait. Precise first-night puzzles and conversations are original fiction. No Machinarium assets, characters, audio or code were used. [Historical research](../research/OVERVIEW.md).

## Verification and remaining work

```sh
node --test adventure/tests/engine.test.js adventure/tests/art-contract.cjs adventure/tests/interface-art.cjs adventure/tests/polish-ui.cjs adventure/tests/live.test.cjs
node adventure/tests/ui-contract.cjs
```

The puzzle checks cover all 172 reachable states, each with a route to completion. See [verification details and current results](TESTING.md) and the [motion-repair review](reviews/23-motion-repair.md).

The renewed cloud preview/browser attempt remains blocked, so complete rendered playback, touch interaction and device narration have not been verified in a real browser. The unchanged generated poses have visible volume, orientation and gait variation; this repair does not claim finished animation quality. Further chapters—winter, the forge, boatbuilding, escape and the return—remain future work.

[Earlier 20-role interface review](SWARM.md) · [original research/story repository](../README.md).
