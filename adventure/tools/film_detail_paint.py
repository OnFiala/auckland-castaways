"""Registered closeups of the Epigwaitt wall and the dinghy's bilge pump."""

import json
import math
from functools import lru_cache
from pathlib import Path

import cv2
import numpy as np
from film_working_actions import Water, ease

DIR = Path(__file__).resolve().parents[1] / "artwork/story-film/second-cut/detail"
DETAILS = frozenset(("thatch", "hand-pump"))


def read(path, mode=cv2.IMREAD_COLOR):
    image = cv2.imread(str(path), mode)
    if image is None:
        raise FileNotFoundError(path)
    return image


@lru_cache(maxsize=6)
def stage(name, dims):
    return DetailStage(name, dims)


class DetailStage:
    def __init__(self, name, dims):
        self.name = name
        self.w, self.h = dims
        source = read(DIR / (name + ".webp"))
        height, width = source.shape[:2]
        under = read(DIR / (name + "-under.webp"))
        matte = read(DIR / (name + "-matte.png"), cv2.IMREAD_GRAYSCALE)
        data = json.loads((DIR / "artist.json").read_text())["poses"][name]
        x, y, bw, bh = data["moving_box_xywh"]
        assert matte.shape == under.shape[:2] == (bh, bw)

        # Repaint only the area under the extracted foreground. Original
        # boards, face, supporting hand and open water survive elsewhere.
        base = source.copy()
        core = cv2.dilate(matte, np.ones((5, 5), np.uint8))
        # Fade between the two paintings outside the silhouette. A tight
        # matte alone leaves a tool-shaped change in the sea's brushwork.
        halo = cv2.dilate(matte, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (33, 33)))
        halo = cv2.GaussianBlur(halo, (33, 33), 7.2)
        repair = np.maximum(core, halo)[:, :, None] / 255
        area = base[y : y + bh, x : x + bw]
        area[:] = source[y : y + bh, x : x + bw] * (1 - repair) + under * repair
        self.base = cv2.resize(base, dims, interpolation=cv2.INTER_AREA)
        alpha = np.zeros((height, width), np.uint8)
        alpha[y : y + bh, x : x + bw] = matte

        if name == "hand-pump":
            # The continuation of the wooden rod remains inside the barrel
            # at rest. It emerges only on the upward stroke.
            sx = round(width * 510 / 900)
            left, right = sx - 13, sx + 13
            start, bottom = round(height * 312 / 506), round(height * 0.738)
            strip = source[start - 32 : start - 8, left:right]
            rod_alpha = alpha[start - 32 : start - 8, left:right]
            source[start:bottom, left:right] = cv2.resize(
                strip, (right - left, bottom - start)
            )
            alpha[start:bottom, left:right] = cv2.resize(
                rod_alpha, (right - left, bottom - start)
            )

        sprite = np.dstack(
            (np.rint(source * (alpha[:, :, None] / 255)).astype(np.uint8), alpha)
        )
        sprite = cv2.resize(sprite, dims, interpolation=cv2.INTER_AREA)
        if name == "thatch":
            self.box = (0, round(0.47 * self.h), round(0.60 * self.w), self.h)
        else:
            self.box = (
                round(0.405 * self.w),
                round(0.095 * self.h),
                round(0.66 * self.w),
                round(0.745 * self.h),
            )
        left, top, right, bottom = self.box
        self.sprite = np.ascontiguousarray(sprite[top:bottom, left:right])
        self.yy, self.xx = np.indices(self.sprite.shape[:2], dtype=np.float32)
        self.nx = (self.xx + left) / self.w
        self.ny = (self.yy + top) / self.h

        if name == "thatch":
            # A short radial compression at the tied waist, local to the
            # bundle against which the steady upper hand is pressing.
            self.straw_box = np.s_[
                round(0.465 * self.h) : round(0.705 * self.h),
                round(0.413 * self.w) : round(0.566 * self.w),
            ]
            straw = self.base[self.straw_box]
            sy, sx = np.indices(straw.shape[:2], dtype=np.float32)
            rx = (sx + round(0.413 * self.w)) / self.w - 0.506
            ry = (sy + round(0.465 * self.h)) / self.h - 0.552
            self.straw_x, self.straw_y = sx, sy
            self.compress = (
                self.w * 0.115 * rx * np.exp(-((rx / 0.044) ** 2 + (ry / 0.047) ** 2))
            )
        else:
            load = np.clip((self.ny - 0.189) / 0.211, 0, 1)
            self.arm_load = load * load * (3 - 2 * load)
            self.elbow = np.exp(-np.square((self.ny - 0.306) / 0.055))
            self.rim = np.clip((0.635 - self.ny) * self.h, 0, 1)
            self.sea = Water(
                dims,
                (
                    (0.612, 0.457),
                    (0.716, 0.444),
                    (0.814, 0.431),
                    (0.954, 0.427),
                    (1, 0.444),
                    (1, 0.912),
                    (0.884, 0.820),
                    (0.787, 0.764),
                    (0.705, 0.721),
                    (0.612, 0.706),
                    (0.605, 0.699),
                    (0.602, 0.686),
                    (0.738, 0.688),
                    (0.737, 0.652),
                    (0.610, 0.644),
                ),
            )
            self.left_water = Water(
                dims,
                ((0, 0.47), (0.149, 0.472), (0.137, 0.558), (0.101, 0.678), (0, 0.733)),
            )
            self.right_of_rope = Water(
                dims, ((0.216, 0.475), (0.326, 0.473), (0.298, 0.652), (0.167, 0.681))
            )
            self.bilge = Water(
                dims, ((0.352, 0.859), (0.452, 0.866), (0.460, 0.999), (0.343, 0.999))
            )

    def frame(self, seconds, f):
        frame = self.base.copy()
        if self.name == "thatch":
            pull = (
                0.18 * ease(f / 0.22)
                + 0.68 * ease((f - 0.18) / 0.4)
                + 0.14 * ease((f - 0.58) / 0.17)
                - 0.105 * ease((f - 0.8) / 0.2)
            )
            patch = frame[self.straw_box]
            patch[:] = cv2.remap(
                patch,
                self.straw_x + self.compress * pull,
                self.straw_y,
                cv2.INTER_LINEAR,
                borderMode=cv2.BORDER_REPLICATE,
            )
            dx, dy = -0.048 * self.w * pull, 0.045 * self.h * pull
            # Linear extension along the painted cord. The knot is fixed
            # and the knuckles move with the end that they hold.
            fixed, knuckles = 0.484, 0.290
            line_load = np.clip(
                (fixed - self.nx) / (fixed - knuckles - dx / self.w), 0, 1
            )
            mx = self.xx - dx * line_load
            my = self.yy - dy * line_load
        else:
            for water in (self.sea, self.left_water, self.right_of_rope, self.bilge):
                water.paint(frame, seconds * 0.35)
            phase = (f - 0.18) * math.tau / 0.35
            # The lower turnaround matches the creak in the sound mix.
            handle = math.cos(phase)
            dy = self.h * (0.042 * handle - 0.003)
            mx = self.xx + self.elbow * 0.008 * self.w * handle
            my = self.yy - dy * self.arm_load
            self.outlet(frame, 0.5 + 0.5 * math.cos(phase - 0.85), seconds)

        moving = cv2.remap(
            self.sprite, mx, my, cv2.INTER_LINEAR, borderMode=cv2.BORDER_CONSTANT
        )
        coverage = moving[:, :, 3:4].astype(np.float32) / 255
        rgb = moving[:, :, :3]
        if self.name == "hand-pump":
            coverage *= self.rim[:, :, None]
            rgb = rgb * self.rim[:, :, None]
        left, top, right, bottom = self.box
        dest = frame[top:bottom, left:right]
        dest[:] = np.clip(dest * (1 - coverage) + rgb, 0, 255)
        return frame

    def outlet(self, frame, delivery, seconds):
        # Water clears the far gunwale. Its painted upper edge occludes the
        # low end of the stream before it can cross into the boat.
        w, h = self.w, self.h
        length = 0.026 + 0.033 * delivery
        t = np.linspace(0, 1, 13)
        xx = 0.730 + 0.014 * delivery * t + 0.0010 * np.sin(seconds * 10 + 6 * t) * t
        yy = 0.682 + length * (0.14 * t + 0.86 * t * t)
        pts = (np.column_stack((xx, yy)) * [w, h]).round().astype(np.int32)
        layer = frame.copy()
        cv2.polylines(
            layer, [pts], False, (164, 173, 172), max(1, round(0.0019 * w)), cv2.LINE_AA
        )
        cv2.polylines(
            layer,
            [pts[:8] - [1, 0]],
            False,
            (102, 131, 141),
            max(1, round(0.0012 * w)),
            cv2.LINE_AA,
        )
        alpha = 0.22 + 0.30 * delivery
        cv2.addWeighted(layer, alpha, frame, 1 - alpha, 0, dst=frame)


def detail_frame(name, seconds, fraction, dims):
    """Return a 16:9 BGR frame, with seconds and fraction local to this shot."""
    name = name.removeprefix("detail/")
    if name not in DETAILS:
        raise KeyError(name)
    return stage(name, tuple(dims)).frame(
        float(seconds), min(1.0, max(0.0, float(fraction)))
    )
