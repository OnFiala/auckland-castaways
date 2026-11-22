"""Fixed-camera performances registered to the eight workshop and shore paintings."""

from functools import lru_cache
from pathlib import Path
import math

import cv2
import numpy as np


LAND = Path(__file__).resolve().parents[1] / 'artwork/story-film/second-cut/land'
DRAWING = (800, 450)


def ease(value):
    t = np.clip(value, 0, 1)
    return t * t * (3 - 2 * t)


def read(path, flags=cv2.IMREAD_COLOR):
    image = cv2.imread(str(path), flags)
    if image is None:
        raise FileNotFoundError(path)
    return image


@lru_cache(maxsize=10)
def painting(name, dims):
    return cv2.resize(read(LAND / (name + '.webp')), dims, interpolation=cv2.INTER_AREA)


class Patch:
    """Local drawing coordinates and inverse motion maps for a single camera."""

    def __init__(self, dims, bounds):
        self.sx, self.sy = dims[0] / DRAWING[0], dims[1] / DRAWING[1]
        x0, y0, x1, y1 = bounds
        self.left, self.top = int(x0 * self.sx), int(y0 * self.sy)
        right, bottom = int(math.ceil(x1 * self.sx)), int(math.ceil(y1 * self.sy))
        self.box = np.s_[self.top:bottom, self.left:right]
        self.yy, self.xx = np.indices((bottom - self.top, right - self.left), np.float32)
        self.x = (self.xx + self.left) / self.sx
        self.y = (self.yy + self.top) / self.sy

    def matte(self, vertices, feather):
        local = np.array(vertices, np.float32) * (self.sx, self.sy) - (self.left, self.top)
        image = np.zeros(self.x.shape, np.uint8)
        cv2.fillPoly(image, [np.rint(local).astype(np.int32)], 255, cv2.LINE_AA)
        if feather:
            image = cv2.GaussianBlur(image, (0, 0), max(.4, self.sx * feather))
        return image.astype(np.float32) / 255

    def movement(self, dx, dy):
        self.dx = np.ascontiguousarray(-dx * self.sx, np.float32)
        self.dy = np.ascontiguousarray(-dy * self.sy, np.float32)

    def move(self, source, strength):
        return cv2.remap(source, cv2.scaleAdd(self.dx, strength, self.xx),
                         cv2.scaleAdd(self.dy, strength, self.yy), cv2.INTER_LINEAR,
                         borderMode=cv2.BORDER_REPLICATE)


@lru_cache(maxsize=7)
def work_patch(name, dims):
    if name == 'bellows':
        p = Patch(dims, (0, 95, 576, 365))
        # Only the mobile board and folded skin move. The central peg, nozzle,
        # firebed and the timber post across the bellows stay where they are.
        body = p.matte([(0,111),(32,120),(59,154),(101,175),(123,150),(155,148),
                        (511,229),(538,247),(523,320),(211,348),(183,336),(156,291),
                        (111,301),(70,273),(0,264)], 5)
        post = p.matte([(154,173),(169,176),(187,187),(183,360),(164,360)], 1.5)
        hinge = ease((517 - p.x) / 385)
        top = 156 + (p.x - 124) * .235
        lower = 334 - (p.x - 154) * .095
        height = ease((lower - p.y) / np.maximum(24, lower - top))
        # The upper grip follows its board, the lower hand holds the steady bar.
        height = np.where(p.x < 142, ease((271 - p.y) / 55), height)
        travel = hinge * height * body * (1 - post)
        p.movement(1.2 * travel, 17 * travel)
    elif name == 'ballast':
        p = Patch(dims, (522, 74, 800, 252))
        hand = p.matte([(538,189),(577,187),(597,158),(629,127),(647,111),
                        (708,104),(763,77),(800,92),(800,225),(753,224),(732,209),
                        (691,221),(691,233),(631,237),(541,237)], 3)
        # The shot ends at the painted seated position. The packing wedge
        # travels inward with the fingertips. The ballast and wooden bed hold.
        grip = hand * ease((789 - p.x) / 105)
        p.movement(12 * grip, -1.6 * grip)
    elif name == 'collection':
        p = Patch(dims, (157, 191, 685, 354))
        fold = p.matte([(165,255),(215,240),(282,245),(302,249),(348,217),
                        (395,216),(498,222),(526,218),(567,228),(599,219),
                        (626,213),(650,222),(655,267),(672,296),(618,314),
                        (554,322),(488,330),(443,329),(419,316),(357,318),
                        (312,314),(294,329),(250,337),(203,326),(171,309)], 5)
        grip = fold * ease((p.x - 172) / 124) * ease((681 - p.x) / 125)
        p.movement(13.0 * grip, 4.6 * grip)
    elif name == 'rafters':
        p = Patch(dims, (0, 25, 620, 268))
        beam = p.matte([(0,187),(155,156),(310,118),(413,89),(551,55),
                        (589,37),(603,41),(606,66),(574,89),(461,112),
                        (455,175),(439,204),(426,202),(424,175),(433,126),
                        (387,139),(302,165),(242,183),(227,210),(207,223),
                        (198,224),(193,211),(155,216),(1,252)], 3)
        cap = p.matte([(0,158),(20,116),(69,98),(123,102),(158,120),(169,155),
                       (157,186),(148,199),(65,205),(43,212),(0,218)], 2)
        face = p.matte([(294,102),(313,86),(354,83),(372,89),(379,103),
                        (383,115),(377,126),(363,137),(340,152),(314,156),
                        (300,143)], 1)
        joint = beam * ease((p.x - 55) / 480) * (1 - cap) * (1 - face)
        p.movement(-3 * joint, 6.8 * joint)
    else:
        raise KeyError(name)
    return p


def cutout(plate, matte):
    # Premultiplied colour keeps the dark wall out of the moving silhouette.
    ink = (plate.astype(np.uint16) * matte[:, :, None] + 127) // 255
    return np.dstack((ink.astype(np.uint8), matte))


def composite(dst, cel):
    inv = (255 - cel[:, :, 3:]).astype(np.uint16)
    dst[:] = np.minimum(255, cel[:, :, :3] + (dst.astype(np.uint16) * inv + 127) // 255)


@lru_cache(maxsize=2)
def chess_stage(dims):
    original = painting('chess', dims)
    p = Patch(dims, (334, 0, 800, 389))
    mask_path = LAND / 'motion'
    hand = cv2.resize(read(mask_path / 'chess-hand.png', cv2.IMREAD_GRAYSCALE), dims,
                      interpolation=cv2.INTER_AREA)[p.box]
    pawn = cv2.resize(read(mask_path / 'chess-pawn.png', cv2.IMREAD_GRAYSCALE), dims,
                      interpolation=cv2.INTER_AREA)[p.box]
    palm = cv2.subtract(hand, pawn)
    source = original[p.box].copy()
    clean = source.copy()
    bounds = (int(round(352 * p.sx)) - p.left, 0)
    end = min(clean.shape[0], int(round(320 * p.sy)))
    wall = cv2.resize(read(mask_path / 'chess-wall.webp'),
                      (clean.shape[1] - bounds[0], end), interpolation=cv2.INTER_AREA)
    x0 = bounds[0]
    area = clean[:end, x0:]
    pad = max(2, round(5.5 * p.sx))
    cover = cv2.dilate(hand, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (2*pad+1, 2*pad+1)))
    cover = cv2.GaussianBlur(cover, (0, 0), max(.5, 1.25 * p.sx))
    alpha = cover[:end, x0:].astype(np.float32) / 255
    cv2.blendLinear(area, wall, 1 - alpha, alpha, dst=area)
    # The hand translates intact around the fingertips and palm. The movement
    # tapers across the wrist to the cuff that leaves the right edge of frame.
    wrist = ease((798 - p.x) / 280)
    p.movement(9.5 * wrist, 77 * wrist)
    shadow = np.exp(-(((p.x - 397) / 15) ** 2 + ((p.y - 307) / 3.0) ** 2))
    return p, clean, cutout(source, palm), cutout(source, pawn), shadow


def chess(frame, fraction):
    dims = (frame.shape[1], frame.shape[0])
    p, clean, hand, pawn, shadow = chess_stage(dims)
    down = float(ease((fraction - .07) / .59))
    withdraw = .33 * float(ease((fraction - .77) / .23))
    working = frame[p.box]
    working[:] = clean
    if down > .6:
        working[:] = working * (1 - shadow[:, :, None] * .23 * ease((down - .6) / .4))
    composite(working, p.move(pawn, down))
    composite(working, p.move(hand, down - withdraw))


@lru_cache(maxsize=2)
def coals(dims):
    p = Patch(dims, (583, 236, 701, 305))
    base = painting('bellows', dims)[p.box].astype(np.float32)
    red = ease((base[:, :, 2] - base[:, :, 0] - 19) / 68)
    foot = np.exp(-(((p.x - 635) / 38) ** 2 + ((p.y - 269) / 16) ** 2))
    return p, (foot * red).astype(np.float32)


def illuminate(frame, mask, rise, bgr):
    dst = frame.astype(np.float32) + mask[:, :, None] * rise * np.array(bgr, np.float32)
    frame[:] = np.clip(dst, 0, 255).astype(np.uint8)


@lru_cache(maxsize=2)
def table_stage(dims):
    steam = Patch(dims, (252, 142, 646, 315))
    lantern = Patch(dims, (627, 24, 749, 137))
    lamp = np.exp(-(((lantern.x - 688) / 28) ** 2 + ((lantern.y - 68) / 34) ** 2))
    return steam, lantern, lamp


def supper(frame, seconds, dims):
    steam, lantern, lamp = table_stage(dims)
    haze = np.zeros(steam.x.shape, np.float32)
    for foot_x, foot_y, height, phase in [(348,299,133,.2),(370,296,102,2.75),(565,241,81,4.1)]:
        z = np.clip((foot_y - steam.y) / height, 0, 1)
        curl = 14 * np.sin(5.3 * z - seconds * 1.15 + phase) * np.sin(np.pi * z)
        centre = foot_x + z * (17 + 7 * math.sin(phase)) + curl
        width = 5.6 + 9.8 * z
        veil = np.exp(-((steam.x - centre) / width) ** 2)
        wave = .66 + .34 * np.sin(8.1 * z - 1.7 * seconds + phase)
        haze += veil * np.maximum(0, np.sin(np.pi * z)) ** 1.65 * wave
    illuminate(frame[steam.box], haze, 1, (9, 11, 12))
    flutter = .60 * math.sin(seconds * 3.65) + .4 * math.sin(seconds * 5.8 + .9)
    illuminate(frame[lantern.box], lamp, flutter, (2.4, 4.4, 5.6))


def mallet_lift(seconds):
    # Lift, first tap, recoil; then a smaller settling tap.
    poses = [(0,.55),(.46,1),(.64,0),(.86,.34),(1.05,.12),
             (1.43,.56),(1.61,0),(1.79,.16),(2.06,0)]
    for (a, start), (b, end) in zip(poses, poses[1:]):
        if seconds < b:
            return float(start + (end - start) * ease((seconds - a) / (b - a)))
    return 0.0


@lru_cache(maxsize=2)
def mallet_stage(dims):
    p = Patch(dims, (528, 82, 704, 221))
    motion = LAND / 'motion'
    size = (p.xx.shape[1], p.xx.shape[0])
    mask = cv2.resize(read(motion / 'gunwale-mallet.png', cv2.IMREAD_GRAYSCALE),
                      size, interpolation=cv2.INTER_AREA)
    base = painting('gunwale', dims)[p.box]
    blank = cv2.resize(read(motion / 'gunwale-plank.webp'), size, interpolation=cv2.INTER_AREA)
    radius = max(1, round(4 * p.sx))
    cover = cv2.dilate(mask, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (2*radius+1, 2*radius+1)))
    a = cv2.GaussianBlur(cover, (0, 0), max(.5, p.sx)).astype(np.float32) / 255
    clean = cv2.blendLinear(base, blank, 1 - a, a)
    wrist = (669 * p.sx - p.left, 176 * p.sy - p.top)
    return p, clean, cutout(base, mask), wrist


def hammer(frame, seconds, dims):
    p, clean, tool, wrist = mallet_stage(dims)
    lift = mallet_lift(seconds)
    if lift <= .001:
        return
    rotation = cv2.getRotationMatrix2D(wrist, -8.7 * lift, 1.0)
    cel = cv2.warpAffine(tool, rotation, (tool.shape[1], tool.shape[0]), flags=cv2.INTER_LINEAR)
    frame[p.box] = clean
    composite(frame[p.box], cel)


def land_frame(name, seconds, fraction, dims):
    """Return a fresh contiguous BGR frame at the edit's local time and size."""
    dims = tuple(dims)
    frame = painting(name, dims).copy()
    if name == 'chess':
        chess(frame, fraction)
    elif name == 'table':
        supper(frame, seconds, dims)
    elif name == 'gunwale':
        hammer(frame, seconds, dims)
    elif name == 'auger':
        return frame
    else:
        if name == 'bellows':
            cycle = seconds * 2 * math.pi / 1.9
            strength = .5 - .5 * math.cos(cycle)
            region, mask = coals(dims)
            blast = .5 - .5 * math.cos(cycle - .85)
            illuminate(frame[region.box], mask, blast, (2.2, 16, 29))
        elif name == 'ballast':
            strength = float(1 - ease((fraction - .09) / .70))
        elif name == 'collection':
            strength = float(ease((fraction - .12) / .75))
        elif name == 'rafters':
            strength = float(1 - ease((fraction - .15) / .61))
        else:
            raise KeyError(name)
        patch = work_patch(name, dims)
        if strength > .0001:
            frame[patch.box] = patch.move(frame[patch.box], strength)
    return frame
