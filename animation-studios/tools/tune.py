"""The whistle, the footsteps and the water: an original tune and procedural sound, one 30 s loop.

The tune is written here for this film (G major, five two-bar phrases A B A B C). Each step of the
stroll is one beat; the notes are quavers, so his lips, the floating notes and the sound share one clock.
"""
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


def notes():
    """(start frame, length in frames, pitch name) for the whole loop."""
    out = []
    for k, ph in enumerate(PHRASES):
        for name, q, ln in ph:
            out.append(((k * PHRASE_QUAVERS + q) * QUAVER_FRAMES, ln * QUAVER_FRAMES, name))
    return out


def face_at(n):
    """Mouth and eye for film frame n: lips pursed on a note (wider as it starts), a grin between phrases."""
    mouth = 'grin'
    for start, ln, _ in notes():
        if start - 1 <= n < start + ln + 1:            # lips stay pursed from one note to the next
            mouth = 'w2' if 0 <= n - start < 3 else 'w1'
            if 0 <= n - start < 3:
                break
    q = (n / QUAVER_FRAMES) % PHRASE_QUAVERS
    eye = 'shut' if (14.4 <= q < 14.75 or 5.0 <= q < 5.25) else 'open'
    return mouth, eye


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
    left = 0.20 * whistle + 0.30 * steps + 0.75 * wash
    right = 0.22 * whistle + 0.27 * steps + 0.75 * np.roll(wash, 1777)
    st = np.stack([left, right], 1)
    st /= max(1e-9, np.abs(st).max()) / 0.7
    return (st * 32767).astype('<i2')
