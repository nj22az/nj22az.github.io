#!/usr/bin/env python3
"""Soundtrack for a short: a calm chiptune loop, talk blips (one per vowel) and a click at every new beat.

Standard library only. Reads the timeline as JSON from render.cjs:
    python3 audio.py timeline.json out.wav [--no-talk]
{ "duration": 49.0, "lines": [{"at": 0.2, "to": 4.1, "text": "..."}], "cuts": [0, 8, 19] }

--no-talk gives music only, for recording your own voice-over on top.
"""
import json, math, sys, wave, array

SR = 22050
VOWELS = set('aeiouyAEIOUY0123456789')


def note(n):
    """MIDI note number to frequency."""
    return 440.0 * 2 ** ((n - 69) / 12)


def main():
    src, dst = sys.argv[1], sys.argv[2]
    talk_blips = '--no-talk' not in sys.argv
    d = json.load(open(src, encoding='utf-8'))
    n = int((d['duration'] + 0.3) * SR)
    buf = array.array('f', bytes(4 * n))

    # Is someone talking at time t? Used to duck the music under lines.
    talk = array.array('b', bytes(n))
    for ln in d['lines']:
        for i in range(int(ln['at'] * SR), min(n, int(ln['to'] * SR))):
            talk[i] = 1

    # Music: 104 bpm, A minor pentatonic. Bass (triangle) and arpeggio (narrow pulse).
    beat = 60 / 104
    bass = [45, 45, 41, 43]                   # A2 A2 F2 G2, one note per bar
    chord = {45: [57, 60, 64, 67], 41: [53, 57, 60, 64], 43: [55, 59, 62, 67]}
    fade_in, fade_out = 0.6, 1.2
    duck = 1.0
    for i in range(n):
        t = i / SR
        bar = int(t / (4 * beat)) % 4
        root = bass[bar]
        # triangle
        fb = note(root)
        ph = (t * fb) % 1.0
        tri = 4 * abs(ph - 0.5) - 1
        # arpeggio in eighth notes with a short decay
        e8 = t / (beat / 2)
        k = int(e8)
        pos = e8 - k
        fa = note(chord[root][k % 4])
        pul = 1.0 if (t * fa) % 1.0 < 0.125 else -1.0
        env = math.exp(-pos * 5)
        m = 0.55 * tri + 0.35 * pul * env
        # soft fade in and out, and gliding ducking under speech
        target = 0.45 if talk[i] else 1.0
        duck += (target - duck) * 0.0008
        g = min(1.0, t / fade_in, max(0.0, (d['duration'] - t) / fade_out))
        buf[i] = m * 0.085 * duck * g

    def blip(t0, f, dur, vol, shape='sq'):
        a = int(t0 * SR)
        for j in range(int(dur * SR)):
            if a + j >= n:
                break
            tt = j / SR
            env = min(1.0, tt / 0.004) * math.exp(-tt * 38)
            if shape == 'sq':
                v = 1.0 if (tt * f) % 1.0 < 0.5 else -1.0
            else:
                v = math.sin(2 * math.pi * f * tt)
            buf[a + j] += v * env * vol

    if talk_blips:
        for ln in d['lines']:
            txt = ln['text'].replace('_{', '').replace('}', '')
            span = (ln['to'] - ln['at']) * 0.8
            step = span / max(1, len(txt))
            question = txt.rstrip().endswith('?')
            for c, ch in enumerate(txt):
                if ch not in VOWELS:
                    continue
                h = (ord(ch) * 7919 + c * 104729) % 97 / 97
                f = 150 * (1 + 0.28 * h)
                if question and c > len(txt) * 0.8:
                    f *= 1.25
                blip(ln['at'] + c * step, f, 0.06, 0.11)

    for c in d['cuts'][1:]:
        # short click-sweep at each new beat
        a = int(c * SR)
        for j in range(int(0.07 * SR)):
            if a + j >= n:
                break
            tt = j / SR
            f = 900 - 5000 * tt
            buf[a + j] += math.sin(2 * math.pi * f * tt) * math.exp(-tt * 45) * 0.12

    peak = max(1e-6, max(abs(x) for x in buf))
    gain = min(1.0, 0.89 / peak)
    out = array.array('h', (int(max(-1, min(1, x * gain)) * 32767) for x in buf))
    with wave.open(dst, 'wb') as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(out.tobytes())


if __name__ == '__main__':
    main()
