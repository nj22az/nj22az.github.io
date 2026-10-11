#!/usr/bin/env python3
"""3D-figurer till vecka 41: renderar modellerna i sjoskolan/figurer3d (three.js, headless Chromium) och sätter
etiketterna med kursens typsnitt. Ankarpunkterna från renderingen talar om var etiketterna ska sitta.

    python3 sjoskolan/verktyg/figurer/figurer3d.py <utmapp>

Skriver v41_01_s04_stjarna.png, v41_01_s06_generator_sinus.png, v41_02_s21_plint3d.png och v41_02_s23_transformator3d.png.
Kräver att sjoskolan/figurer3d/rendera.js är byggd (node sjoskolan/figurer3d/tools/build.mjs).
"""
import subprocess, sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent))
from PIL import Image, ImageDraw

from fig3d import *  # noqa: F401,F403  (SJO, UT, RAW, rendera, las, text_sub, pil, beskar, f, färger)


rendera(['gen=m=generator&v=0&w=1400&h=1200', 'stj=m=stjarna&w=1000&h=560', 'pY=m=plintY&w=640&h=480',
         'pD=m=plintD&w=640&h=480', 'tr=m=transformator&w=900&h=680'])

# 1. Generatorn bredvid sinuskurvorna (v41_01 bild 6): tre spolar 120° isär ger tre spänningar 120° isär.
im, A = las('gen')
d = ImageDraw.Draw(im)
for fas, (x, y) in ((k, A[k]) for k in ('L1', 'L2', 'L3')):
    text_sub(d, (x, y), fas, storlek=90, farg=FAS[fas], fet=True, ankare='mm')
cx, cy = A['mitt']; r = 300
d.arc([cx - r, cy - r, cx + r, cy + r], start=-90, end=30, fill=INK, width=5)
d.text((cx + r * 0.62, cy - r * 0.95), '120°', font=f(80, True), fill=INK)
x, y = A['N_pol']; d.text((x, y), 'N', font=f(70, True), fill='white', anchor='mm')
d.text((A['rotor'][0], A['rotor'][1] + 80), 'rotor (magnet)', font=f(60), fill=GRA, anchor='ma')
gen = im.crop(beskar(im))
sys.path.insert(0, str(SJO / 'verktyg' / 'ac'))
import scheman_veckor as sv  # noqa: E402
svg = RAW / 'sinus.svg'; svg.write_text(sv.sinus(markor=5))   # L1 = sin ωt har toppen vid 5 ms
rot = subprocess.run(['npm', 'root', '-g'], capture_output=True, text=True, check=True).stdout.strip()
k = RAW / 'r.cjs'; k.write_text(sv.RITA); subprocess.run(['node', str(k), rot, str(svg)], check=True)
sin = Image.open(RAW / 'sinus.png').convert('RGB')
h = 900
gen = gen.resize((int(gen.width * h / gen.height), h)); sin = sin.resize((int(sin.width * h / sin.height), h))
ut = Image.new('RGB', (gen.width + sin.width + 60, h + 100), 'white'); ut.paste(gen, (0, 0)); ut.paste(sin, (gen.width + 60, 0))
d = ImageDraw.Draw(ut)
d.text((gen.width / 2, h + 14), 'Spolarna 120° isär, rotorn vrids medurs', font=f(52), fill=INK, anchor='ma')
d.text((gen.width + 60 + sin.width / 2, h + 14), 'Rotorn i bilden = 5 ms: L1 har sitt toppvärde', font=f(56), fill=INK, anchor='ma')
ut.save(UT / 'v41_01_s06_generator_sinus.png')

# Bild 4, 21 och 23 renderas mindre än generatorn: figuren visas i halva bildbredden och etiketterna ska gå att läsa där.

# 2. Stjärnkopplingen med kabel (v41_01 bild 4): U_L mellan två fasledare, U_F mellan fasledare och N.
im, A = las('stj')
im0 = im; im = Image.new('RGB', (im0.width + 330, im0.height + 110), 'white'); im.paste(im0, (0, 0))
d = ImageDraw.Draw(im)
for fas in ('L1', 'L2', 'L3', 'N'):
    x, y = A[fas]; text_sub(d, (x + 14, y), fas, storlek=44, farg=FAS[fas], fet=True, ankare='lm')
x1, y1 = A['L1']; x2, y2 = A['L2']; xn, yn = A['N']
xa = x1 + 90; pil(d, (xa, y1), (xa, y2), BLA, w=5, dubbel=True); text_sub(d, (xa + 12, (y1 + y2) / 2), 'U', 'L', 46, BLA, ankare='lm')
xb = x1 + 200; pil(d, (xb, y1), (xb, yn), (200, 100, 30), w=5, dubbel=True); text_sub(d, (xb + 12, (y1 + yn) / 2), 'U', 'F', 46, (200, 100, 30), ankare='lm')
x, y = A['stjarna']; d.line([(x, y), (x, im0.height + 30)], fill=GRA, width=3); d.text((max(x - 30, 10), im0.height + 36), 'stjärnpunkten blir N', font=f(42), fill=INK, anchor='la')
x, y = A['generator']; d.text((x, y - 10), 'Generatorn i Y', font=f(42, True), fill=INK, anchor='mb')
im.crop(beskar(im)).save(UT / 'v41_01_s04_stjarna.png')

# 3. Plinten i 3D, Y och Δ (v41_02 bild 21)
delar = []
for namn, titel, lind in (('pY', 'Y (stjärna)', ('lindning: U', 'L', '/√3')), ('pD', 'Δ (triangel)', ('lindning: U', 'L', ''))):
    im, A = las(namn); d = ImageDraw.Draw(im)
    for t in ('W2', 'U2', 'V2', 'U1', 'V1', 'W1'):
        x, y = A[t]; d.text((x, y), t, font=f(34, True), fill=INK, anchor='mm')
    c = im.crop(beskar(im, 20)); im2 = Image.new('RGB', (max(c.width, 400), c.height + 150), 'white'); im2.paste(c, ((im2.width - c.width) // 2, 70)); d = ImageDraw.Draw(im2)
    d.text((im2.width / 2, 10), titel, font=f(48, True), fill=INK, anchor='ma')
    w = d.textlength(lind[0], font=f(42)) + d.textlength(lind[1], font=f(29)) + d.textlength(lind[2], font=f(42))
    x0 = im2.width / 2 - w / 2; y0 = im2.height - 66
    x0 += text_sub(d, (x0, y0), lind[0], lind[1], 42, BLA); d.text((x0, y0), lind[2], font=f(42), fill=BLA)
    delar.append(im2)
h = max(x.height for x in delar); ut = Image.new('RGB', (sum(x.width for x in delar) + 50, h), 'white')
ut.paste(delar[0], (0, 0)); ut.paste(delar[1], (delar[0].width + 50, 0)); ut.save(UT / 'v41_02_s21_plint3d.png')

# 4. Transformatorn med tre ben (v41_02 bild 23)
im, A = las('tr')
pad = Image.new('RGB', (im.width + 400, im.height + 90), 'white'); pad.paste(im, (0, 0)); d = ImageDraw.Draw(pad)
for fas in ('L1', 'L2', 'L3'):
    x, y = A[f'ben_{fas}']; d.text((x, y + 10), fas, font=f(40, True), fill=FAS[fas], anchor='ma')
x, y = A['prim_L3']; tx = im.width + 20
d.line([(x, y), (tx - 10, y - 50)], fill=GRA, width=3); d.text((tx, y - 90), 'primärlindning', font=f(40, True), fill=INK); d.text((tx, y - 46), '6,6 kV, kopplad i Δ', font=f(36), fill=INK)
x, y = A['sek_L3']; d.line([(x, y), (tx - 10, y + 70)], fill=GRA, width=3); d.text((tx, y + 40), 'sekundärlindning', font=f(40, True), fill=INK); d.text((tx, y + 84), '440 V, kopplad i Y', font=f(36), fill=INK)
x, y = A['karna']; d.line([(x, y), (tx - 10, 70)], fill=GRA, width=3); d.text((tx, 40), 'järnkärna, tre ben', font=f(40, True), fill=INK)
y0 = pad.height - 70; x0 = 40
x0 += text_sub(d, (x0, y0), 'Per ben: N', '1', 40, BLA); x0 += text_sub(d, (x0, y0), '/N', '2', 40, BLA)
x0 += text_sub(d, (x0, y0), ' = U', '1,gren', 40, BLA); text_sub(d, (x0, y0), '/U', '2,gren', 40, BLA)
pad.crop(beskar(pad)).save(UT / 'v41_02_s23_transformator3d.png')
print('ok', sorted(p.name for p in UT.glob('*.png')))
