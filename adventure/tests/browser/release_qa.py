"""Test the extracted public edition through Chromium's normal offline file entry."""
import argparse
import json
import re
import shutil
import traceback
from pathlib import Path
from tempfile import TemporaryDirectory
from urllib.parse import urlsplit

from playwright.sync_api import expect, sync_playwright

from campaign import READ, campaign, ready, state, target

# Independently measured centres on the painted first shore, in stage percentages.
BEACH = {"rope": (34, 71.6), "pole": (48.4, 75.4), "sail": (70.1, 37.6),
         "driftwood": (25.5, 73.5)}


def write(path, data):
    path.write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")


def painted_hit(page, rect, u, v):
    x = rect["x"] + rect["width"] * u / 100
    y = rect["y"] + rect["height"] * v / 100
    hit = page.evaluate("([x,y]) => document.elementFromPoint(x,y)?.closest('[data-target]')?.dataset.target",
                        [x, y])
    return {"point": [x, y], "hit": hit}


def pull_block(page, evidence, touch):
    leave = page.locator('[data-exit="exit_wreck"]')
    (leave.tap if touch else leave.click)()
    page.wait_for_function(f"{READ}.scene === 'wreck'")
    ready(page)
    scene = page.locator("#scene")
    scene.scroll_into_view_if_needed()
    # Centre of the wooden sheave on the painted plate, away from the action button's centre.
    hit = painted_hit(page, scene.bounding_box(), 24.88, 71.57)
    assert hit['hit'] == 'wreck_hawser', hit
    before = state(page)
    strip = page.locator('[data-life="wreck_hawser"] .life-strip')
    expect(strip).to_have_attribute('src', re.compile(r'assets/tactile/reeved-block\.webp$'))
    assert strip.evaluate("el => el.style.left") == '0%'
    (page.touchscreen.tap if touch else page.mouse.click)(*hit['point'])
    selector = '[data-life="wreck_hawser"] .life-strip'
    loaded = page.wait_for_function(
        "selector => { const offset = parseFloat(document.querySelector(selector)?.style.left); "
        "return offset <= -400 && offset; }", arg=selector).json_value()
    page.wait_for_function("selector => document.querySelector(selector)?.style.left === '0%'", arg=selector)
    write(evidence / 'reeved-block.json', {**hit, "loadedOffsetPercent": loaded, "restOffsetPercent": 0})
    assert state(page) == before


def shore(page, evidence, touch):
    assert state(page)["actions"] == 0 and state(page)["inventory"] == []
    assert not page.evaluate("matchMedia('(prefers-reduced-motion: reduce)').matches")
    scene = page.locator("#scene")
    scene.scroll_into_view_if_needed()
    rect = scene.bounding_box()
    hits = {}
    for name, (u, v) in BEACH.items():
        hits[name] = {**painted_hit(page, rect, u, v), "button": target(page, name).bounding_box()}
    write(evidence / 'shore-targets.json', {"stage": rect, "targets": hits})
    assert all(row["hit"] == name for name, row in hits.items()), hits
    page.screenshot(path=evidence / 'shore.png')

    # Use physical coordinates without selector dispatch, forced clicks or engine commands.
    actor = page.locator('#player')
    read_feet = "el => [parseFloat(el.style.left),parseFloat(el.style.top)]"
    origin = actor.evaluate(read_feet)
    x, y = hits["rope"]["point"]
    (page.touchscreen.tap if touch else page.mouse.click)(x, y)
    page.wait_for_function("document.querySelector('#player-sprite')?.dataset.moving === 'true'")
    walk = page.evaluate("""() => new Promise(resolve => {
      const actor=document.querySelector('#player'), sprite=document.querySelector('#player-sprite');
      const levels=new Set(), feet=[], start=performance.now();
      function sample() {
        const view=sprite.querySelector('.walk-viewport');
        if(sprite.dataset.moving==='true' && view && getComputedStyle(view).display!=='none' && getComputedStyle(view).visibility==='visible') {
          levels.add(view.getAttribute('viewBox'));
          feet.push([parseFloat(actor.style.left),parseFloat(actor.style.top)]);
        }
        if(sprite.dataset.moving==='true' && performance.now()-start < 10000) requestAnimationFrame(sample);
        else resolve({sampledMs:Math.round(performance.now()-start), frames:[...levels], samples:feet.length,
          first:feet[0], last:feet.at(-1), asset:view?.querySelector('image')?.getAttribute('href')});
      }
      sample();
    })""")
    expect(page.locator('[data-item="rope"]')).to_be_visible()
    arrival = actor.evaluate(read_feet)
    walk.update(origin=origin, arrival=arrival)
    write(evidence / 'alick-walk.json', walk)
    assert len(walk["frames"]) >= 2 and walk["first"][0] - walk["last"][0] > 2, walk
    assert abs(origin[0] - 63.6) < 0.25 and abs(arrival[0] - 42.16) < 0.25, walk
    assert walk["asset"].endswith("assets/walk/player.webp"), walk
    page.reload()
    ready(page)
    assert not target(page, 'rope').count() and "rope" in state(page)["inventory"]
    pull_block(page, evidence, touch)


def retry_scenery(page, evidence, painting):
    # Only a disposable extracted copy is faulted. The published archive remains intact.
    before = state(page)
    held = painting.with_suffix('.held')
    painting.rename(held)
    try:
        leave = page.locator('[data-exit="exit_wreck"]')
        leave.click()
        retry = page.locator('#scene-retry')
        expect(retry).to_be_visible()
        assert state(page) == before
        expect(page.locator('#backdrop img')).to_have_attribute('src', re.compile(r'(?:^|/)assets/tidepaint/beach\.webp$'))
        page.screenshot(path=evidence / 'missing-painting.png')
        page.locator('#scene-stay').click()
        assert state(page) == before
        leave.click()
        expect(retry).to_be_visible()
    finally:
        held.rename(painting)
    retry.click()
    page.wait_for_function(f"{READ}.scene === 'wreck'")
    ready(page)
    assert state(page)["actions"] == before["actions"] + 1


def run(browser, index, folder, name, scenario, *, touch=False, reduced=False):
    folder.mkdir(parents=True, exist_ok=True)
    view = {"width": 390, "height": 844} if touch else {"width": 1280, "height": 800}
    ctx = browser.new_context(viewport=view, is_mobile=touch, has_touch=touch or scenario is campaign,
                              reduced_motion="reduce" if reduced else "no-preference",
                              offline=True, record_video_dir=folder,
                              record_video_size={"width": 720, "height": 405} if not touch else view)
    page = ctx.new_page()
    page.set_default_timeout(15000)
    errors, external, failed = [], [], []
    page.on('pageerror', lambda err: errors.append(str(err)))
    page.on('request', lambda req: external.append(urlsplit(req.url).hostname)
            if urlsplit(req.url).scheme in ('http', 'https') else None)
    page.on('requestfailed', lambda req: failed.append({"file":Path(urlsplit(req.url).path).name,
                                                        "reason":req.failure}))
    try:
        page.goto(index.as_uri())
        release = page.locator('meta[name="game-release"]').get_attribute('content')
        assert release and release.strip(), 'the published page must identify its release'
        ready(page)
        assert state(page)['actions'] == 0 and state(page)['chapter'] == 1
        print(f"Release {release}: {name}", flush=True)
        write(folder / 'edition.json', {"release":release, "scenario":name, "viewport":view, "offline":True})
        scenario(page, folder)
        missing = {row["file"] for row in failed if row["reason"] == "net::ERR_FILE_NOT_FOUND"}
        if name == 'painting recovery':
            missing.discard('wreck.webp')
        assert not errors and not external and not missing, {
            "page_errors": errors, "remote_requests": external, "missing_files": missing
        }
    except Exception:
        if not page.is_closed():
            try:
                write(folder / 'failure-state.json', state(page))
                page.screenshot(path=folder / 'failure.png', timeout=5000)
            except Exception:
                traceback.print_exc()
        raise
    finally:
        write(folder / 'browser.json', {"errors":errors, "remote_requests":external, "failed_requests":failed})
        ctx.close()  # Flush the recorded video, including a failed run.


def main():
    cli = argparse.ArgumentParser(description=__doc__)
    cli.add_argument('index', type=Path)
    cli.add_argument('evidence', type=Path)
    args = cli.parse_args()
    index = args.index.resolve(strict=True)
    if index.name != 'index.html':
        cli.error('pass the root index.html of the extracted edition')
    with sync_playwright() as pw:
        browser = pw.chromium.launch()
        failures = []
        def check(*args, **kwargs):
            try:
                run(browser, *args, **kwargs)
            except Exception:
                failures.append(args[2])
                traceback.print_exc()

        try:
            for touch in [False, True]:
                name = 'touch-shore' if touch else 'desktop-shore'
                check(index, args.evidence / name, name,
                      lambda page, folder: shore(page, folder, touch), touch=touch)
            check(index, args.evidence / 'campaign', 'seven chapters', campaign, reduced=True)
            with TemporaryDirectory() as temp:
                copy = Path(temp) / 'edition'
                shutil.copytree(index.parent, copy)
                edition = json.loads((copy / 'release.json').read_text(encoding='utf-8'))['directory']
                check(copy / 'index.html', args.evidence / 'retry', 'painting recovery',
                      lambda page, folder: retry_scenery(page, folder, copy / edition / 'assets/tidepaint/wreck.webp'),
                      reduced=True)
            if failures:
                raise SystemExit('Failed release scenarios: '+', '.join(failures))
        finally:
            browser.close()


if __name__ == '__main__':
    main()
