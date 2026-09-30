#!/usr/bin/env python3
"""3D-figurer till vecka 41 del 3 och labbet: stillbilder av Motorlabbets bänk (sjoskolan/motorlabbet/scen.mjs), så att
presentationen, Labbet.html, labbhandboken och simulatorn visar samma motor, startare och tång.

    python3 sjoskolan/verktyg/figurer/figurer3d_del3.py <utmapp>

Skriver
  v41_03_s06_motor3d.png, v41_03_s07_plint3d.png, v41_03_s17_ovn4_3d.png, v41_03_s21_startare3d.png, v41_03_s22_tang3d.png
  (presentationen) och labbet-station-m.png, labbet-station-s.png, labbet-station-t.png, labbet-fel.png (labbet).
Kräver att sjoskolan/motorlabbet/scen.js är byggd (node sjoskolan/motorlabbet/tools/build.mjs).
"""
import json, sys, urllib.parse
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent))
from PIL import Image, ImageDraw

from fig3d import *  # noqa: F401,F403

SIDA = '/sjoskolan/motorlabbet/rendera.html'
DELTA, Y = ['U1-W2', 'V1-U2', 'W1-V2'], ['W2-U2', 'U2-V2']


def jobb(namn, visa, pos, mal, w, h, fov=30, lock=False, bank=True, **s):
    q = {'visa': visa, 'pos': ','.join(map(str, pos)), 'mal': ','.join(map(str, mal)), 'fov': fov, 'w': w, 'h': h}
    if lock: q['lock'] = 1
    if not bank: q['bank'] = 0
    if s: q['s'] = json.dumps(s)
    return f'{namn}={SIDA}?{urllib.parse.urlencode(q)}'


TOPP = dict(pos=(-6.1, 7.6, 1.3), mal=(-6.1, 2.45, -0.3), w=900, h=720, fov=20)          # plinten uppifrån
TANG = dict(pos=(10.6, 3.3, 7.4), mal=(7.1, 2.0, 1.1), w=400, h=452, fov=29)              # käften snett framifrån
rendera([
    jobb('motor', 'M', (-1.8, 6.4, 9.6), (-5.9, 1.3, 0.2), 760, 553),
    jobb('motor_st', 'M', (-9.8, 5.0, 8.6), (-6.0, 1.4, 0.0), 1100, 800, lock=True),
    jobb('plint', 'M,MM', **TOPP, prob={'rod': 'U1', 'svart': 'U2'}),
    jobb('start', 'S', (1.0, 2.0, 6.5), (1.0, 1.95, -0.5), 600, 667, bank=False),
    *[jobb(f't_{l}', 'T', **TANG, tang={'lage': l, 'pa': True, 'visning': v}) for l, v in (('en', '2,00'), ('tva', '4,00'), ('harnal', '0,00'))],
    jobb('stM', 'M,MM', (-1.2, 6.8, 10.5), (-5.0, 1.2, 0.8), 1200, 800, prob={'rod': 'U1', 'svart': 'V1'}),
    jobb('stS', 'S,SM', (6.8, 6.0, 11.0), (2.1, 1.3, 0.4), 1100, 900, sprob={'rod': '95', 'svart': '96'}),
    jobb('stT', 'T', (11.8, 5.0, 8.8), (7.2, 1.3, 0.9), 1100, 900, tang={'lage': 'en', 'pa': True, 'visning': '2,00'}),
    jobb('fD', 'M', **TOPP, bleck=DELTA), jobb('fSaknas', 'M', **TOPP, bleck=['V1-U2', 'W1-V2']),
    jobb('fY', 'M', **TOPP, bleck=Y), jobb('fLos', 'M', **TOPP, bleck=DELTA, losa=['V1-U2']),
])


def spara(im, namn, marg=30):
    im = im.crop(beskar(im, marg)); im.save(UT / namn); return im


# 1. Motorns delar (v41_03 bild 6)
im, A = las('motor'); im, A = marginal(im, A, v=330, o=30, h=330, n=30); d = ImageDraw.Draw(im)
W = im.width
V = [('flaktkapa', ['fläktkåpa', 'fläkten sitter under']), ('stomme', ['stomme', 'med kylflänsar']), ('fot', ['fot'])]
H = [('lada', ['kopplingslåda', 'med plinten']), ('skylt', ['märkskylt']), ('axel', ['axel med kil']), ('lagerskold', ['lagersköld'])]
for i, (k, rad) in enumerate(V):
    etikett(d, A[k], (310, 90 + i * 180), rad, 40, ankare='ra')
for i, (k, rad) in enumerate(H):
    etikett(d, A[k], (W - 310, 30 + i * 140), rad, 40)
spara(im, 'v41_03_s06_motor3d.png')

# 2. Samma motor med stängd låda och utan etiketter (övning 3.4)
im, A = las('motor_st'); spara(im, 'v41_03_s17_ovn4_3d.png')

# 3. Plinten med ohmmeterns sladdar på U1 och U2; lindningarna inne i motorn streckade (bild 7)
im, A = las('plint'); d = ImageDraw.Draw(im, 'RGBA')
for a, b, farg in (('U1', 'U2', FAS['L1']), ('V1', 'V2', FAS['L2']), ('W1', 'W2', FAS['L3'])):
    (x1, y1), (x2, y2) = A[a], A[b]
    n = 9
    for i in range(n):
        if i % 2 == 0:
            p = (x1 + (x2 - x1) * i / n, y1 + (y2 - y1) * i / n); q = (x1 + (x2 - x1) * (i + 1) / n, y1 + (y2 - y1) * (i + 1) / n)
            d.line([p, q], fill=farg + (230,), width=7)
im, A = marginal(im, A, o=10, n=150); d = ImageDraw.Draw(im)
d.text((im.width / 2, im.height - 136), 'Ohmmetern på U1 och U2 mäter lindningen U1–U2', font=f(38, True), fill=INK, anchor='ma')
d.text((im.width / 2, im.height - 82), 'streckat: lindningarna inne i motorn', font=f(36), fill=GRA, anchor='ma')
spara(im, 'v41_03_s07_plint3d.png', 10)

# 4. Startarens delar (bild 21)
im, A = las('start'); im, A = marginal(im, A, v=430, o=20, h=430, n=20); d = ImageDraw.Draw(im)
W = im.width; x0 = 410; x1 = W - 410
etikett(d, A['K1'], (x0, 122), ['K1: kontaktor', 'slår till motorn'], 36, ankare='ra')
etikett(d, A['sA1'], (x0, 14), ['spolen A1–A2', 'drar kontaktorn'], 36, ankare='ra')
etikett(d, A['ratt'], (x0, 435), ['inställningsratt', 'ställs på märkströmmen'], 36, ankare='ra')
etikett(d, A['F2'], (x0, 558), ['F2: överlastrelä', 'löser ut vid för hög ström'], 36, ankare='ra')
etikett(d, A['s5'], (x1, 14), ['huvudkontakter', '1–2, 3–4, 5–6'], 36)
etikett(d, A['s13'], (x1, 170), ['hjälpkontakt 13–14', 'NO: öppen i vila'], 36)
etikett(d, A['s95'], (x1, 381), ['95–96', 'NC: sluten i vila'], 36)
etikett(d, A['test'], (x1, 558), ['testknapp', 'löser ut reläet'], 36)
spara(im, 'v41_03_s21_startare3d.png')

# 5. Strömtången: en gång, två varv och hårnål (bild 22)
boxar = [beskar(las(f't_{l}')[0], 10) for l in ('en', 'tva', 'harnal')]
ruta = (min(b[0] for b in boxar), min(b[1] for b in boxar), max(b[2] for b in boxar), max(b[3] for b in boxar))
delar = []
for l, rubrik, rad in (('en', 'En gång', 'visar I'), ('tva', 'Två varv', 'visar 2 · I'), ('harnal', 'Hårnål', 'visar 0')):
    im, A = las(f't_{l}'); im = im.crop(ruta)                               # samma utsnitt i alla tre
    ut = Image.new('RGB', (im.width, im.height + 130), 'white'); ut.paste(im, (0, 60))
    d = ImageDraw.Draw(ut); d.text((ut.width / 2, 6), rubrik, font=f(42, True), fill=INK, anchor='ma')
    d.text((ut.width / 2, ut.height - 58), rad, font=f(42), fill=BLA, anchor='ma'); delar.append(ut)
h = max(x.height for x in delar); ut = Image.new('RGB', (sum(x.width for x in delar) + 60, h), 'white'); x = 0
for p in delar: ut.paste(p, (x, 0)); x += p.width + 30
spara(ut, 'v41_03_s22_tang3d.png', 10)

# 6. Stationerna i labbet: korta etiketter, sidan beskriver resten
def station(namn, fil, v, h, etiketter):
    im, A = las(namn); im, A = marginal(im, A, v=v, h=h, o=20, n=20); d = ImageDraw.Draw(im)
    for k, xy, rad, ank in etiketter:
        etikett(d, A[k], (xy[0] if xy[0] >= 0 else im.width + xy[0], xy[1]), rad, 42, ankare=ank)
    spara(im, fil)


station('stM', 'labbet-station-m.png', 380, 380, [('lada', (-360, 40), ['kopplingslåda', 'mätsladdarna på plinten'], 'la'),
        ('skylt', (360, 60), ['märkskylt'], 'ra'), ('mmM', (-360, 520), ['multimeter på Ω'], 'la')])
station('stS', 'labbet-station-s.png', 380, 380, [('K1', (360, 120), ['K1: kontaktor'], 'ra'), ('F2', (360, 420), ['F2: överlastrelä'], 'ra'),
        ('s95', (-360, 300), ['mätsladdarna', 'på 95–96'], 'la'), ('mmS', (-360, 640), ['multimeter på Ω'], 'la')])
station('stT', 'labbet-station-t.png', 380, 380, [('kaft', (360, 120), ['strömtång, DC A', 'sladden genom käften'], 'ra'),
        ('aggregat', (-360, 160), ['aggregat', 'strömgräns 2,0 A'], 'la'), ('minus', (-360, 520), ['labbsladd', 'från + till −'], 'la')])

# 7. Felen i felsökningen (bara labbhandboken): rätt Δ och de tre felen
delar = []
for n, rubrik, rad in (('fD', 'Rätt: Δ', 'tre lodräta bleck'), ('fSaknas', 'Fel 1: bleck saknas', 'U1–W2 borta'),
                       ('fY', 'Fel 2: Y i stället för Δ', 'bleck längs övre raden'), ('fLos', 'Fel 3: lös mutter', 'blecket V1–U2 utan kontakt')):
    im, A = las(n); d = ImageDraw.Draw(im)
    if n == 'fLos':                                                        # ringa in det lösa blecket
        (xa, ya), (xb, yb) = A['V1'], A['U2']; cx, cy = (xa + xb) / 2, (ya + yb) / 2; r = abs(ya - yb) * 0.75
        d.ellipse([cx - r * 0.55, cy - r, cx + r * 0.55, cy + r], outline=(192, 57, 43), width=8)
    im = im.crop(beskar(im, 10))
    ut = Image.new('RGB', (im.width, im.height + 170), 'white'); ut.paste(im, (0, 80)); d = ImageDraw.Draw(ut)
    d.text((ut.width / 2, 10), rubrik, font=f(48, True), fill=INK, anchor='ma'); d.text((ut.width / 2, ut.height - 76), rad, font=f(42), fill=GRA, anchor='ma')
    delar.append(ut)
w, h = delar[0].size; ut = Image.new('RGB', (w * 2 + 60, h * 2 + 60), 'white')
for i, p in enumerate(delar): ut.paste(p, ((i % 2) * (w + 60), (i // 2) * (h + 60)))
spara(ut, 'labbet-fel.png', 10)
print('ok', sorted(p.name for p in UT.glob('*.png')))
