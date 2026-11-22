"""Sample-free stereo environments and the score for Until We Return."""
import numpy as np
from scipy import signal

from story_film_cut import PICTURE_EDIT


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
    'outfit': [(6.7, 'paper')], 'hearth-remains': [(1.5, 'water')],
    'schooner': [(1, 'rigging')], 'wreck': [(7.6, 'timber')],
    'cabin-table': [(.4, 'timber'), (7.9, 'water')], 'shore-dawn': [(8.9, 'shingle')],
    'beach': [(6.4, 'canvas'), (8.9, 'canvas')], 'camp-shelter': [(4.5, 'wood'), (8.7, 'wood')],
    'cabin': [(6.8, 'chess')], 'forge-cold': [(4.3, 'iron')],
    'forge-lit': [],
    'slipway': [(1.6, 'wood'), (7.3, 'timber')], 'slipway-ready': [(8.7, 'rigging')],
    'crossing-wet': [(.4, 'timber'), (4.5, 'water'), (9.5, 'canvas')],
    'crossing-bailed': [(1.1, 'rigging'), (5.8, 'pump'), (6.65, 'pump'), (7.5, 'pump')],
    'harbour': [(8.4, 'wood')], 'chartroom': [(.65, 'paper'), (8.9, 'cloth')],
    'landing': [(1.7, 'canvas'), (7.7, 'water')], 'return-camp': [(6.8, 'shingle')],
    'ending': [(2.7, 'tableware')], 'invercauld-wreck': [(1.6, 'timber')],
    'skin-boat': [(.8, 'water'), (7.4, 'water')], 'julian': [(1.6, 'rigging'), (10.1, 'water')],
}

# A contact is expressed in the local phase of its picture. Keep repeat strikes at
# the same stereo position as the tool even if the editor later moves the close-up.
PICTURE_CONTACTS = {
    'sydney-lift': ((.18, 'wood', -.18), (.22, 'hemp', -.18), (.76, 'rigging', -.18)),
    'sea/chain': ((.30, 'chain', .12),),
    'cast-lead': ((.21, 'hemp', -.06), (.64, 'lead', .05)),
    'swing-lantern': ((.34, 'hinge', .04), (.81, 'hinge', .04)),
    'land/bellows': ((.26, 'bellows', .12),),
    'strike-iron': ((.22, 'iron', .08), (.55, 'iron', .08), (.81, 'iron', .08)),
    'drive-fastening': ((.34, 'mallet', -.06), (.71, 'mallet', -.06)),
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
    if kind == 'lead':
        # Water closing behind the narrow weight, then the little hollow bubble surfacing.
        splash = band(noise, 310, 4700, sr) * (1 - np.exp(-85*t)) * np.exp(-10*t)
        bubble_time = np.maximum(0, t - .12)
        bubble = np.sin(2*np.pi*(620*bubble_time + 1450*bubble_time**2))
        bubble *= (1 - np.exp(-90*bubble_time)) * np.exp(-25*bubble_time)
        return .18*splash + .080*bubble
    if kind == 'chain':
        links = np.zeros_like(t)
        for at in [0, .14, .25, .35, .43, .52, .62, .77]:
            u = np.maximum(0, t - at)
            f = rng.uniform(330, 480)
            ring = np.sin(2*np.pi*f*u) + .57*np.sin(2*np.pi*f*2.61*u)
            links += (1 - np.exp(-1800*u)) * np.exp(-23*u) * (ring + .25*noise*np.exp(-80*u))
        return .078*links
    if kind == 'hemp':
        draw = band(noise, 180, 1400, sr) + .15*band(noise, 1900, 4500, sr)
        rub = (.72 + .28*np.cos(2*np.pi*(27*t + 6*t*t)))
        return .062*draw*rub*np.sin(np.pi*np.clip(t/.90, 0, 1))**2
    if kind == 'hinge':
        sweep = 430*t - 160*t**2
        scrape = np.sin(2*np.pi*sweep) + .26*np.sin(2*np.pi*2.6*sweep)
        envelope = (1 - np.exp(-42*t))*np.exp(-11*t)
        return .047*envelope*(scrape + .45*band(noise, 290, 1900, sr))
    if kind == 'bellows':
        push = np.sin(np.pi*np.clip(t/.65, 0, 1))**1.6
        draw = np.sin(np.pi*np.clip((t-.70)/.68, 0, 1))**2
        hinge = np.sin(2*np.pi*(115*t + 17*t*t)) * (.4 + .15*np.sin(2*np.pi*30*t))
        air = band(noise, 170, 1280, sr) + .33*band(noise, 1400, 3100, sr)
        return .081*(air*push + .34*air*draw + .35*hinge*(push+draw))
    if kind == 'shingle':
        stones = np.zeros_like(t)
        for at in (.04, .13, .22, .31, .43, .51):
            u = np.maximum(0, t - at)
            f = rng.uniform(620, 1650)
            stones += (1 - np.exp(-900*u)) * np.exp(-42*u) * np.sin(2*np.pi*f*u)
        wash = band(noise, 320, 2600, sr)*(1-np.exp(-8*t))*np.exp(-3*t)
        return .041*stones + .063*wash
    if kind in ('chess', 'tableware', 'mallet'):
        f, decay, level = {'chess': (620, 38, .065), 'tableware': (540, 20, .060),
                           'mallet': (138, 22, .15)}[kind]
        modes = np.sin(2*np.pi*f*t) + .45*np.sin(2*np.pi*2.37*f*t)
        return level*(1-np.exp(-2100*t))*(modes*np.exp(-decay*t) + .48*noise*np.exp(-100*t))
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
    if kind in ('canvas', 'paper', 'cloth'):
        low, high, amplitude = {'canvas': (260, 4600, .047), 'paper': (1100, 4600, .018),
                                'cloth': (250, 2150, .065)}[kind]
        source = band(noise, low, high, sr)
        env = sum(np.exp(-((t-c)/w)**2) for c,w in [(.12,.055),(.26,.082),(.41,.06)])
        return amplitude * source * env
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
        edit = PICTURE_EDIT[shots[i]['plate']]
        for j, (begin, picture) in enumerate(edit):
            end = edit[j+1][0] if j+1 < len(edit) else lengths[i]
            for phase, kind, pan in PICTURE_CONTACTS.get(picture, ()):
                at = start + begin + phase*(end-begin)
                stereo_add(bed, at, spot(kind, rng, sr), pan, sr)
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


def mix_narration(bed, voice, sr):
    """Ease competing midrange down for each spoken phrase, preserving low environmental sound."""
    # Follow phrase energy in 20 ms frames. A little look-ahead keeps the first consonant clear.
    block = sr // 50
    padded = np.pad(voice, (0, -len(voice) % block))
    rms = np.sqrt(np.mean(padded.reshape(-1, block)**2, axis=1))
    speech = np.clip(rms / .035, 0, 1)
    levels = np.zeros_like(speech)
    for i in range(len(levels)):
        target = max(speech[i:i+5])
        previous = levels[i - 1] if i else 0
        coefficient = .45 if target > previous else .055
        levels[i] = previous + coefficient*(target - previous)
    presence = signal.sosfilt(signal.butter(2, (450, 4100), 'bandpass', fs=sr, output='sos'),
                              bed, axis=0)
    envelope = np.interp(np.arange(len(voice)) / block, np.arange(len(levels)), levels)
    return bed - .46*presence*envelope[:,None] + voice[:,None]
