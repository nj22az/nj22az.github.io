"""The scream at "A scream gets swallowed by the night": made here, not recorded.

    python3 scream.py public/scream.wav

A woman's voice on an open "ah": a buzzing source whose pitch leaps up, holds high with a tremble and breaks as
it falls; three resonances of an open mouth; breath in it. Then the night swallows it: from the first second its
brightness is closed down to a murmur, echoes of a stone street carry it off, and it is gone inside three seconds.
"""
import sys, numpy as np
from scipy import signal
from scipy.io import wavfile

sr = 48000; dur = 3.4; n = int(sr * dur); t = np.arange(n) / sr
rng = np.random.default_rng(1888)
# pitch: a leap, a high held note that trembles, a broken fall
f0 = np.interp(t, [0, 0.07, 0.16, 0.9, 1.35, 1.75, 2.1], [520, 930, 1080, 1120, 1010, 760, 520])
f0 *= 1 + 0.022 * np.sin(2 * np.pi * 6.3 * t) * np.clip(t / 0.4, 0, 1) + 0.012 * signal.lfilter([1], [1, -0.995], rng.standard_normal(n)) / 20
phase = 2 * np.pi * np.cumsum(f0) / sr
src = sum(np.sin(k * phase) / k ** 0.75 for k in range(1, 9))                      # a bright, buzzing source
rough = 1 + 0.35 * np.clip((t - 1.2) / 0.6, 0, 1) * signal.lfilter([1], [1, -0.9], rng.standard_normal(n)) / 3   # the voice breaks as it falls
src = src * rough + 0.25 * rng.standard_normal(n) * np.clip(1 - t / 2.0, 0, 1)
out = np.zeros(n)
for fc, bw, g in ((1050, 180, 1.0), (1650, 220, 0.8), (3000, 320, 0.55), (4100, 400, 0.25)):   # the open mouth
    b, a = signal.iirpeak(fc / (sr / 2), fc / bw); out += g * signal.lfilter(b, a, src)
env = np.clip(t / 0.03, 0, 1) * np.interp(t, [0, 0.9, 1.6, 2.2, dur], [1, 1, 0.6, 0.12, 0])
out *= env
# swallowed: the brightness closes down, block by block, from 7 kHz to a murmur
sw = np.zeros(n); blk = 1024; zi = None
for i in range(0, n, blk):
    tc = i / sr; fc = float(np.interp(tc, [0, 0.75, 1.5, 2.4], [7000, 6000, 1400, 320]))
    b, a = signal.butter(2, fc / (sr / 2))
    if zi is None: zi = signal.lfilter_zi(b, a) * 0
    sw[i:i + blk], zi = signal.lfilter(b, a, out[i:i + blk], zi=zi)
# the street: a few hard echoes off the houses and a tail
wet = sw.copy()
for d, g in ((0.11, 0.42), (0.19, 0.33), (0.31, 0.26), (0.47, 0.2), (0.68, 0.14), (0.93, 0.09)):
    k = int(d * sr); wet[k:] += g * sw[:-k]
tail = signal.fftconvolve(sw, rng.standard_normal(int(1.3 * sr)) * np.exp(-np.arange(int(1.3 * sr)) / (0.33 * sr)), mode='full')[:n]
wet += 0.012 * tail
wet *= np.interp(t, [0, 2.6, dur], [1, 1, 0])
wet /= np.abs(wet).max() * 1.12
pan = np.interp(t, [0, dur], [0.42, 0.58])                                          # it drifts off down the street
st = np.stack([wet * (1 - pan), wet * pan], 1) * 1.6
wavfile.write(sys.argv[1], sr, (np.clip(st, -1, 1) * 32767).astype(np.int16))
print('scream written', dur, 's')
