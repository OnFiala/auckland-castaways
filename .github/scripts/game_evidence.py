"""Prepare the tested ZIP, its checksum and a contact sheet from the same QA run."""
import argparse
import hashlib
import json
import re
import shutil
import zipfile
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont, ImageOps


CHAPTERS = (
    'The First Night', 'A House Against the Winter', 'What Iron Can Become',
    'Room for Three', 'Five Days of Ocean', 'The Promise', 'Until We Return',
)
SCENARIOS = ('desktop-shore', 'touch-shore', 'campaign', 'retry')


def read_json(path):
    return json.loads(path.read_text(encoding='utf-8'))


def make_gallery(evidence, edition, output):
    plates = [(f'chapter-{i}', f'{i:02}   {title}') for i, title in enumerate(CHAPTERS, 1)]
    plates.extend([('rescue', 'Home again  /  The five survivors'), ('epilogue', 'The archive  /  Witness accounts')])
    width, height, gutter = 520, 325, 24
    canvas = Image.new('RGB', (3 * width + 4 * gutter, 140 + 3 * (height + 70)), '#eee6d4')
    draw = ImageDraw.Draw(canvas)
    title_font = ImageFont.truetype('DejaVuSerif.ttf', 48)
    caption_font = ImageFont.truetype('DejaVuSerif.ttf', 24)
    note_font = ImageFont.truetype('DejaVuSans.ttf', 21)
    draw.text((gutter, 20), 'Until We Return', font=title_font, fill='#382d27')
    draw.text((gutter, 84), f'Edition {edition}   /   Seven chapters on Auckland Island and at sea',
              font=note_font, fill='#54574f')
    for i, (filename, caption) in enumerate(plates):
        x = gutter + (i % 3) * (width + gutter)
        y = 140 + (i // 3) * (height + 70)
        draw.rectangle((x, y, x + width - 1, y + height - 1), fill='#302f2d')
        with Image.open(evidence / 'campaign' / f'{filename}.png', formats=['PNG']) as capture:
            frame = ImageOps.contain(capture.convert('RGB'), (width, height), Image.Resampling.LANCZOS)
        canvas.paste(frame, (x + (width - frame.width) // 2, y + (height - frame.height) // 2))
        draw.text((x, y + height + 12), caption, font=caption_font, fill='#382d27')
    canvas.save(output, format='WEBP', quality=88, method=6)


def prepare(archive, evidence, edition, output):
    if not re.fullmatch(r'[0-9]+', edition) or archive.name != 'until-we-return.zip':
        raise ValueError('Expected a numbered game edition and the original QA archive name')
    with archive.open('rb') as stream:
        digest = hashlib.file_digest(stream, 'sha256').hexdigest()
    recorded = (evidence / 'archive.sha256').read_text(encoding='ascii').splitlines()
    if recorded != [f'{digest}  until-we-return.zip']:
        raise ValueError('The supplied ZIP differs from the one tested in Chromium')
    verified = read_json(evidence / 'verified-edition.json')
    with zipfile.ZipFile(archive) as reader:
        manifest = json.loads(reader.read('release.json'))
    if (verified['release'] != edition or manifest['release'] != edition
            or verified['build'] != manifest['build'][:20] or verified['current_files'] != len(manifest['files'])):
        raise ValueError('ZIP manifest, QA verification and release branch must describe the same edition')

    summary = {'edition': edition, 'build': verified['build'], 'zip_sha256': digest,
               'zip_bytes': archive.stat().st_size, 'verified_files': verified['current_files'], 'scenarios': {}}
    scenarios = SCENARIOS + (('keyboard',) if int(edition) >= 15 else ())
    for name in scenarios:
        folder = evidence / name
        details = read_json(folder / 'edition.json')
        browser = read_json(folder / 'browser.json')
        if details['release'] != edition or details['offline'] is not True or browser['errors'] or browser['remote_requests']:
            raise ValueError(f'Inconsistent offline QA results for {name}')
        row = {'viewport': details['viewport'], 'page_errors': len(browser['errors']),
               'remote_requests': len(browser['remote_requests']), 'failed_requests': len(browser['failed_requests'])}
        if name.endswith('-shore'):
            walk = read_json(folder / 'alick-walk.json')
            targets = read_json(folder / 'shore-targets.json')['targets']
            block = read_json(folder / 'reeved-block.json')
            row.update(walk_ms=walk['sampledMs'], walk_samples=walk['samples'], distinct_walk_frames=len(set(walk['frames'])),
                       shore_targets_hit=sum(key == hit['hit'] for key, hit in targets.items()),
                       block_loaded_offset_percent=block['loadedOffsetPercent'])
        if name == 'keyboard':
            keyboard = read_json(folder / 'keyboard-route.json')
            transferred = [observation['item'] for observation in keyboard['pickupsAndCombination']]
            if transferred != ['rope', 'pole', 'loopPole'] or keyboard['restored']['item'] != 'loopPole':
                raise ValueError('Incomplete keyboard pickup, crafting or reload evidence')
            row.update(focus_after_actions=transferred, following_tab=keyboard['nextTab']['label'],
                       focus_after_reload=keyboard['restored']['item'])
        summary['scenarios'][name] = row

    output.mkdir(parents=True, exist_ok=True)
    make_gallery(evidence, edition, output / 'review-game.webp')
    filename = f'until-we-return-edition-{edition}.zip'
    shutil.copyfile(archive, output / filename)
    (output / 'SHA256SUMS.txt').write_text(f'{digest}  {filename}\n', encoding='ascii')
    (output / 'qa-summary.json').write_text(json.dumps(summary, indent=2) + '\n', encoding='utf-8')


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('archive', type=Path)
    parser.add_argument('evidence', type=Path)
    parser.add_argument('edition')
    parser.add_argument('output', type=Path)
    args = parser.parse_args()
    prepare(args.archive, args.evidence, args.edition, args.output)
