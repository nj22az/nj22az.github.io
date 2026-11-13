"""The singer's mouth, from the sung words.

    python3 lipsync.py <song.wav>        writes lipsync.json: open, wide, pucker and blink, 48 times a second

words.json holds every sung word with its start and end in the song (found by a speech model listening to the
owner's recording, then read against the lyrics). Each word is spelled into sounds with the CMU pronouncing
dictionary, each sound has a mouth shape, and the shapes are laid across the word's own time: consonants short,
vowels taking what is left, the last vowel held as a singer holds it. How far the mouth opens then follows the
loudness of the voice's band of the recording, so a held note stays open and breathes with the voice.
"""
import json, sys, os, random
import numpy as np, librosa, pronouncing

HERE = os.path.dirname(os.path.abspath(__file__))
RATE = 48
#            open  wide  pucker
SHAPE = {
    'AA': (1.00, 0.15, 0.0), 'AE': (0.85, 0.45, 0.0), 'AH': (0.70, 0.20, 0.0), 'AY': (0.90, 0.40, 0.0), 'AW': (0.85, 0.0, 0.35),
    'EH': (0.55, 0.65, 0.0), 'EY': (0.50, 0.80, 0.0), 'IH': (0.40, 0.70, 0.0), 'IY': (0.30, 1.00, 0.0),
    'AO': (0.80, 0.0, 0.55), 'OW': (0.60, 0.0, 0.80), 'OY': (0.65, 0.0, 0.70), 'UW': (0.30, 0.0, 1.00), 'UH': (0.40, 0.0, 0.75),
    'ER': (0.40, 0.0, 0.45), 'R': (0.30, 0.0, 0.50), 'W': (0.22, 0.0, 1.00), 'Y': (0.25, 0.7, 0.0),
    'M': (0.0, 0.1, 0.0), 'B': (0.0, 0.1, 0.0), 'P': (0.0, 0.1, 0.0),
    'F': (0.10, 0.35, 0.0), 'V': (0.10, 0.35, 0.0),
    'L': (0.35, 0.3, 0.0), 'N': (0.22, 0.35, 0.0), 'T': (0.20, 0.4, 0.0), 'D': (0.22, 0.4, 0.0), 'S': (0.14, 0.6, 0.0), 'Z': (0.14, 0.6, 0.0),
    'TH': (0.22, 0.3, 0.0), 'DH': (0.22, 0.3, 0.0), 'K': (0.32, 0.2, 0.0), 'G': (0.32, 0.2, 0.0), 'NG': (0.28, 0.2, 0.0), 'HH': (0.45, 0.2, 0.0),
    'CH': (0.25, 0.0, 0.55), 'SH': (0.25, 0.0, 0.55), 'JH': (0.25, 0.0, 0.55), 'ZH': (0.25, 0.0, 0.55),
}
VOWELS = {'AA', 'AE', 'AH', 'AY', 'AW', 'EH', 'EY', 'IH', 'IY', 'AO', 'OW', 'OY', 'UW', 'UH', 'ER'}
SPELL = {'gaslights': 'G AE S L AY T S', 'whitechapel': 'W AY T CH AE P AH L', 'cobblestone': 'K AA B AH L S T OW N', 'hats': 'HH AE T S'}
FIX = {'hands': 'hats'}                       # the model heard "hands pulled low"; the lyric is "hats"


def sounds(word):
    w = FIX.get(word, word)
    if w in SPELL: return SPELL[w].split()
    ph = pronouncing.phones_for_word(w)
    if ph: return [p.rstrip('012') for p in ph[0].split()]
    return [{'a': 'AE', 'e': 'EH', 'i': 'IH', 'o': 'OW', 'u': 'UH'}.get(c, 'T') for c in w]


words = json.load(open(os.path.join(HERE, 'words.json')))
y, sr = librosa.load(sys.argv[1], sr=22050)
n = int(len(y) / sr * RATE) + 1
key = np.zeros((n, 3)); weight = np.zeros(n)                   # the shape asked for at each tick, and whether a word is on

for i, (t0, t1, text, _) in enumerate(words):
    word = ''.join(c for c in text.lower() if c.isalpha())
    if not word: continue
    nxt = words[i + 1][0] if i + 1 < len(words) else t1 + 0.6
    t1 = max(t1, min(nxt - 0.06, t0 + 2.6)) if nxt - t1 < 1.2 else t1 + 0.25      # a sung word is held to the next one
    ph = sounds(word); dur = t1 - t0
    cons = [p for p in ph if p not in VOWELS]; vows = [p for p in ph if p in VOWELS]
    cl = min(0.075, dur / (len(ph) + 1))                                             # a consonant's time
    left = max(0.05, dur - cl * len(cons)); last = max(k for k, p in enumerate(ph) if p in VOWELS) if vows else -1
    share = left / (len(vows) + 1.5) if vows else 0
    t = t0
    for k, p in enumerate(ph):
        d = cl if p not in VOWELS else share * (2.5 if k == last else 1.0)
        a, b = int(t * RATE), min(n, int((t + d) * RATE) + 1)
        key[a:b] = SHAPE.get(p, (0.25, 0.2, 0.0)); weight[a:b] = 1.0
        t += d

# the voice's loudness: the band where a sung vowel lives, smoothed, against its own loud level
S = np.abs(librosa.stft(y, n_fft=1024, hop_length=sr // RATE)); f = librosa.fft_frequencies(sr=sr, n_fft=1024)
band = S[(f > 350) & (f < 3200)].mean(axis=0)[:n]; band = np.pad(band, (0, n - len(band)))
env = np.convolve(band, np.hanning(9) / np.hanning(9).sum(), mode='same'); env = np.clip(env / np.percentile(env, 92), 0, 1.15)


def smooth(a, k):
    w = np.hanning(k); return np.convolve(a, w / w.sum(), mode='same')


open_ = smooth(key[:, 0] * weight * (0.55 + 0.45 * env), 7)     # about 0.1 s: the lips do not teleport
wide = smooth(key[:, 1] * weight, 9); puck = smooth(key[:, 2] * weight, 9)
# lips that must close, close: M, B, P win over the smoothing
closed = (weight > 0) & (key[:, 0] < 0.01); open_ = np.where(smooth(closed.astype(float), 3) > 0.5, open_ * 0.12, open_)

# blinks: one every three to five seconds, never in the first tenth of a second of a word; some come in pairs
rnd = random.Random(1888); blink = np.zeros(n); t = 2.0
while t < n / RATE:
    for dt in ([0.0, 0.32] if rnd.random() < 0.2 else [0.0]):
        c = int((t + dt) * RATE)
        for k in range(-3, 6):
            if 0 <= c + k < n: blink[c + k] = max(blink[c + k], 1.0 if -1 <= k <= 1 else 0.6 if k in (-2, 2, 3) else 0.25)
    t += rnd.uniform(2.8, 5.2)

json.dump({'rate': RATE, 'open': [round(float(v), 3) for v in open_], 'wide': [round(float(v), 3) for v in wide],
           'pucker': [round(float(v), 3) for v in puck], 'blink': [round(float(v), 2) for v in blink]},
          open(os.path.join(HERE, 'lipsync.json'), 'w'), separators=(',', ':'))
print('lipsync: ticks', n, 'mouth open more than a third for', round(float((open_ > 0.33).mean()) * n / RATE, 1), 's of', round(n / RATE, 1))
for t in (9.9, 21.7, 24.6, 42.8, 45.3): print(' ', t, [round(float(a[int(t * RATE)]), 2) for a in (open_, wide, puck)])
