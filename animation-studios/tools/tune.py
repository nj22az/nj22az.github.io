"""The whistle, the footsteps and the water: an original tune and procedural sound, one 30 s loop.

The tune is written here for this film (G major, five two-bar phrases A B A B C). Each step of the
stroll is one beat; the notes are quavers, so his lips, the floating notes and the sound share one clock.
"""
import math
import numpy as np

SR = 48000
FPS = 24
QUAVER_FRAMES = 9                     # half a step
PHRASE_QUAVERS = 16                   # 6 s: four strides
F = dict(D5=587.33, E5=659.25, G5=783.99, A5=880.0, B5=987.77, C6=1046.5, D6=1174.66, E6=1318.51, G6=1567.98)
A = [('G5', 0, 1), ('B5', 1, 1), ('D6', 2, 1), ('B5', 3, 1), ('E6', 4, 2), ('D6', 6, 1), ('B5', 7, 1),
     ('A5', 8, 1), ('B5', 9, 1), ('C6', 10, 1), ('A5', 11, 1), ('G5', 12, 1.6)]
B = [('D6', 0, 1), ('D6', 1, 1), ('E6', 2, 1), ('D6', 3, 1), ('B5', 4, 2), ('G5', 6, 1), ('A5', 7, 1),
     ('B5', 8, 1), ('D6', 9, 1), ('C6', 10, 1), ('B5', 11, 1), ('A5', 12, 1.6)]
C = [('G5', 0, 1), ('A5', 1, 1), ('B5', 2, 1), ('D6', 3, 1), ('G6', 4, 2), ('E6', 6, 1), ('D6', 7, 1),
     ('B5', 8, 1), ('A5', 9, 1), ('B5', 10, 1), ('A5', 11, 1), ('G5', 12, 1.6)]
PHRASES = [A, B, A, B, C]
# one chord to the beat, eight beats to the phrase: the band behind the whistle
CHORDS = dict(A='GGCGDDGG', B='GGGGGCDD', C='GGCCDDGG')
ORDER = 'ABABC'
BASS = dict(G=(98.0, 73.42), C=(130.81, 98.0), D=(146.83, 110.0))            # root, then fifth below
STRUM = dict(G=(196.0, 246.94, 293.66), C=(196.0, 261.63, 329.63), D=(185.0, 220.0, 293.66))


def notes():
    """(start frame, length in frames, pitch name) for the whole loop."""
    out = []
    for k, ph in enumerate(PHRASES):
        for name, q, ln in ph:
            out.append(((k * PHRASE_QUAVERS + q) * QUAVER_FRAMES, ln * QUAVER_FRAMES, name))
    return out


TOTAL = len(PHRASES) * PHRASE_QUAVERS * QUAVER_FRAMES      # 720: the loop, in 24ths of a second


def pucker_at(f):
    """How far his lips are pursed at time f (24ths of a second, any fraction): 0 is the grin, 1 a
    whistle, a little over 1 as each note starts. The lips stay pursed from note to note and let go
    after the last note of a phrase."""
    best = 0.0
    for start, ln, _ in notes():
        d = (f - start + 1.0) % TOTAL                       # the lips are there a moment before the note
        if d < ln + 2.5:
            on = min(1.0, d / 1.4)
            off = min(1.0, (ln + 2.5 - d) / 1.6)
            best = max(best, min(on, off) * (1 + 0.3 * math.exp(-max(0.0, d - 1.0) / 2.2)))
    return best


def lid_at(f):
    """His eyelid, 0 open to 1 shut: he blinks twice a phrase."""
    q = (f / QUAVER_FRAMES) % PHRASE_QUAVERS
    v = max(0.0, 1 - abs(q - 14.55) / 0.26, 1 - abs(q - 5.1) / 0.26)
    return v * v * (3 - 2 * v)


def render(total_frames, step_frames):
    n = int(round(total_frames / FPS * SR))
    t = np.arange(n) / SR
    rng = np.random.default_rng(7)
    whistle = np.zeros(n)
    for start, ln, name in notes():
        i0 = int(start / FPS * SR); m = int((ln / FPS - 0.045) * SR)
        tt = np.arange(m) / SR
        f = F[name] * (1 - 0.035 * np.exp(-tt / 0.035)) * (1 + 0.006 * np.sin(2 * np.pi * 5.6 * tt) * np.minimum(1, tt / 0.18))
        phase = 2 * np.pi * np.cumsum(f) / SR
        env = np.minimum(1, tt / 0.028) * np.minimum(1, (m / SR - tt) / 0.07)
        breath = rng.standard_normal(m)
        breath = np.convolve(breath, np.ones(6) / 6, 'same') - np.convolve(breath, np.ones(40) / 40, 'same')
        whistle[i0:i0 + m] += env * (np.sin(phase) + 0.07 * np.sin(2 * phase) + 0.05 * breath)
    band = np.zeros(n)
    beat = 2 * QUAVER_FRAMES
    for b in range(int(total_frames // beat)):
        ch = CHORDS[ORDER[(b // 8) % len(ORDER)]][b % 8]
        # tuba on the beat
        i0 = int(b * beat / FPS * SR); m = int(0.34 * SR); tt = np.arange(m) / SR
        f0 = BASS[ch][b % 2]
        tuba = (np.sin(2 * np.pi * f0 * tt) + 0.35 * np.sin(4 * np.pi * f0 * tt) + 0.12 * np.sin(6 * np.pi * f0 * tt))
        tuba *= np.minimum(1, tt / 0.018) * np.exp(-tt / 0.16)
        band[i0:i0 + m] += 0.9 * tuba[: max(0, min(m, n - i0))]
        # banjo on the off beat
        i0 = int((b * beat + QUAVER_FRAMES) / FPS * SR); m = int(0.22 * SR); tt = np.arange(m) / SR
        pluck = np.zeros(m)
        for j, f1 in enumerate(STRUM[ch]):
            d = int(j * 0.006 * SR)
            for k in range(1, 6):
                pluck[d:] += np.sin(2 * np.pi * f1 * k * tt[: m - d]) / k * np.exp(-tt[: m - d] / (0.09 / k ** 0.5))
        band[i0:i0 + m] += 0.28 * pluck[: max(0, min(m, n - i0))]
    steps = np.zeros(n)
    k = 0
    for fr in np.arange(0, total_frames, step_frames):
        i0 = int((fr + 1) / FPS * SR); m = int(0.16 * SR); tt = np.arange(m) / SR
        f = (96 if k % 2 == 0 else 86) * (1 + 0.5 * np.exp(-tt / 0.02))
        thump = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt / 0.045)
        click = np.convolve(rng.standard_normal(m), np.ones(24) / 24, 'same') * np.exp(-tt / 0.012) * 1.6
        seg = thump + click
        steps[i0:i0 + m] += seg[: max(0, min(m, n - i0))]
        k += 1
    wash = rng.standard_normal(n)
    wash = np.convolve(wash, np.ones(90) / 90, 'same')
    wash = np.concatenate([wash[n // 2:], wash[:n // 2]]) * np.linspace(0, 1, n) + wash * np.linspace(1, 0, n)   # seamless
    wash *= 0.55 + 0.45 * np.sin(2 * np.pi * t / 3.75 - 1.2)
    crackle = (rng.random(n) < 0.0007) * rng.standard_normal(n)
    crackle = np.convolve(crackle, np.ones(5) / 5, 'same')
    left = 0.20 * whistle + 0.24 * steps + 0.075 * band + 0.55 * wash + 0.05 * crackle
    right = 0.21 * whistle + 0.22 * steps + 0.075 * band + 0.55 * np.roll(wash, 1777) + 0.05 * np.roll(crackle, 911)
    st = np.stack([left, right], 1)
    for c in (0, 1):                                 # the narrow band of an old optical track
        st[:, c] = np.convolve(st[:, c], np.ones(5) / 5, 'same')
    st /= max(1e-9, np.abs(st).max()) / 0.7
    return (st * 32767).astype('<i2')
