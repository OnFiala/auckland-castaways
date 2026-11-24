"""Set the opening titles and closing credits over two registered paintings."""
from functools import lru_cache
from pathlib import Path

import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont

ROOT = Path(__file__).resolve().parents[1]
PAINTINGS = ROOT / 'artwork/story-film/bookends-21'
INK = (245, 235, 213)
GOLD = (238, 207, 156)


def smooth(value):
    value = max(0.0, min(1.0, value))
    return value * value * (3 - 2 * value)


@lru_cache(maxsize=16)
def font(size, weight):
    name = f'spectral-{weight}.woff2'
    return ImageFont.truetype(str(ROOT / 'dist/assets/lettering' / name), size)


@lru_cache(maxsize=10)
def type_layers(plate, words, dims):
    width, height = dims
    scale = width / 1280
    x = round(width * .068)
    lines = words.splitlines()
    ink = Image.new('RGBA', dims)
    labels = Image.new('RGBA', dims)

    def write(layer, text, y, size, colour=INK, weight=400, field=.50):
        f = font(round(size * scale), weight)
        if f.getlength(text) > width * field:
            raise ValueError(f'{plate}: “{text}” exceeds its type field')
        ImageDraw.Draw(layer).text((x, round(y * height)), text, font=f, fill=colour, anchor='ls')

    if plate == 'film-title':
        write(ink, lines[0], .490, 84, weight=600)
        write(ink, lines[1], .620, 43, GOLD, field=.55)
    elif plate == 'film-foreword':
        top = .54 - (len(lines) - 1) * .045
        for index, line in enumerate(lines):
            write(ink, line, top + index * .09, 47)
    elif plate == 'film-home':
        write(ink, lines[0], .375, 43, GOLD)
        for index, line in enumerate(lines[1:]):
            write(ink, line, .535 + index * .10, 51)
    elif plate == 'film-witnesses':
        write(ink, lines[0], .245, 47, GOLD, field=.54)
        for label, names, y in [(lines[1], lines[2], .357), (lines[3], lines[4], .631)]:
            first, second = names.split(' · ')
            write(ink, label, y, 40, GOLD, weight=600)
            write(ink, first, y + .084, 51)
            write(ink, second, y + .165, 51)
    elif plate == 'film-credits':
        write(ink, lines[0], .475, 88, weight=600)
        write(labels, lines[1], .612, 43, GOLD)
        write(labels, lines[2], .694, 43, field=.55)
    else:
        raise KeyError(plate)

    def region(im):
        bounds = im.getbbox()
        if not bounds:
            return None
        l, t, r, b = bounds
        pad = max(3, round(6 * scale))
        l, t = max(l - pad, 0), max(t - pad, 0)
        crop = im.crop((l, t, r + pad, b + pad))
        alpha = crop.getchannel('A')
        shadow = np.asarray(alpha.filter(ImageFilter.GaussianBlur(1.9 * scale)), np.float32) / 255
        arr = np.asarray(crop)
        return (l, t, arr[:, :, 2::-1].astype(np.float32), arr[:, :, 3].astype(np.float32) / 255, shadow)

    return region(ink), region(labels)


@lru_cache(maxsize=4)
def painting(key, dims):
    source = cv2.imread(str(PAINTINGS / (key + '.webp')), cv2.IMREAD_COLOR)
    if source is None:
        raise FileNotFoundError(PAINTINGS / (key + '.webp'))
    return cv2.resize(source, dims, interpolation=cv2.INTER_AREA)


@lru_cache(maxsize=4)
def water_region(key, dims):
    # In the exterior this is the hull lantern's broken reflection. Through
    # Epigwaitt's door, only a narrow unobstructed patch of water is visible.
    w, h = dims
    left, top, right, bottom = (.773, .735, .888, .847) if key == 'opening' else (.676, .537, .744, .570)
    x, y, r, b = round(left * w), round(top * h), round(right * w), round(bottom * h)
    yy, xx = np.indices((b - y, r - x), dtype=np.float32)
    envelope = np.sin(np.pi * xx / (r - x - 1)) ** 2 * np.sin(np.pi * yy / (b - y - 1)) ** 2
    return (x, y, r, b), xx, yy, envelope


def print_layer(frame, layer, opacity):
    if layer is None or opacity <= 0:
        return
    x, y, ink, alpha, shade = layer
    box = frame[y:y + ink.shape[0], x:x + ink.shape[1]]
    base = box.astype(np.float32) * (1 - .70 * opacity * shade[:, :, None])
    coverage = alpha[:, :, None] * opacity
    box[:] = np.rint(base * (1 - coverage) + ink * coverage).astype(np.uint8)


def card_frame(shot, t, dims):
    plate = shot['plate']
    opening = plate in ('film-title', 'film-foreword')
    key = 'opening' if opening else 'closing'
    base = painting(key, dims)
    frame = base.copy()
    age = {'film-title': 0, 'film-foreword': 7, 'film-home': 0, 'film-witnesses': 6, 'film-credits': 12}[plate] + t
    (x, y, r, b), xx, yy, mask = water_region(key, dims)
    patch = base[y:b, x:r]
    if opening:
        dx = 2.5 * np.sin(yy * .235 + age * 1.55) + 1.2 * np.sin(yy * .48 - age * .85)
        dy = .74 * np.sin(yy * .22 + xx * .025 - age * 1.7)
    else:
        dx = 1.25 * np.sin(yy * .47 + age * .83)
        dy = .56 * np.sin(yy * .23 - age * .91 + xx * .029)
    frame[y:b, x:r] = cv2.remap(patch, xx + mask * dx, yy + mask * dy,
                                  cv2.INTER_LINEAR, borderMode=cv2.BORDER_REPLICATE)

    # The title is already legible in the first picture and when autoplay is
    # muted. The end emerges from the preceding fade, then rests in darkness.
    entering = (.72 + .28 * smooth(t / .8)) if plate == 'film-title' else smooth((t + .05) / .62)
    leaving = smooth((shot['seconds'] - t) / .52)
    main, secondary = type_layers(plate, shot['line'], dims)
    if plate == 'film-credits':
        print_layer(frame, main, entering * smooth((6 - t - .1) / 1.2))
        print_layer(frame, secondary, entering * smooth((5 - t) / .78))
    else:
        print_layer(frame, main, entering * leaving)
    if plate == 'film-home':
        frame = cv2.convertScaleAbs(frame, alpha=smooth(t / .78))
    if plate == 'film-credits':
        frame = cv2.convertScaleAbs(frame, alpha=smooth((5.72 - t) / 1.2))
    return frame
