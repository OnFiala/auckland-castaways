# English dialogue and living characters

16 November 2026. The motion repair replaces looping patrols and repeated sprite replacement. English storytelling, inventory-puzzle rules and version-3 saves remain compatible.

## Implemented

- Five original six-pose walk sheets: player, Raynal, Musgrave, Henry and George. Each frame is a separate painted pose, rather than a rotation of a standing figure.
- Each character keeps the same atlas image mounted while standing, walking and pausing. Frame changes move the SVG clipping viewport instead of replacing its image. Idle uses a resting frame from that same sheet, avoiding a jump to the differently posed original painting.
- Cadence and travel speed use body-height units for both player and crew: nominal speed 0.55 body heights per second and a six-frame cycle over 0.40 body heights. Routes accelerate and decelerate; the player approaches a person from the nearer side.
- Crew members hold their stations until a puzzle milestone changes their destination. Raynal moves after the canvas is recovered, Musgrave after the crate is opened, and Henry and George after the shelter is built; Henry moves again when the fire is lit. They do not repeatedly pace out and back. Entering a scene from an existing save places them at their current destination rather than replaying an old event.
- Crew movement pauses for conversation, hover/focus, an open modal, the completion panel, reduced motion or a hidden page. A temporary pause preserves the current position and exact frame. Movement waits for the atlas to load; player movement also waits for image decoding when supported. Scene changes rebuild local movement tracks from the puzzle state.
- George can be addressed at camp before the finale. The final camp contains the same five people; companions no longer appear in the other rooms once the group has assembled.
- Twenty short encounters: five voices × four progression stages, each with three brief beats. Dialogue is visible independently of optional action captions and has no branching choices or puzzle rewards. Walking, scene travel, settings or Escape end the current conversation.
- Optional English device speech is opt-in. If a voice is available, the next beat normally waits for speech completion; a timer provides a bounded fallback. No synthesized voices are stored, uploaded or presented as actors' recordings.
- Ambient highlights, mist, small distant birds and leaves sit below interactive layers. Both the operating-system motion preference and the game's reduced-motion setting are respected.
- Interface, hints, descriptions and dialogue are English, including accessible labels and page title. Documentary source notes may remain Czech or in their original language.

Companion buttons live in a persistent `#companions` layer. Fire, fuel and mast changes redraw only their own scenery layer; they cannot reset George’s position or image. Actor layers do not create separate stacking contexts, so feet determine depth relative to the player.

## Files

[animation.js](dist/animation.js) contains persistent sprite framing, shared cadence and destination tracks. [app.js](dist/app.js) selects milestone destinations and integrates movement, speech, cancellation and scene state. [stories.js](dist/stories.js) contains original fictional lines. [actors.css](dist/actors.css) styles full-body poses and unobtrusive conversations; [living.css](dist/living.css) controls environmental movement.

## Validation and limitations

All five source PNGs retain their original bytes and have recorded hashes, prompts, alpha bounds and shared crop geometry. Shared cropping prevents pose-by-pose resizing. Nested SVG viewports explicitly clip each frame and defend against generic SVG CSS rules.

The motion repair and its evidence are recorded in [review 23](reviews/23-motion-repair.md). [TESTING](TESTING.md) records the current automated checks and their scope.

The renewed cloud-browser attempt still failed with `Browser Use could not read requirements`; the managed preview again failed to establish its relay on port 4173. Consequently rendered smoothness, native dialog behavior and speech quality remain unverified. Individual sprite sheets were visually inspected, and the PNGs were not changed in this repair. AI-generated frames still differ in body volume, torso orientation and costume details. The resting frame is a reused walk pose. Registered in-between, turn, reach, mouth and lip-sync animations remain future work; runtime fixes do not establish finished animation quality.
