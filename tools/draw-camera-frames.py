#!/usr/bin/env python3
"""Pocket Camera's pixel frames, drawn in code (the owner, 29 October 2026: "Draw our own frames in Python", after the
frames of a Game Boy Camera project turned out to be others' art with no licence).

The hand-held camera's frames were pixel art in four shades round a photo: 160 x 144 pixels with a 16-pixel border.
These are drawn the same way, each in a palette of its own, from the island: the Pocket Look's greens, the harbour
with its ferry and lighthouse, Sakura's blossom, the ferry ticket to Kitano-jima, the matsuri's lanterns, and Thuan
waving "Hi there!", redrawn in four shades from her own die-cut sticker. Island Post and Shop Day add an original
island postage stamp and a miniature shopfront.

A photo may be any shape, so a frame is drawn as pieces, never stretched: four corners, an edge piece for each side
that repeats along it, and small scenes placed against an edge (the ferry, a stamp, Thuan). The camera (frames.js)
lays them out at a scale where the photo's short side is 144 pixels and enlarges them with hard pixel edges, the same
in the viewfinder and in the save.

Writes camera/frames/<id>.png (the pieces, packed) and camera/frames/frames.json (where each piece is and where it
goes), and with --preview a sheet of every frame on a photo at 4:3, 3:4 and 16:9.
Run from the repository root: python3 tools/draw-camera-frames.py [--preview out.png]
"""
import json, sys
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / 'camera' / 'frames'
B = 16                       # the border, as the hand-held camera's (16 of 144)
SHORT = 144                  # the photo's short side, in frame pixels


def hexrgb(h):
    h = h.lstrip('#')
    return tuple(int(h[i:i + 2], 16) for i in (0, 2, 4))


class Art:
    """A piece of pixel art: each pixel a palette index 0-3, or None (clear)."""

    def __init__(self, w, h, fill=None):
        self.w, self.h = w, h
        self.p = [[fill] * w for _ in range(h)]

    def px(self, x, y, c):
        if 0 <= x < self.w and 0 <= y < self.h:
            self.p[y][x] = c

    def get(self, x, y):
        return self.p[y][x] if 0 <= x < self.w and 0 <= y < self.h else None

    def rect(self, x, y, w, h, c):
        for j in range(y, y + h):
            for i in range(x, x + w):
                self.px(i, j, c)

    def hline(self, x0, x1, y, c):
        for x in range(x0, x1 + 1):
            self.px(x, y, c)

    def vline(self, x, y0, y1, c):
        for y in range(y0, y1 + 1):
            self.px(x, y, c)

    def disc(self, cx, cy, r, c):
        for y in range(int(cy - r) - 1, int(cy + r) + 2):
            for x in range(int(cx - r) - 1, int(cx + r) + 2):
                if (x + .5 - cx) ** 2 + (y + .5 - cy) ** 2 <= r * r:
                    self.px(x, y, c)

    def ring(self, cx, cy, r, width, c):
        for y in range(int(cy - r) - 1, int(cy + r) + 2):
            for x in range(int(cx - r) - 1, int(cx + r) + 2):
                d = ((x + .5 - cx) ** 2 + (y + .5 - cy) ** 2) ** .5
                if r - width <= d <= r:
                    self.px(x, y, c)

    def sprite(self, rows, x, y, key=None):
        """ASCII art: '.' clear, '0'-'3' the palette, or a letter mapped by `key`."""
        for j, row in enumerate(rows):
            for i, ch in enumerate(row):
                if ch == '.' or ch == ' ':
                    continue
                c = key[ch] if key and ch in key else int(ch)
                self.px(x + i, y + j, c)

    def paste(self, other, x, y):
        for j in range(other.h):
            for i in range(other.w):
                c = other.p[j][i]
                if c is not None:
                    self.px(x + i, y + j, c)

    def text(self, s, x, y, c, shadow=None):
        for k, ch in enumerate(s.upper()):
            glyph = FONT.get(ch)
            if glyph is None:
                continue
            for j, row in enumerate(glyph):
                for i, bit in enumerate(row):
                    if bit == '#':
                        if shadow is not None:
                            self.px(x + k * 6 + i + 1, y + j + 1, shadow)
                        self.px(x + k * 6 + i, y + j, c)

    def outline(self, c):
        """A one-pixel line round everything drawn (outside it), as a sprite's ink."""
        edge = [(x, y) for y in range(self.h) for x in range(self.w) if self.p[y][x] is None and any(
            self.get(x + dx, y + dy) is not None and self.get(x + dx, y + dy) != c for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)))]
        for x, y in edge:
            self.p[y][x] = c


def text_width(s):
    return len(s) * 6 - 1


# A 5 x 7 pixel face for the frames' lettering, drawn for them.
FONT = {k: v.split() for k, v in {
    'A': '.###. #...# #...# ##### #...# #...# #...#', 'B': '####. #...# #...# ####. #...# #...# ####.',
    'C': '.###. #...# #.... #.... #.... #...# .###.', 'D': '####. #...# #...# #...# #...# #...# ####.',
    'E': '##### #.... #.... ####. #.... #.... #####', 'F': '##### #.... #.... ####. #.... #.... #....',
    'G': '.###. #...# #.... #.### #...# #...# .####', 'H': '#...# #...# #...# ##### #...# #...# #...#',
    'I': '.###. ..#.. ..#.. ..#.. ..#.. ..#.. .###.', 'J': '..### ...#. ...#. ...#. ...#. #..#. .##..',
    'K': '#...# #..#. #.#.. ##... #.#.. #..#. #...#', 'L': '#.... #.... #.... #.... #.... #.... #####',
    'M': '#...# ##.## #.#.# #.#.# #...# #...# #...#', 'N': '#...# #...# ##..# #.#.# #..## #...# #...#',
    'O': '.###. #...# #...# #...# #...# #...# .###.', 'P': '####. #...# #...# ####. #.... #.... #....',
    'Q': '.###. #...# #...# #...# #.#.# #..#. .##.#', 'R': '####. #...# #...# ####. #.#.. #..#. #...#',
    'S': '.#### #.... #.... .###. ....# ....# ####.', 'T': '##### ..#.. ..#.. ..#.. ..#.. ..#.. ..#..',
    'U': '#...# #...# #...# #...# #...# #...# .###.', 'V': '#...# #...# #...# #...# #...# .#.#. ..#..',
    'W': '#...# #...# #...# #.#.# #.#.# #.#.# .#.#.', 'X': '#...# #...# .#.#. ..#.. .#.#. #...# #...#',
    'Y': '#...# #...# .#.#. ..#.. ..#.. ..#.. ..#..', 'Z': '##### ....# ...#. ..#.. .#... #.... #####',
    '0': '.###. #...# #..## #.#.# ##..# #...# .###.', '1': '..#.. .##.. ..#.. ..#.. ..#.. ..#.. .###.',
    '2': '.###. #...# ....# ...#. ..#.. .#... #####', '3': '####. ....# ....# .###. ....# ....# ####.',
    '4': '...#. ..##. .#.#. #..#. ##### ...#. ...#.', '5': '##### #.... ####. ....# ....# #...# .###.',
    '6': '..##. .#... #.... ####. #...# #...# .###.', '7': '##### ....# ...#. ..#.. .#... .#... .#...',
    '8': '.###. #...# #...# .###. #...# #...# .###.', '9': '.###. #...# #...# .#### ....# ...#. .##..',
    '.': '..... ..... ..... ..... ..... .##.. .##..', '!': '..#.. ..#.. ..#.. ..#.. ..#.. ..... ..#..',
    '-': '..... ..... ..... .###. ..... ..... .....', '>': '..... ..#.. ...#. ##### ...#. ..#.. .....',
    ' ': '..... ..... ..... ..... ..... ..... .....',
}.items()}


def band(w, h, base, line=None, line_at=None):
    """A border piece filled with `base`, with an optional one-pixel line (the window's edge) along one side."""
    a = Art(w, h, base)
    if line is not None:
        if line_at == 'bottom':
            a.hline(0, w - 1, h - 1, line)
        elif line_at == 'top':
            a.hline(0, w - 1, 0, line)
        elif line_at == 'right':
            a.vline(w - 1, 0, h - 1, line)
        elif line_at == 'left':
            a.vline(0, 0, h - 1, line)
    return a


def corner(base, line, which):
    """A corner piece: the band's ground, and the window's edge turning the corner."""
    a = Art(B, B, base)
    if line is not None:
        x = B - 1 if which in ('tl', 'bl') else 0
        y = B - 1 if which in ('tl', 'tr') else 0
        a.px(x, y, line)
    return a


def frame(id, label, hint, palette, pieces, features=()):
    return {'id': id, 'label': label, 'hint': hint, 'palette': palette, 'pieces': pieces, 'features': list(features)}


def feature(art, anchor, dx=0, dy=0):
    return {'art': art, 'anchor': anchor, 'dx': dx, 'dy': dy}


# ---------------------------------------------------------------- the frames

def pocket():
    """The Pocket Look's four greens: a dithered border, a bright edge round the photo, the little camera and its name."""
    DARK, MID, LIGHT, PALE = 0, 1, 2, 3
    def ground(w, h, inner):
        a = Art(w, h, MID)
        for y in range(h):
            for x in range(w):
                if (x + y) % 2 == 0 and (x // 2 + y // 2) % 2 == 0:
                    a.px(x, y, DARK)
        # A bright edge round the photo, a dark line outside it.
        if inner == 'bottom':
            a.hline(0, w - 1, h - 1, PALE); a.hline(0, w - 1, h - 2, DARK)
        if inner == 'top':
            a.hline(0, w - 1, 0, PALE); a.hline(0, w - 1, 1, DARK)
        if inner == 'right':
            a.vline(w - 1, 0, h - 1, PALE); a.vline(w - 2, 0, h - 1, DARK)
        if inner == 'left':
            a.vline(0, 0, h - 1, PALE); a.vline(1, 0, h - 1, DARK)
        return a
    def corner_piece(which):
        a = ground(B, B, None)
        ix, iy = (B - 1, B - 1) if which == 'tl' else (0, B - 1) if which == 'tr' else (B - 1, 0) if which == 'bl' else (0, 0)
        sx = -1 if which in ('tl', 'bl') else 1
        sy = -1 if which in ('tl', 'tr') else 1
        a.px(ix, iy, PALE); a.px(ix + sx, iy, DARK); a.px(ix, iy + sy, DARK); a.px(ix + sx, iy + sy, DARK)
        # A rivet in each corner.
        cx, cy = (5, 5) if which == 'tl' else (B - 6, 5) if which == 'tr' else (5, B - 6) if which == 'bl' else (B - 6, B - 6)
        a.rect(cx - 1, cy - 1, 2, 2, LIGHT); a.px(cx - 1, cy - 1, PALE); a.px(cx, cy, DARK)
        return a
    pieces = {'top': ground(8, B, 'bottom'), 'bottom': ground(8, B, 'top'), 'left': ground(B, 8, 'right'), 'right': ground(B, 8, 'left'),
              **{w: corner_piece(w) for w in ('tl', 'tr', 'bl', 'br')}}
    name = 'POCKET CAMERA'
    plate = Art(text_width(name) + 22, 11, None)
    plate.rect(0, 0, plate.w, plate.h, DARK)
    plate.sprite(['.3333333.', '33.333.33', '3.3...3.3', '3.3.3.3.3', '3.3...3.3', '333.3.333', '.3333333.'], 2, 2)
    plate.text(name, 14, 2, PALE)
    return frame('pocket', 'Pocket', 'The Pocket Look’s four greens, with the little camera',
                 ['#0f380f', '#306230', '#8bac0f', '#9bbc0f'], pieces, [feature(plate, 'bc', 0, -2)])


def harbour():
    """Minato's harbour: sky and clouds above with gulls and the sun, the sea below with the ferry on it, the lighthouse."""
    NAVY, SEA, SKY, FOAM = 0, 1, 2, 3
    top = Art(32, B, SKY)
    # Stepped clouds have a shaded underside rather than a flat stripe.
    top.sprite(['.....3333...........', '...333333333........', '.3333333333333......',
                '3333333333333333....', '.11111111111111.....'], 6, 3)
    top.hline(0, 31, B - 1, NAVY)
    sea = Art(16, B, SEA)
    sea.hline(0, 15, 0, NAVY)
    for x in range(16):
        crest = [1, 1, 2, 2, 2, 1, 1, 1, 1, 1, 2, 2, 2, 1, 1, 1][x]
        sea.px(x, 2 + crest, FOAM if crest == 2 else SEA)
    for x in range(16):
        sea.px(x, 3 + [0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0][(x + 4) % 16], FOAM)
    sea.rect(0, 9, 16, 7, SEA)
    for x in range(16):
        if (x * 7) % 5 == 0:
            sea.px(x, 10 + x % 3, FOAM)
    sea.rect(0, 13, 16, 3, NAVY)
    for x in range(0, 16, 4):
        sea.px(x + 1, 13, SEA)
    side_l, side_r = band(B, 16, SKY, NAVY, 'right'), band(B, 16, SKY, NAVY, 'left')
    # Quiet alternating nautical stitches keep both vertical edges intentional.
    for a, mirror in ((side_l, False), (side_r, True)):
        for x, y, colour in ((3, 2, FOAM), (4, 2, FOAM), (5, 3, FOAM),
                             (7, 8, SEA), (8, 9, SEA), (9, 8, SEA), (3, 13, FOAM)):
            a.px(B - 1 - x if mirror else x, y, colour)
    pieces = {'top': top, 'bottom': sea, 'left': side_l, 'right': side_r,
              'tl': corner(SKY, NAVY, 'tl'), 'tr': corner(SKY, NAVY, 'tr'),
              'bl': Art(B, B), 'br': Art(B, B)}
    # The bottom corners are the sea, as the bottom edge is; the sides' sky meets it at the corner.
    for k in ('bl', 'br'):
        pieces[k].paste(sea, 0, 0)
        pieces[k].px(B - 1 if k == 'bl' else 0, 0, NAVY)
    sun = Art(15, 15)
    sun.disc(7.5, 7.5, 6.5, FOAM)
    sun.ring(7.5, 7.5, 6.5, 1, NAVY)
    ferry = Art(44, 18)
    # The Minato ferry: a white hull with a blue stripe, the cabin with its windows, the funnel.
    for y in range(10, 16):
        inset = (y - 10) // 2
        ferry.hline(1 + inset, 42 - inset * 2, y, FOAM)
    ferry.hline(2, 41, 13, SEA)
    ferry.rect(12, 5, 20, 5, FOAM)
    for x in range(14, 30, 4):
        ferry.rect(x, 7, 2, 2, SEA)
    ferry.hline(14, 29, 5, NAVY)
    ferry.rect(31, 8, 4, 2, FOAM)
    ferry.px(7, 11, SEA); ferry.px(9, 11, SEA); ferry.px(33, 11, SEA)
    ferry.rect(25, 1, 4, 4, NAVY)
    ferry.hline(25, 28, 2, SEA)
    ferry.outline(NAVY)
    ferry.hline(4, 39, 17, FOAM)
    lighthouse = Art(13, 40)
    for y in range(10, 40):
        half = 2 + (y - 10) // 9
        lighthouse.hline(6 - half, 6 + half, y, FOAM if (y // 6) % 2 == 0 else SEA)
    lighthouse.rect(4, 5, 5, 5, FOAM)
    lighthouse.rect(3, 9, 7, 1, NAVY)
    lighthouse.rect(5, 1, 3, 4, NAVY)
    lighthouse.px(6, 0, NAVY)
    lighthouse.outline(NAVY)
    gulls = Art(22, 9)
    gulls.sprite(['00...00', '..0.0..', '...0...'], 0, 0)
    gulls.sprite(['0...0', '.0.0.', '..0..'], 14, 5)
    return frame('harbour', 'Harbour', 'Minato’s harbour: the ferry, the lighthouse and the gulls',
                 ['#1b2a4a', '#2f6f9f', '#9fd0ee', '#f6f3e8'], pieces,
                 [feature(sun, 'tl', 3, 1), feature(gulls, 'tr', -22, 3), feature(ferry, 'bl', 22, -1), feature(lighthouse, 'br', -3, -4)])


def sakura():
    """Sakura Shōten's blossom: a plum branch in flower along the top, petals falling down the sides."""
    PLUM, ROSE, PINK, CREAM = 0, 1, 2, 3
    def petals(w, h, seed, line_at):
        a = band(w, h, CREAM, PLUM, line_at)
        spots = [(3, 4), (11, 9), (19, 3), (7, 13), (15, 14), (22, 10)]
        for k, (x, y) in enumerate(spots):
            x, y = (x + seed * 5) % w, (y + seed * 3) % h
            if line_at == 'bottom' and y >= h - 3 or line_at == 'top' and y <= 2 or line_at == 'right' and x >= w - 3 or line_at == 'left' and x <= 2:
                continue
            if k % 2:
                a.px(x, y, PINK); a.px(x + 1, y + 1, ROSE)
            else:
                a.sprite(['.2.', '212', '.2.'], x - 1, y - 1)
        return a
    def flower_corner(which):
        a = corner(CREAM, PLUM, which)
        # A small five-petal seal in each corner, kept clear of the inner edge.
        x = 3 if which in ('tl', 'bl') else 8
        y = 3 if which in ('tl', 'tr') else 8
        a.sprite(['.222.', '22122', '21012', '22122', '.222.'], x, y)
        a.px(x + 2, y + 2, PLUM)
        return a
    pieces = {'top': petals(24, B, 0, 'bottom'), 'bottom': petals(24, B, 1, 'top'), 'left': petals(B, 24, 2, 'right'), 'right': petals(B, 24, 3, 'left'),
              **{w: flower_corner(w) for w in ('tl', 'tr', 'bl', 'br')}}
    blossom = ['.222.', '22122', '21012', '22122', '.222.']
    branch = Art(92, 26)
    # The branch: thick at the corner, thinning as it reaches along the top, with twigs.
    path = [(0, 2), (8, 5), (16, 7), (26, 8), (36, 8), (48, 7), (60, 8), (72, 10), (84, 11), (90, 11)]
    for (x0, y0), (x1, y1) in zip(path, path[1:]):
        for t in range(x1 - x0 + 1):
            x, y = x0 + t, round(y0 + (y1 - y0) * t / max(1, x1 - x0))
            thick = 3 if x < 24 else 2 if x < 60 else 1
            branch.rect(x, y, 1, thick, PLUM)
    for x0, y0, dx, dy, n in ((20, 9, 1, 1, 7), (44, 8, 1, 1, 6), (58, 8, 1, -1, 5), (70, 10, 1, 1, 5)):
        for i in range(n):
            branch.px(x0 + i * dx, y0 + i * dy, PLUM)
    for x, y in ((12, 1), (24, 13), (31, 3), (40, 12), (52, 1), (62, 13), (76, 4), (86, 13)):
        branch.sprite(blossom, x, y)
    for x, y in ((18, 4), (47, 14), (68, 6), (82, 7)):
        branch.px(x, y, ROSE); branch.px(x + 1, y, ROSE); branch.px(x, y + 1, PINK)
    # Scattered tiny buds give the branch variation between open blossoms.
    for x, y in ((5, 5), (37, 7), (57, 10), (79, 12)):
        branch.sprite(['.1.', '212', '.2.'], x, y)
    cluster = Art(26, 22)
    for x, y in ((2, 9), (10, 3), (17, 10), (9, 15)):
        cluster.sprite(blossom, x, y)
    cluster.outline(PLUM)
    branch.outline(CREAM)
    falling = Art(9, 30)
    for x, y in ((1, 2), (6, 12), (2, 22)):
        falling.px(x, y, PINK); falling.px(x + 1, y + 1, ROSE); falling.px(x + 1, y, PINK)
    return frame('sakura', 'Sakura', 'A branch of cherry blossom, as on Sakura Shōten’s sign',
                 ['#4a2238', '#c0527f', '#f3a6c3', '#fff6f1'], pieces,
                 [feature(branch, 'tl', 0, 1), feature(cluster, 'br', -2, -2), feature(falling, 'tr', -4, 18)])


def ticket():
    """The ferry ticket to Kitano-jima: paper with a kraft rule, the tear-off perforation, the route, a red stamp."""
    INK, RED, KRAFT, PAPER = 0, 1, 2, 3
    def edge(w, h, inner):
        a = band(w, h, PAPER, INK, inner)
        # A kraft rule round the ticket, four pixels in from its edge.
        if inner in ('bottom', 'top'):
            a.hline(0, w - 1, 4 if inner == 'bottom' else h - 5, KRAFT)
        else:
            a.vline(4 if inner == 'right' else w - 5, 0, h - 1, KRAFT)
        return a
    left = edge(B, 4, 'right')
    # The perforation the stub tears along.
    left.px(9, 1, INK)
    def corner_piece(which):
        a = Art(B, B, PAPER)
        x = 4 if which in ('tl', 'bl') else B - 5
        y = 4 if which in ('tl', 'tr') else B - 5
        if which in ('tl', 'bl'):
            a.hline(x, B - 1, y, KRAFT)
        else:
            a.hline(0, x, y, KRAFT)
        if which in ('tl', 'tr'):
            a.vline(x, y, B - 1, KRAFT)
        else:
            a.vline(x, 0, y, KRAFT)
        a.px(B - 1 if which in ('tl', 'bl') else 0, B - 1 if which in ('tl', 'tr') else 0, INK)
        if which in ('tl', 'bl'):
            for yy in range(1, B, 4):
                a.px(9, yy, INK)
        return a
    pieces = {'top': edge(8, B, 'bottom'), 'bottom': edge(8, B, 'top'), 'left': left, 'right': edge(B, 8, 'left'),
              **{w: corner_piece(w) for w in ('tl', 'tr', 'bl', 'br')}}
    route = 'MINATO > KITANO-JIMA'
    head = Art(text_width(route), 7)
    head.text(route, 0, 0, INK)
    admit = Art(text_width('ADMIT ONE'), 7)
    admit.text('ADMIT ONE', 0, 0, INK)
    number = Art(text_width('NO.0029'), 7)
    number.text('NO.0029', 0, 0, RED)
    stamp = Art(27, 27)
    stamp.ring(13.5, 13.5, 13, 2, RED)
    stamp.ring(13.5, 13.5, 9.5, 1, RED)
    stamp.sprite(['...1...', '...1...', '1111111', '.11111.', '..111..', '.11.11.', '11...11'], 10, 10)
    return frame('ticket', 'Ticket', 'The ferry ticket from Minato to Kitano-jima, stamped',
                 ['#2b2522', '#c8453a', '#d6c296', '#f7f0de'], pieces,
                 [feature(head, 'tc', 0, 5), feature(admit, 'bl', 20, -4), feature(number, 'br', -20, -4), feature(stamp, 'tr', -10, 19)])


def matsuri():
    """The summer matsuri at night: a string of paper lanterns along the top, fireworks in the corners, waves below."""
    NIGHT, PURPLE, AMBER, CREAM = 0, 1, 2, 3
    top = band(16, B, NIGHT, AMBER, 'bottom')
    # The string sags between lanterns, a lantern on every piece.
    for x in range(16):
        top.px(x, 2 + (1 if 3 < x < 12 else 0), PURPLE)
    top.sprite(['.111.', '22222', '23322', '22222', '23322', '22222', '.111.', '..2..'], 6, 4)
    bottom = band(16, B, NIGHT, AMBER, 'top')
    # Waves, seigaiha, in the night's purple.
    for cx, cy in ((4, 12), (12, 12), (8, 16), (0, 16), (16, 16)):
        for r in (5, 3):
            bottom.ring(cx, cy, r, 1, PURPLE)
    bottom.hline(0, 15, 0, AMBER)
    side = lambda line_at: band(B, 24, NIGHT, AMBER, line_at)
    left, right = side('right'), side('left')
    for a in (left, right):
        for x, y, c in ((5, 4, CREAM), (9, 13, PURPLE), (4, 19, PURPLE), (10, 21, CREAM)):
            a.px(x if a is left else B - 1 - x, y, c)
    pieces = {'top': top, 'bottom': bottom, 'left': left, 'right': right,
              'tl': corner(NIGHT, AMBER, 'tl'), 'tr': corner(NIGHT, AMBER, 'tr'), 'bl': corner(NIGHT, AMBER, 'bl'), 'br': corner(NIGHT, AMBER, 'br')}
    def firework(size, colour, tip):
        a = Art(size, size)
        c = size / 2
        import math
        for k in range(12):
            ang = k * math.pi / 6
            for r in range(3, int(c) - 1):
                a.px(int(c + math.cos(ang) * r), int(c + math.sin(ang) * r), colour if r < c - 3 else tip)
        a.px(int(c), int(c), CREAM)
        return a
    name = 'MINATO MATSURI'
    title = Art(text_width(name) + 1, 8)
    title.text(name, 0, 0, CREAM, shadow=PURPLE)
    return frame('matsuri', 'Matsuri', 'The summer festival at night: lanterns and fireworks',
                 ['#1b1a3a', '#5b3f8c', '#eda23c', '#fbefd2'], pieces,
                 [feature(firework(17, AMBER, CREAM), 'bl', -1, 1), feature(firework(17, PURPLE, AMBER), 'br', 1, 1), feature(title, 'bc', 0, -4)])


def hello():
    """Thuan waves from the corner of the photo: her Pixar sticker, redrawn in four shades, saying her own "Hi there!".
    The shades are hers: ink for her hair and polo, the brown of her shorts, a light skin that lit skin falls to (not the
    paper, which keeps to her white shoes and the border), and paper."""
    INK, TEAL, TAN, PAPER = 0, 1, 2, 3
    palette = ['#2a2420', '#8a5a44', '#efc4a4', '#fbf6ea']
    def edge(w, h, inner):
        a = band(w, h, PAPER, INK, inner)
        if inner in ('bottom', 'top'):
            a.hline(0, w - 1, 3 if inner == 'bottom' else h - 4, TEAL)
        else:
            a.vline(3 if inner == 'right' else w - 4, 0, h - 1, TEAL)
        return a
    def corner_piece(which):
        a = Art(B, B, PAPER)
        x = 3 if which in ('tl', 'bl') else B - 4
        y = 3 if which in ('tl', 'tr') else B - 4
        (a.hline(x, B - 1, y, TEAL) if which in ('tl', 'bl') else a.hline(0, x, y, TEAL))
        (a.vline(x, y, B - 1, TEAL) if which in ('tl', 'tr') else a.vline(x, 0, y, TEAL))
        a.px(B - 1 if which in ('tl', 'bl') else 0, B - 1 if which in ('tl', 'tr') else 0, INK)
        return a
    pieces = {'top': edge(8, B, 'bottom'), 'bottom': edge(8, B, 'top'), 'left': edge(B, 8, 'right'), 'right': edge(B, 8, 'left'),
              **{w: corner_piece(w) for w in ('tl', 'tr', 'bl', 'br')}}
    thuan = sticker_sprite(ROOT / 'camera' / 'stickers' / 'thuan-pixar' / 'Wave.webp', height=72, palette=palette, border=24)
    # Her sticker's own line, "Chào nha!", in its checked English (art/stickers/thuan/stickers.json): the frame's
    # letters are A to Z.
    words = 'HI THERE!'
    bubble = Art(text_width(words) + 9, 17)
    bubble.rect(1, 0, bubble.w - 2, 12, PAPER)
    bubble.rect(0, 1, bubble.w, 10, PAPER)
    bubble.text(words, 5, 3, INK)
    bubble.sprite(['3333', '.333', '..33', '...3'], bubble.w - 9, 12)
    bubble.outline(INK)
    return frame('hello', 'Hello', 'Thuan waves from the corner: “Hi there!”', palette, pieces,
                 [feature(thuan, 'br', -3, 0), feature(bubble, 'br', -3 - thuan.w + 6, -thuan.h + 4)])


def lab(rgb):
    """sRGB to CIELAB (D65): colours matched as the eye sees them, so a dark frame of glasses on skin goes to ink."""
    def lin(c):
        c /= 255
        return c / 12.92 if c <= .04045 else ((c + .055) / 1.055) ** 2.4
    r, g, b = (lin(c) for c in rgb)
    x, y, z = (r * .4124 + g * .3576 + b * .1805) / .95047, r * .2126 + g * .7152 + b * .0722, (r * .0193 + g * .1192 + b * .9505) / 1.08883
    f = lambda t: t ** (1 / 3) if t > .008856 else 7.787 * t + 16 / 116
    fx, fy, fz = f(x), f(y), f(z)
    return 116 * fy - 16, 500 * (fx - fy), 200 * (fy - fz)


def sticker_sprite(path, height, palette, border=0, crop_bottom=None):
    """A resident's sticker (the camera's, without lettering) as pixel art: its die-cut border taken off (`border` source
    pixels, so white hair is not lost in white paper), reduced to `height` pixels, each pixel the nearest of the four
    shades as the eye sees colour, then an ink line round the figure and a paper rim round that, as the sticker's own
    cut. `crop_bottom` cuts off anything under the figure (a lettered sticker's words)."""
    from PIL import ImageFilter, ImageChops
    im = Image.open(path).convert('RGBA')
    if crop_bottom:
        im = im.crop((0, 0, im.width, crop_bottom))
    if border:
        alpha = im.getchannel('A').point(lambda a: 255 if a > 128 else 0)
        for _ in range(max(1, border // 4)):
            alpha = alpha.filter(ImageFilter.MinFilter(9))
        # The die-cut also fills the gaps a figure encloses (between a raised arm and the head): it is pure white, which
        # the figure's own whites (hair, a shirt) are not, being shaded.
        r, g, b, _ = im.split()
        die = ImageChops.multiply(ImageChops.multiply(r.point(lambda v: 255 if v >= 250 else 0), g.point(lambda v: 255 if v >= 250 else 0)), b.point(lambda v: 255 if v >= 250 else 0))
        im.putalpha(ImageChops.subtract(alpha, die))
    im = im.crop(im.getbbox())
    w = max(1, round(im.width * height / im.height))
    small = im.resize((w, height), Image.LANCZOS)
    cols = [lab(hexrgb(c)) for c in palette]
    def nearest(rgb):
        L, a, b = lab(rgb)
        # Colour counts a little more than lightness, so lit skin stays skin and does not turn to paper.
        return min(range(len(cols)), key=lambda i: (L - cols[i][0]) ** 2 + 2.2 * ((a - cols[i][1]) ** 2 + (b - cols[i][2]) ** 2))
    art = Art(w + 4, height + 2)
    for y in range(height):
        for x in range(w):
            r, g, b, a = small.getpixel((x, y))
            if a >= 128:
                art.px(x + 2, y, nearest((r, g, b)))
    art.outline(0)
    art.outline(len(palette) - 1)
    return art


def island_post():
    """An original Minato postcard, with a postage stamp and a small island skyline."""
    INK, CORAL, SAND, PAPER = 0, 1, 2, 3
    def edge(w, h, side):
        a = band(w, h, PAPER, INK, side)
        if side in ('top', 'bottom'):
            y = 3 if side == 'bottom' else h - 4
            for x in range(w):
                a.px(x, y, CORAL if (x // 4) % 2 == 0 else SAND)
        else:
            x = 3 if side == 'right' else w - 4
            for y in range(h):
                a.px(x, y, CORAL if (y // 4) % 2 == 0 else SAND)
        return a
    pieces = {'top': edge(16, B, 'bottom'), 'bottom': edge(16, B, 'top'),
              'left': edge(B, 16, 'right'), 'right': edge(B, 16, 'left'),
              **{k: corner(PAPER, INK, k) for k in ('tl','tr','bl','br')}}
    title = Art(text_width('MINATO POST') + 8, 11, PAPER)
    title.text('MINATO POST', 4, 2, INK)
    stamp = Art(25, 29)
    stamp.rect(1, 1, 23, 27, PAPER)
    for x in range(1, 24, 3):
        stamp.px(x, 0, INK); stamp.px(x, 28, INK)
    for y in range(1, 28, 3):
        stamp.px(0, y, INK); stamp.px(24, y, INK)
    stamp.rect(4, 4, 17, 20, SAND)
    stamp.disc(16, 9, 3, CORAL)
    stamp.sprite(['......000........','.....01110.......','....0111110......',
                  '...011111110.....','..01111111110....','.0000000000000...',
                  '33333333333333333','11111111111111111'], 4, 15)
    stamp.outline(INK)
    # Cancellation waves make the stamp read like an actual piece of post.
    postmark = Art(28, 11)
    for row in (1, 4, 7):
        for x in range(28):
            postmark.px(x, row + ((x // 4) % 2), CORAL)
    return frame('island-post', 'Island Post', 'A postcard from Minato, with its own island stamp',
                 ['#41353b','#c45c55','#dfc995','#fff7df'], pieces,
                 [feature(title, 'bc', 0, -2), feature(stamp, 'tr', -5, 5), feature(postmark, 'tr', -27, 20)])


def shop_day():
    """An original shopfront frame: striped awning, a tiny storefront and friendly signs."""
    INK, TEAL, PEACH, CREAM = 0, 1, 2, 3
    top = Art(16, B, CREAM)
    for x in range(16):
        top.rect(x, 1, 1, 10, PEACH if (x // 4) % 2 else TEAL)
        top.px(x, 11 + (1 if x % 4 in (1, 2) else 0), INK)
    top.hline(0, 15, 15, INK)
    bottom = band(16, B, CREAM, INK, 'top')
    for x in range(16):
        if x % 8 in (2, 3): bottom.px(x, 10, PEACH)
        if x % 8 == 6: bottom.px(x, 12, TEAL)
    def side(inner):
        a = band(B, 16, CREAM, INK, inner)
        for y in range(2, 16, 8):
            a.sprite(['.2.','212','.2.'], 5, y)
        return a
    pieces = {'top':top, 'bottom':bottom, 'left':side('right'), 'right':side('left'),
              **{k:corner(CREAM, INK, k) for k in ('tl','tr','bl','br')}}
    shop = Art(40, 33)
    # A compact miniature with an outlined tiled roof, door and window displays.
    shop.rect(3, 9, 34, 22, CREAM)
    shop.rect(1, 6, 38, 6, INK)
    for x in range(3, 38, 6):
        shop.rect(x, 7, 3, 4, TEAL); shop.rect(x + 3, 7, 3, 4, PEACH)
    shop.rect(5, 14, 13, 12, INK); shop.rect(7, 16, 9, 8, TEAL)
    shop.rect(21, 13, 11, 18, INK); shop.rect(23, 15, 7, 14, CREAM)
    shop.px(28, 23, PEACH)
    shop.rect(3, 30, 34, 2, INK)
    shop.outline(INK)
    sign = Art(text_width('SHOP DAY') + 8, 11, TEAL)
    sign.text('SHOP DAY', 4, 2, CREAM)
    return frame('shop-day', 'Shop Day', 'A little Minato shop and its striped awning',
                 ['#323d3a','#4d8c83','#e68b78','#fff4de'], pieces,
                 [feature(sign, 'tc', 0, 2), feature(shop, 'bl', 2, -1)])


FRAMES = [pocket, harbour, sakura, ticket, matsuri, hello, island_post, shop_day]


# ---------------------------------------------------------------- packing and laying out

def to_image(art, palette):
    cols = [hexrgb(c) for c in palette]
    im = Image.new('RGBA', (art.w, art.h), (0, 0, 0, 0))
    for y in range(art.h):
        for x in range(art.w):
            c = art.p[y][x]
            if c is not None:
                im.putpixel((x, y), cols[c] + (255,))
    return im


def pack(f):
    """Every piece and scene of a frame in one sheet, a pixel apart; returns the sheet and the description."""
    items = [(k, f['pieces'][k]) for k in ('tl', 'tr', 'bl', 'br', 'top', 'bottom', 'left', 'right')] + [(f'f{i}', ft['art']) for i, ft in enumerate(f['features'])]
    width = max(128, max(a.w for _, a in items))
    x = y = row = 0
    rects = {}
    for k, a in items:
        if x + a.w > width:
            x, y, row = 0, y + row + 1, 0
        rects[k] = [x, y, a.w, a.h]
        x += a.w + 1
        row = max(row, a.h)
    sheet = Image.new('RGBA', (width, y + row), (0, 0, 0, 0))
    for k, a in items:
        sheet.alpha_composite(to_image(a, f['palette']), tuple(rects[k][:2]))
    meta = {'id': f['id'], 'label': f['label'], 'hint': f['hint'], 'border': B, 'short': SHORT,
            'pieces': {k: rects[k] for k in ('tl', 'tr', 'bl', 'br', 'top', 'bottom', 'left', 'right')},
            'features': [{'rect': rects[f'f{i}'], 'anchor': ft['anchor'], 'dx': ft['dx'], 'dy': ft['dy']} for i, ft in enumerate(f['features'])]}
    return sheet, meta


def grid(aspect):
    """The frame's own size for a photo of shape `aspect` (width / height): its short side is 144 pixels."""
    return (round(SHORT * aspect), SHORT) if aspect >= 1 else (SHORT, round(SHORT / aspect))


def place(anchor, w, h, fw, fh, dx, dy):
    """Where a scene of fw x fh goes against `anchor` of a w x h frame (the scene's own matching point at the anchor)."""
    ax = {'l': 0, 'c': .5, 'r': 1}[anchor[1]]
    ay = {'t': 0, 'm': .5, 'b': 1}[anchor[0]]
    return round(ax * w - ax * fw + dx), round(ay * h - ay * fh + dy)


def compose(sheet, meta, w, h):
    """The frame laid out at w x h frame pixels, as frames.js lays it out."""
    out = Image.new('RGBA', (w, h), (0, 0, 0, 0))
    p = meta['pieces']
    def piece(k):
        x, y, pw, ph = p[k]
        return sheet.crop((x, y, x + pw, y + ph))
    b = meta['border']
    # The edges, repeated from the middle outwards so a pattern is centred, kept between the corners.
    for side in ('top', 'bottom'):
        tile = piece(side)
        span = w - 2 * b
        n = -(-span // tile.width) + 1
        start = b + (span - n * tile.width) // 2
        strip = Image.new('RGBA', (w, tile.height), (0, 0, 0, 0))
        for i in range(n):
            strip.alpha_composite(tile, (start + i * tile.width, 0))
        strip = strip.crop((b, 0, w - b, tile.height))
        out.alpha_composite(strip, (b, 0 if side == 'top' else h - tile.height))
    for side in ('left', 'right'):
        tile = piece(side)
        span = h - 2 * b
        n = -(-span // tile.height) + 1
        start = b + (span - n * tile.height) // 2
        strip = Image.new('RGBA', (tile.width, h), (0, 0, 0, 0))
        for i in range(n):
            strip.alpha_composite(tile, (0, start + i * tile.height))
        strip = strip.crop((0, b, tile.width, h - b))
        out.alpha_composite(strip, (0 if side == 'left' else w - tile.width, b))
    for k, (x, y) in (('tl', (0, 0)), ('tr', (w - b, 0)), ('bl', (0, h - b)), ('br', (w - b, h - b))):
        out.alpha_composite(piece(k), (x, y))
    for ft in meta['features']:
        x, y, fw, fh = ft['rect']
        art = sheet.crop((x, y, x + fw, y + fh))
        px, py = place(ft['anchor'], w, h, fw, fh, ft['dx'], ft['dy'])
        layer = Image.new('RGBA', (w, h), (0, 0, 0, 0))
        layer.paste(art, (px, py))
        out.alpha_composite(layer)
    return out


def build(out=OUT, quiet=False):
    """Draws every frame into `out`: <id>.png and frames.json. Returns [(sheet, meta)]."""
    out.mkdir(parents=True, exist_ok=True)
    built = []
    for make in FRAMES:
        f = make()
        sheet, meta = pack(f)
        sheet.save(out / f"{f['id']}.png", optimize=True)
        built.append((sheet, meta))
        if not quiet:
            print(out / f"{f['id']}.png", sheet.size)
    (out / 'frames.json').write_text(json.dumps({'frames': [m for _, m in built]}, ensure_ascii=False, indent=1) + '\n')
    return built


def main():
    built = build()
    if '--preview' in sys.argv:
        target = Path(sys.argv[sys.argv.index('--preview') + 1])
        photo = Image.open(ROOT / 'IMG_2855.jpeg').convert('RGBA')
        shapes = [4 / 3, 3 / 4, 16 / 9]
        cells = []
        for sheet, meta in built:
            row = []
            for aspect in shapes:
                w, h = grid(aspect)
                pic = photo.copy()
                s = max(w / pic.width, h / pic.height)
                pic = pic.resize((round(pic.width * s), round(pic.height * s)), Image.LANCZOS)
                pic = pic.crop(((pic.width - w) // 2, (pic.height - h) // 2, (pic.width - w) // 2 + w, (pic.height - h) // 2 + h))
                pic.alpha_composite(compose(sheet, meta, w, h))
                row.append(pic.resize((w * 2, h * 2), Image.NEAREST))
            cells.append(row)
        cw = sum(im.width for im in cells[0]) + 20 * (len(shapes) - 1)
        ch = max(im.height for im in cells[0])
        out = Image.new('RGB', (cw, (ch + 20) * len(cells)), (40, 40, 44))
        for r, row in enumerate(cells):
            x = 0
            for im in row:
                out.paste(im, (x, r * (ch + 20)), im)
                x += im.width + 20
        out.save(target)
        print('preview', target, out.size)


if __name__ == '__main__':
    main()

