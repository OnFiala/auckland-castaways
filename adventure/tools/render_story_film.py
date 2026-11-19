#!/usr/bin/env python3
"""Render the eight silent illustrated reels; deliver their audio separately.

Requires Python 3, NumPy, OpenCV (opencv-python-headless), Pillow with WOFF2-capable FreeType,
Node and FFmpeg/libx264.
Run from any directory, e.g.
  python adventure/tools/render_story_film.py --output /tmp/castaway-visuals
--chapter can be repeated; defaults to the complete published script.
"""

import argparse
import json
import math
import subprocess
from collections import OrderedDict
from functools import lru_cache
from pathlib import Path

import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont
from story_film_direction import INSERT
from story_film_painter import PRINTS, ROOT, Stage, softstep


def metadata():
    path = ROOT / "dist/story-film-script.js"
    result = subprocess.check_output(
        [
            "node",
            "-e",
            "console.log(JSON.stringify(require(process.argv[1])))",
            str(path),
        ]
    )
    return json.loads(result)["timeline"]


class Visuals:
    def __init__(self, dims):
        self.stages = OrderedDict()
        self.dims = dims

    def frame(self, key, t, fraction):
        if key not in self.stages:
            self.stages[key] = Stage(key)
            if len(self.stages) > 3:
                self.stages.popitem(last=False)
        self.stages.move_to_end(key)
        return self.stages[key].frame(t, fraction, self.dims)


def edit(shot, t):
    key = shot["plate"]
    span = shot["seconds"]
    if key in INSERT:
        cut, other = INSERT[key]
        cut *= span
        if t >= cut:
            return other, (t - cut) / (span - cut)
        return key, t / cut
    return key, t / span


def paper_turn(left, right, fraction):
    """A curling leaf travels across the lit chart table from its outer edge."""
    h, w = left.shape[:2]
    yy, xx = np.indices((h, w), dtype="float32")
    p = float(softstep(fraction))
    edge = (
        w * (1.14 - 1.30 * p)
        + w * 0.095 * (yy / h - 0.5)
        + w * 0.022 * np.sin(yy / h * math.pi)
    )
    width = w * 0.084 * math.sin(math.pi * p)
    delta = xx - edge
    alpha = np.clip(delta / max(1, width), 0, 1)
    out = np.where((delta < 0)[:, :, None], left, right).astype("float32")
    if width > 1:
        # Foreshortened reverse of the lifted leaf catches the window light.
        back = cv2.remap(
            left,
            np.clip(edge - delta * 0.68, 0, w - 1).astype("float32"),
            yy,
            cv2.INTER_LINEAR,
            borderMode=cv2.BORDER_REPLICATE,
        )
        grey = cv2.cvtColor(back, cv2.COLOR_BGR2GRAY)[:, :, None].astype("float32")
        curl = (
            grey * 0.15
            + np.array((142, 171, 188), dtype="float32")
            + 26 * np.sin(alpha * math.pi)[:, :, None]
        )
        active = (delta >= 0) & (delta < width)
        out[active] = curl[active]
        out *= (
            1
            - (
                0.14
                * np.exp(-(((delta - width) / (w * 0.029)) ** 2))
                * (delta >= width)
            )[:, :, None]
        )
    return np.clip(out, 0, 255).astype("uint8")


@lru_cache(maxsize=2)
def title_plate(dims):
    """Optical title set over the empty shadow inside the raised chest lid."""
    w, h = dims
    scale = w / 1152
    face = ROOT / "dist/assets/lettering/spectral-400.woff2"
    ink = Image.new("L", dims)
    pen = ImageDraw.Draw(ink)
    for label, pt, tracking, fraction in [
        ("UNTIL WE", 23, 5.0, 0.309),
        ("RETURN", 54, 5.1, 0.395),
    ]:
        font = ImageFont.truetype(str(face), max(1, round(pt * scale)))
        widths = [font.getlength(letter) for letter in label]
        spacing = tracking * scale
        x = w * 0.440 - (sum(widths) + spacing * (len(widths) - 1)) / 2
        for letter, width in zip(label, widths):
            pen.text((x, h * fraction), letter, fill=255, font=font, anchor="ls")
            x += width + spacing
    shadow = ink.filter(ImageFilter.GaussianBlur(2.2 * scale))
    return np.asarray(ink, dtype="float32") / 255, np.asarray(
        shadow, dtype="float32"
    ) / 255


def title_frame(frame, t):
    alpha = float(softstep((t - 0.75) / 1.6)) * float(softstep((8.7 - t) / 1.35))
    if alpha == 0:
        return frame
    ink, shadow = title_plate((frame.shape[1], frame.shape[0]))
    x, y, w, h = cv2.boundingRect((ink * 255).astype("uint8"))
    area = np.s_[max(0, x - 10) : min(frame.shape[1], x + w + 10)]
    band = np.s_[max(0, y - 9) : min(frame.shape[0], y + h + 9)]
    mask = ink[band, area, None] * alpha
    inset = frame[band, area].astype("float32") * (
        1 - shadow[band, area, None] * alpha * 0.60
    )
    frame[band, area] = np.clip(
        inset * (1 - mask) + np.array((193, 220, 237)) * mask, 0, 255
    ).astype("uint8")
    return frame


@lru_cache(maxsize=30)
def dateline_ink(label, width):
    """Transparent Spectral lettering including small-cap-height shadow margin."""
    font = ImageFont.truetype(
        str(ROOT / "dist/assets/lettering/spectral-600.woff2"), round(width * 0.021)
    )
    box = font.getbbox(label)
    pad = max(4, round(width * 0.005))
    mask = Image.new("L", (box[2] - box[0] + 2 * pad, box[3] - box[1] + 2 * pad))
    ImageDraw.Draw(mask).text((pad - box[0], pad - box[1]), label, font=font, fill=255)
    soft = mask.filter(ImageFilter.MaxFilter(3)).filter(
        ImageFilter.GaussianBlur(width * 0.00175)
    )
    return np.asarray(mask, dtype="float32") / 255, np.asarray(
        soft, dtype="float32"
    ) / 255


@lru_cache(maxsize=3)
def corner_filter(width, height):
    # A graduated neutral-density corner keeps the location readable over
    # bright rigging or a cloudy sky. Its far edge disappears into the paint.
    yy, xx = np.indices((round(height * 0.29), round(width * 0.58)), dtype="float32")
    return (
        np.exp(-(((yy / height - 0.092) / 0.083) ** 2))
        * (1 - softstep((xx / width - 0.29) / 0.27))
    )[:, :, None]


def print_dateline(frame, label, plate, t):
    # Let the picture resolve before setting type. The date clears while the
    # scene is still playing and never enters the lower subtitle field.
    alpha = float(softstep((t - 0.63) / 0.55)) * float(softstep((4.85 - t) / 0.68))
    if not alpha:
        return
    h, w = frame.shape[:2]
    ink, shadow = dateline_ink(label, w)
    ih, iw = ink.shape
    arch = plate in PRINTS
    if arch:
        x = round(w * 0.178)
        y = round(h * (0.073 if plate == "invercauld-wreck" else 0.097))
    else:
        x, y = round(w * 0.052), round(h * 0.078)
        density = corner_filter(w, h)
        rh, rw = density.shape[:2]
        field = frame[:rh, :rw]
        field[:] = (field * (1 - density * alpha * 0.38)).astype("uint8")
    area = frame[y : y + ih, x : x + iw]
    halo = shadow[:, :, None] * alpha * (0.86 if arch else 0.72)
    fg = np.array((43, 56, 64) if arch else (220, 236, 244))
    bg = np.array((194, 223, 235) if arch else (20, 27, 29))
    base = area * (1 - halo) + bg * halo
    coverage = ink[:, :, None] * alpha
    area[:] = (base * (1 - coverage) + fg * coverage).astype("uint8")


def render(reel, output, posters, dims, fps):
    key = reel["id"]
    shots = reel["shots"]
    output.mkdir(parents=True, exist_ok=True)
    posters.mkdir(parents=True, exist_ok=True)
    target = output / (key + ".mp4")
    temp = output / (key + ".partial.mp4")
    # Keep a previous good output intact when a build is interrupted.
    cmd = [
        "ffmpeg",
        "-hide_banner",
        "-loglevel",
        "error",
        "-y",
        "-f",
        "rawvideo",
        "-pixel_format",
        "bgr24",
        "-video_size",
        f"{dims[0]}x{dims[1]}",
        "-framerate",
        str(fps),
        "-i",
        "pipe:0",
        "-an",
        "-c:v",
        "libx264",
        "-threads",
        "2",
        "-preset",
        "fast",
        "-crf",
        "22",
        "-maxrate",
        "2300k",
        "-bufsize",
        "4200k",
        "-pix_fmt",
        "yuv420p",
        "-color_primaries",
        "bt709",
        "-colorspace",
        "bt709",
        "-color_trc",
        "bt709",
        "-vf",
        "scale=out_color_matrix=bt709",
        "-movflags",
        "+faststart",
        str(temp),
    ]
    proc = subprocess.Popen(cmd, stdin=subprocess.PIPE)
    visual = Visuals(dims)
    try:
        for index, shot in enumerate(shots):
            count = round(shot["seconds"] * fps)
            boundary = round(0.76 * fps)
            printed = (
                shot["plate"] in PRINTS
                and index
                and shots[index - 1]["plate"] in PRINTS
            )
            if printed:
                boundary = round(1.02 * fps)
            for n in range(count):
                t = n / fps
                plate, fraction = edit(shot, t)
                frame = visual.frame(plate, t, fraction)
                if index and n < boundary:
                    prev = shots[index - 1]
                    old, old_fraction = edit(prev, prev["seconds"] + t)
                    left = visual.frame(old, prev["seconds"] + t, old_fraction)
                    phase = (n + 1) / boundary
                    frame = (
                        paper_turn(left, frame, phase)
                        if printed
                        else cv2.addWeighted(
                            left,
                            1 - float(softstep(phase)),
                            frame,
                            float(softstep(phase)),
                            0,
                        )
                    )
                # The application sets its own title and date over posters.
                cover = (
                    (shot["plate"] == "schooner") if key == "prologue" else (index == 0)
                )
                if (
                    cover
                    and n == round(2.5 * fps)
                    and not cv2.imwrite(
                        str(posters / (key + ".webp")),
                        frame,
                        [cv2.IMWRITE_WEBP_QUALITY, 88],
                    )
                ):
                    raise OSError("Unable to save poster")
                if shot["plate"] == "outfit":
                    frame = title_frame(frame, t)
                if shot.get("dateline"):
                    print_dateline(frame, shot["dateline"], shot["plate"], t)
                if shot["plate"] == "hearth-remains" and t >= shot["seconds"] - 1.40:
                    fade = float(
                        softstep((shot["seconds"] - 1 / fps - t) / (1.40 - 1 / fps))
                    )
                    frame = cv2.convertScaleAbs(frame, alpha=fade)
                proc.stdin.write(frame.tobytes())
        proc.stdin.close()
        if proc.wait() != 0:
            raise RuntimeError("FFmpeg failed")
        temp.replace(target)
    except BaseException:
        proc.kill()
        proc.wait()
        temp.unlink(missing_ok=True)
        raise
    print(
        f"{key}: {sum(s['seconds'] for s in shots)} s / {target.stat().st_size:,} bytes",
        flush=True,
    )


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--output", type=Path, required=True)
    parser.add_argument("--posters", type=Path, default=ROOT / "dist/assets/story-film")
    parser.add_argument("--chapter", action="append")
    parser.add_argument("--width", type=int, default=1152)
    parser.add_argument("--fps", type=int, default=24)
    args = parser.parse_args()
    reels = metadata()
    unknown = set(args.chapter or []) - {r["id"] for r in reels}
    if unknown:
        parser.error(f"Unknown reels: {unknown}")
    if args.width % 32 or args.width <= 0 or args.fps <= 0:
        parser.error(
            "Width must be a positive multiple of 32; frame rate must be positive"
        )
    for reel in reels:
        if not args.chapter or reel["id"] in args.chapter:
            render(
                reel,
                args.output,
                args.posters,
                (args.width, args.width * 9 // 16),
                args.fps,
            )


if __name__ == "__main__":
    main()
