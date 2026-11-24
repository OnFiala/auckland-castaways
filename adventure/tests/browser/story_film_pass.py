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

from campaign import OPENING_REELS, READ, SAVE, campaign, foreword, ready, state, story_film, target
from keyboard_route import tab_to
from release_qa import write

REELS = (*OPENING_REELS, 'epilogue')
ARRIVING_VOICE = dict(zip(OPENING_REELS, ('raynal', 'henry', 'raynal', 'musgrave', 'musgrave', 'raynal', 'musgrave')))
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
        for relative, expected in manifest['files'].items():
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
    # The full desktop campaign also exercises the room's pan hotspot by touch.
    context = browser.new_context(viewport=viewport, is_mobile=touch, has_touch=touch or label=='desktop', offline=True,
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


def wake(film):
    picture = film.locator('.film-picture')
    picture.hover(position={'x': 31, 'y': 35})
    picture.hover(position={'x': 55, 'y': 60})


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
    expect(film).to_have_attribute('data-mode', 'movie')
    native = read_live_video(page, reel)
    verify_timeline(page, reel, native, cues)
    next_cue(page, film, cues)
    page.screenshot(path=evidence / f'frame-{reel}.png')
    if reel == 'epilogue':
        closing_cards = capture_cards(page, film, reel, evidence)
        assert len(closing_cards) == 3 and closing_cards[0]['start'] >= cues[-1]['end'], closing_cards
    ended = natural_end(page, film, reel, native['seconds'])
    assert state(page) == saved
    if reel == 'epilogue':
        expect(page.locator('#completion')).to_be_visible()
        expect(page.locator('#open-epilogue')).to_be_visible()
    measurements[reel] = {**native, 'title': title, 'captionCount': len(cues), 'handoff': 'natural end',
                          'ended': ended, 'chapter': saved['chapter']}
    if reel == 'epilogue':
        measurements[reel]['cards'] = closing_cards
    else:
        measurements[reel]['arrivalDialogue'] = read_arrival(page, reel)
    print(f"{reel}: native picture and sound, {native['seconds']:.1f}s, returned to chapter {saved['chapter']}", flush=True)


def verify_cue(page, film, cue):
    caption = film.locator('#film-caption')
    expect(caption).to_have_text(cue['line'], timeout=20000)
    expect(caption).to_be_visible()
    clock = page.locator('#film-video').evaluate('video => video.currentTime')
    assert cue['start'] - .15 <= clock <= cue['end'] + .15, (clock, cue)
    return clock


def next_cue(page, film, cues):
    now = film.locator('#film-video').evaluate('v => v.currentTime')
    cue = next(cue for cue in cues if cue['end'] > now + .7)
    return verify_cue(page, film, cue)


def enable_sound(film):
    button = film.locator('#film-mute')
    if 'enable sound' in button.inner_text().lower():
        button.click()


def natural_end(page, film, reel, duration):
    expect(film).to_be_hidden(timeout=round((duration + 12) * 1000))
    ended = page.evaluate('id => window.qaNaturalEnds.filter(end => end.reel === id)', reel)
    assert len(ended) == 1 and ended[0]['trusted'], (reel, ended)
    assert abs(ended[0]['duration'] - duration) < .1 and abs(ended[0]['time'] - duration) < .15, ended
    return ended[0]


def read_arrival(page, reel):
    """Follow the first voice(s) in the playable room after the screen has cleared."""
    rail = page.locator('#dialogue')
    expect(rail).to_be_visible()
    expect(rail).to_have_attribute('data-speaker', ARRIVING_VOICE[reel])
    count = 3 if reel == 'prologue' else 1
    lines = []
    for i in range(count):
        portrait = rail.locator('#dialogue-portrait')
        expect(portrait).to_be_visible()
        page.wait_for_function("document.querySelector('#dialogue-portrait').naturalWidth > 0")
        speaker, text = rail.get_attribute('data-speaker'), rail.locator('#dialogue-text').inner_text()
        assert speaker and text.strip()
        lines.append({'speaker': speaker, 'text': text})
        if count > 1:
            advance = rail.locator('#dialogue-next')
            expect(advance).to_have_attribute('aria-label', 'Finish conversation' if i == count-1 else 'Continue conversation')
            advance.click()
    return lines


def capture_cards(page, film, reel, evidence):
    """Read the same opening and closing titles that accompany the painted frames."""
    shots = page.evaluate('id => window.CastawayFilmScript.timeline.find(reel => reel.id === id).shots', reel)
    at, cards = 0, []
    for shot in shots:
        if shot.get('titleCard'):
            # Record actual playback at presentation time. A seek would bypass the edit being tested.
            page.wait_for_function('t => document.querySelector("#film-video").currentTime >= t',
                                   arg=at + min(2, shot['seconds'] / 2), timeout=90000)
            expect(film.locator('#film-card-text')).to_have_text(shot['line'])
            expect(film.locator('#film-caption')).to_be_hidden()
            second = film.locator('#film-video').evaluate('v => v.currentTime')
            assert at <= second < at + shot['seconds'], (second, shot)
            name = f'{reel}-card-{len(cards) + 1}.png'
            page.screenshot(path=evidence / name)
            cards.append({'line': shot['line'], 'start': at, 'observedAt': second, 'screenshot': name})
        at += shot['seconds']
    return cards


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
    expect(film).to_have_attribute('data-mode', 'movie')
    page.wait_for_function("!document.querySelector('#film-video').paused && document.querySelector('#film-video').currentTime > .15")
    page.screenshot(path=evidence / 'prologue-automatic.png')
    enable_sound(film)
    native = read_live_video(page, 'prologue')
    verify_timeline(page, 'prologue', native, cues)
    assert not native['muted']
    opening_cards = capture_cards(page, film, 'prologue', evidence)
    assert len(opening_cards) == 2 and opening_cards[0]['start'] == 0
    assert cues[0]['start'] >= 16, 'Narration must wait for the wordless opening and premise.'
    first = next_cue(page, film, cues)
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
    ended = natural_end(page, film, 'prologue', native['seconds'])
    expect(page.locator('#dialogue[data-mode="exchange"]')).to_be_visible()
    expect(page.locator('canvas.film-handoff')).to_be_hidden()
    page.screenshot(path=evidence / 'prologue-to-shore.png')
    assert state(page) == before
    arrival = read_arrival(page, 'prologue')
    ready(page)
    expect(target(page, 'rope')).to_be_visible()
    return {**native, 'title': 'Soundings', 'captionCount': len(cues), 'captionTimes': times,
            'cards': opening_cards, 'arrivalDialogue': arrival, 'pausedAt': stopped, 'ended': ended,
            'handoff': 'natural end', 'chapter': before['chapter']}


def replay(page, unlocked, *, escape=False):
    before = state(page)
    page.locator('#journey').click()
    journey = page.locator('#modal[open]')
    expect(journey).to_be_visible()
    buttons = journey.locator('[data-replay-film]:not(:disabled)')
    available = buttons.evaluate_all('(buttons) => buttons.map(button => button.dataset.replayFilm)')
    assert set(available) == set(unlocked), available
    original = journey.locator(f'[data-replay-film="{unlocked[-1]}"]')
    original.click()
    film = story_film(page, unlocked[-1])
    read_live_video(page, unlocked[-1])  # The journey's View film click starts the movie.
    if escape:
        page.keyboard.press('Escape')
    else:
        wake(film)
        film.locator('#film-skip').click()
    expect(film).to_be_hidden()
    expect(journey).to_be_visible()
    expect(original).to_be_focused()
    assert state(page) == before
    if before['completed']:
        journey.locator('#film-feature').click()
        first = story_film(page, 'prologue')
        read_live_video(page, 'prologue')
        wake(first)
        first.locator('#film-forward').click()
        following = story_film(page, 'winter')
        read_live_video(page, 'winter')
        wake(following)
        following.locator('#film-skip').click()
        expect(following).to_be_hidden()
        expect(journey).to_be_visible()
        assert state(page) == before
    page.locator('#modal-close').click()
    return available


def archive_campaign(page, index, evidence, all_cues):
    page.goto(index.as_uri())
    button = foreword(page)
    page.wait_for_function("localStorage.getItem('castaways-adventure-v4') !== null")
    before = state(page)
    expect(page.locator('#film-caption')).to_be_hidden()
    expect(page.locator('#game')).to_be_hidden()
    page.screenshot(path=evidence / 'before-the-voyage.png')
    # The introduction is held for the reader, including across reloads before they begin.
    page.wait_for_timeout(1100)
    expect(button).to_be_visible()
    assert page.locator('#film-video').evaluate('v => v.paused && v.currentTime === 0')
    page.reload()
    expect(foreword(page)).to_be_visible()
    assert state(page) == before
    foreword(page).click()
    measurements = {'prologue': prologue(page, all_cues['prologue'], evidence)}
    initial = replay(page, OPENING_REELS[:1], escape=True)
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
    legacy_film_state(browser, index, evidence)
    return [3, 4]


def legacy_film_state(browser, index, evidence):
    # Edition 20 used the same separate storage key but no version or forewordRead property.
    with view(browser, evidence, 'legacy-film-source') as page:
        page.goto(index.as_uri())
        foreword(page)
        page.wait_for_function("localStorage.getItem('castaways-adventure-v4') !== null")
        beach = state(page)
    observed = {}
    for name, position in (('untouched', None), ('bookmarked', 12.0)):
        with view(browser, evidence, f'legacy-film-{name}') as page:
            import_save(page, SAVE, beach)
            pending = None if position is None else {'reel':'prologue', 'position':position,
                                                     'chapter':1, 'scene':'beach', 'actions':0}
            import_save(page, 'castaways-story-v1', {'openingSeen':pending is None, 'pending':pending})
            page.goto(index.as_uri())
            if pending is None:
                foreword(page)
                assert page.locator('#film-video').evaluate('v => v.paused && v.currentTime === 0')
                observed[name] = 'held foreword'
            else:
                film = story_film(page, 'prologue')
                expect(film).to_have_attribute('data-mode', 'movie')
                seconds = page.wait_for_function("""() => {
                    const v=document.querySelector('#film-video');
                    return !v.paused && v.currentTime >= 28 ? v.currentTime : false;
                }""").json_value()
                assert seconds < 30.5, seconds
                observed[name] = {'oldSeconds':position, 'resumedSeconds':seconds}
            assert state(page) == beach
    write(evidence / 'legacy-film-state.json', observed)


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
    start = foreword(page)
    page.screenshot(path=evidence / 'phone-foreword.png')
    start.tap()
    film = story_film(page, 'prologue')
    expect(film).to_have_attribute('data-player', 'compatible', timeout=25000)
    expect(film.locator('#film-video')).to_be_hidden()
    assert page.evaluate("matchMedia('(prefers-reduced-motion: reduce)').matches")
    canvas = film.locator('#film-compat-canvas')
    expect(canvas).to_have_attribute('data-ready', 'true', timeout=15000)
    caption = film.locator('#film-caption')
    expect(caption).to_be_visible(timeout=25000)
    first = caption.inner_text()
    frame = canvas.get_attribute('data-frame')
    page.wait_for_timeout(600)
    assert canvas.get_attribute('data-frame') == frame
    page.wait_for_function("""first => {
      const line=document.querySelector('#film-caption');
      return line.offsetWidth && line.textContent && line.textContent!==first;
    }""", arg=first, timeout=12000)
    assert film.evaluate('el => el.scrollWidth <= el.clientWidth')
    page.screenshot(path=evidence / 'phone-timed-stills.png')
    # The first tap on a hidden control should only reveal it. Mobile browsers
    # can retarget the click once the button under the finger becomes visible.
    hidden_skip = film.locator('#film-skip')
    expect(hidden_skip).to_have_css('opacity', '0')
    bounds = hidden_skip.bounding_box()
    page.touchscreen.tap(bounds['x'] + bounds['width'] / 2, bounds['y'] + bounds['height'] / 2)
    expect(film).to_be_visible()
    expect(hidden_skip).to_have_css('opacity', '1')
    hidden_skip.tap()
    ready(page)
    target(page, 'rope').tap()
    page.wait_for_function(f"{READ}.inventory.includes('rope')")
    return {'viewport':[390, 844], 'reducedMotion':True, 'timedStills':True, 'shoreInput':'tap rope'}


def phone_movie(page, index, cues, evidence):
    page.goto(index.as_uri())
    foreword(page).tap()
    film = story_film(page, 'prologue')
    expect(film).to_have_attribute('data-mode', 'movie')
    enable_sound(film)
    native = read_live_video(page, 'prologue')
    next_cue(page, film, cues)
    assert film.evaluate('el => el.scrollWidth <= el.clientWidth')
    page.screenshot(path=evidence / 'phone-movie.png')
    film.locator('.film-picture').tap()
    film.locator('#film-skip').tap()
    expect(film).to_be_hidden()
    ready(page)
    expect(target(page, 'rope')).to_be_visible()
    return native


def missing_media(page, index, evidence):
    page.goto(index.as_uri())
    foreword(page).click()
    film = story_film(page, 'prologue')
    before = state(page)
    expect(film).to_have_attribute('data-player', 'compatible', timeout=30000)
    page.wait_for_function("Number(document.querySelector('#film-compat-canvas')?.dataset.frame)>3")
    expect(film.locator('#film-caption')).to_be_visible(timeout=25000)
    page.screenshot(path=evidence / 'missing-film.png')
    wake(film)
    film.locator('#film-skip').click()
    expect(film).to_be_hidden()
    assert before == state(page)
    ready(page)
    target(page, 'rope').click()
    page.wait_for_function(f"{READ}.inventory.includes('rope')")
    return {'missing': [f'prologue.{ext}' for ext in MEDIA_FORMATS],
            'fallback': 'automatic moving compatible film and exit to playable shore'}


def last_resort(page, index, evidence):
    page.goto(index.as_uri())
    foreword(page).tap()
    film = story_film(page, 'prologue')
    before = state(page)
    expect(film).to_have_attribute('data-player', 'paintings', timeout=35000)
    expect(film.locator('#film-plate')).to_be_visible()
    expect(film.locator('#film-card-text')).to_contain_text('Until We Return')
    expect(film.locator('#film-caption')).to_be_hidden()
    page.screenshot(path=evidence / 'last-resort.png')
    # The remaining paintings carry both title cards, each narrated scene and an exit to the shore.
    film.locator('.film-picture').tap()
    film.locator('#film-read').tap()
    pages = read_stills(page, film)
    ready(page)
    assert state(page) == before
    return {'stillPages': pages, 'handoff':'shore'}


def webm_intro(page, index):
    page.goto(index.as_uri())
    foreword(page).click()
    film = story_film(page, 'prologue')
    expect(film).to_have_attribute('data-mode', 'movie')
    page.wait_for_function("document.querySelector('#film-video')?.currentSrc.endsWith('/prologue.webm')")
    enable_sound(film)
    result = read_live_video(page, 'prologue', 'webm')
    wake(film)
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
            expect(film).to_have_attribute('data-mode', 'movie')
            replays[reel] = read_live_video(page, reel, 'webm')
            wake(film)
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
                first_sheet = 'prologue-01.webp'
                (broken / manifest['directory'] / 'assets/story-film-compat' / first_sheet).unlink()
                with view(browser, args.evidence, 'all-movies-missing', touch=True,
                          expected_missing=(*missing, first_sheet)) as page:
                    recovery['lastResort'] = last_resort(page, broken / 'index.html', args.evidence)
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
