# Sound for Until We Return

A present-day synthetic narrator reads the original English script across eight reels. In Sydney she describes four months of provisions and the promise to send help. The breakers carry through the landing and give way to wood and fire inside Epigwaitt. On the crossing, the pump has a hollow knock. The domestic sounds return when Henry and George sit down to fish and potatoes. A rising three-note phrase first heard over the harbour resolves in a higher register at the return. Sparse open-string plucks and bowed tones leave room for the words. The voices of the historical crew are unknown.

## Narrator and sources

Kokoro-82M v1.0 by hexgrad produced the speech locally at 24 kHz using a custom blend of its distributed style vectors. The blend is 51% `bf_emma`, 33% `af_heart` and 16% `bf_isabella`, with British English pronunciation. The narrator has no designated human identity or historical counterpart. Pronunciations of personal names are editorial readings. The publisher releases the model weights under Apache 2.0 and describes their use in commercial deployments. The ONNX production tool by thewh1teagle is MIT-licensed. Model weights and training recordings are external production dependencies. [Model card and training credits](https://huggingface.co/hexgrad/Kokoro-82M) · [Style inventory](https://huggingface.co/hexgrad/Kokoro-82M/blob/main/VOICES.md) · [ONNX tool and license](https://github.com/thewh1teagle/kokoro-onnx) · [Apache 2.0](https://www.apache.org/licenses/LICENSE-2.0)

The model publisher credits Koniwa’s `tnc` data under CC BY 3.0 and the SIWIS corpus under CC BY 4.0 among its training materials. The production generated a fresh reading of the game script. The music, sea, rain, shifting spars, canvas, hearth, metal, chart paper and pump were synthesized from oscillators, envelopes and seeded noise. They use no sound-library cues or quotations of existing music. The project’s existing rights terms apply to the original script, arrangement, mixes and production code. [Upstream training attributions](https://huggingface.co/hexgrad/Kokoro-82M#creative-commons-attribution) · [Project rights](../../../RIGHTS.md)

| Production input | Bytes | SHA-256 |
| --- | ---: | --- |
| `kokoro-v1.0.onnx` | 325532387 | `7d5df8ecf7d4b1878015a32686053fd0eebe2bc377234608764cc0ef3636a6c5` |
| `voices-v1.0.bin` | 28214398 | `bca610b8308e8d99f32e6fe4197e7ec01679264efed0cac9140fe9c29f1fbf7d` |

These hashes identify the ONNX export and packed style vectors used here. The model card also lists a separate hash for its original weights. [Versioned production downloads](https://github.com/thewh1teagle/kokoro-onnx/releases/tag/model-files-v1.0)

## Rebuilding the soundtrack

The game and standalone film play from the distributed media files. To edit the sound, use Python 3.12 with NumPy, SciPy, `kokoro-onnx==0.5.0`, `onnx==1.19.1` and ONNX Runtime. The production used ONNX Runtime 1.32.0. Node reads the shipped script. FFmpeg and ffprobe handle loudness metering and muxing. Download the two inputs above into a local production directory. From the repository root, run:

```sh
python adventure/tools/score_story_film.py audio \
    --model-dir /path/to/kokoro-files --work /path/to/audio-work
python adventure/tools/score_story_film.py mux \
    --work /path/to/audio-work --visuals /path/to/silent-chapters
```

Each silent chapter must be a 24 fps H.264 MP4 matching the script duration and named for its reel, for example `prologue.mp4`. The audio stage caches full spoken takes and the network’s token durations. A local copy of the network exposes its existing duration output, with 600 audio samples per timing frame. Those timings drive 75 English caption cues across the 23 narrated passages in edition 20. The shipped WebVTT and the local-file JavaScript caption index come from the same cue list. After an edit to a passage or voice setting, the changed take acquires a new cache key. [English script](../../dist/story-film-script.js) · [Speech, captions and mastering](../../tools/score_story_film.py) · [Music and effects](../../tools/story_film_foley.py)

The centred reading sits above a stereo environment. From edition 20 the middle frequencies of the background recede during a spoken phrase, then ease back into the space between sentences. The low wash at sea continues beneath the voice. A single gain per reel targets −17 LUFS. A four-millisecond look-ahead limiter catches occasional transients at an initial ceiling of −2.4 dBFS. The encoder checks the decoded true peak and lowers the limiter ceiling on a reel if the codec needs more headroom. The soundtrack fades at both boundaries of every reel. The film carries 48 kHz stereo AAC-LC in MP4 and Opus in WebM. Both are made directly from the chapter picture and the same uncompressed mix.

## Edition 20 sound verification

The opening lead makes a small splash when its painted weight meets the water. The high iron and the lower timber knocks coincide with three hammer blows and two mallet strokes. The lantern hinge creaks near each change of direction. The mixer reads the start and end of each insert from the picture edit, so cutting into a different chronological passage keeps its sound in sync. [Picture edit](../../tools/story_film_cut.py) · [Contact sounds and their positions](../../tools/story_film_foley.py)

The new stereo masters run for exactly 248 seconds altogether. All 75 timed captions match the spoken script, English WebVTT files and offline cue table. The shortest caption lasts 1.325 seconds, and each line is at most 42 characters. Across the eight masters, the reading sits 15.3–20.4 dB above the background during active speech, measured as RMS on samples where the dry voice exceeds 0.035 full scale. The prologue’s quarter of an hour and the black and white chess squares were rephrased and recorded again after a band-limited mono intelligibility check.

All eight masters were also encoded independently to the two delivery audio profiles and decoded again. The 16 AAC and Opus recordings measured between −17.11 and −16.95 LUFS. The highest decoded true peak was −1.91 dBTP. The first and last 20 milliseconds were below −59 dBFS RMS on every track.

## Earlier release measurements

For the edition 17 edit, all 16 distributed chapter files were decoded and metered after encoding. Integrated loudness ranged from −17.12 to −16.98 LUFS and the highest true peak was −1.83 dBTP. Every chapter had continuous stereo audio and a quiet fade at each end. The MP4 picture streams matched the approved silent picture streams byte for byte. Three seeks per chapter covered the opening, middle and final seconds in both formats. The WebM container duration included eight milliseconds of Opus timing overhead per reel.

## Playback on devices with limited video support

Edition 18 also includes 448 × 252 painted frames sampled at 8 fps from the finished MP4 reels. Its mono soundtrack is a 22,050 Hz G.711 µ-law encoding of the same English mix. Web Audio plays it at the current film position, including after a pause or an in-place switch from native video. Reduced motion holds one representative frame for each of the 23 editorial shots. Rebuilding all eight reels produced the same 126 WebP sheets and eight audio files byte for byte. [Encoding script](../../tools/make_film_compat.py) · [Playback implementation](../../dist/story-film-compat.js)
