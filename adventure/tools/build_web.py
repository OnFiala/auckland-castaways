#!/usr/bin/env python3
"""Build a smaller static web edition from the same game and original paintings."""
import argparse
import concurrent.futures
import shutil
from pathlib import Path

from PIL import Image, ImageChops, ImageStat

SOURCE = Path(__file__).resolve().parents[1] / 'dist'
RUNTIME_TYPES = {'.js', '.html', '.css', '.png', '.webp', '.wav'}


def flatten(image):
    background = Image.new('RGBA', image.size, (215, 201, 174, 255))
    return Image.alpha_composite(background, image.convert('RGBA')).convert('RGB')


def encode(png, output):
    with Image.open(png) as original:
        rgba = original.convert('RGBA')
    # Retain the painted colour and exact transparency under every crop and pose.
    for options in [{'quality': 94}, {'quality': 97}, {'lossless': True}]:
        rgba.save(output, 'WEBP', method=5, exact=True, alpha_quality=100, **options)
        with Image.open(output) as delivered:
            raster = delivered.convert('RGBA')
        if raster.size != rgba.size or raster.getchannel('A').tobytes() != rgba.getchannel('A').tobytes():
            raise ValueError(f'Altered image geometry or alpha in {png.name}')
        delta = ImageChops.difference(flatten(rgba), flatten(raster))
        if max(ImageStat.Stat(delta).rms) <= 3.5:
            return
    raise ValueError(f'Unacceptable colour difference in {png.name}')


def is_runtime_file(path):
    if not path.is_file() or path.suffix not in RUNTIME_TYPES:
        return False
    relative = path.relative_to(SOURCE).as_posix()
    # These full-size studies are archived with their original acquisition receipts.
    # The runtime scenery and the crate detail are now registered to tidepaint.
    if relative.startswith('assets/voyage/scenes/'):
        return False
    return relative not in {
        'assets/beach.png', 'assets/camp.png', 'assets/wreck.png',
        'assets/states/wreck-open.png', 'assets/states/camp-shelter.png',
    }


def build(destination):
    destination = destination.resolve()
    if destination == SOURCE or SOURCE in destination.parents:
        raise ValueError('Choose an output directory outside the source paintings.')
    destination.mkdir(parents=True, exist_ok=True)
    if any(destination.iterdir()):
        raise ValueError('Use an empty output directory.')
    files = [p for p in SOURCE.rglob('*') if is_runtime_file(p)]
    output_names = set()
    work = []
    for src in files:
        output = destination / src.relative_to(SOURCE)
        if src.suffix == '.png':
            output = output.with_suffix('.webp')
        if output in output_names:
            raise ValueError(f'Two assets have the same delivery name: {output.name}')
        output_names.add(output)
        output.parent.mkdir(parents=True, exist_ok=True)
        if src.suffix == '.png':
            work.append((src, output))
        elif src.suffix in {'.webp', '.wav'}:
            shutil.copyfile(src, output)
        else:
            # Registries include names assembled at runtime, e.g. the five walking atlases.
            output.write_text(src.read_text(encoding='utf8').replace('.png', '.webp'), encoding='utf8')
    with concurrent.futures.ThreadPoolExecutor(max_workers=3) as pool:
        jobs = [pool.submit(encode, src, output) for src, output in work]
        for job in jobs:
            job.result()
    print(f'{len(files)} runtime files, {len(work)} paintings encoded and checked. '
          f'{sum(p.stat().st_size for p in output_names):,} bytes for deployment.')


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('destination', type=Path, help='empty output folder for index.html and its assets')
    build(parser.parse_args().destination)
