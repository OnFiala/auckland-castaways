# Alick McLaren’s painted walk

Alick’s navy-indigo jacket, ochre neckcloth, grey knit cap and brown work trousers come from his new [full-length cast painting](../sailor.png). A separate ImageGen drawing supplies six right-facing walking poses in the [walking sheet](player.png). This costume and appearance are original visual interpretations for the game.

The six poses occupy two rows of three 512 × 512 cells. Both half-cycles move through contact, weight acceptance and passing, with the near and far limbs exchanging roles. Each painted cel was cropped and resampled into the existing 1536 × 1024 transparent atlas. The rendering code continues to use the cell-relative crop `[70, 6, 363, 501]` and the ground anchor `[256, 495]`. Its cropped anchor is `[186, 489]`.

In the registered PNG the solid sole reaches y = 495 in all six frames. The horizontally measured crown centre varies by two native pixels across the cycle. The measured crown-to-sole heights have a shallow rise and fall. A separate [working sheet](../work-poses/player.png) contains Alick standing, reaching and kneeling.

The [registration record](player.json) gives the native generator SHA-256, finished atlas SHA-256, six source and destination rectangles, the per-frame alpha bounds and the production references. The [prompt record](player-generation.json) contains the complete generation prompt.
