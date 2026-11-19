# Sound for Until We Return

A present-day synthetic narrator reads the original English script across eight reels. The five men leaving the wreck are named against open water. In the house the surf recedes behind dry wood and a small fire. The forge introduces three unequal blows. The pump on the crossing has its own shallow wooden knock. A rising three-note phrase first heard over the harbour resolves in a higher register at the return. Sparse open-string plucks and bowed tones leave room for the words. The voices of the historical crew are unknown.

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

Each silent chapter must be a 24 fps H.264 MP4 matching the script duration and named for its reel, for example `prologue.mp4`. The audio stage caches full spoken takes and the network’s token durations. A local copy of the network exposes its existing duration output, with 600 audio samples per timing frame. Those timings drive 69 caption cues across the 23 shots. The shipped WebVTT and the local-file JavaScript caption index come from the same cue list. After an edit to a shot or voice setting, the changed take acquires a new cache key. [English script](../../dist/story-film-script.js) · [Speech, captions and mastering](../../tools/score_story_film.py) · [Music and effects](../../tools/story_film_foley.py)

The centred reading sits above a stereo environment. A single gain per reel targets −17 LUFS. A four-millisecond look-ahead limiter catches occasional transients at an initial ceiling of −2.4 dBFS. The encoder checks the decoded true peak and lowers the limiter ceiling on a reel if the codec needs more headroom. The soundtrack fades at both boundaries of every reel. The MP4 carries 1152 × 648 H.264 video and 48 kHz stereo AAC-LC. A second version carries 960 × 540 VP9 video and 48 kHz stereo Opus for browsers that lack H.264 support. Both are made directly from the chapter picture and the same uncompressed mix.

## Release measurements

The 16 distributed chapter files were decoded and metered after encoding. Integrated loudness ranges from −17.12 to −16.98 LUFS and the highest true peak is −1.83 dBTP. Every chapter has continuous stereo audio and a quiet fade at each end. The MP4 picture streams match the approved silent picture streams byte for byte. Three seeks per chapter covered the opening, middle and final seconds in both formats. The WebM container duration includes eight milliseconds of Opus timing overhead per reel.
