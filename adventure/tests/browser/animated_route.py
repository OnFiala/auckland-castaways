"""Play all seven chapters from the unpacked offline edition with ordinary motion."""
import argparse
from pathlib import Path

from playwright.sync_api import TimeoutError as PlaywrightTimeout, expect, sync_playwright

from campaign import campaign, state
from release_qa import run, write


# The callback only reads what the renderer has mounted. Each distinct visible pose
# crosses the browser boundary once per chapter and character, including after reload.
OBSERVE = """() => {
  const seen = new Set();
  function sample() {
    requestAnimationFrame(sample);
    if (document.hidden || document.querySelector('dialog[open], #completion:not([hidden])')) return;
    const chapter = parseInt(document.querySelector('#chapter-label')?.textContent, 10);
    if (!chapter) return;
    for (const sprite of document.querySelectorAll('#player-sprite[data-moving="true"], .actor-canvas[data-moving="true"]')) {
      const viewport = sprite.querySelector('.walk-viewport'), clip = viewport?.querySelector('.atlas-clip');
      if (!viewport || !clip || !viewport.checkVisibility({checkOpacity:true, checkVisibilityCSS:true})) continue;
      const player = sprite.id === 'player-sprite', actor = player ? sprite.closest('#player') : sprite.closest('[data-target]');
      const image = clip.querySelector('image')?.getAttribute('href');
      const phase = viewport.getAttribute('viewBox');
      if (!actor || !image || !phase || clip.getAttribute('viewBox') !== phase) continue;
      const id = player ? actor.dataset.identity : actor.dataset.target;
      const role = player ? document.querySelector('#perspective-label').textContent : '';
      const key = [chapter, player, id, role, image, phase].join('|');
      if (seen.has(key)) continue;
      const box = viewport.getBoundingClientRect();
      if (box.width <= 0 || box.height <= 0 || box.right <= 0 || box.bottom <= 0 ||
          box.left >= innerWidth || box.top >= innerHeight) continue;
      seen.add(key);
      window.reportPaintedStep({chapter,player,id,role,image,phase,x:parseFloat(actor.style.left),
                                y:parseFloat(actor.style.top)}).catch(() => {});
    }
  }
  requestAnimationFrame(sample);
}"""


def animated(page, evidence):
    samples = []
    shots = {}
    dialogue = {}
    assert not page.evaluate("matchMedia('(prefers-reduced-motion:reduce)').matches")
    def remember_pose(sample):
        samples.append(sample)
    page.expose_function('reportPaintedStep', remember_pose)
    # The roof survey and completed rescue both exercise a real page reload.
    page.add_init_script(f"({OBSERVE})();")
    page.evaluate(OBSERVE)

    def activate(control):
        target = control.get_attribute('data-target')
        control.click()
        if target not in ('boatFrame', 'boatMast', 'rescueProvisions', 'rescueBoat', 'henry'):
            return
        current = state(page)
        chapter = current['chapter']
        # The first fitted strake is 25.55 stage points from the salvage entrance.
        # The final return to the cutter is 49.1 points from the camp entrance.
        walking_shot = (chapter, target) in ((4, 'boatFrame'), (4, 'boatMast'), (7, 'rescueProvisions')) or (
            chapter == 7 and target == 'rescueBoat' and current['flags']['georgeFound'])
        if walking_shot and chapter not in shots:
            try:
                page.wait_for_function("document.querySelector('#player-sprite').dataset.moving === 'true'", timeout=1800)
            except PlaywrightTimeout:
                return  # A player can already be standing at the work; sample the next trip.
            actor = page.locator('#player')
            measure = """el => ({x:parseFloat(el.style.left), y:parseFloat(el.style.top),
                moving:el.querySelector('#player-sprite').dataset.moving === 'true',
                phase:el.querySelector('.walk-viewport').getAttribute('viewBox')})"""
            before = actor.evaluate(measure)
            # Page screenshots don't wait for the moving scene element to become stable.
            # A single pose may span both samples; all phases are checked separately.
            pixels = page.screenshot()
            after = actor.evaluate(measure)
            if before['moving'] and after['moving']:
                (evidence / f'walking-{chapter}.png').write_bytes(pixels)
                shots[chapter] = {'before':before, 'after':after, 'target':target}
        if chapter == 7 and target == 'henry' and not dialogue:
            rail = page.locator('#dialogue[data-mode="exchange"]')
            expect(rail).to_be_visible(timeout=15000)
            portrait = rail.locator('#dialogue-portrait')
            expect(portrait).to_be_visible()
            page.wait_for_function("document.querySelector('#dialogue-portrait').naturalWidth > 0")
            dialogue.update(speaker=rail.locator('#dialogue-speaker').inner_text(),
                            line=rail.locator('#dialogue-text').inner_text(),
                            portrait=portrait.get_attribute('src'))
            assert dialogue['speaker'] and dialogue['line'] and 'assets/cast-portraits/' in dialogue['portrait']
            page.screenshot(path=evidence / 'spoken-exchange.png')

    try:
        campaign(page, evidence, activate)
    finally:
        chapters = {}
        for sample in samples:
            actors = chapters.setdefault(sample['chapter'], {})
            name = ('protagonist/' if sample['player'] else 'companion/') + sample['id']
            track = actors.setdefault(name, {'atlas':sample['image'], 'phases':[]})
            if sample['phase'] not in track['phases']:
                track['phases'].append(sample['phase'])
        write(evidence / 'animated-route.json', {'chapters':chapters, 'samples':samples,
              'walkingScreenshots':shots, 'conversation':dialogue})
    assert shots.keys() == {4, 7} and dialogue
    for chapter in range(1, 8):
        actor, role = ('player', 'Alick McLaren') if chapter <= 5 else ('musgrave', 'Captain Musgrave')
        moving = [s for s in samples if s['chapter'] == chapter and s['player']]
        assert len({s['phase'] for s in moving}) >= 2, (chapter, moving)
        assert all(s['id'] == actor and s['role'] == role and
                   ('/' + s['image']).endswith(f'/assets/walk/{actor}.webp') for s in moving), (chapter, moving)
        assert len({(s['x'], s['y']) for s in moving}) >= 2, (chapter, moving)
        print(f"Chapter {chapter}: {role}, {len({s['phase'] for s in moving})} visible gait phases", flush=True)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('index', type=Path)
    parser.add_argument('evidence', type=Path)
    args = parser.parse_args()
    index = args.index.resolve(strict=True)
    if index.name != 'index.html':
        parser.error('pass the root index.html of the extracted edition')
    with sync_playwright() as pw:
        browser = pw.chromium.launch()
        try:
            run(browser, index, args.evidence, 'animated seven chapters', animated, reduced=False, touch_input=True)
        finally:
            browser.close()


if __name__ == '__main__':
    main()
