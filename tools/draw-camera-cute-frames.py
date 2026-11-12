#!/usr/bin/env python3
"""Pocket Camera's drawn frames, in the icons' hand (the owner, 12 November 2026: "Redraw the frames too, in python,
make them more playful and cute, similar style to the icons").

Until then Print, Panel and Film were drawn by frames.js itself, plainly: a white card, an inked rule, a strip of film.
These are drawn here, with the shapes the icons are drawn with (tools/draw-camera-icons.py: rounded corners, chunky
hearts and stars, nothing thin), in soft colours beside the World's ink, green and cream. Print, Panel and Film keep
their names and are redrawn; Scallop, Hearts, Starry, Tape, Clouds, Stamp and Confetti are new.

A photo may be any shape and any size, from a thumbnail to sixteen megapixels, so a frame is not a picture: it is a
description frames.js draws at the photo's own size. Every measure is in units of a hundredth of the photo's shorter
side:

  inset    the border's width at the top, right, bottom and left
  radius   the corners of the window the photo shows through
  ground   the border's colour;  rim  an inked line round the window
  runs     a shape repeated along sides, turned to face each side (scallops, perforations, a film's holes);
           one marked `stretch` is widened to meet its neighbours (a row of scallops, a bank of cloud)
  motifs   a shape repeated along sides, always upright (hearts, stars, dots)
  marks    single shapes set against a corner or an edge (a strip of tape, a sun, a postmark)

Shapes are SVG path data. A run's path is drawn with x along the side and y toward the middle of the photo; a motif's
and a mark's are centred on (0, 0). A count is chosen so a side is filled evenly, the shapes spaced a little wider or
closer, never stretched.

    python3 tools/draw-camera-cute-frames.py [--preview out.svg]     writes camera/frames/cute.json
"""
import importlib.util
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / 'camera' / 'frames' / 'cute.json'
spec = importlib.util.spec_from_file_location('icons', ROOT / 'tools' / 'draw-camera-icons.py')
kit = importlib.util.module_from_spec(spec)
spec.loader.exec_module(kit)
rrect, circle, ellipse, poly, star, burst, heart, n, pt = kit.rrect, kit.circle, kit.ellipse, kit.poly, kit.star, kit.burst, kit.heart, kit.n, kit.pt

# The World's ink, green and cream, and the soft colours that go with them.
INK, GREEN, CREAM, WHITE = '#263d39', '#16815e', '#fbf7ec', '#ffffff'
MINT, PINK, ROSE, BUTTER, SUN, SKY = '#c4ead6', '#f9cdd6', '#ee7f97', '#f9e29a', '#f4c13d', '#c3e4f3'


def centred(cx, cy, w, h, r):
    return rrect(cx - w / 2, cy - h / 2, w, h, r)


def frames():
    out = []

    # Print: an instant print with a deeper foot, the window's corners soft, a heart where the caption would go.
    out.append({'id': 'print', 'label': 'Print', 'hint': 'An instant print: a cream card with a deeper foot and a little heart',
                'inset': [5.5, 5.5, 19, 5.5], 'radius': 2.6, 'ground': CREAM,
                'marks': [{'d': heart(0, 0, 3.3), 'fill': ROSE, 'at': [1, 1], 'dx': -12.5, 'dy': -9.2, 'rotate': -8}]})

    # Panel: a comic panel, its rule thick and round, a burst breaking the corner.
    out.append({'id': 'panel', 'label': 'Panel', 'hint': 'A comic panel: a thick inked rule on white, a burst breaking its corner',
                'inset': [5, 5, 5, 5], 'radius': 1.8, 'ground': WHITE, 'rim': {'colour': INK, 'width': 1.5},
                'marks': [{'d': burst(0, 0, 8.6, 10, .7, .5), 'fill': SUN, 'stroke': INK, 'width': 1.1, 'at': [0, 0], 'dx': 9.2, 'dy': 9.2, 'rotate': -10}]})

    # Film: a strip with round-cornered holes; the bands lie along the photo's longer sides.
    out.append({'id': 'film', 'label': 'Film', 'hint': 'A strip of film, its holes round-cornered',
                'inset': [12, 1.8, 12, 1.8], 'turn': True, 'radius': 1.4, 'ground': '#1d2b29',
                'runs': [{'sides': 'tb', 'at': 'outer', 'tile': 8.8, 'pad': 2, 'd': centred(4.4, 5.2, 5.2, 4.2, 1.5), 'fill': '#efe9d9'}]})

    # Scallop: a soft pink mount whose window is cut in scallops.
    bump = 'M-.1 -.3H4.7V0A2.35 2.35 0 0 1 -.1 0Z'
    out.append({'id': 'scallop', 'label': 'Scallop', 'hint': 'A pink mount, its window cut in scallops',
                'inset': [7, 7, 7, 7], 'radius': 0, 'ground': PINK,
                'runs': [{'sides': 'tblr', 'at': 'inner', 'tile': 4.6, 'stretch': True, 'd': bump, 'fill': PINK}]})

    # Hearts: hearts round a cream card, two pinks in turn.
    out.append({'id': 'hearts', 'label': 'Hearts', 'hint': 'Hearts all the way round a cream card',
                'inset': [7.6, 7.6, 7.6, 7.6], 'radius': 3.2, 'ground': CREAM,
                'motifs': [{'sides': 'tblr', 'tile': 18, 'pad': 7.6, 'depth': 3.9, 'shift': -.25, 'd': heart(0, 0, 2.3), 'fill': ROSE},
                           {'sides': 'tblr', 'tile': 18, 'pad': 7.6, 'depth': 3.9, 'shift': .25, 'd': heart(0, 0, 1.7), 'fill': '#f4a9b8'}],
                'marks': [{'d': heart(0, 0, 2.3), 'fill': ROSE, 'at': [ax, ay], 'dx': 3.9 if ax == 0 else -3.9, 'dy': 3.9 if ay == 0 else -3.9} for ax in (0, 1) for ay in (0, 1)]})

    # Starry: a night border with stars, and a moon in the corner.
    moon = f'M{pt(1.2, -4.4)}A4.6 4.6 0 1 0 {pt(4.4, 1.6)}A3.6 3.6 0 0 1 {pt(1.2, -4.4)}Z'
    out.append({'id': 'starry', 'label': 'Starry', 'hint': 'A night border with stars and a moon',
                'inset': [7.6, 7.6, 7.6, 7.6], 'radius': 3.2, 'ground': '#22363a',
                'motifs': [{'sides': 'tblr', 'tile': 20, 'pad': 9, 'depth': 3.8, 'shift': -.22, 'd': star(0, 0, 2.6, 5, .5, .5), 'fill': SUN},
                           {'sides': 'tblr', 'tile': 20, 'pad': 9, 'depth': 4.6, 'shift': .26, 'd': star(0, 0, 1.4, 5, .5, .3), 'fill': BUTTER}],
                'marks': [{'d': moon, 'fill': BUTTER, 'at': [1, 0], 'dx': -5.2, 'dy': 5.4, 'rotate': 12}]})

    # Tape: the photo taped to cream paper at its four corners.
    tape = centred(0, 0, 21, 6.2, 1.1)
    stripes = ''.join(centred(x, 0, 1.5, 6.2, .2) for x in (-6.4, -2.1, 2.1, 6.4))
    corner = lambda ax, ay, turn: [{'d': tape, 'fill': MINT, 'at': [ax, ay], 'dx': 8.4 if ax == 0 else -8.4, 'dy': 7.6 if ay == 0 else -7.6, 'rotate': turn},
                                   {'d': stripes, 'fill': WHITE, 'opacity': .62, 'at': [ax, ay], 'dx': 8.4 if ax == 0 else -8.4, 'dy': 7.6 if ay == 0 else -7.6, 'rotate': turn}]
    out.append({'id': 'tape', 'label': 'Tape', 'hint': 'Taped to cream paper at its four corners',
                'inset': [6, 6, 6, 6], 'radius': 1.2, 'ground': '#f6f1e3',
                'marks': corner(0, 0, -38) + corner(1, 0, 38) + corner(0, 1, 38) + corner(1, 1, -38)})

    # Clouds: a sky border, clouds along its foot, a sun in the corner.
    # One outline (a band the border's depth, three bumps toward the photo), stretched so the clouds join.
    cloud = f'M-.2 -9.8H17V.3A3.4 3.4 0 0 1 {pt(10.9, 1.5)}A4.5 4.5 0 0 1 {pt(3.9, 1.1)}A3 3 0 0 1 {pt(-.2, .3)}Z'
    rays = ''.join(poly([kit.on(0, 0, 6.4, a - 9), kit.on(0, 0, 9, a), kit.on(0, 0, 6.4, a + 9)], .4) for a in range(0, 360, 45))
    out.append({'id': 'clouds', 'label': 'Clouds', 'hint': 'A sky border with clouds along its foot and a sun',
                'inset': [7, 7, 9.5, 7], 'radius': 3.2, 'ground': SKY,
                'runs': [{'sides': 'b', 'at': 'inner', 'tile': 16.8, 'stretch': True, 'd': cloud, 'fill': WHITE}],
                'marks': [{'d': rays, 'fill': SUN, 'at': [1, 0], 'dx': -8.4, 'dy': 8.4}, {'d': circle(0, 0, 5), 'fill': '#f8d25c', 'at': [1, 0], 'dx': -8.4, 'dy': 8.4}]})

    # Stamp: a postage stamp, perforated, with its postmark.
    wave = lambda y: f'M{pt(-9, y)}Q{pt(-6.75, y - 1.6)} {pt(-4.5, y)}T{pt(0, y)}T{pt(4.5, y)}T{pt(9, y)}'
    out.append({'id': 'stamp', 'label': 'Stamp', 'hint': 'A postage stamp, perforated, with its postmark',
                'inset': [7.8, 7.8, 7.8, 7.8], 'radius': .8, 'ground': WHITE,
                'runs': [{'sides': 'tblr', 'at': 'outer', 'tile': 4.8, 'd': circle(2.4, 0, 1.55), 'fill': INK}],
                'marks': [{'d': circle(0, 0, 7.4), 'stroke': INK, 'width': 1, 'opacity': .6, 'at': [1, 1], 'dx': -13, 'dy': -12.6},
                          {'d': circle(0, 0, 5), 'stroke': INK, 'width': .8, 'opacity': .6, 'at': [1, 1], 'dx': -13, 'dy': -12.6},
                          {'d': wave(-2.2) + wave(0) + wave(2.2), 'stroke': INK, 'width': .8, 'opacity': .6, 'at': [1, 1], 'dx': -26, 'dy': -12.6}]})

    # Confetti: a mint border with white dots.
    out.append({'id': 'confetti', 'label': 'Confetti', 'hint': 'A mint border sprinkled with dots',
                'inset': [7.6, 7.6, 7.6, 7.6], 'radius': 3.2, 'ground': MINT,
                'motifs': [{'sides': 'tblr', 'tile': 12, 'pad': 7.6, 'depth': 2.7, 'shift': -.25, 'd': circle(0, 0, 1.35), 'fill': WHITE},
                           {'sides': 'tblr', 'tile': 12, 'pad': 7.6, 'depth': 5, 'shift': .25, 'd': circle(0, 0, 1.0), 'fill': '#8fd3b4'}],
                'marks': [{'d': circle(0, 0, 1.35), 'fill': WHITE, 'at': [ax, ay], 'dx': 3.8 if ax == 0 else -3.8, 'dy': 3.8 if ay == 0 else -3.8} for ax in (0, 1) for ay in (0, 1)]})
    return out


def main():
    data = {'unit': 'a hundredth of the photo’s shorter side', 'frames': frames()}
    OUT.write_text(json.dumps(data, indent=1, ensure_ascii=False) + '\n')
    print(f"{len(data['frames'])} frames → {OUT.relative_to(ROOT)} ({OUT.stat().st_size} bytes)")


if __name__ == '__main__':
    main()
