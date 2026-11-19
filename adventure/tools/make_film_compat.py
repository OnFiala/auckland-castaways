#!/usr/bin/env python3
"""Prepare the video-decoder-independent player from the released picture and sound."""
import argparse
import base64
import concurrent.futures
import json
import math
from pathlib import Path
import shutil
import subprocess
import tempfile

from PIL import Image

DIST = Path(__file__).resolve().parents[1] / 'dist'
WIDTH, HEIGHT = 448, 252
FPS, COLUMNS, ROWS = 8, 4, 4
SAMPLE_RATE = 22050
FRAMES_PER_SHEET = COLUMNS * ROWS


def ffmpeg(source):
    return ['ffmpeg', '-nostdin', '-v', 'error', '-threads', '1', '-i', str(source)]


def encode_reel(reel, source, output):
    name = reel['id']
    seconds = sum(shot['seconds'] for shot in reel['shots'])
    picture = source / (name + '.mp4')
    frame_count = seconds * FPS
    frame_bytes = WIDTH * HEIGHT * 3
    command = ffmpeg(picture) + ['-map', '0:v:0', '-vf',
                                f'fps={FPS},scale={WIDTH}:{HEIGHT}:flags=lanczos',
                                '-pix_fmt', 'rgb24', '-threads', '1', '-f', 'rawvideo', '-']
    with subprocess.Popen(command, stdout=subprocess.PIPE) as process:
        for start in range(0, frame_count, FRAMES_PER_SHEET):
            count = min(FRAMES_PER_SHEET, frame_count - start)
            # Limit each decode to a small independent image, also for the first two seconds.
            sheet = Image.new('RGB', (COLUMNS * WIDTH, math.ceil(count / COLUMNS) * HEIGHT))
            for index in range(count):
                data = process.stdout.read(frame_bytes)
                if len(data) != frame_bytes:
                    raise ValueError(f'{name} ended before frame {start + index}')
                with Image.frombytes('RGB', (WIDTH, HEIGHT), data) as image:
                    sheet.paste(image, ((index % COLUMNS) * WIDTH, (index // COLUMNS) * HEIGHT))
            path = output / f'{name}-{1 + start // FRAMES_PER_SHEET:02d}.webp'
            sheet.save(path, 'WEBP', quality=61, method=3)
        if process.stdout.read(1) or process.wait() != 0:
            raise ValueError(f'{name} did not end on its announced frame count')

    # G.711 mu-law carries the original voice, score and effects as ordinary data.
    # Script loading also works when an offline game was opened directly from disk.
    sample_count = seconds * SAMPLE_RATE
    filters = (f'aresample={SAMPLE_RATE},aformat=sample_fmts=s16:channel_layouts=mono,'
               f'apad=whole_len={sample_count},atrim=end_sample={sample_count}')
    samples = subprocess.check_output(ffmpeg(picture) + ['-map', '0:a:0', '-af', filters,
                                                        '-c:a', 'pcm_mulaw', '-f', 'mulaw', '-'])
    if len(samples) != sample_count:
        raise ValueError(f'{name} audio has {len(samples)} samples, expected {sample_count}')
    encoded = base64.b64encode(samples).decode('ascii')
    line = f'document.currentScript?.castawaySound?.("{name}",{SAMPLE_RATE},{sample_count},"{encoded}");\n'
    (output / f'{name}-audio.js').write_text(line, encoding='ascii')
    return name, frame_count, sample_count


def build(dist, output):
    timeline = json.loads(subprocess.check_output([
        'node', '-p', 'JSON.stringify(require(process.argv[1]).timeline)', str(dist / 'story-film-script.js')
    ]))
    output.parent.mkdir(parents=True, exist_ok=True)
    # A parallel game build must never discover a partly encoded sheet in the runtime tree.
    with tempfile.TemporaryDirectory(prefix='castaway-film-frames-') as temporary:
        staged = Path(temporary)
        with concurrent.futures.ThreadPoolExecutor(max_workers=3) as pool:
            jobs = [pool.submit(encode_reel, reel, dist / 'assets/story-film', staged) for reel in timeline]
            for job in jobs:
                name, frames, samples = job.result()
                print(f'{name}: {frames} frames, {samples} mono samples', flush=True)
        output.mkdir(exist_ok=True)
        for asset in sorted(staged.iterdir()):
            # Install complete files only, even when the scratch and project mounts differ.
            with tempfile.NamedTemporaryFile(dir=output, suffix='.part', delete=False) as pending:
                pending_path = Path(pending.name)
            try:
                shutil.copyfile(asset, pending_path)
                pending_path.replace(output / asset.name)
            finally:
                pending_path.unlink(missing_ok=True)
        names = {asset.name for asset in staged.iterdir()}
        for reel in timeline:
            for old in output.glob(f'{reel["id"]}-[0-9][0-9].webp'):
                if old.name not in names:
                    old.unlink()
    print('Generated film frame sheets and sound in', output)


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--dist', type=Path, default=DIST)
    parser.add_argument('--output', type=Path)
    args = parser.parse_args()
    dist = args.dist.resolve()
    build(dist, args.output or dist / 'assets/story-film-compat')
