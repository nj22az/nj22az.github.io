#!/usr/bin/env python3
"""3D-figurer till vecka 41: renderar modellerna i sjoskolan/figurer3d (three.js, headless Chromium) och sätter
etiketterna med kursens typsnitt. Ankarpunkterna från renderingen talar om var etiketterna ska sitta.

    python3 sjoskolan/verktyg/figurer/figurer3d.py <utmapp>

Skriver v41_01_s04_stjarna.png, v41_01_s06_generator_sinus.png, v41_02_s21_plint3d.png och v41_02_s23_transformator3d.png.
Kräver att sjoskolan/figurer3d/rendera.js är byggd (node sjoskolan/figurer3d/tools/build.mjs).
"""
import json, math, socket, subprocess, sys, time
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

SJO = Path(__file__).resolve().parents[2]
REPO = SJO.parent
UT = Path(sys.argv[1]); UT.mkdir(parents=True, exist_ok=True)
RAW = UT / 'raa'; RAW.mkdir(exist_ok=True)
FONT = '/usr/share/fonts/truetype/crosextra/Carlito-Regular.ttf'
FONTB = '/usr/share/fonts/truetype/crosextra/Carlito-Bold.ttf'
BLA, INK, GRA = (6, 79, 145), (22, 50, 72), (107, 107, 107)
FAS = {'L1': (6, 79, 145), 'L2': (200, 100, 30), 'L3': (14, 124, 90), 'N': (110, 122, 132)}
f = lambda s, b=False: ImageFont.truetype(FONTB if b else FONT, s)


def rendera(jobb):
    s = socket.socket(); s.bind(('127.0.0.1', 0)); port = s.getsockname()[1]; s.close()
    server = subprocess.Popen([sys.executable, '-m', 'http.server', str(port)], cwd=REPO, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    try:
        time.sleep(1)
        rot = subprocess.run(['npm', 'root', '-g'], capture_output=True, text=True, check=True).stdout.strip()
        subprocess.run(['node', str(SJO / 'figurer3d' / 'tools' / 'rendera.cjs'), rot, str(RAW), f'http://127.0.0.1:{port}', *jobb], check=True)
    finally:
        server.terminate()


def las(namn):
    return Image.open(RAW / f'{namn}.png').convert('RGB'), json.loads((RAW / f'{namn}.json').read_text())


def text_sub(d, xy, bas, sub='', storlek=40, farg=INK, fet=False, ankare='la'):
    """Text med nedsänkt index (U + L), som kursens U_{L}."""
    fb, fs = f(storlek, fet), f(int(storlek * 0.68), fet)
    wb = d.textlength(bas, font=fb); ws = d.textlength(sub, font=fs) if sub else 0
    x, y = xy
    if ankare[0] == 'm': x -= (wb + ws) / 2
    if ankare[0] == 'r': x -= wb + ws
    if ankare[1] == 'm': y -= storlek * 0.55
    d.text((x, y), bas, font=fb, fill=farg)
    if sub: d.text((x + wb, y + storlek * 0.42), sub, font=fs, fill=farg)
    return wb + ws


def pil(d, a, b, farg, w=4, spets=16, dubbel=False):
    d.line([a, b], fill=farg, width=w)
    def huvud(p, q):
        v = math.atan2(p[1] - q[1], p[0] - q[0])
        d.polygon([p, (p[0] - spets * math.cos(v - 0.4), p[1] - spets * math.sin(v - 0.4)), (p[0] - spets * math.cos(v + 0.4), p[1] - spets * math.sin(v + 0.4))], fill=farg)
    huvud(b, a)
    if dubbel: huvud(a, b)


def beskar(im, marg=30):
    import PIL.ImageOps
    bb = PIL.ImageOps.invert(im.convert('L')).point(lambda v: 255 if v > 8 else 0).getbbox()
    x0, y0, x1, y1 = bb
    return (max(0, x0 - marg), max(0, y0 - marg), min(im.width, x1 + marg), min(im.height, y1 + marg))


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
svg = RAW / 'sinus.svg'; svg.write_text(sv.sinus())
rot = subprocess.run(['npm', 'root', '-g'], capture_output=True, text=True, check=True).stdout.strip()
k = RAW / 'r.cjs'; k.write_text(sv.RITA); subprocess.run(['node', str(k), rot, str(svg)], check=True)
sin = Image.open(RAW / 'sinus.png').convert('RGB')
h = 900
gen = gen.resize((int(gen.width * h / gen.height), h)); sin = sin.resize((int(sin.width * h / sin.height), h))
ut = Image.new('RGB', (gen.width + sin.width + 60, h + 100), 'white'); ut.paste(gen, (0, 0)); ut.paste(sin, (gen.width + 60, 0))
d = ImageDraw.Draw(ut)
d.text((gen.width / 2, h + 14), 'Spolarna sitter 120° isär', font=f(56), fill=INK, anchor='ma')
d.text((gen.width + 60 + sin.width / 2, h + 14), 'Rotorn i bilden: L1 har sitt toppvärde', font=f(56), fill=INK, anchor='ma')
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
