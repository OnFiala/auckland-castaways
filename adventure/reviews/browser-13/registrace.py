"""Draw the two recorded shorelines on their versioned artwork from Git."""
import io
import json
import subprocess
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[3]
OUT = Path(__file__).resolve().parent
VERSIONS = ["c2eff1a5f8dd803dccd28d50db0ab66b27949d6e", "4dbfa437c2d04a89102ac06a5813d0e377ccbb80"]
SIZE = (540, 304)

def blob(revision, name):
    return subprocess.check_output(["git", "show", revision + ":adventure/dist/" + name], cwd=ROOT)

def beach(revision):
    source = blob(revision, "landscape.js")
    js = """
    const s={module:{exports:{}}};
    require('node:vm').runInNewContext(require('node:fs').readFileSync(0,'utf8'),s);
    const layers=s.module.exports.describe({scene:'beach',flags:{}});
    console.log(JSON.stringify(layers.filter(l=>l.kind==='water').map(l=>({points:l.points, holes:l.holes||[]}))));
    """
    shapes = json.loads(subprocess.check_output(["node", "-e", js], input=source))
    painting = Image.open(io.BytesIO(blob(revision, "assets/tidepaint/beach.webp"))).convert("RGB")
    return painting, shapes

def column(points, x):
    marks = []
    for (ax, ay), (bx, by) in zip(points, points[1:] + points[:1]):
        if min(ax, bx) <= x < max(ax, bx):
            marks.append(ay + (by - ay) * (x - ax) / (bx - ax))
    return sorted(round(y, 2) for y in marks)

def typeface(size):
    try:
        return ImageFont.truetype("DejaVuSans.ttf", size)
    except OSError:
        return ImageFont.load_default(size=size)

def panel(plate, shapes, color):
    im = plate.resize(SIZE, Image.Resampling.LANCZOS).convert("RGBA")
    def pixels(points):
        return [(round(x * SIZE[0] / 100), round(y * SIZE[1] / 100)) for x, y in points]
    for shape in shapes:
        overlay = Image.new("RGBA", im.size)
        pen = ImageDraw.Draw(overlay)
        xy = pixels(shape["points"])
        pen.polygon(xy, fill=(*color, 57))
        pen.line(xy + xy[:1], fill=(*color, 255), width=2)
        for hole in shape["holes"]:
            pen.polygon(pixels(hole), fill=(0, 0, 0, 0))
        im = Image.alpha_composite(im, overlay)
    return im

old, new = (beach(revision) for revision in VERSIONS)
cases = [(old, old, "12 · původní pláž a příboj"), (new, old, "13 · nová pláž se starou maskou"), (new, new, "13 · nová pláž a její příboj")]
canvas = Image.new("RGB", (SIZE[0] * 3, SIZE[1] + 71), "#20282c")
draw = ImageDraw.Draw(canvas)
for i, (base, matte, title) in enumerate(cases):
    x = i * SIZE[0]
    color = (255, 158, 119) if i == 1 else (147, 231, 223)
    canvas.paste(panel(base[0], matte[1], color), (x, 37))
    draw.text((x + 10, 8), title, font=typeface(18), fill="#fff1d7")
draw.text((10, SIZE[1] + 43), "Obrysy označují plochu pro animaci vody. Prostřední panel je model možné kombinace souborů.", font=typeface(16), fill="#e8e0cc")
canvas.save(OUT / "plaz.webp", quality=90, method=6)
for (plate, shapes), version in zip((old, new), VERSIONS):
    print(version[:7], plate.size, "vertical boundaries at 5% of width", column(shapes[0]["points"], 5))
