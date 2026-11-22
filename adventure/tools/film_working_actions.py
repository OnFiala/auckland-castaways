"""Fixed-camera action inserts for the Grafton films.

Coordinates register the painted objects to their clean backgrounds. Each edit
supplies its local fraction, so its contact sounds can share STRIKES.
"""

import math
from functools import lru_cache
from pathlib import Path

import cv2
import numpy as np

ASSETS = Path(__file__).resolve().parents[1] / "artwork/story-film/second-cut/actions"
BACKGROUNDS = {
    "cast-lead": "sounding-sea",
    "strike-iron": "ballast-anvil",
    "drive-fastening": "dinghy-strake",
    "swing-lantern": "flooded-cabin",
}
ACTIONS = frozenset(BACKGROUNDS)
STRIKES = {"strike-iron": (0.22, 0.55, 0.81), "drive-fastening": (0.34, 0.71)}
WATER_ENTRY = 0.64


def unit(x):
    return min(1.0, max(0.0, x))


def ease(x):
    x = unit(x)
    return x * x * (3.0 - 2.0 * x)


def point(pair):
    return tuple(round(v) for v in pair)


@lru_cache(maxsize=8)
def cel(name):
    image = cv2.imread(str(ASSETS / (name + ".webp")), cv2.IMREAD_UNCHANGED)
    if image is None or image.ndim != 3 or image.shape[2] != 4:
        raise ValueError(f"Missing painted action cel or alpha channel: {name}")
    # Interpolate premultiplied light at each cut edge.
    image[:, :, :3] = np.rint(image[:, :, :3] * (image[:, :, 3:4] / 255)).astype(
        np.uint8
    )
    return image


def place(frame, sprite, anchor, target, factor, radians=0.0, waterline=None):
    """Rotate the painting around a measured point; composite only its visible box."""
    h, w = sprite.shape[:2]
    co, si = math.cos(radians) * factor, math.sin(radians) * factor
    matrix = np.array(((co, -si, 0), (si, co, 0)), dtype=np.float64)
    matrix[:, 2] = np.asarray(target) - matrix[:, :2] @ np.asarray(anchor)
    corners = (
        np.array(((0, 0), (0, h), (w, h), (w, 0))) @ matrix[:, :2].T + matrix[:, 2]
    )
    left, top = np.maximum(np.floor(corners.min(0)).astype(int) - 1, 0)
    right, bottom = np.minimum(
        np.ceil(corners.max(0)).astype(int) + 1, frame.shape[1::-1]
    )
    if right <= left or bottom <= top:
        return
    matrix[:, 2] -= (left, top)
    piece = cv2.warpAffine(
        sprite, matrix, (right - left, bottom - top), flags=cv2.INTER_LINEAR
    )
    coverage = piece[:, :, 3:4].astype(np.float32) / 255
    tint = piece[:, :, :3]
    if waterline is not None:
        # The weight remains briefly discernible through the upper skin of water.
        depth = (
            np.arange(top, bottom, dtype=np.float32)[:, None]
            - waterline[None, left:right]
        )
        visibility = np.where(
            depth < 0,
            1,
            0.16 * np.exp(-np.maximum(0, depth) / (0.018 * frame.shape[0])),
        )
        coverage *= visibility[:, :, None]
        tint = tint * visibility[:, :, None]
    dest = frame[top:bottom, left:right]
    dest[:] = np.clip(dest * (1 - coverage) + tint, 0, 255)


def oval_shade(frame, x, y, rx, ry, strength):
    """Feather a contact shadow on its supporting material."""
    h, w = frame.shape[:2]
    left, right = max(0, int(x - rx * 3)), min(w, int(x + rx * 3) + 1)
    top, bottom = max(0, int(y - ry * 3)), min(h, int(y + ry * 3) + 1)
    yy, xx = np.ogrid[top:bottom, left:right]
    opacity = strength * np.exp(-0.5 * (((xx - x) / rx) ** 2 + ((yy - y) / ry) ** 2))
    dest = frame[top:bottom, left:right]
    dest[:] = dest * (1 - opacity[:, :, None])


class Water:
    """Move painted wave crests inside a material contour with an anchored horizon."""

    def __init__(self, size, outline):
        w, h = size
        poly = np.int32(np.asarray(outline) * [w, h])
        x, y, bw, bh = cv2.boundingRect(poly)
        x, y = max(0, x), max(0, y)
        bw, bh = min(bw, w - x), min(bh, h - y)
        self.box = np.s_[y : y + bh, x : x + bw]
        mask = np.zeros((bh, bw), np.uint8)
        cv2.fillPoly(mask, [poly - [x, y]], 255)
        edge = cv2.distanceTransform(mask, cv2.DIST_L2, 3)
        yy, xx = np.indices((bh, bw), dtype=np.float32)
        ny, nx = (yy + y) / h, (xx + x) / w
        self.yy, self.xx = yy, xx
        self.amount = np.minimum(1, edge / (0.022 * h)) * ((0.16 + ny**2) * h * 0.0075)
        self.wave = ny * 42 - nx * 12
        self.cross = nx * 14.3 + ny * 31.6

    def paint(self, frame, f):
        phase = f * 7.1
        dx = self.amount * np.sin(self.wave - phase)
        dy = self.amount * (
            0.57 * np.sin(self.cross + phase * 1.37) + 0.27 * np.sin(self.wave - phase)
        )
        patch = frame[self.box]
        patch[:] = cv2.remap(
            patch,
            self.xx + dx,
            self.yy + dy,
            cv2.INTER_LINEAR,
            borderMode=cv2.BORDER_REPLICATE,
        )


def swing_height(f, contacts):
    """Raise, accelerate into contact, rebound, and recock between blows."""
    previous = None
    for now in contacts:
        if f <= now:
            if previous is None:
                cocked = now * 0.38
                if f <= cocked:
                    return 0.58 + 0.42 * ease(f / cocked)
            else:
                elapsed = f - previous
                gap = now - previous
                rebound = min(0.036, gap * 0.16)
                settle = rebound + 0.034
                cocked = previous + gap * 0.56
                if elapsed < rebound:
                    return 0.17 * (1 - (1 - unit(elapsed / rebound)) ** 2)
                if elapsed < settle:
                    return 0.17 - 0.08 * ease((elapsed - rebound) / (settle - rebound))
                if f <= cocked:
                    return 0.09 + 0.91 * ease(
                        (elapsed - settle) / (cocked - previous - settle)
                    )
            progress = unit((f - cocked) / (now - cocked))
            return 1 - progress**2.15
        previous = now
    elapsed = f - contacts[-1]
    if elapsed < 0.04:
        return 0.18 * (1 - (1 - elapsed / 0.04) ** 2)
    if elapsed < 0.078:
        return 0.18 - 0.08 * ease((elapsed - 0.04) / 0.038)
    return 0.10 + 0.29 * ease((elapsed - 0.078) / 0.14)


def set_down(f, contacts):
    return sum(ease((f - hit) / 0.026) for hit in contacts) / len(contacts)


def sounding_pose(f, w, h):
    """Eye and foot of the lead relative to the moving near water surface."""
    fall = unit(f / WATER_ENTRY)
    immersed = unit((f - WATER_ENTRY) / 0.33)
    sink = 0.78 * immersed + 0.22 * ease(immersed)
    angle = (0.12 * math.cos(f * 8.5) - 0.074 * math.cos(f * 4.6)) * (1 - 0.8 * sink)
    eye_x = (
        0.384 + 0.103 * math.sin(math.pi * min(1, f / 0.74)) + 0.055 * ease(f / 0.66)
    ) * w
    eye_to_foot = h * 0.215 * (767 - 60) / 772
    foot_x = eye_x - math.sin(angle) * eye_to_foot
    surface = 0.786 + 0.006 * math.sin(f * 8)
    crest = 0.0031 * math.sin(foot_x / w * 37 - f * 7) + 0.0011 * math.sin(
        foot_x / w * 137 + f * 9
    )
    foot_y = h * (surface + crest + 0.35 * (fall**1.4 - 1) + 0.267 * sink)
    eye_y = foot_y - math.cos(angle) * eye_to_foot
    return (eye_x, eye_y), (foot_x, foot_y), angle


@lru_cache(maxsize=12)
def scene(key, dims):
    return ActionScene(key, dims)


class ActionScene:
    def __init__(self, key, dims):
        self.key = key
        self.w, self.h = dims
        raw = cv2.imread(str(ASSETS / (BACKGROUNDS[key] + ".webp")), cv2.IMREAD_COLOR)
        if raw is None:
            raise FileNotFoundError(BACKGROUNDS[key])
        self.base = cv2.resize(
            raw,
            dims,
            interpolation=cv2.INTER_AREA if self.w < raw.shape[1] else cv2.INTER_CUBIC,
        )
        if key == "cast-lead":
            self.water = Water(
                dims,
                (
                    (0.16, 0.417),
                    (0.49, 0.417),
                    (0.78, 0.421),
                    (1, 0.411),
                    (1, 1),
                    (0, 1),
                    (0, 0.742),
                    (0.057, 0.664),
                    (0.088, 0.574),
                ),
            )
            self.screen_x = np.arange(self.w, dtype=np.float32)
        elif key == "swing-lantern":
            self.water = Water(
                dims, ((0.024, 0.605), (0.148, 0.595), (0.151, 0.430), (0.026, 0.433))
            )
            self.bilge = Water(
                dims,
                (
                    (0, 0.662),
                    (0.159, 0.604),
                    (0.54, 0.591),
                    (0.24, 0.706),
                    (0.208, 0.773),
                    (0.19, 1),
                    (0, 1),
                ),
            )
            self.yy, self.xx = np.indices((self.h, self.w), dtype=np.float32)
            self.xx /= self.w
            self.yy /= self.h
        elif key == "strike-iron":
            x0, x1 = round(self.w * 0.265), round(self.w * 0.51)
            y0, y1 = round(self.h * 0.558), round(self.h * 0.686)
            self.iron_box = np.s_[y0:y1, x0:x1]
            yy, xx = np.indices((y1 - y0, x1 - x0), dtype=np.float32)
            self.iron_x, self.iron_y = xx, yy
            nx, ny = (xx + x0) / self.w, (yy + y0) / self.h
            self.iron_top = np.exp(-(((nx - 0.331) / 0.075) ** 2)) * np.maximum(
                0, 1 - np.abs(ny - 0.6) / 0.042
            )

    def frame(self, f):
        frame = self.base.copy()
        if self.key == "cast-lead":
            self.sounding(frame, f)
        elif self.key == "swing-lantern":
            self.lantern(frame, f)
        else:
            self.blow(frame, f)
        return frame

    def sounding(self, frame, f):
        w, h = self.w, self.h
        self.water.paint(frame, f)
        # The ship's paint and the distant island keep registration; the near
        # waterline is the level at which the sounding lead enters the sea.
        sprite = cel("sounding-lead")
        factor = h * 0.215 / sprite.shape[0]
        lead_eye = (0.503 * sprite.shape[1], 0.078 * sprite.shape[0])
        fall = unit(f / WATER_ENTRY)
        sea = 0.786 + 0.006 * math.sin(f * 8)
        attachment, _, angle = sounding_pose(f, w, h)
        line_y = (
            sea
            + 0.0031 * np.sin(self.screen_x / w * 37 - f * 7)
            + 0.0011 * np.sin(self.screen_x / w * 137 + f * 9)
        ) * h
        feed = np.array((w * 0.361, -h * 0.025))
        end = np.array(attachment)
        u = np.linspace(0, 1, 72)
        path = feed + (end - feed) * u[:, None]
        path[:, 0] += (
            (w * 0.026 * (1 - fall) + w * 0.0032)
            * np.sin(u * math.pi)
            * math.cos(f * 7.7)
        )
        feet = [p for p in path if p[1] <= line_y[min(w - 1, max(0, round(p[0])))]]
        if feet:
            pts = np.rint(feet).astype(np.int32)
            cv2.polylines(
                frame,
                [pts],
                False,
                (36, 44, 45),
                max(2, round(w * 0.0036)),
                cv2.LINE_AA,
            )
            cv2.polylines(
                frame,
                [pts - [1, 0]],
                False,
                (116, 146, 155),
                max(1, round(w * 0.0012)),
                cv2.LINE_AA,
            )
        # Markings ride with the line as it pays out, measured up from the eye.
        length = np.linalg.norm(end - feed)
        for index, (dist, color) in enumerate(
            (
                (0.125, (157, 179, 184)),
                (0.285, (58, 81, 131)),
                (0.455, (153, 167, 163)),
                (0.625, (120, 145, 156)),
            )
        ):
            pos = 1 - dist * h / max(1, length)
            if not 0 < pos < 1:
                continue
            anchor = path[round(pos * (len(path) - 1))].copy()
            if anchor[1] > line_y[min(w - 1, round(anchor[0]))]:
                continue
            sx, sy = anchor
            cv2.line(
                frame,
                point(anchor),
                point((sx + (0.0046 if index % 2 else -0.0054) * w, sy + 0.007 * h)),
                color,
                max(1, round(w * 0.0027)),
                cv2.LINE_AA,
            )
        place(frame, sprite, lead_eye, end, factor, angle, line_y)
        # Water sheds from the wet lead before the foot breaks the surface.
        for released in (0.12, 0.32, 0.49):
            flight = (f - released) / 0.135
            if 0 < flight < 1:
                _, (px, py), _ = sounding_pose(released, w, h)
                px += w * 0.006 * flight
                py += h * (0.037 * flight + 0.305 * flight * flight)
                if py < line_y[round(px)]:
                    cv2.line(
                        frame,
                        point((px, py)),
                        point((px, py + h * (0.003 + 0.007 * flight))),
                        (149, 164, 159),
                        max(1, round(w * 0.0011)),
                        cv2.LINE_AA,
                    )
        age = f - WATER_ENTRY
        if 0 < age < 0.33:
            ring = unit(age / 0.32)
            _, (contact_x, _), _ = sounding_pose(WATER_ENTRY, w, h)
            x, y = round(contact_x), round(line_y[round(contact_x)])
            # The current carries the small broken rings toward the right.
            for lag in (0.0, 0.17):
                radi = max(0, ring - lag)
                if radi == 0:
                    continue
                layer = frame.copy()
                rx, ry = (
                    max(2, round(w * (0.005 + 0.050 * radi))),
                    max(1, round(h * (0.002 + 0.012 * radi))),
                )
                cv2.ellipse(
                    layer,
                    (x + round(w * 0.012 * radi), y),
                    (rx, ry),
                    -4,
                    12,
                    150,
                    (171, 183, 177),
                    max(1, round(w * 0.0017)),
                    cv2.LINE_AA,
                )
                cv2.ellipse(
                    layer,
                    (x + round(w * 0.012 * radi), y),
                    (rx, ry),
                    -4,
                    192,
                    325,
                    (88, 113, 111),
                    max(1, round(w * 0.0013)),
                    cv2.LINE_AA,
                )
                cv2.addWeighted(
                    layer, 0.53 * (1 - radi), frame, 1 - 0.53 * (1 - radi), 0, dst=frame
                )
            if age < 0.060:
                t = age / 0.060
                for dx, dy in (
                    (-0.010, 0.020),
                    (0.012, 0.028),
                    (0.016, 0.010),
                    (-0.016, 0.011),
                ):
                    p = point((x + w * dx * t, y - h * dy * math.sin(t * math.pi)))
                    cv2.line(
                        frame,
                        p,
                        (p[0] + 1, p[1] - max(1, round((1 - t) * h * 0.003))),
                        (151, 171, 165),
                        1,
                        cv2.LINE_AA,
                    )

    def blow(self, frame, f):
        w, h = self.w, self.h
        iron = self.key == "strike-iron"
        hits = STRIKES[self.key]
        advance = set_down(f, hits)
        lift = swing_height(f, hits)
        if iron:
            # Deform the photographed-in-paint hot tip from its face toward
            # the cold body. Ballast, bench and bar underside remain still.
            patch = self.base[self.iron_box]
            frame[self.iron_box] = cv2.remap(
                patch,
                self.iron_x,
                self.iron_y - h * 0.017 * advance * self.iron_top,
                cv2.INTER_LINEAR,
                borderMode=cv2.BORDER_REPLICATE,
            )
            x, y = 0.335 * w, (0.603 + 0.015 * advance) * h
            oval_shade(
                frame,
                x + 0.010 * w,
                0.665 * h,
                (0.057 + 0.010 * lift) * w,
                0.006 * h,
                0.13 * (1 - lift),
            )
            bar_y = y
            name = "smith-arm"
            source_anchor = (35, 267)
            art_width, angle = 0.76, 10.5
        else:
            x, board_y = 0.403 * w, 0.543 * h
            exposed = 0.077 - 0.066 * advance
            y = board_y - exposed * h
            oval_shade(
                frame,
                x + 0.012 * w,
                board_y,
                (0.015 + exposed * 0.3) * w,
                0.0038 * h,
                0.30,
            )
            pin = np.int32(
                (
                    (x - 0.0035 * w, board_y),
                    (x - 0.0045 * w, y + 0.004 * h),
                    (x + 0.0036 * w, y + 0.001 * h),
                    (x + 0.0028 * w, board_y),
                )
            )
            cv2.fillConvexPoly(frame, pin, (49, 59, 64), cv2.LINE_AA)
            cv2.line(
                frame,
                point((x - 0.002 * w, board_y)),
                point((x - 0.003 * w, y + 0.004 * h)),
                (140, 148, 143),
                max(1, round(w * 0.0016)),
                cv2.LINE_AA,
            )
            cv2.ellipse(
                frame,
                point((x, y + 0.003 * h)),
                (max(2, round(w * 0.0085)), max(1, round(h * 0.0035))),
                -2,
                0,
                360,
                (35, 42, 45),
                -1,
                cv2.LINE_AA,
            )
            cv2.ellipse(
                frame,
                point((x, y + 0.001 * h)),
                (max(2, round(w * 0.0075)), max(1, round(h * 0.0023))),
                -2,
                0,
                360,
                (145, 153, 148),
                -1,
                cv2.LINE_AA,
            )
            name = "boatwright-arm"
            source_anchor = (58, 268)
            art_width, angle = 0.71, 8.5
        sprite = cel(name)
        factor = art_width * w / sprite.shape[1]
        # Pivot at the elbow beyond the right frame edge. The hand keeps a
        # continuous grip on its tool and the head lands on its measured face.
        pivot = np.array((w * 1.095, y - 0.18 * h))
        theta = math.radians(angle) * lift
        co, si = math.cos(theta), math.sin(theta)
        delta = np.array((x, y)) - pivot
        contact = pivot + (co * delta[0] - si * delta[1], si * delta[0] + co * delta[1])
        place(frame, sprite, source_anchor, contact, factor, theta)
        if iron:
            # Brief dark scale flakes break from the worked stock; no fountain of sparks.
            for hit in hits:
                age = (f - hit) / 0.047
                if 0 < age < 1:
                    for dx, rise, color in (
                        (-0.027, 0.023, (68, 128, 185)),
                        (-0.013, 0.035, (94, 156, 192)),
                        (0.022, 0.018, (52, 85, 114)),
                    ):
                        px, py = (
                            x + dx * w * age,
                            bar_y
                            - rise * h * math.sin(age * math.pi)
                            + age * age * h * 0.012,
                        )
                        cv2.line(
                            frame,
                            point((px, py)),
                            point((px - 0.002 * w * (1 - age), py + 0.002 * h)),
                            color,
                            1,
                            cv2.LINE_AA,
                        )

    def lantern(self, frame, f):
        w, h = self.w, self.h
        self.water.paint(frame, f)
        self.bilge.paint(frame, f)
        rad = 0.27 * math.cos((f - 0.34) * math.tau / 0.94) + 0.020 * math.sin(f * 9)
        pivot = np.array((w * 0.624, h * 0.137))
        chain = 0.097 * h
        top = pivot + (-math.sin(rad) * chain, math.cos(rad) * chain)
        factor = 0.369 * h / cel("ships-lamp").shape[0]
        down = chain + 0.245 * h
        flame_x = (pivot[0] - math.sin(rad) * down) / w
        flame_y = (pivot[1] + math.cos(rad) * down) / h
        flicker = 1 + 0.055 * math.sin(f * 47) + 0.028 * math.sin(f * 77 + 0.7)
        light = (
            np.exp(
                -(
                    ((self.xx - flame_x) / 0.135) ** 2
                    + ((self.yy - flame_y) / 0.175) ** 2
                )
            )
            * 0.52
            * flicker
        )
        # Wet timber reflects the moving flame into narrow broken striations.
        fall = np.maximum(0, (self.yy - 0.565) / 0.43)
        stripes = np.square(
            np.sin(self.yy * 173 + np.sin(self.xx * 33 + f * 2.5) * 1.7)
        )
        dx = self.xx - flame_x - 0.005 * np.sin(self.yy * 119 + 4 * f)
        reflected = (
            np.exp(-np.square(dx / (0.015 + 0.024 * fall)))
            * np.exp(-fall * 2.6)
            * stripes
        )
        water_mask = np.clip((self.yy - 0.608) / 0.053, 0, 1) * np.clip(
            (0.815 - self.yy) / 0.04, 0, 1
        )
        glow = (light + 0.29 * reflected * water_mask)[:, :, None]
        frame[:] = np.clip(
            frame * (1 + 0.4 * glow) + glow * np.array((3, 22, 56)), 0, 255
        )
        cv2.ellipse(
            frame,
            point(pivot),
            (max(2, round(h * 0.006)), max(2, round(h * 0.009))),
            -10,
            0,
            360,
            (38, 43, 48),
            max(1, round(h * 0.004)),
            cv2.LINE_AA,
        )
        cv2.line(
            frame,
            point(pivot),
            point(top),
            (34, 42, 45),
            max(2, round(h * 0.0046)),
            cv2.LINE_AA,
        )
        for u in np.linspace(0.085, 0.94, 6):
            p = pivot + (top - pivot) * u
            cv2.ellipse(
                frame,
                point(p),
                (max(1, round(h * 0.0035)), max(2, round(h * 0.007))),
                math.degrees(-rad),
                0,
                360,
                (92, 106, 112),
                max(1, round(h * 0.0016)),
                cv2.LINE_AA,
            )
        lamp = cel("ships-lamp")
        place(
            frame, lamp, (0.5 * lamp.shape[1], 0.015 * lamp.shape[0]), top, factor, rad
        )


def action_frame(key, fraction, dims):
    """Return a newly allocated BGR frame for a local 0–1 performance interval."""
    if key not in ACTIONS:
        raise KeyError(key)
    return scene(key, tuple(dims)).frame(unit(float(fraction)))
