#!/usr/bin/env python3
"""
The pictures of the Chisum's cabins: so far one, the calendar on the wall of the chief engineer's day room.

    python3 ferry/blender/cabin_pictures.py     writes ferry/data/chisum-cabins.webp (the sheet) and blender/cabin_pictures.json
                                                (where each picture lies on it: name → u0, v0, u1, v1, v up)

The owner, 12 November 2026: "Use I create api to make a calendar in the chief engineers office with cute manga ladies".

A second sheet beside her own (atlas.py, which cannot be drawn again on this Mac: HANDOVER). The calendar's page is made
here: the month's picture above, the month below. **The picture is not drawn here**: it was made on 12 November 2026 with
an image service (ElevenLabs' image generation, model gpt-image-2.5-sunburst) from a description, three ship's engineers in
boiler suits in an engine control room, in a manga's manner, and is kept as blender/assets/calendar/2026-11-engineers.webp.
The month, its days and its words are drawn here from the calendar itself.
Needs Pillow; no Blender.
"""
import calendar
import json
import os

from PIL import Image, ImageDraw, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__))
YEAR, MONTH, TODAY = 2026, 11, 12                # the month it hangs open at, and the day that is ringed
W, H = 1260, 1800                                 # the page: 0.42 by 0.60 m at 3 px a millimetre
PAPER, INK, FAINT, RED, BLUE = (251, 249, 242), (30, 34, 38), (120, 128, 134), (196, 52, 40), (0, 23, 193)


def font(size, bold=True):
    import matplotlib
    d = os.path.join(os.path.dirname(matplotlib.__file__), 'mpl-data', 'fonts', 'ttf')
    return ImageFont.truetype(os.path.join(d, 'DejaVuSans-Bold.ttf' if bold else 'DejaVuSans.ttf'), size)


def page():
    im = Image.new('RGB', (W, H), PAPER)
    dr = ImageDraw.Draw(im)
    # the picture: the upper leaf, with a white edge
    pic = Image.open(os.path.join(HERE, 'assets', 'calendar', f'{YEAR}-{MONTH:02d}-engineers.webp')).convert('RGB')
    box = (60, 60, W - 60, 60 + int((W - 120) * pic.height / pic.width))
    im.paste(pic.resize((box[2] - box[0], box[3] - box[1]), Image.LANCZOS), box[:2])
    dr.rectangle(box, outline=INK, width=3)
    dr.text((60, box[3] + 18), 'THE ENGINE ROOM WATCH', font=font(30), fill=INK)
    dr.text((W - 60, box[3] + 22), 'JOHANSSON LINE · M/V CHISUM', font=font(24, False), fill=FAINT, anchor='ra')
    # the binding's line across the middle (the wire itself is built: cabin_ce.py)
    dr.line((0, H // 2, W, H // 2), fill=(214, 210, 200), width=4)
    # the month: its name, the days of the week from Monday, its days; Sundays in red; today ringed
    top = H // 2 + 50
    dr.text((60, top), calendar.month_name[MONTH].upper(), font=font(92), fill=INK)
    dr.text((W - 60, top + 18), str(YEAR), font=font(72, False), fill=BLUE, anchor='ra')
    grid_top, cell_w = top + 150, (W - 120) / 7
    for k, name in enumerate(('MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN')):
        dr.text((60 + cell_w * (k + 0.5), grid_top), name, font=font(30), fill=RED if k == 6 else FAINT, anchor='ma')
    dr.line((60, grid_top + 50, W - 60, grid_top + 50), fill=INK, width=3)
    weeks = calendar.Calendar(firstweekday=0).monthdayscalendar(YEAR, MONTH)
    cell_h = (H - 90 - (grid_top + 70)) / len(weeks)
    for r, week in enumerate(weeks):
        for k, day in enumerate(week):
            if not day:
                continue
            cx, cy = 60 + cell_w * (k + 0.5), grid_top + 70 + cell_h * (r + 0.5)
            if day == TODAY:
                dr.ellipse((cx - 52, cy - 52, cx + 52, cy + 52), outline=RED, width=7)
            dr.text((cx, cy), str(day), font=font(60), fill=RED if k == 6 else INK, anchor='mm')
        if r:
            dr.line((60, grid_top + 70 + cell_h * r, W - 60, grid_top + 70 + cell_h * r), fill=(224, 220, 210), width=2)
    dr.text((60, H - 62), 'Monthly: grease, sample, sign.', font=font(26, False), fill=FAINT)
    return im


def main():
    im = page()
    out = os.path.join(HERE, '..', 'data', 'chisum-cabins.webp')
    im.save(out, 'WEBP', quality=88, method=6)
    json.dump(dict(file='chisum-cabins.webp', size=[W, H], tiles=dict(calendar=[0.0, 0.0, 1.0, 1.0]),
                   note=f'the calendar of the chief engineer\'s day room, open at {calendar.month_name[MONTH]} {YEAR}'),
              open(os.path.join(HERE, 'cabin_pictures.json'), 'w'), indent=1)
    print(f'{os.path.relpath(out)}: {W} x {H}, {os.path.getsize(out)} bytes; blender/cabin_pictures.json')


if __name__ == '__main__':
    main()
