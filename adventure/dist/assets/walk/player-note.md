# Player walking artwork

The player has six genuinely painted walking poses, generated as a new transparent sprite sheet from the existing sailor character and camp style reference. This is fictional game artwork, not evidence of a historical person's appearance.

- `player.png`: original, unchanged image generator output, RGBA 1536 × 1024.
- Grid: three columns × two rows, each cell 512 × 512; reading order is left contact, left down, left passing, right contact, right down, right passing. Every pose faces right.
- `player.json`: exact frame rectangles, local shared crop, registration anchors, per-cell alpha bounds, file hash, reference hashes and provenance.
- `player-generation.json`: complete prompts for both attempts; attempt two was selected because it better distinguishes opposite leg and arm phases.

Use one common crop for every frame. The suggested local rectangle is `(70, 6, 363, 501)`, with foot anchor `(186, 489)` after cropping. Never fit each pose to its own alpha bounds: that changes apparent size and makes the feet slide. The original sheet keeps all pixels. A full 512 × 512 cell is the strictly lossless crop because near-transparent alpha speckles reach cell edges; the suggested crop includes all pixels with alpha ≥ 16 and 12 pixels of padding.

Whole-sheet inspection confirmed different leg articulation, changing arm swing, empty hands, full boots and caps inside all six cells, and a common visible baseline at local y = 495. The second row changes the front/back arm and leg overlap rather than horizontally mirroring the first. As with any generated animation, subtle volume and costume shifts remain possible; inspect actual playback before calling the cycle polished. A 100 ms frame duration is a starting point, not a measured historical walking cadence.

No pixel retouching, image compositing, procedural pose deformation, or duplicate-frame translation was applied. Image files were produced with `image_gen.imagegen`; Python was used only to inspect dimensions/alpha/hash and write metadata. The first generated attempt is retained in the cloud generation directory but is not shipped.
