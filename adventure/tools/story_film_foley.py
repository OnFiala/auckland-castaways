"""Sample-free stereo environments and the score for Until We Return."""
import numpy as np
from scipy import signal


# Wind, breaking water, rain, and hearth levels by picture. Interpolation ties consecutive shots together.
WEATHER = {
    'sea': (.013, .037, 0, 0), 'wind': (.022, .022, 0, 0),
    'lantern': (.009, .025, .004, 0), 'rain': (.012, .006, .017, 0),
    'hearth': (.005, .002, 0, .014), 'still': (.004, .002, 0, 0),
    'ember': (.003, 0, 0, .018), 'sail': (.017, .027, 0, 0),
    'chart': (.005, .002, .009, 0),
}
# One short, newly composed rising line (D–F–A) returns in different registers and cadences.
# Tuples are entrance in seconds, MIDI pitch, sounding duration, timbre.
PHRASES = {
    'prologue': [(.3, 50, 4.3, 'pluck'), (5.4, 53, 4.5, 'bow'), (11.0, 57, 3.2, 'pluck'),
                 (14.2, 50, 3.3, 'bow'), (18.8, 57, 3.8, 'bow'), (24.0, 53, 4.4, 'bow'),
                 (35.0, 48, 4.8, 'bow'), (45.0, 50, 3.2, 'pluck'), (56.2, 53, 4.5, 'bow'),
                 (61.8, 57, 3.6, 'pluck')],
    'winter': [(.2, 53, 4, 'bow'), (4.0, 57, 4, 'pluck'), (8.8, 60, 5, 'bow'),
               (12.0, 57, 4, 'pluck'), (16.4, 53, 4, 'bow')],
    'forge': [(.0, 45, 4.8, 'bow'), (8.6, 50, 5.2, 'bow'), (16.8, 52, 3.0, 'pluck')],
    'boat': [(.1, 50, 4.1, 'pluck'), (3.0, 53, 3.5, 'pluck'), (7.6, 57, 3.8, 'bow'),
             (13.8, 55, 4.2, 'bow'), (17.0, 52, 2.8, 'pluck')],
    'crossing': [(.2, 45, 4.0, 'bow'), (4.8, 48, 4.3, 'bow'), (11.0, 50, 4.1, 'pluck'),
                 (17.0, 45, 3.8, 'bow')],
    'promise': [(.1, 50, 4.0, 'bow'), (5.2, 53, 3.8, 'pluck'), (10.8, 57, 4.8, 'bow'),
                (16.0, 60, 3.5, 'pluck'), (18.8, 57, 3, 'bow')],
    'return': [(.1, 50, 4.0, 'pluck'), (2.0, 53, 4, 'pluck'), (5.6, 57, 4.8, 'bow'),
               (11.2, 60, 4.5, 'bow'), (15.0, 62, 3.7, 'bow')],
    'epilogue': [(.2, 62, 4.0, 'pluck'), (4.4, 57, 4.8, 'bow'), (10.2, 50, 5.2, 'bow'),
                 (23.2, 48, 4.6, 'bow'), (35.7, 53, 4.0, 'bow'), (41.0, 50, 3.7, 'pluck'),
                 (46.1, 50, 4.0, 'pluck'), (50.8, 53, 4.3, 'bow'), (54.5, 50, 3.0, 'bow')],
}
# Individually spotted sounds. Avoid continuous work noise under every word.
SPOTS = {
    'outfit': [(1.3, 'paper'), (10.6, 'wood')], 'hearth-remains': [(1.5, 'water')],
    'schooner': [(1, 'rigging'), (8.9, 'wood')], 'wreck': [(.4, 'wood'), (6.8, 'timber')],
    'cabin-table': [(.4, 'timber'), (8.8, 'water')], 'shore-dawn': [(8.9, 'water')],
    'beach': [(6.4, 'canvas'), (8.9, 'canvas')], 'camp-shelter': [(4.5, 'wood'), (8.7, 'wood')],
    'cabin': [(5.1, 'wood'), (9.2, 'wood')], 'forge-cold': [(7.5, 'iron')],
    'forge-lit': [(.6, 'iron'), (1.25, 'iron'), (6.9, 'iron')],
    'slipway': [(1.6, 'wood'), (7.3, 'timber')], 'slipway-ready': [(.75, 'canvas'), (8.7, 'rigging')],
    'crossing-wet': [(.4, 'timber'), (4.5, 'water'), (9.5, 'canvas')],
    'crossing-bailed': [(1.1, 'rigging'), (5.8, 'pump'), (6.65, 'pump'), (7.5, 'pump')],
    'harbour': [(8.4, 'wood')], 'chartroom': [(.65, 'paper'), (8.9, 'paper')],
    'landing': [(1.7, 'canvas'), (7.7, 'water')], 'return-camp': [(1.3, 'wood')],
    'ending': [(2.7, 'wood')], 'invercauld-wreck': [(1.6, 'timber')],
    'skin-boat': [(.8, 'water'), (7.4, 'water')], 'julian': [(1.6, 'rigging'), (10.1, 'water')],
}


def band(source, low, high, sr):
    sos = signal.butter(2, (low, high), btype='bandpass', fs=sr, output='sos')
    filtered = signal.sosfilt(sos, source)
    return filtered / max(1e-8, np.sqrt(np.mean(filtered**2)))


def stereo_add(target, start, sound, pan, sr):
    left = int(start * sr)
    n = min(len(target) - left, len(sound))
    if n <= 0:
        return
    target[left:left+n, 0] += sound[:n] * np.sqrt((1-pan)/2)
    target[left:left+n, 1] += sound[:n] * np.sqrt((1+pan)/2)


def instrument(pitch, seconds, kind, rng, sr):
    t = np.arange(round(seconds * sr)) / sr
    freq = 440 * 2**((pitch-69)/12)
    if kind == 'pluck':
        # An open string: upper partials decay first. A pair of slightly offset fundamentals beats slowly.
        phase = 2*np.pi*freq*t
        wave = (np.sin(phase) + .39*np.sin(2*phase+.2)*np.exp(-1.8*t)
                + .22*np.sin(3*phase)*np.exp(-2.6*t) + .11*np.sin(5*phase)*np.exp(-4*t)
                + .20*np.sin(phase*1.0022))
        env = (1-np.exp(-t*65))*np.exp(-t*1.4)
        return .041 * wave * env
    wobble = .033*np.sin(2*np.pi*4.3*t) * np.minimum(t,1) + .014*np.sin(2*np.pi*1.2*t)
    phase = 2*np.pi*freq*t + wobble
    wave = np.sin(phase) + .41*np.sin(2*phase+.12) + .20*np.sin(3*phase)
    wave += .08*np.sin(5*phase) + .024*band(rng.normal(size=len(t)), 500, 1400, sr)
    attack = np.sin(.5*np.pi*np.clip(t/.68,0,1))**2
    release = np.sin(.5*np.pi*np.clip((seconds-t)/1.16,0,1))**2
    return .024 * wave * attack * release * (.91+.09*np.cos(1.6*t))


def spot(kind, rng, sr):
    t = np.arange(sr*2) / sr
    noise = rng.normal(size=len(t))
    if kind == 'iron':
        fundamental = rng.uniform(580, 740)
        tone = sum(a*np.sin(2*np.pi*fundamental*h*t)*np.exp(-d*t)
                   for a,h,d in [(1,1,8),(.51,2.68,12),(.30,4.12,18),(.34,.461,20)])
        return .058 * (tone + .56*noise*np.exp(-130*t)) * np.minimum(1, t*3200)
    if kind in ('wood', 'timber', 'pump'):
        f = {'wood': 330, 'timber': 112, 'pump': 190}[kind] * rng.uniform(.84,1.13)
        body = np.sin(2*np.pi*f*t)*np.exp(-t*26) + .5*np.sin(2*np.pi*f*1.64*t)*np.exp(-t*38)
        attack = band(noise, 260, 2700, sr)*np.exp(-t*90)
        return .084 * (body + .4*attack) * np.minimum(1, t*1600)
    if kind in ('canvas', 'paper'):
        source = band(noise, 260 if kind=='canvas' else 1100, 4600, sr)
        env = sum(np.exp(-((t-c)/w)**2) for c,w in [(.12,.055),(.26,.082),(.41,.06)])
        return (.047 if kind=='canvas' else .018) * source * env
    if kind == 'rigging':
        frequency = 115 + 90*np.sin(3.8*t)
        phase = 2*np.pi*np.cumsum(frequency) / sr
        env = np.sin(np.pi*np.clip(t/.72,0,1))**2
        return .034*env*(np.sin(phase)+.34*np.sin(3*phase)+.2*band(noise, 350, 1350, sr))
    env = (1-np.exp(-t*15))*np.exp(-4.2*t)
    return .074 * band(noise, 240, 2400, sr) * env


def chapter_bed(chapter, index, sr):
    rng = np.random.default_rng(48121 + index)
    shots = chapter['shots']
    lengths = [s['seconds'] for s in shots]
    bounds = np.cumsum([0, *lengths])
    t = np.arange(int(sr*bounds[-1]))/sr
    bed = np.zeros((len(t),2), np.float32)
    controls = [0.]
    values = [WEATHER[shots[0]['action']]]
    for i in range(1,len(shots)):
        controls += [bounds[i]-.68,bounds[i]+.68]
        values += [WEATHER[shots[i-1]['action']],WEATHER[shots[i]['action']]]
    controls.append(bounds[-1])
    values.append(WEATHER[shots[-1]['action']])
    wind, water, rain, fire = [np.interp(t,controls,a) for a in zip(*values)]
    # Weather is continuous through a shot change; nothing loops across a reel.
    crest = (.5+.5*np.sin(2*np.pi*t/6.75 + .62*np.sin(t*.56) + index))**2
    gust = .58 + .18*np.sin(.83*t) + .23*np.sin(.23*t+index)
    shared = rng.normal(size=len(t))
    for side in (0,1):
        noise = .68*shared + .73*rng.normal(size=len(t))
        hiss = band(noise, 540, 3250, sr)
        swell = band(noise, 62, 420, sr)
        bed[:,side] += wind*gust*(.70*swell+.30*band(noise, 425, 1300, sr))
        bed[:,side] += water*(.64*swell*(.32+crest)+hiss*(.15+.54*crest))
        bed[:,side] += rain*band(noise, 1200, 6300, sr)*(.66+.15*np.cos(.8*t))
        bed[:,side] += fire*(.65*swell + .22*band(noise, 900, 4200, sr))
    for i,start in enumerate(bounds[:-1]):
        for at,kind in SPOTS[shots[i]['plate']]:
            stereo_add(bed, start+at, spot(kind,rng,sr), rng.uniform(-.48,.48), sr)
        if shots[i]['action'] in ('hearth','ember'):
            for at in rng.uniform(.3,lengths[i]-.4,round(lengths[i]*2.0)):
                x=np.arange(round(.10*sr))/sr
                pop = rng.uniform(.016,.047)*rng.normal(size=len(x))*np.exp(-x*rng.uniform(100,240))
                stereo_add(bed,start+at,pop,rng.uniform(-.50,.50),sr)
    for n,(start,pitch,length,kind) in enumerate(PHRASES[chapter['id']]):
        sound = instrument(pitch,length,kind,rng,sr)
        pan = -.20 if n%2 else .18
        stereo_add(bed,start,sound,pan,sr)
        stereo_add(bed,start+.079,sound*.12,-pan,sr)
    fade = np.minimum(1,np.minimum(t/.22,(bounds[-1]-t)/.58))
    return bed * fade[:,None]
