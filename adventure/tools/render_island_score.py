#!/usr/bin/env python3
"""Render the original chamber score heard while playing Until We Return."""

import argparse
from dataclasses import dataclass
from pathlib import Path
import re
import subprocess
import tempfile

import numpy as np
from scipy import signal
from scipy.io import wavfile


RATE = 44100
TAU = 2 * np.pi
TARGET = Path(__file__).resolve().parents[1] / 'dist/assets/island-score'

# Bass and three middle strings. D and A run through the score as open strings.
CHORDS = {
    'd': (38, 50, 57, 65), 'ds': (38, 50, 57, 64), 'da': (45, 50, 57, 65),
    'f': (41, 53, 57, 62), 'fa': (45, 53, 60, 65), 'c': (36, 52, 55, 62),
    'g': (43, 50, 55, 62), 'gm': (43, 50, 58, 62), 'a': (45, 52, 57, 62),
    'bb': (46, 53, 58, 62),
}

# Fingers on gut strings. Each figure occupies one four-beat bar; its accents
# and rests are written into the phrasing rather than supplied by a drum loop.
FIGURES = {
    's': [(0, 0, .82), (2.55, 2, .56)],
    's2': [(.08, 1, .72), (1.78, 3, .51), (3.04, 2, .42)],
    'h': [(0, 0, .77), (.96, 2, .55), (1.59, 3, .46), (2.85, 1, .52)],
    'h2': [(.04, 1, .76), (.83, 2, .48), (2.13, 3, .59), (3.46, 2, .40)],
    'w': [(.02, 0, .84), (1.34, 1, .44), (2.03, 2, .61)],
    'w2': [(.04, 0, .74), (1.82, 2, .59), (2.78, 1, .53), (3.50, 2, .35)],
    'b': [(0, 0, .79), (.66, 2, .49), (1.34, 3, .48), (2.0, 1, .64), (3.33, 2, .42)],
    'b2': [(.02, 1, .68), (.67, 2, .47), (2.0, 0, .76), (2.68, 3, .53)],
    'o': [(.06, 0, .77), (2.74, 1, .51)],
    'o2': [(1.03, 1, .57), (2.62, 2, .55)],
    'p': [(0, 0, .76), (1.46, 2, .59), (2.46, 3, .48), (3.49, 1, .42)],
    'p2': [(0, 1, .74), (1.03, 2, .48), (2.07, 3, .64)],
    'r': [(0, 0, .74), (.95, 2, .50), (2.38, 3, .61)],
    'r2': [(.04, 1, .74), (1.52, 3, .58), (2.96, 2, .45)],
    '-': [],
}


@dataclass(frozen=True)
class Movement:
    tempo: int
    chords: str
    figures: str
    bass_bars: tuple
    voices: tuple
    # Each phrase lists beat, MIDI pitch and length in beats across four bars.
    phrases: tuple


MOVEMENTS = {
    'shore': Movement(63, 'ds d c g d fa c a gm f a ds', 's s2 - s s2 s - s2 s s2 s -',
        (0, 3, 5, 8, 10), ('flute', 'bow', 'flute'), (
            [(1.1, 62, 1.8), (4.6, 65, 1.25), (6.6, 69, 2.4), (10.3, 67, 1.2), (12.3, 62, 2.2)],
            [(2.1, 57, 2.5), (5.6, 60, 2.7), (9.4, 55, 1.4), (11.3, 57, 1.8)],
            [(1.6, 65, 2), (4.7, 69, 1.3), (7.1, 67, 1.5), (9.3, 64, 1.6), (12.6, 62, 1.55)])),
    'hearth': Movement(68, 'f da c d bb f g da gm d a f', 'h h2 s2 h h2 h - s2 h2 h s2 -',
        (0, 3, 4, 7, 8, 11), ('bow', 'flute', 'bow'), (
            [(.65, 57, 1.8), (3.8, 60, 1.45), (5.65, 62, 2.15), (9.28, 64, 1.3), (11.0, 60, 1.72), (13.6, 57, 1.58)],
            [(1.55, 65, 2.1), (4.9, 69, 1.4), (6.8, 67, 1.28), (9.1, 62, 2.6), (13.1, 65, 1.55)],
            [(.9, 58, 1.65), (3.35, 60, 1.28), (5.1, 62, 2.2), (9.0, 57, 2.65), (13.2, 53, 1.4)])),
    'forge': Movement(72, 'd d g a d c g da d gm a ds', 'w w2 w - w2 w w2 s w w2 w -',
        (0, 2, 4, 6, 8, 10), ('bow', 'pluck', 'bow'), (
            [(1.3, 50, 2.15), (4.9, 53, 1.75), (7.5, 57, 1.68), (11.2, 55, 1.35), (13.7, 52, 1.50)],
            [(1.65, 62, 1.07), (3.1, 65, 1.23), (6.8, 67, 1.48), (9.66, 62, 1.3), (12.58, 57, 1.6)],
            [(1.1, 57, 2.2), (4.52, 58, 1.75), (7.2, 55, 1.5), (9.66, 52, 1.8), (12.85, 50, 1.6)])),
    'timbers': Movement(75, 'd f g da c g f a d bb a d', 'b b2 b s b2 b b2 s b b2 b -',
        (0, 2, 4, 6, 8, 10), ('flute', 'pluck', 'flute'), (
            [(1.32, 62, .96), (2.68, 65, .92), (4.65, 69, 1.64), (7.24, 67, 1.5), (9.37, 62, 1.85), (13.36, 65, 1.42)],
            [(.65, 64, 1.13), (2.71, 67, 1.31), (5.32, 62, 1.20), (7.31, 65, 1.2), (10.7, 60, 1.27), (13.32, 57, 1.55)],
            [(1.34, 65, 1.35), (3.28, 69, 1.29), (5.34, 70, 1.50), (8.73, 69, 1.62), (11.25, 64, 1.16), (13.36, 62, 1.50)])),
    'crossing': Movement(67, 'da ds c a g da gm a ds c a da', 'o o2 - o o2 o - o2 o o2 o -',
        (0, 1, 3, 4, 6, 8, 9, 11), ('bow', 'flute', 'bow'), (
            [(1.15, 57, 2.32), (4.85, 62, 2.74), (9.4, 60, 1.60), (12.5, 57, 2.0)],
            [(2.25, 67, 2.63), (6.3, 65, 1.55), (8.82, 62, 2.68), (12.7, 64, 1.55)],
            [(1.18, 62, 2.35), (5.1, 60, 2.1), (8.83, 57, 1.75), (11.3, 55, 1.2), (13.43, 57, 1.40)])),
    'promise': Movement(70, 'd f c g da bb f a g f a ds', 'p p2 s2 p p2 s p2 s p p2 p -',
        (0, 3, 4, 5, 8, 10), ('bow', 'flute', 'bow'), (
            [(.85, 57, 1.58), (3.2, 62, 1.35), (5.05, 65, 2.05), (8.52, 64, 1.75), (11.12, 60, 1.27), (13.08, 62, 1.80)],
            [(1.52, 65, 1.80), (4.65, 70, 1.48), (6.64, 69, 1.62), (9.82, 65, 1.88), (13.08, 64, 1.83)],
            [(1.05, 55, 1.72), (3.88, 57, 1.3), (5.67, 60, 2.0), (9.18, 57, 1.86), (13.1, 62, 1.62)])),
    'homecoming': Movement(65, 'd f g da bb f c a gm f a d', 'r r2 h s2 r2 r h s r r2 r -',
        (0, 2, 4, 5, 8, 10, 11), ('flute', 'bow', 'flute'), (
            [(1.0, 62, 1.48), (3.12, 65, 1.32), (4.92, 69, 2.22), (8.45, 67, 1.75), (11.05, 69, 1.38), (13.35, 65, 1.6)],
            [(.9, 58, 1.78), (3.7, 62, 1.38), (5.55, 65, 2.08), (9.25, 64, 1.68), (12.23, 57, 2.18)],
            [(1.12, 65, 1.44), (3.4, 69, 1.50), (5.25, 74, 2.02), (8.76, 69, 1.79), (11.58, 64, 1.03), (13.15, 62, 1.65)])),
}

# The puzzle cadences share D and A with the looping harmony. They can enter
# between beats without assuming a particular place in a background track.
CUES = {
    'shelter-cue': [(0, 'pluck', 50, 2.5, .74), (.43, 'bow', 57, 1.94, .51),
                    (1.12, 'pluck', 65, 1.85, .54), (1.76, 'pluck', 62, 1.86, .44)],
    'craft-cue': [(0, 'pluck', 50, 1.56, .68), (.27, 'iron', 69, 1.36, .31),
                  (.76, 'pluck', 57, 2.13, .64), (1.30, 'pluck', 62, 1.97, .54)],
    'horizon-cue': [(0, 'pluck', 50, 2.48, .70), (.27, 'flute', 62, .79, .47),
                    (1.00, 'flute', 69, 1.70, .50), (1.28, 'pluck', 57, 2.30, .54)],
    'setback-cue': [(0, 'pluck', 50, 1.22, .45), (.24, 'bow', 53, 1.02, .48),
                    (1.22, 'bow', 52, 1.87, .39)],
}


def taper(time, attack, release):
    rise = np.sin(np.pi / 2 * np.minimum(1, time / attack)) ** 2
    fall = np.sin(np.pi / 2 * np.minimum(1, (time[-1] - time) / release)) ** 2
    return rise * fall


def texture(rng, count, frequencies):
    filt = signal.butter(2, frequencies, fs=RATE, btype='bandpass', output='sos')
    grain = signal.sosfilt(filt, rng.standard_normal(count))
    return grain / (np.std(grain) + 1e-12)


def instrument(kind, pitch, length, rng):
    t = np.arange(max(2, round(length * RATE))) / RATE
    frequency = 440 * 2 ** ((pitch - 69 + rng.uniform(-.025, .025)) / 12)
    if kind == 'pluck':
        point = rng.uniform(.165, .225)
        # Plucking location cancels upper string modes. Body resonances bring
        # out warm low mids, and each partial has its own release.
        result = np.zeros(len(t))
        for n in range(1, 13):
            partial = frequency * n
            body = 1 + .45 * np.exp(-((partial-215)/115)**2) + .22 * np.exp(-((partial-560)/190)**2)
            strength = np.sin(np.pi*n*point) / (n**1.38 * np.sin(np.pi*point))
            decay = .84 + .33*n + max(0, pitch-59)*.019
            # A minute change in string tension on the attack.
            phase = TAU * partial * (t + .00010 * (1-np.exp(-14*t)))
            result += body * strength * np.cos(phase + n*.15) * np.exp(-t*decay)
        contact = .035 * texture(rng, len(t), (420, 2400)) * np.exp(-70*t)
        return .64 * taper(t, .009, .22) * (result + contact)

    if kind == 'iron':
        result = np.zeros(len(t))
        for ratio, level, decay in [(1., 1., 3.0), (2.03, .23, 4.2), (3.84, .11, 5.8)]:
            result += level*np.sin(TAU*frequency*ratio*t)*np.exp(-decay*t)
        return .32 * taper(t, .012, .19) * result

    breath = np.sin(TAU * (rng.uniform(.32, .49)*t + rng.random()))
    depth = (6.2 if kind == 'bow' else 3.4) * np.minimum(1, t/.55)
    vibrato = np.sin(TAU*(rng.uniform(4.6, 5.2)*t) + .45*breath) * depth
    scoop = (-6 if kind == 'bow' else -11)*np.exp(-t/.095)
    phase = TAU/RATE * np.cumsum(frequency * 2**((vibrato + 1.9*breath + scoop)/1200))
    if kind == 'flute':
        air = texture(rng, len(t), (880, 3900))
        tone = np.sin(phase) + (.28+.042*breath)*np.sin(2*phase+.30) + .10*np.sin(3*phase-.1)
        tone += .041*np.sin(4*phase+.8) + air*(.012+.075*np.exp(-16*t))
        return .75 * taper(t, min(.145, length*.24), min(.32, length*.29)) * tone * (.94+.06*breath)

    result = np.zeros(len(t))
    for n in range(1, 13):
        partial = n*frequency
        # A bowed body favours resonances around 265, 540 and 1,100 Hz.
        body = .52 + .75*np.exp(-((partial-265)/138)**2) + .57*np.exp(-((partial-540)/222)**2)
        body += .26*np.exp(-((partial-1100)/300)**2)
        result += body * np.sin(n*phase+.14*n)/(n**1.22)
    result += .027*texture(rng, len(t), (510, 2550))
    attack = rng.uniform(.28, .48) if pitch < 50 else rng.uniform(.18, .28)
    return .65 * taper(t, attack, min(.50, length*.3)) * result * (.89+.11*breath)


PAN = {'pluck': -.30, 'bow': -.03, 'flute': .30, 'iron': .24}


def play(mix, time, kind, pitch, length, strength, rng, pan=None):
    start = round(time * RATE)
    if pan is None:
        pan = PAN[kind] + rng.uniform(-.055, .055)
    angle = (pan+1)*np.pi/4
    sample = instrument(kind, pitch, length, rng) * strength
    count = min(len(mix)-start, len(sample))
    mix[start:start+count, 0] += sample[:count]*np.cos(angle)
    mix[start:start+count, 1] += sample[:count]*np.sin(angle)


def room(mix):
    """Small early wood reflections and a short, damped stereo room tail."""
    rng = np.random.default_rng(1864)
    t = np.arange(round(.85*RATE))/RATE
    dry = mix.copy()
    for side in (0, 1):
        impulse = np.zeros(len(t))
        for delay, gain in [(.019, .075), (.035, .047), (.048, -.036), (.071, .033), (.107, .023)]:
            time = delay + rng.uniform(-.004, .004)
            impulse[round(time*RATE)] += gain
        air = signal.sosfilt(signal.butter(2, 2300, fs=RATE, output='sos'), rng.standard_normal(len(t)))
        impulse += .0028 * air * np.exp(-t/.16) * (1-np.exp(-t/.028))
        source = .56*dry[:,side] + .44*dry[:,1-side]
        mix[:,side] += signal.oaconvolve(source, impulse)[:len(mix)]
    filt = signal.butter(2, 47, fs=RATE, btype='highpass', output='sos')
    return signal.sosfilt(filt, mix, axis=0)


def render_movement(name, score, rng):
    beat = 60/score.tempo
    chords, figures = score.chords.split(), score.figures.split()
    assert len(chords) == len(figures) == 12
    rubato = np.array([.99, 1.02, .985, 1.025, .978, 1.017, .985, 1.025, .978, 1.005, .985, 1.007])
    lengths = rubato / rubato.mean() * beat * 4
    bars = np.cumsum([0, *lengths])
    duration = round(bars[-1] * RATE)
    mix = np.zeros((duration + RATE*4, 2))
    for bar, tag in enumerate(figures):
        chord = CHORDS[chords[bar]]
        pulse = lengths[bar]/4
        for when, string, dynamic in FIGURES[tag]:
            time = bars[bar] + (.095 + when*pulse + rng.uniform(-.013,.013))
            play(mix, time, 'pluck', chord[string], rng.uniform(2.45,3.04),
                 dynamic*rng.uniform(.91,1.07), rng)
        if bar in score.bass_bars:
            pitch = chord[0] + (12 if name=='shore' and bar==5 else 0)
            play(mix, bars[bar]+pulse*.25, 'bow', pitch, pulse*rng.uniform(2.75,3.90),
                 .30 if name=='crossing' else .24, rng, pan=-.14)
        if name=='forge' and bar in (1, 4, 6, 9):
            play(mix, bars[bar]+pulse*2.58, 'iron', chord[2]+12, 1.6, .23, rng)

    for group, phrase in enumerate(score.phrases):
        voice = score.voices[group]
        for i, (when, pitch, length) in enumerate(phrase):
            bar = group*4 + int(when//4)
            pulse = lengths[bar]/4
            time = bars[bar]+(when % 4)*pulse
            dynamic = .54 + .13*np.sin(np.pi*i/(len(phrase)-1))
            play(mix, time, voice, pitch, max(.68, length*pulse), dynamic, rng)
    mix = room(mix)
    # Carry resonances from the end of the bar line into the next cycle.
    tail = mix[duration:]
    mix[:len(tail)] += tail
    return mix[:duration]


def render_cue(events, rng):
    seconds = max(start+length for start, _, _, length, _ in events) + .48
    mix = np.zeros((round(seconds*RATE), 2))
    for start, kind, pitch, length, strength in events:
        play(mix, start+.016, kind, pitch, length, strength, rng)
    return room(mix)


def measure(path):
    process = subprocess.run(['ffmpeg','-hide_banner','-nostdin','-i',str(path),'-af',
                             'ebur128=peak=true','-f','null','-'], capture_output=True, text=True, check=True)
    tail = process.stderr.rsplit('Summary:', 1)[-1]
    integrated = re.search(r'I:\s+([\d.-]+) LUFS', tail)
    peak = re.search(r'Peak:\s+([\d.-]+) dBFS', tail)
    return float(integrated.group(1)), float(peak.group(1))


def encode(destination, mix, target_lufs):
    with tempfile.TemporaryDirectory() as temp:
        wav = Path(temp) / 'mix.wav'
        wavfile.write(wav, RATE, (mix*.15).astype('float32'))
        measured, _ = measure(wav)
        gain = .15 * 10**((target_lufs-measured)/20)
        for _ in range(2):
            wavfile.write(wav, RATE, (mix*gain).astype('float32'))
            subprocess.run(['ffmpeg','-nostdin','-loglevel','error','-y','-i',str(wav),
                            '-map_metadata','-1','-codec:a','libmp3lame','-b:a','96k','-write_xing','1',
                            '-id3v2_version','0',str(destination)], check=True)
            loudness, peak = measure(destination)
            if abs(loudness-target_lufs) <= .2:
                break
            # Master the decoded recording with a constant gain. This preserves
            # expression through the quiet bars and the shape of each attack.
            gain *= 10**((target_lufs-loudness)/20)
    decoded = subprocess.run(['ffmpeg','-nostdin','-loglevel','error','-i',str(destination),
                              '-f','f32le','-'], check=True, capture_output=True).stdout
    pcm = np.frombuffer(decoded, dtype='<f4').reshape(-1, 2)
    seam = np.max(np.abs(pcm[0]-pcm[-1]))
    stereo = 20*np.log10(np.sqrt(np.mean((pcm[:,0]-pcm[:,1])**2)) /
                         np.sqrt(np.mean((pcm[:,0]+pcm[:,1])**2)))
    if len(pcm) != len(mix) or abs(loudness-target_lufs) > .5 or peak > -2.5 or seam > .018:
        raise ValueError(f'{destination.name}: decoded length, level, peak or loop discontinuity out of range')
    return f'{len(pcm)/RATE:5.2f}s   {loudness:5.1f} LUFS   {peak:5.1f} dBTP   seam {seam:.5f}   side/mid {stereo:5.1f} dB'


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--output', type=Path, default=TARGET)
    parser.add_argument('names', nargs='*', help='Optional movement or cue names to render')
    args = parser.parse_args()
    args.output.mkdir(parents=True, exist_ok=True)
    library = [*MOVEMENTS, *CUES]
    for name in args.names or library:
        rng = np.random.default_rng(231371 + library.index(name))
        if name in MOVEMENTS:
            mix = render_movement(name, MOVEMENTS[name], rng)
            target = -23.0
        else:
            mix = render_cue(CUES[name], rng)
            target = -25.0 if name == 'setback-cue' else -22.5
        report = encode(args.output/(name+'.mp3'), mix, target)
        print(f'{name:14} {report}', flush=True)


if __name__ == '__main__':
    main()
