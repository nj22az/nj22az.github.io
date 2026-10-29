#!/usr/bin/env python3
"""Draw Pocket Camera's original Minato Memory card back in pixel art."""
from pathlib import Path
from PIL import Image, ImageDraw

OUT = Path(__file__).resolve().parents[1] / 'camera/assets/memory-card-back.png'
ink = '#244842'
sea = '#6fa99b'
cream = '#f8eccd'
sand = '#dbbd7d'
coral = '#d77966'
white = '#fff8df'
im = Image.new('RGB', (80,100), ink)
d = ImageDraw.Draw(im)
# Offset double border reads crisply at all sizes; the green background unifies cards.
d.rectangle((3,3,76,96), fill=cream)
d.rectangle((6,6,73,93), fill=sea)
d.rectangle((9,9,70,90), outline=ink, width=2)
d.rectangle((12,12,67,87), outline=cream, width=1)
# A stamp-like sun above a tiny island and its harbour, original to Minato.
d.rectangle((35,23,44,32), fill=sand)
d.rectangle((37,21,42,34), fill=sand)
d.rectangle((31,19,33,21), fill=cream)
d.rectangle((47,16,49,18), fill=cream)
d.rectangle((23,44,58,62), fill=cream)
d.rectangle((28,38,53,65), fill=cream)
d.rectangle((34,35,47,65), fill=cream)
d.polygon([(18,63),(26,59),(54,59),(62,63),(59,67),(21,67)],fill=sand)
# Lighthouse and a small roof, readable even on a small game board.
d.rectangle((27,43,33,60),fill=ink)
d.rectangle((28,44,32,59),fill=white)
d.rectangle((28,48,32,50),fill=coral)
d.rectangle((27,40,33,43),fill=ink)
d.rectangle((29,38,31,40),fill=coral)
d.polygon([(40,51),(48,44),(56,51)],fill=ink)
d.rectangle((42,51,54,60),fill=coral)
d.rectangle((47,54,50,60),fill=ink)
for x,y,w in [(18,71,13),(36,72,18),(57,70,7),(24,77,18),(48,78,12)]:
 d.rectangle((x,y,x+w,y+1),fill=cream)
# Corner ticks, no third-party logos or hardware shapes.
for x,y in [(16,17),(62,17),(16,82),(62,82)]:
 d.rectangle((x-1,y,x+1,y),fill=ink)
 d.rectangle((x,y-1,x,y+1),fill=ink)
OUT.parent.mkdir(parents=True,exist_ok=True)
im.save(OUT,optimize=True)
