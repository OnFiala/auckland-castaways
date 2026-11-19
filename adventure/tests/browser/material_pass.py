"""Compare shipped render modes in offline Chromium using the same reachable save and pose."""
import argparse
import base64
import hashlib
import io
import json
import zipfile
from pathlib import Path
from urllib.parse import urlsplit

from PIL import Image, ImageChops, ImageDraw, ImageFont, ImageStat
from playwright.sync_api import expect, sync_playwright

from campaign import READ, SAVE, ready, state


# Values are stage percentages, from the registered painting, independent of the renderer.
# The changing surface, opaque boundary and independent control are reported separately.
PLATES = {
    'beach': ('The Shore', {
        'surf': (2, 61, 20, 64), 'wetSand': (16, 76, 25, 81), 'sky': (15, 24, 29, 34),
    }),
    'cabin': ('Epigwaitt / winter light', {
        'glass': (15, 18.5, 20, 24), 'mullion': (21.1, 19, 21.8, 24),
        'timber': (53, 32, 58, 39),
    }),
    'forge': ('The working forge', {
        'hearth': (38, 43, 45, 48), 'floor': (35, 64, 47, 68), 'doorway': (3, 44, 8, 49),
    }),
    'crossing-wet': ('An open boat / standing water', {
        'bilge': (64, 80, 73, 82), 'ocean': (50, 47, 60, 52), 'sky': (8, 20, 17, 28),
    }),
    'crossing-dry': ('An open boat / after bailing', {
        'bilge': (64, 80, 73, 82), 'ocean': (50, 47, 60, 52), 'deck': (60, 88, 70, 91),
    }),
}

# Construct saves with the game's public puzzle engine. The UI campaign is tested independently.
FIXTURES = """() => {
  const e=window.AdventureEngine, result={};
  let s=e.createGame();
  function oneMove() {
    if(s.chapterComplete) return e.advance(s);
    const h=e.hint(s);
    if(s.scene!==h.sceneId) {
      const paths=[[s.scene,null]], visited=new Set([s.scene]);
      for(const [id,first] of paths) {
        if(id===h.sceneId) return e.travel(s,first);
        for(const edge of e.getExits({...s,scene:id})) {
          if(!visited.has(edge.to)){visited.add(edge.to);paths.push([edge.to,first||edge.to]);}
        }
      }
      throw Error('Cannot reach '+h.sceneId);
    }
    if(h.combineItems) return e.combine(s,...h.combineItems);
    if(h.itemId) return e.useItem(s,h.itemId,h.targetId);
    return e.interact(s,h.targetId,'use');
  }
  for(let i=0;i<160;i++) {
    let key=s.scene;
    if(key==='forge' && !s.flags.forgeLit) key=null;
    if(key==='crossing') key=s.flags.boatDry?'crossing-dry':'crossing-wet';
    if(['beach','cabin','forge','crossing-wet','crossing-dry'].includes(key) && !result[key]) {
      const checked=e.restore(s);
      if(!checked) throw Error('Invalid fixture '+key);
      result[key]=checked;
    }
    if(Object.keys(result).length===5) return result;
    const next=oneMove();
    if(!next.changed) throw Error(next.text);
    s=next.state;
  }
  throw Error('Incomplete visual fixtures');
}"""

GEOMETRY = """() => {
  const entries={};
  for(const el of document.querySelectorAll('#scene,#settings,#command-dock,#player,button[data-target],button[data-exit]')){
    const r=el.getBoundingClientRect();
    if(r.width && r.height) entries[el.id || el.dataset.target || el.dataset.exit]=[r.x,r.y,r.width,r.height];
  }
  return entries;
}"""

QUALITY = '#lighting-quality'
CANVAS = '#material-lighting'


def digest(path):
    with path.open('rb') as file:
        return hashlib.file_digest(file, 'sha256').hexdigest()


def write_json(path, obj):
    path.write_text(json.dumps(obj, indent=2, ensure_ascii=False) + '\n', encoding='utf-8')


def settle(page):
    page.evaluate("() => new Promise(done => requestAnimationFrame(() => requestAnimationFrame(done)))")


def renderer(page, expected):
    page.wait_for_function(
        "s => document.querySelector('#material-lighting')?.dataset.materialState === s", arg=expected)
    settle(page)
    return page.locator(CANVAS).evaluate(
        "c => ({state:c.dataset.materialState, key:c.dataset.materialKey, quality:c.dataset.materialQuality,"
        "width:c.width, height:c.height, frames:Number(c.dataset.materialFrames || 0),"
        "history:Number(c.dataset.materialHistory || 0), antialias:c.dataset.antialias})")


def select_mode(page, value):
    page.locator('#settings').click()
    select = page.get_by_label('Scene lighting', exact=True)
    expect(select).to_have_attribute('id', QUALITY[1:])
    assert set(select.locator('option').evaluate_all('options => options.map(o => o.value)')) == {
        'auto', 'cinematic', 'balanced', 'original'}
    select.select_option(value)
    expect(select).to_have_value(value)
    page.locator('#modal-close').click()
    page.mouse.move(1, 1)
    observation = renderer(page, 'off' if value == 'original' else 'ready')
    if value != 'auto':
        expect(page.locator('#scene')).to_have_attribute('data-lighting-mode', value)
    return observation


def stage_save(page, saved):
    page.evaluate("([key,s]) => localStorage.setItem(key, JSON.stringify(s))", [SAVE, saved])
    page.reload()
    ready(page)
    assert state(page) == saved
    page.evaluate('document.fonts.ready')
    settle(page)


def pixels(page, path=None):
    scene = page.locator('#scene')
    scene.scroll_into_view_if_needed()
    rect = scene.bounding_box()
    raw = page.screenshot(path=path)
    with Image.open(io.BytesIO(raw)) as shot:
        box = (round(rect['x']), round(rect['y']), round(rect['x']+rect['width']), round(rect['y']+rect['height']))
        assert box[0]>=0 and box[1]>=0 and box[2]<=shot.width and box[3]<=shot.height, (box, shot.size)
        return shot.convert('RGB').crop(box)


def region(image, percent):
    left, top, right, bottom = percent
    return image.crop((round(left*image.width/100), round(top*image.height/100),
                       round(right*image.width/100), round(bottom*image.height/100)))


def measure(diff):
    maximum = ImageChops.lighter(ImageChops.lighter(diff.getchannel('R'), diff.getchannel('G')), diff.getchannel('B'))
    hist = maximum.histogram()
    count = sum(hist)
    return {'meanRGB':round(sum(ImageStat.Stat(diff).mean)/3, 3),
            'fractionOver4':round(sum(hist[5:])/count, 4), 'fractionOver12':round(sum(hist[13:])/count, 4),
            'maxChannelDelta':maximum.getextrema()[1]}


def tonal_change(original, cinematic):
    # Display-referred BT.709 luma, in 8-bit code values. Use Original to assign
    # pixels to groups so that a changed shadow cannot leave its own sample.
    matrix = (.2126, .7152, .0722, 0)
    before, after = (im.convert('L', matrix) for im in (original, cinematic))
    hist = {'shadowsBelow40': [0]*511, 'highlightsAbove210': [0]*511}
    for a,b in zip(before.tobytes(), after.tobytes()):
        if a < 40:
            hist['shadowsBelow40'][b-a+255] += 1
        elif a > 210:
            hist['highlightsAbove210'][b-a+255] += 1
    summary = {}
    for name, counts in hist.items():
        total, running, middle = sum(counts), 0, []
        for delta, count in enumerate(counts, -255):
            for index in ((total-1)//2, total//2):
                if running <= index < running+count:
                    middle.append(delta)
            running += count
        summary[name] = {'pixels':total, 'medianDelta':sum(middle)/2 if total else None}
    initial = ImageStat.Stat(before).stddev[0]
    final = ImageStat.Stat(after).stddev[0]
    summary.update(originalLumaSD=round(initial, 3), cinematicLumaSD=round(final, 3),
                   lumaSDRatio=round(final/initial, 4))
    return summary


def compare(page, key, saved, out):
    stage_save(page, saved)
    select_mode(page, 'original')
    def weather():
        return page.evaluate(f"CastawayWeather.illumination(document.querySelector('#place-weather'), {READ})")

    watch = weather()
    geometry = page.evaluate(GEOMETRY)
    original = pixels(page, out / f'{key}-original.png')
    material = select_mode(page, 'cinematic')
    lit = pixels(page, out / f'{key}-cinematic.png')
    after = page.evaluate(GEOMETRY)
    assert watch == weather(), (key, 'the weather changed between observations')
    assert set(geometry) == set(after)
    shift = max(abs(a-b) for k in geometry for a,b in zip(geometry[k],after[k]))
    assert shift < .51, (key, 'control or actor shifted', shift)
    assert state(page) == saved
    delta = ImageChops.difference(original, lit)
    tone = tonal_change(original, lit)
    # Half a stop above neutral sRGB code 40 is 48.39. A 9-code median lift
    # across populated shadows therefore triggers review even at the bright
    # edge of the shadow group. Individual local highlights remain unrestricted.
    shadows = tone['shadowsBelow40']
    if shadows['pixels'] >= 64:
        assert shadows['medianDelta'] <= 9, (key, 'broad shadow lift', tone)
    probes = {name:measure(region(delta, box)) for name, box in PLATES[key][1].items()}
    whole = measure(delta)
    assert whole['fractionOver4'] > .015 and whole['meanRGB'] > .65, (key, whole)
    # This third observation bounds moving scenery/noise during the pair. No layer is hidden.
    page.wait_for_timeout(360)
    repeat = ImageChops.difference(lit, pixels(page))
    drift = measure(repeat)
    repeated = renderer(page, 'ready')
    assert material['frames'] > 0 and repeated['frames'] == material['frames'], (key, material, repeated)
    assert drift['meanRGB'] <= .45 and drift['fractionOver4'] <= .024, (key, 'reduced-motion drift', drift)
    assert max(row['meanRGB'] for row in probes.values()) > 1, (key, probes)
    maps = page.evaluate("""s => {
        const {surface, medium} = CastawayMaterialAtlas.get(s.scene, s.flags);
        return {surface, medium};
    }""", saved)
    # Read the exact shipped maps independently of the compositor. The PNGs retain
    # material values under zero alpha (an ordinary 2D canvas would discard them).
    for map_name, uri in maps.items():
        channels = {'medium': ('metalByte', 'receiverByte', 'ambientOcclusionByte', 'emissionByte'),
                    'surface': ('normalXByte', 'normalYByte', 'heightByte', 'roughnessByte')}[map_name]
        with Image.open(io.BytesIO(base64.b64decode(uri.split(',',1)[1])), formats=['PNG']) as packed:
            data = packed.convert('RGBA')
            for name, bounds in PLATES[key][1].items():
                means = ImageStat.Stat(region(data, bounds)).mean
                probes[name].update({ch:round(v, 2) for ch,v in zip(channels, means)})
    reflection_layer = page.locator('#planar-reflections')
    if key == 'crossing-wet':
        expect(reflection_layer).to_have_attribute('data-surface','bilge')
    if key == 'crossing-dry':
        expect(reflection_layer).not_to_be_visible()
    print(key, 'change', whole, 'same-mode drift', drift, 'tonal change', tone, flush=True)
    return {'source':'staged reachable save', 'chapter':saved['chapter'], 'actions':saved['actions'],
            'scene':saved['scene'], 'weatherTimeSeconds':watch['time'], 'material':material, 'scenePixels':list(lit.size),
            'maxGeometryShiftCSSPx':shift, 'originalVsCinematic':whole, 'cinematicRepeat':drift,'tonalChange':tone,
            'regions':{k:{'boxPercent':b, **probes[k]} for k,b in PLATES[key][1].items()}}, (original, lit)


def wet_walk(page, saved, mode, out):
    stage_save(page, saved)
    select_mode(page, mode)
    before = pixels(page)
    stage = page.locator('#scene').bounding_box()
    # Pick open ground using the real button hit areas, inside the registered wet receiver.
    # Its visible return must also fit on the sand below both boots.
    point = page.evaluate("""r => {
      const surface = CastawayReflections.surfaceFor({scene:'beach'});
      const polygon = CastawayStage.profile('beach').walkPolygon;
      for (const v of [77.5,76.5,75.5,74.5,73.5]) {
        for (const u of [35,37,38,33,32,31,30,29,28,27,25,23,21,19,17,15]) {
          const x = r.x+r.width*u/100, y = r.y+r.height*v/100;
          const hit = document.elementFromPoint(x,y);
          if (!hit?.closest('#scene') || hit.closest('button')) continue;
          const onSand = [[u,v],[u-2.2,v+8],[u+2.2,v+8]].every(([x,y]) =>
            CastawayGround.contains(surface.points, {x,y}));
          if (onSand && CastawayGround.contains(polygon,{x:u,y:v})) return {x,y,u,v};
        }
      }
      throw Error('No open sand under the painted hotspot bounds');
    }""", stage)
    page.mouse.click(point['x'], point['y'])
    page.wait_for_function("""p => {
      const actor=document.querySelector('#player');
      return Math.abs(parseFloat(actor.style.left)-p.u)<.25 && Math.abs(parseFloat(actor.style.top)-p.v)<.25
        && document.querySelector('#player-sprite').dataset.moving!=='true';
    }""", arg=point)
    if mode == 'cinematic':
        expect(page.locator('#planar-reflections .planar-reflection--player > svg')).to_be_visible()
    page.mouse.move(1, 1)
    settle(page)
    after = pixels(page, out / f'wet-walk-{mode}.png')
    feet = page.locator('#player').evaluate("el => [parseFloat(el.style.left),parseFloat(el.style.top)]")
    return before, after, feet


def reflection(page, saved, out):
    original_before, original_after, foot1 = wet_walk(page, saved, 'original', out)
    lit_before, lit_after, foot2 = wet_walk(page, saved, 'cinematic', out)
    assert all(abs(a-b) < .05 for a,b in zip(foot1, foot2)), (foot1, foot2)
    x,y = foot2
    box = (x-2.2,y+3,x+2.2,y+8)
    # Compare the *signed* before/after changes in both modes. The rectangle is below
    # Alick's feet. His on-screen body and the existing contact shadow are excluded.
    modes = [[region(im, box) for im in pair] for pair in
             [(original_before, original_after), (lit_before, lit_after)]]
    original, cinematic = [[im.tobytes() for im in pair] for pair in modes]
    residual = bytes(min(255, abs((d-c)-(b-a))) for a,b,c,d in zip(*original,*cinematic))
    diff = measure(Image.frombytes('RGB', modes[0][0].size, residual))
    assert diff['fractionOver4'] > .006 and diff['meanRGB'] > .12, (foot2, diff)
    host = page.locator('#planar-reflections')
    expect(host).to_have_attribute('data-surface', 'wet-sand')
    reflected = host.locator('.planar-reflection--player > svg')
    expect(reflected).to_be_visible()
    source = reflected.locator('image').get_attribute('href')
    assert source.endswith('assets/walk/player.webp') or source.endswith('/player.webp'), source
    expect(host).to_have_attribute('aria-hidden','true')
    assert host.evaluate("el => getComputedStyle(el).pointerEvents") == 'none'
    supported = page.locator(CANVAS).evaluate("""c => {
        const gl = c.getContext('webgl2');
        return [...gl.getInternalformatParameter(gl.RENDERBUFFER, gl.RGBA8, gl.SAMPLES)];
    }""")
    edge = host.locator('.planar-reflection__receiver')
    if any(2 <= n <= 4 for n in supported):
        page.wait_for_function("document.querySelector('.planar-reflection__receiver')?.dataset.coverage.startsWith('msaa-')")
        coverage = edge.get_attribute('data-coverage')
        assert int(coverage.removeprefix('msaa-')) in supported
        # The actual mask contains fractional edge coverage, beyond its binary interior.
        uri = edge.evaluate("e => e.style.maskImage")
        payload = uri.split('base64,', 1)[1].split('"', 1)[0]
        with Image.open(io.BytesIO(base64.b64decode(payload)), formats=['PNG']) as receipt:
            counts = receipt.getchannel('A').histogram()
            intermediate = sum(counts[1:255])
            assert counts[0] and counts[255] and intermediate > 6
    else:
        coverage = edge.get_attribute('data-coverage')
        intermediate = 0
    # Include matched, unmodified scene crops large enough to see the reflected boots and coat.
    detail = (x-13, y-17, x+13, y+9)
    plates = tuple(region(frame, detail) for frame in (original_after, lit_after))
    return {'feetPercent':foot2,'receiverPercent':box,'sprite':source,'modeAdjustedWalkDelta':diff,
            'detailPercent':detail,'edgeCoverage':coverage,'supportedSamples':supported,'partiallyCoveredPixels':intermediate,
            'method':'Real ground click repeated with the same start and destination in both modes.'}, plates


def assert_registered_regions(plates):
    def at(plate, name, channel='receiverByte'):
        return plates[plate]['regions'][name][channel]

    assert at('beach','surf') > at('beach','sky') + 15
    assert at('cabin','glass') < 10
    assert at('cabin','glass','roughnessByte') + 40 < at('cabin','timber','roughnessByte')
    assert at('cabin','glass','roughnessByte') + 25 < at('cabin','mullion','roughnessByte')
    assert at('forge','hearth','emissionByte') > at('forge','floor','emissionByte') + 1
    assert at('crossing-wet','bilge') > at('crossing-dry','bilge') + 15
    assert at('crossing-wet','ocean') > at('crossing-wet','sky') + 15


def work_plate(page, saved, folder):
    images = {}
    for mode in ('original', 'cinematic'):
        stage_save(page, saved)
        select_mode(page, mode)
        page.locator('[data-target="tinPan"]').click()
        bench = page.locator('#workbench')
        expect(bench).to_have_attribute('data-fw-puzzle','roof')
        plate = bench.locator('.fw-board')
        layer = plate.locator('.fw-material-light')
        if mode == 'cinematic':
            expect(layer).to_have_attribute('data-material','tin pan')
            assert layer.evaluate("e => getComputedStyle(e).pointerEvents") == 'none'
        else:
            expect(layer).to_have_count(0)
        page.mouse.move(1,1)
        raw = plate.screenshot(path=folder / f'pan-{mode}.png')
        with Image.open(io.BytesIO(raw)) as shot:
            images[mode] = shot.convert('RGB')
        if mode == 'cinematic':
            bench.locator('[data-fw-point="pan"]').click()
            expect(bench.locator('[data-fw-point="wetSeam"]')).to_be_visible()
        bench.locator('[data-fw-close]').first.click()
        assert state(page) == saved
    delta = ImageChops.difference(images['original'], images['cinematic'])
    sample = measure(region(delta,(54,84,66,90)))
    assert sample['maxChannelDelta'] >= 2, sample
    return {'material':'tin pan', 'screenDelta':sample, 'input':'examined pan and revealed the wet seam'}


def motion_modes(browser, index, errors, external, failed):
    ctx = browser.new_context(viewport={'width':960,'height':720}, offline=True)
    try:
        page = ctx.new_page()
        listen(page, errors, external, failed)
        page.goto(index.as_uri())
        ready(page)
        select_mode(page, 'cinematic')
        page.wait_for_function("document.querySelector('#material-lighting').dataset.materialHistory === '4'")
        temporal = renderer(page, 'ready')
        assert temporal['antialias'] == 'taau' and temporal['quality'] == 'high', temporal
        select_mode(page, 'balanced')
        page.wait_for_function("document.querySelector('#material-lighting').dataset.antialias === 'fxaa'")
        balanced = renderer(page, 'ready')
        assert balanced['history'] == 0 and balanced['quality'] == 'balanced', balanced
        return {'cinematic':temporal, 'balanced':balanced}
    finally:
        ctx.close()


def context_cycle(page):
    info = page.locator(CANVAS).evaluate("""canvas => {
      const gl=canvas.getContext('webgl2') || canvas.getContext('webgl');
      const meta=gl.getExtension('WEBGL_debug_renderer_info');
      const ext=gl.getExtension('WEBGL_lose_context');
      if(!ext) throw Error('Context loss extension missing');
      const renderer=meta ? gl.getParameter(meta.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER);
      // Browser fault injection only. The game owns both event handlers.
      window.qaRestoreLostContext=()=>ext.restoreContext();
      ext.loseContext();
      return {renderer};
    }""")
    renderer(page, 'fallback')
    before = state(page)
    page.locator('[data-target="rope"]').click()
    page.wait_for_function(f"{READ}.inventory.includes('rope')")
    page.evaluate('window.qaRestoreLostContext()')
    restored = renderer(page, 'ready')
    assert restored['width'] > 0 and restored['height'] > 0
    assert state(page)['actions'] == before['actions'] + 1
    return {**info,'fallbackInput':'rope', 'restored':restored}


def phone(browser, index, folder, errors, external, failed):
    ctx = browser.new_context(viewport={'width':390,'height':844}, device_scale_factor=1,
                              is_mobile=True,has_touch=True,offline=True,reduced_motion='reduce')
    try:
        page = ctx.new_page()
        listen(page, errors, external, failed)
        page.goto(index.as_uri())
        ready(page)
        select_mode(page, 'cinematic')
        page.locator('#settings').tap()
        expect(page.locator(QUALITY)).to_have_value('cinematic')
        page.locator('#modal-close').tap()
        page.locator('[data-target="rope"]').tap()
        page.wait_for_function(f"{READ}.inventory.includes('rope')")
        page.screenshot(path=folder / 'phone.png')
        return {'viewport':[390,844], 'input':'tap rope', 'item':state(page)['inventory'][0],
                'material':renderer(page,'ready')}
    finally:
        ctx.close()


def listen(page, errors, external, failed):
    page.set_default_timeout(20000)
    page.on('pageerror', lambda err: errors.append(str(err)))
    page.on('request', lambda req: external.append(req.url) if urlsplit(req.url).scheme in ('http','https') else None)
    page.on('requestfailed', lambda req: failed.append({'file':Path(urlsplit(req.url).path).name,'reason':req.failure}))


def sheet(plates, detail, edition, path):
    width, gutter = 1024, 28
    height = round(width * 9 / 16)
    top, row_height = 140, height+62
    canvas = Image.new('RGB', (2*width+3*gutter, top+(len(plates)+1)*row_height+gutter), '#eee6d4')
    draw = ImageDraw.Draw(canvas)
    serif = ImageFont.truetype('DejaVuSerif.ttf', 41)
    note = ImageFont.truetype('DejaVuSans.ttf', 23)
    draw.text((gutter,16), 'Until We Return', font=serif, fill='#342c27')
    draw.text((gutter,72), f'Edition {edition}  /  Offline Chromium · matching saved scenes and poses',
              font=note, fill='#525550')
    for col, name in enumerate(('Original','Cinematic')):
        draw.text((gutter+col*(width+gutter),top-35), name, font=note, fill='#352d27')
    for i,(key, frames) in enumerate(plates.items()):
        y=top+i*row_height
        for col, frame in enumerate(frames):
            canvas.paste(frame.resize((width,height),Image.Resampling.LANCZOS),(gutter+col*(width+gutter),y))
        draw.text((gutter,y+height+10),PLATES[key][0],font=note,fill='#352d27')
    y = top+len(plates)*row_height
    for col, frame in enumerate(detail):
        canvas.paste(frame.resize((width,height),Image.Resampling.LANCZOS), (gutter+col*(width+gutter),y))
    draw.text((gutter,y+height+10), 'Alick on the wet sand  /  Matching detail after a ground click',
              font=note, fill='#352d27')
    canvas.save(path, 'WEBP', quality=92, method=5)


def main():
    cli=argparse.ArgumentParser(description=__doc__)
    cli.add_argument('index',type=Path)
    cli.add_argument('archive',type=Path)
    cli.add_argument('output',type=Path)
    cli.add_argument('--chromium', help='Local Chromium executable; CI uses the pinned Playwright build')
    args=cli.parse_args()
    index=args.index.resolve(strict=True)
    if index.name != 'index.html':
        cli.error('pass the index.html from the extracted game ZIP')
    with zipfile.ZipFile(args.archive) as archive:
        manifest = json.loads(archive.read('release.json'))
        for name, expected in manifest['files'].items():
            if digest(index.parent / name) != expected:
                raise ValueError(f'Extracted file differs from shipped manifest: {name}')
    args.output.mkdir(parents=True, exist_ok=True)
    errors, external, failed = [], [], []
    with sync_playwright() as pw:
        browser=pw.chromium.launch(executable_path=args.chromium, args=[
            '--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'])
        try:
            ctx=browser.new_context(viewport={'width':1440,'height':1050},offline=True,reduced_motion='reduce')
            page=ctx.new_page()
            listen(page, errors, external, failed)
            page.goto(index.as_uri())
            ready(page)
            edition=page.locator('meta[name="game-release"]').get_attribute('content')
            build=page.locator('meta[name="game-build"]').get_attribute('content')
            assert int(edition)>=16 and edition == manifest['release'] and build == manifest['build'][:20]
            page.locator('#settings').click()
            expect(page.locator(QUALITY)).to_have_value('auto')
            page.locator('#modal-close').click()
            select_mode(page,'balanced')
            page.reload()
            ready(page)
            page.locator('#settings').click()
            expect(page.locator(QUALITY)).to_have_value('balanced')
            page.locator('#modal-close').click()
            saved=page.evaluate(FIXTURES)
            observations, images={}, {}
            for key in PLATES:
                observations[key], images[key]=compare(page,key,saved[key],args.output)
            assert_registered_regions(observations)
            closeup=work_plate(page,saved['cabin'],args.output)
            reflected, detail=reflection(page,saved['beach'],args.output)
            stage_save(page,saved['beach'])
            select_mode(page,'cinematic')
            recovery=context_cycle(page)
            ctx.close()
            moving=motion_modes(browser,index,errors,external,failed)
            mobile=phone(browser,index,args.output,errors,external,failed)
            assert not (errors or external or failed), (errors,external,failed)
            gallery=args.output/'lighting-study.webp'
            sheet(images,detail,edition,gallery)
            write_json(args.output/'lighting-study.json', {
                'edition':edition, 'build':build, 'zip_sha256':digest(args.archive),
                'sheet_sha256':digest(gallery),'chromium':browser.version,'offline':True,
                'method':'Paired in-game Settings captures with system reduced motion. Images are scene crops from the unaltered viewport. Saves come from the shipped puzzle engine.',
                'plates':observations,'restoredPreference':'balanced','reflection':reflected,'contextLoss':recovery,
                'closeup':closeup,'motionModes':moving,'phone':mobile,'errors':errors,'remoteRequests':external,'failedRequests':failed})
        finally:
            browser.close()


if __name__=='__main__':
    main()
