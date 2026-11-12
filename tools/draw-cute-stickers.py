#!/usr/bin/env python3
"""Pocket Camera's sticker friends, drawn in code (the owner, 12 November 2026: "Your python drawing is awesome so you
can draw stickers too", "I like animals like frogs and ducks and rabbits add them too").

Five friends in the hand of the icons and the frames (tools/cute_hand.py: flat colour, round chunky shapes, no
outline), each with its own build and its own way of being, and every sticker one of them up to something: the frog
sips its tea and is not impressed, the duck has had enough, the rabbit has the best or the worst day ever, the cat
pushes the cup off the table, the bear would rather be asleep. (The owner's notes on the way here are in
tools/cute_hand.py: plain things were "a bit too generic", five round balls "lack personality"; of these builds:
"The animals are better".) A few plain bits to wear or to scatter (a crown, sunglasses, hearts) come with them.

Writes camera/stickers/<sheet>/<id>.webp (512 px on the longer side) and <id>.thumb.webp (256 px) and
camera/stickers/<sheet>.json, and adds the sheet to the camera's list (camera/stickers/sheets.json).

    python3 tools/draw-cute-stickers.py [--sheet out.png] [--only sheet,sheet]      # from the repository root
"""
import hashlib
import io
import json
import math
import sys
from pathlib import Path

from PIL import Image

sys.path.insert(0, str(Path(__file__).resolve().parent))
from cute_hand import *                                                            # noqa: E402,F401,F403  (the kit: shapes, faces, the cast)
from cute_hand import ROOT                                                         # noqa: E402

OUT = ROOT / 'camera' / 'stickers'
REGISTRY = OUT / 'sheets.json'
BOX, BOX_DARK = '#dcb684', '#c59a65'


# ---------- things the friends hold ----------
def cup(g, x, y, s=1.0, colour=CORAL, turn=0):
    with g.at(x, y, s, turn):
        g.line(f'M{pt(6, -3.4)}Q{pt(11.5, -3.4)} {pt(11.5, .6)}Q{pt(11.5, 4.4)} {pt(5.6, 3.8)}', colour, 2.3)
        g.fill(f'M{pt(-7.4, -6)}H{7.4}V{.6}A7.4 6.4 0 0 1 {pt(-7.4, .6)}Z', colour)
        g.fill(rrect(-7.4, -7.3, 14.8, 2.8, 1.4), '#f9c0ad')


def steam(g, x, y, s=1.0):
    with g.at(x, y, s):
        g.line(f'M{pt(0, 0)}Q{pt(-3.4, -4)} {pt(0, -8)}T{pt(0, -16)}', STEAM, 2.2)


def camera_toy(g, x, y, s=1.0):
    with g.at(x, y, s):
        g.fill(rrect(-11, -7.5, 22, 15, 3.6) + rrect(-6, -10.4, 9, 5, 2), NAVY)
        g.fill(circle(1, .4, 5.4), WHITE).fill(circle(1, .4, 3.7), INK).fill(circle(2.3, -.9, 1.1), WHITE)
        g.fill(rrect(5.8, -5.6, 3.4, 2.2, 1), SUN)


def confetti(g, spots):
    for n, (x, y) in enumerate(spots):
        colour = (ROSE, SUN, SEA, LEAF, PLUM)[n % 5]
        if n % 3 == 0:
            g.fill(circle(x, y, 1.9), colour)
        else:
            with g.at(x, y, 1, 35 * n):
                g.fill(rrect(-2.6, -1.3, 5.2, 2.6, 1), colour)


def raindrops(g, spots, colour=SEA):
    for x, y in spots:
        g.fill(drop(x, y, 3), colour)


def shadow(g, x, y, w):
    """What is in the air leaves this on the ground."""
    g.fill(ellipse(x, y, w, w * .2), INK, alpha=.14)


# ---------- the friends ----------
def friends():
    d = {}

    def add(key, gloss, draw):
        g = Drawing()
        draw(g)
        d[key] = (gloss, g)

    # The frog: nothing impresses it.
    def frog_tea(g):
        with g.at(50, 96, 1.0):
            frog(g, 'smug', lips='', look=(.7, 0), arms=False)
            cup(g, 0, -55, 1.15)
            limb(g, [(-12, -46), (-9, -53)], FROG_DARK, 5.6)
            limb(g, [(12, -46), (10.5, -51)], FROG_DARK, 5.6)
        steam(g, 88, 34, 1.0)
        steam(g, 95, 42, .7)
    add('frog-tea', 'The frog sips its tea', frog_tea)

    def frog_nice(g):
        with g.at(46, 96, 1.0):
            frog(g, 'smug', hands=((-19, -29), (32, -52)))
            g.line(f'M{pt(32, -54)}L{pt(32.4, -62)}', FROG_DARK, 4.6)
        shines(g, [(90, 26, 7), (96, 44, 4)])
    add('frog-nice', 'The frog approves', frog_nice)

    def frog_shock(g):
        with g.at(50, 96, 1.0):
            frog(g, 'shock', hands=((-26, -60), (26, -60)), lips='shout')
        sweat(g, 91, 22, 1.1, 20)
        sweat(g, 9, 22, .9, -20)
    add('frog-shock', 'The frog cannot believe it', frog_shock)

    def frog_rain(g):
        with g.at(48, 97, .84):
            g.line(f'M{pt(17, -44)}L{pt(14, -98)}', GREEN, 3.2)
            frog(g, 'calm', hands=((-20, -28), (17, -44)))
            g.fill(f'M{pt(-34, -99)}Q{pt(-10, -124)} {pt(34, -113)}Q{pt(56, -106)} {pt(66, -92)}Q{pt(22, -90)} {pt(-34, -99)}Z', LEAF)
            g.line(f'M{pt(-22, -102)}Q{pt(14, -108)} {pt(56, -96)}', GREEN, 2.2)
        raindrops(g, [(8, 34), (94, 44), (6, 62), (90, 70), (82, 6)])
    add('frog-rain', 'The frog under its leaf', frog_rain)

    def frog_love(g):
        with g.at(50, 96, 1.0):
            frog(g, 'love', hands=((-4, -39), (4, -39)))
        hearts(g, [(88, 20, 6.5), (12, 28, 4.6), (94, 42, 3.6)])
    add('frog-love', 'The frog is smitten', frog_love)

    # The duck: short of patience.
    def duck_angry(g):
        with g.at(50, 96, 1.0):
            duck(g, 'grumpy', brows='angry', hands=((-22, -15), (22, -15)))
        vein(g, 83, 20, 1.25)
        puff(g, 14, 40, 1.1, STEAM)
        puff(g, 87, 50, .9, STEAM)
    add('duck-angry', 'The duck has had enough', duck_angry)

    def duck_nope(g):
        with g.at(50, 96, 1.0):
            duck(g, 'deadpan', arms=False)
            limb(g, [(-14, -31), (8, -23.5)], DUCK_DARK, 6.2, hand=False)
            limb(g, [(14, -31), (-8, -23.5)], DUCK_DARK, 6.2, hand=False)
    add('duck-nope', 'The duck says no', duck_nope)

    def duck_ok(g):
        with g.at(48, 96, 1.0):
            duck(g, 'wink', brows='up', hands=((-20, -19), (27, -49)))
        shines(g, [(88, 34, 6.5), (93, 52, 3.8)])
    add('duck-ok', 'The duck allows it', duck_ok)

    def duck_run(g):
        with g.at(54, 95, 1.0, 9):
            duck(g, 'nervous', brows='worried', bill='open', legs='run', hands=((-24, -34), (22, -22)))
        zoom(g, 6, 58, 1.2)
        sweat(g, 22, 22, 1.0, -30)
        sweat(g, 12, 36, .75, -40)
    add('duck-run', 'The duck is late', duck_run)

    def duck_lol(g):
        with g.at(50, 96, 1.0):
            duck(g, 'joy', bill='open', brows='up', hands=((-25, -45), (25, -45)))
        sweat(g, 12, 30, 1.0, -60)
        sweat(g, 88, 30, 1.0, 60)
    add('duck-lol', 'The duck laughs till it cries', duck_lol)

    # The rabbit: the best day ever, or the worst.
    def rabbit_yay(g):
        shadow(g, 50, 97, 15)
        with g.at(50, 90, .86):
            rabbit(g, 'joy', hands=((-22, -62), (22, -62)))
        confetti(g, [(14, 22), (86, 18), (8, 46), (92, 44), (20, 66), (82, 68), (30, 8), (72, 6)])
    add('rabbit-yay', 'The rabbit: best day ever', rabbit_yay)

    def rabbit_cry(g):
        g.fill(ellipse(50, 95.5, 30, 4.4), SEA)
        with g.at(50, 95, .98):
            rabbit(g, 'cry', ears='droop', hands=((-15, -26), (15, -26)))
            g.line(f'M{pt(-14, -59)}Q{pt(-27, -63)} {pt(-30, -44)}M{pt(14, -59)}Q{pt(27, -63)} {pt(30, -44)}', SEA, 3.4)
            g.fill(drop(-33, -36, 2.6) + drop(33, -36, 2.6), SEA)
    add('rabbit-cry', 'The rabbit: worst day ever', rabbit_cry)

    def rabbit_shy(g):
        with g.at(50, 98, .9):
            rabbit(g, 'happy', eyes=False, ears='flop', arms=False)
            limb(g, [(-9.5, -41), (-9.5, -60)], BUN_DARK, 5.2)
            limb(g, [(9.5, -41), (9.5, -60)], BUN_DARK, 5.2)
            g.fill(circle(-9.5, -61, 5.4) + circle(9.5, -61, 5.4), BUN_DARK)
    add('rabbit-shy', 'The rabbit cannot look', rabbit_shy)

    def rabbit_photo(g):
        with g.at(50, 98, .9):
            rabbit(g, 'wink', arms=False)
            camera_toy(g, 0, -34, 1.0)
            limb(g, [(-9.5, -41), (-11, -33)], BUN_DARK, 5.2)
            limb(g, [(9.5, -41), (11, -33)], BUN_DARK, 5.2)
        shines(g, [(76, 58, 6)])
    add('rabbit-photo', 'The rabbit takes your photo', rabbit_photo)

    def rabbit_faint(g):
        shadow(g, 46, 82, 34)
        with g.at(6, 72, .8, 90):
            rabbit(g, 'out', ears='droop')
        with g.at(60, 30, 1.0):                                                    # what leaves a rabbit that has had too much
            g.fill(circle(0, 0, 8.6) + f'M{pt(-7.4, 4)}Q{pt(-4, 20)} {pt(-12, 22)}Q{pt(4, 22)} {pt(7.6, 4)}Z', MIST)
            g.line(f'M{pt(-4.4, -1.6)}Q{pt(-3, .4)} {pt(-1.6, -1.6)}M{pt(1.6, -1.6)}Q{pt(3, .4)} {pt(4.4, -1.6)}', INK, 1.5)
    add('rabbit-faint', 'The rabbit has had too much', rabbit_faint)

    # The cat: up to something.
    def cat_cup(g):
        g.fill(rrect(-2, 80, 60, 7, 3.5), WOOD).fill(rrect(6, 86, 6, 12, 2) + rrect(44, 86, 6, 12, 2), BARK)
        with g.at(30, 80.5, .82):
            cat(g, 'smug', hands=((-17, -27), (31, -20)))
        cup(g, 76, 76, 1.0, SEA, 38)
        zoom(g, 72, 58, .8, 70)
    add('cat-cup', 'The cat and the cup', cat_cup)

    def cat_box(g):
        with g.at(50, 90, .98):
            cat(g, 'calm', tail='down', arms=False)
        g.fill(poly([(14, 60), (26, 50), (30, 58), (22, 66)], 2) + poly([(86, 60), (74, 50), (70, 58), (78, 66)], 2), BOX_DARK)
        g.fill(rrect(20, 58, 60, 38, 4), BOX)
        g.fill(rrect(46, 58, 8, 13, 0), BOX_DARK, alpha=.55)
        g.fill(circle(38, 58.6, 4.6) + circle(62, 58.6, 4.6), CAT_DARK)
    add('cat-box', 'The cat fits', cat_box)

    def cat_scared(g):
        with g.at(48, 96, .98):
            cat(g, 'shock', fur=True, hands=((-25, -52), (25, -52)))
        rays(g, 48, 16, 14, 21, (-140, -115, -90, -65, -40))
    add('cat-scared', 'The cat did not expect that', cat_scared)

    # The bear: would rather be asleep.
    def bear_sleep(g):
        with g.at(46, 98, .95):
            bear(g, 'sleepy', arms=False)
            g.fill(rrect(13, -56, 24, 32, 8), LILAC).fill(rrect(13, -47, 24, 4, 0) + rrect(13, -37, 24, 4, 0), '#c5aeea')
            limb(g, [(-21, -50), (-29, -29)], BEAR_DARK, 9.6)
            limb(g, [(21, -50), (30, -34)], BEAR_DARK, 9.6)
            g.fill(circle(8.5, -62, 5), MIST).fill(circle(7, -63.6, 1.3), WHITE)
        zzz(g, 76, 16, 1.15)
    add('bear-sleep', 'The bear is off to bed', bear_sleep)

    def bear_hug(g):
        with g.at(50, 98, .95):
            bear(g, 'calm', arms=False)
            g.fill(heart(0, -33, 18.5), ROSE).fill(ellipse(-7.5, -40, 3.4, 2.4), '#f7a3b6')
            limb(g, [(-21, -50), (-13, -29)], BEAR_DARK, 9.6)
            limb(g, [(21, -50), (13, -29)], BEAR_DARK, 9.6)
    add('bear-hug', 'The bear has a heart for you', bear_hug)

    def bear_yum(g):
        with g.at(50, 98, .95):
            bear(g, 'yum', arms=False)
            g.fill(circle(0, -36, 12.5), PINK).fill(circle(0, -36, 4.2) + circle(9.5, -45, 5.2), BEAR_PALE)
            for n, (x, y, turn) in enumerate(((-6.5, -41, 30), (-7.5, -32, -40), (0, -27.5, 10), (7, -31.5, 60), (2, -44, -20))):
                with g.at(x, y, 1, turn):
                    g.fill(rrect(-1.8, -.9, 3.6, 1.8, .9), (SEA, SUN, ROSE, LEAF, PLUM)[n])
            limb(g, [(-21, -50), (-13, -36)], BEAR_DARK, 9.6)
            limb(g, [(21, -50), (13, -36)], BEAR_DARK, 9.6)
    add('bear-yum', 'The bear and a doughnut', bear_yum)

    def together(g):
        with g.at(21, 96, .52):
            frog(g, 'happy', hands=((-27, -58), (21, -27)))
        with g.at(51, 96, .56):
            duck(g, 'happy', brows='up', hands=((-20, -19), (20, -19)))
        with g.at(81, 97, .5):
            rabbit(g, 'joy', hands=((-16, -27), (22, -62)))
    add('together', 'Frog, duck and rabbit', together)
    return d


def bits():
    """Plain things to wear or to scatter, as flat as the icons."""
    d = {}

    def add(key, gloss, g):
        d[key] = (gloss, g)

    add('heart', 'A heart', Drawing().fill(heart(50, 52, 30), ROSE).fill(ellipse(36, 37, 6.5, 4.6), '#f7a3b6'))
    star_face = Drawing().fill(star(50, 53, 40, 5, .56, 5), SUN)
    face(star_face, 'joy', 50, 50, gap=9, r=2.5, mouth_y=5.6, mouth_w=4)
    add('star', 'A star in a good mood', star_face)
    add('sparkle', 'Sparkles', Drawing().fill(sparkle(42, 54, 34, .2), BUTTER).fill(sparkle(76, 24, 15, .2), SUN).fill(sparkle(80, 76, 9, .2), SUN))
    crown = poly([(12, 78), (10, 30), (30, 50), (50, 20), (70, 50), (90, 30), (88, 78)], 4)
    add('crown', 'A crown', Drawing().fill(crown, SUN).fill(rrect(12, 66, 76, 14, 5), AMBER).fill(circle(50, 73, 4.4), RED).fill(circle(28, 73, 3.4) + circle(72, 73, 3.4), SEA)
        .fill(circle(10, 28, 5.4) + circle(50, 18, 5.4) + circle(90, 28, 5.4), BUTTER))
    lens = lambda cx: rrect(cx - 19, 36, 38, 28, 12)
    add('shades', 'Sunglasses', Drawing().fill(rrect(6, 38, 88, 8, 4), INK).fill(lens(27) + lens(73), INK).fill(rrect(16, 42, 12, 5, 2.5) + rrect(62, 42, 12, 5, 2.5), '#6f8f8a'))
    add('bow', 'A bow', Drawing().fill(poly([(46, 50), (10, 24), (8, 76)], 7) + poly([(54, 50), (90, 24), (92, 76)], 7), ROSE)
        .fill(poly([(42, 50), (20, 38), (18, 62)], 4) + poly([(58, 50), (80, 38), (82, 62)], 4), '#d8546f').fill(rrect(40, 39, 20, 22, 8), '#f7a3b6'))
    add('balloon', 'A balloon', Drawing().line(f'M{pt(50, 64)}Q{pt(44, 76)} {pt(52, 84)}T{pt(48, 97)}', INK, 1.5).fill(ellipse(50, 36, 27, 31), RED)
        .fill(poly([(46, 64), (54, 64), (50, 71)], 1.4), DARK_RED).fill(ellipse(40, 24, 6.4, 9), '#f28a7a'))
    rainbow = Drawing()
    for r, c in ((44, RED), (36, SUN), (28, LEAF), (20, SEA)):
        rainbow.fill(f'M{pt(50 - r, 68)}A{r} {r} 0 0 1 {pt(50 + r, 68)}H{50 + r - 8}A{r - 8} {r - 8} 0 0 0 {pt(50 - r + 8, 68)}Z', c)
    rainbow.fill(circle(12, 70, 9) + circle(24, 66, 11) + circle(16, 74, 8) + rrect(10, 68, 20, 12, 5), MIST).fill(circle(88, 70, 9) + circle(76, 66, 11) + circle(84, 74, 8) + rrect(70, 68, 20, 12, 5), MIST)
    add('rainbow', 'A rainbow between two clouds', rainbow)
    bolt = poly([(58, 6), (24, 54), (46, 54), (38, 94), (78, 40), (54, 40)], 4)
    add('bolt', 'A lightning bolt', Drawing().fill(bolt, SUN).fill(poly([(56, 14), (34, 48), (45, 48)], 2), BUTTER))
    add('pow', 'A burst', Drawing().fill(burst(50, 50, 46, 12, .7, 2), SUN).fill(burst(50, 50, 30, 12, .7, 1.4), RED).fill(burst(50, 50, 15, 8, .62, 1), CREAM))
    return d


SHEETS = [
    # id, name, tab, kind, months it is in season, a deck for Memory, the drawings
    ('cute', 'Friends', 'Friends', 'cute', None, True, friends),
    ('bits', 'Bits', 'Friends', 'cute', None, False, bits),
]


def webp(im, quality=82):
    buf = io.BytesIO()
    im.save(buf, 'WEBP', quality=quality, method=6)
    return buf.getvalue()


def register(name):
    """Adds a sheet's file to the camera's list of its own sheets, once."""
    data = json.loads(REGISTRY.read_text()) if REGISTRY.exists() else {'sheets': ['marks.json', 'halloween.json', 'pocket-faces.json']}
    if name not in data['sheets']:
        data['sheets'].append(name)
    REGISTRY.write_text(json.dumps(data, indent=1) + '\n')


def build(sheet=None, only=None):
    previews = []
    for sid, name, tab, kind, when, deck, make in SHEETS:
        if only and sid not in only:
            continue
        (OUT / sid).mkdir(parents=True, exist_ok=True)
        entries, wanted = [], set()
        for key, (gloss, drawing) in make().items():
            big = drawing.sticker()
            small = big.copy()
            big.thumbnail((512, 512), Image.LANCZOS)
            small.thumbnail((256, 256), Image.LANCZOS)
            data = webp(big)
            (OUT / sid / f'{key}.webp').write_bytes(data)
            (OUT / sid / f'{key}.thumb.webp').write_bytes(webp(small))
            wanted |= {f'{key}.webp', f'{key}.thumb.webp'}
            stamp = hashlib.sha256(data).hexdigest()[:8]
            entries.append({'id': f'{sid}/{key}', 'src': f'{sid}/{key}.webp?v={stamp}', 'thumb': f'{sid}/{key}.thumb.webp?v={stamp}',
                            'width': big.width, 'height': big.height, 'line': '', 'gloss': gloss})
            previews.append(small)
        for old in (OUT / sid).glob('*.webp'):                                     # a sticker renamed or dropped
            if old.name not in wanted:
                old.unlink()
        meta = {'id': sid, 'name': name, 'tab': tab, 'who': '', 'kind': kind}
        if when:
            meta['when'] = when
        if deck:
            meta['deck'] = True
        meta.update({'source': 'tools/draw-cute-stickers.py', 'stickers': entries})
        (OUT / f'{sid}.json').write_text(json.dumps(meta, indent=1, ensure_ascii=False) + '\n')
        register(f'{sid}.json')
        print(f'{len(entries)} stickers → camera/stickers/{sid}/ and {sid}.json')
    if sheet:
        cols, cell = 8, 190
        rows = math.ceil(len(previews) / cols)
        for suffix, ground in (('', (236, 232, 222)), ('-dark', (40, 44, 48))):
            page = Image.new('RGB', (cols * cell, rows * cell), ground)
            for n, im in enumerate(previews):
                t = im.copy()
                t.thumbnail((cell - 22, cell - 22), Image.LANCZOS)
                page.paste(t, ((n % cols) * cell + (cell - t.width) // 2, (n // cols) * cell + (cell - t.height) // 2), t)
            page.save(sheet.replace('.png', f'{suffix}.png'))


if __name__ == '__main__':
    args = sys.argv[1:]
    build(args[args.index('--sheet') + 1] if '--sheet' in args else None,
          set(args[args.index('--only') + 1].split(',')) if '--only' in args else None)
