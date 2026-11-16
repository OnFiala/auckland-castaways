# English dialogue and living characters

16 November 2026. This iteration adds movement and personal storytelling to the first chapter while preserving its inventory-puzzle rules and version-3 saves.

## Implemented

- Five original six-pose walk sheets: player, Raynal, Musgrave, Henry and George. Each frame is a separate painted pose, rather than a rotation of a standing figure.
- Player frames follow distance travelled. Direction uses a mirrored right-facing cycle; idle uses the existing full-body painting. Short crew routes have independent initial delays, pauses and returns.
- Crew movement stops for conversation, hover/focus, an open modal, the completion panel, reduced motion or a hidden page. Patrols wait for their sheet to load. Scene changes reset local movement tracks.
- George can be addressed at camp before the finale. The final camp contains the same five people; companions no longer appear in the other rooms once the group has assembled.
- Twenty short encounters: five voices × four progression stages, each with three brief beats. Dialogue is visible independently of optional action captions and has no branching choices or puzzle rewards. Walking, scene travel, settings or Escape end the current conversation.
- Optional English device speech is opt-in. If a voice is available, the next beat normally waits for speech completion; a timer provides a bounded fallback. No synthesized voices are stored, uploaded or presented as actors' recordings.
- Ambient highlights, mist, small distant birds and leaves sit below interactive layers. Both the operating-system motion preference and the game's reduced-motion setting are respected.
- Interface, hints, descriptions and dialogue are English, including accessible labels and page title. Documentary source notes may remain Czech or in their original language.

## Files

[animation.js](dist/animation.js) contains frame geometry and deterministic patrols. [app.js](dist/app.js) integrates movement, speech, cancellation and scene state. [stories.js](dist/stories.js) contains original fictional lines. [actors.css](dist/actors.css) styles full-body poses and unobtrusive conversations; [living.css](dist/living.css) controls environmental movement.

## Validation and limitations

All five source PNGs retain their original bytes and have recorded hashes, prompts, alpha bounds and shared crop geometry. Shared cropping prevents pose-by-pose resizing. Nested SVG viewports explicitly clip each frame and defend against generic SVG CSS rules.

The automated checks cover six frame selections, bounds, asset hashes, patrol freeze/resume/reset, story stages, conversation timers, cancellation, old saves and the complete puzzle. [TESTING](TESTING.md) records their scope.

An inventory of the cloud browser became readable, but opening the game still failed with `Browser Use could not read requirements`. The managed preview also timed out waiting for its relay on port 4173. Consequently no actual full-game playback, frame smoothness, native dialog behavior or speech quality is claimed. Individual sprite sheets were visually inspected. AI-generated poses show small differences in volume, costume details and gait. Dedicated turn, reach, mouth and lip-sync animations remain future work.
