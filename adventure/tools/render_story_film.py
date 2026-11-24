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
import subprocess
from collections import OrderedDict
from functools import lru_cache
from pathlib import Path

import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont
from film_documentary import RECORDS, lift_frame, passage_frame, record_frame
from film_title_cards import card_frame
from film_working_actions import ACTIONS, action_frame
from story_film_cut import cut_at
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
        if key in ACTIONS:
            return action_frame(key, fraction, self.dims)
        if key in RECORDS:
            return record_frame(key, fraction, self.dims)
        if key == "sydney-lift":
            return lift_frame(t, self.dims)
        if key.startswith("passage/"):
            return passage_frame(key.split("/")[1], t, self.dims)
        if key.startswith("sea/"):
            from film_sea_paint import sea_frame

            return sea_frame(key.split("/")[1], t, fraction, self.dims)
        if key.startswith("land/"):
            from film_land_paint import land_frame

            return land_frame(key.split("/")[1], t, fraction, self.dims)
        if key.startswith("detail/"):
            from film_detail_paint import detail_frame

            return detail_frame(key.split("/")[1], t, fraction, self.dims)
        if key not in self.stages:
            self.stages[key] = Stage(key)
            if len(self.stages) > 3:
                self.stages.popitem(last=False)
        self.stages.move_to_end(key)
        return self.stages[key].frame(t, fraction, self.dims)


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
        "20",
        "-maxrate",
        "3100k",
        "-bufsize",
        "5800k",
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
            # Cross time or witness with a short dissolve. Changes of action are straight cuts.
            boundary = (
                round(0.42 * fps)
                if index
                and shot["plate"]
                in ("shore-dawn", "invercauld-wreck", "hearth-remains")
                else 0
            )
            for n in range(count):
                t = n / fps
                if shot.get("titleCard"):
                    frame = card_frame(shot, t, dims)
                    if n == round(2.5 * fps):
                        path = posters / Path(shot["poster"]).name
                        if not cv2.imwrite(str(path), frame, [cv2.IMWRITE_WEBP_QUALITY, 90]):
                            raise OSError(f"Unable to save {path.name}")
                        if shot["plate"] == "film-title":
                            (posters / "prologue.webp").write_bytes(path.read_bytes())
                    proc.stdin.write(frame.tobytes())
                    continue
                plate, local, fraction = cut_at(shot["plate"], t, shot["seconds"])
                frame = visual.frame(plate, local, fraction)
                if n < boundary:
                    prev = shots[index - 1]
                    old, last, old_fraction = cut_at(
                        prev["plate"], prev["seconds"], prev["seconds"]
                    )
                    outgoing = visual.frame(old, last, old_fraction)
                    mix = float(softstep((n + 1) / boundary))
                    frame = cv2.addWeighted(outgoing, 1 - mix, frame, mix, 0)
                # The application sets its own title and date over posters.
                cover = index == 0 and key != "prologue"
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
                if plate == "hearth-remains":
                    print_dateline(frame, "Carnley Harbour · Present day", plate, local)
                elif plate == "invercauld-wreck":
                    print_dateline(frame, "Painted reconstruction · 10 May 1864", plate, local)
                elif shot.get("dateline") and plate not in RECORDS:
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
    parser.add_argument("--width", type=int, default=1280)
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
