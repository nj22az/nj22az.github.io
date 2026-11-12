#!/usr/bin/env python3
"""Pocket Camera's drawn frames, in the icons' hand (the owner, 12 November 2026: "Redraw the frames too, in python,
make them more playful and cute, similar style to the icons").

Until then Print, Panel and Film were drawn by frames.js itself, plainly: a white card, an inked rule, a strip of film.
These are drawn here, with the shapes the icons are drawn with (tools/draw-camera-icons.py: rounded corners, chunky
hearts and stars, nothing thin), in soft colours beside the World's ink, green and cream. Print, Panel and Film keep
their names and are redrawn; Scallop, Hearts, Starry, Tape, Clouds, Stamp and Confetti are new, and so are the
playful ones (the owner, the same day, of the pixel frames: "walk away from the Gameboy arts, but keep the playfulness
from Gameboy Camera"): Peekaboo, Telly, Harbour, Blossom, Festival and Ticket.

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

A face cutout (`cutouts()`, below) is a whole painted board with a hole in it, drawn over the picture.

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

    # Film: a strip with round-cornered holes; the bands lie along the photo's longer sides. Its edge print is the one
    # lettering on any frame, kept from the brand round of 9 November 2026: the stock's name and frame number on the
    # near edge, its maker, Johansson World, on the far one, in the amber a film's edge is exposed with. `edge` is
    # the band (near: top, or left when turned), `at` how far along it, `away` how far in from the photo's edge.
    out.append({'id': 'film', 'label': 'Film', 'hint': 'A strip of film, its holes round-cornered',
                'inset': [12, 1.8, 12, 1.8], 'turn': True, 'radius': 1.4, 'ground': '#1d2b29',
                'runs': [{'sides': 'tb', 'at': 'outer', 'tile': 8.8, 'pad': 2, 'd': centred(4.4, 5.2, 5.2, 4.2, 1.5), 'fill': '#efe9d9'}],
                'print': {'colour': '#e7a23b', 'size': 2.4, 'away': 10.3, 'words': [
                    {'text': 'MINATO 400', 'edge': 'near', 'at': .06, 'align': 'left'}, {'text': '▶ 12', 'edge': 'near', 'at': .94, 'align': 'right'},
                    {'text': 'JOHANSSON WORLD', 'edge': 'far', 'at': .06, 'align': 'left'}, {'text': '12A', 'edge': 'far', 'at': .5, 'align': 'center'}]}})

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

    # ---- Playful ones, as the hand-held camera's frames were: somebody looking in, a scene round the picture. ----
    # Peekaboo: a cat looking over the foot of the picture, its paws on the edge.
    CAT, EAR, PAW = '#f3b562', '#f9cdd6', '#fbe6c4'
    cat = [
        {'d': poly([(-11.6, -5), (-9.4, -13.2), (-3.4, -8.6)], 1.2) + ' ' + poly([(11.6, -5), (9.4, -13.2), (3.4, -8.6)], 1.2), 'fill': CAT},
        {'d': poly([(-9.8, -6.6), (-8.8, -10.8), (-5.4, -8.4)], .6) + ' ' + poly([(9.8, -6.6), (8.8, -10.8), (5.4, -8.4)], .6), 'fill': EAR},
        {'d': f'M-13 6.2V-1A13 9.6 0 0 1 13 -1V6.2Z', 'fill': CAT},
        {'d': circle(-4.8, -3.4, 1.35) + circle(4.8, -3.4, 1.35), 'fill': INK},
        {'d': poly([(-1.3, -1.2), (1.3, -1.2), (0, .5)], .4), 'fill': ROSE},
        {'d': f'M-2.6 1.2Q-1.3 2.6 0 1.2Q1.3 2.6 2.6 1.2', 'stroke': INK, 'width': .7},
        {'d': ellipse(-9.4, .3, 3, 2) + ellipse(9.4, .3, 3, 2), 'fill': PAW},
    ]
    out.append({'id': 'peek', 'label': 'Peekaboo', 'hint': 'A cat looking over the foot of the picture',
                'inset': [6, 6, 6, 6], 'radius': 3, 'ground': CREAM,
                'marks': [{**part, 'at': [.5, 1], 'dy': -6} for part in cat]})

    # Telly: the picture on a little television, its dials and its speaker at the side.
    dial = lambda dy: [{'d': circle(0, 0, 3.7), 'fill': CREAM, 'at': [1, 0], 'dx': -9.6, 'dy': dy},
                       {'d': rrect(-.6, -3.1, 1.2, 3.4, .6), 'fill': INK, 'at': [1, 0], 'dx': -9.6, 'dy': dy, 'rotate': 35 if dy < 20 else -50}]
    out.append({'id': 'telly', 'label': 'Telly', 'hint': 'The picture on a little television, with its two dials',
                'inset': [7.5, 19, 7.5, 7.5], 'radius': 5, 'ground': '#ef8a6b', 'rim': {'colour': INK, 'width': 1.3},
                'marks': dial(15) + dial(27) + [{'d': centred(0, 0, 9.4, 1.5, .75), 'fill': INK, 'opacity': .45, 'at': [1, 1], 'dx': -9.6, 'dy': -dy} for dy in (11, 15, 19)]})

    # Harbour: the sea along the foot, a sailing boat on it, the lighthouse at the corner.
    sea = 'M-.2 -11.4H12.2V.2Q9.1 2.4 6 .2T-.2 .2Z'
    boat = [{'d': poly([(-6, -2.2), (6, -2.2), (4, 1.2), (-4, 1.2)], .8), 'fill': CREAM},
            {'d': poly([(-.5, -12), (-.5, -3.4), (-6, -3.4)], .6), 'fill': WHITE},
            {'d': poly([(.9, -9.6), (.9, -3.4), (4.8, -3.4)], .6), 'fill': ROSE}]
    light = [{'d': poly([(-2.6, 0), (2.6, 0), (1.7, -11), (-1.7, -11)], .4), 'fill': WHITE},
             {'d': poly([(-2.25, -4.4), (2.25, -4.4), (2, -7.6), (-2, -7.6)], .2), 'fill': ROSE},
             {'d': rrect(-2.2, -14.4, 4.4, 3.6, .9), 'fill': SUN},
             {'d': poly([(-2.8, -14.2), (2.8, -14.2), (0, -17)], .5), 'fill': INK}]
    out.append({'id': 'harbour-day', 'label': 'Harbour', 'hint': 'The sea along the foot, a sailing boat and the lighthouse',
                'inset': [6.5, 6.5, 11, 6.5], 'radius': 3.2, 'ground': SKY,
                'runs': [{'sides': 'b', 'at': 'inner', 'tile': 12, 'stretch': True, 'd': sea, 'fill': '#4aa79a'}],
                'marks': [{**part, 'at': [.26, 1], 'dy': -11} for part in boat] + [{**part, 'at': [1, 1], 'dx': -11, 'dy': -9.6} for part in light]})

    # Blossom: cherry blossom round a pale card.
    flower = star(0, 0, 3, 5, .6, 1.3)
    out.append({'id': 'blossom', 'label': 'Blossom', 'hint': 'Cherry blossom round a pale pink card',
                'inset': [7.6, 7.6, 7.6, 7.6], 'radius': 3.2, 'ground': '#fdebf0',
                'motifs': [{'sides': 'tblr', 'tile': 22, 'pad': 9, 'depth': 3.8, 'shift': -.24, 'd': flower, 'fill': '#f29bb0'},
                           {'sides': 'tblr', 'tile': 22, 'pad': 9, 'depth': 3.8, 'shift': -.24, 'd': circle(0, 0, .9), 'fill': BUTTER},
                           {'sides': 'tblr', 'tile': 22, 'pad': 9, 'depth': 4.4, 'shift': .25, 'd': ellipse(0, 0, 1.7, 1.05), 'fill': '#f7c2ce'}],
                'marks': [m for ax in (0, 1) for ay in (0, 1) for m in (
                    {'d': flower, 'fill': '#f29bb0', 'at': [ax, ay], 'dx': 4 if ax == 0 else -4, 'dy': 4 if ay == 0 else -4, 'rotate': 20},
                    {'d': circle(0, 0, .9), 'fill': BUTTER, 'at': [ax, ay], 'dx': 4 if ax == 0 else -4, 'dy': 4 if ay == 0 else -4})]})

    # Festival: paper lanterns strung along the top of a night border.
    out.append({'id': 'festival', 'label': 'Festival', 'hint': 'Paper lanterns strung along the top, at night',
                'inset': [12.5, 6.5, 6.5, 6.5], 'radius': 3.2, 'ground': '#2b3152',
                'runs': [{'sides': 't', 'at': 'outer', 'tile': 13, 'stretch': True, 'd': rrect(-.2, 2.2, 13.4, .7, 0), 'fill': BUTTER},
                         {'sides': 't', 'at': 'outer', 'tile': 13, 'd': ellipse(6.5, 7.1, 3.1, 3.7), 'fill': '#ea5a48'},
                         {'sides': 't', 'at': 'outer', 'tile': 13, 'd': rrect(5.1, 2.6, 2.8, 1.3, .4) + rrect(5.1, 10.3, 2.8, 1.3, .4), 'fill': SUN},
                         {'sides': 't', 'at': 'outer', 'tile': 13, 'd': rrect(4.4, 6.6, 4.2, .9, .45), 'fill': '#f9b3a6'}]})

    # Ticket: the ferry ticket, its stub torn along the dots.
    out.append({'id': 'ticket-day', 'label': 'Ticket', 'hint': 'A ferry ticket with its stub and a star',
                'inset': [7, 7, 7, 14.5], 'radius': 1.8, 'ground': BUTTER,
                'runs': [{'sides': 'l', 'at': 'outer', 'tile': 3.6, 'pad': 3, 'd': circle(1.8, 12.4, .6), 'fill': INK}],
                'marks': [{'d': circle(0, 0, 2.4), 'fill': INK, 'at': [0, 0], 'dx': 12.4, 'dy': 0}, {'d': circle(0, 0, 2.4), 'fill': INK, 'at': [0, 1], 'dx': 12.4, 'dy': 0},
                          {'d': star(0, 0, 3.6, 5, .5, .6), 'fill': GREEN, 'at': [0, .5], 'dx': 6, 'dy': -7},
                          {'d': ''.join(centred(0, y, 6.4, 1.1, .5) for y in (0, 2.6, 5.2)), 'fill': INK, 'opacity': .55, 'at': [0, .5], 'dx': 6, 'dy': 3}]})
    # ---- The year (the owner, 12 November 2026: "And frames too"). ----
    # Tết: a red card, apricot blossom in gold all round.
    bloom = ''.join(circle(*kit.on(0, 0, 1.75, a), 1.35) for a in range(0, 360, 72))
    out.append({'id': 'tet', 'label': 'Tết', 'hint': 'A red card with golden apricot blossom, for the lunar New Year',
                'inset': [7.6, 7.6, 7.6, 7.6], 'radius': 3.2, 'ground': '#d8432f', 'rim': {'colour': SUN, 'width': .7},
                'motifs': [{'sides': 'tblr', 'tile': 15, 'pad': 8, 'depth': 3.8, 'd': bloom, 'fill': SUN},
                           {'sides': 'tblr', 'tile': 15, 'pad': 8, 'depth': 3.8, 'd': circle(0, 0, .75), 'fill': '#d8432f'}],
                'marks': [m for ax in (0, 1) for ay in (0, 1) for m in (
                    {'d': bloom, 'fill': BUTTER, 'at': [ax, ay], 'dx': 3.9 if ax == 0 else -3.9, 'dy': 3.9 if ay == 0 else -3.9, 'rotate': 36},
                    {'d': circle(0, 0, .75), 'fill': '#d8432f', 'at': [ax, ay], 'dx': 3.9 if ax == 0 else -3.9, 'dy': 3.9 if ay == 0 else -3.9})]})

    # Summer: the sky, the sun in the corner, the sea along the foot and a ball on it.
    ball = [{'d': circle(0, 0, 4.6), 'fill': WHITE}, {'d': f'M0 -4.6A4.6 4.6 0 0 1 4.6 0H0Z', 'fill': ROSE}, {'d': f'M0 4.6A4.6 4.6 0 0 1 -4.6 0H0Z', 'fill': '#5fb3d8'}, {'d': circle(0, 0, 1.1), 'fill': SUN}]
    rays = ''.join(centred(*kit.on(0, 0, 8.4, a), 1.5, 1.5, .75) for a in range(0, 360, 45))
    out.append({'id': 'summer', 'label': 'Summer', 'hint': 'The sun in the corner, the sea along the foot and a beach ball',
                'inset': [6.5, 6.5, 11, 6.5], 'radius': 3.2, 'ground': SKY,
                'runs': [{'sides': 'b', 'at': 'inner', 'tile': 12, 'stretch': True, 'd': sea, 'fill': '#5fb3d8'}],
                'marks': [{'d': circle(0, 0, 5.4), 'fill': SUN, 'at': [1, 0], 'dx': -9, 'dy': 9}, {'d': rays, 'fill': SUN, 'at': [1, 0], 'dx': -9, 'dy': 9}]
                + [{**part, 'at': [.2, 1], 'dy': -8.4, 'rotate': 0} for part in ball]})

    # Halloween: night, bats along the top, pumpkins along the foot.
    bat = 'M0 -.6Q1.2 -2.6 2.2 -.8Q3.6 -2 5.6 -1.4Q4.6 -.4 4.8 1.2Q3.4 .2 2.4 1.4Q1.2 .4 0 1.8Q-1.2 .4 -2.4 1.4Q-3.4 .2 -4.8 1.2Q-4.6 -.4 -5.6 -1.4Q-3.6 -2 -2.2 -.8Q-1.2 -2.6 0 -.6Z'
    pumpkin = ellipse(-1.9, 0, 2.5, 2.9) + ellipse(1.9, 0, 2.5, 2.9) + ellipse(0, 0, 2.6, 3.1)
    out.append({'id': 'halloween', 'label': 'Halloween', 'hint': 'Bats along the top and pumpkins along the foot, at night',
                'inset': [9.5, 6.5, 10.5, 6.5], 'radius': 3.2, 'ground': '#3b2a4d',
                'motifs': [{'sides': 't', 'tile': 20, 'pad': 6, 'depth': 4.8, 'd': bat, 'fill': '#1d1429'},
                           {'sides': 'b', 'tile': 15, 'pad': 6, 'depth': 5, 'd': pumpkin, 'fill': '#f6913a'},
                           {'sides': 'b', 'tile': 15, 'pad': 6, 'depth': 8.4, 'd': centred(0, 0, 1.3, 1.9, .5), 'fill': '#58c28f'}],
                'marks': [{'d': circle(0, 0, 4.2), 'fill': BUTTER, 'at': [0, 0], 'dx': 8.6, 'dy': 4.9}, {'d': circle(1.5, -1.1, 3.5), 'fill': '#3b2a4d', 'at': [0, 0], 'dx': 8.6, 'dy': 4.9}]})

    # Easter: painted eggs round a butter card.
    egg_ = 'M0 -2.9C1.9 -2.9 2.6 -.4 2.6 .8A2.6 2.3 0 0 1 -2.6 .8C-2.6 -.4 -1.9 -2.9 0 -2.9Z'
    out.append({'id': 'easter', 'label': 'Easter', 'hint': 'Painted eggs all the way round',
                'inset': [7.6, 7.6, 7.6, 7.6], 'radius': 3.2, 'ground': '#fdf2c4',
                'motifs': [{'sides': 'tblr', 'tile': 20, 'pad': 8, 'depth': 3.8, 'shift': -.25, 'd': egg_, 'fill': ROSE},
                           {'sides': 'tblr', 'tile': 20, 'pad': 8, 'depth': 3.8, 'shift': -.25, 'd': centred(0, .3, 5, .8, .4), 'fill': WHITE},
                           {'sides': 'tblr', 'tile': 20, 'pad': 8, 'depth': 3.8, 'shift': .25, 'd': egg_, 'fill': '#5fb3d8'},
                           {'sides': 'tblr', 'tile': 20, 'pad': 8, 'depth': 3.8, 'shift': .25, 'd': circle(-.9, .6, .5) + circle(.9, .6, .5) + circle(0, -1.1, .5), 'fill': WHITE}]})

    # Christmas: fairy lights along the top, snow along the foot.
    snow = 'M-.2 -11.4H12.2V1.2Q9.1 -1.8 6 1.2T-.2 1.2Z'
    out.append({'id': 'christmas', 'label': 'Christmas', 'hint': 'Fairy lights along the top and snow along the foot',
                'inset': [11, 6.5, 10, 6.5], 'radius': 3.2, 'ground': '#1f6b52',
                'runs': [{'sides': 't', 'at': 'outer', 'tile': 14, 'stretch': True, 'd': 'M-.2 2.6Q7 5.6 14.2 2.6V3.4Q7 6.4 -.2 3.4Z', 'fill': '#0f3d2f'},
                         {'sides': 'b', 'at': 'inner', 'tile': 12, 'stretch': True, 'd': snow, 'fill': WHITE}],
                'motifs': [{'sides': 't', 'tile': 14, 'pad': 0, 'depth': 6.6, 'shift': -.25, 'd': 'M0 -2.2C1.5 -2.2 2 -.4 2 .6A2 1.9 0 0 1 -2 .6C-2 -.4 -1.5 -2.2 0 -2.2Z', 'fill': '#ea5a48'},
                           {'sides': 't', 'tile': 14, 'pad': 0, 'depth': 6.6, 'shift': .25, 'd': 'M0 -2.2C1.5 -2.2 2 -.4 2 .6A2 1.9 0 0 1 -2 .6C-2 -.4 -1.5 -2.2 0 -2.2Z', 'fill': SUN}]})
    return out


def cutouts():
    """Boards with a hole for a face (the owner, 12 November 2026: "and cutouts, like a frog costume at the pond could
    have a cutout for the face, think extremely playful"), as stand at a festival or a harbour front. Drawn with the
    stickers' kit (tools/cute_hand.py) in a square of 100 whose middle 72 is the photo's shorter side: the board covers
    the picture whatever its shape (the grounds run far past the square), the somebody stands in the middle and the
    hole is where their face would be. `window` is the hole's middle and half-sizes, for whoever wants to bring a face
    to it."""
    sys.path.insert(0, str(Path(__file__).resolve().parent))
    import cute_hand as h
    FAR = 'M-70 -70H170V170H-70Z'
    band = lambda y0, y1: f'M-70 {y0}H170V{y1}H-70Z'
    out = []

    def add(key, label, hint, window, draw):
        g = h.Drawing()
        draw(g)
        cx, cy, rx, ry = window
        shapes = [item for item in g.paths() if 'cut' not in item]
        out.append({'id': key, 'label': label, 'hint': hint, 'cutout': {'window': window, 'hole': ellipse(cx, cy, rx, ry), 'shapes': shapes}})

    def frog(g):
        g.fill(FAR, '#c3e4f3').fill(band(57, 170), '#7cc4dd').fill(band(54, 58.5), '#8fd3a0')
        h.puff(g, 16, 22, 1.5, h.WHITE)
        h.puff(g, 88, 14, 1.1, h.WHITE)
        g.line('M-40 70H-12M108 66H140M-30 92H4M100 88H128M40 96H60', '#bfe6f2', 1.6)
        for x, y, r in ((6, 74, 9), (97, 78, 10), (-22, 86, 8), (124, 70, 8)):                    # lily pads, a flower on two
            g.fill(f'M{x} {y}L{x + r} {y - r * .28}A{r} {r * .46} 0 1 1 {x + r * .7} {y - r * .42}Z', '#58c28f')
        g.fill(circle(8, 71.4, 2.4), '#f9c2ce').fill(circle(8, 71.4, 1), h.SUN).fill(circle(95, 75.4, 2.4), '#f9c2ce').fill(circle(95, 75.4, 1), h.SUN)
        for x, top in ((-6, 30), (0, 38), (106, 34), (112, 26)):                                 # reeds
            g.line(f'M{x} 60V{top}', '#16815e', 1.6).fill(rrect(x - 1.5, top - 9, 3, 10, 1.5), h.BARK)
        g.fill(ellipse(34, 82.6, 9.6, 3.9) + ellipse(66, 82.6, 9.6, 3.9), h.FROG_DARK)             # somebody in a frog costume
        g.fill(ellipse(50, 70, 20, 15), h.FROG).fill(ellipse(50, 73, 12.5, 9.6), h.FROG_BELLY)
        g.line('M33 62L27 75M67 62L73 75', h.FROG_DARK, 6.2).fill(circle(27, 75, 4.3) + circle(73, 75, 4.3), h.FROG_DARK)
        g.fill(circle(36, 22.6, 9) + circle(64, 22.6, 9) + ellipse(50, 42, 25, 23), h.FROG)
        g.fill(circle(36, 21.6, 5.9) + circle(64, 21.6, 5.9), h.WHITE).fill(circle(37, 22.4, 3.2) + circle(63, 22.4, 3.2), h.INK).fill(circle(38, 21.4, .95) + circle(64, 21.4, .95), h.WHITE)
        g.fill(ellipse(29.6, 50, 3, 1.9) + ellipse(70.4, 50, 3, 1.9), h.BLUSH)
        g.fill(ellipse(50, 43.6, 17.6, 19.2), h.FROG_DARK)
    add('frog-pond', 'Frog', 'A frog at the pond, your face in its hood', [50, 43.6, 16, 17.6], frog)

    def sunflower(g):
        g.fill(FAR, '#c3e4f3').fill(band(78, 170), '#8fd3a0').fill(band(84, 170), '#58c28f')
        h.puff(g, 14, 18, 1.4, h.WHITE)
        h.puff(g, 92, 30, 1.0, h.WHITE)
        g.line('M50 64V120', '#16815e', 5)
        g.fill('M50 84Q34 72 26 80Q36 92 50 88Z', '#58c28f').fill('M50 78Q66 66 74 74Q64 86 50 82Z', '#58c28f')
        g.fill(''.join(h.blob(*h.on(50, 42, 23, a), 5.6, 9.6, a + 90) for a in range(0, 360, 24)), h.SUN)
        g.fill(''.join(h.blob(*h.on(50, 42, 21, a), 4.6, 8.4, a + 90) for a in range(12, 372, 24)), h.AMBER)
        g.fill(circle(50, 42, 19.6), h.BARK)
        with g.at(86, 54, 1.0, -12):                                                             # a bee
            g.fill(ellipse(-2, -3.4, 2.6, 2) + ellipse(2, -3.6, 2.6, 2), h.WHITE).fill(ellipse(0, 0, 4.4, 3), h.SUN)
            g.line('M-1.2 -2.6V2.6M1.4 -2.6V2.6', h.INK, 1.1)
        g.line('M76 62Q80 60 82 56', h.INK, .7)
    add('sunflower', 'Sunflower', 'A sunflower with your face in the middle', [50, 42, 16.6, 16.6], sunflower)

    def astronaut(g):
        g.fill(FAR, '#27325c')
        h.shines(g, [(12, 18, 4), (88, 12, 3), (96, 58, 2.6), (4, 62, 2.4), (-18, 34, 3), (120, 30, 3.4), (30, -6, 2.6), (70, 104, 2.6)], h.BUTTER)
        g.fill(circle(-2, 96, 26), h.BUTTER).fill(circle(-8, 86, 4) + circle(6, 98, 5.4) + circle(-12, 104, 3), '#eccf7e')
        g.fill(circle(112, 92, 9), '#f49a7c').line('M98 95Q112 86 126 91', '#f9c0ad', 1.6)
        suit, shade = '#eef2f6', '#cfd9e2'
        g.line('M32 68L20 82M68 68L80 82', suit, 9).fill(circle(20, 82, 5.4) + circle(80, 82, 5.4), shade)
        g.fill(rrect(30, 60, 40, 34, 13), suit).fill(rrect(38, 86, 9, 12, 4) + rrect(53, 86, 9, 12, 4), shade)
        g.fill(rrect(40, 67, 20, 12, 3.4), shade).fill(circle(45, 73, 2.2), h.RED).fill(circle(51, 73, 2.2), h.SUN).fill(rrect(54.6, 71.6, 3.6, 2.8, 1), h.SEA)
        g.line('M68 22L74 12', shade, 1.8).fill(circle(74.6, 11, 2.6), h.RED)
        g.fill(circle(50, 42, 25), suit).fill(circle(50, 42, 20.4), h.SEA)
    add('astronaut', 'Astronaut', 'An astronaut, your face in the helmet', [50, 42, 17.6, 17.6], astronaut)

    def daruma(g):
        g.fill(FAR, '#fdf2c4')
        for n, (x, y) in enumerate(((8, 14), (92, 20), (-10, 50), (110, 46), (14, 88), (90, 90), (50, -2), (-26, 84), (128, 80), (30, 106), (72, 104))):
            g.fill(circle(x, y, 2.2), (h.ROSE, h.SEA, h.SUN, h.LEAF)[n % 4])
        g.fill(h.egg(50, 52, 62, 68, .1), h.RED)
        g.line('M30 74Q50 84 70 74M36 82Q50 89 64 82', h.SUN, 2.4)
        g.line('M27 26Q36 18 46 25M54 25Q64 18 73 26', h.INK, 4.4)                                 # its brows, over your eyes
        g.line('M32 62Q40 68 46 63M54 63Q60 68 68 62', h.INK, 3)
        g.fill(ellipse(50, 44, 21, 17.6), '#fbe9d7')
    add('daruma', 'Daruma', 'A daruma doll with your face', [50, 44, 18.6, 15.2], daruma)

    def snowman(g):
        snow, shade = '#f6fafc', '#dfeaf0'
        g.fill(FAR, '#9fd0e8').fill(band(84, 170), snow)
        g.fill(''.join(circle(x, 85, 12) for x in range(-66, 170, 20)), snow)
        g.fill(''.join(circle(x, y, 1.4) for x, y in ((8, 12), (24, 40), (90, 18), (78, 44), (-14, 30), (112, 36), (96, 66), (4, 66), (40, 2), (66, -4), (-30, 60), (130, 58))), h.WHITE)
        g.line('M30 70L14 60M14 60L10 54M14 60L8 62M70 70L86 60M86 60L90 54M86 60L92 62', h.BARK, 2.2)
        g.fill(circle(50, 76, 19), snow).fill(circle(50, 70, 1.9) + circle(50, 77, 1.9) + circle(50, 84, 1.9), h.INK)
        g.fill(circle(50, 42, 23), snow)
        g.fill(rrect(31, 59, 38, 7.4, 3.7), h.RED).fill(rrect(58, 62, 7, 15, 3), h.RED)
        g.fill(rrect(30, 19.6, 40, 5.4, 2.7), h.INK).fill(rrect(37, 4, 26, 17, 3.4), h.INK).fill(rrect(37, 15.4, 26, 4.2, 0), h.RED)
        g.fill(ellipse(50, 44, 18.2, 18.2), shade)
    add('snowman', 'Snowman', 'A snowman with your face', [50, 44, 16.6, 16.6], snowman)
    return out


def main():
    data = {'unit': 'a hundredth of the photo’s shorter side', 'frames': frames(), 'cutouts': cutouts()}
    OUT.write_text(json.dumps(data, indent=1, ensure_ascii=False) + '\n')
    print(f"{len(data['frames'])} frames and {len(data['cutouts'])} cutouts → {OUT.relative_to(ROOT)} ({OUT.stat().st_size} bytes)")


if __name__ == '__main__':
    main()
