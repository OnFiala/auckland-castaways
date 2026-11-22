#!/usr/bin/env python3
"""Render spoken English, an original stereo score and closed captions for the painted reels."""
import argparse
import hashlib
import json
import re
import subprocess
import tempfile
from pathlib import Path

import numpy as np
from scipy import signal
from scipy.io import wavfile

HERE = Path(__file__).resolve().parents[1]
RATE = 24000
MODEL_HASH = '7d5df8ecf7d4b1878015a32686053fd0eebe2bc377234608764cc0ef3636a6c5'
VOICES_HASH = 'bca610b8308e8d99f32e6fe4197e7ec01679264efed0cac9140fe9c29f1fbf7d'

# Each new cue starts on these words. The full spoken/captioned text stays in the script.
CUTS = {
    'outfit': ['If the Grafton', 'friends would', 'Five men sailed'],
    'hearth-remains': ['A few ribs', 'On shore,'],
    'schooner': ['On New Year’s Day', 'Twenty fathoms'],
    'wreck': ['Each swell', 'At midnight'],
    'cabin-table': ['The men abandoned', 'A quarter of an hour later'],
    'shore-dawn': ['Thomas Musgrave', 'Alick McLaren', 'Their boat'],
    'beach': ['He walked', 'from the beach'],
    'camp-shelter': ['Wind still', 'so the men'],
    'cabin': ['Raynal carved', 'He used soot'],
    'forge-cold': ['They made', 'They would'],
    'forge-lit': ['The keel', 'All the steel'],
    'slipway': ['It still', 'They turned', 'the Grafton’s'],
    'slipway-ready': ['On trial', 'Three could', 'Henry and George'],
    'crossing-wet': ['left Camp Cove', 'Within twenty'],
    'crossing-bailed': ['Musgrave pumped', 'Nearly half'],
    'harbour': ['Captain Cross', 'Next morning'],
    'chartroom': ['By the second', 'with blankets'],
    'landing': ['Under shortened', 'Captain Cross and Musgrave', 'The house'],
    'return-camp': ['Cross and Musgrave', 'The cutter', 'It was too'],
    'ending': ['Bread and butter', 'After nearly'],
    'invercauld-wreck': ['Captain Dalgarno', 'Of twenty-five'],
    'skin-boat': ['Smith wrote', 'two men crossed'],
    'julian': ['Only George', 'survived to sail'],
}
# Pronunciations for the narrator's English reading. No surviving voice recording is presumed.
NAME_SOUNDS = {
    'François': 'fɹanswˈɑː', 'Raynal': 'ɹɛnˈɑːl', 'Forgés': 'fɔːʒˈɛs',
    'Invercauld': 'ˌɪnvəkˈɔːld', 'Invercargill': 'ˌɪnvəkˈɑːɡɪl',
    'Macpherson': 'məkfˈɜːsən', 'McLaren': 'məklˈaɹən',
}
STYLE = {'bf_emma': .51, 'af_heart': .33, 'bf_isabella': .16}


def shell(*args, **kwargs):
    return subprocess.run([str(a) for a in args], check=True, **kwargs)


def read_timeline():
    source = HERE / 'dist/story-film-script.js'
    result = shell('node', '-e', 'console.log(JSON.stringify(require(process.argv[1]).timeline))',
                   source, capture_output=True, text=True)
    return json.loads(result.stdout)


def cue_text(shot):
    line = shot['line']
    cuts = [line.index(key) for key in CUTS[shot['plate']]]
    assert cuts == sorted(cuts)
    boundaries = [0, *cuts, len(line)]
    return [line[left:right].strip() for left, right in zip(boundaries, boundaries[1:])]


class Narrator:
    def __init__(self, directory, cache):
        import onnx
        import onnxruntime as ort
        from kokoro_onnx import Kokoro

        model = directory / 'kokoro-v1.0.onnx'
        voices = directory / 'voices-v1.0.bin'
        for path, expected in [(model, MODEL_HASH), (voices, VOICES_HASH)]:
            with path.open('rb') as f:
                if hashlib.file_digest(f, 'sha256').hexdigest() != expected:
                    raise ValueError(f'Unexpected weight file: {path}')
        # Read the duration already predicted for each token; the waveform calculation is identical.
        aligned = cache / f'aligned-{MODEL_HASH[:12]}.onnx'
        if not aligned.exists():
            graph = onnx.load(str(model))
            graph.graph.output.append(onnx.helper.make_tensor_value_info(
                '/encoder/Gather_output_0', onnx.TensorProto.INT64, [None]))
            onnx.save(graph, str(aligned))
        opts = ort.SessionOptions()
        opts.inter_op_num_threads = 1
        opts.intra_op_num_threads = 2
        ort.disable_telemetry_events()
        self.session = ort.InferenceSession(str(aligned), opts, providers=['CPUExecutionProvider'])
        self.engine = Kokoro.from_session(self.session, str(voices))
        self.style = sum(weight * self.engine.get_voice_style(name) for name, weight in STYLE.items())
        self.names = {self.engine.tokenizer.phonemize(word, 'en-gb'): ipa for word, ipa in NAME_SOUNDS.items()}

    def render(self, chunks, speed):
        tokens = [0]
        offsets = []
        space = self.engine.tokenizer.tokenize(' ')
        for chunk in chunks:
            if offsets:
                tokens.extend(space)
            offsets.append(len(tokens))
            ipa = self.engine.tokenizer.phonemize(chunk.replace('’', "'"), 'en-gb')
            for original, preferred in self.names.items():
                ipa = ipa.replace(original, preferred)
            tokens.extend(self.engine.tokenizer.tokenize(ipa))
        style = self.style[len(tokens) - 1]
        tokens.append(0)
        samples, lengths = self.session.run(None, {
            'tokens': np.array([tokens], dtype=np.int64), 'style': style,
            'speed': np.array([speed], dtype=np.float32)})
        assert len(samples) == sum(lengths) * 600  # 25 ms per predicted duration frame
        activity = np.flatnonzero(abs(samples) > .004)
        left = max(0, activity[0] - round(.06 * RATE))
        right = min(len(samples), activity[-1] + round(.10 * RATE))
        onsets = np.cumsum([0, *lengths]) * 600
        starts = [max(0, (onsets[i] - left) / RATE) for i in offsets]
        starts[0] = 0.
        return samples[left:right], starts


def render_voice(voice, shot, chunks):
    seconds = shot['seconds']
    # Leave room for the setting to register before the first word, and for the last word to decay.
    target = seconds - .98
    closing = shot['plate'] == 'hearth-remains'
    speed = .87 if closing else .94
    samples, starts = voice.render(chunks, speed)
    for _ in range(3):
        duration = len(samples) / RATE
        if duration <= target:
            break
        speed *= duration / target * 1.015
        if speed > 1.20:
            raise ValueError(f"Review narration density at {shot['plate']}: {speed:.2f}")
        samples, starts = voice.render(chunks, speed)
    if closing:
        # Give the last observation a breath at its actual sentence boundary. Retain the
        # room tone at the tail even if a future reading runs longer than this one.
        boundary_index = next((i for i in reversed(range(1, len(chunks)))
                               if chunks[i-1].endswith(('.', '?', '!'))), None)
        pause = min(.86, max(0, seconds - len(samples) / RATE - 2.35))
        if boundary_index is not None and pause > .1:
            boundary = round(starts[boundary_index] * RATE)
            candidates = range(max(120, boundary - int(.28 * RATE)), boundary - int(.012 * RATE),
                               int(.005 * RATE))
            cut = min(candidates, key=lambda i: np.mean(samples[i - 60:i + 60] ** 2))
            samples = np.concatenate([samples[:cut], np.zeros(round(pause * RATE)), samples[cut:]])
            starts = [t + (pause if i >= boundary_index else 0) for i, t in enumerate(starts)]
    duration = len(samples) / RATE
    if duration > target:
        raise ValueError(f"Voice exceeds shot at {shot['plate']}")
    delay = min(1.36, max(.64, (seconds - duration) * .40))
    if closing:
        delay = min(1.5, max(.50, seconds - duration - 1.55))
    # Equalize the close-miked reading gently before mixing all sound into the same acoustic space.
    samples = signal.sosfilt(signal.butter(2, 65, 'highpass', fs=RATE, output='sos'), samples)
    active = samples[np.abs(samples) > .017]
    samples *= .132 / np.sqrt(np.mean(active**2))
    edge = int(.01 * RATE)
    samples[:edge] *= np.linspace(0, 1, edge)
    samples[-edge:] *= np.linspace(1, 0, edge)
    result = np.zeros(round(seconds * RATE), dtype=np.float32)
    t = round(delay * RATE)
    result[t:t + len(samples)] = samples
    ends = starts[1:] + [duration + min(.23, seconds - duration - delay - .02)]
    cues = [(round(delay + a, 3), round(delay + b, 3), s)
            for a, b, s in zip(starts, ends, chunks)]
    return result, cues


def caption_lines(text):
    """Keep short cues on one line; use phrase boundaries for two-line cues."""
    words = text.split()
    text = ' '.join(words)
    if len(text) <= 40:
        return text
    weak_endings = {'the', 'a', 'and', 'of', 'to', 'for', 'from', 'with', 'in', 'at', 'by', 'an'}
    breaks = []
    for i in range(1, len(words)):
        left, right = ' '.join(words[:i]), ' '.join(words[i:])
        if max(len(left), len(right)) > 42:
            continue
        score = abs(len(left) - len(right))
        if words[i-1].lower() in weak_endings:
            score += 26
        if words[i-1][-1] in '.,!?':
            score -= 18
        if words[i-1][:1].isupper() and words[i][:1].isupper():
            score += 30
        breaks.append((score, left, right))
    if not breaks:
        raise ValueError(f'Cut this caption into shorter phrases: {text}')
    _, left, right = min(breaks)
    return left + '\n' + right


def notation(seconds):
    ms = round(seconds * 1000)
    return f'{ms // 3600000:02d}:{ms // 60000 % 60:02d}:{ms // 1000 % 60:02d}.{ms % 1000:03d}'


def write_cues(path, cues):
    lines = ['WEBVTT', '']
    for start, end, words in cues:
        lines.extend([f'{notation(start)} --> {notation(end)}', words, ''])
    path.write_text('\n'.join(lines) + '\n')


def audio_cache(shot, work):
    key = json.dumps([shot, cue_text(shot), NAME_SOUNDS, STYLE, 'closing-3' if shot['plate'] == 'hearth-remains' else 'reading-1'], ensure_ascii=False)
    tag = hashlib.sha256(key.encode()).hexdigest()[:14]
    return work / f"{shot['plate']}-{tag}.npz"


def build_audio(timeline, args, out):
    from story_film_foley import chapter_bed, mix_narration

    narrator = None
    all_cues = {}
    for ci, chapter in enumerate(timeline):
        speech, cues = [], []
        cursor = 0
        for shot in chapter['shots']:
            path = audio_cache(shot, args.work)
            if not path.exists():
                if narrator is None:
                    narrator = Narrator(args.model_dir, args.work)
                samples, shot_cues = render_voice(narrator, shot, cue_text(shot))
                np.savez_compressed(path, samples=samples, cues=json.dumps(shot_cues))
            with np.load(path) as saved:
                speech.append(saved['samples'])
                for a, b, line in json.loads(saved['cues'].item()):
                    cues.append((round(cursor + a, 3), round(cursor + b, 3), caption_lines(line)))
            cursor += shot['seconds']
        voice = np.concatenate(speech)
        bed = chapter_bed(chapter, ci, RATE)
        soundtrack = mix_narration(bed, voice, RATE)
        raw = args.work / (chapter['id'] + '-mix.wav')
        tmp = raw.with_suffix('.tmp.wav')
        wavfile.write(tmp, RATE, soundtrack.astype(np.float32))
        tmp.replace(raw)
        write_cues(out / (chapter['id'] + '.vtt'), cues)
        all_cues[chapter['id']] = [dict(start=a, end=b, text=line) for a, b, line in cues]
        print(f"Scored {chapter['id']}, {cursor}s, {len(cues)} speech cues", flush=True)
    js = '// Generated by score_story_film.py for local-file caption playback.\n'
    js += 'globalThis.storyFilmCaptions = ' + json.dumps(all_cues, ensure_ascii=False, indent=2) + ';\n'
    (HERE / 'dist/story-film-captions.js').write_text(js)


def loudness(path):
    result = shell('ffmpeg', '-nostdin', '-hide_banner', '-i', path, '-map', '0:a:0', '-af',
                   'loudnorm=I=-17:TP=-1.8:LRA=12:print_format=json', '-f', 'null', '-',
                   capture_output=True, text=True)
    return json.loads(re.findall(r'\{[^{}]+\}', result.stderr)[-1])


def mux(chapter, args, out):
    reel = chapter['id']
    visual = args.visuals / (reel + '.mp4')
    mix = args.work / (reel + '-mix.wav')
    duration = sum(s['seconds'] for s in chapter['shots'])
    raw = json.loads(shell('ffprobe', '-v', 'error', '-show_streams', '-of', 'json',
                           visual, capture_output=True, text=True).stdout)
    picture = next(s for s in raw['streams'] if s['codec_type'] == 'video')
    if picture['codec_name'] != 'h264' or abs(float(picture['duration']) - duration) > 1/24:
        raise ValueError(f'Unexpected silent picture duration or codec for {reel}')
    stats = loudness(mix)
    # Consistent speech loudness with a short look-ahead limiter for isolated peaks.
    gain = -17.0 - float(stats['input_i'])
    mastering = f'volume={gain:.3f}dB,aresample=48000,alimiter=limit={{limit}}:attack=4:release=60:level=0:latency=1'
    shared = ['-map', '0:v:0', '-map', '1:a:0', '-ar', '48000', '-ac', '2',
              '-metadata:s:a:0', 'language=eng',
              '-metadata', 'title=' + chapter['title'], '-t', str(duration)]
    profiles = {
        'mp4': ['-c:v', 'copy', '-c:a', 'aac', '-b:a', '112k', '-movflags', '+faststart'],
        'webm': ['-vf', 'scale=960:540:flags=lanczos', '-c:v', 'libvpx-vp9',
                 '-pix_fmt', 'yuv420p', '-deadline', 'realtime', '-cpu-used', '6',
                 '-g', '48', '-row-mt', '1', '-threads', '2', '-crf', '33', '-b:v', '0',
                 '-c:a', 'libopus', '-b:a', '88k', '-application', 'audio'],
    }
    for ext, options in profiles.items():
        if args.format and args.format != ext:
            continue
        dst = out / f'{reel}.{ext}'
        # Stage outside the downloadable tree, on its filesystem, so ZIP snapshots and readers
        # only ever see a completed encode. A failed encode leaves the previous movie intact.
        with tempfile.TemporaryDirectory(prefix='.film-mux-', dir=HERE) as staging:
            tmp = Path(staging) / dst.name
            # Lossy transforms can overshoot an input ceiling. Retry only if the decoded
            # mix needs additional peak headroom, holding its average speech level steady.
            for ceiling in (.76, .66, .58):
                shell('ffmpeg', '-v', 'error', '-nostdin', '-y', '-threads', '2', '-i', visual,
                      '-i', mix, '-filter_threads', '1', *shared,
                      '-af', mastering.format(limit=ceiling), *options, tmp)
                if float(loudness(tmp)['input_tp']) <= -1.2:
                    break
            else:
                raise ValueError(f'{dst.name}: decoded audio exceeds the true-peak ceiling')
            tmp.replace(dst)
        print(f'Muxed {dst.name}: input {stats["input_i"]} LUFS, gain {gain:+.2f} dB', flush=True)


def main():
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument('stage', choices=['audio', 'mux', 'all'])
    p.add_argument('--model-dir', type=Path)
    p.add_argument('--work', required=True, type=Path)
    p.add_argument('--visuals', type=Path)
    p.add_argument('--format', choices=['mp4', 'webm'], help='Optionally encode only one distribution profile.')
    p.add_argument('--reel', help='Mux only this reel; the audio stage always writes a complete caption index.')
    args = p.parse_args()
    timeline = read_timeline()
    args.work.mkdir(exist_ok=True, parents=True)
    out = HERE / 'dist/assets/story-film'
    out.mkdir(exist_ok=True, parents=True)
    if args.stage in ('audio', 'all'):
        if not args.model_dir:
            p.error('--model-dir is required for speech rendering')
        build_audio(timeline, args, out)
    if args.stage in ('mux', 'all'):
        if not args.visuals:
            p.error('--visuals is required for muxing')
        candidates = [c for c in timeline if not args.reel or c['id'] == args.reel]
        if not candidates:
            p.error('Unknown reel')
        for chapter in candidates:
            mux(chapter, args, out)


if __name__ == '__main__':
    main()
