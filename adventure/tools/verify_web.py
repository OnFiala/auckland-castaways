#!/usr/bin/env python3
"""Verify a built game, local references and optionally the previous site's URLs."""
import argparse
import hashlib
import json
import re
from html.parser import HTMLParser
from pathlib import Path


class Entry(HTMLParser):
    def __init__(self):
        super().__init__()
        self.resources = []
        self.meta = {}

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == 'base':
            raise ValueError('A document base breaks local SVG clip paths')
        if tag == 'meta' and 'name' in attrs:
            self.meta[attrs['name']] = attrs.get('content')
        if tag in ('link', 'script', 'img'):
            url = attrs.get('src') or attrs.get('href')
            if url:
                self.resources.append(url)


def verify(directory, previous=None):
    directory = directory.resolve()
    info = json.loads((directory / 'release.json').read_text(encoding='utf-8'))
    edition = info['directory']
    expected = f"editions/{info['release']}-{info['build'][:20]}/"
    if edition != expected or not re.fullmatch(r'editions/[0-9]+-[a-f0-9]{20}/', edition):
        raise ValueError('Mismatched edition directory')
    expected_files = info['files']
    current_files = {'index.html'} | {f.relative_to(directory).as_posix() for f in (directory / edition).rglob('*') if f.is_file()}
    if current_files != set(expected_files):
        raise ValueError('Current release tree differs from its manifest')
    for name in current_files:
        if hashlib.sha256((directory / name).read_bytes()).hexdigest() != expected_files[name]:
            raise ValueError(f'Content hash mismatch: {name}')
    entry = Entry()
    entry.feed((directory / 'index.html').read_text(encoding='utf-8'))
    if entry.meta.get('game-release') != info['release'] or entry.meta.get('game-build') != info['build'][:20]:
        raise ValueError('Entry release label differs from the served files')
    for link in entry.resources:
        if not link.startswith(edition) or link not in current_files:
            raise ValueError(f'Entry references an unpinned or missing file: {link}')

    for sheet in (directory / edition).rglob('*.css'):
        for match in re.finditer(r'url\(\s*([\'"]?)(.*?)\1\s*\)', sheet.read_text(encoding='utf-8'), re.S):
            url = match[2].strip()
            if url.startswith(('data:', '#')):
                continue
            target = (sheet.parent / url).resolve()
            if not target.is_relative_to(directory / edition) or not target.is_file():
                raise ValueError(f'Broken stylesheet image {sheet.name}: {url}')
    for script in (directory / edition).rglob('*.js'):
        source = script.read_text(encoding='utf-8')
        if re.search(r'(?<![\w.+/:-])assets/', source) or 'asset:assets/' in source:
            raise ValueError(f'An unpinned resource remains in {script.name}')
        for painting in re.findall(r"""['"]asset:([^'"]+)['"]""", source):
            if not painting.startswith(edition) or painting not in current_files:
                raise ValueError(f'Missing scene detail in {script.name}: {painting}')
    retained = 0
    if previous:
        for prior in (p for p in previous.rglob('*') if p.is_file()):
            rel = prior.relative_to(previous)
            if rel.as_posix() in {'index.html', 'release.json'}:
                continue
            if prior.read_bytes() != (directory / rel).read_bytes():
                raise ValueError(f'An open tab would receive different bytes at {rel}')
            retained += 1
    return {'release': info['release'], 'build': info['build'][:20], 'current_files': len(current_files), 'preserved_urls': retained}


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('directory', type=Path)
    parser.add_argument('--previous', type=Path)
    args = parser.parse_args()
    print(json.dumps(verify(args.directory, args.previous), indent=2))
