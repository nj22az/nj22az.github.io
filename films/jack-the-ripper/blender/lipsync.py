"""The singer's mouth, from the sung words and from the voice itself.

    python3 lipsync.py [song] [--sounds out.json]
        writes lipsync.json: open, wide, pucker and blink, 48 times a second from song time 0, for film.py's lip()
        and sing(). The song defaults to ../remotion/public/song.mp3; --sounds also writes every sound with its
        times, for checking.

Why it is built this way. The owner asked: "how is the lipsync? is it correct? does it look like Polly actually is
singing?" The audit of 13 November 2026 answered: partly. In the middle of a line the shapes and times were right, but
the mouth stayed open through most pauses, opened up to 1.3 s before the voice at line starts, stopped before the last
note did, froze on held notes, lost lip closures and chattered on consonants. Each rule below answers one finding.

The method, in plain words:

 1. WORDS. words.json holds every sung word with the second its first sound is heard and the second its voice stops.
    It began as a speech model's guess on the full mix; every time was then checked against the recording and most
    were moved (words_measured.json keeps old, new and the evidence for each). Where a sound inside a word could be
    measured (the hiss of an S, the silence of a P, the hum of an M, the step to the next syllable) its time is in
    words_measured.json too, as a "mark".
 2. SOUNDS. Each word is spelled into sounds with the CMU pronouncing dictionary and the sounds are laid over the
    word's OWN sung time: marked sounds at their marks, consonants at their usual short length, and only the word's
    last vowel takes whatever time is left, which is how a singer holds a note.
 3. SHAPES. Each sound has a mouth: how open, how wide, how puckered. A diphthong ("light", "name", "no") moves to
    its second vowel at its end. Tongue consonants do not shut the jaw: it stays near the vowels on either side.
    M, B and P shut the lips completely, long enough for a 12-pictures-a-second shot always to catch it, and nothing
    else shuts them inside a line.
 4. VOICE. How far a vowel opens follows the voice's own level: the pitched energy in the centre of the stereo
    picture (where the lead voice sits, and little of the band). A loud note is shown at 0.8 to 0.9 of full, a fading
    note closes with the voice, and between lines the mouth is at rest. No separation model is used (their licences
    are not clearly commercial): only numpy, scipy and librosa.
 5. LEAD. Everything is written 75 ms early, so the mouth is in position before the sound is heard.
 6. BREATH. Where an inhale is audible in a long pause the lips part a little, and only there.

The opening written here is multiplied by 1.55 and clipped at 1 in film.py's sing(); numbers called "shown" below are
after that.
"""
import json, sys, os, random
import numpy as np, librosa, pronouncing
from scipy.ndimage import median_filter

HERE = os.path.dirname(os.path.abspath(__file__))
ARGS = sys.argv[1:]
SOUNDS_OUT = ARGS.pop(ARGS.index('--sounds') + 1) if '--sounds' in ARGS else None
ARGS = [a for a in ARGS if a != '--sounds']
SONG = ARGS[0] if ARGS else os.path.join(HERE, '..', 'remotion', 'public', 'song.mp3')

RATE = 48                 # values a second in lipsync.json
FILM_GAIN = 1.55          # sing() in film.py: shown opening = min(1, open * 1.55)
# LEAD. The audit found no lead at all: the mouth arrived with or after the sound. A drawn mouth should be in place
# about a frame or two ahead. Each picture shows the face at the START of its 83 ms hold (so on screen it is on
# average 42 ms old), and the film's sound was measured 43 ms late in the encoded file: those two cancel. So the
# whole lead is written into the curves: 75 ms, the middle of the 70-80 ms asked for. If a later encode loses the
# 43 ms, 12-a-second shots still lead by about 33 ms on average instead of trailing.
LEAD = 0.075
REST_GAP = 0.20           # a silence shorter than this inside a line is a stop consonant's hold, not a rest
SHUT = 0.146              # M, B, P: lips shut for 7 values = 125 ms from first to last, so a 12-a-second picture always lands on it
RELEASE = 1.6             # a vowel's opening falls no faster than this a second with the level (a breathy "Knives" drops 15 dB in 0.1 s; a jaw does not)

# ------------------------------------------------------------------ the sounds and their mouths
# Vowels: (open, wide, pucker), open as SHOWN on a loud note. The audit found AA, AE and AY all pinned at full by the
# 1.55 gain ("held notes freeze at full opening"): the gain is now part of these numbers, the largest is 0.9, and the
# voice's level moves the mouth below that.
VOWEL = {
    'AA': (0.90, 0.15, 0.0), 'AE': (0.84, 0.45, 0.0), 'AH': (0.74, 0.20, 0.0), 'EH': (0.64, 0.65, 0.0), 'IH': (0.50, 0.70, 0.0),
    'IY': (0.40, 1.00, 0.0), 'AO': (0.80, 0.0, 0.55), 'UW': (0.46, 0.0, 0.90), 'UH': (0.50, 0.0, 0.70), 'ER': (0.50, 0.0, 0.40),
    'AY': (0.86, 0.40, 0.0), 'EY': (0.62, 0.70, 0.0), 'OW': (0.68, 0.0, 0.70), 'OY': (0.70, 0.0, 0.70), 'AW': (0.86, 0.10, 0.20),
}
# Where a diphthong ends ("the mouth is frozen through long notes: no end of the diphthong"): the last part of the
# vowel glides here.
GLIDE = {'AY': (0.50, 0.80, 0.0), 'EY': (0.44, 0.90, 0.0), 'OW': (0.44, 0.0, 0.95), 'OY': (0.45, 0.80, 0.0), 'AW': (0.42, 0.0, 0.90)}
STRESS = {'1': 1.0, '2': 0.92, '0': 0.80}       # an unstressed syllable opens less ("the -est of darkest opens as far as dark")
# Consonants: own opening as shown, then wide and pucker; None = the lips keep the shape of the vowels around them.
CONS = {
    'M': (0.0, None, None), 'B': (0.0, None, None), 'P': (0.0, None, None),
    'F': (0.17, 0.35, 0.0), 'V': (0.17, 0.35, 0.0),
    'W': (0.30, 0.0, 0.90), 'R': (0.36, 0.0, 0.35), 'Y': (0.32, 0.70, 0.0),
    'S': (0.20, 0.55, 0.0), 'Z': (0.20, 0.55, 0.0), 'SH': (0.30, 0.0, 0.55), 'ZH': (0.30, 0.0, 0.55), 'CH': (0.30, 0.0, 0.55), 'JH': (0.30, 0.0, 0.55),
    'L': (0.42, None, None), 'N': (0.30, None, None), 'NG': (0.36, None, None), 'T': (0.28, None, None), 'D': (0.28, None, None),
    'TH': (0.30, None, None), 'DH': (0.30, None, None), 'K': (0.40, None, None), 'G': (0.40, None, None), 'HH': (0.45, None, None),
    '-': (0.28, None, None),                     # the short silence of a stop between two words (the jaw waits between its neighbours)
}
LIPS = {'M', 'B', 'P'}
# NO CHATTER. The audit: "the jaw hits every consonant", 20 of 26 tongue consonants between open vowels pulled the
# opening under 0.45. A tongue consonant between two vowels now keeps at least this share of their mean opening
# (0.6 as the checker simulated; a hiss is sung with the teeth closer, so 0.4).
KEEP = dict({p: 0.6 for p in ('T', 'D', 'N', 'L', 'K', 'G', 'NG', 'TH', 'DH', 'R', 'Y', 'HH', '-')},
            **{p: 0.4 for p in ('S', 'Z', 'SH', 'ZH', 'CH', 'JH', 'W')})
# How long a sound usually is when nothing was measured (seconds). Vowels before the last are sung short or long by
# their stress; the word's last vowel has no length of its own: it is held for whatever is left.
LENGTH = dict({p: 0.07 for p in ('P', 'B', 'T', 'D', 'K', 'G', 'F', 'V', 'TH', 'DH', 'HH', 'L', 'R', 'W', 'Y')},
              **{p: 0.08 for p in ('M', 'N', 'NG')}, **{p: 0.13 for p in ('S', 'Z', 'SH', 'ZH')}, **{p: 0.12 for p in ('CH', 'JH')})
VOWEL_LENGTH = {'1': 0.24, '2': 0.20, '0': 0.14}
SPELL = {'gaslights': 'G AE1 S L AY2 T S', 'whitechapel': 'W AY1 T CH AE2 P AH0 L', 'cobblestone': 'K AA1 B AH0 L S T OW2 N',
         'hats': 'HH AE1 T S', 'and': 'AE1 N D'}


def sounds(word):
    """A word's sounds, each with its stress mark ('' on a consonant)."""
    ph = SPELL[word].split() if word in SPELL else (pronouncing.phones_for_word(word) or [''])[0].split()
    if not ph: ph = [{'a': 'AE1', 'e': 'EH1', 'i': 'IH1', 'o': 'OW1', 'u': 'UH1'}.get(c, 'T') for c in word]
    return [(p.rstrip('012'), p[-1] if p[-1] in '012' else '') for p in ph]


words = json.load(open(os.path.join(HERE, 'words.json')))
measured = json.load(open(os.path.join(HERE, 'words_measured.json')))
marks = {}
for m in measured['marks']:
    assert words[m['word']][2] == m['text'], ('a mark no longer sits on its word', m)
    marks.setdefault(m['word'], {})[m['sound']] = m


def lay(t0, t1, ph, mk):
    """The start of every sound of one word, and the word's end.
    The audit: sounds were spread over a span stretched to the next word, so 19 of 101 inner consonants came over
    0.1 s late and the P of the last "grapple" 3.9 s early. Now: measured sounds sit at their marks; between marks the
    consonants take their usual length and the vowels the rest; the extra goes to the word's LAST vowel only."""
    n = len(ph); at = [None] * (n + 1); at[0], at[n] = t0, t1
    for k, m in mk.items():
        assert ph[k][0] == m['phone'], ('mark names another sound', m, ph)
        at[k] = m['start']                                       # (a first sound may be marked before the word: lips shut ahead of a B)
    for k, m in mk.items():
        if 'end' in m and k + 1 < n and at[k + 1] is None: at[k + 1] = m['end']
    last_vowel = max((k for k, (p, s) in enumerate(ph) if p in VOWEL), default=None)
    p = 0
    while p < n:
        q = next(k for k in range(p + 1, n + 1) if at[k] is not None)
        span = at[q] - at[p]; ks = list(range(p, q))
        nom = {k: (VOWEL_LENGTH[ph[k][1] or '1'] if ph[k][0] in VOWEL else LENGTH[ph[k][0]]) for k in ks}
        vow = [k for k in ks if ph[k][0] in VOWEL]; cons = sum(nom[k] for k in ks if k not in vow); vnom = sum(nom[k] for k in vow)
        if not vow: d = {k: nom[k] * span / max(cons, 1e-6) for k in ks}
        elif span - cons >= vnom:                                 # room to spare: the held vowel takes it
            d = dict(nom); extra = span - cons - vnom
            if last_vowel in vow: d[last_vowel] += extra
            else:
                for k in vow: d[k] += extra * nom[k] / vnom
        elif span - cons >= 0.5 * vnom:                           # a little tight: the vowels give way
            d = dict(nom)
            for k in vow: d[k] = nom[k] * (span - cons) / vnom
        else:                                                     # very tight: everything shrinks alike
            f = span / (cons + 0.5 * vnom); d = {k: nom[k] * (0.5 if k in vow else 1.0) * f for k in ks}
        t = at[p]
        for k in ks[:-1]: t += d[k]; at[k + 1] = t
        p = q
    assert all(b >= a - 1e-9 for a, b in zip(at, at[1:])), ('sounds out of order', ph, at)
    return at


# every sound of the song, in order: a = when it starts to be heard, b = when it stops
song = []
for i, (t0, t1, text, _) in enumerate(words):
    word = ''.join(c for c in text.lower() if c.isalpha())
    if not word: continue
    ph = sounds(word); mk = marks.get(i, {}); at = lay(t0, t1, ph, mk)
    for k, (p, s) in enumerate(ph):
        m = mk.get(k, {})
        song.append({'word': i, 'text': text, 'p': p, 'stress': s, 'a': at[k], 'b': at[k + 1], 'first': k == 0, 'gain': m.get('gain'),
                     'shut': (m['start'], m['end']) if p in LIPS and 'end' in m else None})
for s, nx in zip(song, song[1:]): s['b'] = min(s['b'], nx['a'])     # lips shutting ahead of a B may take the end of the sound before
# lines: the sounds between two rests. A shorter silence between words (the hold of "Jack" before "the") is one more
# consonant of the line, so the jaw does not snap shut for it.
flow = []
for s in song:
    if flow and 1e-6 < s['a'] - flow[-1]['b'] < REST_GAP:
        flow.append({'word': s['word'], 'text': '', 'p': '-', 'stress': '', 'a': flow[-1]['b'], 'b': s['a'], 'first': False, 'gain': None, 'shut': None})
    flow.append(s)
line = 0
for k, s in enumerate(flow):
    if k and s['a'] - flow[k - 1]['b'] >= REST_GAP: line += 1
    s['line'] = line


# ------------------------------------------------------------------ the voice's level
def voice_level(path):
    """Seconds, and the lead voice's level in dB, 100 times a second.
    The audit: the old level was the whole mix in 350-3200 Hz, band included (0.48 inside words, 0.44 between them),
    and its clock ran 0.08 % slow. The lead voice is mixed to the centre: keep only the bins where left and right
    agree, and of those only the peaks standing 2.5 times above their surroundings (pitched partials, not drums or
    breath), 250-3800 Hz. Frame times are exact (frame * hop / rate)."""
    y, sr = librosa.load(path, sr=24000, mono=False)
    hop = 240
    left, right = (librosa.stft(c, n_fft=2048, hop_length=hop) for c in y)
    agree = 2 * np.real(left * np.conj(right)) / (np.abs(left) ** 2 + np.abs(right) ** 2 + 1e-9)
    centre = np.abs(left + right) / 2 * np.clip((agree - 0.7) / 0.3, 0, 1) ** 2
    f = librosa.fft_frequencies(sr=sr, n_fft=2048)
    centre = centre[(f > 250) & (f < 3800)]
    peaks = np.where(centre > 2.5 * median_filter(centre, size=(25, 1)), centre, 0.0)
    db = 10 * np.log10((peaks ** 2).mean(axis=0) + 1e-9)
    return np.arange(len(db)) * hop / sr, db, y.shape[1] / sr


def smooth(a, k):
    w = np.hanning(k + 2)[1:-1]; return np.convolve(a, w / w.sum(), mode='same')


def ease(x):
    x = np.clip(x, 0.0, 1.0); return x * x * (3 - 2 * x)


frame_t, level_db, seconds = voice_level(SONG)
n = int(seconds * RATE) + 1
heard = np.arange(n) / RATE + LEAD          # LEAD: value k is the mouth for the sound heard LEAD seconds after it is shown
level = np.interp(heard, frame_t, smooth(level_db, 15))        # 0.15 s: the note's swell and fade, not its vibrato


def span(s):
    """The values (indices) that show sound s."""
    return int(np.ceil((s['a'] - LEAD) * RATE - 1e-6)), int(np.ceil((s['b'] - LEAD) * RATE - 1e-6))


# ------------------------------------------------------------------ the curves
open_ = np.zeros(n); wide = np.zeros(n); puck = np.zeros(n); sung = np.zeros(n, bool); lips_free = np.zeros(n, bool)
vowels = [s for s in flow if s['p'] in VOWEL]
for s in vowels:
    a, b = span(s); s['ref'] = np.percentile(level[a:b], 90) if b > a else -90.0
for s in vowels:                             # the level at which this vowel counts as fully sung: its own loud level, but a vowel sung
                                             # more than 10 dB under its word's loudest (18 dB under its line's) opens less than they do
    word_ref = max(v['ref'] for v in vowels if v['word'] == s['word']); line_ref = max(v['ref'] for v in vowels if v['line'] == s['line'])
    s['ref'] = max(s['ref'], max(word_ref, line_ref - 8.0) - 10.0)

# REST and HELD NOTES. The audit: open = shape * (0.55 + 0.45 * level) could never close the mouth (0.85 of the
# shape in total silence), it was open through 81 % of the pauses, and held notes sat frozen at full. Now the voice's
# level IS the opening of a vowel, with no floor: at the vowel's own loud level the shape is whole, 6 dB under it
# 0.84 of it, 12 dB under half, 24 dB under it the mouth is shut. It opens at once with a rising voice and falls no
# faster than RELEASE. Words also end where the voice ends (words.json), so where the band hides a fading note the
# mouth still closes on time.
def follows(lev, ref): return ease((lev - ref + 24.0) / 24.0)


for s in vowels:
    a, b = span(s)
    if b <= a: continue
    t = heard[a:b]; dur = max(s['b'] - s['a'], 1e-3)
    glide = ease((t - (s['b'] - np.clip(0.3 * dur, 0.08, 0.45))) / np.clip(0.3 * dur, 0.08, 0.45)) if s['p'] in GLIDE else np.zeros(b - a)
    v0 = np.array(VOWEL[s['p']]); v1 = np.array(GLIDE.get(s['p'], VOWEL[s['p']]))
    shape = v0[None, :] + (v1 - v0)[None, :] * glide[:, None]
    if s['gain']: g = np.linspace(s['gain'][0], s['gain'][1], b - a)          # set by hand where the level cannot tell (words_measured.json)
    else:
        g = follows(level[a:b], s['ref'])
        g = np.array([g[k:k + 7].max() for k in range(b - a)])               # the mouth opens ahead of a rising voice; it closes with a falling one
        for k in range(1, b - a): g[k] = max(g[k], g[k - 1] - RELEASE / RATE)  # ... but a jaw is not a loudness meter
    open_[a:b] = shape[:, 0] * STRESS[s['stress'] or '1'] * g; wide[a:b] = shape[:, 1]; puck[a:b] = shape[:, 2]
    sung[a:b] = True; s['in'] = open_[a:min(a + 3, b)].max(); s['out'] = open_[max(a, b - 3):b].mean()
    s['top'] = float(shape[:, 0].max() * STRESS[s['stress'] or '1'])

for k, s in enumerate(flow):                 # consonants
    if s['p'] in VOWEL: continue
    a, b = span(s); sung[a:b] = True
    before = next((v for v in reversed(flow[:k]) if v['p'] in VOWEL and v['line'] == s['line'] and 'out' in v), None)
    after = next((v for v in flow[k + 1:] if v['p'] in VOWEL and v['line'] == s['line'] and 'in' in v), None)
    own, w, p = CONS[s['p']]
    if s['p'] == 'HH' and after: o = 0.8 * after['in']                       # an H is breath through the next vowel's mouth
    elif before and after:                                                    # between two vowels: NO CHATTER (see KEEP); F and V stay lip to teeth
        o = max(own, KEEP[s['p']] * (before['out'] + after['in']) / 2) if s['p'] in KEEP else own
        o = min(o, max(before['top'], after['top']))
    elif after: o = min(own, after['top'])                                    # opening a line: its own small shape
    elif before: o = min(own, before['out'])                                  # ending a line: it closes with the fading voice
    else: o = own * 0.5
    open_[a:b] = s['open'] = o
    if before and not after and s['p'] in ('L', 'N', 'NG', 'R') and b > a:    # ... and a hummed last L or N fades as the hum does, without reopening
        open_[a:b] = o * np.minimum.accumulate(follows(level[a:b], before['ref']))
    if w is None: lips_free[a:b] = True
    else: wide[a:b] = w; puck[a:b] = p
for k, s in enumerate(flow):                 # the silent hold of a stop between two words: the jaw waits where its neighbours are
    if s['p'] == '-':
        a, b = span(s); val = lambda x, side: x.get(side, x.get('open', 0.0)) if x['p'] not in LIPS else None
        near = [v for v in (val(flow[k - 1], 'out'), val(flow[k + 1], 'in')) if v is not None]
        if near: open_[a:b] = s['open'] = sum(near) / len(near)
# Inside a line the mouth does not shut between two sounds unless the lips do: a vowel that fades before a consonant
# ("Knives", "work") stays at least as open as that consonant. At the END of a line nothing holds it: the tail closes.
for k, s in enumerate(flow[:-1]):
    nx = flow[k + 1]
    if s['p'] in VOWEL and 'top' in s and nx['line'] == s['line'] and nx['p'] not in VOWEL and nx['p'] not in LIPS:
        a, b = span(s); open_[a:b] = np.maximum(open_[a:b], min(nx['open'], s['top']))
# lips with no shape of their own (T, K, N, M ...) keep moving between the shapes on either side
fixed = np.flatnonzero(~lips_free)
wide = np.interp(np.arange(n), fixed, wide[fixed]); puck = np.interp(np.arange(n), fixed, puck[fixed])

open_ = smooth(open_, 5); wide = smooth(wide, 7); puck = smooth(puck, 7)     # about 0.1 s: lips do not teleport

# CLOSURES. The audit: M, B, P were keyed for 62-83 ms against one picture every 83 ms, so 6 of 26 were never shown
# shut, several sat where the stretched word put them (the M of "name" 0.94 s late), and the last word shut the lips
# at 119.4 where the voice makes no break. Each is now at its measured time where there is one, fully shut for SHUT
# seconds or more, and nothing else in a sung line reaches zero.
shut_at = []
for k, s in enumerate(flow):
    if s['p'] not in LIPS: continue
    c0, c1 = s['shut'] or (s['a'], s['b'])
    if not s['shut'] and s['first'] and (k == 0 or flow[k - 1]['line'] != s['line'] or flow[k - 1]['p'] == '-'):
        c0, c1 = s['a'] - 0.09, s['a'] + 0.03                                 # a B or P that opens a word: the lips are shut just before it sounds
    need = SHUT - (c1 - c0)
    if need > 0:                                                              # too short to be seen: the longer neighbour gives the time
        prev = flow[k - 1] if k and flow[k - 1]['line'] == s['line'] else None
        nxt = flow[k + 1] if k + 1 < len(flow) and flow[k + 1]['line'] == s['line'] else None
        back = 1.0 if prev is None else 0.0 if nxt is None else (prev['b'] - prev['a']) / max(prev['b'] - prev['a'] + nxt['b'] - nxt['a'], 1e-6)
        c0, c1 = c0 - need * back, c1 + need * (1 - back)
    a, b = int(np.ceil((c0 - LEAD) * RATE - 1e-6)), int(np.floor((c1 - LEAD) * RATE + 1e-6)) + 1
    open_[a:b] = 0.0; shut_at.append((s['text'], s['p'], round(c0, 3), round(c1, 3)))
    for j in (a - 1, b):
        if 0 <= j < n: open_[j] *= 0.5

# BREATH. The audit: there is no breath before a phrase; about 20 inhales are audible. The lips part a little
# (0.14 shown: under the 0.15 at which a word counts as begun, so a breath is never read as an early word) for at most
# 0.34 s where an inhale is heard, and only in a rest of 0.8 s or more so that the mouth still rests for most of it.
resting = ~sung
breaths = []
for b0, b1, note in measured['breaths']:
    b0 = max(b0, b1 - 0.34)
    a, b = int(round((b0 - LEAD) * RATE)), int(round((b1 - LEAD) * RATE))
    lo = a
    while lo > 0 and resting[lo - 1]: lo -= 1
    hi = b
    while hi < n and resting[hi]: hi += 1
    if not resting[a:b].all() or (hi - lo) / RATE < 0.8 or (a - lo) / RATE < 0.12: continue
    bump = np.sin(np.linspace(0, np.pi, b - a + 2)[1:-1]) ** 0.7
    open_[a:b] = np.maximum(open_[a:b], 0.14 * bump); wide[a:b] = np.maximum(wide[a:b], 0.12 * bump)
    breaths.append((round(b0, 2), round(b1, 2), note))

open_ = np.clip(open_, 0.0, 1.0) / FILM_GAIN; wide = np.clip(wide, 0.0, 1.0); puck = np.clip(puck, 0.0, 1.0)
open_[open_ < 0.004] = 0.0; wide[wide < 0.004] = 0.0; puck[puck < 0.004] = 0.0

# blinks: one every three to five seconds, some in pairs (the same eyes as before: this rebuild is of the mouth only)
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
if SOUNDS_OUT:
    json.dump({'lead': LEAD, 'sounds': [{k: s[k] for k in ('word', 'text', 'p', 'a', 'b', 'line')} for s in flow], 'shut': shut_at, 'breaths': breaths},
              open(SOUNDS_OUT, 'w'))

shown = np.minimum(1.0, open_ * FILM_GAIN); first, last = span(flow[0])[0], span(flow[-1])[1]
print('lipsync:', n, 'values;', len(song), 'sounds in', len(words), 'words and', line + 1, 'lines; lead', int(LEAD * 1000), 'ms')
print('  from first to last word the mouth is at rest (shown < 0.08)', round(float((shown[first:last] < 0.08).mean()) * 100, 1),
      '% of the time, above 0.3', round(float((shown[first:last] > 0.3).mean()) * 100, 1), '%, largest shown', round(float(shown.max()), 2))
print('  lips shut for', len(shut_at), 'M, B, P; breaths drawn at', ', '.join(f'{b0}-{b1}' for b0, b1, _ in breaths))
