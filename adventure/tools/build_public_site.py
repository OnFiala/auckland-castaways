"""Add a crawler-readable link preview to a verified compact game distribution."""
import argparse
import hashlib
from html import escape
import json
from pathlib import Path
import re
import shutil
from string import Template
import tempfile
from urllib.parse import urljoin, urlsplit

from PIL import Image
from verify_web import verify

SITE = Path(__file__).resolve().parents[1] / 'site'
COVER = Path('share/until-we-return-cover.jpg')
DESCRIPTION = ('Five men are shipwrecked on Auckland Island in 1864. Three set out in an open boat '
               'and promise to return for the other two. Play their story in a painted adventure.')
ALT = ('Until We Return. Three sailors in a small wooden boat set a patched ochre sail '
       'against the dark cliffs of Auckland Island.')


def public_entry(entry, game_url, image_digest):
    parsed = urlsplit(game_url)
    if (parsed.scheme != 'https' or not parsed.hostname or parsed.username is not None
            or parsed.password is not None or parsed.query or parsed.fragment):
        raise ValueError('Supply the public HTTPS game URL without credentials, a query or a fragment')
    game_url = game_url.rstrip('/') + '/'
    image_url = urljoin(game_url, COVER.as_posix()) + '?v=' + image_digest[:12]
    fields = dict(title='Until We Return', description=DESCRIPTION, alt=ALT, game_url=game_url, image_url=image_url)
    template = Template((SITE / 'share-card.html').read_text(encoding='utf-8'))
    card = template.substitute({name: escape(value, quote=True) for name, value in fields.items()})
    head, end_head, body = entry.partition('</head>')
    if not end_head:
        raise ValueError('The game entry is missing its document head')
    head = re.sub(r'<!-- Until We Return share card -->.*?<!-- End Until We Return share card -->',
                  '', head, flags=re.S)
    return head.rstrip() + '\n' + card + end_head + body


def build(game, destination, game_url):
    game, destination = game.resolve(), destination.resolve()
    if game == destination or game in destination.parents or destination in game.parents:
        raise ValueError('Use separate input and output directories')
    if destination.exists() and any(destination.iterdir()):
        raise ValueError('Use an empty output directory')
    verify(game)
    with Image.open(SITE / COVER, formats=['JPEG']) as image:
        if image.size != (1200, 600) or image.mode != 'RGB':
            raise ValueError('The share card must be a 1200 × 600 RGB JPEG')
        image.verify()
    image_digest = hashlib.sha256((SITE / COVER).read_bytes()).hexdigest()
    entry = public_entry((game / 'index.html').read_text(encoding='utf-8'), game_url, image_digest)
    manifest = json.loads((game / 'release.json').read_text(encoding='utf-8'))
    manifest['files']['index.html'] = hashlib.sha256(entry.encode('utf-8')).hexdigest()
    destination.parent.mkdir(parents=True, exist_ok=True)
    with tempfile.TemporaryDirectory(dir=destination.parent) as temporary:
        staged = Path(temporary) / 'site'
        # Previously opened tabs can still request the versioned files shipped alongside the game.
        shutil.copytree(game / 'editions', staged / 'editions')
        (staged / COVER.parent).mkdir()
        shutil.copyfile(SITE / COVER, staged / COVER)
        shutil.copyfile(SITE / 'robots.txt', staged / 'robots.txt')
        (staged / 'index.html').write_text(entry, encoding='utf-8')
        (staged / 'release.json').write_text(json.dumps(manifest, indent=2, sort_keys=True) + '\n', encoding='utf-8')
        verify(staged)
        staged.replace(destination)


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('game', type=Path, help='distribution from build_web.py or the unpacked release')
    parser.add_argument('destination', type=Path, help='empty output for the public web host')
    parser.add_argument('--url', required=True, help='public game URL that players share')
    args = parser.parse_args()
    build(args.game, args.destination, args.url)
