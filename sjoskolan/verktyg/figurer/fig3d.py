"""Gemensamt för 3D-figurerna: rendering i headless Chromium (three.js) och etiketter med kursens typsnitt.
Används av figurer3d.py (vecka 41 del 1 och 2) och figurer3d_del3.py (del 3 och labbstationerna)."""
import json, math, socket, subprocess, sys, time
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

SJO = Path(__file__).resolve().parents[2]
REPO = SJO.parent
UT = Path(sys.argv[1]) if len(sys.argv) > 1 else Path('.')
RAW = UT / 'raa'
FONT = '/usr/share/fonts/truetype/crosextra/Carlito-Regular.ttf'
FONTB = '/usr/share/fonts/truetype/crosextra/Carlito-Bold.ttf'
BLA, INK, GRA = (6, 79, 145), (22, 50, 72), (107, 107, 107)
FAS = {'L1': (6, 79, 145), 'L2': (200, 100, 30), 'L3': (14, 124, 90), 'N': (110, 122, 132)}
f = lambda s, b=False: ImageFont.truetype(FONTB if b else FONT, s)


def rendera(jobb):
    UT.mkdir(parents=True, exist_ok=True); RAW.mkdir(exist_ok=True)
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




def etikett(d, punkt, text_xy, rader, storlek=40, ankare='la', linje=True, farg=None):
    """Etikett med ledlinje till en punkt. rader: [(text, fet)], första raden fet som standard."""
    x, y = text_xy
    if linje and punkt:
        lx = x - 8 if ankare[0] == 'l' else x + 8
        d.line([tuple(punkt), (lx, y + storlek * 0.55)], fill=GRA, width=3)
        d.ellipse([punkt[0] - 6, punkt[1] - 6, punkt[0] + 6, punkt[1] + 6], fill=GRA)
    for i, r in enumerate(rader):
        text, fet = r if isinstance(r, tuple) else (r, i == 0)
        d.text((x, y + i * storlek * 1.15), text, font=f(storlek if i == 0 else int(storlek * 0.88), fet), fill=farg or INK, anchor=ankare[0] + 'a')


def marginal(im, A, v=0, o=0, h=0, n=0):
    """Vit marginal runt bilden; ankarpunkterna flyttas med."""
    ut = Image.new('RGB', (im.width + v + h, im.height + o + n), 'white'); ut.paste(im, (v, o))
    return ut, {k: (p[0] + v, p[1] + o) for k, p in A.items()}


def spalter(im, A, vanster=(), hoger=(), storlek=48, gap=26, o=0, n=0):
    """Etiketter i en vänster- och en högerspalt bredvid bilden, i samma höjdordning som ankarpunkterna.
    vanster/hoger: [(ankare, [rader])]. Första raden fet. Returnerar (bild, ankare) med marginalerna tillagda."""
    b = beskar(im, 12); im = im.crop(b); A = {k: (p[0] - b[0], p[1] - b[1]) for k, p in A.items()}   # modellen fyller bilden
    d0 = ImageDraw.Draw(im)
    bredd = lambda lista: max([max(d0.textlength(r, font=f(storlek if i == 0 else int(storlek * .88), i == 0)) for i, r in enumerate(rader)) for _, rader in lista] or [0])
    v, h = (int(bredd(vanster)) + 70 if vanster else 20), (int(bredd(hoger)) + 70 if hoger else 20)
    # Först lägena (i höjdordning, utan överlapp), sedan så mycket extra höjd som behövs, sist ritningen.
    lagen = []
    for lista, sida in ((vanster, 'v'), (hoger, 'h')):
        y = 10
        for k, rader in sorted(lista, key=lambda x: A[x[0]][1]):
            hojd = storlek * 1.15 * len(rader); y = max(y, A[k][1] - hojd / 2)
            lagen.append((k, rader, sida, y)); y += hojd + gap
    botten = max([y + storlek * 1.15 * len(r) for _, r, _, y in lagen] + [im.height])
    im, A = marginal(im, A, v=v, o=o, h=h, n=n + int(botten - im.height) + 10); d = ImageDraw.Draw(im)
    for k, rader, sida, y in lagen:
        x = v - 40 if sida == 'v' else im.width - h + 40
        etikett(d, A[k], (x, y + o), rader, storlek, ankare='ra' if sida == 'v' else 'la')
    return im, A


def undertext(im, rader, storlek=44, radavstand=60):
    """Bildtext under figuren: rader [(text, fet, färg)] centrerade i en ny vit rand."""
    im, _ = marginal(im, {}, n=int(radavstand * len(rader) + 16)); d = ImageDraw.Draw(im); y = im.height - radavstand * len(rader) - 6
    for text, fet, farg in rader:
        d.text((im.width / 2, y), text, font=f(storlek, fet), fill=farg, anchor='ma'); y += radavstand
    return im
