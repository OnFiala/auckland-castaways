"""Offline pixel and lifetime checks for the relighting canvas.

Run with python adventure/tests/material-renderer-browser.py. Requires Playwright
and Chromium (CHROMIUM may point to a local binary). The synthetic material has
strong red/green normals in RGBA pixels to expose channel or row registration bugs.
"""
import base64
import json
import os
import struct
import tempfile
import zlib
from pathlib import Path

from playwright.sync_api import sync_playwright

DIST = Path(os.environ.get("CASTAWAY_RENDERER_DIST", Path(__file__).resolve().parents[1] / "dist")).resolve()


def png(width, height, pixel):
    def chunk(kind, data):
        return (struct.pack(">I", len(data)) + kind + data
                + struct.pack(">I", zlib.crc32(kind + data)))

    rows = b"".join(b"\0" + bytes(c for x in range(width) for c in pixel(x, y))
                    for y in range(height))
    data = (b"\x89PNG\r\n\x1a\n" + chunk(b"IHDR", struct.pack(">2I5B", width, height, 8, 6, 0, 0, 0))
            + chunk(b"IDAT", zlib.compress(rows)) + chunk(b"IEND", b""))
    return "data:image/png;base64," + base64.b64encode(data).decode()


def synthetic():
    # Medium has zero alpha across the unlit plate. Hidden RGB still supplies
    # wet receivers, metals and open occlusion. A premultiplying decoder would
    # clear those values and the wet/dry and bright/shaded tests would fail.
    w, h = 32, 18
    base = dict(key="test-dry", width=w, height=h,
                surface=png(w, h, lambda x, y: (100 if x < 16 else 150, 150,
                                                190 if x < 10 else 128, 100)),
                medium=png(w, h, lambda x, y: (0, 230 if y < 9 else 0, 255 if x < 20 else 30, 0)),
                pigment=png(w, h, lambda x, y: (125, 113, 94, 255) if x < 27
                            else (240, 240, 240, 255) if y < 9 else (12, 12, 12, 255)),
                light=png(w, h, lambda x, y: (150, 155, 158, 180 if y < 9 else 0)))
    wet = dict(base, key="test-lit",
               medium=png(w, h, lambda x, y: (15, 230 if y < 9 else 0, 255, 230 if y > 8 else 0)))
    return [base, wet]


def run(page, file):
    page.goto(file.as_uri())
    page.evaluate("""assets => {
      window.CastawayMaterialAtlas={get:(scene,flags)=>scene==='absent'?null:assets[+!!flags.forgeLit]};
      window.f={scene:'forge',flags:{},weather:{shade:.15,rain:.05},time:1,mode:'high',width:320,height:180,dpr:1};
      window.c=document.querySelector('canvas');window.r=CastawayMaterialRenderer.create(c);
      window.render=(changes={})=>{f={...f,...changes};r.render(f);return r.status};
      window.gl=c.getContext('webgl2');
      window.sampler=()=>{let out={};for(const [name,x,y] of [['top',30,150],['bottom',30,30],['shadow',260,30],['ink',304,30],['paper',304,150]]){
        const v=new Uint8Array(4);gl.readPixels(x,y,1,1,gl.RGBA,gl.UNSIGNED_BYTE,v);out[name]=[...v];
      }return out};
      render();
    }""", synthetic())
    page.wait_for_function("r.status.state!=='loading'")
    status = page.evaluate("r.status")
    assert status["state"] == "ready", status
    pixels = page.evaluate("""()=>{render({time:1.11});return sampler()}""")
    def visible(rgba, pigment):
        return [col + base * (1 - rgba[3] / 255) for col, base in zip(rgba[:3], pigment)]

    painted = (125, 113, 94)
    top = visible(pixels["top"], painted)
    shadow = visible(pixels["shadow"], painted)
    assert pixels["top"][3] > 0 and pixels["top"] != pixels["bottom"], pixels
    assert top[2] - shadow[2] > 7 and top[0] - shadow[0] > 5, (top, shadow)
    for probe, level in (("ink",12), ("paper",240)):
        assert max(abs(c - level) for c in visible(pixels[probe], [level]*3)) < 7, (probe,pixels)
    assert page.evaluate("r.status.antialias") == "taa"
    assert page.evaluate("render({time:1.24}).history") == 3
    assert page.evaluate("render({motionKey:'turn',time:1.37}).history") == 1
    assert page.evaluate("render({weather:{shade:.9,rain:.95},time:1.49}).history") == 1
    large = page.evaluate("render({width:960,height:540})")
    assert large["antialias"] == "taau" and large["history"] == 1, large
    assert page.evaluate("render({time:1.60}).history") == 2
    native = page.evaluate("render({aa:'taa'})")
    assert native["antialias"] == "taa" and native["history"] == 1, native
    assert page.evaluate("render({width:320,height:180,aa:'auto'}).history") == 1
    assert page.evaluate("render({reduced:true}).antialias") == "fxaa"
    assert page.evaluate("(()=>{const a=r.status.frames;render({time:1.62});return r.status.frames===a})()")
    # The decoder may finish between two Playwright calls. Present the old plate,
    # switch the repair and read the cleared framebuffer in one JavaScript turn.
    transition = page.evaluate("""()=>{
      const before=render({reduced:false,time:1.65});
      const previous=sampler();
      const loading=render({flags:{forgeLit:true},reduced:true});
      return {before,previous,loading,cleared:sampler()};
    }""")
    before, loading = transition["before"], transition["loading"]
    assert before["state"] == "ready" and before["key"] == "test-dry", transition
    assert transition["previous"]["top"][3] > 0, transition
    assert loading["state"] == "loading" and loading["key"] == "test-lit", transition
    assert loading["frames"] == before["frames"] and loading["history"] == 0, transition
    assert all(pixel == [0,0,0,0] for pixel in transition["cleared"].values()), transition
    page.wait_for_function("r.status.state==='ready' && r.status.key==='test-lit'")
    assert page.evaluate("render({reduced:false,aa:'off'}).antialias") == "off"
    new_pixels = page.evaluate("""()=>{render({time:1.81});return sampler()}""")
    assert visible(new_pixels["bottom"], painted)[0] > visible(pixels["bottom"], painted)[0]+16, (pixels, new_pixels)
    assert page.evaluate("gl.getError()") == 0

    # Trigger two transitions before the first decode completes.
    page.evaluate("()=>{render({flags:{}});render({flags:{forgeLit:true}})}")
    page.wait_for_function("r.status.state==='ready' && r.status.key==='test-lit'")
    page.evaluate("()=>{window.ext=gl.getExtension('WEBGL_lose_context');ext.loseContext()}")
    page.wait_for_function("r.status.reason==='context-lost'")
    page.wait_for_timeout(150)
    page.evaluate("ext.restoreContext()")
    page.wait_for_function("r.status.state==='ready'")
    assert page.evaluate("render({mode:'off'}).state") == "off"
    assert page.evaluate("render({mode:'balanced'}).state") == "loading"
    page.wait_for_function("r.status.state==='ready'")
    assert page.evaluate("render({scene:'absent'}).reason") == "no-atlas"
    page.evaluate("r.dispose()")
    assert page.evaluate("r.status.state") == "off"
    return {"webgl":status["quality"], "dry":pixels, "lit":new_pixels}


if __name__ == "__main__":
    with tempfile.TemporaryDirectory() as tmp, sync_playwright() as pw:
        file = Path(tmp) / "test.html"
        file.write_text('<canvas></canvas>' + ''.join('<script src="{}"></script>'.format(
            (DIST / name).as_uri()) for name in ("lighting-direction.js", "material-renderer.js")))
        browser = pw.chromium.launch(executable_path=os.environ.get("CHROMIUM"),
                                     args=["--no-sandbox","--use-angle=swiftshader","--enable-unsafe-swiftshader"])
        page = browser.new_page()
        print(json.dumps(run(page, file)))
        browser.close()
        browser = pw.chromium.launch(executable_path=os.environ.get("CHROMIUM"),
                                     args=["--no-sandbox","--disable-webgl"])
        page = browser.new_page()
        page.goto(file.as_uri())
        result = page.evaluate("""assets=>{
          window.CastawayMaterialAtlas={get:()=>assets[0]};
          const c=document.querySelector('canvas'),r=CastawayMaterialRenderer.create(c);
          r.render({scene:'cabin',mode:'high'});const a=r.status;
          const mask=c.style.maskImage.startsWith('url(');
          r.render({scene:'cabin',mode:'original'});return [a.reason,mask,r.status.state,c.style.maskImage];
        }""", synthetic())
        assert result == ["no-webgl2", True, "off", ""], result
        print("WebGL disabled: still shaft mask and Original verified")
        browser.close()
