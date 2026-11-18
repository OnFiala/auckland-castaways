"""A fresh campaign, using the same player-facing hint sequence as voyage-ui.cjs."""
from playwright.sync_api import expect

SAVE = "castaways-adventure-v4"
READ = f"JSON.parse(localStorage.getItem('{SAVE}'))"
WORK = {
    "chest": "notch near press",
    "roof": "pan wetSeam under left right pour",
    "drill": "fresh scratch edge reclaim",
    "fastening": "pressPlank giveNails bow strike release proveJoint",
    "hull": "middle pack pack pitch",
    "rig": "clew port lull haul",
    "chart": "origin east inlet verify",
    "landing": "high pay crest trough",
}


def close_if_shown(page, css):
    control = page.locator(css).first
    if control.is_visible():
        control.click()


def state(page):
    return page.evaluate(f"() => {READ}")


def wait_for_action(page, before, allow_work=False):
    page.wait_for_function(
        f"([count, work]) => {READ}.actions > count || (work && document.querySelector('#workbench').open)",
        arg=[before["actions"], allow_work],
    )


def item(page, name):
    return page.locator(f'[data-item="{name}"]')


def target(page, name):
    return page.locator(f'[data-target="{name}"]')


def ready(page):
    expect(page.locator('#backdrop > img')).to_be_visible()
    page.wait_for_function("document.querySelector('#backdrop img')?.naturalWidth > 0")
    page.locator('#scene-loading').wait_for(state='hidden')
    close_if_shown(page, '#dialogue-close')
    close_if_shown(page, '#chapter-banner-close')
    close_if_shown(page, '#dismiss-hint')


def click(control):
    control.click()


def work(page, activate):
    bench = page.locator('#workbench')
    puzzle = bench.get_attribute('data-fw-puzzle')
    moves = WORK[puzzle].split()
    if puzzle == 'roof' and bench.locator('[data-fw-point="under"]').is_visible():
        moves = moves[2:]  # This campaign already traced the leak via the room pan and reloaded.
    for move in moves:
        activate(bench.locator(f'[data-fw-point="{move}"]'))
    bench.locator('[data-fw-finish]').click()
    expect(bench).not_to_be_visible()
    return puzzle


def pan_point(page):
    image = page.locator('.fw-cabin-traces .fw-tin-pan').bounding_box()
    button = target(page, 'tinPan').bounding_box()
    x, y = image['x']+image['width']/2, image['y']+image['height']/2
    assert abs(button['x']+button['width']/2-x) < 1 and abs(button['y']+button['height']/2-y) < 1
    assert page.evaluate("([x,y]) => document.elementFromPoint(x,y)?.closest('button')?.dataset.target",
                         [x, y]) == 'tinPan'
    return x,y


def inspect_pan(page, evidence):
    before = state(page)
    item(page, 'tinderbox').click()
    pan_point(page)
    desktop = page.viewport_size
    page.set_viewport_size({"width":390,"height":844})
    target(page, 'tinPan').scroll_into_view_if_needed()
    page.touchscreen.tap(*pan_point(page))
    bench = page.locator('#workbench')
    bench.locator('[data-fw-point="wetSeam"]').click()
    # The leak still has to be traced. Opening the survey through the pan reveals no answer.
    bench.locator('[data-fw-point="pan"]').click()
    bench.screenshot(path=evidence / 'pan-observed.png')
    bench.locator('[data-fw-close]').first.click()
    expect(item(page, 'tinderbox')).to_have_attribute('aria-pressed', 'true')
    page.set_viewport_size(desktop)
    page.reload()
    ready(page)
    assert state(page) == before, "surveying a roof must not consume a tool or advance the voyage"
    target(page, 'tinPan').focus()
    page.keyboard.press('Enter')
    bench.locator('[data-fw-point="wetSeam"]').click()
    expect(bench.locator('#fw-description')).to_contain_text('stitched hide')
    expect(bench.locator('[data-fw-point="under"]')).to_have_count(0)
    bench.locator('[data-fw-close]').first.click()


def check_repair(page):
    before = state(page)
    target(page, 'tinPan').scroll_into_view_if_needed()
    page.mouse.click(*pan_point(page))
    bench = page.locator('#workbench')
    expect(bench.locator('#fw-description')).to_contain_text('rim is dry')
    expect(bench.locator('.fw-drip,.fw-pan-ring,[data-fw-point]')).to_have_count(0)
    bench.locator('[data-fw-close]').first.click()
    assert state(page) == before


def archive(page, evidence):
    before = state(page)
    page.locator('#open-epilogue').click()
    table = page.locator('#witness-archive')

    def file_slip(slip, pocket):
        table.locator(f'[data-ep-slip="{slip}"]').click()
        table.locator(f'[data-ep-place="{pocket}"]').click()

    file_slip('matches', 'dalgarno')
    file_slip('boat', 'smith')
    table.locator('[data-ep-page="dates"]').click()
    file_slip('wreck', 'wreckMay')
    file_slip('rescue', 'rescueMay')
    file_slip('slope', 'august')
    table.locator('[data-ep-page="mark"]').click()
    table.locator('[data-ep-finding="unresolved"]').click()
    expect(table.locator('.ep-coda')).to_contain_text('Origin unknown')
    expect(table.locator('.ep-coda')).to_contain_text('George Dalgarno, Andrew Smith and Robert Holding')
    table.screenshot(path=evidence / 'epilogue.png')
    table.locator('.ep-coda [data-ep-close]').click()
    expect(table).not_to_be_visible()
    assert state(page) == before


def next_move(page):
    # The guide reads the published hint and exit graph. No game command or storage write
    # happens here. Every trip, inventory use, conversation and chapter transition below is a click.
    return page.evaluate(f"""() => {{
      const s={READ}, e=window.AdventureEngine, hint=e.hint(s);
      const paths=[[s.scene, null]], seen=new Set([s.scene]);
      for (const [room,first] of paths) {{
        if(room===hint.sceneId) return {{hint, exit:first}};
        for(const edge of e.getExits({{...s,scene:room}})) {{
          if(!seen.has(edge.to)) {{seen.add(edge.to);paths.push([edge.to,first||edge.id]);}}
        }}
      }}
      throw Error('No route to '+hint.sceneId);
    }}""")


def campaign(page, evidence, activate=click):
    chapters = set()
    completed_work = set()
    pan_checked = False
    for _ in range(160):
        ready(page)
        before = state(page)
        chapter = before['chapter']
        if chapter not in chapters:
            chapters.add(chapter)
            page.screenshot(path=evidence / f'chapter-{chapter}.png')
            if chapter == 2:
                inspect_pan(page, evidence)
        if chapter == 2 and before['flags']['roofSealed'] and not pan_checked:
            check_repair(page)
            pan_checked = True
        if before['completed']:
            expect(page.locator('#completion')).to_be_visible()
            assert before['repairRoll'] == {'place': 'peg', 'seen': True}
            page.reload()
            ready(page)
            assert state(page) == before
            expect(page.locator('#completion')).to_be_visible()
            expect(page.locator('#ending-portraits figure')).to_have_count(5)
            page.screenshot(path=evidence / 'rescue.png')
            archive(page, evidence)
            assert chapters == set(range(1, 8)) and completed_work == set(WORK) and pan_checked
            return
        close_if_shown(page, '#cancel-item')
        if before['chapterComplete']:
            activate(page.locator('#chapter-exit'))
            page.wait_for_function(f"(n) => {READ}.actions > n || document.querySelector('#repair-roll').open",
                                   arg=before['actions'])
            roll = page.locator('#repair-roll')
            if roll.is_visible():
                activate(roll.locator('[data-roll-fold]'))
                activate(roll.locator('[data-roll-spot="peg"]'))
                roll.locator('[data-roll-leave]').click()
                page.wait_for_function(f"(n) => {READ}.chapter > n", arg=chapter)
            continue
        move = next_move(page)
        h = move['hint']
        print(f"Chapter {chapter}, {before['scene']}: {move['exit'] or h['targetId']}", flush=True)
        if move['exit']:
            activate(page.locator(f'[data-exit="{move["exit"]}"]'))
        elif h.get('combineItems'):
            for ingredient in h['combineItems']:
                item(page, ingredient).click()
        else:
            if h.get('itemId'):
                item(page, h['itemId']).click()
            activate(target(page, h['targetId']))
        wait_for_action(page, before, allow_work=True)
        if page.locator('#workbench').is_visible():
            completed_work.add(work(page, activate))
            wait_for_action(page, before)
        if chapter == 7 and not before['flags']['suppliesShared'] and state(page)['flags']['suppliesShared']:
            close_if_shown(page, '#dialogue-close')
            roll = page.locator('#repair-roll')
            activate(roll.locator('[data-roll-spot="peg"]'))
            roll.locator('[data-roll-leave]').click()
    raise AssertionError("The crew did not return within 160 voyages, actions and passages.")
