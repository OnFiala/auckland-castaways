#!/usr/bin/env python3
"""Create a repeatable, directly extractable offline game from a verified build."""
import argparse
import hashlib
import json
import tempfile
import zipfile
from pathlib import Path

from verify_web import verify


def package(directory, output):
    verify(directory)
    manifest = json.loads((directory / 'release.json').read_text(encoding='utf-8'))
    guide = Path(__file__).resolve().parents[1] / 'PLAY.txt'
    entries = {name: directory / name for name in manifest['files']}
    entries.update({'release.json': directory / 'release.json', 'PLAY.txt': guide})
    output.parent.mkdir(parents=True, exist_ok=True)
    with tempfile.TemporaryDirectory(dir=output.parent) as temp:
        archive = Path(temp) / 'game.zip'
        with zipfile.ZipFile(archive, 'w', compression=zipfile.ZIP_DEFLATED) as writer:
            for name, source in sorted(entries.items()):
                record = zipfile.ZipInfo(name, (1980, 1, 1, 0, 0, 0))
                record.create_system = 3
                record.external_attr = 0o100644 << 16
                writer.writestr(record, source.read_bytes(), compress_type=zipfile.ZIP_DEFLATED, compresslevel=6)
        with zipfile.ZipFile(archive) as reader:
            if reader.testzip() or set(reader.namelist()) != set(entries):
                raise ValueError('The downloadable game did not pass its integrity check')
        archive.replace(output)
    checksum = hashlib.sha256(output.read_bytes()).hexdigest()
    print(f'{output.name}  {output.stat().st_size:,} bytes  SHA-256 {checksum}')


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('directory', type=Path, help='output of build_web.py')
    parser.add_argument('output', type=Path, help='downloadable .zip')
    args = parser.parse_args()
    package(args.directory, args.output)
