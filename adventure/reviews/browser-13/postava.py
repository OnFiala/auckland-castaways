"""Compare Alick's versioned standing, walking and working drawings at equal stature."""
import io
import json
import subprocess
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[3]
OUT = Path(__file__).resolve().parent
VERSIONS = (
    ("12", "c2eff1a5f8dd803dccd28d50db0ab66b27949d6e"),
    ("13", "4dbfa437c2d04a89102ac06a5813d0e377ccbb80"),
)


def blob(revision, name):
    return subprocess.check_output(["git", "show", f"{revision}:adventure/dist/assets/{name}"], cwd=ROOT)


def sprite(revision, name):
    return Image.open(io.BytesIO(blob(revision, name))).convert("RGBA")


def rect_tuple(rect):
    if isinstance(rect, dict):
        return tuple(rect[k] for k in ("x", "y", "width", "height"))
    return tuple(rect)


def crop(sheet, rect):
    x, y, w, h = rect_tuple(rect)
    return sheet.crop((x, y, x + w, y + h))


def mask_bounds(pose):
    return pose.getchannel("A").point(lambda a: 255 if a > 32 else 0).getbbox()


def face(pose, height):
    # Use the crown and chin in the upper sixth of this upright pose.
    x0, y0, x1, y1 = mask_bounds(pose)
    chin = round(y0 + (y1 - y0) * 0.175)
    head = pose.crop((x0, y0, x1, chin))
    head = head.crop(mask_bounds(head))
    return head.resize((round(head.width * height / head.height), height), Image.Resampling.LANCZOS)


def font(size):
    try:
        return ImageFont.truetype("DejaVuSans.ttf", size)
    except OSError:
        return ImageFont.load_default(size=size)


width = 1148
canvas = Image.new("RGBA", (width, 618), "#242c32")
pen = ImageDraw.Draw(canvas)
pen.text((22, 12), "Alick McLaren", font=font(26), fill="#f7e7cc")
pen.text((22, 49), "Původní kresby ze hry, seřazené podle činnosti. Vpravo je zvětšený tentýž výřez.", font=font(16), fill="#cdd1ce")
centers = [168, 339, 522, 706, 915, 1064]
for x, title in zip(centers, ["V klidu", "První krok", "Sahá", "Přikrčení", "Tvář v klidu", "Tvář při kroku"]):
    pen.text((x, 87), title, anchor="mm", font=font(17), fill="#f7e7cc")

for row, (version, revision) in enumerate(VERSIONS):
    top = 107 + 247 * row
    baseline = top + 217
    pen.rectangle((0, top, width, top + 237), fill="#485158" if row == 0 else "#3e484f")
    pen.text((18, top + 12), f"Verze {version}", font=font(16), fill="#faf0d6")
    pen.line((89, baseline, 814, baseline), fill="#818a88")
    work = json.loads(blob(revision, "work-poses/manifest.json"))["assets"]["player"]["poses"]
    walk = json.loads(blob(revision, "walk/player.json"))
    work_sheet = sprite(revision, "work-poses/player.png")
    walk_sheet = sprite(revision, "walk/player.png")
    standing = crop(work_sheet, work["stand"]["crop"])
    step = crop(walk_sheet, walk["common_crop"])  # First cell starts at (0, 0).
    work_height = mask_bounds(standing)[3] - mask_bounds(standing)[1]
    step_height = mask_bounds(step)[3] - mask_bounds(step)[1]
    figures = [(standing, work_height), (step, step_height)]
    figures += [(crop(work_sheet, work[key]["crop"]), work_height) for key in ("reach", "crouch")]

    for center, (pose, measure) in zip(centers[:4], figures):
        ink = pose.crop(mask_bounds(pose))
        scale = 201 / measure
        ink = ink.resize((round(ink.width * scale), round(ink.height * scale)), Image.Resampling.LANCZOS)
        canvas.alpha_composite(ink, (center - ink.width // 2, baseline - ink.height))
    for center, pose in zip(centers[4:], (standing, step)):
        head = face(pose, 107)
        canvas.alpha_composite(head, (center - head.width // 2, top + 64))

canvas.convert("RGB").save(OUT / "alick.webp", quality=93, method=6)
