"""Exercise movie delivery from the published ZIP using a private, in-memory HTTPS origin."""
import argparse
import hashlib
import io
import json
import mimetypes
from contextlib import contextmanager
from pathlib import Path
from urllib.parse import unquote, urlsplit

from PIL import Image, ImageChops, ImageStat
from playwright.sync_api import Error as PlaywrightError, expect, sync_playwright

from campaign import ready, state, story_film
from release_qa import write
from story_film_pass import OLD_FLAGS, stage_archive, wake

ORIGIN = 'https://castaways-release.test'
VIDEO_EXTENSIONS = ('.mp4', '.webm')


# Observe real audio samples. Native media and the compatible soundtrack keep their own
# real playback clocks. The extra analyser branch is silent and never advances either.
AUDIO_OBSERVER = """(() => {
  const Audio = window.AudioContext || window.webkitAudioContext;
  const taps = [];
  window.qaTrustedInputs = 0;
  for (const event of ['pointerdown','keydown','click']) {
    document.addEventListener(event, e => { if (e.isTrusted) window.qaTrustedInputs++; }, true);
  }
  function tap(source, isMovie, native) {
    const ctx = source.context, analyser = ctx.createAnalyser(), silent = ctx.createGain();
    analyser.fftSize = 2048;
    silent.gain.value = 0;
    source.connect(analyser); analyser.connect(silent); silent.connect(ctx.destination);
    taps.push({analyser, ctx, isMovie, native});
  }
  let native;
  document.addEventListener('click', () => {
    const el = document.getElementById('film-video');
    if (!Audio || !el) return;
    if (!native) {
      const ctx = new Audio();
      native = ctx.createMediaElementSource(el);
      native.connect(ctx.destination);
      tap(native, () => !el.paused && !el.muted, true);
    }
    native.context.resume().catch(() => {});
  }, true);
  if (window.AudioBufferSourceNode) {
    const routes = new WeakMap(), connect = AudioNode.prototype.connect;
    AudioNode.prototype.connect = function(destination, ...params) {
      const result = connect.call(this, destination, ...params);
      if (this instanceof AudioBufferSourceNode || destination === this.context.destination)
        routes.set(this, destination);
      return result;
    };
    const start = AudioBufferSourceNode.prototype.start;
    AudioBufferSourceNode.prototype.start = function(...args) {
      const result = start.apply(this, args);
      const output = routes.get(this);
      if (this.buffer?.duration >= 10 && output && routes.get(output) === this.context.destination)
        tap(output, () => true, false);
      return result;
    };
  }
  window.qaFilmSound = function (isNative) {
    let peak = 0;
    for (const {analyser, ctx, isMovie, native} of taps) {
      if (native !== isNative || ctx.state !== 'running' || !isMovie()) continue;
      const samples = new Float32Array(analyser.fftSize);
      analyser.getFloatTimeDomainData(samples);
      for (const sample of samples) peak = Math.max(peak, Math.abs(sample));
    }
    return peak;
  };
})();"""

# There is no trust token, running Site, local server or external request in this
# fixture. It models the actual Site's whole-file 200 from the exact distributed bytes.
class Delivery:
    def __init__(self, index, faults=None):
        self.root = index.parent
        self.faults = faults
        self.requests = []
        self.media = []
        self.unexpected = []
        self.pending = []

    def route(self, route):
        request = route.request
        url = urlsplit(request.url)
        if url.scheme in ('blob', 'data', 'about'):
            return route.continue_()
        if url.hostname != urlsplit(ORIGIN).hostname:
            self.unexpected.append(url.hostname)
            return route.abort()
        relative = unquote(url.path.lstrip('/')) or 'index.html'
        path = (self.root / relative).resolve()
        if not path.is_relative_to(self.root) or not path.is_file():
            self.unexpected.append(relative)
            return route.fulfill(status=404, body='Missing')
        headers = {'Content-Type': mimetypes.guess_type(path.name)[0] or 'application/octet-stream',
                   'Content-Length': str(path.stat().st_size)}
        if path.suffix in VIDEO_EXTENSIONS:
            entry = {'file': path.name, 'type': request.resource_type, 'range': request.headers.get('range')}
            self.media.append(entry)
            if self.faults == 'pending':
                entry['response'] = 'pending'
                self.pending.append(route)
                return  # All preferred movie requests stay unresolved, including fetch and native retries.
            entry['response'] = 200
        if self.faults == 'policy' and path.name == 'index.html':
            headers['Content-Security-Policy'] = "media-src 'none'"
        self.requests.append(relative)
        route.fulfill(status=200, headers=headers, path=path)


@contextmanager
def visit(browser, index, *, faults=None, reduced=False):
    context = browser.new_context(viewport={'width': 960, 'height': 720}, service_workers='block',
                                  reduced_motion='reduce' if reduced else 'no-preference')
    delivery = Delivery(index, faults)
    context.route('**/*', delivery.route)
    page = context.new_page()
    errors = []
    page.set_default_timeout(15000)
    page.add_init_script(AUDIO_OBSERVER)
    page.on('pageerror', lambda exc: errors.append(str(exc)))
    try:
        page.goto(ORIGIN, wait_until='domcontentloaded')
        yield page, delivery
        assert not (errors or delivery.unexpected), (errors, delivery.unexpected)
    finally:
        for route in delivery.pending:
            try:
                route.abort()
            except PlaywrightError:
                pass  # The player may have cancelled the unanswered fetch during recovery.
        context.close()


def clock(page):
    return page.evaluate("window.CastawayFilm.position()")


def initial_save(page):
    # The film can start before the underlying shore has finished its first paint and save.
    page.wait_for_function("localStorage.getItem('castaways-adventure-v4') !== null")
    return state(page)


def picture(page):
    image = Image.open(io.BytesIO(page.locator('.film-picture').screenshot(animations='allow'))).convert('RGB')
    # Exclude both title and subtitle areas. A changing loading label cannot pass the motion test.
    w, h = image.size
    return image.crop((int(w * .15), int(h * .33), int(w * .89), int(h * .69))).resize((128, 64))


def compare(before, after):
    diff = ImageChops.difference(after, before)
    average = sum(ImageStat.Stat(diff).mean) / 3
    pixels = sum(max(pixel) > 2 for pixel in diff.getdata())
    assert average > .06 and pixels > 30, (pixels, average)
    return pixels, round(average, 3)


def active_renderer(page, compatible=None):
    return page.wait_for_function("""required => {
      const panel = document.querySelector('#story-film'), v = document.querySelector('#film-video');
      const c = document.querySelector('#film-compat-canvas');
      const canvas = panel.dataset.player === 'compatible';
      if (required !== null && required !== canvas) return;
      if (canvas ? c?.offsetWidth && c.dataset.ready === 'true' && Number(c.dataset.frame) > 1
                 : !v.hidden && !v.paused && v.videoWidth && v.currentTime > .25 && v.readyState >= 2)
          return panel.dataset.player;
    }""", arg=compatible, timeout=48000).json_value()


def movement(page, reel, output, label, *, compatible=None, timeout=30000):
    film = story_film(page, reel)
    expect(film).to_have_attribute('data-mode', 'movie', timeout=timeout)
    active_renderer(page, compatible)
    if 'enable sound' in film.locator('#film-mute').inner_text().lower():
        film.locator('#film-mute').click()
    sound = page.wait_for_function("""required => {
      const renderer = document.getElementById('story-film').dataset.player;
      const compatible = renderer === 'compatible';
      if (required !== null && required !== compatible) return;
      const peak = window.qaFilmSound(!compatible);
      return peak > .0002 ? {renderer, peak} : false;
    }""", arg=compatible, timeout=timeout).json_value()
    first = clock(page)
    before = picture(page)
    page.wait_for_function("old => window.CastawayFilm.position() >= old + 1.0", arg=first, timeout=10000)
    after = picture(page)
    current = clock(page)
    pixels, average = compare(before, after)
    assert current > first, (label, first, current)
    measurement = dict(player=sound['renderer'], decodedAudioPeak=sound['peak'], reel=reel, clock=[first, current],
                       changedPixels=pixels, meanDifference=round(average, 3))
    after.save(output / f'{label}.png')
    return measurement


def started_without_gesture(page, reel, *, compatible=None):
    """The unopened profile must already be showing moving frames before any sound-unlock click."""
    film = story_film(page, reel)
    active_renderer(page, compatible)
    first = clock(page)
    before = picture(page)
    page.wait_for_function('t => window.CastawayFilm.position() >= t + .9', arg=first)
    pixels, _ = compare(before, picture(page))
    input_count = page.evaluate('window.qaTrustedInputs')
    assert input_count == 0, 'the opening must start before user input'
    start = clock(page)
    expect(film.locator('#film-caption')).to_be_visible(timeout=13000)
    # Some platforms permit sound immediately, others require a player gesture.
    control = film.locator('#film-mute')
    if 'enable sound' in control.inner_text().lower():
        control.click()
    else:
        # Exercise a real control to unlock the test audio analyser without muting the film.
        wake(film)
        film.locator('#film-captions').click()
        film.locator('#film-captions').click()
    return {'clock': start, 'changedPixels': pixels, 'trustedInputs': input_count}


def pause_and_resume(page, reel, output, label, *, compatible=None):
    film = story_film(page, reel)
    button = film.locator('#film-pause')
    wake(film)
    button.click()
    expect(button).to_have_attribute('aria-pressed', 'true')
    when = clock(page)
    page.wait_for_timeout(540)
    assert abs(clock(page) - when) < .06, (label, when, clock(page))
    button.click()
    expect(button).to_have_attribute('aria-pressed', 'false')
    return movement(page, reel, output, label, compatible=compatible)


def exit_to_game(page, reel):
    film = story_film(page, reel)
    wake(film)
    film.locator('#film-skip').click()
    expect(film).to_be_hidden()
    ready(page)


def standard_entrypoints(browser, index, output):
    report = {}
    with visit(browser, index) as (page, delivery):
        film = story_film(page, 'prologue')
        original = initial_save(page)
        started = started_without_gesture(page, 'prologue')
        report['opening'] = movement(page, 'prologue', output, 'opening')
        report['opening']['beforeFirstGesture'] = started
        report['resume'] = pause_and_resume(page, 'prologue', output, 'resume')
        page.wait_for_function('window.CastawayFilm.position() >= 4.5')
        last = clock(page)
        page.reload(wait_until='domcontentloaded')
        film = story_film(page, 'prologue')
        stored = page.evaluate("JSON.parse(localStorage.getItem('castaways-story-v1')).pending")
        assert stored['reel'] == 'prologue' and last - .4 <= stored['position'] <= last + 2.2, (last, stored)
        restarted = started_without_gesture(page, 'prologue')
        assert restarted['clock'] >= stored['position'] - .25, (stored, restarted)
        report['reloaded'] = movement(page, 'prologue', output, 'reloaded')
        report['reloaded']['bookmarkSeconds'] = stored['position']
        assert state(page) == original
        exit_to_game(page, 'prologue')
        page.locator('#journey').click()
        replay = page.locator('[data-replay-film="prologue"]')
        replay.click()
        report['journey'] = movement(page, 'prologue', output, 'journey')
        wake(story_film(page, 'prologue'))
        page.locator('#film-skip').click()
        expect(replay).to_be_focused()
        assert state(page) == original
        page.locator('#modal-close').click()

        # Two public v4 restore fixtures isolate the passage and completed-game controls.
        # All movement and media checks use the UI. The separate campaign pass earns these saves.
        for completed in (False, True):
            saved = page.evaluate("""([done, firstFlags]) => {
              const e=window.AdventureEngine, save=e.createGame();
              Object.assign(save, {chapter:done?7:1, scene:done?'landing':'camp', completed:done,
                chapterComplete:true, actions:done?96:17, inventory:done?[]:['prybar','axe','tinderbox']});
              for (const key of e.FLAGS) save.flags[key] = done || firstFlags.includes(key);
              if (done) save.repairRoll={place:'peg',seen:true};
              if (!e.restore(save)) throw Error('Invalid v4 test save');
              return save;
            }""", [completed, OLD_FLAGS])
            page.evaluate('(save) => localStorage.setItem("castaways-adventure-v4", JSON.stringify(save))', saved)
            page.reload(wait_until='domcontentloaded')
            ready(page)
            assert state(page) == saved
            if completed:
                if page.locator('#keep-exploring').is_visible():
                    page.locator('#keep-exploring').click()
                page.locator('#journey').click()
                feature = page.locator('#film-feature')
                feature.click()
                report['playlist'] = movement(page, 'prologue', output, 'playlist')
                wake(story_film(page, 'prologue'))
                page.locator('#film-forward').click()
                report['nextReel'] = movement(page, 'winter', output, 'next-reel')
                wake(story_film(page, 'winter'))
                page.locator('#film-skip').click()
                expect(feature).to_be_focused()
                assert state(page) == saved
            else:
                page.locator('#chapter-exit').click()
                report['chapter'] = movement(page, 'winter', output, 'winter')
                after = state(page)
                assert after['chapter'] == 2 and after['actions'] > saved['actions']
                exit_to_game(page, 'winter')
                assert state(page) == after
        report['movieRequests'] = delivery.media
    return report


def recovery(browser, index, output, fault):
    with visit(browser, index, faults=fault) as (page, delivery):
        film = story_film(page, 'prologue')
        original = initial_save(page)
        started = started_without_gesture(page, 'prologue', compatible=True)
        result = movement(page, 'prologue', output, f'{fault}-recovery', compatible=True, timeout=48000)
        result['beforeFirstGesture'] = started
        result['resume'] = pause_and_resume(page, 'prologue', output, f'{fault}-resume', compatible=True)
        expect(film.locator('#film-caption')).to_be_visible(timeout=12000)
        exit_to_game(page, 'prologue')
        assert state(page) == original
        result['movieRequests'] = delivery.media
        if fault == 'pending':
            assert delivery.media and all(req['response'] == 'pending' for req in delivery.media)
        return result


def reduced_and_skipped(browser, index, output):
    with visit(browser, index, reduced=True) as (page, delivery):
        film = story_film(page, 'prologue')
        expect(film).to_have_attribute('data-reduced', 'true')
        expect(film.locator('#film-video')).to_be_hidden()
        before = initial_save(page)
        caption = film.locator('#film-caption')
        expect(caption).to_be_visible(timeout=20000)
        first = caption.inner_text()
        a = picture(page)
        page.wait_for_timeout(650)
        b = picture(page)
        assert ImageChops.difference(a, b).getbbox() is None, 'Reduced motion must hold the painted shot'
        page.wait_for_function("""first => {
          const el = document.getElementById('film-caption');
          return el.offsetWidth && el.textContent && el.textContent !== first;
        }""", arg=first, timeout=16000)
        assert not delivery.media, 'Reduced motion need not fetch a moving video'
        exit_to_game(page, 'prologue')
        assert state(page) == before
        # Skip is an explicit existing preference, not the automatic fresh-player default.
        page.evaluate("""(flags) => {
          const e=window.AdventureEngine, save=e.createGame();
          Object.assign(save,{scene:'camp',chapterComplete:true,actions:17,inventory:['prybar','axe','tinderbox']});
          for (const key of flags) save.flags[key]=true;
          if (!e.restore(save)) throw Error('Invalid test save');
          localStorage.setItem('castaways-adventure-v4', JSON.stringify(save));
          localStorage.setItem('castaways-film-prefs-v1', JSON.stringify({chapters:'skip'}));
        }""", OLD_FLAGS)
        page.reload(wait_until='domcontentloaded')
        ready(page)
        expect(page.locator('#story-film')).to_be_hidden()
        page.locator('#chapter-exit').click()
        page.wait_for_function("JSON.parse(localStorage.getItem('castaways-adventure-v4')).chapter===2")
        expect(page.locator('#dialogue')).to_be_visible()
        expect(page.locator('#story-film')).to_be_hidden()
        return {'heldShot':True, 'timedCaptions':True, 'savedSkipChapter':state(page)['chapter']}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('index', type=Path, help='root index.html from the extracted downloadable edition')
    parser.add_argument('archive', type=Path, help='same downloadable ZIP')
    parser.add_argument('evidence', type=Path)
    parser.add_argument('--browser', choices=('chromium', 'webkit', 'firefox'), default='chromium')
    parser.add_argument('--executable', help='optional path to the requested browser executable')
    args = parser.parse_args()
    index = args.index.resolve(strict=True)
    manifest = stage_archive(index, args.archive)
    args.evidence.mkdir(parents=True, exist_ok=True)
    with args.archive.open('rb') as archive:
        checksum = hashlib.file_digest(archive, 'sha256').hexdigest()
    with sync_playwright() as playwright:
        engine = getattr(playwright, args.browser)
        launch = {'executable_path': args.executable} if args.executable else {}
        if args.browser == 'chromium' and not args.executable:
            launch['channel'] = 'chrome'
        with engine.launch(**launch) as browser:
            scenarios = standard_entrypoints(browser, index, args.evidence)
            scenarios['pendingNative'] = recovery(browser, index, args.evidence, 'pending')
            scenarios['mediaPolicy'] = recovery(browser, index, args.evidence, 'policy')
            scenarios['reducedMotion'] = reduced_and_skipped(browser, index, args.evidence)
            report = {'edition':manifest['release'], 'build':manifest['build'][:20], 'zip_sha256':checksum,
                      'browser':args.browser, 'browserVersion':browser.version,
                      'delivery':'intercepted HTTPS, full 200 responses from the exact ZIP',
                      'scenarios':scenarios, 'errors':[]}
            write(args.evidence/'hosted-film.json', report)
            print(json.dumps(report, ensure_ascii=False), flush=True)


if __name__ == '__main__':
    main()
