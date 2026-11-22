"""The Sydney hoist, crossing inserts and identified source documents in the film."""

import math
from functools import lru_cache

import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageOps

from film_working_actions import oval_shade, place
from story_film_painter import ASSET, H, ROOT, W, Surface, read, scale, softstep


ART = ROOT / "artwork/story-film/second-cut"
RECORDS = {
    "photo-wreck",
    "photo-hearth",
    "chart-north",
    "chart-both",
    "dalgarno-letter",
    "julian-record",
}


@lru_cache(maxsize=4)
def freight(dims):
    base = scale(read(ART / "wharf/sydney.webp"), dims)
    box = read(ART / "wharf/stores.webp", True)
    box[:, :, :3] = np.rint(box[:, :, :3] * (box[:, :, 3:4] / 255)).astype("uint8")
    return base, box


def lift_frame(t, dims):
    w, h = dims
    background, cargo = freight(dims)
    frame = background.copy()
    # Two leisurely pulls, a short pause and the small follow-through of a heavy load.
    clearance = 0.169 * softstep((t - 0.86) / 1.63) + 0.119 * softstep(
        (t - 2.70) / 1.42
    )
    oscillation = math.sin(3.1 * max(0, t - 1)) * float(softstep((t - 1) / 0.9))
    ring = (w * (0.312 + 0.012 * oscillation), h * (0.474 - clearance))
    foot = 0.869 * h
    oval_shade(
        frame,
        w * (0.315 + clearance * 0.09),
        foot,
        w * (0.076 + clearance * 0.08),
        h * (0.010 + clearance * 0.06),
        0.46 - clearance * 0.88,
    )
    points = []
    slack = 1 - float(softstep((t - 0.22) / 0.67))
    for i in range(29):
        u = i / 28
        x = (
            (0.312 * w) * (1 - u)
            + ring[0] * u
            + w * 0.021 * slack * math.sin(math.pi * u)
        )
        y = (-0.009 * h) * (1 - u) + ring[1] * u
        points.append((round(x * 16), round(y * 16)))
    rope = np.int32(points)
    cv2.polylines(
        frame, [rope], False, (41, 54, 63), max(2, round(w / 405)), cv2.LINE_AA, shift=4
    )
    cv2.polylines(
        frame,
        [rope - [13, 0]],
        False,
        (121, 156, 175),
        max(1, round(w / 910)),
        cv2.LINE_AA,
        shift=4,
    )
    place(
        frame, cargo, (374, 49), ring, 0.261 * w / cargo.shape[1], -0.023 * oscillation
    )
    return frame


# Masks are hand-registered on the final 16:9 exports. Each describes only
# uninterrupted water. The interrupted horizon, men and solid shore are excluded.
PASSAGE_WATER = {
    "outward": (
        (
            "quiet",
            "2,64 24,61 39,58 57,58 54,69 67,73 92,67 100,67 100,96 63,99 44,87 4,73",
        ),
    ),
    "impact": (
        (
            "sea",
            "0,71 12,72 26,71 46,68 65,62 80,59 77,72 62,79 52,82 37,88 12,84 0,90",
        ),
    ),
    "stewart": (("shore", "0,46 16,46 25,46 15,51 8,57 11,65 12,76 5,78 0,86"),),
    "storm": (("sea", "0,75 15,76 31,79 49,78 69,71 93,71 100,66 100,100 0,100"),),
    "skin": (("quiet", "67,39 100,42 100,100 80,100 77,91 81,81 76,66"),),
    "squall": (
        ("sea", "58,41 75,44 86,48 100,51 100,86 91,77 74,63 60,54"),
        ("sail", "19,0 49,0 59,28 61,34 45,30 28,26 22,25 25,15"),
    ),
    "cross-house": (),
}


@lru_cache(maxsize=5)
def passage_art(key):
    return (
        scale(read(ART / "passage" / (key + ".webp")), (W, H)),
        [Surface(kind, points) for kind, points in PASSAGE_WATER[key]],
    )


def passage_frame(key, seconds, dims):
    image, water = passage_art(key)
    frame = image.copy()
    for surface in water:
        surface.render(frame, seconds)
    return scale(frame, dims)


@lru_cache(maxsize=28)
def face(px, weight=400):
    return ImageFont.truetype(str(ASSET / f"lettering/spectral-{weight}.woff2"), px)


PHOTOS = {
    "photo-wreck": (
        "grafton-1909.jpg",
        ["The Grafton", "in the shingle"],
        "Volume I, page xxv",
    ),
    "photo-hearth": (
        "epigwaitt-1909.jpg",
        ["The remains", "of Epigwaitt"],
        "Volume I, page xxvi",
    ),
}
PAGES = {
    "dalgarno-letter": (
        "dalgarno-1866.jpg",
        (0.049, 0.252, 0.972, 0.614),
        ["George Dalgarno"],
        ["The captain wrote to", "the ship’s owners", "from Southampton."],
        "Page 171",
    ),
    "julian-record": (
        "rescue-letter-1866.jpg",
        (0.078, 0.714, 0.945, 0.935),
        ["Passage to Callao"],
        ["Dalgarno, Smith and", "Holding left aboard", "the Julian."],
        "Page 172",
    ),
}


def mounted_print(canvas, picture, bounds, trim=False):
    left, top, right, bottom = bounds
    size = (right - left, bottom - top)
    photo = (
        ImageOps.fit(picture, size, method=Image.Resampling.LANCZOS)
        if trim
        else ImageOps.contain(picture, size, method=Image.Resampling.LANCZOS)
    )
    x, y = left + (size[0] - photo.width) // 2, top + (size[1] - photo.height) // 2
    d = ImageDraw.Draw(canvas)
    d.rectangle(
        (x - 4, y - 4, x + photo.width + 3, y + photo.height + 3), fill="#c6bfae"
    )
    canvas.paste(photo.convert("RGB"), (x, y))
    return x, y, photo.width, photo.height


@lru_cache(maxsize=12)
def record_art(key, dims):
    w, h = dims
    # A dark, quiet mount preserves the full photo boundaries and its original greys.
    canvas = Image.new("RGB", dims, "#21292a")
    d = ImageDraw.Draw(canvas)
    left = round(w * 0.632)
    gold, ivory, mute = "#e1bd80", "#f4eee0", "#d4cebd"

    def words(lines, x, y, size, colour, weight=400, leading=1.20):
        f = face(max(8, round(w * size)), weight)
        for i, label in enumerate(lines):
            d.text(
                (x, round(h * y + i * f.size * leading)),
                label,
                font=f,
                fill=colour,
                anchor="la",
            )

    line_y = round(h * 0.225)
    d.line(
        (left, line_y, round(w * 0.925), line_y),
        fill="#746d5e",
        width=max(1, round(w / 820)),
    )
    chart_box = None
    if key in PHOTOS:
        source, title, page = PHOTOS[key]
        with Image.open(ART / "archive" / source) as original:
            mounted_print(
                canvas,
                original,
                (round(w * 0.044), round(h * 0.075), round(w * 0.585), round(h * 0.82)),
            )
        words(["CARNLEY HARBOUR"], left, 0.163, 0.019, gold, 600)
        words(title, left, 0.269, 0.037, ivory, 600, 1.05)
        words(
            ["Photographed in 1907.", "Reprinted in 1909."], left, 0.476, 0.022, ivory
        )
        words(
            [
                "Freshwater and Marine Image Bank",
                "University of Washington Libraries",
                page,
            ],
            left,
            0.65,
            0.0158,
            mute,
            leading=1.35,
        )
    elif key in PAGES:
        source, crop, title, description, page = PAGES[key]
        with Image.open(ART / "archive" / source) as original:
            iw, ih = original.size
            excerpt = original.crop(
                tuple(round(n * (iw if i % 2 == 0 else ih)) for i, n in enumerate(crop))
            )
            mounted_print(
                canvas,
                excerpt,
                (round(w * 0.044), round(h * 0.11), round(w * 0.587), round(h * 0.77)),
            )
        words(["THE INVERCAULD LETTER"], left, 0.163, 0.018, gold, 600)
        words(title, left, 0.285, 0.033, ivory, 600)
        words(description, left, 0.418, 0.022, ivory)
        words(
            ["Musgrave’s published appendix", "London, 1866  ·  " + page],
            left,
            0.67,
            0.017,
            mute,
        )
    else:
        with Image.open(ASSET / "epilogue/islands-1865.webp") as chart:
            # Trim outer blank margin only. The two crew areas stay deliberately broad.
            chart_box = mounted_print(
                canvas,
                chart,
                (round(w * 0.055), round(h * 0.04), round(w * 0.565), round(h * 0.87)),
            )
        words(["AUCKLAND ISLAND"], left, 0.163, 0.019, gold, 600)
        if key == "chart-north":
            words(["Northern coast"], left, 0.279, 0.036, ivory, 600)
            words(["The Invercauld", "10 May 1864"], left, 0.451, 0.025, ivory)
        else:
            words(["Two shipwrecks"], left, 0.279, 0.036, ivory, 600)
            words(
                ["Invercauld  ·  northern coast", "Grafton  ·  Carnley Harbour"],
                left,
                0.445,
                0.021,
                ivory,
                leading=1.55,
            )
        words(
            ["Sketch map, 1865", "Published with Musgrave’s account."],
            left,
            0.68,
            0.017,
            mute,
        )
    return cv2.cvtColor(np.asarray(canvas), cv2.COLOR_RGB2BGR), chart_box


def record_frame(key, phase, dims):
    painted, chart = record_art(key, dims)
    frame = painted.copy()
    if chart:
        x, y, w, h = chart
        rings = [(0.46, 0.165, 0.19, 0.045)]
        if key == "chart-both":
            rings.append((0.435, 0.77, 0.185, 0.072))
        for i, (cx, cy, rx, ry) in enumerate(rings):
            amount = float(softstep((phase - 0.06 - 0.28 * i) / 0.50))
            if amount > 0:
                cv2.ellipse(
                    frame,
                    (round(x + w * cx), round(y + h * cy)),
                    (round(w * rx), round(h * ry)),
                    -11,
                    115,
                    115 + round(amount * 342),
                    (62, 92, 137),
                    max(1, round(dims[0] / 490)),
                    cv2.LINE_AA,
                )
    return frame
