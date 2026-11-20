# Music during play

The playable score takes the film’s three rising notes, D–F–A, and lets them change with the work. When Alick reaches the shore, a wooden flute plays the notes across two bars. At the forge a low bowed string stretches the intervals. In the final chapter the flute reaches high D, then comes back down to the shore melody. [Film score](story-film/AUDIO.md)

| Chapter | Recording | Arrangement |
|---|---|---|
| The First Night | [Shore](../dist/assets/island-score/shore.mp3) | Widely spaced gut strings under a solitary flute, with a lower answer in the middle. |
| A House Against the Winter | [Hearth](../dist/assets/island-score/hearth.mp3) | A fingerpicked four-note figure and a bowed melody open onto warmer F-major voicings. |
| What Iron Can Become | [Forge](../dist/assets/island-score/forge.mp3) | Low strings mark an uneven working rhythm. Four soft, pitched metal taps enter over twelve bars. |
| Room for Three | [Timbers](../dist/assets/island-score/timbers.mp3) | Interlocking groups of three plucks carry a quicker flute line over the raised planks. |
| Five Days of Ocean | [Crossing](../dist/assets/island-score/crossing.mp3) | A held A and a rocking pair of low plucks leave space between the phrases. |
| The Promise | [Promise](../dist/assets/island-score/promise.mp3) | A climbing bowed phrase passes to the flute, then settles into a steady picking figure. |
| Until We Return | [Homecoming](../dist/assets/island-score/homecoming.mp3) | The opening call returns with fuller voicing and its wider final reach. |

Four short phrases can enter over the chapter harmony. The shelter phrase adds a warm third, the craft phrase answers the picked string with a light metal harmonic, and the horizon phrase opens up a fifth. When the trial drill fails, a quieter bowed F falls to E and hangs there. [Shelter](../dist/assets/island-score/shelter-cue.mp3) · [Craft](../dist/assets/island-score/craft-cue.mp3) · [Horizon](../dist/assets/island-score/horizon-cue.mp3) · [Setback](../dist/assets/island-score/setback-cue.mp3)

## Instruments and mastering

The notes, arrangements, performances and instrument models were made for this game. The gut strings have a moving pluck point and a short wooden-body resonance. The bowed voice has a little grain at the attack, and filtered air accompanies the flute. These timbres are modern interpretations. The renderer generates them directly from harmonics, filters, envelopes and seeded noise. The source includes every note and needs no recording, instrument library or model download. [Project rights](../../RIGHTS.md)

The recordings use 44.1 kHz stereo MP3 at 96 kb/s. A Xing header records encoder delay and padding. The twelve-bar movements wrap their room reflections into the opening and last 38–46 seconds. The master targets −23 LUFS for those movements, −22.5 LUFS for the three positive cadences and −25 LUFS for the setback, before the game applies its playback volume.

The eleven files total 3,732,789 bytes. All seven decoded beds measure −23.0 LUFS and the highest true peak is −8.3 dBTP. Two successive builds with NumPy 2.3.5, SciPy 1.17.0 and FFmpeg 7.1.5 produced identical files.

From the repository root, use Python with NumPy and SciPy and an FFmpeg build with libmp3lame. The command checks the decoded duration, integrated loudness, true peak and boundary discontinuity of every file. Optional movement names render individual parts. [Renderer and score](../tools/render_island_score.py)

```sh
python adventure/tools/render_island_score.py
```
