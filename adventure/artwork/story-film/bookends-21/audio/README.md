# Music for the opening and end titles

The overture begins with sheltered water. A low plucked D gives the title time to appear. The bow traces D, F and A as the premise comes into view. The phrase comes to rest on A, leaving the first D of the Sydney wharf scene to finish it. The narrator’s first subtitle enters at 17.360 seconds.

After the last observation about the hearth, a flute answers the opening phrase an octave above the low accompaniment. The bow brings it back down to D. The low string rings out through the last card, then harbour water and the strings fade together. The last 650 milliseconds are silent. The final spoken subtitle ends 20.340 seconds before the feature ends.

Both cues are original compositions and synthesized stereo performances. They reuse the plucked strings, bow, flute and wooden room response developed for the island score. The water is shaped from seeded, filtered noise. [Instrument definitions](../../../../tools/render_island_score.py) · [Composition and mix](../../../../tools/score_film_bookends.py) · [Narration and film score](../../AUDIO.md)

| Lossless master | Duration | Loudness | True peak | SHA-256 |
| --- | ---: | ---: | ---: | --- |
| [Overture](overture.flac) | 16.000 s | −25.0 LUFS | −10.2 dBTP | `ec9225fab100714da6849a0bb5da7ed7fa35b7e94641a6a1c406ec27f0d868de` |
| [Coda](coda.flac) | 18.000 s | −25.5 LUFS | −13.5 dBTP | `2dae06dd1e51e4ebf8964ef14a4b3c45d92811ebd69a6b2fdc8580cda1f82f93` |

## Rebuilding and checking the joins

From the repository root, `python adventure/tools/score_film_bookends.py` renders both 48 kHz, 16-bit stereo masters. `--out` selects a separate output directory. Two independent renders produced identical FLAC files.

The narration and its original mix qualities carry through from the uncompressed edition 20 recordings. To reproduce the corresponding source, render the two mixes with the edition 20 narration and score recipe. The mastering stage applies the gain shown below, converts to 48 kHz and uses its four-millisecond look-ahead limiter. This gives exactly 3,168,000 stereo frames for the prologue and 2,832,000 for the epilogue. Each mastered centre alone re-encoded to the same AAC audio packets as edition 20. [Edition 20 production recipe](https://github.com/OnFiala/auckland-castaways/blob/game-v20/adventure/artwork/story-film/AUDIO.md)

| Narrated section | Pre-limiter gain | SHA-256 of interleaved little-endian stereo float PCM |
| --- | ---: | --- |
| Prologue | −0.120 dB | `23ae05739dce6a183db0b77bc4f88063d7a80a3f5760e8d2e9b9edced947db87` |
| Epilogue | −0.290 dB | `fbc19c755c74f6e33fbea88009531f0f39cf85ee226a40fcc47e2e81c065ead3` |

For the prologue, the FFmpeg filter is `volume=-0.120dB,aresample=48000,alimiter=limit=0.76:attack=4:release=60:level=0:latency=1`. Use the epilogue gain from the table for its master. The overture precedes the 66-second prologue. The coda follows the 59-second epilogue. The greatest sample-to-sample difference at either join was below 0.00000011 on a full-scale amplitude of one. In a separate AAC and Opus encode of both new mixes, the highest decoded true peak was −2.14 dBTP.
