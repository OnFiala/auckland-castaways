"""Fixed-camera rostrum work on the eight maritime paintings.

Contours are traced on 800 × 450 views of the full, uncropped artwork. Water
advects the existing brushwork. Moving figures and fittings lift off a locally
restored backing rather than leaving their original outlines on the plate.
"""

from functools import lru_cache
from math import cos, exp, pi, sin, tau
from pathlib import Path

import cv2
import numpy as np


PAINT = Path(__file__).resolve().parents[1] / "artwork/story-film/second-cut/sea"


def _knots(spec):
    return np.array([tuple(map(float, point.split(","))) for point in spec.split()],
                    dtype=np.float32)


def _ease(x):
    x = np.clip(x, 0.0, 1.0)
    return x * x * (3.0 - 2.0 * x)


def _matte(dims, contours, strokes=(), holes=()):
    w, h = dims
    scale = np.float32((w / 800, h / 450))
    mask = np.zeros((h, w), np.uint8)
    for paths, colour in ((contours, 255), (holes, 0)):
        for path in paths:
            pts = np.rint(_knots(path) * scale * 16).astype(np.int32)
            cv2.fillPoly(mask, [pts], colour, lineType=cv2.LINE_AA, shift=4)
    for width, path in strokes:
        pts = np.rint(_knots(path) * scale * 16).astype(np.int32)
        cv2.polylines(mask, [pts], False, 255, max(1, round(width * scale[0])),
                      lineType=cv2.LINE_AA, shift=4)
    return mask


# Arguments of the water table are travel in 800 × 450 reference pixels and
# the travel period in seconds. Boundaries follow the painted waterline around
# the rocks, topsides, boots and spars visible in each particular camera.
WATER = {
    "sounding": [
        ((15, -2.7, 2.7), "478,191 503,190 529,194 555,191 708,193 799,190 799,449 126,449 177,414 224,391 271,371 310,351 350,340 395,320 422,293 445,264 460,222"),
    ],
    "chain": [
        ((15, -3.7, 1.8), "120,118 225,115 299,126 292,150 264,151 250,174 247,193 211,201 123,217"),
        ((14, -5.0, 1.7), "353,129 401,113 442,116 470,121 504,134 531,143 507,151 448,166 350,182"),
    ],
    "pump": [
        ((-6.3, 15.8, 0.69), "112,343 134,339 127,360 109,400 105,419 85,430 56,433 60,417 77,390 94,365"),
        ((8, -2.3, 1.35), "0,402 44,406 63,397 102,417 132,403 172,403 193,414 221,417 251,409 323,393 392,392 451,397 471,409 518,411 560,400 697,390 738,397 799,394 799,449 0,449"),
        ((6, 1.25, 1.7), "270,349 337,349 377,347 449,342 475,332 461,367 446,383 381,391 285,399"),
    ],
    "shoreline": [
        ((17, 3.6, 2.2), "0,160 157,157 208,157 199,174 193,202 181,229 161,245 108,255 0,270"),
        ((13, 4.0, 1.9), "1,398 70,399 124,375 161,373 208,357 240,357 271,364 309,353 346,371 393,351 397,370 397,397 362,407 331,419 287,408 244,415 201,414 162,421 116,432 80,424 53,441 0,448"),
        ((11, 1.6, 2.25), "305,188 332,184 368,193 409,200 433,204 457,202 472,203 463,221 435,228 435,218 400,224 368,231 306,235"),
    ],
    "departure": [
        ((9, 1.3, 2.45), "0,217 497,217 527,221 541,214 560,220 576,211 623,214 660,207 692,204 687,254 661,270 633,295 615,327 581,330 534,345 502,350 497,370 454,373 413,383 383,389 315,427 292,448 0,449"),
    ],
    "helm": [
        ((27, -5.3, 2.3), "185,114 245,107 306,100 345,102 391,91 429,84 477,91 527,101 600,109 728,104 799,104 799,294 745,288 739,267 734,245 727,232 708,223 686,221 665,228 652,242 646,256 641,271 604,277 548,270 485,261 427,248 367,236 312,227 278,219 269,196 250,183 204,167 200,152 191,141"),
    ],
    "approach": [
        ((12.0, 1.8, 2.55), "0,202 157,202 173,198 205,201 335,201 421,200 546,201 666,200 656,213 640,219 620,232 657,237 689,233 728,246 770,245 799,247 799,320 772,333 737,346 702,359 650,367 621,385 566,394 535,402 490,399 461,401 410,392 376,399 340,397 315,387 286,384 270,378 253,381 252,394 205,384 177,379 155,369 90,357 53,342 32,327 0,309"),
    ],
    "signal": [
        ((6.2, 0.8, 3.0), "123,204 348,203 409,201 530,202 524,233 518,242 482,245 460,239 422,243 403,250 373,250 354,257 325,255 314,265 290,269 281,267 260,260 229,255 202,252 169,242 151,229"),
    ],
}


class _Flow:
    """Two drifting impressions exchange opacity before either wraps around."""

    def __init__(self, dims, motion, contour):
        w, h = dims
        mask = _matte(dims, (contour,))
        x, y, bw, bh = cv2.boundingRect(mask)
        self.box = np.s_[y:y + bh, x:x + bw]
        m = mask[self.box]
        # Give the sea room to keep moving where it exits the picture.
        bounded = cv2.copyMakeBorder(m, 1, 1, 1, 1, cv2.BORDER_REPLICATE)
        distance = cv2.distanceTransform(bounded, cv2.DIST_L2, 3)[1:-1, 1:-1]
        travel_x, travel_y, self.period = motion
        self.x, self.y = np.indices((bh, bw), dtype=np.float32)[::-1]
        depth = self.y / max(1, bh)
        shore_fade = _ease(distance / max(2, 0.010 * w))
        weight = shore_fade * (0.43 + 0.57 * depth)
        self.dx = weight * (travel_x * w / 800)
        self.dy = weight * (travel_y * h / 450)
        phase = ((self.x + x) / w * 15.0 + (self.y + y) / h * 33.0)
        # The small normal displacement rolls the crest while the paint travels.
        self.roll_a = np.sin(phase) * weight * min(abs(travel_x) * 0.12, 3.5) * h / 450
        self.roll_b = np.cos(phase) * weight * min(abs(travel_x) * 0.12, 3.5) * h / 450

    def paint(self, frame, t):
        phase = (t / self.period) % 1.0
        roll = cv2.addWeighted(self.roll_a, cos(tau * phase), self.roll_b, sin(tau * phase), 0)
        base_y = cv2.add(self.y, roll)
        patch = frame[self.box]

        def moved(p):
            xmap = cv2.addWeighted(self.x, 1, self.dx, 0.5 - p, 0)
            ymap = cv2.addWeighted(base_y, 1, self.dy, 0.5 - p, 0)
            return cv2.remap(patch, xmap, ymap, cv2.INTER_LINEAR, borderMode=cv2.BORDER_REPLICATE)

        opacity = 0.5 - 0.5 * cos(tau * phase)
        patch[:] = cv2.addWeighted(moved(phase), opacity, moved((phase + 0.5) % 1), 1.0 - opacity, 0)


# Each list paints a single moving part, in the same order as the original
# brushwork. The two small ships include their projecting spars and rig.
PARTS = {
    "lead": (
        ["326,289 331,289 333,298 336,304 340,316 340,381 338,389 331,398 323,397 317,386 316,378 316,315 319,303 323,298"],
        [], [],
    ),
    "pump-lever": (
        [
            "190,82 199,78 208,83 258,94 348,113 444,133 508,148 551,157 611,169 673,184 679,188 676,201 670,205 610,193 538,179 482,165 418,153 340,137 270,121 218,111 197,109 190,104",
            "534,92 548,82 574,87 588,100 579,118 563,145 562,155 565,164 561,181 557,189 550,188 544,192 538,192 534,188 531,192 525,191 522,185 515,186 511,181 510,173 515,150 525,145 530,129 532,112 526,108",
            "677,87 689,79 706,83 719,100 711,119 696,126 680,150 668,164 665,180 660,197 653,202 647,201 644,204 637,205 633,202 625,203 620,197 615,198 608,193 607,184 610,170 616,165 625,161 643,159 652,150 659,134 666,122 658,119 661,107",
        ], [], [],
    ),
    "shore-sail": (
        [
            "334,142 338,133 349,121 357,118 372,120 385,126 403,127 418,134 436,135 449,143 466,145 479,151 486,160 492,173 488,184 480,194 454,199 443,197 430,201 417,196 401,198 384,193 370,193 358,186 345,178 336,174 330,168",
            "313,145 323,150 337,154 349,160 365,162 381,160 390,163 401,168 399,173 393,175 392,179 380,181 363,182 343,175 325,174 313,169 308,162",
            "468,176 482,175 493,175 508,166 524,153 533,159 535,168 524,180 508,189 490,196 475,200 458,201 447,201 443,197 445,192 457,189 466,189",
        ], [], [],
    ),
    "tiller": (
        [
            "151,237 162,229 181,219 200,209 265,213 334,225 402,239 467,250 539,264 600,277 649,274 660,279 659,293 626,300 615,306 611,325 595,327 538,312 476,299 408,287 348,278 289,270 226,265 177,269 160,257",
            "0,0 53,0 78,27 102,58 137,80 152,112 163,128 175,134 186,138 192,151 203,166 225,178 247,184 261,192 270,205 275,228 275,246 271,263 263,270 253,274 250,282 243,285 229,287 220,291 211,291 204,284 205,275 204,247 199,234 186,229 179,234 180,255 180,278 178,292 171,302 163,301 154,291 146,278 134,267 125,257 121,239 118,233 111,237 99,237 80,229 61,219 45,213 38,206 22,200 0,192",
        ], [], [],
    ),
    "dinghy": (
        [
            "157,231 164,230 178,236 213,245 254,251 309,255 369,257 424,258 493,255 537,249 552,247 557,249 551,272 552,285 548,295 499,298 419,299 328,297 260,294 204,288 176,282 164,277 161,265",
            "162,232 183,230 208,227 221,224 243,221 255,224 271,232 277,246 253,251 208,246 179,240",
            "270,247 271,232 276,222 287,214 290,204 292,197 296,191 302,189 309,191 314,197 311,207 317,213 324,216 329,224 335,249 333,257 275,251",
            "351,258 358,249 364,238 366,224 375,219 379,215 374,212 370,203 374,198 382,197 390,200 395,208 394,215 407,217 417,229 423,243 427,256",
            "447,258 450,247 455,239 458,225 463,217 473,213 477,208 474,202 472,197 480,193 488,193 496,197 494,205 492,214 502,215 515,220 533,237 541,243 553,246 557,250 551,253 540,250 529,247 514,237 514,254",
            "273,227 273,207 282,137 291,80 292,67 298,67 298,83 294,99 279,226",
            "279,202 287,116 290,101 370,76 377,73 373,84 354,145 352,194 332,198 309,199",
        ],
        [(2.2, "273,231 285,151 297,67"), (2.5, "285,101 378,71 385,68"),
         (0.9, "245,224 294,81"), (0.7, "295,72 345,79 376,70")], [],
    ),
    "cutter": (
        [
            "196,216 215,212 247,207 270,202 295,199 313,195 305,202 299,208 295,226 291,234 268,235 234,236 205,233 197,230",
            "181,193 188,177 194,153 200,126 205,102 211,80 247,109 250,199 228,198 200,195",
            "258,107 266,123 277,143 302,194 291,190 279,188 263,189 264,168",
            "265,111 285,132 309,156 328,184 315,178 301,174 289,174 282,154",
            "247,70 250,67 255,113 258,183 259,204 249,207",
        ],
        [(2.5, "249,66 251,212"), (1.45, "184,194 254,200 282,197"),
         (1.15, "206,79 248,110"), (1.3, "210,80 249,105"),
         (1.0, "251,84 334,191"), (1.0, "254,97 318,193"),
         (1.7, "281,211 330,193 337,191"), (0.8, "209,84 199,216"),
         (0.8, "214,86 204,215"), (1.0, "253,87 263,207")], [],
    ),
    "far-cutter": (
        ["169.6,202.8 174.2,194.9 179.1,184.1 181.9,195.2 186,201.4 188,204.4 186.1,207 178.8,207.8 171.3,207"],
        [(0.7, "179.6,183.7 180.2,205")], [],
    ),
    "watch": (
        [
            "551,92 554,77 558,63 568,54 584,49 598,48 610,50 624,57 635,71 643,84 645,92 640,98 637,102 644,111 640,121 642,127 634,133 626,139 631,148 653,151 677,161 692,181 699,215 698,254 694,305 664,328 594,319 557,300 529,264 530,220 537,196 547,183 562,172 581,160 582,151 573,138 565,131 561,117 555,113 552,101",
        ], [], [],
    ),
}


class _Cutout:
    def __init__(self, name, image, dims, master=None):
        w, h = dims
        self.sx, self.sy = w / 800, h / 450
        self.name = name
        self.tracing = _matte(dims, *PARTS[name])
        self.master = master
        if master is None:
            mask = self.tracing
        else:
            native = cv2.imread(str(PAINT / "motion" / f"{master}-matte.png"), cv2.IMREAD_GRAYSCALE)
            if native is None:
                raise FileNotFoundError(f"{master}-matte.png")
            mask = cv2.resize(native, dims, interpolation=cv2.INTER_AREA)
        x, y, bw, bh = cv2.boundingRect(mask)
        margin_x, margin_y = round(45 * self.sx) + 3, round(42 * self.sy) + 3
        x0, x1 = max(0, x - margin_x), min(w, x + bw + margin_x)
        y0, y1 = max(0, y - margin_y), min(h, y + bh + margin_y)
        self.box = np.s_[y0:y1, x0:x1]
        self.left, self.top = x0, y0
        self.image = image[self.box].copy()
        self.mask = mask[self.box].copy()
        self.height, self.width = self.mask.shape
        self.x, self.y = np.indices(self.mask.shape, dtype=np.float32)[::-1]
        gx, gy = (self.x + x0) / self.sx, (self.y + y0) / self.sy
        if name == "pump-lever":
            self.attach = np.where(gx < 485, 1, _ease((gy - 92) / 59)).astype(np.float32)
        elif name == "tiller":
            self.attach = _ease((gy + gx * 0.29 - 91) / 111)
        elif name == "shore-sail":
            self.attach = _ease((gx - 312) / 37) * _ease((535 - gx) / 55)
        elif name == "watch":
            self.attach = _ease((276 - gy) / 130) * _ease((695 - gx) / 45)
        else:
            self.attach = None

    def remove_from(self, backing):
        if self.master:
            native = cv2.imread(str(PAINT / "motion" / f"{self.master}-back.webp"))
            if native is None:
                raise FileNotFoundError(f"{self.master}-back.webp")
            h, w = backing.shape[:2]
            patch = cv2.resize(native, (w, h), interpolation=cv2.INTER_AREA)[self.box]
            # The second painting only replaces the old footprint. Feather its
            # join outside the last painted stay, even if that stay was thin
            # enough to become translucent in the foreground matte.
            initial = cv2.max(self.mask, self.tracing[self.box])
            seam = max(2, round(5 * self.sx))
            kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (2 * seam + 1,) * 2)
            coverage = cv2.GaussianBlur(cv2.dilate(initial, kernel), (0, 0), seam * 0.42)
            self._blend(backing, patch, coverage)
            return
        radius = max(1, round(self.sx * 1.1))
        kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (2 * radius + 1,) * 2)
        removal = cv2.dilate((self.mask > 40).astype(np.uint8) * 255, kernel)
        part = backing[self.box]
        part[:] = cv2.inpaint(part, removal, max(2, round(self.sx * 3.2)), cv2.INPAINT_TELEA)

    def _blend(self, frame, paint, alpha):
        a = alpha.astype(np.float32) / 255
        patch = frame[self.box]
        cv2.blendLinear(patch, paint, 1 - a, a, dst=patch)

    def move(self, frame, pivot, angle, dx=0.0, dy=0.0):
        px, py = pivot[0] * self.sx - self.left, pivot[1] * self.sy - self.top
        dx, dy = dx * self.sx, dy * self.sy
        if self.attach is None:
            transform = cv2.getRotationMatrix2D((px, py), angle, 1)
            transform[:, 2] += (dx, dy)
            size = (self.width, self.height)
            paint = cv2.warpAffine(self.image, transform, size, flags=cv2.INTER_LINEAR,
                                   borderMode=cv2.BORDER_REPLICATE)
            alpha = cv2.warpAffine(self.mask, transform, size, flags=cv2.INTER_LINEAR)
        else:
            # Inverse rotation is rigid across the tool and the grasp. The
            # angle dies away at the elbow, which remains part of the torso.
            a = angle * pi / 180
            xx, yy = self.x - px, self.y - py
            xm = self.x + self.attach * ((cos(a) - 1) * xx - sin(a) * yy - dx)
            ym = self.y + self.attach * (sin(a) * xx + (cos(a) - 1) * yy - dy)
            paint = cv2.remap(self.image, xm, ym, cv2.INTER_LINEAR, borderMode=cv2.BORDER_REPLICATE)
            alpha = cv2.remap(self.mask, xm, ym, cv2.INTER_LINEAR, borderMode=cv2.BORDER_CONSTANT)
        self._blend(frame, paint, alpha)


def _erase_line(image, dims):
    # The original line must clear the side of the schooner when the lead
    # swings. Restore only the two-pixel run from the fingers to the eye.
    mat = _matte(dims, (), [(2.8, "327,150 328,205 328,269 329,292")])
    x, y, w, h = cv2.boundingRect(mat)
    area = np.s_[max(0, y - 8):y + h + 8, max(0, x - 8):x + w + 8]
    image[area] = cv2.inpaint(image[area], mat[area], 3, cv2.INPAINT_TELEA)


def _hemp(frame, dims, x, y):
    w, h = dims
    points = np.array([(327, 149.6), (327 + (x - 327) * 0.46, (149.6 + y) * 0.5),
                       (x, y)], dtype=np.float32)
    pts = np.rint(points * (w / 800, h / 450) * 16).astype(np.int32)
    thick = max(1, round(w / 800 * 1.4))
    cv2.polylines(frame, [pts], False, (84, 95, 103), thick, cv2.LINE_AA, 4)
    highlight = pts - np.array([round(w / 800 * 4), 0], dtype=np.int32)
    cv2.polylines(frame, [highlight], False, (135, 150, 163), 1, cv2.LINE_AA, 4)


class _Storm:
    """A loaded iron chain rings once as the painted spray drifts and falls."""

    def __init__(self, dims, image):
        w, h = dims
        self.sx, self.sy = w / 800, h / 450
        contour = "139,320 178,305 215,300 239,287 284,286 307,294 333,280 352,262 382,250 416,245 441,254 467,247 483,237 512,237 539,231 577,221 614,216 656,202 674,201 671,220 635,233 597,242 565,252 533,261 507,275 482,281 451,293 433,313 410,330 382,339 352,338 333,342 311,352 281,366 252,381 222,396 199,396 181,369 158,354"
        chain = _matte(dims, (contour,))
        x, y, bw, bh = cv2.boundingRect(chain)
        self.chain_box = np.s_[y:y + bh, x:x + bw]
        self.x, self.y = np.indices((bh, bw), dtype=np.float32)[::-1]
        taper = np.sin(pi * np.clip(((self.x + x) / self.sx - 145) / 526, 0, 1))
        distance = cv2.distanceTransform(chain[self.chain_box], cv2.DIST_L2, 3)
        self.bend = _ease(distance / max(2, 3.7 * self.sx)) * taper * self.sy
        mask = _matte(dims, ("344,172 356,148 378,118 395,86 415,70 423,84 446,86 459,95 477,88 478,104 495,108 514,127 531,140 518,150 476,152 440,160 388,174 350,180",))
        x, y, bw, bh = cv2.boundingRect(mask)
        pad = max(4, round(15 * self.sx))
        x0, x1 = max(0, x - pad), min(w, x + bw + pad)
        y0, y1 = max(0, y - pad), min(h, y + bh + pad)
        self.spray_box = np.s_[y0:y1, x0:x1]
        painted = image[self.spray_box]
        soft = cv2.GaussianBlur(painted, (0, 0), max(1.7, 3.5 * self.sx))
        values = painted.astype(np.float32) - soft.astype(np.float32)
        weight = _ease((values.mean(axis=2) - 4.0) / 20.0) * (
            mask[self.spray_box].astype(np.float32) / 255)
        self.spray = np.uint8(np.clip(values * weight[:, :, None] * 0.83, 0, 255))
        self.spray_size = (x1 - x0, y1 - y0)

    def paint(self, frame, t, frac):
        beat = max(0.0, frac - 0.24) * 6.5
        ring = 2.55 * sin(11.0 * beat) * exp(-1.85 * beat)
        chain = frame[self.chain_box]
        chain[:] = cv2.remap(chain, self.x - self.bend * (ring * 0.19),
                             self.y - self.bend * ring, cv2.INTER_LINEAR,
                             borderMode=cv2.BORDER_REPLICATE)
        spray = frame[self.spray_box]
        base = cv2.subtract(spray, self.spray)
        # Two groups of flecks keep receiving wind and then fall back. Each
        # reaches zero opacity before returning to its start.
        phase = (t / 1.55) % 1.0
        incoming = 0.5 - 0.5 * cos(tau * phase)
        def wind(p):
            matrix = np.float32([[1, 0, (p - 0.5) * 12 * self.sx],
                                 [0, 1, (-4 * sin(pi * p) + 7 * (p - 0.5)) * self.sy]])
            return cv2.warpAffine(self.spray, matrix, self.spray_size)
        travelling = cv2.addWeighted(wind(phase), incoming, wind((phase + 0.5) % 1), 1-incoming, 0)
        spray[:] = cv2.add(base, travelling)


class _SeaStage:
    def __init__(self, name, dims):
        self.name, self.dims = name, dims
        source = cv2.imread(str(PAINT / f"{name}.webp"), cv2.IMREAD_COLOR)
        if source is None:
            raise FileNotFoundError(PAINT / f"{name}.webp")
        image = cv2.resize(source, dims, interpolation=cv2.INTER_AREA if dims[0] <= source.shape[1]
                           else cv2.INTER_CUBIC)
        self.base = image.copy()
        self.water = [_Flow(dims, motion, points) for motion, points in WATER[name]]
        pieces = {
            "sounding": ("lead",), "chain": (), "pump": ("pump-lever",),
            "shoreline": ("shore-sail",), "departure": ("dinghy",),
            "helm": ("tiller",), "approach": ("cutter",), "signal": ("far-cutter", "watch"),
        }[name]
        paired = {"pump", "helm", "departure", "approach"}
        self.parts = {k: _Cutout(k, image, dims, name if name in paired else None) for k in pieces}
        self.storm = _Storm(dims, image) if name == "chain" else None
        if name == "sounding":
            _erase_line(self.base, dims)
        for part in self.parts.values():
            part.remove_from(self.base)

    def frame(self, t, frac):
        frame = self.base.copy()
        for area in self.water:
            area.paint(frame, t)
        f = float(_ease(frac))
        if self.name == "sounding":
            dx = 4.2 * sin(t * 1.13) + 1.8 * sin(t * 0.65)
            dy = -20 + 24 * f + 1.3 * sin(t * 1.2)
            self.parts["lead"].move(frame, (329, 291), 0.82 * sin(t * 1.13), dx, dy)
            _hemp(frame, self.dims, 329 + dx, 292 + dy)
        elif self.name == "chain":
            self.storm.paint(frame, t, frac)
        elif self.name == "pump":
            phase = t * 3.37
            stroke = sin(phase + 0.19 * sin(phase))
            self.parts["pump-lever"].move(frame, (200, 96), 3.0 * stroke)
        elif self.name == "shoreline":
            self.parts["shore-sail"].move(frame, (410, 165), -1.7 + 2.8 * f,
                                          -6.5 + 13 * f, -3.2 * sin(pi * f))
        elif self.name == "departure":
            self.parts["dinghy"].move(frame, (356, 291), 0.58 * sin(1.71 * t),
                                      5 - 21 * f, 2.2 * sin(1.71 * t + 0.4))
        elif self.name == "helm":
            self.parts["tiller"].move(frame, (663, 284), 1.65 * sin(1.52 * t)
                                      + 0.43 * sin(2.62 * t + 0.3))
        elif self.name == "approach":
            self.parts["cutter"].move(frame, (251, 232), 0.56 * sin(t * 1.62),
                                      -5 + 29 * f, 1.8 * sin(t * 1.62 + 0.35))
        elif self.name == "signal":
            self.parts["far-cutter"].move(frame, (179, 206), 0.39 * sin(t * 1.6),
                                          -1.5 + 8 * f, 0.21 * sin(t * 1.6 + 0.35))
            self.parts["watch"].move(frame, (612, 190), 0.12 + 1.15 * f, -1.1 * f,
                                     0.4 * sin(1.46 * t))
        return frame


@lru_cache(maxsize=2)
def _stage(name, dims):
    return _SeaStage(name, dims)


def sea_frame(name, seconds, fraction, dims):
    """Render one independent BGR uint8 frame, with the shore camera locked."""
    if name not in WATER:
        raise ValueError(f"Unknown sea painting: {name}")
    return _stage(name, tuple(dims)).frame(float(seconds), float(fraction))
