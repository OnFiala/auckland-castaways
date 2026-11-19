#!/usr/bin/env python3
"""Build a smaller static web edition from the same game and original paintings."""
import argparse
import hashlib
import json
import re
import concurrent.futures
import shutil
import tempfile
from pathlib import Path

from PIL import Image, ImageChops, ImageStat

SOURCE = Path(__file__).resolve().parents[1] / 'dist'
RUNTIME_TYPES = {'.js', '.html', '.css', '.png', '.webp', '.wav', '.woff2', '.txt'}


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
    if path.suffix == '.txt':
        return relative == 'assets/lettering/OFL.txt'
    # These full-size studies are archived with their original acquisition receipts.
    # The runtime scenery and the crate detail are now registered to tidepaint.
    if relative.startswith('assets/voyage/scenes/'):
        return False
    return relative not in {
        'assets/beach.png', 'assets/camp.png', 'assets/wreck.png',
        'assets/states/wreck-open.png', 'assets/states/camp-shelter.png',
    }


def encode_runtime(destination):
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
        elif src.suffix in {'.webp', '.wav', '.woff2', '.txt'}:
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


def write_edition(flat, output):
    """Keep the entry at its existing URL and pin every resource it can use."""
    files = sorted(p for p in flat.rglob('*') if p.is_file())
    entry = (flat / 'index.html').read_text(encoding='utf-8')
    release_name = re.search(r'<meta name="game-release" content="([0-9]+)">', entry)
    if not release_name:
        raise ValueError('index.html must identify the game release')
    release = release_name.group(1)

    # Hash the compact files and the version of this transformation. Two builds
    # can share a resource URL only when they generate the same bytes.
    digest = hashlib.sha256(Path(__file__).read_bytes())
    names = {p.relative_to(flat).as_posix() for p in files}
    for path in files:
        digest.update(path.relative_to(flat).as_posix().encode() + b'\0')
        digest.update(hashlib.sha256(path.read_bytes()).digest())
    fingerprint = digest.hexdigest()
    prefix = f'editions/{release}-{fingerprint[:20]}/'
    edition = output / prefix
    edition.mkdir(parents=True)
    hashes = {}

    def entry_reference(match):
        attr, resource = match.groups()
        if resource.startswith(('#', 'https:', 'data:', 'http:')):
            return match[0]
        if resource not in names:
            raise ValueError(f'Missing entry resource: {resource}')
        return f'{attr}="{prefix}{resource}"'

    # Keep the document base untouched. Room work uses local SVG clip paths,
    # and a base element would resolve those fragment references off-document.
    entry = re.sub(r'\b(src|href)="([^"]+)"', entry_reference, entry)
    entry = entry.replace('<meta name="game-release"', f'<meta name="game-build" content="{fingerprint[:20]}"><meta name="game-release"', 1)
    (output / 'index.html').write_text(entry, encoding='utf-8')
    hashes['index.html'] = hashlib.sha256((output / 'index.html').read_bytes()).hexdigest()

    for src in files:
        name = src.relative_to(flat).as_posix()
        if name == 'index.html':
            continue
        dest = edition / name
        dest.parent.mkdir(parents=True, exist_ok=True)
        if src.suffix == '.js':
            # Game scripts write URLs into document elements (including SVG)
            # and use path fragments such as 'assets/walk/' + actor + '.webp'.
            # Stylesheets already resolve their resources against their own URL.
            script = src.read_text(encoding='utf-8')
            # The living scenery uses asset:<path> to distinguish paintings
            # from drawn marks. Its renderer removes the tag before loading.
            script = script.replace('asset:assets/', 'asset:' + prefix + 'assets/')
            # The inline image atlas uses base64. Its alphabet includes '+'
            # and '/', so even '+assets/' can be part of an image payload.
            script = re.sub(r'(?<![\w.+/:-])assets/', prefix + 'assets/', script)
            dest.write_text(script, encoding='utf-8')
        else:
            shutil.copyfile(src, dest)
        hashes[prefix + name] = hashlib.sha256(dest.read_bytes()).hexdigest()

    manifest = {'release': release, 'build': fingerprint, 'directory': prefix, 'files': hashes}
    (output / 'release.json').write_text(json.dumps(manifest, indent=2, sort_keys=True) + '\n', encoding='utf-8')
    return manifest


def retain_open_editions(previous, output):
    """Retain exact URLs that an already opened copy may still request."""
    if not (previous / 'index.html').is_file():
        raise ValueError('Previous distribution must contain its published index.html')
    for src in sorted(p for p in previous.rglob('*') if p.is_file()):
        name = src.relative_to(previous)
        if name.as_posix() in {'index.html', 'release.json'}:
            continue
        dest = output / name
        if dest.exists():
            if src.read_bytes() != dest.read_bytes():
                raise ValueError(f'Immutable release path changed: {name}')
        else:
            dest.parent.mkdir(parents=True, exist_ok=True)
            shutil.copyfile(src, dest)


def build(destination, previous=None):
    destination = destination.resolve()
    if destination == SOURCE or SOURCE in destination.parents:
        raise ValueError('Choose an output directory outside the source paintings.')
    if previous:
        previous = previous.resolve()
        if destination == previous or destination in previous.parents or previous in destination.parents:
            raise ValueError('The new and previous editions must be in separate directories.')
    destination.parent.mkdir(parents=True, exist_ok=True)
    if destination.exists() and any(destination.iterdir()):
        raise ValueError('Use an empty output directory.')
    # Commit the prepared tree in one rename, so a failed build cannot serve
    # a partial release or overwrite an existing edition.
    with tempfile.TemporaryDirectory(dir=destination.parent) as staging:
        temp = Path(staging)
        flat = temp / 'flat'
        output = temp / 'ready'
        output.mkdir()
        encode_runtime(flat)
        manifest = write_edition(flat, output)
        if previous:
            retain_open_editions(previous, output)
        output.replace(destination)
    print(f"Edition {manifest['release']}, build {manifest['build'][:20]}, {len(manifest['files'])} verified runtime files.")


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('destination', type=Path, help='empty output folder for index.html and its assets')
    parser.add_argument('--previous', type=Path, help='exact previous hosted distribution to preserve for open tabs')
    args = parser.parse_args()
    build(args.destination, args.previous)
