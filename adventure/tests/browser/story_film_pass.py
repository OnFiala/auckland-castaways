"""Verify the story films and gameplay handoffs from the complete offline download."""
import argparse
import hashlib
import json
import re
import shutil
from contextlib import contextmanager
from pathlib import Path
from tempfile import TemporaryDirectory
from urllib.parse import unquote, urlsplit
from zipfile import ZipFile

from PIL import Image, ImageDraw, ImageFont
from playwright.sync_api import expect, sync_playwright

from campaign import OPENING_REELS, READ, SAVE, campaign, ready, ready_scene, state, story_film, target
from keyboard_route import tab_to
from release_qa import write

REELS = (*OPENING_REELS, 'epilogue')
MEDIA_FORMATS = ('mp4', 'webm')
OLD_FLAGS = ('ropeTaken', 'poleTaken', 'canvasRecovered', 'prybarTaken', 'crateOpen',
             'woodCut', 'firewoodPlaced', 'shelterBuilt', 'fireLit', 'mastRaised', 'signalRaised')
# Passive browser observer which records the original native event before the player unloads its video.
ENDS = """window.qaNaturalEnds = [];
  document.addEventListener('ended', event => {
    if (event.target.id === 'film-video') {
      window.qaNaturalEnds.push({reel: document.querySelector('#story-film').dataset.film,
        time: event.target.currentTime, duration: event.target.duration, trusted: event.isTrusted});
    }
  }, true);"""


def digest(path):
    with path.open('rb') as stream:
        return hashlib.file_digest(stream, 'sha256').hexdigest()


def stage_archive(index, archive):
    with ZipFile(archive) as source:
        raw = source.read('release.json')
        assert (index.parent / 'release.json').read_bytes() == raw
        manifest = json.loads(raw)
        directory = manifest['directory']
        members = ['index.html'] + [f'{directory}assets/story-film/{reel}.{extension}'
                                    for reel in REELS for extension in (*MEDIA_FORMATS, 'vtt')]
        for relative in members:
            expected = manifest['files'][relative]
            with source.open(relative) as zipped:
                assert hashlib.file_digest(zipped, 'sha256').hexdigest() == expected, relative
            assert digest(index.parent / relative) == expected, relative
    return manifest


def timecode(value):
    clock = re.fullmatch(r'(?:(\d+):)?(\d{2}):(\d{2}\.\d{3})', value)
    assert clock, value
    hours, minutes, seconds = clock.groups()
    return int(hours or 0) * 3600 + int(minutes) * 60 + float(seconds)


def read_cues(path):
    text = path.read_text(encoding='utf-8-sig').strip()
    assert text.startswith('WEBVTT'), path
    cues = []
    for block in re.split(r'\n\s*\n', text)[1:]:
        match = re.search(r'^([\d:.]+) --> ([\d:.]+).*?\n(.+)', block, re.MULTILINE | re.DOTALL)
        assert match, (path, block)
        start, end, line = match.groups()
        start, end = timecode(start), timecode(end)
        assert 0 <= start < end and (not cues or cues[-1]['end'] <= start), (path, match.groups())
        cues.append({'start': start, 'end': end, 'line': ' '.join(line.split())})
    assert len(cues) >= 2, path
    return cues


@contextmanager
def view(browser, evidence, label, *, touch=False, reduced=False, expected_missing=()):
    viewport = {'width': 390, 'height': 844} if touch else {'width': 1280, 'height': 800}
    context = browser.new_context(viewport=viewport, is_mobile=touch, has_touch=True, offline=True,
                                  reduced_motion='reduce' if reduced else 'no-preference')
    requests, errors, failed = [], [], []
    page = context.new_page()
    page.set_default_timeout(15000)
    page.add_init_script(ENDS)
    page.on('pageerror', lambda exc: errors.append(str(exc)))
    page.on('request', lambda req: requests.append(req.url) if urlsplit(req.url).scheme in ('http', 'https') else None)
    page.on('requestfailed', lambda req: failed.append({'name': Path(urlsplit(req.url).path).name, 'reason': req.failure}))
    try:
        yield page
        unexpected = [req for req in failed if req['reason'] != 'net::ERR_ABORTED' and
                      not (req['name'] in expected_missing and req['reason'] == 'net::ERR_FILE_NOT_FOUND')]
        missing = {req['name'] for req in failed if req['reason'] == 'net::ERR_FILE_NOT_FOUND'}
        assert not (errors or requests or unexpected), (label, errors, requests, unexpected)
        assert missing == set(expected_missing), (label, missing, expected_missing)
    except Exception:
        page.screenshot(path=evidence / f'{label}-failure.png', timeout=5000)
        raise
    finally:
        write(evidence / f'{label}-browser.json', {'errors': errors, 'remoteRequests': requests, 'failedRequests': failed})
        context.close()


def button_with_key(page, film, name):
    tab_to(page, film.locator(f'#film-{name}'))
    page.keyboard.press('Enter')


def read_live_video(page, reel, extension='mp4'):
    video = page.locator('#film-video')
    expect(video).to_be_visible()
    data = page.wait_for_function("""() => {
      const video = document.getElementById('film-video');
      if (video.error) throw Error(video.error.message || `Media error ${video.error.code}`);
      const frames = video.getVideoPlaybackQuality().totalVideoFrames;
      const audioBytes = video.webkitAudioDecodedByteCount;
      if (video.paused || video.currentTime < .25 || frames < 2 || !audioBytes) return;
      return {source:video.currentSrc, seconds:video.duration, time:video.currentTime, frames, audioBytes,
        dimensions:[video.videoWidth,video.videoHeight], muted:video.muted};
    }""", timeout=12000).json_value()
    source = urlsplit(data['source'])
    relative = f'assets/story-film/{reel}.{extension}'
    assert source.scheme == 'file' and source.path.endswith('/' + relative), data
    assert data['dimensions'][0] >= 640 and data['dimensions'][1] >= 360 and data['seconds'] > 10, data
    return {**data, 'source': relative}


def verify_timeline(page, reel, native, cues):
    expected = page.evaluate("""id => window.CastawayFilmScript.timeline.find(reel => reel.id === id)
        .shots.reduce((sum, shot) => sum + shot.seconds, 0)""", reel)
    assert abs(native['seconds'] - expected) < .1 and cues[-1]['end'] <= native['seconds'], (reel, native, expected)


def curtain(page, reel, cues, evidence, measurements):
    film = story_film(page, reel)
    saved = state(page)
    title = film.locator('#film-title').text_content()
    # Ordinary motion remembers the first Watch choice. A fresh guest instead gets the poster.
    if film.get_attribute('data-mode') == 'poster':
        film.locator('#film-play').click()
    native = read_live_video(page, reel)
    verify_timeline(page, reel, native, cues)
    verify_cue(page, film, cues[0])
    page.screenshot(path=evidence / f'frame-{reel}.png')
    film.locator('#film-skip').click()
    expect(film).not_to_be_visible()
    assert state(page) == saved
    measurements[reel] = {**native, 'title': title, 'captionCount': len(cues), 'handoff': 'skip',
                          'chapter': saved['chapter']}
    print(f"{reel}: native picture and sound, {native['seconds']:.1f}s, returned to chapter {saved['chapter']}", flush=True)


def verify_cue(page, film, cue):
    caption = film.locator('#film-caption')
    expect(caption).to_have_text(cue['line'], timeout=20000)
    expect(caption).to_be_visible()
    clock = page.locator('#film-video').evaluate('video => video.currentTime')
    assert cue['start'] - .15 <= clock <= cue['end'] + .15, (clock, cue)
    return clock


def prologue(page, cues, evidence):
    film = story_film(page, 'prologue')
    before = state(page)
    assert before['chapter'] == 1 and before['scene'] == 'beach' and before['actions'] == 0
    expect(film).to_have_accessible_name('Until We Return')
    expect(film.locator('#film-reel')).to_contain_text('Soundings')
    expect(film.locator('#film-track')).to_have_attribute('srclang', 'en')
    expect(film.locator('#film-track')).to_have_attribute('kind', 'captions')
    expect(film.locator('#film-captions')).to_have_attribute('aria-pressed', 'true')
    video = film.locator('#film-video')
    assert video.evaluate('video => video.paused && video.currentTime === 0')
    page.screenshot(path=evidence / 'prologue-poster.png')
    button_with_key(page, film, 'play')
    native = read_live_video(page, 'prologue')
    verify_timeline(page, 'prologue', native, cues)
    assert not native['muted']
    first = verify_cue(page, film, cues[0])
    button_with_key(page, film, 'pause')
    expect(film.locator('#film-pause')).to_have_attribute('aria-pressed', 'true')
    assert video.evaluate('video => video.paused')
    stopped = video.evaluate('video => video.currentTime')
    button_with_key(page, film, 'mute')
    expect(film.locator('#film-mute')).to_have_attribute('aria-pressed', 'true')
    assert video.evaluate('video => video.muted')
    button_with_key(page, film, 'captions')
    expect(film.locator('#film-captions')).to_have_attribute('aria-pressed', 'false')
    expect(film.locator('#film-caption')).to_be_hidden()
    button_with_key(page, film, 'captions')
    expect(film.locator('#film-caption')).to_be_visible()
    button_with_key(page, film, 'mute')
    assert video.evaluate('video => !video.muted')
    assert abs(video.evaluate('video => video.currentTime') - stopped) < .06
    page.screenshot(path=evidence / 'frame-prologue.png')
    button_with_key(page, film, 'pause')
    expect(film.locator('#film-pause')).to_have_attribute('aria-pressed', 'false')
    times = [first]
    for cue in cues[1:]:
        if cue['start'] - times[-1] >= 8:
            times.append(verify_cue(page, film, cue))
            page.screenshot(path=evidence / f'frame-prologue-{len(times)}.png')
    assert len(times) >= 4, times
    expect(film).not_to_be_visible(timeout=60000)
    ended = page.evaluate('window.qaNaturalEnds')
    assert len(ended) == 1 and ended[0]['reel'] == 'prologue' and ended[0]['trusted'], ended
    assert abs(ended[0]['duration'] - ended[0]['time']) < .15, ended
    expect(page.locator('#dialogue[data-mode="exchange"]')).to_be_visible()
    expect(page.locator('canvas.film-handoff')).to_be_hidden()
    page.screenshot(path=evidence / 'prologue-to-shore.png')
    assert state(page) == before
    ready(page)
    expect(target(page, 'rope')).to_be_visible()
    return {**native, 'title': 'Soundings', 'captionCount': len(cues), 'captionTimes': times,
            'pausedAt': stopped, 'ended': ended[0],
            'handoff': 'natural end', 'chapter': before['chapter']}


def replay(page, unlocked, *, settings=False):
    before = state(page)
    page.locator('#settings' if settings else '#journey').click()
    if settings:
        page.locator('#film-library').click()
    journey = page.locator('#modal[open]')
    expect(journey).to_be_visible()
    buttons = journey.locator('[data-replay-film]:not(:disabled)')
    available = buttons.evaluate_all('(buttons) => buttons.map(button => button.dataset.replayFilm)')
    assert set(available) == set(unlocked), available
    original = journey.locator(f'[data-replay-film="{unlocked[-1]}"]')
    original.click()
    film = story_film(page, unlocked[-1])
    if settings:
        page.keyboard.press('Escape')
    else:
        film.locator('#film-skip').click()
    expect(film).to_be_hidden()
    expect(journey).to_be_visible()
    expect(original).to_be_focused()
    assert state(page) == before
    if before['completed']:
        journey.locator('#film-feature').click()
        first = story_film(page, 'prologue')
        read_live_video(page, 'prologue')
        first.locator('#film-forward').click()
        following = story_film(page, 'winter')
        read_live_video(page, 'winter')
        following.locator('#film-skip').click()
        expect(following).to_be_hidden()
        expect(journey).to_be_visible()
        assert state(page) == before
    page.locator('#modal-close').click()
    return available


def archive_campaign(page, index, evidence, all_cues):
    page.goto(index.as_uri())
    ready_scene(page)
    measurements = {'prologue': prologue(page, all_cues['prologue'], evidence)}
    initial = replay(page, OPENING_REELS[:1], settings=True)
    target(page, 'rope').click()
    page.wait_for_function(f"{READ}.inventory.includes('rope')")
    saved = state(page)
    page.reload()
    ready(page)
    expect(page.locator('#story-film')).to_be_hidden()
    expect(target(page, 'rope')).to_have_count(0)
    assert state(page) == saved
    unlocks = {'beach': initial}

    def bridge(page, reel):
        curtain(page, reel, all_cues[reel], evidence, measurements)
        if reel == 'winter':
            unlocks['winter'] = replay(page, OPENING_REELS[:2])

    campaign(page, evidence, film=bridge)
    assert tuple(measurements) == REELS
    expect(page.locator('#story-film')).to_be_hidden()
    unlocks['ending'] = replay(page, REELS)
    return measurements, saved, state(page), unlocks


def import_save(page, key, saved):
    # Import the public format in a clean profile. It has no film preference history.
    page.add_init_script(f'if (location.protocol === "file:") localStorage.setItem({json.dumps(key)}, '
                         f'{json.dumps(json.dumps(saved))});')


def old_saves(browser, index, evidence, saved):
    v3 = {**{field: saved[field] for field in ('scene', 'inventory', 'log', 'actions')},
          'version': 3, 'completed': False, 'flags': {name: saved['flags'][name] for name in OLD_FLAGS}}
    for version, example in ((3, v3), (4, saved)):
        with view(browser, evidence, f'legacy-v{version}', reduced=True) as page:
            import_save(page, f'castaways-adventure-v{version}', example)
            page.goto(index.as_uri())
            ready(page)
            expect(page.locator('#story-film')).to_be_hidden()
            assert state(page) == saved
            target(page, 'pole').click()
            page.wait_for_function(f"{READ}.inventory.includes('pole')")
            assert state(page)['actions'] == saved['actions'] + 1
            expect(page.locator('#story-film')).to_be_hidden()
    return [3, 4]


def read_stills(page, film):
    line = film.locator('#film-line')
    plate = film.locator('#film-plate')
    shots = page.evaluate("id => window.CastawayFilmScript.timeline.find(reel => reel.id === id).shots",
                          film.get_attribute('data-film'))
    recorded = []
    for shot in shots:
        expect(line).to_be_visible()
        expect(line).to_have_text(shot['line'])
        expect(plate).to_be_visible()
        page.wait_for_function("document.querySelector('#film-plate')?.complete && "
                               "document.querySelector('#film-plate').naturalWidth > 0")
        src = Path(unquote(urlsplit(plate.get_attribute('src')).path)).name
        assert src == f"{shot['plate']}.webp", (shot['plate'], src)
        recorded.append({'line': line.inner_text(), 'painting': src})
        film.locator('#film-next').tap()
    expect(film).to_be_hidden()
    return recorded


def phone_and_reduced(page, index, evidence):
    page.goto(index.as_uri())
    film = story_film(page, 'prologue')
    expect(film.locator('#film-read')).to_be_focused()
    expect(film.locator('#film-video')).to_be_hidden()
    assert page.evaluate("matchMedia('(prefers-reduced-motion: reduce)').matches")
    film.locator('#film-read').tap()
    expect(film).to_have_attribute('data-mode', 'still')
    assert film.evaluate('el => el.scrollWidth <= el.clientWidth')
    opening = film.locator('#film-line').inner_text()
    film.locator('#film-next').tap()
    expect(film.locator('#film-line')).not_to_have_text(opening)
    film.locator('#film-prev').tap()
    expect(film.locator('#film-line')).to_have_text(opening)
    page.screenshot(path=evidence / 'phone-stills.png')
    seen = read_stills(page, film)
    ready(page)
    target(page, 'rope').tap()
    page.wait_for_function(f"{READ}.inventory.includes('rope')")
    return {'viewport': [390, 844], 'reducedMotion': True, 'stillPages': seen, 'shoreInput': 'tap rope'}


def phone_movie(page, index, cues, evidence):
    page.goto(index.as_uri())
    film = story_film(page, 'prologue')
    film.locator('#film-play').tap()
    native = read_live_video(page, 'prologue')
    verify_cue(page, film, cues[0])
    assert film.evaluate('el => el.scrollWidth <= el.clientWidth')
    page.screenshot(path=evidence / 'phone-movie.png')
    film.locator('#film-skip').tap()
    expect(film).to_be_hidden()
    ready(page)
    expect(target(page, 'rope')).to_be_visible()
    return native


def missing_media(page, index, evidence):
    page.goto(index.as_uri())
    film = story_film(page, 'prologue')
    before = state(page)
    film.locator('#film-play').click()
    expect(film.locator('#film-status')).to_contain_text(re.compile(r'(could|failed|unavailable)', re.I))
    expect(film.locator('#film-read')).to_be_visible()
    expect(film.locator('#film-skip')).to_be_visible()
    page.screenshot(path=evidence / 'missing-film.png')
    film.locator('#film-read').click()
    expect(film).to_have_attribute('data-mode', 'still')
    expect(film.locator('#film-line')).to_be_visible()
    page.wait_for_function("document.querySelector('#film-plate')?.naturalWidth > 0")
    film.locator('#film-skip').click()
    expect(film).to_be_hidden()
    assert before == state(page)
    ready(page)
    target(page, 'rope').click()
    page.wait_for_function(f"{READ}.inventory.includes('rope')")
    return {'missing': [f'prologue.{ext}' for ext in MEDIA_FORMATS],
            'fallback': 'readable still and exit to playable shore'}


def webm_intro(page, index):
    page.goto(index.as_uri())
    film = story_film(page, 'prologue')
    film.locator('#film-play').click()
    page.wait_for_function("document.querySelector('#film-video')?.currentSrc.endsWith('/prologue.webm')")
    result = read_live_video(page, 'prologue', 'webm')
    film.locator('#film-skip').click()
    expect(film).to_be_hidden()
    ready(page)
    expect(target(page, 'rope')).to_be_visible()
    return result


def webm_fallback(browser, index, evidence, saved):
    with view(browser, evidence, 'webm-fresh') as page:
        fresh = webm_intro(page, index)

    with view(browser, evidence, 'webm-library') as page:
        import_save(page, SAVE, saved)
        page.goto(index.as_uri())
        ready(page)
        assert state(page) == saved and saved['completed']
        page.locator('#journey').click()
        library = page.locator('#modal[open]')
        replays = {}
        for reel in REELS:
            library.locator(f'[data-replay-film="{reel}"]').click()
            film = story_film(page, reel)
            if film.get_attribute('data-mode') == 'poster':
                film.locator('#film-play').click()
            replays[reel] = read_live_video(page, reel, 'webm')
            film.locator('#film-skip').click()
            expect(film).to_be_hidden()
        assert state(page) == saved
    return {'chromium': browser.version, 'fresh': fresh, 'replays': replays}


def filmstrip(folder, measurements):
    width, height, gap, row = 560, 350, 24, 394
    gallery = Image.new('RGB', (2 * width + 3 * gap, 4 * row + 2 * gap + 50), '#151e23')
    draw = ImageDraw.Draw(gallery)
    heading = ImageFont.truetype('DejaVuSerif.ttf', 30)
    label = ImageFont.truetype('DejaVuSans.ttf', 17)
    draw.text((gap, gap), 'Until We Return · Eight films in the offline game', fill='#f2e6cd', font=heading)
    for i, (reel, measurement) in enumerate(measurements.items()):
        left, top = gap + (i % 2) * (width + gap), gap + 52 + (i // 2) * row
        with Image.open(folder / f'frame-{reel}.png') as screenshot:
            gallery.paste(screenshot.convert('RGB').resize((width, height), Image.Resampling.LANCZOS), (left, top))
        draw.text((left, top + height + 6), measurement['title'], fill='#f2e6cd', font=label)
    output = folder / 'filmstrip.webp'
    gallery.save(output, quality=91, method=5)
    return digest(output)


def main():
    cli = argparse.ArgumentParser(description=__doc__)
    cli.add_argument('index', type=Path)
    cli.add_argument('archive', type=Path)
    cli.add_argument('evidence', type=Path)
    cli.add_argument('--chromium', help='Path to an H.264/AAC-capable Chrome or Chromium executable')
    cli.add_argument('--check-webm-shell', action='store_true', help='Also check VP9/Opus in the Playwright shell')
    args = cli.parse_args()
    index = args.index.resolve(strict=True)
    if index.name != 'index.html':
        cli.error('pass the root index.html of the extracted edition')
    manifest = stage_archive(index, args.archive)
    film_directory = index.parent / manifest['directory'] / 'assets/story-film'
    all_cues = {reel: read_cues(film_directory / f'{reel}.vtt') for reel in REELS}
    args.evidence.mkdir(parents=True, exist_ok=True)
    with sync_playwright() as tools:
        browser = tools.chromium.launch(executable_path=args.chromium, channel=None if args.chromium else 'chrome')
        try:
            with view(browser, args.evidence, 'desktop') as page:
                measurements, saved, full_save, unlocks = archive_campaign(page, index, args.evidence, all_cues)
            legacy = old_saves(browser, index, args.evidence, saved)
            with view(browser, args.evidence, 'phone', touch=True, reduced=True) as page:
                phone = phone_and_reduced(page, index, args.evidence)
            with view(browser, args.evidence, 'phone-movie', touch=True) as page:
                phone['movie'] = phone_movie(page, index, all_cues['prologue'], args.evidence)
            with TemporaryDirectory() as temp:
                broken = Path(temp) / 'edition'
                shutil.copytree(index.parent, broken)
                missing = tuple(f'prologue.{ext}' for ext in MEDIA_FORMATS)
                broken_media = broken / manifest['directory'] / 'assets/story-film'
                (broken_media / missing[0]).unlink()
                with view(browser, args.evidence, 'alternate-format', expected_missing=missing[:1]) as page:
                    alternate = webm_intro(page, broken / 'index.html')
                (broken_media / missing[1]).unlink()
                with view(browser, args.evidence, 'missing-media', expected_missing=missing) as page:
                    recovery = missing_media(page, broken / 'index.html', args.evidence)
            report = {
                'edition': manifest['release'], 'build': manifest['build'][:20], 'zip_sha256': digest(args.archive),
                'offline': True, 'chromium': browser.version, 'reels': list(measurements), 'errors': [],
                'gallery_sha256': filmstrip(args.evidence, measurements), 'playback': measurements, 'replayUnlocked': unlocks,
                'reloadPreservedActions': saved['actions'], 'legacySaveVersions': legacy, 'phone': phone,
                'alternateFormat': alternate, 'missingMedia': recovery,
            }
        finally:
            browser.close()
        if args.check_webm_shell:
            with tools.chromium.launch() as shell:
                report['webmFallback'] = webm_fallback(shell, index, args.evidence, full_save)
        write(args.evidence / 'story-film.json', report)


if __name__ == '__main__':
    main()
