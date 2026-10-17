#!/usr/bin/env python3
"""Capture actual native GLES2 frames, then make the inspection sheet. Dev dependency: Pillow."""
import os
import subprocess
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'screenshots'
OUT.mkdir(exist_ok=True)
env = dict(os.environ, SDL_VIDEODRIVER='offscreen', SDL_AUDIODRIVER='dummy',
           SDL_VIDEO_GL_DRIVER='libGL.so.1', MESA_GLES_VERSION_OVERRIDE='2.0')
for pose in ['title', 'arena', 'jab', 'kick', 'guard', 'victory', 'roundhouse', 'cross']:
    ppm = ROOT / 'build' / (pose + '.ppm')
    subprocess.run([str(ROOT/'build/ferry-deck-fighters'), '--gles', '--pose', pose,
                    '--frames', '1', '--capture', str(ppm)], env=env, check=True)
    image = Image.open(ppm).convert('RGB')
    assert len(image.getcolors(720*720) or []) > 15, f'Invalid or blank frame: {pose}'
    image.save(OUT / (pose + '.png'))
poses = ['arena', 'jab', 'roundhouse', 'kick']
sheet = Image.new('RGB', (1488, 1588), '#173640')
draw = ImageDraw.Draw(sheet)
try:
    font = ImageFont.truetype('DejaVuSans.ttf', 22)
except OSError:
    font = ImageFont.load_default(size=22)
labels = ['01  CAR DECK - THAO / THUAN', '02  THAO - JAB', '03  THAO - ROUNDHOUSE', '04  THUAN - FRONT KICK']
for i, pose in enumerate(poses):
    x, y = 16 + i%2*736, 58 + i//2*760
    sheet.paste(Image.open(OUT/(pose+'.png')), (x,y))
    draw.text((x,y-32), labels[i], font=font, fill='#f4ce73')
draw.text((16,1548), 'NATIVE PROTOTYPE - Actual GLES2 captures - CubeXX hardware test pending', font=font, fill='#f9f0d6')
sheet.save(OUT/'Ferry_Deck_Fighters_Inspection.png')
print('Verified eight nonblank native captures and inspection sheet.')
