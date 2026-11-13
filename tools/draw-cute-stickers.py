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


# ---------- the friends through the year ----------
# (The owner, 12 November 2026: "And Japanese matsuri festival and lunar Tet stickers", "And Christmas, and Halloween and
# Easter and summer".) The same five, dressed for the day. The things of a festival are the owner's own sheet
# (stickers/matsuri.json); these are who goes to it.
def santa_hat(g, cx, base, w, lean=1):
    g.fill(poly([(cx - w * .44, base), (cx + w * .44, base), (cx + lean * w * .5, base - w * .62)], 5), RED)
    g.fill(rrect(cx - w * .52, base - 3.6, w * 1.04, 7.6, 3.8), MIST).fill(circle(cx + lean * w * .5, base - w * .62, 4.6), MIST)


def witch_hat(g, cx, base, w):
    g.fill(ellipse(cx, base, w * .7, 4.6), PLUM)
    g.fill(poly([(cx - w * .36, base - 1), (cx + w * .36, base - 1), (cx + w * .16, base - w * .8)], 3.4), PLUM)
    g.fill(rrect(cx - w * .34, base - 6.4, w * .68, 4.4, 1.2), SUN)


def scarf(g, cx, y, w, colour=RED, tail=1):
    g.fill(rrect(cx - w / 2, y - 3.4, w, 7, 3.5), colour).fill(rrect(cx + tail * w * .22, y, 6.4, 13, 3), colour)


def shades(g, cx, y, gap, r=4.6):
    g.fill(rrect(cx - gap - r, y - r * .8, 2 * r, r * 1.6, r * .7) + rrect(cx + gap - r, y - r * .8, 2 * r, r * 1.6, r * .7), INK)
    g.line(f'M{pt(cx - gap + r, y - r * .2)}L{pt(cx + gap - r, y - r * .2)}', INK, 1.8)


def gift(g, x, y, s=1.0, box=SEA, ribbon=SUN):
    with g.at(x, y, s):
        g.fill(rrect(-8, -7, 16, 14, 2.6), box).fill(rrect(-1.8, -7, 3.6, 14, 0) + rrect(-8, -2, 16, 3.6, 0), ribbon)
        g.fill(blob(-3.4, -9.4, 3.4, 2.2, -28) + blob(3.4, -9.4, 3.4, 2.2, 28), ribbon)


def envelope(g, x, y, s=1.0, turn=0):
    with g.at(x, y, s, turn):
        g.fill(rrect(-7, -10, 14, 20, 2.4), RED).fill(poly([(-7, -8), (7, -8), (0, -1)], 1.6), DARK_RED).fill(circle(0, 3.6, 3.4), SUN)


def blossom_branch(g, x, y, s=1.0, petal=PINK, heart_=ROSE):
    with g.at(x, y, s):
        g.line(f'M{pt(0, 0)}Q{pt(3, -16)} {pt(-3, -30)}M{pt(1.6, -14)}Q{pt(9, -18)} {pt(12, -26)}', BARK, 2.4)
        for bx, by, r in ((-3, -32, 6.4), (12.6, -27.6, 5), (3.4, -19, 4.2)):
            g.fill(''.join(circle(*on(bx, by, r * .62, a), r * .5) for a in range(0, 360, 72)), petal).fill(circle(bx, by, r * .3), heart_)


def lantern(g, x, y, s=1.0, colour=RED):
    with g.at(x, y, s):
        g.fill(ellipse(0, 0, 9, 10.5), colour).fill(rrect(-5, -12.6, 10, 3.4, 1.4) + rrect(-4.4, 9.2, 8.8, 3.2, 1.4), INK)
        g.line(f'M{pt(-5.4, -4)}Q{pt(0, -2.6)} {pt(5.4, -4)}M{pt(-5.4, 3.4)}Q{pt(0, 4.8)} {pt(5.4, 3.4)}', DARK_RED, 1.3)


def egg_painted(g, x, y, s=1.0, colour=SEA, band=SUN, turn=0):
    with g.at(x, y, s, turn):
        g.fill(egg(0, 0, 15, 19, .16), colour)
        g.line(f'M{pt(-6.4, -1)}Q{pt(-3.2, -4)} {pt(0, -1)}T{pt(6.4, -1)}', band, 2.2)
        g.fill(circle(-3, 4.6, 1.3) + circle(3, 4.6, 1.3) + circle(0, -6, 1.3), WHITE)


def lolly(g, x, y, s=1.0, colour=ROSE, turn=0):
    with g.at(x, y, s, turn):
        g.fill(rrect(-1.6, 4, 3.2, 12, 1.6), WOOD).fill(rrect(-6, -12, 12, 19, 5.6), colour).fill(rrect(-3.4, -9, 2.2, 8, 1.1), WHITE, alpha=.6)


def seasons():
    out = {}

    def sheet(sid):
        d = {}

        def add(key, gloss, draw):
            g = Drawing()
            draw(g)
            d[key] = (gloss, g)
        out[sid] = d
        return add

    # ----- Tết: the lunar New Year -----
    add = sheet('tet')

    def cat_envelope(g):                                                            # in Vietnam the year is the cat's
        with g.at(50, 96, .98):
            cat(g, 'awe', arms=False)
            envelope(g, 0, -30, 1.25)
            limb(g, [(-10.5, -43), (-9, -30)], CAT_DARK, 5.6)
            limb(g, [(10.5, -43), (9, -30)], CAT_DARK, 5.6)
        shines(g, [(86, 20, 6), (14, 30, 4)])
    add('cat-envelope', 'The cat and its lucky money', cat_envelope)

    def frog_blossom(g):
        with g.at(46, 96, .96):
            frog(g, 'calm', hands=((-20, -28), (24, -40)))
            blossom_branch(g, 25, -40, 1.25)
    add('frog-blossom', 'The frog brings peach blossom', frog_blossom)

    def duck_firecrackers(g):
        with g.at(40, 96, .96):
            duck(g, 'shock', brows='up', bill='open', hands=((-24, -44), (24, -44)))
        with g.at(84, 50, 1.0):
            g.line(f'M{pt(0, -34)}V{30}', AMBER, 1.8)
            for n, y in enumerate((-22, -8, 6, 20)):
                with g.at(0, y, 1, 28 if n % 2 else -28):
                    g.fill(rrect(-8, -3.4, 16, 6.8, 2.4), RED).fill(rrect(-8, -3.4, 2.4, 6.8, 0) + rrect(5.6, -3.4, 2.4, 6.8, 0), SUN)
        g.fill(burst(84, 88, 8.6, 8, .55, 1), SUN)
        rays(g, 84, 88, 10, 15, (-150, -110, -70, -30))
    add('duck-firecrackers', 'The duck and the firecrackers', duck_firecrackers)

    def bear_cake(g):
        with g.at(50, 98, .95):
            bear(g, 'yum', arms=False)
            g.fill(rrect(-15, -45, 30, 26, 4.4), '#5aa35c')
            g.line(f'M{pt(-5, -45)}V{-19}M{pt(5, -45)}V{-19}M{pt(-15, -36.5)}H{15}M{pt(-15, -27.5)}H{15}', '#efe3b4', 1.8)
            limb(g, [(-21, -50), (-15, -33)], BEAR_DARK, 9.6)
            limb(g, [(21, -50), (15, -33)], BEAR_DARK, 9.6)
    add('bear-rice-cake', 'The bear and the square rice cake', bear_cake)

    def rabbit_lantern(g):
        with g.at(46, 98, .9):
            g.line(f'M{pt(20, -34)}L{pt(26, -62)}', BARK, 2.4)
            rabbit(g, 'joy', hands=((-16, -27), (20, -34)))
            g.line(f'M{pt(26, -62)}L{pt(33, -56)}', BARK, 1.6)
            lantern(g, 33, -42, 1.05)
    add('rabbit-lantern', 'The rabbit and its lantern', rabbit_lantern)

    # ----- Christmas -----
    add = sheet('christmas')

    def duck_santa(g):
        with g.at(50, 96, .98):
            duck(g, 'deadpan', arms=False)
            santa_hat(g, 0, -69, 40)
            gift(g, 0, -22, 1.15)
            limb(g, [(-14, -31), (-10, -22)], DUCK_DARK, 6.2, hand=False)
            limb(g, [(14, -31), (10, -22)], DUCK_DARK, 6.2, hand=False)
    add('duck-santa', 'The duck delivers', duck_santa)

    def rabbit_reindeer(g):
        with g.at(50, 97, .9):
            rabbit(g, 'happy', ears='droop', hands=((-18, -34), (18, -34)))
            for s in (-1, 1):
                g.line(f'M{pt(s * 7, -73)}L{pt(s * 11, -92)}M{pt(s * 9, -82)}L{pt(s * 17, -88)}M{pt(s * 10, -87)}L{pt(s * 4, -95)}', BARK, 3)
            g.fill(circle(0, -56.4, 3.6), RED).fill(circle(1, -57.6, 1.1), WHITE, alpha=.7)
    add('rabbit-reindeer', 'The rabbit is a reindeer today', rabbit_reindeer)

    def frog_lights(g):
        with g.at(50, 96, .98):
            frog(g, 'smug', lips='flat')
            g.line(f'M{pt(-30, -72)}Q{pt(-8, -40)} {pt(22, -52)}Q{pt(34, -40)} {pt(18, -28)}Q{pt(-6, -12)} {pt(-22, -24)}', GREEN, 1.6)
            for n, (x, y) in enumerate(((-24, -62), (-12, -47), (4, -46), (20, -52), (27, -39), (16, -27), (2, -19), (-14, -19))):
                g.fill(circle(x, y + 2.4, 2.9), (RED, SUN, SEA, ROSE)[n % 4])
    add('frog-lights', 'The frog helped with the lights', frog_lights)

    def bear_cocoa(g):
        with g.at(50, 98, .95):
            bear(g, 'calm', arms=False)
            scarf(g, 0, -57, 42, RED)
            cup(g, 0, -32, 1.25, SEA)
            limb(g, [(-21, -50), (-11, -33)], BEAR_DARK, 9.6)
            limb(g, [(21, -50), (13, -33)], BEAR_DARK, 9.6)
        steam(g, 46, 54, .9)
        steam(g, 54, 56, .7)
    add('bear-cocoa', 'The bear and its cocoa', bear_cocoa)

    def cat_tree(g):
        g.fill(rrect(45, 84, 10, 12, 2), BARK)
        g.fill(poly([(50, 4), (74, 36), (26, 36)], 5) + poly([(50, 22), (82, 62), (18, 62)], 5) + poly([(50, 44), (90, 88), (10, 88)], 6), GREEN)
        g.fill(star(50, 8, 8, 5, .5, 1), SUN)
        for n, (x, y) in enumerate(((32, 54), (66, 50), (24, 78), (74, 80), (44, 30))):
            g.fill(circle(x, y, 3.6), (RED, SUN, SEA, ROSE, SUN)[n])
        with g.at(50, 66, 1.0):                                                     # the cat is in the tree
            g.fill(poly([(-12, -4), (-11, -16), (-3, -9)], 2) + poly([(12, -4), (11, -16), (3, -9)], 2) + ellipse(0, 2, 14, 11), CAT)
            face(g, 'smug', 0, 0, gap=6, r=2.2, cheek=False, lips='')
            g.fill(poly([(-1.6, 3.4), (1.6, 3.4), (0, 5.2)], .7), ROSE)
            mouth(g, 'cat', 0, 6.6, 2.8, 1.6)
        with g.at(86, 94, 1, 30):
            g.fill(circle(0, 0, 3.6), RED)
        zoom(g, 80, 84, .5, 60)
    add('cat-tree', 'The cat is in the tree', cat_tree)

    # ----- Halloween -----
    add = sheet('halloween-cute')

    def frog_witch(g):
        with g.at(40, 96, .92):
            frog(g, 'smug', hands=((-20, -28), (30, -44)))
            witch_hat(g, 0, -84, 62)
        with g.at(80, 96, 1.0):
            g.line(f'M{pt(-9, -40)}L{pt(-2, -18)}', BARK, 2.6)
            g.fill(circle(-4, -22, 5) + circle(4, -24, 6) + circle(9, -20, 4), LEAF)
            g.fill(f'M{pt(-14, -20)}H{14}Q{pt(16, 0)} {pt(8, 0)}H{-8}Q{pt(-16, 0)} {pt(-14, -20)}Z', INK).fill(rrect(-16, -23, 32, 5.4, 2.7), INK)
        g.fill(circle(86, 58, 2.6) + circle(78, 50, 1.8), LEAF)
    add('frog-witch', 'The frog stirs something', frog_witch)

    def duck_ghost(g):
        with g.at(50, 96, 1.0):
            g.fill(ellipse(-9.5, -3.4, 8, 3.4) + ellipse(9.5, -3.4, 8, 3.4), ORANGE)
            g.fill(f'M{pt(-26, -8)}V{-54}A26 26 0 0 1 {pt(26, -54)}V{-8}Q{pt(19.5, -16)} {pt(13, -8)}T{pt(0, -8)}T{pt(-13, -8)}T{pt(-26, -8)}Z', MIST)
            g.fill(ellipse(-10, -54, 4.4, 5.4) + ellipse(10, -54, 4.4, 5.4), INK)
            g.line(f'M{pt(-16, -62.6)}L{pt(-5, -61.4)}M{pt(16, -62.6)}L{pt(5, -61.4)}', INK, 2.6)
            g.fill(rrect(-12.5, -48, 25, 11, 5.5), ORANGE)
            g.line(f'M{pt(-9, -42)}Q{pt(0, -40)} {pt(9, -42)}', ORANGE_DARK, 1.6)
    add('duck-ghost', 'The duck is a ghost. Boo.', duck_ghost)

    def rabbit_vampire(g):
        with g.at(50, 97, .9):
            g.fill(poly([(-11, -45), (-33, -8), (-22, -2), (-11, -8), (0, -2), (11, -8), (22, -2), (33, -8), (11, -45)], 3.4), '#3b2a4d')
            rabbit(g, 'smug', hands=((-25, -24), (25, -24)))
            g.fill(poly([(-10, -45), (-20, -52), (-13, -38)], 2) + poly([(10, -45), (20, -52), (13, -38)], 2), RED)
            g.fill(poly([(-3.4, -50.6), (-1, -50.6), (-2.2, -46.6)], .4) + poly([(1, -50.6), (3.4, -50.6), (2.2, -46.6)], .4), WHITE)
    add('rabbit-vampire', 'The rabbit wants your carrots', rabbit_vampire)

    def cat_pumpkin(g):
        with g.at(50, 84, .98):
            cat(g, 'calm', tail='down', arms=False)
        g.fill(rrect(46, 50, 8, 9, 3), GREEN)
        g.fill(ellipse(34, 76, 17, 21) + ellipse(66, 76, 17, 21) + ellipse(50, 76, 20, 22), ORANGE)
        g.fill(poly([(34, 70), (42, 70), (38, 63)], 1.2) + poly([(58, 70), (66, 70), (62, 63)], 1.2), INK)
        g.fill(f'M{pt(36, 80)}Q{pt(50, 92)} {pt(64, 80)}L{pt(58, 82)}L{pt(55, 79)}L{pt(50, 84)}L{pt(45, 79)}L{pt(42, 82)}Z', INK)
        g.fill(circle(38, 56.6, 4.6) + circle(62, 56.6, 4.6), CAT_DARK)
    add('cat-pumpkin', 'The cat fits here too', cat_pumpkin)

    def bear_sweets(g):
        with g.at(50, 98, .95):
            bear(g, 'yum', arms=False)
            g.fill(f'M{pt(-13, -40)}H{13}L{pt(10, -18)}H{-10}Z', ORANGE).fill(rrect(-14.5, -43, 29, 5, 2.5), ORANGE_DARK)
            g.fill(circle(-6, -45, 4) + circle(6, -45.6, 4), ROSE).fill(circle(0, -47, 4.4), PLUM)
            g.fill(poly([(-6, -33), (-2, -33), (-4, -29)], .6) + poly([(2, -33), (6, -33), (4, -29)], .6), INK)
            limb(g, [(-21, -50), (-14, -30)], BEAR_DARK, 9.6)
            limb(g, [(21, -50), (14, -30)], BEAR_DARK, 9.6)
    add('bear-sweets', 'The bear did well tonight', bear_sweets)

    # ----- Easter -----
    add = sheet('easter')

    def rabbit_egg(g):
        with g.at(50, 97, .9):
            rabbit(g, 'joy', arms=False)
            egg_painted(g, 0, -30, 1.3)
            limb(g, [(-9.5, -41), (-10, -30)], BUN_DARK, 5.2)
            limb(g, [(9.5, -41), (10, -30)], BUN_DARK, 5.2)
    add('rabbit-egg', 'The rabbit painted this one', rabbit_egg)

    def duck_hatch(g):
        with g.at(50, 96, 1.0):
            duck(g, 'grumpy', brows='angry', hands=((-21, -34), (21, -34)))
            g.fill(f'M{pt(-24, -22)}L{pt(-16, -28)}L{pt(-8, -21)}L{pt(0, -28)}L{pt(8, -21)}L{pt(16, -28)}L{pt(24, -22)}Q{pt(26, 0)} {pt(0, 2)}Q{pt(-26, 0)} {pt(-24, -22)}Z', CREAM)
            g.fill(f'M{pt(-13, -72)}L{pt(-7, -78)}L{pt(0, -72)}L{pt(7, -78)}L{pt(13, -72)}Q{pt(12, -88)} {pt(0, -89)}Q{pt(-12, -88)} {pt(-13, -72)}Z', CREAM)
        g.fill(ellipse(50, 97, 24, 3), INK, alpha=.12)
    add('duck-hatch', 'The duck, just hatched, already cross', duck_hatch)

    def frog_egg(g):
        g.fill(''.join(poly([(x - 5, 96), (x, 80 - (n % 3) * 4), (x + 5, 96)], 1.6) for n, x in enumerate(range(12, 92, 9))), LEAF)
        egg_painted(g, 20, 82, 1.15, ROSE, WHITE, -12)
        egg_painted(g, 82, 84, 1.05, SEA, SUN, 10)
        with g.at(50, 96, .86):
            frog(g, 'smug', lips='flat', hands=((-17, -30), (17, -30)))
            g.line(f'M{pt(-24, -62)}Q{pt(-12, -66)} {pt(0, -62)}T{pt(24, -62)}', SUN, 2.6)
            g.fill(circle(-18, -52, 1.8) + circle(18, -52, 1.8) + circle(0, -51, 1.8), WHITE)
        g.fill(''.join(poly([(x - 4, 98), (x, 88), (x + 4, 98)], 1.4) for x in range(8, 96, 11)), GREEN)
    add('frog-egg', 'The frog is definitely an egg', frog_egg)

    def bear_basket(g):
        with g.at(50, 98, .95):
            bear(g, 'happy', arms=False)
            g.line(f'M{pt(-13, -34)}Q{pt(0, -56)} {pt(13, -34)}', BARK, 2.6)
            egg_painted(g, -6, -36, .62, ROSE, WHITE, -14)
            egg_painted(g, 5, -37, .62, SEA, SUN, 12)
            g.fill(f'M{pt(-15, -34)}H{15}L{pt(11, -17)}H{-11}Z', WOOD).fill(rrect(-16.5, -36, 33, 4.6, 2.3), BARK)
            limb(g, [(-21, -50), (-15, -28)], BEAR_DARK, 9.6)
            limb(g, [(21, -50), (15, -28)], BEAR_DARK, 9.6)
    add('bear-basket', 'The bear found them all', bear_basket)

    # ----- Summer -----
    add = sheet('summer')

    def frog_ring(g):
        with g.at(50, 92, .96):
            g.fill(ellipse(0, -22, 36, 13), ROSE)
            frog(g, 'calm', hands=((-30, -28), (30, -28)))
            shades(g, 0, -78, 15, 6.4)
            g.fill(f'M{pt(-36, -22)}A36 13 0 0 0 {pt(36, -22)}Q{pt(30, -10)} {pt(0, -8)}Q{pt(-30, -10)} {pt(-36, -22)}Z', ROSE)
            g.fill(rrect(-5, -11.6, 10, 4.4, 1.6) + rrect(-27, -17.6, 8, 4.4, 1.6) + rrect(19, -17.6, 8, 4.4, 1.6), WHITE, alpha=.75)
        g.fill(ellipse(50, 92, 44, 5), SEA, alpha=.55)
    add('frog-ring', 'The frog floats', frog_ring)

    def duck_snorkel(g):
        with g.at(50, 96, 1.0):
            duck(g, 'happy', brows='up', hands=((-22, -22), (25, -46)))
            g.fill(rrect(-18, -63.4, 36, 13, 6), SKY, alpha=.45)
            g.line(f'M{pt(-18, -57)}H{-22}M{pt(18, -57)}H{22}', INK, 2.6)
            g.line(f'M{pt(-18, -63.4)}H{18}M{pt(-18, -50.4)}H{18}M{pt(-18, -63.4)}V{-50.4}M{pt(18, -63.4)}V{-50.4}', NAVY, 2)
            g.line(f'M{pt(22, -50)}V{-84}', ROSE, 3.6)
            g.fill(rrect(19.4, -90, 5.2, 8, 2), ORANGE)
    add('duck-snorkel', 'The duck goes in', duck_snorkel)

    def rabbit_melon(g):
        with g.at(50, 97, .9):
            rabbit(g, 'yum', arms=False)
            with g.at(0, -36, 1.0):
                g.fill(f'M{pt(-17, -4)}A17 17 0 0 0 {pt(17, -4)}Z', GREEN).fill(f'M{pt(-14, -4)}A14 14 0 0 0 {pt(14, -4)}Z', '#f0605d')
                g.fill(''.join(drop(x, y, 1.3) for x, y in ((-6, 0), (0, 3.4), (6, 0))), INK)
                g.fill(circle(13, -5, 4.4), BUN)
            limb(g, [(-9.5, -41), (-13, -36)], BUN_DARK, 5.2)
            limb(g, [(9.5, -41), (10, -35)], BUN_DARK, 5.2)
    add('rabbit-melon', 'The rabbit and the watermelon', rabbit_melon)

    def cat_melt(g):
        g.fill(ellipse(50, 94, 36, 5.4), CAT, alpha=.9)
        with g.at(50, 96, .98):
            cat(g, 'out', tail='down', hands=((-22, -18), (26, -40)))
            lolly(g, 28, -48, 1.0, SEA, 14)
        sweat(g, 16, 34, 1.0, -20)
        sweat(g, 26, 22, .7, -10)
        g.fill(circle(84, 14, 9), SUN)
        rays(g, 84, 14, 12, 17, range(0, 360, 45), AMBER, 2.2)
    add('cat-melt', 'The cat is too hot', cat_melt)

    def bear_lolly(g):
        with g.at(50, 98, .95):
            bear(g, 'calm', hands=((-29, -29), (30, -54)))
            shades(g, 0, -75, 9.5, 5.4)
            lolly(g, 31, -64, 1.1, ROSE, 8)
    add('bear-lolly', 'The bear on holiday', bear_lolly)

    # ----- Who goes to the festival -----
    add = sheet('matsuri-friends')

    def frog_fan(g):
        with g.at(46, 96, .96):
            frog(g, 'sing', hands=((-20, -28), (30, -50)))
            g.fill(rrect(-29, -72.6, 58, 5.6, 2.6), WHITE).fill(circle(0, -69.8, 3.4), RED)          # a headband, under the eyes a frog keeps on top
            with g.at(34, -58, 1.0, 20):
                g.fill(rrect(-1.8, 0, 3.6, 16, 1.6), WOOD).fill(circle(0, -8, 12), SEA).fill(circle(4, -12, 3.4), RED)
                g.line(f'M{pt(-8, -6)}Q{pt(-4, -10)} {pt(0, -6)}T{pt(8, -6)}', WHITE, 1.8)
    add('frog-fan', 'The frog cheers the shrine along', frog_fan)

    def duck_scoop(g):
        with g.at(42, 96, .98):
            duck(g, 'shock', brows='up', hands=((-21, -22), (26, -40)))
            with g.at(34, -46, 1.0, 30):
                g.line(f'M{pt(0, 10)}V{24}', ROSE, 3)
                g.fill(circle(0, 0, 11), ROSE).fill(circle(0, 0, 8), CREAM).fill(poly([(-3, -2), (4, -5), (5, 3), (-2, 5)], 1), SEA, alpha=.5)
        with g.at(84, 30, 1.0, -30):
            g.fill(poly([(4, 0), (15, -7), (12, 0), (15, 7)], 2), '#f9b27a').fill(ellipse(-2, 0, 9, 6), '#f5873a').fill(circle(-6, -1.4, 1.5), INK)
        raindrops(g, [(72, 48), (90, 50), (80, 60)])
    add('duck-scoop', 'The duck nearly had it', duck_scoop)

    def rabbit_apple(g):
        with g.at(48, 97, .9):
            g.line(f'M{pt(21, -32)}L{pt(26, -60)}', WOOD, 2.6)
            rabbit(g, 'yum', hands=((-16, -27), (21, -32)))
            g.fill(circle(27, -66, 10), RED).fill(ellipse(23.6, -69.6, 2.4, 3.4), WHITE, alpha=.7)
    add('rabbit-apple', 'The rabbit at the fair', rabbit_apple)

    def cat_floss(g):
        with g.at(44, 96, .98):
            g.line(f'M{pt(20, -30)}L{pt(27, -58)}', WOOD, 2.6)
            cat(g, 'awe', hands=((-17, -27), (20, -30)))
            g.fill(circle(29, -70, 13) + circle(19, -64, 8.6) + circle(39, -64, 8.6) + circle(24, -79, 7.6) + circle(35, -79, 7.6), PINK)
    add('cat-floss', 'The cat and the cotton candy', cat_floss)
    return out


def season(sid):
    return lambda: seasons()[sid]


SHEETS = [
    # id, name, tab, kind, months it is in season, a deck for Memory, the drawings
    ('cute', 'Friends', 'Friends', 'cute', None, True, friends),
    ('bits', 'Bits', 'Friends', 'cute', None, False, bits),
    ('matsuri-friends', 'Matsuri', 'Season', 'season', [7, 8], False, season('matsuri-friends')),
    ('tet', 'Tết', 'Season', 'season', [1, 2], False, season('tet')),
    ('easter', 'Easter', 'Season', 'season', [3, 4], False, season('easter')),
    ('summer', 'Summer', 'Season', 'season', [6, 7, 8], False, season('summer')),
    ('halloween-cute', 'Halloween', 'Season', 'season', [10], False, season('halloween-cute')),
    ('christmas', 'Christmas', 'Season', 'season', [12], False, season('christmas')),
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
