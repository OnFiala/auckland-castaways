"""Registered material motion and the rostrum-camera cut-paper performances."""

import json
import math
from functools import lru_cache
from pathlib import Path
from typing import ClassVar

import cv2
import numpy as np
from story_film_direction import CAMERA, CAST, FIRELIGHT, SURFACES

ROOT = Path(__file__).resolve().parents[1]
ASSET = ROOT / "dist/assets"
W, H = 1440, 810
PRINTS = ("invercauld-wreck", "skin-boat", "julian")
TWO_PI = 2 * math.pi
cv2.setNumThreads(1)


def read(path, alpha=False):
    img = cv2.imread(str(path), cv2.IMREAD_UNCHANGED if alpha else cv2.IMREAD_COLOR)
    if img is None:
        raise FileNotFoundError(path)
    return img


def scale(img, wh):
    return cv2.resize(
        img,
        wh,
        interpolation=cv2.INTER_AREA if img.shape[1] > wh[0] else cv2.INTER_CUBIC,
    )


def softstep(value):
    v = np.clip(value, 0, 1)
    return v * v * (3 - 2 * v)


def over(dst, cel, x, y):
    """Paste straight BGR with float coverage, clipping entering actors."""
    rgb, alpha = cel
    h, w = alpha.shape
    l, r = max(0, -x), min(w, dst.shape[1] - x)
    a, b = max(0, -y), min(h, dst.shape[0] - y)
    if r <= l or b <= a:
        return
    section = dst[y + a : y + b, x + l : x + r]
    cv2.blendLinear(
        section, rgb[a:b, l:r], 1 - alpha[a:b, l:r], alpha[a:b, l:r], dst=section
    )


def split_cel(img):
    return np.ascontiguousarray(img[:, :, :3]), np.ascontiguousarray(
        img[:, :, 3], dtype="float32"
    ) / 255


def paint_print(key):
    """Impress newly drawn line art into the original illustrated work-table sheet."""
    plate = scale(read(ASSET / "workplates/chart.webp"), (W, H))
    name = "wreck" if key == "invercauld-wreck" else key
    image = read(ASSET / "epilogue" / f"{name}.webp")[:, :, 0]
    width_limit = int(W * 0.61)
    height_limit = int(H * 0.64)
    resize_by = min(width_limit / image.shape[1], height_limit / image.shape[0])
    thumb = scale(
        image, (round(image.shape[1] * resize_by), round(image.shape[0] * resize_by))
    )
    h, w = thumb.shape
    cy = 0.535 if key == "skin-boat" else 0.53
    x, y = round(W * 0.49 - w / 2), round(H * cy - h / 2)
    paper = plate[y : y + h, x : x + w]
    # In the white field of the woodcut the original paper tooth remains visible.
    ink = (1 - thumb.astype("float32") / 255)[:, :, None]
    paper[:] = (paper * (1 - ink * 0.89) + np.array((23, 27, 25)) * ink * 0.89).astype(
        "uint8"
    )
    return plate


def source(key):
    if key in PRINTS:
        return paint_print(key)
    if key in ("schooner", "cabin-table", "shore-dawn", "outfit", "hearth-remains"):
        path = ROOT / "artwork/story-film/plates" / f"{key}.webp"
    elif key == "ending":
        path = ASSET / "voyage/promise/ending.webp"
    elif key in ("hull-detail", "rig-detail"):
        path = ASSET / "workplates" / f"{key.split('-')[0]}.webp"
    else:
        parent = {
            "workshop-detail": "forge-lit",
            "table-detail": "cabin",
            "reunion": "landing",
            "collections": "chartroom",
        }.get(key, key)
        path = ASSET / "tidepaint" / f"{parent}.webp"
    raw = read(path)
    # For the 3:2 insert paintings, crop vertically instead of stretching.
    if raw.shape[0] / raw.shape[1] > 0.66:
        height = round(raw.shape[1] * 9 / 16)
        top = (raw.shape[0] - height) // 2
        raw = raw[top : top + height]
    return scale(raw, (W, H))


class Surface:
    """Two travelling wave trains feathered inside a painted contour.

    The sea and fabric have different wavelengths, speeds and axes. Copper
    and timber therefore remain fixed where they interrupt the sea.
    """

    SETTINGS: ClassVar = {
        # drift x/y, frequency, spatial cycles across width/height
        "sea": (12, 5.8, 1.12, 2.1, 7.4),
        "wash": (12, 5.6, 1.25, 2.6, 5.2),
        "shore": (6.4, 2.7, 1.24, 2.2, 12.0),
        "quiet": (3.2, 1.3, 1.04, 2.7, 16),
        "grass": (2.5, 0.8, 1.57, 2.4, 3.0),
        "sail": (3.5, 2.2, 1.72, 2.0, 4.5),
        "fire": (2.6, 4.4, 4.1, 8.3, 10.3),
    }

    def __init__(self, kind, points):
        p = np.array(
            [
                [round(float(x) * W / 100), round(float(y) * H / 100)]
                for x, y in (pair.split(",") for pair in points.split())
            ],
            dtype="int32",
        )
        x, y, w, h = cv2.boundingRect(p)
        x = max(x, 0)
        y = max(y, 0)
        w = min(w, W - x)
        h = min(h, H - y)
        self.box = np.s_[y : y + h, x : x + w]
        mask = np.zeros((h, w), np.uint8)
        cv2.fillPoly(mask, [p - (x, y)], 255)
        border = cv2.copyMakeBorder(mask, 1, 1, 1, 1, cv2.BORDER_CONSTANT)
        dist = cv2.distanceTransform(border, cv2.DIST_L2, 3)[1:-1, 1:-1]
        weight = softstep(
            dist / float({"fire": 5, "sail": 12, "wash": 19}.get(kind, 11))
        ).astype("float32")
        yy, xx = np.indices((h, w), dtype="float32")
        self.xx, self.yy = xx, yy
        nx, ny = (xx + x) / W, (yy + y) / H
        u, v, self.speed, fx, fy = self.SETTINGS[kind]
        if kind in ("quiet", "sea", "shore", "wash"):
            weight *= 0.35 + 0.65 * (yy / max(1, h)) ** 0.65
        phi = TWO_PI * (fx * nx + fy * ny + 0.13 * np.sin(3 * nx))
        theta = TWO_PI * (fy * 0.8 * ny - fx * 0.79 * nx)
        self.ax = np.cos(phi) * weight * u
        self.bx = np.sin(phi) * weight * u
        self.ay = np.sin(theta) * weight * v
        self.by = np.cos(theta) * weight * v

    def render(self, frame, t):
        angle = t * self.speed
        dx = cv2.addWeighted(self.ax, math.sin(angle), self.bx, math.cos(angle), 0)
        dy = cv2.addWeighted(
            self.ay, math.sin(angle * 1.34), self.by, math.cos(angle * 1.34), 0
        )
        # The second wave train contributes only a little across the major axis.
        mx = cv2.addWeighted(dx, 1.0, dy, 0.25, 0) + self.xx
        my = cv2.addWeighted(dy, 1.0, dx, 0.15, 0) + self.yy
        patch = frame[self.box]
        patch[:] = cv2.remap(
            patch, mx, my, cv2.INTER_LINEAR, borderMode=cv2.BORDER_REPLICATE
        )


class Hull:
    """Rock the hull, spars and rig as a unit around the centre of flotation.

    The bracketing mist has no fixed landmarks. A broad taper under the keel
    joins the heaving body to the independently animated painted swell.
    """

    def __init__(self):
        yy, xx = np.indices((int(H * 0.74), int(W * 0.78)), dtype="float32")
        nx, ny = xx / W + 0.22, yy / H
        self.box = np.s_[: yy.shape[0], round(W * 0.22) : round(W * 0.22) + xx.shape[1]]
        self.xx, self.yy = xx, yy
        self.weight = (
            softstep((nx - 0.23) / 0.1)
            * softstep((0.99 - nx) / 0.08)
            * softstep((0.73 - ny) / 0.062)
        ).astype("float32")
        self.rx = (ny - 0.63) * H * self.weight
        self.ry = (nx - 0.625) * W * self.weight

    def render(self, frame, t):
        phase = t * 1.14
        rot = math.sin(phase) * 0.0088 + math.sin(0.61 * phase + 0.2) * 0.0025
        heave = 3.8 * math.sin(phase + 0.85)
        mx = self.xx + self.rx * rot
        my = self.yy - self.ry * rot + self.weight * heave
        patch = frame[self.box]
        patch[:] = cv2.remap(
            patch, mx, my, cv2.INTER_LINEAR, borderMode=cv2.BORDER_REPLICATE
        )


@lru_cache(maxsize=24)
def sprite(actor, pose):
    if pose == "seated":
        im = read(ASSET / "shore-rest/raynal.webp", True)
        return im, np.array([263, 478]), 480 / 0.635
    meta = json.loads((ASSET / "work-poses/manifest.json").read_text())["assets"][actor]
    entry = meta["poses"][pose]
    x, y, w, h = entry["crop"]
    # Transparent margin lets arms lean without clipping their outlines.
    native = read(ASSET / meta["atlas"].removeprefix("assets/"), True)[
        y : y + h, x : x + w
    ]
    return (
        cv2.copyMakeBorder(native, 8, 8, 8, 8, cv2.BORDER_CONSTANT),
        np.array(entry["ground"]) - [x - 8, y - 8],
        meta["standingHeight"],
    )


def match_light(img, warm, exposure=0.98):
    tint = np.array((0.90, 0.95, 1.025) if warm else (0.992, 0.985, 0.963))
    img[:, :, :3] = np.clip(img[:, :, :3] * tint * exposure, 0, 255).astype("uint8")
    return img


class Performer:
    def __init__(self, info, warm):
        actor, pose, x, y, height, facing, self.action = info
        self.seed = sum(map(ord, actor)) * 0.021
        body, feet, upright = sprite(actor, pose)
        factor = H * height / upright
        h, w = body.shape[:2]
        im = scale(body, (round(w * factor), round(h * factor)))
        match_light(im, warm, 0.94 if warm else 0.985)
        feet = feet * factor
        if facing == "left":
            im = cv2.flip(im, 1)
            feet[0] = im.shape[1] - feet[0]
        self.x, self.y = round(W * x - feet[0]), round(H * y - feet[1])
        self.foot = (round(W * x), round(H * y))
        self.shadow_size = max(8, round(H * height * 0.15))
        yy, xx = np.indices(im.shape[:2], dtype="float32")
        relative = 1 - yy / im.shape[0]
        direction = 1 if facing == "right" else -1
        forward = xx / im.shape[1] if facing == "right" else 1 - xx / im.shape[1]
        palm = softstep((forward - 0.48) / 0.47) * softstep(relative / 0.16)
        lean = relative**1.4
        # Feet remain planted. A loading stroke bends shoulder, elbow, hand.
        amp_x, amp_y, arm = {
            "pump": (8, 5, 11),
            "canvas": (3, 2, 4),
            "file": (4, 2, 4),
            "carve": (2, 1.5, 3),
            "helm": (3, 3, 2),
            "watch": (1.5, 1, 0),
            "rest": (1, 1.3, 0),
        }[self.action]
        mx = (amp_x * lean + arm * 0.38 * palm) * direction
        my = amp_y * lean + arm * palm
        self.frames = []
        for phase in np.linspace(-1, 1, 29, dtype="float32"):
            cel = cv2.remap(
                im,
                xx - mx * phase,
                yy - my * phase,
                cv2.INTER_LINEAR,
                borderMode=cv2.BORDER_CONSTANT,
            )
            self.frames.append(split_cel(cel))

    def render(self, frame, t):
        rate = {
            "pump": 2.7,
            "canvas": 1.53,
            "file": 3.15,
            "carve": 2.27,
            "helm": 1.20,
            "rest": 1.55,
            "watch": 1.05,
        }[self.action]
        phase = math.sin(t * rate + (0 if self.action == "pump" else self.seed))
        idx = round((len(self.frames) - 1) * (0.5 + 0.5 * phase))
        over(frame, self.frames[idx], self.x, self.y)


class Walker:
    """Walk-cycle spacing uses the measured planted contact on its six cels."""

    def __init__(
        self, actor, x, y, height, start, facing="right", end_x=None, warm=True
    ):
        self.x, self.y, self.start = x, y, start
        self.end_x = end_x
        self.sign = 1 if facing == "right" else -1
        factor = H * height / 482
        sheet = read(ASSET / "walk" / f"{actor}.png", True)
        self.frames = []
        for idx in range(6):
            cx, cy = idx % 3 * 512, idx // 3 * 512
            cel = sheet[cy + 5 : cy + 505, cx + 32 : cx + 480]
            size = (round(448 * factor), round(500 * factor))
            if self.sign < 0:
                cel = cv2.flip(cel, 1)
            self.frames.append(split_cel(match_light(scale(cel, size), warm, 0.95)))
        self.anchor = (224 * factor, 493 * factor)
        self.stride = 70 * factor
        self.rest = Performer((actor, "stand", x, y, height, facing, "watch"), warm)
        self.arrival = (
            Performer((actor, "stand", end_x, y, height, facing, "watch"), warm)
            if end_x
            else None
        )

    def render(self, dst, t):
        elapsed = t - self.start
        if elapsed < 0:
            self.rest.render(dst, t)
            return
        gait = elapsed * 6.85
        step = gait * self.stride
        if self.end_x is not None and step >= abs(self.end_x - self.x) * W:
            self.arrival.render(dst, t)
            return
        x = round(self.x * W + self.sign * step - self.anchor[0])
        y = round(self.y * H - self.anchor[1])
        over(dst, self.frames[int(gait) % 6], x, y)


class Light:
    def __init__(self, key, values):
        self.key = key
        x, y, rx, ry = values
        yy, xx = np.indices((H, W), dtype="float32")
        radius = ((xx / W - x) / rx) ** 2 + ((yy / H - y) / ry) ** 2
        pool = np.exp(-2 * radius)
        if key == "cabin-table":
            # Flame, varnished wood and mobile water each catch the same light.
            pool += 0.65 * np.exp(
                -(((xx / W - 0.585) / 0.12) ** 2) - ((yy / H - 0.607) / 0.17) ** 2
            )
            pool += 0.44 * np.exp(
                -(((xx / W - 0.60) / 0.13) ** 2) - ((yy / H - 0.865) / 0.13) ** 2
            )
        self.field = (
            (pool[:, :, None] * np.array((10, 38, 56))).clip(0, 255).astype("uint8")
        )

    def render(self, frame, t):
        s = (
            0.28 * math.sin(2.6 * t)
            + 0.19 * math.sin(5.3 * t + 0.7)
            + 0.075 * math.sin(10.1 * t + 0.6)
        )
        if self.key.startswith("forge") or self.key == "workshop-detail":
            s += 0.33 * math.sin(2.7 * t - 0.6)
        cv2.addWeighted(frame, 1, self.field, s, 0, dst=frame)


class Bellows:
    def __init__(self):
        self.top = (round(W * 195 / 1664), round(H * 282 / 936))
        size = (round(W * 381 / 1664), round(H * 271 / 936))
        atlas = read(ASSET / "tactile/bellows-stroke.webp", True)
        self.support = split_cel(
            scale(read(ASSET / "tactile/bare-trestle.webp", True), size)
        )
        self.frames = [
            split_cel(scale(atlas[:, i * 381 : (i + 1) * 381], size)) for i in range(9)
        ]

    def render(self, frame, t):
        over(frame, self.support, *self.top)
        over(frame, self.frames[round(4 + 4 * math.sin(t * 2.7))], *self.top)


class Air:
    """Image-space rain outside, sea spray at a crest, and convection in a hearth."""

    def __init__(self, key):
        self.key = key
        rng = np.random.default_rng(sum(map(ord, key)))
        self.seeds = rng.random((120, 5))
        if key in PRINTS or key in ("chartroom", "collections"):
            yy, xx = np.indices((max(1, H // 4), max(1, W // 4)), dtype="float32")
            self.beam = (xx / (W / 4) + 0.30 * yy / (H / 4)).astype("float32")

    def render(self, frame, t):
        key = self.key
        if key == "camp-shelter":
            film = frame.copy()
            for x, y, depth, delay, r in self.seeds[:95]:
                life = (t * (0.81 + depth * 0.44) + delay) % 1
                px = int(((x - 0.11 * life) % 1) * W)
                py = int(((y + life) % 1) * H)
                length = 5 + round(depth * 5)
                cv2.line(
                    film,
                    (px, py),
                    (px - 2, py + length),
                    (153, 170, 167),
                    1,
                    cv2.LINE_AA,
                )
            cv2.addWeighted(frame, 0.76, film, 0.24, 0, dst=frame)
        if key in ("schooner", "crossing-wet", "rig-detail"):
            overlay = frame.copy()
            for x, y, depth, delay, r in self.seeds[:55]:
                if key == "schooner":
                    period = 3.6
                    age = (t + delay * 0.9) % period
                    if age > 1.05:
                        continue
                    startx = 0.405 + 0.046 * x
                    starty = 0.65 + 0.019 * y
                    spread = 0.052
                else:
                    period = 3.0
                    age = (t + delay * 1.15) % period
                    if age > 1.18:
                        continue
                    startx = (-0.035 if key == "crossing-wet" else 0.79) + 0.060 * x
                    starty = (0.61 if key == "crossing-wet" else 0.91) + 0.13 * y
                    spread = 0.12
                life = age / 1.18
                px = int(W * (startx + spread * life * (0.4 + r)))
                py = int(H * (starty - (0.12 + 0.12 * depth) * life + 0.24 * life**2))
                strength = (1 - life) ** 0.5
                if 0 <= px < W and 0 <= py < H:
                    colour = tuple(
                        int((1 - strength * 0.56) * v + strength * 0.56 * c)
                        for v, c in zip(frame[py, px], (195, 196, 182))
                    )
                    cv2.line(
                        overlay, (px, py), (px + 1, py - 1), colour, 1, cv2.LINE_AA
                    )
            cv2.addWeighted(frame, 0.44, overlay, 0.56, 0, dst=frame)
        if key in (
            "forge-lit",
            "workshop-detail",
            "cabin",
            "return-camp",
            "table-detail",
        ):
            forge = key in ("forge-lit", "workshop-detail")
            fx, fy = (0.414, 0.441) if forge else (0.119, 0.632)
            for x, y, depth, delay, r in self.seeds[: 12 if forge else 5]:
                age = (t * (0.37 + 0.26 * depth) + delay) % 1
                if age > 0.71:
                    continue
                xx = int(
                    W
                    * (
                        fx
                        + (x - 0.5) * (0.077 if forge else 0.049)
                        + 0.003 * math.sin(7 * age + r * 8)
                    )
                )
                yy = int(H * (fy - age * (0.095 + 0.06 * y)))
                intensity = math.sin(age / 0.71 * math.pi) * 0.70
                colour = tuple(
                    int(v * (1 - intensity) + c * intensity)
                    for v, c in zip(frame[yy, xx], (70, 172, 247))
                )
                cv2.line(frame, (xx, yy), (xx, yy + 1), colour, 1, cv2.LINE_AA)
        if key in PRINTS or key in ("chartroom", "collections"):
            # Slow passage of window light, independent of the camera travel.
            centre = 0.5 + 0.24 * math.sin(t * 0.21 + 0.3)
            brush = np.exp(-(((self.beam - centre) / 0.19) ** 2))
            beam = cv2.resize((brush * 13).astype("uint8"), (W, H))
            cv2.add(frame, cv2.merge((beam // 3, beam // 2, beam)), dst=frame)


class Stage:
    def __init__(self, key):
        self.key = key
        self.base = source(key)
        if key == "wreck":
            # The second anchor failed at midnight. Cool the exposed bow and
            # keep the pale crests visible in the night exterior.
            gray = cv2.cvtColor(self.base, cv2.COLOR_BGR2GRAY)
            dim = (gray.astype("float32") / 255) ** 1.18
            self.base = (
                dim[:, :, None] * np.array((116, 96, 74)) + np.array((18, 12, 9))
            ).astype("uint8")
        if key in ("cabin", "table-detail"):
            chessmen(self.base)
        if key in ("chartroom", "collections"):
            donations(self.base)
        self.surfaces = [
            Surface(kind, points) for kind, points in SURFACES.get(key, ())
        ]
        self.hull = Hull() if key == "schooner" else None
        self.pan = SettlingPan() if key == "outfit" else None
        warm = key in (
            "cabin",
            "return-camp",
            "forge-cold",
            "forge-lit",
            "workshop-detail",
            "table-detail",
        )
        self.performers = [Performer(c, warm) for c in CAST.get(key, ())]
        if key == "beach":
            self.performers.append(
                Performer(
                    ("raynal", "seated", 0.405, 0.805, 0.35, "right", "rest"), False
                )
            )
            self.performers.append(
                Performer(
                    ("george", "stand", 0.555, 0.794, 0.32, "left", "watch"), False
                )
            )
        self.walkers = []
        if key == "return-camp":
            self.walkers = [
                Walker("george", 0.55, 0.727, 0.42, 1.5),
                Walker("henry", 0.72, 0.701, 0.395, 0.55),
            ]
        if key == "reunion":
            self.walkers = [
                Walker("musgrave", 0.737, 0.705, 0.337, 0, "left", 0.526, False)
            ]
        for person in self.performers:
            # Fixed low contact shadow anchors boots to the surrounding paint.
            x, y = person.foot
            r = person.shadow_size
            l, a = max(0, x - r * 2), max(0, y - r // 3)
            b, c = min(W, x + r * 2), min(H, y + r // 3 + 1)
            yy, xx = np.indices((c - a, b - l), dtype="float32")
            shade = 1 - 0.24 * np.exp(
                -(((xx + l - x) / r) ** 2) - ((yy + a - y + 1) / max(2, r * 0.13)) ** 2
            )
            self.base[a:c, l:b] = (self.base[a:c, l:b] * shade[:, :, None]).astype(
                "uint8"
            )
        self.light = Light(key, FIRELIGHT[key]) if key in FIRELIGHT else None
        self.bellows = Bellows() if key in ("forge-lit", "workshop-detail") else None
        self.air = Air(key)
        self.start, self.end = CAMERA[key]

    def frame(self, t, fraction, dims):
        frame = self.base.copy()
        if self.hull:
            self.hull.render(frame, t)
        if self.pan:
            self.pan.render(frame, t)
        for surface in self.surfaces:
            surface.render(frame, t)
        if self.bellows:
            self.bellows.render(frame, t)
        if self.key == "crossing-bailed":
            draw_pump(frame, t)
        # A cut-in starts a new camera beat. The men remain on the shore after
        # the interior cut regardless of the voice cue's original time offset.
        actor_t = t - 4.32 if self.key == "reunion" else t
        for actor in self.performers:
            actor.render(frame, t)
        for walker in self.walkers:
            walker.render(frame, actor_t)
        if self.light:
            self.light.render(frame, t)
        self.air.render(frame, t)
        f = float(
            softstep(
                min(1, fraction * 1.34) if self.key == "hearth-remains" else fraction
            )
        )
        fx, fy, z = (a + (b - a) * f for a, b in zip(self.start, self.end))
        roll = 0.0
        if self.key == "schooner":
            fy = 0.5 / z  # Pin the camera above the mainmast for the whole heave.
        if self.key in ("crossing-wet", "crossing-bailed", "rig-detail", "cabin-table"):
            strength = 0.58 if self.key == "cabin-table" else 1.32
            phase = 1.11 * t + (0.85 if self.key == "rig-detail" else 0)
            roll = strength * (math.sin(phase) + 0.17 * math.sin(1.92 * phase + 0.3))
            fx += 0.0025 * math.sin(phase + 0.3)
            fy += 0.0052 * math.sin(phase - 0.3)
        half = 0.5 / z
        fx = float(np.clip(fx, half, 1 - half))
        fy = float(np.clip(fy, half, 1 - half))
        w, h = dims
        matrix = cv2.getRotationMatrix2D((W * fx, H * fy), roll, z * w / W)
        matrix[0, 2] += w / 2 - W * fx
        matrix[1, 2] += h / 2 - H * fy
        return cv2.warpAffine(
            frame,
            matrix,
            dims,
            flags=cv2.INTER_LINEAR,
            borderMode=cv2.BORDER_REFLECT_101,
        )


def chessmen(frame):
    """Small faceted pieces carved from strips, beside Raynal's painted hand."""
    y = int(H * 0.505)
    for i, (nx, height, red) in enumerate(
        [
            (0.308, 16, False),
            (0.323, 11, True),
            (0.343, 18, True),
            (0.357, 14, False),
            (0.375, 11, False),
        ]
    ):
        x = round(W * nx)
        bgr = (48, 65, 126) if red else (146, 184, 204)
        h = height
        outline = np.array(
            [
                (x - 5, y),
                (x - 4, y - 3),
                (x - 2, y - 4),
                (x - 2, y - h + 6),
                (x - 4, y - h + 4),
                (x - 2, y - h),
                (x + 2, y - h - 1),
                (x + 4, y - h + 4),
                (x + 2, y - h + 6),
                (x + 2, y - 4),
                (x + 4, y - 3),
                (x + 5, y - 1),
            ],
            np.int32,
        )
        cv2.ellipse(
            frame, (x + 3, y + 1), (7, 2), 0, 0, 360, (66, 77, 78), -1, cv2.LINE_AA
        )
        cv2.fillPoly(frame, [outline], bgr, cv2.LINE_AA)
        cv2.line(
            frame,
            (x - 2, y - 3),
            (x - 1, y - h + 4),
            tuple(min(255, c + 27) for c in bgr),
            1,
            cv2.LINE_AA,
        )
    for i in range(4):
        x = round((0.376 + 0.005 * i) * W)
        cv2.line(frame, (x, y + 3), (x + 6, y + 1), (127, 156, 170), 1, cv2.LINE_AA)


def donations(frame):
    """Cloth, purse-sized stacks of coins and a ledger beside the window."""
    desk = frame
    atlas = read(ASSET / "voyage/props/voyage.png", True)
    sprites = json.loads((ASSET / "voyage/props/manifest.json").read_text())["sprites"]
    for key, nx, ny, nw in [
        ("journal", 0.295, 0.484, 0.115),
        ("provisions", 0.593, 0.455, 0.063),
    ]:
        data = sprites[key]
        x, y, w, h = data["viewBox"]
        piece = atlas[y : y + h, x : x + w]
        width = int(nw * W)
        height = round(width * h / w * (0.29 if key == "journal" else 0.78))
        cel = split_cel(scale(piece, (width, height)))
        over(desk, cel, int(nx * W), int(ny * H - height))
    blanket = read(ASSET / "tidepaint/cabin.webp")
    bh, bw = blanket.shape[:2]
    # Registered outer folds of the wool blanket, leaving the bedposts behind.
    # Points were measured on a twice-enlarged native crop at (1010,390).
    contour = [
        (144, 169),
        (153, 154),
        (182, 146),
        (217, 150),
        (244, 145),
        (281, 147),
        (315, 144),
        (351, 146),
        (399, 137),
        (480, 133),
        (509, 132),
        (527, 139),
        (536, 158),
        (553, 166),
        (569, 167),
        (590, 178),
        (614, 185),
        (638, 198),
        (647, 222),
        (649, 268),
        (642, 277),
        (617, 284),
        (577, 283),
        (525, 289),
        (450, 293),
        (341, 295),
        (277, 297),
        (236, 294),
        (211, 286),
        (196, 274),
        (174, 267),
        (153, 259),
        (139, 247),
        (135, 229),
        (140, 217),
        (151, 210),
        (148, 199),
        (145, 190),
    ]
    mask = np.zeros((bh, bw), np.uint8)
    poly = (np.array(contour) / 2 + np.array((1010, 390))).round().astype("int32")
    cv2.fillPoly(mask, [poly], 255, lineType=cv2.LINE_AA)
    x, y, w, h = cv2.boundingRect(poly)
    folded = cv2.cvtColor(blanket[y : y + h, x : x + w], cv2.COLOR_BGR2BGRA)
    folded[:, :, 3] = mask[y : y + h, x : x + w]
    over(desk, split_cel(scale(folded, (155, 52))), int(0.509 * W), int(0.472 * H) - 52)
    for j, (x, y, n) in enumerate(
        [(0.44, 0.475, 3), (0.458, 0.481, 2), (0.466, 0.466, 1), (0.428, 0.484, 1)]
    ):
        xx, yy = round(W * x), round(H * y)
        for k in range(n):
            cv2.ellipse(
                desk, (xx, yy - 2 * k), (7, 3), 0, 0, 360, (54, 67, 80), -1, cv2.LINE_AA
            )
            cv2.ellipse(
                desk,
                (xx, yy - 2 * k - 1),
                (6, 2),
                0,
                0,
                360,
                (124, 151, 166),
                -1,
                cv2.LINE_AA,
            )


def draw_pump(frame, t):
    """Stage a small lift pump under the registered reach of Musgrave's hand."""
    phase = math.sin(t * 2.7)
    handx, handy = round(905 - 8 * phase), round(435 + 14 * phase)
    footx, footy = 913, 654
    # The shaft and barrel rise from one planted socket between the floorboards.
    cv2.ellipse(
        frame, (footx + 6, footy + 1), (23, 5), 1, 0, 360, (32, 43, 54), -1, cv2.LINE_AA
    )
    body = np.array(
        [
            (footx - 12, footy),
            (footx - 13, 493),
            (footx - 9, 488),
            (footx + 7, 486),
            (footx + 13, 490),
            (footx + 12, footy - 1),
        ],
        np.int32,
    )
    cv2.fillPoly(frame, [body], (39, 63, 83), cv2.LINE_AA)
    for offset, colour in [
        (-9, (76, 98, 115)),
        (-5, (64, 83, 101)),
        (-1, (59, 75, 91)),
        (5, (32, 52, 69)),
        (10, (28, 43, 56)),
    ]:
        cv2.line(
            frame,
            (footx + offset, 491),
            (footx + offset - 1, footy - 4),
            colour,
            2,
            cv2.LINE_AA,
        )
    for y in (499, 600, 642):
        cv2.line(
            frame, (footx - 12, y + 2), (footx + 12, y), (36, 45, 48), 4, cv2.LINE_AA
        )
        cv2.line(
            frame, (footx - 11, y), (footx + 9, y - 2), (91, 102, 106), 1, cv2.LINE_AA
        )
    cv2.line(frame, (footx, 488), (handx, handy + 1), (47, 58, 66), 5, cv2.LINE_AA)
    cv2.line(
        frame, (footx - 1, 486), (handx - 1, handy + 1), (120, 133, 137), 1, cv2.LINE_AA
    )
    cv2.line(
        frame,
        (handx - 13, handy + 3),
        (handx + 15, handy - 3),
        (38, 52, 66),
        6,
        cv2.LINE_AA,
    )
    cv2.line(
        frame,
        (handx - 12, handy + 1),
        (handx + 12, handy - 4),
        (105, 132, 150),
        2,
        cv2.LINE_AA,
    )
    # A slack fall from the rail comes down behind his other, lower hand.
    rope = np.array(
        [
            (1324, 414),
            (1255, 419),
            (1168, 434),
            (1086, 459),
            (1040, 485),
            (1000, 584),
            (970, 632),
        ],
        np.int32,
    )
    cv2.polylines(frame, [rope], False, (50, 67, 80), 4, cv2.LINE_AA)
    cv2.polylines(frame, [rope - [1, 0]], False, (97, 124, 141), 1, cv2.LINE_AA)


class SettlingPan:
    """The sailor lowers his prospecting pan into the open Sydney sea chest."""

    def __init__(self):
        x0, y0, x1, y1 = (
            round(0.36 * W),
            round(0.12 * H),
            round(0.93 * W),
            round(0.72 * H),
        )
        self.box = np.s_[y0:y1, x0:x1]
        yy, xx = np.indices((y1 - y0, x1 - x0), dtype="float32")
        mask = np.zeros(xx.shape, np.uint8)
        shape = [
            (0.405, 0.645),
            (0.406, 0.60),
            (0.43, 0.55),
            (0.47, 0.50),
            (0.53, 0.46),
            (0.59, 0.43),
            (0.606, 0.389),
            (0.636, 0.33),
            (0.702, 0.28),
            (0.836, 0.165),
            (0.887, 0.15),
            (0.854, 0.27),
            (0.787, 0.36),
            (0.692, 0.422),
            (0.656, 0.451),
            (0.707, 0.49),
            (0.731, 0.546),
            (0.719, 0.609),
            (0.66, 0.65),
            (0.611, 0.663),
            (0.53, 0.694),
            (0.477, 0.703),
            (0.432, 0.705),
        ]
        p = np.array(
            [(round(x * W) - x0, round(y * H) - y0) for x, y in shape], dtype="int32"
        )
        cv2.fillPoly(mask, [p], 255)
        # The anchored wrist and occluding front lip of the chest barely move.
        mask = cv2.GaussianBlur(mask, (0, 0), 8)
        u, v = (xx + x0) / W, (yy + y0) / H
        weight = (mask.astype("float32") / 255) * softstep((0.88 - u) / 0.17)
        self.xx, self.yy = xx, yy
        self.mx = weight * (2 + 8 * (v - 0.3))
        self.my = weight * (6 + 11 * (0.70 - u))

    def render(self, frame, t):
        # A single placement, with a smaller follow-through when it takes weight.
        lifted = 1 - float(softstep((t - 0.4) / 5.4))
        spring = 0.09 * math.exp(-max(0, t - 4.0)) * math.sin(max(0, t - 4.0) * 3.8)
        k = lifted + spring
        patch = frame[self.box]
        patch[:] = cv2.remap(
            patch,
            self.xx - self.mx * k,
            self.yy + self.my * k,
            cv2.INTER_LINEAR,
            borderMode=cv2.BORDER_REPLICATE,
        )
