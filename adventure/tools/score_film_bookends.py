#!/usr/bin/env python3
"""Render the overture and closing cadence of Until We Return as stereo FLAC."""

from argparse import ArgumentParser
from pathlib import Path
import subprocess
from tempfile import TemporaryDirectory

import numpy as np
from scipy import signal
from scipy.io import wavfile

from render_island_score import RATE, measure, play, room, texture


OUTPUT = Path(__file__).resolve().parents[1] / 'artwork/story-film/bookends-21/audio'
MASTER_RATE = 48000

# Entrance in seconds, instrument, MIDI pitch, duration and strength. The opening
# stops on A. The first low D in the wharf scene completes the phrase after the cut.
OVERTURE = (
    (1.02, 'pluck', 50, 3.75, .47),
    (1.96, 'bow',   38, 4.62, .11),
    (3.48, 'bow',   62, 2.13, .21),
    (5.73, 'bow',   65, 2.18, .24),
    (6.38, 'pluck', 53, 3.70, .28),
    (8.12, 'bow',   69, 2.87, .23),
    (9.26, 'pluck', 57, 3.50, .24),
    (11.42, 'bow',  64, 1.72, .18),
    (13.17, 'bow',  57, 2.15, .13),
)

# The answering D–F–A is handed to the airier voice. Both strings sustain the
# final D and its fifth while the last card is still on screen.
CODA = (
    (.67, 'pluck', 50, 4.10, .32),
    (1.38, 'bow',  38, 4.17, .12),
    (1.64, 'flute', 62, 1.97, .19),
    (3.73, 'flute', 65, 1.77, .22),
    (5.62, 'flute', 69, 2.24, .22),
    (5.97, 'pluck', 53, 3.80, .24),
    (8.05, 'bow',   67, 1.85, .20),
    (8.53, 'pluck', 55, 3.20, .20),
    (10.02, 'bow',  64, 1.80, .16),
    (12.02, 'pluck', 38, 4.22, .30),
    (12.18, 'bow',  62, 3.56, .19),
    (12.83, 'pluck', 57, 3.79, .18),
)


def harbour(mix, rng, crests):
    """Distant air remains centred. Two small washes reach each ear a little differently."""
    times = np.arange(len(mix)) / RATE
    swell = sum(np.exp(-((times - at) / width) ** 2) for at, width in crests)
    shared = texture(rng, len(mix), (75, 330))
    for side in range(2):
        water = .72 * shared + .28 * texture(rng, len(mix), (120, 620))
        fine_water = texture(rng, len(mix), (520, 1650))
        mix[:, side] += (.008 + .018 * swell) * water + .007 * swell * fine_water


def render(name, events, seconds, crests, seed, target, output):
    rng = np.random.default_rng(seed)
    mix = np.zeros((round(seconds * RATE), 2))
    for start, kind, pitch, duration, strength in events:
        play(mix, start, kind, pitch, duration, strength, rng)
    mix = room(mix)
    harbour(mix, rng, crests)

    t = np.arange(len(mix)) / RATE
    # Allow the printed credits to end in silence and leave a shorter breath at the wharf.
    hold = .65 if name == 'coda' else .08
    release = 1.4 if name == 'coda' else .65
    attack = np.sin(.5 * np.pi * np.minimum(1, t / .62)) ** 2
    decrescendo = np.sin(.5 * np.pi * np.clip((seconds - hold - t) / release, 0, 1)) ** 2
    mix *= (attack * decrescendo)[:, None]
    mix = signal.resample_poly(mix, 160, 147, axis=0)
    if len(mix) != round(seconds * MASTER_RATE):
        raise ValueError(f'{name}: expected {seconds} seconds at {MASTER_RATE} Hz')

    with TemporaryDirectory(dir=output) as tmp:
        wav = Path(tmp) / 'mix.wav'
        wavfile.write(wav, MASTER_RATE, mix.astype(np.float32))
        measured, _ = measure(wav)
        pcm = np.rint(mix * 32767 * 10 ** ((target - measured) / 20))
        if np.max(abs(pcm)) >= 32767:
            raise ValueError(f'{name}: clipping before encoding')
        wavfile.write(wav, MASTER_RATE, pcm.astype(np.int16))
        flac = Path(tmp) / f'{name}.flac'
        subprocess.run(['ffmpeg', '-nostdin', '-v', 'error', '-y', '-i', str(wav),
                        '-map_metadata', '-1', '-c:a', 'flac', '-compression_level', '8',
                        '-bitexact', str(flac)], check=True)
        loudness, peak = measure(flac)
        if abs(loudness - target) > .3 or peak > -9:
            raise ValueError(f'{name}: measured {loudness} LUFS, {peak} dBTP')
        flac.replace(output / flac.name)
    print(f'{name}: {seconds:.3f} s, {loudness:.1f} LUFS, {peak:.1f} dBTP')


def main():
    parser = ArgumentParser(description=__doc__)
    parser.add_argument('--out', type=Path, default=OUTPUT)
    args = parser.parse_args()
    args.out.mkdir(parents=True, exist_ok=True)
    render('overture', OVERTURE, 16, ((2.0, 1.70), (10.4, 2.4)), 186311, -25.0, args.out)
    render('coda', CODA, 18, ((3.8, 2.20), (13.8, 2.1)), 186508, -25.5, args.out)


if __name__ == '__main__':
    main()
