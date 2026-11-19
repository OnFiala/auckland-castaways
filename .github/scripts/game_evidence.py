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
REELS = ('prologue', 'winter', 'forge', 'boat', 'crossing', 'promise', 'return', 'epilogue')


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


def verified_film(folder, output, manifest, archive_sha):
    report = read_json(folder / 'story-film.json')
    if (str(report['edition']) != manifest['release'] or report['build'] != manifest['build'][:20]
            or report['zip_sha256'] != archive_sha or report['offline'] is not True
            or report['errors'] or tuple(report['reels']) != REELS
            or set(report['webmFallback']['replays']) != set(REELS)):
        raise ValueError('Film playback did not verify every reel of the tested edition')
    master = read_json(folder / 'master.json')
    if [entry['id'] for entry in master['chapters']] != list(REELS):
        raise ValueError('The standalone film needs the full recorded voyage')
    for entry in master['chapters']:
        rel = manifest['directory'] + f"assets/story-film/{entry['id']}.mp4"
        if entry['clip_sha256'] != manifest['files'][rel]:
            raise ValueError(f'{rel} differs from the source of the standalone film')
    movie = folder / 'until-we-return-story-film.mp4'
    with movie.open('rb') as stream:
        if master['sha256'] != hashlib.file_digest(stream, 'sha256').hexdigest():
            raise ValueError('Standalone download differs from the measured film')
    sheet = folder / 'filmstrip.webp'
    with sheet.open('rb') as stream:
        if report['gallery_sha256'] != hashlib.file_digest(stream, 'sha256').hexdigest():
            raise ValueError('Filmstrip differs from the checked browser captures')
    with Image.open(sheet, formats=['WEBP']) as gallery:
        gallery.verify()
    for item in (movie, sheet):
        shutil.copyfile(item, output / item.name)
    return master


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
    if int(edition) >= 16:
        report = read_json(evidence / 'lighting' / 'lighting-study.json')
        source = evidence / 'lighting' / 'lighting-study.webp'
        with source.open('rb') as stream:
            sheet_sha = hashlib.file_digest(stream, 'sha256').hexdigest()
        required = {'beach', 'cabin', 'forge', 'crossing-wet', 'crossing-dry'}
        if (report['edition'] != edition or report['build'] != verified['build']
                or report['zip_sha256'] != digest or report['sheet_sha256'] != sheet_sha
                or report['offline'] is not True or report['errors'] or report['remoteRequests'] or report['failedRequests']
                or set(report['plates']) != required or report['contextLoss']['restored']['state'] != 'ready'
                or report['phone']['item'] != 'rope'):
            raise ValueError('Lighting study does not match this tested offline edition')
        with Image.open(source, formats=['WEBP']) as study:
            if study.width < 2048 or study.height < 2500:
                raise ValueError('The five paired scenes must be readable at full size')
            study.verify()
        shutil.copyfile(source, output / source.name)
        summary['lighting'] = report
    filename = f'until-we-return-edition-{edition}.zip'
    shutil.copyfile(archive, output / filename)
    checksums = [f'{digest}  {filename}']
    if int(edition) >= 17:
        master = verified_film(evidence / 'film', output, manifest, digest)
        summary['film'] = master
        checksums.append(f"{master['sha256']}  until-we-return-story-film.mp4")
    if int(edition) >= 18:
        summary['hosted_film'] = {}
        for browser in ('chromium', 'webkit'):
            report = read_json(evidence / f'hosted-film-{browser}' / 'hosted-film.json')
            if (report['browser'] != browser or report['edition'] != edition or report['errors']
                    or report['build'] != verified['build'] or report['zip_sha256'] != digest):
                raise ValueError(f'Hosted playback evidence from {browser} does not match this ZIP')
            scenes = report['scenarios']
            for key in ('opening', 'reloaded', 'journey', 'chapter', 'playlist', 'nextReel', 'pendingNative', 'mediaPolicy'):
                if scenes[key]['changedPixels'] <= 30 or scenes[key]['decodedAudioPeak'] <= 0.0002:
                    raise ValueError(f'{browser} recorded an inaudible or motionless film in {key}')
            if not scenes['reducedMotion']['heldShot'] or not scenes['reducedMotion']['timedCaptions']:
                raise ValueError(f'{browser} did not demonstrate reduced-motion playback')
            summary['hosted_film'][browser] = {'version': report['browserVersion'],
                                               'bookmark_seconds': scenes['reloaded']['bookmarkSeconds'],
                                               'opening_player': scenes['opening']['player'],
                                               'stalled_player': scenes['pendingNative']['player']}
    (output / 'SHA256SUMS.txt').write_text('\n'.join(checksums) + '\n', encoding='ascii')
    (output / 'qa-summary.json').write_text(json.dumps(summary, indent=2) + '\n', encoding='utf-8')


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('archive', type=Path)
    parser.add_argument('evidence', type=Path)
    parser.add_argument('edition')
    parser.add_argument('output', type=Path)
    args = parser.parse_args()
    prepare(args.archive, args.evidence, args.edition, args.output)
